import { describe, it, expect, vi } from 'vitest';
import { buildBackupZip, buildKoboDb, meta } from '../test/builders.ts';
import { freshDevice } from '../test/memoryFs.ts';

vi.mock('sql.js', async (importOriginal) =>
  (await import('../test/sqlJsNode.ts')).sqlJsNodeMock(importOriginal as never),
);

const { openDatabase } = await import('./koboDatabase.ts');
const { parseBackupFile, restoreToDevice } = await import('./restore.ts');
const { ERROR_CODES } = await import('./errors.ts');
const initSqlJs = (await import('sql.js')).default;

const A = 'file:///mnt/onboard/Author/A.kepub.epub';
const B = 'file:///mnt/onboard/Author/B.kepub.epub';

/** Backup from the OLD device: A read to 55% with a highlight, B finished, a shelf. */
const backupDb = () =>
  buildKoboDb(
    [
      {
        contentId: A,
        title: 'A',
        percent: 55,
        readStatus: 1,
        time: 3600,
        chapterBookmarked: 'OEBPS/ch3.xhtml',
        chapters: [{ contentId: `${A}!!ch1`, percent: 100 }],
      },
      {
        contentId: B,
        title: 'B',
        percent: 100,
        readStatus: 2,
        time: 7200,
        chapters: [{ contentId: `${B}!!ch1`, percent: 100 }],
      },
    ],
    [{ id: 'bm-1', volumeId: A, text: 'A highlight', note: 'my note' }],
    {
      users: 1,
      userId: 'OLD-ACCOUNT',
      shelves: [
        { name: 'Favourites', contentIds: [A, B] },
        { name: 'Gone', contentIds: [A], deleted: true },
      ],
    },
  );

/** NEW device: signed into a new account, A already imported but unread, B unknown. */
const deviceDb = () =>
  buildKoboDb(
    [
      {
        contentId: A,
        title: 'A',
        percent: 0,
        readStatus: 0,
        chapters: [{ contentId: `${A}!!ch1`, percent: 0 }],
      },
    ],
    [],
    {
      users: 1,
      userId: 'NEW-ACCOUNT',
    },
  );

async function query(bytes: Uint8Array, sql: string) {
  const SQL = await initSqlJs();
  const db = new SQL.Database(bytes);
  const rows = db.exec(sql)[0]?.values ?? [];
  db.close();
  return rows;
}

describe('KoboDatabase.mergeReadingDataFrom', () => {
  it('moves progress, annotations and collections without touching the account', async () => {
    const target = await openDatabase(await deviceDb());
    const source = await openDatabase(await backupDb());
    const report = target.mergeReadingDataFrom(source);
    const out = target.export();
    target.close();
    source.close();

    expect(report).toEqual({
      booksUpdated: 1,
      booksAdded: 1,
      annotationsAdded: 1,
      collectionsAdded: 1,
      collectionEntriesAdded: 2,
    });
    expect(
      await query(
        out,
        `SELECT ___PercentRead, ReadStatus, TimeSpentReading, ChapterIDBookmarked FROM content WHERE ContentID = '${A}'`,
      ),
    ).toEqual([[55, 1, 3600, 'OEBPS/ch3.xhtml']]);
    expect(await query(out, `SELECT ___PercentRead FROM content WHERE ContentID = '${A}!!ch1'`)).toEqual([
      [100],
    ]);
    expect(
      await query(
        out,
        `SELECT Title, ContentType FROM content WHERE ContentID LIKE '${B}%' ORDER BY ContentType`,
      ),
    ).toEqual([
      ['B', 6],
      ['Chapter', 9],
    ]);
    expect(await query(out, `SELECT Text, Annotation FROM Bookmark`)).toEqual([['A highlight', 'my note']]);
    expect(await query(out, `SELECT Name FROM Shelf`)).toEqual([['Favourites']]);
    expect((await query(out, `SELECT ContentId FROM ShelfContent ORDER BY ContentId`)).flat()).toEqual([
      A,
      B,
    ]);
    expect(await query(out, `SELECT UserID FROM user`)).toEqual([['NEW-ACCOUNT']]);
  });

  it('is idempotent and honours the per-category switches', async () => {
    const target = await openDatabase(await deviceDb());
    const source = await openDatabase(await backupDb());
    target.mergeReadingDataFrom(source, { annotations: false, collections: false });
    const second = target.mergeReadingDataFrom(source, { annotations: false, collections: false });
    const out = target.export();
    target.close();
    source.close();

    expect(second.booksAdded).toBe(0);
    expect(await query(out, 'SELECT COUNT(*) FROM Bookmark')).toEqual([[0]]);
    expect(await query(out, 'SELECT COUNT(*) FROM Shelf')).toEqual([[0]]);
  });
});

