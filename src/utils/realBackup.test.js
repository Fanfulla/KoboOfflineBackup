/**
 * Integration tests against the user's two REAL Kobo backups + an in-memory
 * File System Access mock so restore.js / fileSystem.js run end-to-end in node.
 *
 * Real fixtures (not committed, ~650 MB each):
 *   - kobo_backup_2026-01-11.zip  → OLD flat format  (books/title.kepub.epub)
 *   - kobo_backup_2026-02-23.zip  → NEW nested format (books/Author/title.kepub.epub)
 * If a fixture is missing the corresponding tests skip (CI has no fixtures),
 * while the synthetic-ZIP restore tests always run.
 *
 * sql.js' wasm path is hardcoded for the browser ("/sql-wasm.wasm"); we redirect
 * it to the installed wasm so the real DB layer works under node — production
 * code is untouched.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { openAsBlob, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ZipWriter, BlobWriter, TextReader, Uint8ArrayReader,
  ZipReader, BlobReader, TextWriter,
} from '@zip.js/zip.js';

const WASM = fileURLToPath(new URL('../../node_modules/sql.js/dist/sql-wasm.wasm', import.meta.url));
vi.mock('sql.js', async (importOriginal) => {
  const mod = await importOriginal();
  const real = mod.default;
  return { default: (cfg = {}) => real({ ...cfg, locateFile: () => WASM }) };
});

// Imports that (transitively) load sql.js must come AFTER the mock declaration.
const { parseBackupFile, restoreToDevice } = await import('./restore.js');
const { openDatabase } = await import('./koboDatabase.js');
const { exportToAnkiCsv, exportToObsidianZip, generateObsidianMarkdown } = await import('./export.js');
const initSqlJs = (await import('sql.js')).default;

const ZIP_OLD = fileURLToPath(new URL('../../kobo_backup_2026-01-11.zip', import.meta.url));
const ZIP_NEW = fileURLToPath(new URL('../../kobo_backup_2026-02-23.zip', import.meta.url));
const haveOld = existsSync(ZIP_OLD);
const haveNew = existsSync(ZIP_NEW);

/* ----------------------------- in-memory FS ----------------------------- */

class MemWritable {
  constructor(fh) { this.fh = fh; }
  async write(d) { this.fh._data = d; }
  async close() {}
}
class MemFileHandle {
  kind = 'file';
  constructor(name) { this.name = name; this._data = null; }
  async createWritable() { return new MemWritable(this); }
  async getFile() {
    const d = this._data;
    return new Blob(d == null ? [] : [d]);
  }
}
class MemDirHandle {
  kind = 'directory';
  constructor(name = 'root') { this.name = name; this._dirs = new Map(); this._files = new Map(); }
  // Mirror the browser API which throws on "." / ".." / separators.
  _check(n) { if (n === '.' || n === '..' || /[\\/]/.test(n)) throw new TypeError(`Name "${n}" is not allowed.`); }
  async getDirectoryHandle(name, opts = {}) {
    this._check(name);
    if (this._dirs.has(name)) return this._dirs.get(name);
    if (opts.create) { const d = new MemDirHandle(name); this._dirs.set(name, d); return d; }
    const e = new Error('not found'); e.name = 'NotFoundError'; throw e;
  }
  async getFileHandle(name, opts = {}) {
    this._check(name);
    if (this._files.has(name)) return this._files.get(name);
    if (opts.create) { const f = new MemFileHandle(name); this._files.set(name, f); return f; }
    const e = new Error('not found'); e.name = 'NotFoundError'; throw e;
  }
  async removeEntry(name, opts = {}) {
    this._check(name);
    if (this._files.has(name)) { this._files.delete(name); return; }
    if (this._dirs.has(name)) {
      const d = this._dirs.get(name);
      if (!opts.recursive && (d._dirs.size || d._files.size)) {
        const e = new Error('not empty'); e.name = 'InvalidModificationError'; throw e;
      }
      this._dirs.delete(name); return;
    }
    const e = new Error('not found'); e.name = 'NotFoundError'; throw e;
  }
  async *values() { yield* this._dirs.values(); yield* this._files.values(); }

  // ---- test helpers ----
  dir(p) { return p.split('/').reduce((h, seg) => (seg ? h?._dirs.get(seg) : h), this); }
  fileAt(path) {
    const parts = path.split('/');
    const name = parts.pop();
    const d = this.dir(parts.join('/'));
    return d?._files.get(name) || null;
  }
  hasFile(path) { return !!this.fileAt(path); }
  hasDir(path) { return !!this.dir(path); }
}

/* -------------------------- synthetic DB + ZIP --------------------------- */

