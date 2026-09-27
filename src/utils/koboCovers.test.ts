import { describe, it, expect, vi } from 'vitest';
import { getCoverFile } from './koboCovers.ts';
import { getDirectoryByPath } from './fileSystem.ts';

vi.mock('./fileSystem.ts', () => ({ getDirectoryByPath: vi.fn() }));

const asDir = (value: unknown) => value as FileSystemDirectoryHandle;

describe('koboCovers.ts - Cover Extractor', () => {
  it('returns null if deviceHandle or coverId is missing', async () => {
    expect(await getCoverFile(null, 'test-id')).toBeNull();
    expect(await getCoverFile(asDir({}), null)).toBeNull();
  });

  it('looks up the cover with suffixes and returns the file if found', async () => {
    const mockFile = new File(['mock-content'], 'cover.parsed', { type: 'image/jpeg' });
    const mockImagesDir = {
      getFileHandle: vi.fn((filename: string) =>
        filename === 'my-cover-id - N3_LIBRARY_GRID.parsed'
          ? Promise.resolve({ getFile: () => Promise.resolve(mockFile) })
          : Promise.reject(new Error('File not found')),
      ),
    };
    vi.mocked(getDirectoryByPath).mockResolvedValue(asDir(mockImagesDir));

    const device = asDir({});
    const resultFile = await getCoverFile(device, 'my-cover-id');

    expect(getDirectoryByPath).toHaveBeenCalledWith(device, '.kobo/images');
    expect(mockImagesDir.getFileHandle).toHaveBeenCalledWith('my-cover-id - N3_LIBRARY_GRID.parsed');
    expect(resultFile).toBe(mockFile);
  });

  it('returns null if the cover file does not exist under any suffix', async () => {
    const mockImagesDir = { getFileHandle: vi.fn().mockRejectedValue(new Error('File not found')) };
    vi.mocked(getDirectoryByPath).mockResolvedValue(asDir(mockImagesDir));

    expect(await getCoverFile(asDir({}), 'invalid-cover-id')).toBeNull();
    expect(mockImagesDir.getFileHandle).toHaveBeenCalledTimes(5);
  });
});
