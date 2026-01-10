# Architecture

**Analysis Date:** 2026-01-10

## Pattern Overview

**Overall:** Client-side Single Page Application (SPA) with Wizard-based UI

**Key Characteristics:**
- 100% browser-based (no backend server)
- Local data processing only (privacy-first)
- Wizard-driven user flows for backup/restore operations
- Direct file system access via File System Access API
- WebAssembly-based SQLite parsing

## Layers

**UI Layer (Components):**
- Purpose: React components for user interface
- Contains: Pages, wizard steps, common UI components, layout components
- Location: `src/components/**/*.jsx`, `src/pages/*.jsx`
- Depends on: Hooks layer, Store layer, Utilities
- Used by: App root (`src/App.jsx`)

**State Management Layer:**
- Purpose: Global application state
- Contains: Zustand store with device data, backups history, settings
- Location: `src/stores/koboStore.js`
- Depends on: Zustand library only
- Used by: All components via hooks

**Custom Hooks Layer:**
- Purpose: Reusable stateful logic and side effects
- Contains: Feature detection, file system access, Kobo device management, backup/restore operations
- Location: `src/hooks/*.js`
- Depends on: Utilities, Store
- Used by: UI components

**Utility Layer:**
- Purpose: Pure functions and business logic
- Contains: Database parsing, backup creation, restore logic, file system operations, validation, formatters
- Location: `src/utils/*.js`
- Depends on: External libraries (sql.js, jszip, browser-fs-access)
- Used by: Hooks layer

## Data Flow

**Backup Flow:**

1. User clicks "Create Backup" button
2. `<Backup>` page renders `<BackupWizard>` component
3. DeviceSelector step: `useFileSystem` hook requests directory handle
4. ScanningScreen step: `useKoboDevice` hook reads database file
5. KoboDatabase class parses SQLite using sql.js WASM
6. Books/annotations loaded into Zustand store
7. LibraryOverview step: User reviews extracted data
8. BackupConfiguration step: User selects what to include
9. BackupProgress step: `useBackup` hook creates ZIP with jszip
10. BackupSuccess step: ZIP file downloaded via browser-fs-access
11. Backup metadata saved to store (persisted to localStorage)

**Restore Flow:**

1. User clicks "Restore Backup" button
2. `<Restore>` page renders `<RestoreWizard>` component
3. FileUploader step: User uploads backup ZIP file
4. BackupPreview step: ZIP extracted, contents displayed
5. RestoreOptions step: User selects restore target device
6. RestoreProgress step: `useRestore` hook writes files to device
7. RestoreSuccess step: Confirmation message

**State Management:**
- Zustand store persists backups history and settings to localStorage
- Device data (books, annotations) lives in memory only (not persisted)
- Navigation state (currentPage) managed in store

## Key Abstractions

**KoboDatabase:**
- Purpose: Parse Kobo SQLite database using sql.js
- Location: `src/utils/koboDatabase.js`
- Pattern: Class-based wrapper around sql.js
- Methods: `getBooks()`, `getAnnotations()`, `getProgress()`

**Wizard Components:**
- Purpose: Multi-step user flows with consistent navigation
- Examples: `<BackupWizard>`, `<RestoreWizard>`
- Location: `src/components/backup/*.jsx`, `src/components/restore/*.jsx`
- Pattern: Step-based state machine with next/back navigation

**Custom Hooks:**
- Purpose: Encapsulate stateful logic and external API interactions
- Examples: `useFeatureDetection`, `useFileSystem`, `useKoboDevice`, `useBackup`, `useRestore`
- Location: `src/hooks/*.js`
- Pattern: React hooks returning state and handler functions

## Entry Points

**Main Entry:**
- Location: `src/main.jsx`
- Triggers: Browser loads index.html
- Responsibilities: Mount React root, wrap in ErrorBoundary, import global styles

**App Root:**
- Location: `src/App.jsx`
- Triggers: React renders after mount
- Responsibilities: Feature detection, route to pages, render layout (Header/Footer)

## Error Handling

**Strategy:** ErrorBoundary at root level catches React errors, utility functions throw custom error classes

**Patterns:**
- ErrorBoundary component wraps entire app in `src/main.jsx`
- Custom error classes in `src/utils/errors.js` (DatabaseError, FileSystemError, ValidationError)
- Feature detection prevents unsupported browsers from running app
- Browser compatibility warnings for partial support

## Cross-Cutting Concerns

**Browser Compatibility:**
- Feature detection hook (`useFeatureDetection`) checks for required APIs
- UnsupportedBrowser component shows error for incompatible browsers
- BrowserWarning component shows warnings for partial support
- File System Access API polyfilled via browser-fs-access

**Privacy:**
- All processing happens in browser (no server calls)
- No analytics or tracking
- No data leaves the device

**Performance:**
- Manual chunk splitting in `vite.config.js` (vendor, db, zip chunks)
- sql.js WASM loaded separately (large file)
- SharedArrayBuffer enabled via COOP/COEP headers for faster WASM

---

*Architecture analysis: 2026-01-10*
*Update when major patterns change*
