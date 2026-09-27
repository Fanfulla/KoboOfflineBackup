import { describe, it, expect, vi } from 'vitest';
import { buildKoboDb } from '../test/builders.ts';
import { freshDevice } from '../test/memoryFs.ts';
import { directorySource } from './deviceSource.ts';

vi.mock('sql.js', async (importOriginal) =>
  (await import('../test/sqlJsNode.ts')).sqlJsNodeMock(importOriginal as never),
);

const { scanKoboDevice, isPersonalisationPath } = await import('./scan.ts');

async function deviceWithLibrary() {
  const dev = await freshDevice();
  await dev.writeText(
    '.kobo/KoboReader.sqlite',
    await buildKoboDb(
      [{ contentId: 'file:///mnt/onboard/Author/Book.kepub.epub', title: 'Book', time: 600 }],
      [],
      {
        dbVersion: 176,
        users: 1,
      },
    ),
  );
  await dev.writeText(
    '.kobo/version',
    'SN,4.1.15,4.41.23145,4.1.15,4.1.15,00000000-0000-0000-0000-000000000388',
  );
  await dev.writeText('Author/Book.kepub.epub', 'EPUB');
  await dev.writeText('Author/cover.jpg', 'JPG');
  await dev.writeText('.kobo-images/1/2/x - N3_FULL.parsed', 'IMG');
  return dev;
}

describe('scanKoboDevice', () => {
  it('reads database, device model/firmware and book files (skipping hidden folders)', async () => {
    const dev = await deviceWithLibrary();
    const steps: number[] = [];
    const result = await scanKoboDevice(directorySource(dev.handle), (step) => steps.push(step));

    expect(steps).toEqual([1, 2, 3, 4]);
    expect(result.books).toHaveLength(1);
    expect(result.books[0]!.TimeSpentReading).toBe(10);
    expect(result.deviceInfo).toMatchObject({
      model: 'Kobo Libra 2',
      firmwareVersion: '4.41.23145',
      schemaVersion: 176,
    });
    expect(result.bookFiles.map((f) => f.path)).toEqual(['Author/Book.kepub.epub']);
    expect(result.bookFiles[0]!.size).toBe(4);
    expect(result.extraFiles).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('collects settings, custom fonts and screensavers as personalisation files', async () => {
    const dev = await deviceWithLibrary();
    await dev.writeText('.kobo/Kobo/Kobo eReader.conf', '[Reading]\nfont=Literata');
    await dev.writeText('fonts/Literata-Regular.ttf', 'TTF');
    await dev.writeText('fonts/readme.txt', 'not a font');
    await dev.writeText('.kobo/screensaver/cat.png', 'PNG');
    const result = await scanKoboDevice(directorySource(dev.handle));
    expect(result.extraFiles.map((f) => f.path).sort()).toEqual([
      '.kobo/Kobo/Kobo eReader.conf',
      '.kobo/screensaver/cat.png',
      'fonts/Literata-Regular.ttf',
    ]);
  });

  it('warns when an un-checkpointed WAL file is present (recent changes not in the main DB file)', async () => {
    const dev = await deviceWithLibrary();
    await dev.writeText('.kobo/KoboReader.sqlite-wal', new Uint8Array(4096));
    expect((await scanKoboDevice(directorySource(dev.handle))).warnings).toContain('wal-pending');
  });

  it('ignores an empty WAL file', async () => {
    const dev = await deviceWithLibrary();
    await dev.writeText('.kobo/KoboReader.sqlite-wal', new Uint8Array(0));
    expect((await scanKoboDevice(directorySource(dev.handle))).warnings).toEqual([]);
  });

  it('fails clearly when the database is missing', async () => {
    const dev = await freshDevice();
    await expect(scanKoboDevice(directorySource(dev.handle))).rejects.toThrow(/KoboReader\.sqlite/);
  });
});

describe('isPersonalisationPath', () => {
  it.each([
    ['.kobo/Kobo/Kobo eReader.conf', true],
    ['fonts/A.otf', true],
    ['fonts/sub/A.ttf', true],
    ['.kobo/screensaver/a.jpg', true],
    ['.kobo/KoboReader.sqlite', false],
    ['.kobo/Kobo/other.conf', false],
    ['fonts/../.kobo/KoboReader.sqlite', false],
  ])('%s → %s', (path, expected) => {
    expect(isPersonalisationPath(path)).toBe(expected);
  });
});
