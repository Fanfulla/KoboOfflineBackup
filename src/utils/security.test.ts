import { describe, it, expect, vi } from 'vitest';
import { ZipReader, BlobReader } from '@zip.js/zip.js';
import { buildBackupZip, buildKoboDb, meta } from '../test/builders.ts';
import { freshDevice, MemFileHandle } from '../test/memoryFs.ts';
import type { ScanResult } from '../types/kobo.ts';

vi.mock('sql.js', async (importOriginal) =>
  (await import('../test/sqlJsNode.ts')).sqlJsNodeMock(importOriginal as never),
);

const { createBackupBlob } = await import('./backup.ts');
const { parseBackupFile, restoreToDevice, undoLastRestore, SAFETY_SNAPSHOT_NAME } =
  await import('./restore.ts');
const { ERROR_CODES } = await import('./errors.ts');

async function scanResult(): Promise<ScanResult> {
  const db = await buildKoboDb([{ contentId: 'file:///mnt/onboard/Author/Book.epub', title: 'Book' }], [], {
    users: 1,
  });
  const bookFile = new MemFileHandle('Book.epub');
  bookFile.data = 'EPUB-CONTENT';
  return {
    books: [],
    annotations: [],
    stats: {
      totalBooks: 1,
      booksStarted: 0,
      booksFinished: 0,
      currentlyReading: 0,
      totalMinutesRead: 0,
      averageProgress: 0,
      uniqueAuthors: 1,
    },
    collections: [],
    deviceInfo: { model: 'Kobo Sage', firmwareVersion: '4.41', databaseVersion: '3', schemaVersion: 176 },
    bookFiles: [{ path: 'Author/Book.epub', name: 'Book.epub', size: 12, getFile: () => bookFile.getFile() }],
    extraFiles: [],
    database: db.buffer,
    warnings: [],
  };
}

describe('encrypted backups (AES-256)', () => {
  it('produces a ZIP whose entries are all encrypted and restores with the right password', async () => {
    const { blob } = await createBackupBlob(await scanResult(), { password: 'correct horse' });

    const reader = new ZipReader(new BlobReader(blob));
    const entries = await reader.getEntries();
    await reader.close();
    expect(entries.length).toBeGreaterThan(2);
    expect(entries.every((e) => e.encrypted)).toBe(true);

    const parsed = await parseBackupFile(blob, 'correct horse');
    expect(parsed.encrypted).toBe(true);
    expect(parsed.bookFiles.map((b) => b.originalPath)).toEqual(['Author/Book.epub']);

    const dev = await freshDevice();
    const res = await restoreToDevice(dev.handle, parsed);
    expect(res.failedBooks).toEqual([]);
    expect(await (await dev.fileAt('Author/Book.epub')!.getFile()).text()).toBe('EPUB-CONTENT');
  });

  it('asks for a password when the backup is encrypted', async () => {
    const { blob } = await createBackupBlob(await scanResult(), { password: 'secret' });
    await expect(parseBackupFile(blob)).rejects.toMatchObject({
      code: ERROR_CODES.RESTORE_PASSWORD_REQUIRED,
    });
  });

  it('reports a wrong password distinctly', async () => {
    const { blob } = await createBackupBlob(await scanResult(), { password: 'secret' });
    await expect(parseBackupFile(blob, 'nope')).rejects.toMatchObject({
      code: ERROR_CODES.RESTORE_WRONG_PASSWORD,
    });
  });

  it('keeps plain backups readable without a password', async () => {
    const { blob } = await createBackupBlob(await scanResult());
    const parsed = await parseBackupFile(blob);
    expect(parsed.encrypted).toBe(false);
  });
});

describe('restore safety net', () => {
  async function backupAndDevice() {
    const dbBytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/A/b.epub', title: 'B' }]);
    const zip = await buildBackupZip({
      dbBytes,
      metadata: meta(),
      bookEntries: [{ name: 'books/A/b.epub' }],
    });
    const dev = await freshDevice();
    await dev.writeText('.kobo/KoboReader.sqlite', 'ORIGINAL-DEVICE-DB');
    return { parsed: await parseBackupFile(zip), dev };
  }

  it('saves a copy of the current device database before overwriting it', async () => {
    const { parsed, dev } = await backupAndDevice();
    const res = await restoreToDevice(dev.handle, parsed);
    expect(res.safetySnapshot).toBe(true);
    const snapshot = await dev.fileAt(`.kobo/${SAFETY_SNAPSHOT_NAME}`)!.getFile();
    expect(await snapshot.text()).toBe('ORIGINAL-DEVICE-DB');
  });

  it('can undo the last restore by putting the snapshot back', async () => {
    const { parsed, dev } = await backupAndDevice();
    await restoreToDevice(dev.handle, parsed);
    await dev.writeText('.kobo/KoboReader.sqlite-wal', 'stale');

    expect(await undoLastRestore(dev.handle)).toBe(true);
    expect(await (await dev.fileAt('.kobo/KoboReader.sqlite')!.getFile()).text()).toBe('ORIGINAL-DEVICE-DB');
    expect(dev.hasFile('.kobo/KoboReader.sqlite-wal')).toBe(false);
  });

  it('never writes book files into hidden/system folders', async () => {
    const { parsed, dev } = await backupAndDevice();
    parsed.bookFiles.push({
      name: 'KoboReader.sqlite',
      path: 'books/A/b.epub',
      originalPath: '.kobo/KoboReader.sqlite',
    });
    const res = await restoreToDevice(dev.handle, parsed);
    expect(res.failedBooks.map((f) => f.originalPath)).toContain('.kobo/KoboReader.sqlite');
    // The real database written by the restore must not be clobbered by the "book".
    expect(await (await dev.fileAt('.kobo/KoboReader.sqlite')!.getFile()).text()).not.toBe('EPUBDATA');
  });
});
