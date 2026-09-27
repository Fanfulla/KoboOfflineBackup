import { useState, useCallback } from 'react';
import { selectKoboDirectory } from '../utils/fileSystem.ts';
import { isValidKoboDirectory } from '../utils/validation.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import type { UiError } from '../types/kobo.ts';

/** Pick and validate the Kobo device folder. */
export function useFileSystem() {
  const [directory, setDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const selectDirectory = useCallback(async (): Promise<FileSystemDirectoryHandle | null> => {
    setIsSelecting(true);
    setError(null);
    try {
      const dirHandle = await selectKoboDirectory();
      if (!dirHandle) return null;

      if (!(await isValidKoboDirectory(dirHandle))) {
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
    } catch (err) {
      setError({
        title: 'Selection Failed',
        message: errorMessage(err, 'Failed to select directory'),
        code: errorCode(err, 'UNKNOWN'),
      });
      return null;
    } finally {
      setIsSelecting(false);
    }
  }, []);

  const clearDirectory = useCallback(() => {
    setDirectory(null);
    setError(null);
  }, []);

  return { directory, isSelecting, error, selectDirectory, clearDirectory, hasDirectory: directory !== null };
}
