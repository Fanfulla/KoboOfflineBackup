# Technology Stack

**Analysis Date:** 2026-01-10

## Languages

**Primary:**
- JavaScript (ES2020+) - All application code (`src/**/*.js`, `src/**/*.jsx`)

## Runtime

**Environment:**
- Browser-based application (no Node.js runtime for execution)
- Requires modern browser with File System Access API support
- WebAssembly support required for sql.js

**Package Manager:**
- npm - `package.json`
- Lockfile: Not detected (package-lock.json should exist)

## Frameworks

**Core:**
- React 18.3.1 - UI framework (`src/**/*.jsx` components)
- Vite 5.3.1 - Build tool and dev server (`vite.config.js`)

**Testing:**
- Vitest 1.6.0 - Unit testing framework
- @testing-library/react 16.0.0 - React component testing
- @testing-library/jest-dom 6.4.6 - Jest DOM matchers

**Build/Dev:**
- Vite 5.3.1 - Fast bundler with HMR (`vite.config.js`)
- @vitejs/plugin-react 4.3.1 - React support for Vite
- PostCSS 8.4.38 + Autoprefixer 10.4.19 - CSS processing
- TailwindCSS 3.4.4 - Utility-first CSS framework

## Key Dependencies

**Critical:**
- sql.js 1.10.3 - SQLite compiled to WebAssembly for parsing Kobo database (`src/utils/koboDatabase.js`)
- zustand 4.5.0 - Lightweight state management (`src/stores/koboStore.js`)
- jszip 3.10.1 - ZIP file creation/extraction for backups (`src/utils/backup.js`, `src/utils/restore.js`)
- browser-fs-access 0.35.0 - File System Access API polyfill (`src/utils/fileSystem.js`)

**Infrastructure:**
- Browser APIs - FileReader, File System Access API, WebAssembly
- No backend server required (100% client-side)

## Configuration

**Environment:**
- No environment variables required
- All configuration client-side only

**Build:**
- `vite.config.js` - Vite configuration with manual chunk splitting
- `tailwind.config.js` - TailwindCSS customization (assumed)
- `postcss.config.js` - PostCSS setup
- Special headers for SharedArrayBuffer (COOP/COEP for sql.js WASM)

**Linting/Formatting:**
- ESLint 8.57.0 - JavaScript linter (`package.json` scripts)
- eslint-plugin-react 7.34.2 - React-specific rules
- eslint-plugin-react-hooks 4.6.2 - Hooks rules
- eslint-plugin-react-refresh 0.4.7 - Fast refresh support
- Prettier 3.3.2 - Code formatter

## Platform Requirements

**Development:**
- Any platform with Node.js and npm
- Modern browser (Chrome 86+, Edge 86+, Opera 72+)

**Production:**
- Static hosting (Vercel, Netlify, GitHub Pages, etc.)
- Modern browser with File System Access API support
- Browser must support WebAssembly (for sql.js)

---

*Stack analysis: 2026-01-10*
*Update after major dependency changes*
