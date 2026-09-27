import { describe, it, expect } from 'vitest';
import { coverCandidatePaths, getCoverFile, qhash } from './koboCovers.ts';
import { directorySource, fileListSource } from './deviceSource.ts';
import { freshDevice } from '../test/memoryFs.ts';

describe('qhash (Nickel .kobo-images sharding)', () => {
  // Known device paths reported on MobileRead for real books.
  it.each([
    ['file____mnt_onboard_Imports_Brandon_Sanderson_Shadows_Of_Self_-_Brandon_Sanderson_epub', 50, 121],
    ['ff0a942a-2f28-4aa2-ba97-318fce090264', 20, 244],
  ])('%s → %i/%i', (imageId, dir1, dir2) => {
    const h = qhash(imageId);
    expect(h & 0xff).toBe(dir1);
    expect((h & 0xff00) >> 8).toBe(dir2);
  });

  it('builds modern and legacy candidate paths, smallest thumbnail first', () => {
    const paths = coverCandidatePaths('ff0a942a-2f28-4aa2-ba97-318fce090264');
    expect(paths[0]).toBe(
      '.kobo-images/20/244/ff0a942a-2f28-4aa2-ba97-318fce090264 - N3_LIBRARY_GRID.parsed',
    );
    expect(paths).toContain('.kobo-images/20/244/ff0a942a-2f28-4aa2-ba97-318fce090264 - N3_FULL.parsed');
    expect(paths.some((p) => p.startsWith('.kobo/images/'))).toBe(true);
  });
});

describe('getCoverFile', () => {
  const id = 'ff0a942a-2f28-4aa2-ba97-318fce090264';

  it('finds a cover in the modern .kobo-images tree', async () => {
    const dev = await freshDevice();
    await dev.writeText(`.kobo-images/20/244/${id} - N3_LIBRARY_FULL.parsed`, 'JPEG');
    const file = await getCoverFile(directorySource(dev.handle), id);
    expect(await file?.text()).toBe('JPEG');
  });

  it('falls back to the legacy .kobo/images folder', async () => {
    const dev = await freshDevice();
    await dev.writeText(`.kobo/images/${id} - N3_LIBRARY_GRID.parsed`, 'OLD');
    expect(await (await getCoverFile(directorySource(dev.handle), id))?.text()).toBe('OLD');
  });

  it('works with a plain file list (webkitdirectory fallback)', async () => {
    const f = new File(['FL'], `${id} - N3_FULL.parsed`);
    Object.defineProperty(f, 'webkitRelativePath', {
      value: `KOBOeReader/.kobo-images/20/244/${id} - N3_FULL.parsed`,
    });
    expect(await (await getCoverFile(fileListSource([f]), id))?.text()).toBe('FL');
  });

  it('returns null when missing or without an id', async () => {
    const dev = await freshDevice();
    expect(await getCoverFile(directorySource(dev.handle), id)).toBeNull();
    expect(await getCoverFile(directorySource(dev.handle), null)).toBeNull();
    expect(await getCoverFile(null, id)).toBeNull();
  });
});
