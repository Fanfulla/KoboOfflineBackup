import { describe, it, expect, vi } from 'vitest';
import { buildBackupZip, buildKoboDb, meta } from '../test/builders.ts';
import { MemFileHandle } from '../test/memoryFs.ts';
import type { ScanResult } from '../types/kobo.ts';

vi.mock('sql.js', async (importOriginal) =>
  (await import('../test/sqlJsNode.ts')).sqlJsNodeMock(importOriginal as never),
);

const { createBackupBlob, verifyBackupArchive, calculateChecksum } = await import('./backup.ts');
const { parseBackupFile } = await import('./restore.ts');

async function scan(): Promise<ScanResult> {
  const db = await buildKoboDb([{ contentId: 'file:///mnt/onboard/A/b.epub', title: 'B' }]);
  const book = new MemFileHandle('b.epub');
  book.data = 'BOOK';
  const conf = new MemFileHandle('Kobo eReader.conf');
  conf.data = '[Reading]';
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
    deviceInfo: { model: 'Kobo', firmwareVersion: '4.41', databaseVersion: '3', schemaVersion: 176 },
    bookFiles: [{ path: 'A/b.epub', name: 'b.epub', size: 4, getFile: () => book.getFile() }],
    extraFiles: [
      {
        path: '.kobo/Kobo/Kobo eReader.conf',
        name: 'Kobo eReader.conf',
        size: 9,
        getFile: () => conf.getFile(),
      },
    ],
    database: db.buffer,
    warnings: [],
  };
}

describe('backup verification', () => {
  it('a freshly written backup verifies OK (entries + database checksum)', async () => {
    const { blob, metadata, verification } = await createBackupBlob(await scan(), { includeSettings: true });
    expect(verification).toMatchObject({ ok: true, missing: [], databaseChecksumOk: true });
    expect(verification!.entries).toBeGreaterThanOrEqual(5);
    expect(metadata.integrity?.databaseChecksum).toMatch(/^sha256:/);
    const names = await verifyBackupArchive(blob, {
      expectedEntries: ['device/.kobo/Kobo/Kobo eReader.conf'],
    });
    expect(names.ok).toBe(true);
  });

  it('detects missing entries and a tampered database', async () => {
    const dbBytes = await buildKoboDb();
    const zip = await buildBackupZip({
      dbBytes,
      metadata: meta({
        integrity: { databaseChecksum: 'sha256:deadbeef', filesChecked: 0, fileChecksums: {}, errors: [] },
      }),
    });
    const result = await verifyBackupArchive(zip, {
      expectedEntries: ['books/A/b.epub'],
      databaseChecksum: 'sha256:deadbeef',
    });
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(['books/A/b.epub']);
    expect(result.databaseChecksumOk).toBe(false);
  });
});

describe('restore-side integrity check', () => {
  it('flags a backup whose database does not match the recorded checksum', async () => {
    const dbBytes = await buildKoboDb();
    const good = await buildBackupZip({
      dbBytes,
      metadata: meta({
        integrity: {
          databaseChecksum: await calculateChecksum(dbBytes),
          filesChecked: 0,
          fileChecksums: {},
          errors: [],
        },
      }),
    });
    const bad = await buildBackupZip({
      dbBytes,
      metadata: meta({
        integrity: { databaseChecksum: 'sha256:00', filesChecked: 0, fileChecksums: {}, errors: [] },
      }),
    });
    expect((await parseBackupFile(good)).checksumOk).toBe(true);
    expect((await parseBackupFile(bad)).checksumOk).toBe(false);
    expect(
      (await parseBackupFile(await buildBackupZip({ dbBytes, metadata: meta() }))).checksumOk,
    ).toBeNull();
  });
});
