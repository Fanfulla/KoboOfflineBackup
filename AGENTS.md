# AGENTS.md — KoBup

Privacy-first React/Vite web app that backs up and restores Kobo e-readers entirely in the browser.
Live: https://www.kobup.org (Vercel). Repo: https://github.com/Fanfulla/KoboOfflineBackup

## Commands

- `npm run dev` — dev server (no prerender, no service worker)
- `npm run check` — **run before every commit**: `tsc -b` + ESLint (0 warnings) + Vitest + production build
- `npm run format` / `npm run format:check` — Prettier (CI runs `format:check`)
- `npm run build` — `vite build` + `node scripts/postbuild.ts` (prerender 17 pages, sitemap.xml, sw.js)
- `npm run preview` — serve `dist/` (check `/it`, `/it/ripristino`, `/sw.js`)
- Node 22.18+ is required: `scripts/*.ts` run with Node's native type stripping.

## Architecture

- `src/utils/` — core logic, framework-free and unit-tested:
  - `scan.ts` (device scan), `deviceSource.ts` (`KoboSource`: FS Access handle or `webkitdirectory` FileList)
  - `backup.ts` (client-zip streaming; zip.js for AES-256; read-back verification), `backupInfo.ts`/`checksum.ts` (light helpers)
  - `restore.ts` (parse, full/merge restore, safety snapshot + undo, target inspection), `merge.ts` (reading-data merge)
  - `koboDatabase.ts` (sql.js), `koboDevice.ts` (`.kobo/version`), `koboCovers.ts` (`.kobo-images` qhash)
- Heavy modules (`backup.ts`, `restore.ts`, `export.ts`, sql.js) are **dynamically imported** by hooks/pages — keep them out of the initial bundle.
- `src/router/` — History-API router; routes and localized slugs in `routes.ts` (EN: `/restore`, IT: `/it/ripristino`).
- `src/i18n/` — `en.ts` defines the message shape (`Messages`); `it.ts` must match it (compiler + `i18n.test.ts` enforce keys and placeholders). Use `useI18n()` from `core.ts`; never hard-code UI strings.
- `src/seo/` — `meta.ts` (title/description/canonical/hreflang/JSON-LD) is shared by `useDocumentMeta` (client) and `head.ts` (prerender).
- `src/sw/` — service worker (offline precache + streamed downloads for Firefox/Safari) and its page-side protocol.
- State: Zustand store (`stores/koboStore.ts`) — device session in memory, backup history persisted with `skipHydration` (rehydrated after mount).

## Rules

- Components must be SSR-safe: no `window`/`localStorage` during render (use effects, `useSyncExternalStore` server snapshots, `useLocalFlag`). `app.test.tsx` and `hydration.test.tsx` render every route on the server and hydrate it.
- Restore is destructive: keep the safety snapshot, never delete protected dirs (`.kobo`, dot-folders), reject traversal/hidden paths, keep book cleanup opt-in.
- Kobo `TimeSpentReading` is in **seconds** (converted to minutes in `koboDatabase.ts`); the schema version lives in `DbVersion`, not `PRAGMA user_version`.
- Write a failing test first for bug fixes. Real Kobo backups for integration tests go in `fixtures/` or `$KOBUP_FIXTURES_DIR` — **never commit them** (personal data, account tokens).
- CSP in `vercel.json` only allows same-origin connections: do not add third-party scripts, fonts or APIs.
- Adding a page: route in `routes.ts`, component in `pages/`, entry in `App.tsx` `PAGES`, texts in `en.ts` + `it.ts` (`meta.pages`, `nav`), then check the prerendered output.
