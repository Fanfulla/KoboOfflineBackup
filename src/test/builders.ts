/**
 * Builders for synthetic Kobo databases and backup ZIPs used by tests.
 */
import { ZipWriter, BlobWriter, TextReader, Uint8ArrayReader } from '@zip.js/zip.js';
import initSqlJs from 'sql.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BackupMetadata } from '../types/kobo.ts';

export const FIXTURES_DIR =
  process.env.KOBUP_FIXTURES_DIR || fileURLToPath(new URL('../../fixtures/', import.meta.url));

/** Path of a private fixture, or null when it is not available (e.g. CI). */
export function fixture(name: string): string | null {
  const path = join(FIXTURES_DIR, name);
  return existsSync(path) ? path : null;
}

export interface BookSeed {
  contentId: string;
  title: string;
  author?: string;
  percent?: number;
  readStatus?: number;
  imageId?: string;
  time?: number;
  mime?: string;
  isbn?: string;
  publisher?: string;
  dateLastRead?: string;
  chapterBookmarked?: string;
  chapters?: { contentId: string; percent?: number }[];
}

export interface BookmarkSeed {
  id: string;
  volumeId: string;
  text?: string | null;
  note?: string | null;
  date?: string;
}

export interface ShelfSeed {
  name: string;
  contentIds: string[];
  deleted?: boolean;
}

export interface DbSeedOptions {
  dbVersion?: number;
  users?: number;
  userId?: string;
  shelves?: ShelfSeed[];
}

