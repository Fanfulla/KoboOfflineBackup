/**
 * Hook for File System Access API operations
 */

import { useState, useCallback } from 'react';
import { selectKoboDirectory, getAllFiles, getFileByPath } from '../utils/fileSystem.js';
import { isValidKoboDirectory } from '../utils/validation.js';

/**
 * Hook to manage file system access
 * @returns {object} File system utilities and state
 */
export function useFileSystem() {
  const [directory, setDirectory] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Select a directory using File System Access API
   */
  const selectDirectory = useCallback(async () => {
    setIsSelecting(true);
    setError(null);

    try {
      const dirHandle = await selectKoboDirectory();

      if (dirHandle) {
        // Validate it's a Kobo directory
        const isValid = await isValidKoboDirectory(dirHandle);

        if (!isValid) {
          setError({
            title: 'Not a Kobo Device',
            message: 'Please select your Kobo drive (usually named "KOBOeReader")',
            code: 'INVALID_DEVICE',
          });
          setDirectory(null);
          return null;
        }

        setDirectory(dirHandle);
        return dirHandle;
      }

      return null;
    } catch (err) {
      setError({
        title: 'Selection Failed',
        message: err.message || 'Failed to select directory',
        code: err.code || 'UNKNOWN',
      });
      return null;
    } finally {
      setIsSelecting(false);
    }
  }, []);

  /**
   * Get all files from selected directory
   */
  const getFiles = useCallback(async () => {
    if (!directory) {
      throw new Error('No directory selected');
    }

    return await getAllFiles(directory);
  }, [directory]);

  /**
   * Get a specific file by path
   */
  const getFile = useCallback(async (path) => {
    if (!directory) {
      throw new Error('No directory selected');
    }

    return await getFileByPath(directory, path);
  }, [directory]);

  /**
   * Clear selected directory
   */
  const clearDirectory = useCallback(() => {
    setDirectory(null);
    setError(null);
  }, []);

  return {
    directory,
    isSelecting,
    error,
    selectDirectory,
    getFiles,
    getFile,
    clearDirectory,
    hasDirectory: directory !== null,
  };
}
