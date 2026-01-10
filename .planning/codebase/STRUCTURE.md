# Codebase Structure

**Analysis Date:** 2026-01-10

## Directory Layout

```
kobo_b/
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── backup/       # Backup wizard steps
│   │   ├── restore/      # Restore wizard steps
│   │   ├── common/       # Reusable UI components
│   │   └── layout/       # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Top-level page components
│   ├── stores/           # Zustand state management
│   ├── styles/           # Global CSS
│   └── utils/            # Utility functions
├── index.html            # HTML entry point
├── package.json          # Project manifest
└── vite.config.js        # Build configuration
```

## Directory Purposes

**public/**
- Purpose: Static assets served directly
- Contains: favicon.ico, sql-wasm.wasm (SQLite WebAssembly binary)
- Key files: sql-wasm.wasm (required for sql.js)
- Subdirectories: None

**src/components/**
- Purpose: React UI components organized by feature
- Contains: Component directories (backup/, restore/, common/, layout/)
- Key files: ErrorBoundary.jsx, BrowserWarning.jsx, UnsupportedBrowser.jsx
- Subdirectories: backup/ (6 wizard steps), restore/ (6 wizard steps), common/ (8 reusable components), layout/ (3 layout components)

**src/components/backup/**
- Purpose: Backup wizard flow components
- Contains: BackupWizard.jsx (main wizard), DeviceSelector.jsx, ScanningScreen.jsx, LibraryOverview.jsx, BackupConfiguration.jsx, BackupProgress.jsx, BackupSuccess.jsx
- Also: BookCard.jsx, BookList.jsx (library display components)

**src/components/restore/**
- Purpose: Restore wizard flow components
- Contains: RestoreWizard.jsx (main wizard), FileUploader.jsx, BackupPreview.jsx, RestoreOptions.jsx, RestoreProgress.jsx, RestoreSuccess.jsx

**src/components/common/**
- Purpose: Reusable UI primitives
- Contains: Button.jsx, Card.jsx, ProgressBar.jsx, CircularProgress.jsx, StatusBadge.jsx, Modal.jsx, Checkbox.jsx, Icon.jsx

**src/components/layout/**
- Purpose: App-wide layout components
- Contains: Header.jsx (navigation), Footer.jsx, Container.jsx

**src/hooks/**
- Purpose: Custom React hooks for state and side effects
- Contains: useFeatureDetection.js, useFileSystem.js, useKoboDevice.js, useBackup.js, useRestore.js
- Key files: useKoboDevice.js (device detection and scanning), useBackup.js/useRestore.js (backup/restore operations)

**src/pages/**
- Purpose: Top-level page components
- Contains: Home.jsx, Backup.jsx, Restore.jsx, History.jsx
- Key files: Home.jsx (landing page), Backup.jsx/Restore.jsx (wizard containers)

**src/stores/**
- Purpose: Global state management
- Contains: koboStore.js (Zustand store)
- Key files: koboStore.js (device state, backups history, settings)

**src/styles/**
- Purpose: Global CSS and animations
- Contains: globals.css, animations.css (assumed based on imports)

**src/utils/**
- Purpose: Pure utility functions and business logic
- Contains: koboDatabase.js, backup.js, restore.js, fileSystem.js, errors.js, formatters.js, validation.js
- Key files: koboDatabase.js (SQLite parser), backup.js/restore.js (core operations), errors.js (custom error classes)

## Key File Locations

**Entry Points:**
- `index.html` - HTML entry point
- `src/main.jsx` - JavaScript entry point (mounts React)
- `src/App.jsx` - App root component (routing, layout)

**Configuration:**
- `package.json` - Dependencies and scripts
- `vite.config.js` - Vite build config with manual chunking
- `postcss.config.js` - PostCSS configuration
- `tailwind.config.js` - TailwindCSS configuration (assumed)

**Core Logic:**
- `src/utils/koboDatabase.js` - Kobo SQLite database parser
- `src/utils/backup.js` - Backup creation logic
- `src/utils/restore.js` - Restore logic
- `src/utils/fileSystem.js` - File System Access API wrappers
- `src/stores/koboStore.js` - Global state

**Testing:**
- No test files detected (Vitest configured but tests not written)

**Documentation:**
- `README.md` - User and developer documentation

## Naming Conventions

**Files:**
- PascalCase.jsx for React components (Button.jsx, DeviceSelector.jsx)
- camelCase.js for utilities and hooks (useBackup.js, koboDatabase.js)
- kebab-case.css for stylesheets (globals.css, animations.css)

**Directories:**
- lowercase plural for collections (components/, hooks/, pages/, utils/)
- lowercase singular for single-file directories (stores/)
- lowercase for feature groupings (backup/, restore/, common/, layout/)

**Special Patterns:**
- ErrorBoundary.jsx, UnsupportedBrowser.jsx - PascalCase for error-related components
- use*.js - React custom hooks prefix
- *.jsx - React components with JSX

## Where to Add New Code

**New Backup/Restore Step:**
- Component: `src/components/backup/{StepName}.jsx` or `src/components/restore/{StepName}.jsx`
- Hook (if needed): `src/hooks/use{Feature}.js`
- Update wizard: Modify `BackupWizard.jsx` or `RestoreWizard.jsx`

**New Reusable UI Component:**
- Implementation: `src/components/common/{ComponentName}.jsx`
- Import in consuming components

**New Page:**
- Implementation: `src/pages/{PageName}.jsx`
- Add route case in `src/App.jsx` renderPage() switch statement
- Add navigation link in `src/components/layout/Header.jsx`

**New Utility Function:**
- Implementation: `src/utils/{category}.js` (add to existing or create new file)
- Export function for use in hooks or components

**New Hook:**
- Implementation: `src/hooks/use{Feature}.js`
- Follow React hooks naming convention (use* prefix)

**New Store State:**
- Modify: `src/stores/koboStore.js`
- Add state properties and actions

## Special Directories

**public/**
- Purpose: Static assets, including WebAssembly binary
- Source: sql-wasm.wasm must be in public for sql.js to load it
- Committed: Yes (WASM binary included)

**node_modules/**
- Purpose: npm dependencies
- Source: npm install
- Committed: No (gitignored)

---

*Structure analysis: 2026-01-10*
*Update when directory structure changes*