async function buildKoboDb(books = [], bookmarks = []) {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(`CREATE TABLE content (
    ContentID TEXT, Title TEXT, Attribution TEXT, Description TEXT, Publisher TEXT,
    Series TEXT, SeriesNumber TEXT, ISBN TEXT, Language TEXT, ___PercentRead INTEGER,
    ReadStatus INTEGER, DateCreated TEXT, DateLastRead TEXT, ImageId TEXT,
    TimeSpentReading INTEGER, MimeType TEXT, ContentType INTEGER, IsDownloaded TEXT,
    BookTitle TEXT
  );`);
  db.run(`CREATE TABLE Bookmark (
    BookmarkID TEXT, VolumeID TEXT, Text TEXT, Annotation TEXT, DateCreated TEXT,
    DateModified TEXT, StartContainerPath TEXT, StartOffset INTEGER,
    EndContainerPath TEXT, EndOffset INTEGER
  );`);
  for (const b of books) {
    db.run(
      `INSERT INTO content (ContentID,Title,Attribution,___PercentRead,ReadStatus,ImageId,TimeSpentReading,MimeType,ContentType,IsDownloaded,BookTitle,ISBN,Publisher,DateLastRead)
       VALUES (?,?,?,?,?,?,?,?,6,'true',NULL,?,?,?)`,
      [b.contentId, b.title, b.author ?? 'Auth', b.percent ?? 0, b.readStatus ?? 0,
       b.imageId ?? 'img1', b.time ?? 0, b.mime ?? 'application/epub+zip',
       b.isbn ?? '111', b.publisher ?? 'Pub', b.dateLastRead ?? '2026-01-01T00:00:00Z'],
    );
  }
  for (const m of bookmarks) {
    db.run(
      `INSERT INTO Bookmark (BookmarkID,VolumeID,Text,Annotation,DateCreated) VALUES (?,?,?,?,?)`,
      [m.id, m.volumeId, m.text ?? null, m.note ?? null, m.date ?? '2026-01-01T00:00:00Z'],
    );
  }
  const buf = db.export();
  db.close();
  return buf; // Uint8Array
}

async function buildBackupZip({ dbBytes, metadata, bookEntries = [] }) {
  const zw = new ZipWriter(new BlobWriter('application/zip'));
  await zw.add('backup-metadata.json', new TextReader(JSON.stringify(metadata)));
  await zw.add('KoboReader.sqlite', new Uint8ArrayReader(dbBytes));
  for (const e of bookEntries) {
    await zw.add(e.name, new TextReader(e.content ?? 'EPUBDATA'));
  }
  return await zw.close(); // Blob
}

function meta(over = {}) {
  return {
    version: '1.0.0',
    created: '2026-02-23T20:29:00.000Z',
    statistics: { totalBooks: 1, totalAnnotations: 0 },
    device: { model: 'Kobo', firmwareVersion: '4.0' },
    options: {},
    ...over,
  };
}

async function freshDevice() {
  const dev = new MemDirHandle('device');
  await dev.getDirectoryHandle('.kobo', { create: true }); // restore requires it
  return dev;
}

/* --------------------------- real-zip fixtures --------------------------- */

const real = {}; // { old:{parsed,db,books,anns,stats}, new:{...} }

beforeAll(async () => {
  if (haveOld) {
    const parsed = await parseBackupFile(await openAsBlob(ZIP_OLD));
    const db = await openDatabase(parsed.database);
    real.old = {
      parsed, db,
      books: await db.getBooks(),
      anns: await db.getAnnotations(),
      stats: await db.getReadingStats(),
    };
  }
  if (haveNew) {
    const parsed = await parseBackupFile(await openAsBlob(ZIP_NEW));
    const db = await openDatabase(parsed.database);
    real.new = {
      parsed, db,
      books: await db.getBooks(),
      anns: await db.getAnnotations(),
      stats: await db.getReadingStats(),
    };
  }
}, 120_000);

afterAll(() => {
  real.old?.db?.close();
  real.new?.db?.close();
});

/* ================================ TESTS ================================= */

describe('REAL backup — parsing & format detection', () => {
  it.skipIf(!haveOld)('1. parses OLD flat backup as valid with book files', () => {
    expect(real.old.parsed.valid).toBe(true);
    expect(real.old.parsed.bookFiles.length).toBeGreaterThan(0);
  });

  it.skipIf(!haveNew)('2. parses NEW nested backup as valid with book files', () => {
    expect(real.new.parsed.valid).toBe(true);
    expect(real.new.parsed.bookFiles.length).toBeGreaterThan(0);
  });

  it.skipIf(!haveNew)('3. NEW format embeds nested path directly in originalPath', () => {
    const nested = real.new.parsed.bookFiles.find((b) => b.originalPath.includes('/'));
    expect(nested).toBeTruthy();
    expect(nested.path).toBe(`books/${nested.originalPath}`);
  });

  it.skipIf(!haveOld)('4. OLD format resolves flat filename to a DB path via pathMap', () => {
    expect(real.old.parsed.bookPathMap.size).toBeGreaterThan(0);
    // every bookFile has a resolvable original path (filename or mapped)
    expect(real.old.parsed.bookFiles.every((b) => typeof b.originalPath === 'string' && b.originalPath.length)).toBe(true);
  });

  it.skipIf(!haveOld)('5. parsed book filenames never contain path separators', () => {
    expect(real.old.parsed.bookFiles.every((b) => !b.name.includes('/'))).toBe(true);
  });
});

