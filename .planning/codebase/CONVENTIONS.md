# Coding Conventions

**Analysis Date:** 2026-01-10

## Naming Patterns

**Files:**
- PascalCase.jsx for React components (DeviceSelector.jsx, BackupWizard.jsx)
- camelCase.js for non-component JavaScript (koboDatabase.js, fileSystem.js)
- usePrefix.js for custom hooks (useBackup.js, useKoboDevice.js)

**Functions:**
- camelCase for all functions (getBooks, parseResults, handleNavigate)
- on* prefix for prop callbacks (onComplete, onNavigate)
- handle* prefix for event handlers (handleClick, handleNavigate)

**Variables:**
- camelCase for variables (device, currentPage, arrayBuffer)
- UPPER_SNAKE_CASE for constants (ERROR_CODES, DATABASE_URL pattern not observed but conventional)
- No underscore prefix for private members

**Types:**
- Not using TypeScript (JavaScript-only codebase)
- JSDoc comments for type hints in some utilities

## Code Style

**Formatting:**
- Prettier 3.3.2 configured in `package.json` devDependencies
- Config file: Not found in root (using Prettier defaults)
- Assumed: 2 space indentation, single quotes, semicolons omitted (React/Vite default)

**Linting:**
- ESLint 8.57.0 with React plugins
- Plugins: eslint-plugin-react 7.34.2, eslint-plugin-react-hooks 4.6.2, eslint-plugin-react-refresh 0.4.7
- Config: Inline in package.json: `"lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"`
- Run: `npm run lint`

## Import Organization

**Order:**
1. React imports (React, ReactDOM, hooks)
2. External packages (zustand, sql.js, jszip, browser-fs-access)
3. Internal modules (hooks, stores, components, utils)
4. Relative imports (./Component, ../utils)
5. CSS imports (./styles/globals.css)

**Grouping:**
- Blank lines between groups visible in `src/main.jsx`, `src/App.jsx`
- No specific sorting within groups observed

**Path Aliases:**
- Not configured (using relative imports)
- All imports use relative paths (./hooks, ../components, etc.)

## Error Handling

**Patterns:**
- Custom error classes in `src/utils/errors.js` (DatabaseError, FileSystemError, ValidationError)
- Errors thrown in utilities, caught in components/hooks
- ErrorBoundary component at app root catches React errors

**Error Types:**
- DatabaseError for SQLite parsing failures
- FileSystemError for file access issues
- ValidationError for data validation failures
- Custom ERROR_CODES object for categorization

## Logging

**Framework:**
- console.log, console.error (no structured logging library)

**Patterns:**
- Console logging for errors in try/catch blocks
- No production logging observed (client-side only, no telemetry)

## Comments

**When to Comment:**
- JSDoc-style comments on utility functions (see `src/utils/koboDatabase.js`)
- Inline comments for non-obvious logic
- File-level comments explaining purpose (see `src/stores/koboStore.js` header comment)

**JSDoc/TSDoc:**
- Used in `src/utils/koboDatabase.js` for class and method documentation
- Includes @param, @returns, @private tags
- Not consistent across all files (missing in some utilities)

**TODO Comments:**
- Not observed in scanned files (may exist in unscanned files)

## Function Design

**Size:**
- Varied - some large functions in utilities (parseResults, getBooks queries)
- React components generally small (single responsibility)

**Parameters:**
- Props passed as single object in React components
- Utility functions use positional parameters (limited to 2-3)
- Destructuring used in React component props

**Return Values:**
- Explicit returns in utilities
- React components return JSX
- Hooks return arrays or objects with state/handlers

## Module Design

**Exports:**
- Named exports for utilities (`export { KoboDatabase }`)
- Default exports for React components (`export default App`)
- Named export for Zustand store (`export const useKoboStore`)

**Barrel Files:**
- Not observed (no index.js re-export files)
- Direct imports from each file

---

*Convention analysis: 2026-01-10*
*Update when patterns change*
