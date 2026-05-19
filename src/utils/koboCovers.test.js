import { describe, it, expect, vi } from 'vitest';
import { getCoverFile, getCoverUrl } from './koboCovers.js';
import { getDirectoryByPath } from './fileSystem.js';

// Mock getDirectoryByPath from fileSystem.js
vi.mock('./fileSystem.js', () => ({
  getDirectoryByPath: vi.fn()
}));

describe('koboCovers.js - Cover Extractor', () => {
  it('should return null if deviceHandle or coverId is missing', async () => {
    expect(await getCoverFile(null, 'test-id')).toBeNull();
    expect(await getCoverFile({}, null)).toBeNull();
  });

  it('should look up cover with suffixes and return the mock file if found', async () => {
    const mockFile = new File(['mock-content'], 'test-cover-N3_LIBRARY_GRID.parsed', { type: 'image/jpeg' });
    
    // Create mock FileHandle
    const mockFileHandle = {
      getFile: vi.fn().mockResolvedValue(mockFile)
    };

    // Create mock DirectoryHandle for .kobo/images
    const mockImagesDir = {
      getFileHandle: vi.fn().mockImplementation((filename) => {
        if (filename === 'my-cover-id - N3_LIBRARY_GRID.parsed') {
          return Promise.resolve(mockFileHandle);
        }
        return Promise.reject(new Error('File not found'));
      })
    };

    // Make getDirectoryByPath return our mockImagesDir
    vi.mocked(getDirectoryByPath).mockResolvedValue(mockImagesDir);

    const mockDeviceHandle = {};
    const resultFile = await getCoverFile(mockDeviceHandle, 'my-cover-id');

    expect(getDirectoryByPath).toHaveBeenCalledWith(mockDeviceHandle, '.kobo/images');
    expect(mockImagesDir.getFileHandle).toHaveBeenCalledWith('my-cover-id - N3_LIBRARY_GRID.parsed');
    expect(resultFile).toBe(mockFile);
  });

  it('should return null if the cover file does not exist under any suffix', async () => {
    const mockImagesDir = {
      getFileHandle: vi.fn().mockRejectedValue(new Error('File not found'))
    };

    vi.mocked(getDirectoryByPath).mockResolvedValue(mockImagesDir);

    const mockDeviceHandle = {};
    const resultFile = await getCoverFile(mockDeviceHandle, 'invalid-cover-id');

    expect(resultFile).toBeNull();
    expect(mockImagesDir.getFileHandle).toHaveBeenCalledTimes(5); // Checked all 5 suffixes
  });
});
