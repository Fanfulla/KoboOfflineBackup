# Kobo Backup Manager

## What This Is

A privacy-first web application that backs up and restores Kobo e-reader libraries entirely in the browser. Users connect their Kobo device via USB, and the app reads the database, creates backup ZIP files, and can restore them - all without any server or cloud uploads.

## Core Value

**Make it actually work and look professional.** Users need a reliable tool that successfully connects to their Kobo device and creates backups, with a UI that inspires confidence rather than looking amateurish.

## Requirements

### Validated

- ✓ React 18 SPA with Vite build system - existing
- ✓ Client-side SQLite parsing with sql.js WebAssembly - existing
- ✓ ZIP creation/extraction with jszip - existing
- ✓ Zustand state management with localStorage persistence - existing
- ✓ File System Access API for direct device access - existing
- ✓ Backup/restore wizard flows with multi-step UI - existing
- ✓ Browser feature detection and compatibility warnings - existing

### Active

- [ ] **Fix database connection bug** - KoboReader.sqlite "file not found" error in Chrome
  - Problem: App fails to locate database file on connected Kobo device
  - Root cause: Unknown (needs investigation in file system access logic)
  - Success criteria: User can connect Kobo device and successfully scan library

- [ ] **Professional UI redesign** - Clean, minimal interface that looks polished
  - Typography: Implement Oswald font family throughout
  - Design: Clean and minimal aesthetic with lots of white space
  - Color palette: Keep current Kobo-inspired colors (cream, grays)
  - Consistency: Professional layouts, proper spacing, cohesive design language
  - Components: Redesign all wizard steps, buttons, cards, modals
  - Success criteria: UI looks professional and trustworthy, not amateurish

- [ ] **Test coverage for critical paths** - Add tests to prevent regressions
  - Database parsing (KoboDatabase class)
  - Backup creation and restore flows
  - File system operations
  - Success criteria: Core functionality covered by tests

### Out of Scope

- New backup features or functionality changes (focus on fixing existing, not adding new)
- Multi-language support (English only for now)
- Cloud backup integration (stays 100% local)
- Mobile/touch-optimized design (desktop browsers primary target)

## Context

**Current State:**
- Application is feature-complete but has critical bug preventing usage
- Database connection fails with "file not found" when trying to scan Kobo device
- UI is functional but looks unprofessional and poorly designed
- No tests exist despite test framework being configured
- Privacy-first architecture is working (100% client-side, no server)

**Technical Environment:**
- Modern browser-based SPA using File System Access API
- WebAssembly for SQLite parsing (sql.js)
- TailwindCSS for styling (needs better design implementation)
- Vite dev server with COOP/COEP headers for SharedArrayBuffer

**Known Issues from Codebase:**
- Zero test coverage (Vitest configured but no tests written)
- Content Security Policy disabled in development (needs production enabling)
- Large files may cause browser memory issues (no streaming for ZIP operations)
- sql.js synchronous parsing may block UI on large libraries

**User Feedback:**
- "Can't connect to database" - primary blocker for usage
- "UI looks like it's made by a 5 year old kid" - credibility issue

## Constraints

- **Tech stack**: Must stay with React 18, Vite, TailwindCSS, sql.js (no major rewrites)
- **Client-side only**: 100% browser-based, no backend, no server, no cloud uploads
- **Offline-capable**: Must work without internet connection after initial load
- **Privacy-first**: No telemetry, no analytics, no data leaves the device
- **Browser support**: Chrome 86+ and Edge 86+ (File System Access API requirement)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix database bug before UI redesign | Users can't use app at all if DB doesn't connect; make it work first, then make it beautiful | — Pending |
| Clean and minimal UI design | Builds trust and professionalism without overdesigning | — Pending |
| Keep 100% client-side architecture | Privacy-first is core value proposition of the product | — Pending |
| Use Oswald font family | User preference for professional typography | — Pending |
| Add test coverage during fixes | Prevent regressions, ensure bug stays fixed | — Pending |

---
*Last updated: 2026-01-10 after initialization*
