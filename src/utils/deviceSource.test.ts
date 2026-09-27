import { describe, it, expect } from 'vitest';
import { directorySource, fileListSource } from './deviceSource.ts';
import { freshDevice } from '../test/memoryFs.ts';

function relFile(path: string, content = 'x'): File {
  const f = new File([content], path.split('/').pop()!);
  Object.defineProperty(f, 'webkitRelativePath', { value: path });
  return f;
}

describe('directorySource', () => {
  it('reads nested files and lists non-hidden files by default', async () => {
    const dev = await freshDevice();
    await dev.writeText('.kobo/KoboReader.sqlite', 'DB');
    await dev.writeText('A/b.epub', 'BOOK');
    await dev.writeText('fonts/My.ttf', 'FONT');
    const src = directorySource(dev.handle);

    expect(await (await src.getFile('.kobo/KoboReader.sqlite'))?.text()).toBe('DB');
    expect(await src.getFile('missing/file')).toBeNull();
    expect((await src.listFiles()).map((f) => f.path).sort()).toEqual(['A/b.epub', 'fonts/My.ttf']);
    expect((await src.listFiles({ under: '.kobo', includeHidden: true })).map((f) => f.path)).toEqual([
      '.kobo/KoboReader.sqlite',
    ]);
  });
});

describe('fileListSource', () => {
  it('strips the picked folder name and mirrors directorySource', async () => {
    const src = fileListSource([
      relFile('KOBOeReader/.kobo/KoboReader.sqlite', 'DB'),
      relFile('KOBOeReader/A/b.epub', 'BOOK'),
      relFile('KOBOeReader/.kobo-images/1/2/x.parsed'),
    ]);
    expect(src.kind).toBe('files');
    expect(await (await src.getFile('.kobo/KoboReader.sqlite'))?.text()).toBe('DB');
    expect((await src.listFiles()).map((f) => f.path)).toEqual(['A/b.epub']);
    const [book] = await src.listFiles();
    expect(book!.size).toBe(4);
    expect(await (await book!.getFile()).text()).toBe('BOOK');
  });
});
