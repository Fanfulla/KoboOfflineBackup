/**
 * File System Access API utilities for Kobo Backup Manager
 * Wraps browser File System Access API with fallbacks
 */

import { directoryOpen, fileSave } from 'browser-fs-access';
import { FileSystemError, ERROR_CODES } from './errors.js';

/**
 * Select a directory using File System Access API
 * @param {object} options - Selection options
 * @returns {Promise<FileSystemDirectoryHandle>} Directory handle
 */
export async function selectDirectory(options = {}) {
  try {
    if ('showDirectoryPicker' in window) {
      // Modern File System Access API
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
        startIn: 'desktop',
        ...options,
      });
      return dirHandle;
    } else {
      // Fallback using browser-fs-access
      const dirHandle = await directoryOpen({
        mode: 'read',
        ...options,
      });
      return dirHandle;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return null; // User cancelled
    }
    throw new FileSystemError(
      'Failed to select directory',
      ERROR_CODES.FS_PERMISSION_DENIED,
      { originalError: error }
    );
  }
}

/**
 * Select the Kobo device directory
 * @returns {Promise<FileSystemDirectoryHandle>} Kobo directory handle
 */
export async function selectKoboDirectory() {
  const dirHandle = await selectDirectory({
    id: 'kobo-device',
  });
  return dirHandle;
}

/**
 * Read a file as ArrayBuffer
 * @param {FileSystemFileHandle} fileHandle - File handle to read
 * @returns {Promise<ArrayBuffer>} File contents as ArrayBuffer
 */
export async function readFile(fileHandle) {
  try {
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    throw new FileSystemError(
      'Failed to read file',
      ERROR_CODES.FS_READ_ERROR,
      { filename: fileHandle.name, originalError: error }
    );
  }
}

/**
 * Read a file as text
 * @param {FileSystemFileHandle} fileHandle - File handle to read
 * @returns {Promise<string>} File contents as text
 */
export async function readFileAsText(fileHandle) {
  try {
    const file = await fileHandle.getFile();
    const text = await file.text();
    return text;
  } catch (error) {
    throw new FileSystemError(
      'Failed to read file as text',
      ERROR_CODES.FS_READ_ERROR,
      { filename: fileHandle.name, originalError: error }
    );
  }
}

/**
 * Read a file as Blob
 * @param {FileSystemFileHandle} fileHandle - File handle to read
 * @returns {Promise<Blob>} File contents as Blob
 */
export async function readFileAsBlob(fileHandle) {
  try {
    const file = await fileHandle.getFile();
    return file;
  } catch (error) {
    throw new FileSystemError(
      'Failed to read file as blob',
      ERROR_CODES.FS_READ_ERROR,
      { filename: fileHandle.name, originalError: error }
    );
  }
}

/**
 * Get file metadata (size, modified date, etc.)
 * @param {FileSystemFileHandle} fileHandle - File handle
 * @returns {Promise<{name: string, size: number, lastModified: Date}>} File metadata
 */
export async function getFileMetadata(fileHandle) {
  try {
    const file = await fileHandle.getFile();
    return {
      name: file.name,
      size: file.size,
      lastModified: new Date(file.lastModified),
      type: file.type,
    };
  } catch (error) {
    throw new FileSystemError(
      'Failed to get file metadata',
      ERROR_CODES.FS_READ_ERROR,
      { filename: fileHandle.name, originalError: error }
    );
  }
}

/**
 * Save a file to the user's system
 * @param {Blob} blob - Blob to save
 * @param {object} options - Save options
 * @returns {Promise<{filename: string, size: number}>} Save result
 */
export async function saveFile(blob, options = {}) {
  try {
    const { fileName = 'download.zip', extensions = ['.zip'] } = options;

    console.log('[FS] Saving file via download link:', { fileName, size: blob.size });

    // Use direct download link instead of showSaveFilePicker
    // This avoids SecurityError when called after async operations
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    console.log('[FS] Download triggered successfully');
    return {
      filename: fileName,
      size: blob.size,
    };
  } catch (error) {
    console.error('[FS ERROR] saveFile failed:', error);
    console.error('[FS ERROR] Error name:', error.name);
    console.error('[FS ERROR] Error message:', error.message);

    throw new FileSystemError(
      'Failed to save file',
      ERROR_CODES.FS_WRITE_ERROR,
      { originalError: error }
    );
  }
}