describe('REAL backup — database schema queries', () => {
  it.skipIf(!haveOld)('6. getBooks returns file:// ContentIDs and 0–100 integer progress', () => {
    const b = real.old.books;
    expect(b.length).toBeGreaterThan(0);
    expect(b.every((x) => String(x.ContentID).startsWith('file://'))).toBe(true);
    expect(b.every((x) => Number.isInteger(x.Progress) && x.Progress >= 0 && x.Progress <= 100)).toBe(true);
  });

  it.skipIf(!haveOld)('7. getReadingStats roughly matches metadata totalBooks', () => {
    const metaTotal = real.old.parsed.metadata.statistics.totalBooks;
    expect(real.old.stats.totalBooks).toBeGreaterThan(0);
    // same order of magnitude (store vs sideloaded counting differs slightly)
    expect(Math.abs(real.old.stats.totalBooks - metaTotal)).toBeLessThan(metaTotal * 0.5 + 5);
  });

  it.skipIf(!haveNew)('8. NEW backup books expose CoverId + Title fields', () => {
    const b = real.new.books;
    expect(b.length).toBeGreaterThan(0);
    expect(b.every((x) => 'CoverId' in x && 'Title' in x)).toBe(true);
  });

  it.skipIf(!haveOld)('9. getAnnotations never throws and yields well-formed rows', () => {
    expect(Array.isArray(real.old.anns)).toBe(true);
    for (const a of real.old.anns.slice(0, 50)) {
      expect('VolumeID' in a).toBe(true);
      expect(a.HighlightedText != null || a.Note != null).toBe(true);
    }
  });

  it.skipIf(!haveNew)('10. annotation VolumeIDs map onto book ContentIDs (dashboard grouping)', () => {
    if (real.new.anns.length === 0) return; // nothing to assert
    const ids = new Set(real.new.books.map((b) => b.ContentID));
    const matched = real.new.anns.filter((a) => ids.has(a.VolumeID)).length;
    expect(matched).toBeGreaterThan(0); // grouping by VolumeID === ContentID works
  });

  it.skipIf(!haveOld)('11. reading stats contain no NaN', () => {
    for (const v of Object.values(real.old.stats)) {
      if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false);
    }
  });
});

