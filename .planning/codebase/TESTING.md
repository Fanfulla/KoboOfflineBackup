# Testing Patterns

**Analysis Date:** 2026-01-10

## Test Framework

**Runner:**
- Vitest 1.6.0 configured in `package.json`
- Config: Not found (vitest.config.js or vitest.config.ts not present)

**Assertion Library:**
- Vitest built-in expect (compatible with Jest)
- @testing-library/jest-dom 6.4.6 for DOM assertions

**Run Commands:**
```bash
npm test              # Run all tests (vitest)
```

## Test File Organization

**Location:**
- No test files detected in codebase
- Testing library configured but tests not yet written

**Naming:**
- Expected pattern: *.test.js or *.spec.js (based on Vitest defaults)
- Expected location: Co-located with source files or __tests__/ directory

**Structure:**
```
Expected pattern (not yet implemented):
src/
  utils/
    koboDatabase.js
    koboDatabase.test.js     # <- Test files here
  hooks/
    useBackup.js
    useBackup.test.js         # <- Or here
```

## Test Structure

**Suite Organization:**
Not yet implemented. Expected pattern based on Vitest/React Testing Library:

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  })

  it('should render correctly', () => {
    // Test
  })
})
```

## Mocking

**Framework:**
- Vitest built-in mocking (vi) available
- Not yet used (no tests written)

**Expected Patterns:**
- Mock File System Access API (browser-fs-access)
- Mock sql.js WebAssembly module
- Mock file operations (FileReader, Blob, etc.)

## Fixtures and Factories

**Test Data:**
- No fixtures detected
- Will need sample SQLite database files for testing KoboDatabase parser
- Will need sample backup ZIP files for restore testing

## Coverage

**Requirements:**
- No coverage requirements configured
- No coverage thresholds in package.json

**Configuration:**
- Vitest coverage available via `--coverage` flag
- Not configured in package.json scripts

**View Coverage:**
```bash
npm test -- --coverage   # Run tests with coverage
```

## Test Types

**Unit Tests:**
- Not yet implemented
- Needed for: koboDatabase.js, backup.js, restore.js, validation.js, formatters.js

**Integration Tests:**
- Not yet implemented
- Needed for: Full backup flow, full restore flow

**E2E Tests:**
- Not configured
- File System Access API difficult to test in automated environment

## Common Patterns

**Expected patterns based on configured libraries:**

**React Component Testing:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react'

it('should handle click', () => {
  render(<Button onClick={mockFn} />)
  fireEvent.click(screen.getByRole('button'))
  expect(mockFn).toHaveBeenCalled()
})
```

**Async Testing:**
```javascript
it('should load data', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})
```

**Snapshot Testing:**
- @testing-library/react available but snapshots not recommended for this project type

---

*Testing analysis: 2026-01-10*
*Update when test patterns change*

**CRITICAL NOTE:** Test infrastructure is configured but NO TESTS EXIST YET. This is a major gap that should be addressed.