describe('restoreToDevice — merge mode', () => {
  it('merges into the device database instead of replacing it', async () => {
    const zip = await buildBackupZip({
      dbBytes: await backupDb(),
      metadata: meta(),
      bookEntries: [{ name: 'books/Author/B.kepub.epub' }],
    });
    const parsed = await parseBackupFile(zip);
    const dev = await freshDevice();
    await dev.writeText('.kobo/KoboReader.sqlite', await deviceDb());

    const res = await restoreToDevice(dev.handle, parsed, { mode: 'merge' });
    expect(res.mode).toBe('merge');
    expect(res.merge?.booksAdded).toBe(1);

    const written = new Uint8Array(
      await (await dev.fileAt('.kobo/KoboReader.sqlite')!.getFile()).arrayBuffer(),
    );
    expect(await query(written, 'SELECT UserID FROM user')).toEqual([['NEW-ACCOUNT']]);
    expect(await query(written, `SELECT ___PercentRead FROM content WHERE ContentID = '${A}'`)).toEqual([
      [55],
    ]);
    expect(dev.hasFile('Author/B.kepub.epub')).toBe(true);
  });

  it('falls back to a full restore when the device has no database yet', async () => {
    const zip = await buildBackupZip({ dbBytes: await backupDb(), metadata: meta() });
    const dev = await freshDevice();
    const res = await restoreToDevice(dev.handle, await parseBackupFile(zip), { mode: 'merge' });
    expect(res.mode).toBe('full');
  });

  it('refuses to merge while the device database has un-checkpointed changes', async () => {
    const zip = await buildBackupZip({ dbBytes: await backupDb(), metadata: meta() });
    const dev = await freshDevice();
    await dev.writeText('.kobo/KoboReader.sqlite', await deviceDb());
    await dev.writeText('.kobo/KoboReader.sqlite-wal', new Uint8Array(1024));
    await expect(
      restoreToDevice(dev.handle, await parseBackupFile(zip), { mode: 'merge' }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.RESTORE_DEVICE_BUSY,
    });
  });
});

describe('restoreToDevice — personalisation files', () => {
  it('puts back settings, fonts and screensavers only when asked, never other hidden paths', async () => {
    const zip = await buildBackupZip({
      dbBytes: await backupDb(),
      metadata: meta(),
      extraEntries: [
        { name: 'device/.kobo/Kobo/Kobo eReader.conf', content: '[Reading]' },
        { name: 'device/fonts/Literata.ttf', content: 'TTF' },
        { name: 'device/.kobo/KoboReader.sqlite', content: 'EVIL' },
      ],
    });
    const parsed = await parseBackupFile(zip);
    expect(parsed.extraFiles.map((f) => f.originalPath).sort()).toEqual([
      '.kobo/Kobo/Kobo eReader.conf',
      'fonts/Literata.ttf',
    ]);

    const dev = await freshDevice();
    const skipped = await restoreToDevice(dev.handle, parsed);
    expect(skipped.settingsRestored).toBe(0);
    expect(dev.hasFile('fonts/Literata.ttf')).toBe(false);

    const res = await restoreToDevice(dev.handle, parsed, { includeSettings: true });
    expect(res.settingsRestored).toBe(2);
    expect(await (await dev.fileAt('.kobo/Kobo/Kobo eReader.conf')!.getFile()).text()).toBe('[Reading]');
    expect(await (await dev.fileAt('.kobo/KoboReader.sqlite')!.getFile()).text()).not.toBe('EVIL');
  });
});
