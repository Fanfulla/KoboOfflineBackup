# KoBup — Free Kobo Backup & Restore Tool

> **The easiest way to back up your Kobo e-reader.** Books, highlights, notes and reading progress — processed 100% in your browser. Nothing is uploaded, no account needed.

**Live app:** [kobup.org](https://www.kobup.org/) · [Italiano](https://www.kobup.org/it)

[![Made with React](https://img.shields.io/badge/Made%20with-React%2019-61DAFB?logo=react)](https://react.dev/)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite%208-646CFF?logo=vite)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What is KoBup?

**KoBup** is a free, open-source web app that backs up and restores Kobo e-readers directly in the browser. Protect your library before a factory reset, move it to a new Kobo, or export your highlights to Obsidian and Anki — no installation, no server, no account.

## Features

- **Private by design** — everything runs locally (JavaScript + WebAssembly). A strict Content Security Policy only allows the page to talk to its own origin, so it _cannot_ upload your library.
- **Complete backup** — the Kobo database (progress, highlights, notes, bookmarks, collections), sideloaded books, and optionally reading settings, custom fonts and sleep screens.
- **Optional AES-256 encryption** — recommended for cloud storage: the Kobo database also contains your account sign-in tokens.
- **Verified backups** — every archive is read back after writing and the database SHA-256 is checked; restores flag archives whose database does not match.
- **Move to a new Kobo ("merge" restore)** — copies progress, highlights and collections of your books into the new device's own database while keeping its account, store library and settings. A classic "replace everything" restore is also available.
- **Safe restores** — the current device database is saved to `.kobo/KoboReader.sqlite.before-restore` first, with one-click undo. Existing book folders are never deleted unless you ask; paths into hidden/system folders are refused.
- **Any library size** — streaming ZIP engine: Chrome/Edge write straight to disk; Firefox/Safari stream through a service worker. Memory stays flat even for multi-GB libraries.
- **Library viewer** — real Kobo cover thumbnails (`.kobo-images`, loaded lazily), search/filter/sort, collections, reading statistics.
- **Highlight exports** — Obsidian (one Markdown note per book with YAML frontmatter), Anki (CSV), or a single book.
- **Backup history** — verify or restore previous backups in one click (the file handle is stored locally in IndexedDB).
- **English and Italian**, accessible (WCAG-minded: keyboard navigation, focus management, ARIA), installable and **works offline** (PWA).

## Quick start

### Back up

1. Open [kobup.org/backup](https://www.kobup.org/backup) on a computer.
2. Connect your Kobo via USB, unlock it and tap **Connect**.
3. Select the Kobo drive (usually `KOBOeReader`) and review what was found.
4. Choose what to include, optionally set a password, and save the ZIP.

### Move to a new Kobo / restore

1. Open [kobup.org/restore](https://www.kobup.org/restore) in Chrome, Edge, Opera or Brave.
2. Select your `kobo_backup_*.zip` (enter the password if it is encrypted).
3. Select the Kobo drive and review the compatibility check.
4. Choose **Merge reading data** (new or reset Kobo) or **Replace everything** (same Kobo), then start.

The [step-by-step guide](https://www.kobup.org/guide) and [FAQ](https://www.kobup.org/faq) cover the details.

## Browser support

| Browser           | Backup | Library & exports | Restore |
| ----------------- | ------ | ----------------- | ------- |
| Chrome / Edge 86+ | Yes    | Yes               | Yes     |
| Opera / Brave     | Yes    | Yes               | Yes     |
| Firefox (desktop) | Yes\*  | Yes               | No      |
| Safari (desktop)  | Yes\*  | Yes               | No      |
| Mobile browsers   | No     | No                | No      |

\* Folder selection via `<input webkitdirectory>` and a streamed download through the service worker. Restoring needs the [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API) to write to the Kobo, which only Chromium browsers provide.

## What gets backed up

| Content                                                        | Included                           |
| -------------------------------------------------------------- | ---------------------------------- |
| `KoboReader.sqlite` (progress, highlights, notes, collections) | Always                             |
| Sideloaded books (EPUB, KEPUB, PDF, CBZ, …)                    | Optional (database-only mode)      |
| Readable Markdown copy of all highlights                       | Optional                           |
| `Kobo eReader.conf`, `fonts/`, `.kobo/screensaver/`            | Optional ("Device settings")       |
| Kobo store purchases                                           | No — re-download from your account |

Archive layout: `KoboReader.sqlite`, `books/<original path>`, `device/<original path>`, `annotations/`, `backup-metadata.json`, `README.txt`.

## Privacy

- No backend: the Kobo is read and written through browser APIs, locally.
- Fonts and all assets are self-hosted; no third-party requests.
- The hosted site uses cookieless [Vercel Analytics](https://vercel.com/docs/analytics) for anonymous page views. Self-hosted copies can drop it.
- Details: [privacy policy](https://www.kobup.org/privacy).

## Technology

| Layer             | Technology                                                      |
| ----------------- | --------------------------------------------------------------- |
| UI                | React 19, TypeScript (strict), Tailwind CSS 4                   |
| Build             | Vite 8 (Rolldown), build-time prerendering (SSG) of every route |
| State             | Zustand 5 (+ IndexedDB for backup file handles)                 |
| SQLite in browser | sql.js (WebAssembly)                                            |
| ZIP               | client-zip (streaming write), @zip.js/zip.js (read, AES-256)    |
| Offline/streaming | Service worker (precache + streamed downloads)                  |
| Tests             | Vitest, Testing Library, happy-dom                              |
| Hosting           | Vercel                                                          |

## Project structure

```
src/
├── pages/            # Home, Backup, Restore, Library, History, Guide, Faq, Privacy, NotFound
├── components/       # common/ (Button, Modal, Tabs, Alert…), layout/, device/, library/
├── hooks/            # useDevice, useBackup, useRestore, useFeatureDetection, useLocalFlag
├── i18n/             # en.ts (defines the message shape), it.ts, core.ts (formatters)
├── router/           # path-based router with localized slugs (/it/ripristino…)
├── seo/              # per-page meta, hreflang, JSON-LD (shared by client and prerender)
├── sw/               # service worker + streaming download protocol
├── utils/            # scan, backup, restore, merge, koboDatabase, koboCovers, deviceSource…
├── entry-server.tsx  # prerender entry
└── main.tsx          # hydration + service worker registration
scripts/
├── postbuild.ts      # prerender pages, sitemap.xml, build sw.js with precache list
└── make-icons.ts     # generates the PWA icons
```

## Development

Requires Node.js 22.18+ (TypeScript scripts run natively).

```bash
npm install
npm run dev          # dev server
npm run check        # typecheck + lint + tests + production build
npm run build        # vite build + prerender + sitemap + service worker
npm run preview      # serve dist/
```

Integration tests can also run against real Kobo backups: put `kobo_backup_*.zip` files in `fixtures/` (git-ignored, they contain personal data) or point `KOBUP_FIXTURES_DIR` to them.

## Disclaimer

A personal project shared as-is under the MIT License. Keep independent copies of your books. Not affiliated with or endorsed by Rakuten Kobo Inc. Issues and pull requests are welcome.

## License

MIT — see [LICENSE](LICENSE).

## Changelog

### v2.0.0 (September 2026)

- **Fixes** — reading time was shown 60× too high (Kobo stores seconds); the restored database now really leaves WAL mode (`journal_mode` typo); schema version read from `DbVersion`; real device model/firmware from `.kobo/version`; restore errors are visible; backup/restore options that did nothing now work or were removed.
- **Covers** — found in `.kobo-images` (current firmware) via Nickel's image hash; lazy-loaded.
- **Restore** — merge mode for new devices, compatibility check (model, firmware, schema), pre-restore safety copy with undo, password-protected backups, integrity check, personalisation files.
- **Backup** — AES-256 encryption, read-back verification, settings/fonts/screensavers, warning when the Kobo has unsaved (WAL) changes, streamed downloads in Firefox/Safari.
- **Security** — Content Security Policy, self-hosted fonts (no Google Fonts), hidden-folder path guard.
- **UI** — rewritten in TypeScript: real URLs, English + Italian, accessibility pass, standalone library, history with verify/restore.
- **SEO** — prerendered pages with localized metadata, hreflang, structured data (FAQPage, HowTo, WebApplication), real sitemap.
- **PWA** — installable, works offline.
- **Tooling** — React 19, Vite 8, Tailwind 4, Zustand 5, TypeScript strict, ESLint 10, CI; 130+ tests.

### v1.2.1 (May 2026) — hardening

- Restore no longer deletes existing book folders by default; path-traversal guard; CSV-injection guard for Anki export; Obsidian filename de-duplication; integration tests against real backups.

### v1.2 (May 2026)

- Library dashboard, cover extraction, Obsidian/Anki exporter, streaming ZIP restore, Vitest suite.

### v1.1 (March 2026)

- Streaming backup engine (client-zip), database-only backup, accurate size estimate, Vercel Analytics.

### v1.0 (January 2026)

- Initial release.

---

_Made for the Kobo community — [kobup.org](https://www.kobup.org/)_
