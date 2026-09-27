/**
 * "Reading data only" restore: copy progress, highlights/notes and
 * collections of sideloaded books from a backup database INTO the target
 * device's own database, instead of replacing it.
 *
 * This keeps the target device's account (user table, auth tokens), store
 * library, settings and schema, which is what you want when moving to a new
 * Kobo or after re-registering a device.
 */
import type { Database, SqlValue } from 'sql.js';

export interface MergeOptions {
  progress?: boolean;
  annotations?: boolean;
  collections?: boolean;
}

export interface MergeReport {
  booksUpdated: number;
  booksAdded: number;
  annotationsAdded: number;
  collectionsAdded: number;
  collectionEntriesAdded: number;
}

type Row = Record<string, SqlValue>;

/** Per-book reading state columns on the `content` row (subset present in both schemas is used). */
const PROGRESS_COLUMNS = [
  '___PercentRead',
  'ReadStatus',
  'DateLastRead',
  'ChapterIDBookmarked',
  'TimeSpentReading',
  'RestOfBookEstimate',
  'FirstTimeReading',
  'LastTimeStartedReading',
  'LastTimeFinishedReading',
  'TimesStartedReading',
  'adobe_location',
  'Rating',
];

const SIDELOADED = `ContentType = 6 AND ContentID LIKE 'file://%' AND (BookTitle IS NULL OR BookTitle = '')`;

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

function columns(db: Database, table: string): string[] {
  try {
    return (db.exec(`PRAGMA table_info(${quote(table)})`)[0]?.values ?? []).map((row) => String(row[1]));
  } catch {
    return [];
  }
}

function rows(db: Database, sql: string, params: SqlValue[] = []): Row[] {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const out: Row[] = [];
    while (stmt.step()) out.push(stmt.getAsObject() as Row);
    return out;
  } finally {
    stmt.free();
  }
}

function keySet(db: Database, sql: string): Set<string> {
  return new Set(rows(db, sql).map((r) => Object.values(r).map(String).join('\u0000')));
}

function inserter(db: Database, table: string, cols: string[]) {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO ${quote(table)} (${cols.map(quote).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
  );
  return {
    insert: (row: Row) => {
      stmt.run(cols.map((c) => row[c] ?? null));
      return db.getRowsModified() > 0;
    },
    free: () => stmt.free(),
  };
}

const common = (a: string[], b: string[]) => a.filter((c) => b.includes(c));

export function mergeReadingData(
  target: Database,
  source: Database,
  options: MergeOptions = {},
): MergeReport {
  const { progress = true, annotations = true, collections = true } = options;
  const report: MergeReport = {
    booksUpdated: 0,
    booksAdded: 0,
    annotationsAdded: 0,
    collectionsAdded: 0,
    collectionEntriesAdded: 0,
  };

  const contentCols = common(columns(source, 'content'), columns(target, 'content'));
  const hasBookId = contentCols.includes('BookID');
  const books = rows(source, `SELECT * FROM content WHERE ${SIDELOADED}`);
  const bookIds = new Set(books.map((b) => String(b.ContentID)));
  const existing = keySet(target, 'SELECT ContentID FROM content');
  const chaptersOf = (bookId: SqlValue) =>
    hasBookId ? rows(source, 'SELECT * FROM content WHERE BookID = ? AND ContentID != BookID', [bookId]) : [];

  target.exec('BEGIN');
  try {
    // 1. Books: update reading state of known books, add unknown ones (with chapters).
    const progressCols = PROGRESS_COLUMNS.filter((c) => contentCols.includes(c));
    const chapterCols = ['___PercentRead', 'ReadStatus'].filter((c) => contentCols.includes(c));
    const update = (cols: string[]) =>
      cols.length
        ? target.prepare(
            `UPDATE content SET ${cols.map((c) => `${quote(c)} = ?`).join(', ')} WHERE ContentID = ?`,
          )
        : null;
    const updateBook = progress ? update(progressCols) : null;
    const updateChapter = progress ? update(chapterCols) : null;
    const insertContent = inserter(target, 'content', contentCols);

    for (const book of books) {
      const chapters = chaptersOf(book.ContentID);
      if (existing.has(String(book.ContentID))) {
        if (updateBook) {
          updateBook.run([...progressCols.map((c) => book[c] ?? null), book.ContentID]);
          report.booksUpdated++;
          for (const ch of chapters) {
            if (existing.has(String(ch.ContentID)))
              updateChapter?.run([...chapterCols.map((c) => ch[c] ?? null), ch.ContentID]);
          }
        }
      } else if (insertContent.insert(book)) {
        report.booksAdded++;
        for (const ch of chapters) insertContent.insert(ch);
      }
    }
    updateBook?.free();
    updateChapter?.free();
    insertContent.free();

    // 2. Highlights, notes and bookmarks.
    if (annotations && columns(source, 'Bookmark').length) {
      const bmCols = common(columns(source, 'Bookmark'), columns(target, 'Bookmark'));
      const known = keySet(target, 'SELECT BookmarkID FROM Bookmark');
      const insertBookmark = inserter(target, 'Bookmark', bmCols);
      for (const bm of rows(source, 'SELECT * FROM Bookmark')) {
        if (!bookIds.has(String(bm.VolumeID)) || known.has(String(bm.BookmarkID))) continue;
        if (insertBookmark.insert(bm)) report.annotationsAdded++;
      }
      insertBookmark.free();
    }

    // 3. Collections (matched by name, deleted ones skipped).
    if (collections && columns(source, 'Shelf').length && columns(target, 'Shelf').length) {
      const notDeleted = `(_IsDeleted IS NULL OR LOWER(_IsDeleted) != 'true')`;
      const shelfCols = common(columns(source, 'Shelf'), columns(target, 'Shelf'));
      const knownShelves = keySet(target, 'SELECT Name FROM Shelf');
      const insertShelf = inserter(target, 'Shelf', shelfCols);
      const shelves = rows(
        source,
        `SELECT * FROM Shelf WHERE ${notDeleted} AND (Type IS NULL OR Type != 'SystemTag')`,
      );
      for (const shelf of shelves) {
        if (knownShelves.has(String(shelf.Name))) continue;
        if (insertShelf.insert(shelf)) report.collectionsAdded++;
      }
      insertShelf.free();

      const scCols = common(columns(source, 'ShelfContent'), columns(target, 'ShelfContent'));
      const shelfNames = new Set(shelves.map((s) => String(s.Name)));
      const knownEntries = keySet(target, 'SELECT ShelfName, ContentId FROM ShelfContent');
      const insertEntry = inserter(target, 'ShelfContent', scCols);
      for (const entry of rows(source, `SELECT * FROM ShelfContent WHERE ${notDeleted}`)) {
        const key = `${entry.ShelfName}\u0000${entry.ContentId}`;
        if (
          !shelfNames.has(String(entry.ShelfName)) ||
          !bookIds.has(String(entry.ContentId)) ||
          knownEntries.has(key)
        )
          continue;
        if (insertEntry.insert(entry)) report.collectionEntriesAdded++;
      }
      insertEntry.free();
    }

    target.exec('COMMIT');
  } catch (error) {
    target.exec('ROLLBACK');
    throw error;
  }
  return report;
}