export async function buildKoboDb(
  books: BookSeed[] = [],
  bookmarks: BookmarkSeed[] = [],
  { dbVersion, users = 0, userId, shelves = [] }: DbSeedOptions = {},
): Promise<Uint8Array<ArrayBuffer>> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  // Keys mirror the real Kobo schema.
  db.run(`CREATE TABLE content (
    ContentID TEXT NOT NULL, BookID TEXT, Title TEXT, Attribution TEXT, Description TEXT, Publisher TEXT,
    Series TEXT, SeriesNumber TEXT, ISBN TEXT, Language TEXT, ___PercentRead INTEGER,
    ReadStatus INTEGER, DateCreated TEXT, DateLastRead TEXT, ImageId TEXT,
    TimeSpentReading INTEGER, MimeType TEXT, ContentType INTEGER, IsDownloaded TEXT,
    BookTitle TEXT, ChapterIDBookmarked TEXT, ___FileSize INTEGER, PRIMARY KEY (ContentID)
  );`);
  db.run(`CREATE TABLE Bookmark (
    BookmarkID TEXT NOT NULL, VolumeID TEXT, ContentID TEXT, Text TEXT, Annotation TEXT, DateCreated TEXT,
    DateModified TEXT, StartContainerPath TEXT, StartOffset INTEGER,
    EndContainerPath TEXT, EndOffset INTEGER, Hidden TEXT, Type TEXT, Color INTEGER, PRIMARY KEY (BookmarkID)
  );`);
  db.run(`CREATE TABLE Shelf (CreationDate TEXT, Id TEXT, InternalName TEXT, LastModified TEXT, Name TEXT,
    Type TEXT, _IsDeleted TEXT, _IsVisible TEXT, _IsSynced TEXT, _SyncTime TEXT, LastAccessed TEXT, PRIMARY KEY (Id));`);
  db.run(
    `CREATE TABLE ShelfContent (ShelfName TEXT, ContentId TEXT, DateModified TEXT, _IsDeleted TEXT, _IsSynced TEXT,
      PRIMARY KEY (ShelfName, ContentId));`,
  );
  for (const s of shelves) {
    db.run(
      `INSERT INTO Shelf (CreationDate, Id, InternalName, LastModified, Name, Type, _IsDeleted, _IsVisible, _IsSynced)
       VALUES ('2026-01-01T00:00:00Z', ?, ?, '2026-01-01T00:00:00Z', ?, 'UserTag', ?, 'true', 'false')`,
      [`shelf-${s.name}`, s.name, s.name, s.deleted ? 'true' : 'false'],
    );
    for (const id of s.contentIds) {
      db.run(
        `INSERT INTO ShelfContent (ShelfName, ContentId, _IsDeleted, _IsSynced) VALUES (?, ?, 'false', 'false')`,
        [s.name, id],
      );
    }
  }
  db.run(`CREATE TABLE user (UserID TEXT, UserKey TEXT, UserDisplayName TEXT, UserEmail TEXT, ___DeviceID TEXT,
    AuthToken TEXT, RefreshToken TEXT, KoboAccessToken TEXT);`);
  for (let i = 0; i < users; i++) {
    db.run(
      `INSERT INTO user VALUES (?, 'key', 'Reader', 'reader@example.com', 'dev', 'auth', 'refresh', 'access')`,
      [userId ?? `user-${i}`],
    );
  }
  if (dbVersion !== undefined) {
    db.run('CREATE TABLE DbVersion (version INTEGER)');
    db.run('INSERT INTO DbVersion VALUES (?)', [dbVersion]);
  }
  for (const b of books) {
    db.run(
      `INSERT INTO content (ContentID,Title,Attribution,___PercentRead,ReadStatus,ImageId,TimeSpentReading,MimeType,ContentType,IsDownloaded,BookTitle,ISBN,Publisher,DateLastRead,ChapterIDBookmarked)
       VALUES (?,?,?,?,?,?,?,?,6,'true',NULL,?,?,?,?)`,
      [
        b.contentId,
        b.title,
        b.author ?? 'Auth',
        b.percent ?? 0,
        b.readStatus ?? 0,
        b.imageId ?? 'img1',
        b.time ?? 0,
        b.mime ?? 'application/epub+zip',
        b.isbn ?? '111',
        b.publisher ?? 'Pub',
        b.dateLastRead ?? '2026-01-01T00:00:00Z',
        b.chapterBookmarked ?? null,
      ],
    );
    for (const ch of b.chapters ?? []) {
      db.run(
        `INSERT INTO content (ContentID, BookID, Title, ___PercentRead, ContentType, IsDownloaded, BookTitle)
         VALUES (?, ?, 'Chapter', ?, 9, 'true', ?)`,
        [ch.contentId, b.contentId, ch.percent ?? 0, b.title],
      );
    }
  }
  for (const m of bookmarks) {
    db.run(
      `INSERT INTO Bookmark (BookmarkID,VolumeID,ContentID,Text,Annotation,DateCreated) VALUES (?,?,?,?,?,?)`,
      [m.id, m.volumeId, m.volumeId, m.text ?? null, m.note ?? null, m.date ?? '2026-01-01T00:00:00Z'],
    );
  }
  const buf = db.export() as Uint8Array<ArrayBuffer>;
  db.close();
  return buf;
}

export interface ZipSeedEntry {
  name: string;
  content?: string;
}

export async function buildBackupZip({
  dbBytes,
  metadata,
  bookEntries = [],
  extraEntries = [],
}: {
  dbBytes: Uint8Array;
  metadata: Partial<BackupMetadata>;
  bookEntries?: ZipSeedEntry[];
  extraEntries?: ZipSeedEntry[];
}): Promise<Blob> {
  const zw = new ZipWriter(new BlobWriter('application/zip'));
  await zw.add('backup-metadata.json', new TextReader(JSON.stringify(metadata)));
  await zw.add('KoboReader.sqlite', new Uint8ArrayReader(dbBytes));
  for (const e of [...bookEntries, ...extraEntries])
    await zw.add(e.name, new TextReader(e.content ?? 'EPUBDATA'));
  return zw.close();
}

export function meta(over: Partial<BackupMetadata> = {}): BackupMetadata {
  return {
    version: '1.0.0',
    created: '2026-02-23T20:29:00.000Z',
    generator: 'test',
    statistics: { totalBooks: 1, totalAnnotations: 0 },
    device: { model: 'Kobo', firmwareVersion: '4.0', schemaVersion: 0 },
    options: {},
    ...over,
  };
}
