# Database Connection Discovery

**Date:** 2026-01-10
**Phase:** 01-database-connection-fix

## Problem Summary

Users reported a "file not found" error when attempting to scan their Kobo device. The error was assumed to be a File System Access API issue preventing the app from locating `KoboReader.sqlite` in the `.kobo/` hidden directory.

## Investigation

Created diagnostic utilities to:
1. Log complete directory structure (depth=2)
2. Search for KoboReader.sqlite across entire directory tree
3. Test path navigation step-by-step (`.kobo/KoboReader.sqlite`)
4. Monitor the original getFileByPath call

Tested with real Kobo device connected via USB.

## Findings

### File System Access API: ✅ WORKING CORRECTLY

**Directory Listing:**
- `.kobo/` directory was successfully detected and accessed
- Contents visible: Kobo/, certificates/, kepub/, dict/, custom-dict/, assets/, guide/, audiobook/, dropbox/, **KoboReader.sqlite**, and other files

**File Search:**
- ✅ Found `KoboReader.sqlite` at path: `.kobo/KoboReader.sqlite`
- File size: 84,476,928 bytes (~84MB)
- File type: unknown (expected for SQLite)
- Last modified: 1768061246000

**Path Navigation:**
- ✅ Step 1: Navigated to directory `.kobo` - SUCCESS
- ✅ Step 2: Located file `KoboReader.sqlite` - SUCCESS
- Result: `{ success: true, error: null, stoppedAt: null }`

**Conclusion:** The File System Access API has NO issues. The file is found, accessed, and read successfully.

### Actual Error: ❌ DATABASE QUERY FAILURE

After successfully accessing the file, the error occurs at:
```
DatabaseError: Failed to fetch books from database
    at KoboDatabase.getBooks (koboDatabase.js:119:13)
```

This is line 119 in the `catch` block of `getBooks()`, meaning the SQL query itself is failing.

## Root Cause

**The original bug report was misleading.** This is NOT a "file not found" error. The actual problem is:

**SQL query failure in `KoboDatabase.getBooks()` method.**

The query (koboDatabase.js lines 78-103) attempts:
```sql
SELECT ContentID, Title, Attribution, Description, Publisher, ...
FROM content
WHERE ContentType = 6
  AND IsDownloaded = 'true'
  AND BookTitle IS NULL
  AND ContentPath LIKE 'file://%'
ORDER BY DateLastRead DESC
```

### Possible causes:

1. **Query is too restrictive for this Kobo database version**
   - WHERE conditions may not match any rows
   - `ContentType = 6` might be incorrect for this device's schema
   - `BookTitle IS NULL` might exclude all books

2. **SQL syntax error for this SQLite version**
   - The query uses features not supported by sql.js WASM
   - Column names may have changed in newer Kobo firmware

3. **Database schema mismatch**
   - Kobo database schema may have evolved
   - Expected columns might not exist or have different names

4. **SQL execution error in sql.js**
   - The WASM SQLite implementation may have restrictions
   - Need to check the actual error message from originalError

## Recommended Fix

**CRITICAL: The phase objective needs to change.** This is not a File System Access API fix - it's a database query fix.

### Step 1: Capture actual SQL error (IMMEDIATE)

Modify koboDatabase.js line 118-124 to log the actual error:
```javascript
} catch (error) {
  console.error('[DB ERROR] Query failed:', error);
  console.error('[DB ERROR] Error message:', error.message);
  console.error('[DB ERROR] Error stack:', error.stack);
  throw new DatabaseError(
    'Failed to fetch books from database',
    ERROR_CODES.DB_QUERY_FAILED,
    { originalError: error }
  );
}
```

### Step 2: Test query directly (DIAGNOSTIC)

Add diagnostic code before line 105 in getBooks():
```javascript
try {
  // Test 1: Check if content table exists
  const tablesQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name='content'`;
  const tablesResult = this.db.exec(tablesQuery);
  console.log('[DB DEBUG] Content table exists:', tablesResult);

  // Test 2: Get table schema
  const schemaQuery = `PRAGMA table_info(content)`;
  const schemaResult = this.db.exec(schemaQuery);
  console.log('[DB DEBUG] Content table schema:', this.parseResults(schemaResult));

  // Test 3: Count total rows in content
  const countQuery = `SELECT COUNT(*) as total FROM content`;
  const countResult = this.db.exec(countQuery);
  console.log('[DB DEBUG] Total content rows:', this.parseResults(countResult));

  // Test 4: Try simple query without WHERE clause
  const simpleQuery = `SELECT ContentID, Title, ContentType FROM content LIMIT 5`;
  const simpleResult = this.db.exec(simpleQuery);
  console.log('[DB DEBUG] Sample content:', this.parseResults(simpleResult));

  // Original query follows...
} catch (error) {
  // ... existing error handling
}
```

### Step 3: Fix the query based on diagnostics

Once we see the actual error and schema:
- Remove or adjust overly restrictive WHERE conditions
- Update column names if schema changed
- Simplify query if sql.js has limitations
- Add fallback queries for different Kobo database versions

### Step 4: Test with multiple Kobo devices

Different Kobo firmware versions may have different database schemas. Need to handle variations.

## Testing Strategy

1. **Verify diagnostic output** - Run modified getBooks() and capture actual SQL error
2. **Examine database schema** - Understand what columns/tables actually exist
3. **Test simplified queries** - Start with `SELECT * FROM content LIMIT 1` and build up
4. **Identify correct WHERE conditions** - Find the right way to filter for sideloaded books
5. **Verify fix** - Ensure books are actually returned and displayed

## Next Steps

**DO NOT proceed to 01-02-PLAN.md as originally designed.** That plan assumes a File System Access API fix.

Instead:
1. Create new plan: "01-02-PLAN.md: Database Query Fix"
2. Focus on fixing the SQL query in `getBooks()`
3. Add proper error diagnostics to identify exact SQL failure
4. Test with real Kobo database to verify fix

## Files Requiring Changes

- `src/utils/koboDatabase.js` - Fix getBooks() query (lines 78-125)
- Possibly other methods: getAnnotations(), getReadingStats(), etc. (if they have similar issues)

## Important Notes

- File System Access API works perfectly - NO changes needed to `fileSystem.js` or `useKoboDevice.js`
- The "file not found" user report was actually a database query error with misleading messaging
- Future: Improve error messages to distinguish between file access errors and database errors
