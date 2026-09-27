/**
 * Kobo database parser using sql.js (SQLite compiled to WebAssembly).
 * Reads KoboReader.sqlite and extracts books, annotations and reading progress.
 */

import type { Database, QueryExecResult, SqlJsStatic, SqlValue } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';
import { DatabaseError, ERROR_CODES } from './errors.ts';
import { mergeReadingData, type MergeOptions, type MergeReport } from './merge.ts';
import type {
  DeviceInfo,
  ExtractedData,
  KoboAnnotation,
  KoboBook,
  KoboCollection,
  ReadingStats,
} from '../types/kobo.ts';

type Row = Record<string, SqlValue>;

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

/** Load sql.js once per page; the WASM binary is bundled and hashed by Vite. */
function loadSqlJs(): Promise<SqlJsStatic> {
  sqlJsPromise ??= import('sql.js')
    .then(({ default: initSqlJs }) => initSqlJs({ locateFile: () => sqlWasmUrl }))
    .catch((error: unknown) => {
      sqlJsPromise = null;
      throw error;
    });
  return sqlJsPromise;
}

function toDate(value: SqlValue): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(value as string | number);
  return isNaN(date.getTime()) ? null : date;
}

const str = (value: SqlValue): string | null =>
  value === null || value === undefined ? null : String(value);
const num = (value: SqlValue): number => (typeof value === 'number' ? value : Number(value) || 0);
/** Kobo stores TimeSpentReading in SECONDS; the app works in minutes. */
const secondsToMinutes = (value: SqlValue): number => Math.round(num(value) / 60);

/** Sideloaded books: downloaded, top-level (not chapters), stored on the device (file://). */
const SIDELOADED_BOOKS_WHERE = `
  ContentType = 6
  AND LOWER(IsDownloaded) = 'true'
  AND (BookTitle IS NULL OR BookTitle = '')
  AND ContentID LIKE 'file://%'
`;

export class KoboDatabase {
  private readonly db: Database;

  private constructor(db: Database) {
    this.db = db;
  }

  static async open(data: ArrayBuffer | Uint8Array): Promise<KoboDatabase> {
    try {
      const SQL = await loadSqlJs();
      return new KoboDatabase(new SQL.Database(data instanceof Uint8Array ? data : new Uint8Array(data)));
    } catch (error) {
      throw new DatabaseError('Failed to initialize database', ERROR_CODES.DB_OPEN_FAILED, {
        originalError: error,
      });
    }
  }

  private rows(sql: string, params?: SqlValue[]): Row[] {
    const results: QueryExecResult[] = this.db.exec(sql, params);
    const first = results[0];
    if (!first) return [];
    return first.values.map((values) => Object.fromEntries(first.columns.map((col, i) => [col, values[i]])));
  }

