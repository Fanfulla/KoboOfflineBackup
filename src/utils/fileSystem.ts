/**
 * File System Access API utilities.
 */

import { FileSystemError, ERROR_CODES } from './errors.ts';

export interface DeviceFile {
  handle: FileSystemFileHandle;
  path: string;
  name: string;
}

/** Folders never descended into while scanning (hidden/system). */
function isSkippedDirectory(name: string): boolean {
  return name.startsWith('.') || name === 'System Volume Information';
}

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

export function selectKoboDirectory(): Promise<FileSystemDirectoryHandle | null> {
  return selectDirectory({ id: 'kobo-device' });
}

/** Read a file handle fully into memory. */
export async function readFile(fileHandle: FileSystemFileHandle): Promise<ArrayBuffer> {
  try {
    return await (await fileHandle.getFile()).arrayBuffer();
  } catch (error) {
    throw new FileSystemError('Failed to read file', ERROR_CODES.FS_READ_ERROR, {
      filename: fileHandle.name,
      originalError: error,
    });
  }
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

/** Recursively list files, skipping hidden and system folders. */
export async function getAllFiles(dirHandle: FileSystemDirectoryHandle, path = ''): Promise<DeviceFile[]> {
  const files: DeviceFile[] = [];

  try {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.kind === 'file') {
        files.push({ handle: entry, path: entryPath, name: entry.name });
      } else if (!isSkippedDirectory(entry.name)) {
        files.push(...(await getAllFiles(entry, entryPath)));
      }
    }
  } catch (error) {
    console.error('Error reading directory:', path || '/', error);
  }

  return files;
}

function splitPath(path: string): string[] {
  return path.replace(/\\/g, '/').split('/').filter(Boolean);
}

/** Get a file handle by relative path (e.g. ".kobo/KoboReader.sqlite"). */
export async function getFileByPath(
  dirHandle: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle> {
  try {
    const parts = splitPath(path);
    const fileName = parts.pop()!;
    let current = dirHandle;
    for (const part of parts) current = await current.getDirectoryHandle(part);
    return await current.getFileHandle(fileName);
  } catch (error) {
    throw new FileSystemError(`File not found: ${path}`, ERROR_CODES.FS_NOT_FOUND, {
      path,
      originalError: error,
    });
  }
}

/** Get a directory handle by relative path (e.g. ".kobo"). */
export async function getDirectoryByPath(
  dirHandle: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemDirectoryHandle> {
  try {
    let current = dirHandle;
    for (const part of splitPath(path)) current = await current.getDirectoryHandle(part);
    return current;
  } catch (error) {
    throw new FileSystemError(`Directory not found: ${path}`, ERROR_CODES.FS_NOT_FOUND, {
      path,
      originalError: error,
    });
  }
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
