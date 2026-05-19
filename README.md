# KoBup — Free Kobo Backup Tool

> **The easiest way to backup your Kobo e-reader library.** Back up books, annotations, highlights, and reading progress — 100% in your browser, zero uploads, zero accounts.

🌐 **Live app:** [kobup.org](https://www.kobup.org/)

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://react.dev/)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Styled with TailwindCSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## What is KoBup?

**KoBup** ([kobup.org](https://www.kobup.org/)) is a free, open-source web tool that lets you create a complete backup of your Kobo e-reader directly in the browser — no app to install, no account to create, no data ever leaving your device.

Whether you want to protect against a factory reset, switch to a new Kobo device, or simply keep a safe copy of your books and reading progress, KoBup handles it in a few clicks.

---

## ✨ Features

- **🔒 100% Private** — All processing happens locally in your browser. Your books never touch a server.
- **📚 Complete Kobo Backup** — Backs up sideloaded books (EPUB, PDF), the Kobo database, annotations, highlights, and reading progress.
- **⚡ Handles Any Library Size** — Streaming ZIP engine writes directly to disk, so even 4 GB+ libraries back up and restore without running out of memory.
- **📊 Library Dashboard** — Once connected, explore your library interactively: filter books by progress (Read, Reading, Unread), search by title/author, and view reading stats.
- **🖼️ Real Cover Extraction** — Extracts actual cover thumbnails from `.kobo/images` using suffix match resolution, with a smart fallback system for missing covers.
- **🎒 Advanced Notes Exporter** — Export all annotations to Obsidian (ZIP of Markdown files with YAML frontmatter) or Anki (escaped CSV ready for flashcard import).
- **💾 Database-Only Mode** — Skip the book files and back up only the database (reading progress, highlights, annotations) for a fast, small backup.
- **🔄 Full Restore** — Restore your entire library to a new or reset Kobo device.
- **🌐 No Installation** — Works directly in Chrome or Edge — just visit [kobup.org](https://www.kobup.org/).
- **📖 Open Source** — Fully transparent, auditable code. Anyone can inspect exactly what the app does.
- **🎨 Beautiful UI** — Clean, Kobo-inspired design with an intuitive step-by-step wizard.

---

## 🚀 Quick Start

### Create a Kobo Backup

1. Open **[kobup.org](https://www.kobup.org/)** in Chrome or Edge (desktop)
2. Connect your Kobo e-reader via USB and unlock it
3. Click **"Create Backup"**
4. Select your Kobo device folder when prompted
5. Choose what to include (books, annotations, reading progress)
6. Chrome will ask where to save the ZIP file — pick a location
7. Done! Store the backup in a safe place (cloud, external drive)

### Explore Library & Export Notes

1. Connect your Kobo device and run the scanning process.
2. Click **"Open Dashboard"** or select **Dashboard** in the header.
3. Browse your books, check your reading statistics, or view highlighted notes.
4. Go to the **Annotations** tab to export all highlights/notes directly to Obsidian or Anki.

### Restore a Kobo Backup

1. Open **[kobup.org](https://www.kobup.org/)** in Chrome or Edge
2. Connect the target Kobo via USB
3. Click **"Restore Backup"**
4. Select your `kobo_backup_*.zip` file
5. Select the Kobo device folder
6. Confirm and wait — your library is restored

---

## 🌐 Browser Compatibility

| Browser | Backup | Restore | Notes |
|---|---|---|---|
| **Chrome 86+** | ✅ | ✅ | Recommended |
| **Edge 86+** | ✅ | ✅ | Fully supported |
| **Opera 72+** | ✅ | ✅ | Fully supported |
| **Brave** | ⚠️ | ⚠️ | Enable File System API in settings |
| **Firefox** | ❌ | ❌ | File System Access API not supported |
| **Safari** | ❌ | ❌ | File System Access API not available |

> **Why Chrome/Edge only?** KoBup uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) to read directly from your Kobo device and write the backup directly to disk without loading everything into memory. This API is only available in Chromium-based browsers.

---

## 📋 What Gets Backed Up?

### Always Included
- ✅ **Kobo Database** (`KoboReader.sqlite`) — reading progress, bookmarks, highlights, collections
- ✅ **Book Files** — all sideloaded EPUB, PDF, and other ebook files *(optional: can be skipped for a database-only backup)*

### Optional (User Choice)
- 📝 **Annotations & Highlights** — all your notes and highlighted passages, also exported as Markdown
- 📖 **Reading Progress** — current page positions and reading statistics
- ⚙️ **Device Settings** — font and reading preferences

### Not Included
- ❌ **Kobo Store Purchases** — re-downloadable from your Kobo account
- ❌ **System / Firmware Files** — not needed for library backup

---

## 🔐 Privacy & Security

**Your data never leaves your device.**

1. The app runs entirely in your browser — there is no backend server
2. Your books and database are read locally via the File System Access API
3. The backup ZIP is written directly to your chosen location on disk
4. The only external service used is [Vercel Analytics](https://vercel.com/analytics) — cookieless, anonymous page-view counts only
5. No account, no login, no tracking of what you read

The complete source code is public on GitHub. You can audit every line, or self-host your own copy with zero analytics.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18.3+ |
| Build Tool | Vite 5+ |
| Styling | TailwindCSS 3.4+ |
| State | Zustand |
| SQLite in browser | sql.js (WebAssembly) |
| ZIP creation | **client-zip** (streaming, replaces JSZip) |
| ZIP extraction | **@zip.js/zip.js** (streaming, replaces JSZip) |
| File System | File System Access API + browser-fs-access |
| Testing | Vitest |
| Analytics | Vercel Analytics (cookieless) |
| Hosting | Vercel |

---

## 🏗️ Project Structure

```
KoboOfflineBackup/
├── src/
│   ├── components/
│   │   ├── common/          # Button, Card, Checkbox, etc.
│   │   ├── layout/          # Header, Footer
│   │   ├── backup/          # Backup wizard steps & CoverPreview
│   │   └── restore/         # Restore wizard steps
│   ├── hooks/
│   │   ├── useBackup.js     # Backup orchestration (streaming-first)
│   │   ├── useKoboDevice.js # Device scanning
│   │   └── useRestore.js    # Restore orchestration
│   ├── pages/               # Home, LibraryDashboard, Backup, Restore, History, FAQ, etc.
│   ├── utils/
│   │   ├── backup.js        # ZIP creation via client-zip (streaming)
│   │   ├── restore.js       # ZIP extraction via @zip.js/zip.js (streaming)
│   │   ├── koboDatabase.js  # SQLite parsing with sql.js
│   │   ├── koboCovers.js    # Cover image extraction utility
│   │   ├── export.js        # Obsidian Markdown & Anki CSV Exporters
│   │   └── fileSystem.js    # File System Access API wrapper
│   └── App.jsx
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── sql-wasm.wasm
├── index.html               # SEO meta tags, OG, JSON-LD
├── vercel.json              # COOP/COEP headers for SharedArrayBuffer
└── package.json
```

---

## 🧑‍💻 Local Development

```bash
# Clone
git clone https://github.com/Fanfulla/KoboOfflineBackup.git
cd KoboOfflineBackup

# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚠️ Disclaimer

This is a **personal project**, shared as-is under the MIT License.

- No support, assistance, or updates are guaranteed
- Always keep a separate copy of your books independently of this tool
- Not affiliated with or endorsed by Rakuten Kobo Inc.
- Issues and pull requests are welcome but may not receive a timely response

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🗺️ Changelog

### v1.2 (May 2026)
- **Library Dashboard** — responsive UI grid to view connected books, filter by status, read metadata, and check reading time/metrics.
- **Kobo Covers Extractor** — parse real book covers from `.kobo/images` using suffix match resolution logic.
- **Advanced Notes Exporter** — export all highlights to Obsidian Markdown ZIP (with YAML frontmatter metadata) or Anki CSV (escaped flashcards).
- **Streaming ZIP Restore** — refactored restore logic to use `@zip.js/zip.js` streams, preventing client memory exhaustion when restoring large files.
- **Vitest Test Suite** — added unit tests for cover parsing and Obsidian/Anki exporters.

### v1.1 (March 2026)
- **Streaming backup engine** — replaced JSZip with client-zip; files are written to disk one at a time, fixing OOM crashes on large libraries (4 GB+, 500+ books)
- **Database-only backup** — option to skip book files and back up only reading progress, annotations, and highlights
- **Accurate size estimate** — estimated backup size now reflects actual file sizes
- **Error visibility** — backup failures now show a clear error message instead of silently restarting
- **Vercel Analytics** — cookieless, privacy-preserving page-view tracking

### v1.0 (January 2026)
- Initial release
- Full backup and restore functionality
- Browser compatibility detection
- Privacy-first architecture

---

*Made with ❤️ for the Kobo community — [kobup.org](https://www.kobup.org/)*
