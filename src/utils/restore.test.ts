import { describe, it, expect, vi } from 'vitest';
import { buildBackupZip, buildKoboDb, meta } from '../test/builders.ts';

vi.mock('sql.js', async (importOriginal) =>
  (await import('../test/sqlJsNode.ts')).sqlJsNodeMock(importOriginal as never),
);

const { checkCompatibility, parseBackupFile, previewBackup } = await import('./restore.ts');

describe('checkCompatibility', () => {
  it('warns when restoring a database from a newer schema onto an older firmware', () => {
    const result = checkCompatibility(
      meta({ device: { model: 'Kobo Libra 2', firmwareVersion: '4.41', schemaVersion: 180 } }),
      {
        model: 'Kobo Libra 2',
        firmwareVersion: '4.38',
        schemaVersion: 170,
      },
    );
    expect(result.warnings.some((w) => w.code === 'schema-newer')).toBe(true);
    expect(result.warnings.some((w) => w.code === 'firmware')).toBe(true);
  });

  it('reports no warnings for the same device and schema', () => {
    const created = new Date().toISOString();
    const result = checkCompatibility(
      meta({ created, device: { model: 'Kobo Sage', firmwareVersion: '4.41', schemaVersion: 176 } }),
      { model: 'Kobo Sage', firmwareVersion: '4.41', schemaVersion: 176 },
    );
    expect(result.warnings).toEqual([]);
  });

  it('flags a different model', () => {
    const created = new Date().toISOString();
    const result = checkCompatibility(
      meta({ created, device: { model: 'Kobo Clara HD', firmwareVersion: '4.41', schemaVersion: 1 } }),
      {
        model: 'Kobo Libra 2',
        firmwareVersion: '4.41',
        schemaVersion: 1,
      },
    );
    expect(result.warnings.map((w) => w.code)).toEqual(['model']);
  });
});

describe('previewBackup', () => {
  it('computes reading statistics from the backup database, not from (possibly wrong) metadata', async () => {
    const dbBytes = await buildKoboDb([
      { contentId: 'file:///mnt/onboard/a.epub', title: 'A', time: 7200, percent: 100 },
      { contentId: 'file:///mnt/onboard/b.epub', title: 'B', time: 0, percent: 0 },
    ]);
    // Old backups stored seconds in a field labelled minutes.
    const zip = await buildBackupZip({
      dbBytes,
      metadata: meta({ statistics: { totalBooks: 2, totalAnnotations: 0, totalReadingTime: 7200 } }),
    });
    const preview = previewBackup(await parseBackupFile(zip));
    expect(preview.statistics.totalReadingTime).toBe(120);
    expect(preview.statistics.booksFinished).toBe(1);
    expect(preview.statistics.totalBooks).toBe(2);
  });
});
