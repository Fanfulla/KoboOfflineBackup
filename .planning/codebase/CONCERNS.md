# Codebase Concerns

**Analysis Date:** 2026-01-10

## Tech Debt

**Missing test coverage:**
- Issue: Test framework configured (Vitest, Testing Library) but zero tests written
- Files affected: All source files (`src/**/*.js`, `src/**/*.jsx`)
- Why: Rapid development prioritizing features over tests
- Impact: No confidence in refactoring, bugs may slip through, difficult to maintain
- Fix approach: Start with critical path tests (KoboDatabase parser, backup/restore flows), then add component tests

## Known Bugs

**None documented in code:**
- No TODO, FIXME, or HACK comments found in scanned files
- May exist in unscanned files or be undocumented

## Security Considerations

**Content Security Policy disabled in development:**
- Risk: CSP commented out in `index.html` lines 8-18
- File: `index.html`
- Current mitigation: Comment says "enable in production build"
- Recommendations: Ensure build process uncomments CSP for production, or use HTTP headers instead

**sql.js WebAssembly security:**
- Risk: Loading SQLite WASM from local files requires relaxed COOP/COEP headers
- Files: `vite.config.js` (lines 25-29 set headers), `index.html` (CSP disabled)
- Current mitigation: Headers set correctly for dev server
- Recommendations: Verify production hosting supports these headers (Vercel/Netlify handle automatically)

**File System Access API risks:**
- Risk: Direct access to user's file system if permissions granted
- Files: `src/utils/fileSystem.js`, `src/hooks/useFileSystem.js`
- Current mitigation: Browser permission prompts, validation in `src/utils/validation.js` (assumed)
- Recommendations: Add file type validation, path validation to prevent writes outside Kobo directory

## Performance Bottlenecks

**sql.js WebAssembly load time:**
- Problem: Initial load of sql-wasm.wasm (large file ~800KB)
- File: `public/sql-wasm.wasm` loaded by `src/utils/koboDatabase.js`
- Measurement: Not measured (no performance monitoring)
- Cause: WebAssembly binary size
- Improvement path: Already chunked separately in `vite.config.js` (line 13), consider lazy loading only when needed

**Large Kobo databases:**
- Problem: Parsing large SQLite files (1000+ books) may block UI
- File: `src/utils/koboDatabase.js` - synchronous parsing
- Measurement: Not measured
- Cause: sql.js runs synchronously, no Web Worker usage
- Improvement path: Move database parsing to Web Worker for non-blocking operation

## Fragile Areas

**File System Access API browser support:**
- File: `src/hooks/useFeatureDetection.js` - checks browser support
- Why fragile: API only supported in Chromium browsers (Chrome 86+, Edge 86+, Opera 72+)
- Common failures: Users on Firefox, Safari see unsupported browser error
- Safe modification: Keep feature detection, consider fallback to file upload input for unsupported browsers
- Test coverage: None

**sql.js initialization:**
- Files: `src/utils/koboDatabase.js` (lines 26-44)
- Why fragile: Dynamic import, WASM loading, specific locateFile path required
- Common failures: WASM not found (incorrect path), CORS issues, module loading errors
- Safe modification: Test thoroughly after any changes to import or paths
- Test coverage: None

## Scaling Limits

**LocalStorage size limits:**
- Current capacity: 5-10MB typical browser limit
- File: `src/stores/koboStore.js` - stores last 20 backups metadata
- Limit: ~5000 backups before hitting LocalStorage limits (unlikely given 20-item limit)
- Symptoms at limit: Zustand persist fails silently, data not saved
- Scaling path: Already limited to 20 backups (line 49), sufficient for use case

**Browser memory limits:**
- Current capacity: Depends on user's device RAM
- Problem: Loading large backup ZIPs (1GB+) into memory may crash tab
- File: `src/utils/backup.js`, `src/utils/restore.js` - in-memory ZIP operations
- Symptoms at limit: Tab crash, browser freeze
- Scaling path: Stream ZIP operations instead of loading entire file into memory

## Dependencies at Risk

**sql.js maintenance:**
- Risk: sql.js 1.10.3 last updated 2023 (check current status)
- Impact: Core functionality (database parsing) breaks if unmaintained
- Migration plan: No alternative for browser-based SQLite parsing

**File System Access API stability:**
- Risk: API still relatively new, may have breaking changes
- Impact: Core functionality (device access) breaks
- Migration plan: browser-fs-access polyfill provides some protection

## Missing Critical Features

**Error recovery:**
- Problem: No retry mechanism for failed file operations
- Files: `src/utils/fileSystem.js`, `src/hooks/useBackup.js`, `src/hooks/useRestore.js`
- Current workaround: Users must restart entire wizard flow
- Blocks: Resuming interrupted backups/restores
- Implementation complexity: Medium (need state persistence and resume logic)

**Backup verification:**
- Problem: No validation that backup ZIP contents are correct
- Files: `src/utils/backup.js` - creates ZIP without verification
- Current workaround: Users discover issues only when restoring
- Blocks: Confidence in backup integrity
- Implementation complexity: Low (add ZIP integrity check, file count validation)

**Progress persistence:**
- Problem: Refresh during backup/restore loses all progress
- Files: All wizard components lose state on unmount
- Current workaround: Users must start over
- Blocks: Recovery from browser crashes or accidental refreshes
- Implementation complexity: Medium (persist wizard state to localStorage)

## Test Coverage Gaps

**All code:**
- What's not tested: Everything (no tests exist)
- Risk: Bugs in critical paths (database parsing, backup creation, restore)
- Priority: High
- Difficulty to test: Medium (need to mock File System Access API, sample SQLite files)

**Critical paths needing tests:**
1. `src/utils/koboDatabase.js` - SQLite parsing logic
2. `src/utils/backup.js` - ZIP creation and file selection
3. `src/utils/restore.js` - ZIP extraction and file writing
4. `src/hooks/useKoboDevice.js` - Device detection and scanning
5. `src/stores/koboStore.js` - State management and persistence

---

*Concerns audit: 2026-01-10*
*Update as issues are fixed or new ones discovered*