  private query<T>(label: string, fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      console.error(`[DB ERROR] ${label} failed:`, error);
      throw new DatabaseError(`Failed to fetch ${label} from database`, ERROR_CODES.DB_QUERY_FAILED, {
        originalError: error,
      });
    }
  }

  /** Sideloaded books (ContentID file://...), most recently read first. */
  getBooks(): KoboBook[] {
    return this.query('books', () =>
      this.rows(
        `
        SELECT
          ContentID, Title, Attribution AS Author, Description, Publisher, Series, SeriesNumber,
          ISBN, Language, ___PercentRead AS Progress, ReadStatus, DateCreated, DateLastRead,
          ContentID AS FilePath, ImageId AS CoverId, TimeSpentReading, MimeType
        FROM content
        WHERE ${SIDELOADED_BOOKS_WHERE}
        ORDER BY DateLastRead DESC
      `,
      ).map((row) => ({
        ContentID: String(row.ContentID),
        Title: str(row.Title),
        Author: str(row.Author) || 'Unknown Author',
        Description: str(row.Description),
        Publisher: str(row.Publisher),
        Series: str(row.Series),
        SeriesNumber: str(row.SeriesNumber),
        ISBN: str(row.ISBN),
        Language: str(row.Language),
        Progress: row.Progress ? Math.round(num(row.Progress)) : 0,
        ReadStatus: row.ReadStatus === null ? null : num(row.ReadStatus),
        DateCreated: toDate(row.DateCreated),
        DateLastRead: toDate(row.DateLastRead),
        FilePath: row.FilePath ? safeDecode(String(row.FilePath).replace('file://', '')) : null,
        CoverId: str(row.CoverId),
        TimeSpentReading: secondsToMinutes(row.TimeSpentReading),
        MimeType: str(row.MimeType),
      })),
    );
  }

  /** Highlights and notes attached to books. */
  getAnnotations(): KoboAnnotation[] {
    return this.query('annotations', () =>
      this.rows(
        `
        SELECT
          b.BookmarkID, b.VolumeID, b.Text AS HighlightedText, b.Annotation AS Note,
          b.DateCreated, b.DateModified, b.StartContainerPath, b.StartOffset,
          b.EndContainerPath, b.EndOffset, c.Title AS BookTitle, c.Attribution AS Author
        FROM Bookmark b
        LEFT JOIN content c ON b.VolumeID = c.ContentID
        WHERE (b.Text IS NOT NULL OR b.Annotation IS NOT NULL)
          AND c.ContentType = 6
        ORDER BY b.DateCreated DESC
      `,
      ).map((row) => ({
        BookmarkID: String(row.BookmarkID),
        VolumeID: String(row.VolumeID),
        HighlightedText: str(row.HighlightedText),
        Note: str(row.Note),
        DateCreated: toDate(row.DateCreated),
        DateModified: toDate(row.DateModified),
        StartContainerPath: str(row.StartContainerPath),
        StartOffset: row.StartOffset === null ? null : num(row.StartOffset),
        EndContainerPath: str(row.EndContainerPath),
        EndOffset: row.EndOffset === null ? null : num(row.EndOffset),
        BookTitle: str(row.BookTitle) || 'Unknown Book',
        Author: str(row.Author) || 'Unknown Author',
      })),
    );
  }

  getReadingStats(): ReadingStats {
    return this.query('reading statistics', () => {
      const stats =
        this.rows(`
          SELECT
            COUNT(*) AS TotalBooks,
            SUM(CASE WHEN ___PercentRead > 0 THEN 1 ELSE 0 END) AS BooksStarted,
            SUM(CASE WHEN ___PercentRead >= 100 THEN 1 ELSE 0 END) AS BooksFinished,
            SUM(CASE WHEN ReadStatus = 1 THEN 1 ELSE 0 END) AS CurrentlyReading,
            SUM(TimeSpentReading) AS TotalSecondsRead,
            AVG(___PercentRead) AS AverageProgress,
            COUNT(DISTINCT Attribution) AS UniqueAuthors
          FROM content
          WHERE ${SIDELOADED_BOOKS_WHERE}
        `)[0] ?? {};

      return {
        totalBooks: num(stats.TotalBooks ?? 0),
        booksStarted: num(stats.BooksStarted ?? 0),
        booksFinished: num(stats.BooksFinished ?? 0),
        currentlyReading: num(stats.CurrentlyReading ?? 0),
        totalMinutesRead: secondsToMinutes(stats.TotalSecondsRead ?? 0),
        averageProgress: stats.AverageProgress ? Math.round(num(stats.AverageProgress)) : 0,
        uniqueAuthors: num(stats.UniqueAuthors ?? 0),
      };
    });
  }

  getDeviceInfo(): DeviceInfo {
    let model = 'Unknown Kobo Device';
    try {
      if (this.rows('SELECT UserID FROM user LIMIT 1').length > 0) model = 'Kobo Device';
    } catch {
      // Table might not exist
    }
    return {
      model,
      firmwareVersion: 'Unknown',
      databaseVersion: this.getDatabaseVersion(),
      schemaVersion: this.getSchemaVersion(),
    };
  }

  /** SQLite library version. */
  getDatabaseVersion(): string {
    try {
      return str(this.rows('SELECT sqlite_version() AS version')[0]?.version ?? null) ?? 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Kobo schema version. Nickel keeps it in the DbVersion table (PRAGMA
   * user_version is always 0 on Kobo databases).
   */
  getSchemaVersion(): number {
    try {
      const version = this.rows('SELECT version FROM DbVersion LIMIT 1')[0]?.version;
      if (version !== undefined && version !== null) return num(version);
    } catch {
      // Older/synthetic databases without DbVersion
    }
    try {
      return num(this.rows('PRAGMA user_version')[0]?.user_version ?? 0);
    } catch {
      return 0;
    }
  }

  /** User collections (shelves) with the ContentIDs they contain. */
  getCollections(): KoboCollection[] {
    const notDeleted = `(_IsDeleted IS NULL OR LOWER(_IsDeleted) != 'true')`;
    try {
      const members = new Map<string, string[]>();
      for (const row of this.rows(`SELECT ShelfName, ContentId FROM ShelfContent WHERE ${notDeleted}`)) {
        const name = String(row.ShelfName);
        members.set(name, [...(members.get(name) ?? []), String(row.ContentId)]);
      }
      return this.rows(
        `SELECT Id, Name, InternalName, Type, CreationDate, LastModified FROM Shelf
         WHERE (Type IS NULL OR Type != 'SystemTag') AND ${notDeleted} ORDER BY Name`,
      ).map((row) => ({
        Id: String(row.Id),
        Name: String(row.Name),
        InternalName: str(row.InternalName),
        Type: str(row.Type),
        CreationDate: toDate(row.CreationDate),
        LastModified: toDate(row.LastModified),
        ContentIds: members.get(String(row.Name)) ?? [],
      }));
    } catch {
      return [];
    }
  }

  /**
   * Prepare the database for writing back to a device: integrity check,
   * rollback journal mode and VACUUM for a clean file.
   */
  sanitize(): void {
    try {
      const integrity = this.db.exec('PRAGMA integrity_check');
      console.log('[DB] Integrity check result:', integrity[0]?.values[0]?.[0]);
      // Rollback journal (not WAL): the file is self-contained once written to the device.
      this.db.exec('PRAGMA journal_mode = DELETE');
      this.db.exec('VACUUM');
    } catch (error) {
      throw new DatabaseError('Failed to sanitize database', ERROR_CODES.DB_WRITE_ERROR, {
        originalError: error,
      });
    }
  }

  /** Copy reading data of sideloaded books from another (backup) database into this one. */
  mergeReadingDataFrom(source: KoboDatabase, options?: MergeOptions): MergeReport {
    try {
      return mergeReadingData(this.db, source.db, options);
    } catch (error) {
      throw new DatabaseError('Failed to merge reading data', ERROR_CODES.DB_WRITE_ERROR, {
        originalError: error,
      });
    }
  }

  export(): Uint8Array<ArrayBuffer> {
    return this.db.export() as Uint8Array<ArrayBuffer>;
  }

  close(): void {
    this.db.close();
  }
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function openDatabase(data: ArrayBuffer | Uint8Array): Promise<KoboDatabase> {
  return KoboDatabase.open(data);
}

/** Extract everything the UI needs from a Kobo database in one pass. */
export async function extractAllData(data: ArrayBuffer): Promise<ExtractedData> {
  const db = await openDatabase(data);
  try {
    return {
      books: db.getBooks(),
      annotations: db.getAnnotations(),
      stats: db.getReadingStats(),
      deviceInfo: db.getDeviceInfo(),
      collections: db.getCollections(),
      databaseSize: data.byteLength,
    };
  } finally {
    db.close();
  }
}
