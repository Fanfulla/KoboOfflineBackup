/**
 * File System Access API utilities.
 */

import { FileSystemError, ERROR_CODES } from './errors.ts';

/**
 * Let the user pick a directory. Returns null if the dialog is dismissed.
 */
export async function selectDirectory(
  options: DirectoryPickerOptions = {},
): Promise<FileSystemDirectoryHandle | null> {
  if (!('showDirectoryPicker' in window)) {
    throw new FileSystemError(
      'This browser does not support the File System Access API',
      ERROR_CODES.FS_NOT_SUPPORTED,
    );
  }
  try {
    return await window.showDirectoryPicker({ mode: 'read', startIn: 'desktop', ...options });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null;
    throw new FileSystemError('Failed to select directory', ERROR_CODES.FS_PERMISSION_DENIED, {
      originalError: error,
    });
  }
}

/**
 * Pick the Kobo drive. Restores ask for "readwrite" up front so the browser
 * shows a single permission prompt instead of failing midway.
 */
export function selectKoboDirectory(
  mode: FileSystemPermissionMode = 'read',
): Promise<FileSystemDirectoryHandle | null> {
  return selectDirectory({ id: 'kobo-device', mode });
}

/** Trigger a browser download for an in-memory blob. */
export function downloadBlob(blob: Blob, fileName: string): { filename: string; size: number } {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 100);
  return { filename: fileName, size: blob.size };
}

function splitPath(path: string): string[] {
  return path.replace(/\\/g, '/').split('/').filter(Boolean);
}

/** Write data to a file inside a directory (creating/overwriting it). */
export async function writeFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  data: FileSystemWriteChunkType,
): Promise<void> {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  } catch (error) {
    throw new FileSystemError('Failed to write file', ERROR_CODES.FS_WRITE_ERROR, {
      filename,
      originalError: error,
    });
  }
}

/**
 * Write data at a relative path, creating intermediate directories.
 * Rejects path traversal so a crafted backup can never escape the device root.
 */
export async function writeFileToPath(
  rootHandle: FileSystemDirectoryHandle,
  filePath: string,
  data: FileSystemWriteChunkType,
): Promise<void> {
  const parts = splitPath(filePath);

  // SECURITY: a malicious or corrupt backup ZIP could embed entries like
  // "books/../../../etc/passwd". The File System Access API also rejects
  // "." / "..", but we fail fast and explicitly here.
  if (parts.some((p) => p === '..' || p === '.')) {
    throw new FileSystemError(
      `Unsafe path rejected (path traversal): ${filePath}`,
      ERROR_CODES.FS_WRITE_ERROR,
      {
        filePath,
      },
    );
  }

  try {
    const filename = parts.pop()!;
    let currentDir = rootHandle;
    for (const dirName of parts) currentDir = await currentDir.getDirectoryHandle(dirName, { create: true });
    await writeFile(currentDir, filename, data);
  } catch (error) {
    if (error instanceof FileSystemError) throw error;
    throw new FileSystemError(`Failed to write file at path: ${filePath}`, ERROR_CODES.FS_WRITE_ERROR, {
      filePath,
      originalError: error,
    });
  }
}
