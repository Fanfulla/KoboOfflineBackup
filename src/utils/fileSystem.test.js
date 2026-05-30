import { describe, it, expect } from 'vitest';
import { writeFileToPath } from './fileSystem.js';

describe('fileSystem.js - writeFileToPath path traversal guard', () => {
  // A dummy root handle that fails the test if the guard ever lets execution
  // reach a real filesystem call.
  const trap = {
    getFileHandle() { throw new Error('guard bypassed: getFileHandle called'); },
    getDirectoryHandle() { throw new Error('guard bypassed: getDirectoryHandle called'); },
  };

  it('rejects paths containing ".." segments', async () => {
    await expect(
      writeFileToPath(trap, 'books/../../../etc/passwd', new Blob(['x']))
    ).rejects.toThrow(/path traversal/i);
  });

  it('rejects backslash-encoded traversal', async () => {
    await expect(
      writeFileToPath(trap, 'books\\..\\..\\evil.txt', new Blob(['x']))
    ).rejects.toThrow(/path traversal/i);
  });
});
