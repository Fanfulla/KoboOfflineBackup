/**
 * Integration tests against the user's REAL Kobo backups + an in-memory File
 * System Access mock so restore.ts / fileSystem.ts run end-to-end in node.
 *
 * Real fixtures (not committed, ~650 MB each) live in ./fixtures or $KOBUP_FIXTURES_DIR:
 *   - kobo_backup_2026-01-11.zip  → OLD flat format  (books/title.kepub.epub)
 *   - kobo_backup_2026-02-23.zip  → NEW nested format (books/Author/title.kepub.epub)
 * Missing fixtures skip the corresponding tests (CI), synthetic tests always run.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { openAsBlob } from 'node:fs';
import { ZipReader, BlobReader } from '@zip.js/zip.js';
import { buildBackupZip, buildKoboDb, fixture, meta } from '../test/builders.ts';
import { freshDevice } from '../test/memoryFs.ts';
import type { KoboAnnotation, KoboBook, ReadingStats } from '../types/kobo.ts';

vi.mock('sql.js', async (importOriginal) =>
  (await import('../test/sqlJsNode.ts')).sqlJsNodeMock(importOriginal as never),
);

const { parseBackupFile, restoreToDevice } = await import('./restore.ts');
const { openDatabase } = await import('./koboDatabase.ts');
const { exportToAnkiCsv, exportToObsidianZip, generateObsidianMarkdown } = await import('./export.ts');

type Parsed = Awaited<ReturnType<typeof parseBackupFile>>;
type Db = Awaited<ReturnType<typeof openDatabase>>;
interface RealFixture {
  parsed: Parsed;
  db: Db;
  books: KoboBook[];
  anns: KoboAnnotation[];
  stats: ReadingStats;
}

const ZIP_OLD = fixture('kobo_backup_2026-01-11.zip');
const ZIP_NEW = fixture('kobo_backup_2026-02-23.zip');
const real: { old?: RealFixture; new?: RealFixture } = {};

async function loadFixture(path: string): Promise<RealFixture> {
  const parsed = await parseBackupFile(await openAsBlob(path));
  const db = await openDatabase(parsed.database);
  return { parsed, db, books: db.getBooks(), anns: db.getAnnotations(), stats: db.getReadingStats() };
}

beforeAll(async () => {
  if (ZIP_OLD) real.old = await loadFixture(ZIP_OLD);
  if (ZIP_NEW) real.new = await loadFixture(ZIP_NEW);
}, 120_000);

afterAll(() => {
  real.old?.db.close();
  real.new?.db.close();
});

describe('REAL backup — parsing & format detection', () => {
  it.skipIf(!ZIP_OLD)('1. parses OLD flat backup as valid with book files', () => {
    expect(real.old!.parsed.valid).toBe(true);
    expect(real.old!.parsed.bookFiles.length).toBeGreaterThan(0);
  });

  it.skipIf(!ZIP_NEW)('2. parses NEW nested backup as valid with book files', () => {
    expect(real.new!.parsed.valid).toBe(true);
    expect(real.new!.parsed.bookFiles.length).toBeGreaterThan(0);
  });

  it.skipIf(!ZIP_NEW)('3. NEW format embeds nested path directly in originalPath', () => {
    const nested = real.new!.parsed.bookFiles.find((b) => b.originalPath.includes('/'));
    expect(nested).toBeTruthy();
    expect(nested!.path).toBe(`books/${nested!.originalPath}`);
  });

  it.skipIf(!ZIP_OLD)('4. OLD format resolves flat filename to a DB path via pathMap', () => {
    expect(real.old!.parsed.bookPathMap.size).toBeGreaterThan(0);
    expect(
      real.old!.parsed.bookFiles.every((b) => typeof b.originalPath === 'string' && b.originalPath.length),
    ).toBe(true);
  });

  it.skipIf(!ZIP_OLD)('5. parsed book filenames never contain path separators', () => {
    expect(real.old!.parsed.bookFiles.every((b) => !b.name.includes('/'))).toBe(true);
  });
});

describe('REAL backup — database schema queries', () => {
  it.skipIf(!ZIP_OLD)('6. getBooks returns file:// ContentIDs and 0–100 integer progress', () => {
    const b = real.old!.books;
    expect(b.length).toBeGreaterThan(0);
    expect(b.every((x) => x.ContentID.startsWith('file://'))).toBe(true);
    expect(b.every((x) => Number.isInteger(x.Progress) && x.Progress >= 0 && x.Progress <= 100)).toBe(true);
  });

  it.skipIf(!ZIP_OLD)('7. getReadingStats roughly matches metadata totalBooks', () => {
    const metaTotal = real.old!.parsed.metadata.statistics.totalBooks;
    expect(real.old!.stats.totalBooks).toBeGreaterThan(0);
    expect(Math.abs(real.old!.stats.totalBooks - metaTotal)).toBeLessThan(metaTotal * 0.5 + 5);
  });

  it.skipIf(!ZIP_NEW)('8. NEW backup books expose CoverId + Title fields', () => {
    const b = real.new!.books;
    expect(b.length).toBeGreaterThan(0);
    expect(b.every((x) => 'CoverId' in x && 'Title' in x)).toBe(true);
  });

  it.skipIf(!ZIP_OLD)('9. getAnnotations never throws and yields well-formed rows', () => {
    for (const a of real.old!.anns.slice(0, 50)) {
      expect('VolumeID' in a).toBe(true);
      expect(a.HighlightedText != null || a.Note != null).toBe(true);
    }
  });

  it.skipIf(!ZIP_NEW)('10. annotation VolumeIDs map onto book ContentIDs (dashboard grouping)', () => {
    if (real.new!.anns.length === 0) return;
    const ids = new Set(real.new!.books.map((b) => b.ContentID));
    expect(real.new!.anns.filter((a) => ids.has(a.VolumeID)).length).toBeGreaterThan(0);
  });

  it.skipIf(!ZIP_OLD)('11. reading stats contain no NaN', () => {
    for (const v of Object.values(real.old!.stats)) expect(Number.isNaN(v)).toBe(false);
  });
});

describe('REAL backup — exporters on real data', () => {
  it.skipIf(!ZIP_NEW)('12. Anki CSV from real annotations: header + balanced quotes', async () => {
    const anns = real.new!.anns.length
      ? real.new!.anns
      : [{ BookTitle: 'X', Author: 'Y', HighlightedText: 'h', Note: '' }];
    const csv = await exportToAnkiCsv(anns.slice(0, 200)).text();
    expect(csv.split('\n')[0]).toBe('Front,Back,Tags');
    expect((csv.match(/"/g) || []).length % 2).toBe(0);
  });

  it.skipIf(!ZIP_NEW)('13. Obsidian ZIP from real library produces unique .md entries', async () => {
    const annsByBook: Record<string, KoboAnnotation[]> = {};
    real.new!.anns.forEach((a) => (annsByBook[a.VolumeID] ||= []).push(a));
    const blob = await exportToObsidianZip(real.new!.books, annsByBook).catch((e: Error) => e);
    if (blob instanceof Error) {
      expect(blob.message).toMatch(/No annotations/);
      return;
    }
    const zr = new ZipReader(new BlobReader(blob));
    const names = (await zr.getEntries()).map((e) => e.filename);
    await zr.close();
    expect(new Set(names).size).toBe(names.length);
    expect(names.every((n) => n.endsWith('.md'))).toBe(true);
  });

  it.skipIf(!ZIP_OLD)('14. Obsidian markdown for a real book carries YAML frontmatter', () => {
    const book = real.old!.books[0]!;
    const md = generateObsidianMarkdown(book, [
      { HighlightedText: 'hi', Note: 'n', DateCreated: new Date('2026-01-01') },
    ]);
    expect(md.startsWith('---')).toBe(true);
    expect(md).toContain('source: Kobo');
    expect(md).toContain(`# ${book.Title}`);
  });
});

describe('SYNTHETIC restore — in-memory device end-to-end', () => {
  const oneBook = async () => {
    const dbBytes = await buildKoboDb([
      { contentId: 'file:///mnt/onboard/Author A/book1.epub', title: 'B1' },
    ]);
    const zip = await buildBackupZip({
      dbBytes,
      metadata: meta(),
      bookEntries: [{ name: 'books/Author A/book1.epub' }],
    });
    return parseBackupFile(zip);
  };

  it('15. NEW-format restore writes books to nested author folders', async () => {
    const backupData = await oneBook();
    const dev = await freshDevice();
    const res = await restoreToDevice(dev.handle, backupData, {});
    expect(res.success).toBe(true);
    expect(res.failedBooks).toHaveLength(0);
    expect(dev.hasFile('Author A/book1.epub')).toBe(true);
    expect(dev.hasFile('.kobo/KoboReader.sqlite')).toBe(true);
  });

  it('16. default restore (cleanExistingBooks=false) keeps pre-existing files', async () => {
    const backupData = await oneBook();
    const dev = await freshDevice();
    await dev.writeText('Author A/added-later.epub', 'keep');

    await restoreToDevice(dev.handle, backupData, {});
    expect(dev.hasFile('Author A/added-later.epub')).toBe(true);
    expect(dev.hasFile('Author A/book1.epub')).toBe(true);
  });

  it('17. opt-in cleanExistingBooks=true removes the author folder before restore', async () => {
    const backupData = await oneBook();
    const dev = await freshDevice();
    await dev.writeText('Author A/stale.epub', 'stale');

    await restoreToDevice(dev.handle, backupData, { cleanExistingBooks: true });
    expect(dev.hasFile('Author A/stale.epub')).toBe(false);
    expect(dev.hasFile('Author A/book1.epub')).toBe(true);
  });

  it('18. cleanup never deletes a protected dir (.kobo) even if a book path points there', async () => {
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/.kobo/evil.epub', title: 'Evil' }]);
    const zip = await buildBackupZip({
      dbBytes,
      metadata: meta(),
      bookEntries: [{ name: 'books/.kobo/evil.epub' }],
    });
    const backupData = await parseBackupFile(zip);
    const dev = await freshDevice();
    await dev.writeText('.kobo/precious.db', 'precious');

    await restoreToDevice(dev.handle, backupData, { cleanExistingBooks: true });
    expect(dev.hasFile('.kobo/precious.db')).toBe(true);
  });

  it('19. path-traversal book entry is rejected, never escapes device root', async () => {
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/ok.epub', title: 'ok' }]);
    const zip = await buildBackupZip({ dbBytes, metadata: meta(), bookEntries: [{ name: 'books/ok.epub' }] });
    const backupData = await parseBackupFile(zip);
    // Inject a malicious originalPath the parser would never produce
    backupData.bookFiles.push({
      name: 'evil.epub',
      path: 'books/ok.epub',
      originalPath: '../../../evil.epub',
    });

    const dev = await freshDevice();
    const res = await restoreToDevice(dev.handle, backupData, {});
    const failed = res.failedBooks.find((f) => f.originalPath === '../../../evil.epub');
    expect(failed).toBeTruthy();
    expect(failed!.error).toMatch(/traversal/i);
    expect(dev.hasFile('evil.epub')).toBe(false);
  });

  it('20. database-only restore (includeBooks=false) writes DB and skips books', async () => {
    const backupData = await oneBook();
    const dev = await freshDevice();
    const res = await restoreToDevice(dev.handle, backupData, { includeBooks: false });
    expect(res.success).toBe(true);
    expect(res.booksRestored).toBe(0);
    expect(dev.hasFile('.kobo/KoboReader.sqlite')).toBe(true);
    expect(dev.hasFile('Author A/book1.epub')).toBe(false);
  });
});
