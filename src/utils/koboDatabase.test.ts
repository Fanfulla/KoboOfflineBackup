import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildKoboDb, fixture } from '../test/builders.ts';

vi.mock('sql.js', async (importOriginal) =>
  (await import('../test/sqlJsNode.ts')).sqlJsNodeMock(importOriginal as never),
);

const { openDatabase, extractAllData } = await import('./koboDatabase.ts');
const initSqlJs = (await import('sql.js')).default;

describe('koboDatabase — reading time units', () => {
  it('converts Kobo TimeSpentReading (seconds) to minutes per book and in stats', async () => {
    const bytes = await buildKoboDb([
      { contentId: 'file:///mnt/onboard/a.epub', title: 'A', time: 31207, percent: 100 },
      { contentId: 'file:///mnt/onboard/b.epub', title: 'B', time: 1551, percent: 1 },
    ]);
    const data = await extractAllData(bytes.buffer);
    const a = data.books.find((b) => b.Title === 'A')!;
    expect(a.TimeSpentReading).toBe(520); // 31207 s ≈ 8h 40m, not 520 hours
    expect(data.stats.totalMinutesRead).toBe(Math.round((31207 + 1551) / 60));
  });

  const REAL_DB = fixture('KoboReader.sqlite');
  it.skipIf(!REAL_DB)('real device database: total minutes equals raw seconds / 60', async () => {
    const buf = readFileSync(REAL_DB!);
    const SQL = await initSqlJs();
    const raw = new SQL.Database(buf);
    const rawSeconds = Number(
      raw.exec(`SELECT SUM(TimeSpentReading) FROM content WHERE ContentType = 6 AND ContentID LIKE 'file://%'
                AND LOWER(IsDownloaded) = 'true' AND (BookTitle IS NULL OR BookTitle = '')`)[0]!
        .values[0]![0],
    );
    raw.close();
    const data = await extractAllData(new Uint8Array(buf).buffer);
    expect(data.stats.totalMinutesRead).toBe(Math.round(rawSeconds / 60));
    expect(data.stats.totalBooks).toBe(data.books.length);
  });
});

describe('koboDatabase — schema version', () => {
  it('reads the Kobo schema version from the DbVersion table', async () => {
    const db = await openDatabase(await buildKoboDb([], [], { dbVersion: 176 }));
    expect(db.getSchemaVersion()).toBe(176);
    db.close();
  });

  it('falls back to 0 when DbVersion is missing', async () => {
    const db = await openDatabase(await buildKoboDb());
    expect(db.getSchemaVersion()).toBe(0);
    db.close();
  });
});

describe('koboDatabase — sanitize()', () => {
  it('switches a WAL-mode database file to rollback journal mode', async () => {
    const bytes = await buildKoboDb([{ contentId: 'file:///mnt/onboard/a.epub', title: 'A' }]);
    // Bytes 18/19 of the SQLite header are the file format write/read versions: 2 = WAL.
    bytes[18] = 2;
    bytes[19] = 2;
    const db = await openDatabase(bytes);
    db.sanitize();
    const out = db.export();
    db.close();
    expect([out[18], out[19]]).toEqual([1, 1]);
  });
});
