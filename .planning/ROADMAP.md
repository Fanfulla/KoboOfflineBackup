# Roadmap: Kobo Backup Manager

## Overview

Transform the Kobo Backup Manager from a non-functional prototype into a reliable, professional tool. First, fix the critical database connection bug preventing users from creating backups. Then rebuild the UI with a clean, minimal design that inspires confidence. Throughout, add test coverage to prevent regressions and ensure the app stays working.

## Domain Expertise

None

## Phases

- [ ] **Phase 1: Database Connection Fix** - Resolve KoboReader.sqlite access errors
- [ ] **Phase 2: Test Coverage** - Add tests for critical paths
- [ ] **Phase 3: Design System** - Professional typography and spacing foundation
- [ ] **Phase 4: Core Components** - Redesign reusable UI primitives
- [ ] **Phase 5: Wizard Redesign** - Rebuild backup/restore flows with clean layouts
- [ ] **Phase 6: Polish & Verify** - Final consistency pass and browser testing

## Phase Details

### Phase 1: Database Connection Fix
**Goal**: Investigate and resolve the "file not found" error when users try to scan their Kobo device
**Depends on**: Nothing (first phase)
**Research**: Likely (browser API behavior, device file structure)
**Research topics**: File System Access API directory handling patterns, Kobo device directory structure (.kobo location), Chrome-specific file access debugging
**Plans**: TBD

Plans:
- [ ] 01-01: TBD (to be determined during planning)

### Phase 2: Test Coverage
**Goal**: Add test coverage for database parsing, backup/restore operations, and file system access to prevent future regressions
**Depends on**: Phase 1
**Research**: Unlikely (Vitest already configured, test patterns established)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Design System
**Goal**: Establish professional design foundation with Oswald font, consistent spacing, and refined color palette
**Depends on**: Phase 2
**Research**: Unlikely (implementing user's specified design decisions)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Core Components
**Goal**: Redesign all reusable UI components (Button, Card, Modal, ProgressBar, etc.) with clean, minimal styling
**Depends on**: Phase 3
**Research**: Unlikely (internal UI work using established design system)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Wizard Redesign
**Goal**: Rebuild backup and restore wizard flows with professional, spacious layouts
**Depends on**: Phase 4
**Research**: Unlikely (internal restructuring with redesigned components)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Polish & Verify
**Goal**: Final visual consistency pass, cross-browser testing, and performance verification
**Depends on**: Phase 5
**Research**: Unlikely (testing and refinement work)
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Connection Fix | 0/0 | Not started | - |
| 2. Test Coverage | 0/0 | Not started | - |
| 3. Design System | 0/0 | Not started | - |
| 4. Core Components | 0/0 | Not started | - |
| 5. Wizard Redesign | 0/0 | Not started | - |
| 6. Polish & Verify | 0/0 | Not started | - |