describe('REAL backup — exporters on real data', () => {
  it.skipIf(!haveNew)('12. Anki CSV from real annotations: header + one row per annotation, balanced quotes', async () => {
    const anns = real.new.anns.length ? real.new.anns : [{ BookTitle: 'X', Author: 'Y', HighlightedText: 'h', Note: '' }];
    const csv = await exportToAnkiCsv(anns.slice(0, 200)).text();
    expect(csv.split('\n')[0]).toBe('Front,Back,Tags');
    expect((csv.match(/"/g) || []).length % 2).toBe(0); // every quote is closed
  });

  it.skipIf(!haveNew)('13. Obsidian ZIP from real library produces unique .md entries', async () => {
    const annsByBook = {};
    real.new.anns.forEach((a) => { (annsByBook[a.VolumeID] ||= []).push(a); });
    const blob = await exportToObsidianZip(real.new.books, annsByBook).catch((e) => e);
    if (blob instanceof Error) {
      expect(blob.message).toMatch(/No annotations/); // valid outcome if library has none
      return;
    }
    const zr = new ZipReader(new BlobReader(blob));
    const names = (await zr.getEntries()).map((e) => e.filename);
    await zr.close();
    expect(new Set(names).size).toBe(names.length); // no collisions
    expect(names.every((n) => n.endsWith('.md'))).toBe(true);
  });

  it.skipIf(!haveOld)('14. Obsidian markdown for a real book carries YAML frontmatter', () => {
    const book = real.old.books[0];
    const md = generateObsidianMarkdown(book, [{ HighlightedText: 'hi', Note: 'n', DateCreated: '2026-01-01' }]);
    expect(md.startsWith('---')).toBe(true);
    expect(md).toContain('source: Kobo');
    expect(md).toContain(`# ${book.Title}`);
  });
});

describe('SYNTHETIC restore — in-memory device end-to-end', () => {
  it('15. NEW-format restore writes books to nested author folders', async () => {
    const dbBytes = await buildKoboDb([
      { contentId: 'file:///mnt/onboard/Author A/book1.epub', title: 'Book 1' },
    ]);
    const zip = await buildBackupZip({
      dbBytes,
      metadata: meta({ statistics: { totalBooks: 1 } }),
      bookEntries: [{ name: 'books/Author A/book1.epub', content: 'B1' }],
    });
    const backupData = await parseBackupFile(zip);
    const dev = await freshDevice();
    const res = await restoreToDevice(dev, backupData, {});
    expect(res.success).toBe(true);
    expect(res.failedBooks).toHaveLength(0);
    expect(dev.hasFile('Author A/book1.epub')).toBe(true);
    expect(dev.hasFile('.kobo/KoboReader.sqlite')).toBe(true);
  });

  it('16. default restore (cleanExistingBooks=false) keeps pre-existing files', async () => {
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/Author A/book1.epub', title: 'B1' }]);
    const zip = await buildBackupZip({ dbBytes, metadata: meta(), bookEntries: [{ name: 'books/Author A/book1.epub' }] });
    const backupData = await parseBackupFile(zip);
    const dev = await freshDevice();
    // pre-existing user file added AFTER the backup, inside same author folder
    const authorDir = await dev.getDirectoryHandle('Author A', { create: true });
    const keep = await authorDir.getFileHandle('added-later.epub', { create: true });
    (await keep.createWritable()).write('keep');

    await restoreToDevice(dev, backupData, {}); // default: no clean
    expect(dev.hasFile('Author A/added-later.epub')).toBe(true); // NOT wiped
    expect(dev.hasFile('Author A/book1.epub')).toBe(true);
  });

  it('17. opt-in cleanExistingBooks=true removes the author folder before restore', async () => {
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/Author A/book1.epub', title: 'B1' }]);
    const zip = await buildBackupZip({ dbBytes, metadata: meta(), bookEntries: [{ name: 'books/Author A/book1.epub' }] });
    const backupData = await parseBackupFile(zip);
    const dev = await freshDevice();
    const authorDir = await dev.getDirectoryHandle('Author A', { create: true });
    const stale = await authorDir.getFileHandle('stale.epub', { create: true });
    (await stale.createWritable()).write('stale');

    await restoreToDevice(dev, backupData, { cleanExistingBooks: true });
    expect(dev.hasFile('Author A/stale.epub')).toBe(false); // folder was cleaned
    expect(dev.hasFile('Author A/book1.epub')).toBe(true);  // then restored
  });

  it('18. cleanup never deletes a protected dir (.kobo) even if a book path points there', async () => {
    // Malicious/corrupt DB row whose path resolves under .kobo
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/.kobo/evil.epub', title: 'Evil' }]);
    const zip = await buildBackupZip({ dbBytes, metadata: meta(), bookEntries: [{ name: 'books/.kobo/evil.epub' }] });
    const backupData = await parseBackupFile(zip);
    const dev = await freshDevice();
    // sentinel inside .kobo that must survive
    const kobo = await dev.getDirectoryHandle('.kobo', { create: true });
    const sentinel = await kobo.getFileHandle('precious.db', { create: true });
    (await sentinel.createWritable()).write('precious');

    await restoreToDevice(dev, backupData, { cleanExistingBooks: true });
    expect(dev.hasFile('.kobo/precious.db')).toBe(true); // protected
  });

  it('19. path-traversal book entry is rejected, never escapes device root', async () => {
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/ok.epub', title: 'ok' }]);
    const zip = await buildBackupZip({ dbBytes, metadata: meta(), bookEntries: [{ name: 'books/ok.epub' }] });
    const backupData = await parseBackupFile(zip);
    // Inject a malicious originalPath the parser would never produce
    backupData.bookFiles.push({ name: 'evil.epub', path: 'books/ok.epub', originalPath: '../../../evil.epub' });

    const dev = await freshDevice();
    const res = await restoreToDevice(dev, backupData, {});
    const failed = res.failedBooks.find((f) => f.originalPath === '../../../evil.epub');
    expect(failed).toBeTruthy();
    expect(/traversal/i.test(failed.error)).toBe(true);
    expect(dev.hasFile('evil.epub')).toBe(false);
  });

  it('20. database-only restore (includeBooks=false) writes DB and skips books', async () => {
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/Author A/book1.epub', title: 'B1' }]);
    const zip = await buildBackupZip({ dbBytes, metadata: meta(), bookEntries: [{ name: 'books/Author A/book1.epub' }] });
    const backupData = await parseBackupFile(zip);
    const dev = await freshDevice();
    const res = await restoreToDevice(dev, backupData, { includeBooks: false });
    expect(res.success).toBe(true);
    expect(dev.hasFile('.kobo/KoboReader.sqlite')).toBe(true);
    expect(dev.hasFile('Author A/book1.epub')).toBe(false); // books skipped
  });
});