/**
 * Get all files in a directory (recursive)
 * @param {FileSystemDirectoryHandle} dirHandle - Directory handle
 * @param {string} path - Current path (for recursion)
 * @returns {Promise<Array<{handle: FileSystemFileHandle, path: string}>>} Array of file handles with paths
 */
export async function getAllFiles(dirHandle, path = '') {
  const files = [];

  try {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      if (entry.kind === 'file') {
        files.push({
          handle: entry,
          path: entryPath,
          name: entry.name,
        });
      } else if (entry.kind === 'directory') {
        // Skip hidden directories and system folders
        if (!entry.name.startsWith('.') && entry.name !== 'System Volume Information') {
          const subFiles = await getAllFiles(entry, entryPath);
          files.push(...subFiles);
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }

  return files;
}

/**
 * Get a specific file from directory by path
 * @param {FileSystemDirectoryHandle} dirHandle - Directory handle
 * @param {string} path - Path to file (e.g., ".kobo/KoboReader.sqlite")
 * @returns {Promise<FileSystemFileHandle>} File handle
 */
export async function getFileByPath(dirHandle, path) {
  try {
    const parts = path.split('/');
    let current = dirHandle;

    // Navigate through directories
    for (let i = 0; i < parts.length - 1; i++) {
      current = await current.getDirectoryHandle(parts[i]);
    }

    // Get the file
    const fileName = parts[parts.length - 1];
    const fileHandle = await current.getFileHandle(fileName);
    return fileHandle;
  } catch (error) {
    throw new FileSystemError(
      `File not found: ${path}`,
      ERROR_CODES.FS_NOT_FOUND,
      { path, originalError: error }
    );
  }
}

/**
 * Get a specific directory from directory by path
 * @param {FileSystemDirectoryHandle} dirHandle - Directory handle
 * @param {string} path - Path to directory (e.g., ".kobo")
 * @returns {Promise<FileSystemDirectoryHandle>} Directory handle
 */
export async function getDirectoryByPath(dirHandle, path) {
  try {
    const parts = path.split('/');
    let current = dirHandle;

    for (const part of parts) {
      if (part) {
        current = await current.getDirectoryHandle(part);
      }
    }

    return current;
  } catch (error) {
    throw new FileSystemError(
      `Directory not found: ${path}`,
      ERROR_CODES.FS_NOT_FOUND,
      { path, originalError: error }
    );
  }
}

/**
 * Write data to a file
 * @param {FileSystemDirectoryHandle} dirHandle - Parent directory
 * @param {string} filename - Name of file to write
 * @param {Blob|ArrayBuffer|string} data - Data to write
 * @returns {Promise<void>}
 */
export async function writeFile(dirHandle, filename, data) {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();

    await writable.write(data);
    await writable.close();
  } catch (error) {
    throw new FileSystemError(
      'Failed to write file',
      ERROR_CODES.FS_WRITE_ERROR,
      { filename, originalError: error }
    );
  }
}

/**
 * Write data to a file at a specific path, creating directories as needed
 * @param {FileSystemDirectoryHandle} rootHandle - Root directory handle
 * @param {string} filePath - Path to file (e.g., "Libri/subfolder/book.epub")
 * @param {Blob|ArrayBuffer|string} data - Data to write
 * @returns {Promise<void>}
 */
export async function writeFileToPath(rootHandle, filePath, data) {
  try {
    // Normalize path separators and remove leading slash
    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\//, '');
    const parts = normalizedPath.split('/');
    const filename = parts.pop();
    
    // Navigate/create directories
    let currentDir = rootHandle;
    for (const dirName of parts) {
      if (dirName && dirName !== '.') {
        currentDir = await currentDir.getDirectoryHandle(dirName, { create: true });
      }
    }
    
    // Write the file
    await writeFile(currentDir, filename, data);
  } catch (error) {
    throw new FileSystemError(
      `Failed to write file at path: ${filePath}`,
      ERROR_CODES.FS_WRITE_ERROR,
      { filePath, originalError: error }
    );
  }
}

/**
 * Check if File System Access API is supported
 * @returns {boolean} True if supported
 */
export function isFileSystemAccessSupported() {
  return 'showDirectoryPicker' in window || typeof directoryOpen === 'function';
}
