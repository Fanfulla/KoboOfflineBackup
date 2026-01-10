# External Integrations

**Analysis Date:** 2026-01-10

## APIs & External Services

**No External APIs:**
- This application is 100% client-side
- No backend server, no API calls, no webhooks
- All processing happens in the browser

## Data Storage

**Databases:**
- None (no traditional database)
- Parses user's Kobo device SQLite database (KoboReader.sqlite) locally
- Connection: File System Access API reads file from device
- Parser: sql.js (SQLite compiled to WebAssembly) in `src/utils/koboDatabase.js`

**File Storage:**
- Browser's File System Access API - Read/write access to user's Kobo device
- SDK/Client: browser-fs-access 0.35.0 (polyfill/helper library)
- Implementation: `src/utils/fileSystem.js` wraps File System Access API
- Permissions: User grants access via browser prompt

**LocalStorage:**
- Zustand persistence - Backup history and user settings
- Implementation: `src/stores/koboStore.js` with persist middleware
- Stored data: backups array (last 20 backups metadata), settings object
- NOT stored: Device data, books, annotations (session-only)

**Caching:**
- None (no service worker, no cache API usage)

## Authentication & Identity

**No Authentication:**
- No user accounts
- No login/signup flow
- All data stays on user's device

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Rollbar, etc.)
- Errors caught by ErrorBoundary displayed to user
- No telemetry sent to external services

**Analytics:**
- None (privacy-first, no tracking)
- No Google Analytics, Mixpanel, etc.

**Logs:**
- Console-only (browser DevTools)
- No log aggregation or external logging service

## CI/CD & Deployment

**Hosting:**
- Not specified (likely static hosting)
- Expected: Vercel, Netlify, GitHub Pages, or similar
- Deployment: Not configured (manual deployment likely)

**CI Pipeline:**
- Not configured
- No GitHub Actions, GitLab CI, etc.

## Environment Configuration

**Development:**
- Required env vars: None
- Secrets location: None (no secrets needed)
- All dependencies loaded from npm or public CDN

**Production:**
- Secrets management: Not applicable (no secrets)
- Build artifacts: Static HTML/CSS/JS files from `npm run build`

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-01-10*
*Update when adding/removing external services*

**NOTE:** This is a privacy-first, zero-dependency web application. No data leaves the user's browser.
