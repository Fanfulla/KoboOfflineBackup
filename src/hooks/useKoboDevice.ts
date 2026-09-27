import { useState, useCallback } from 'react';
import { getFileByPath, readFile, getAllFiles } from '../utils/fileSystem.ts';
import { extractAllData } from '../utils/koboDatabase.ts';
import { isValidBookFile } from '../utils/validation.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import type { BookFileEntry, ScanResult, UiError } from '../types/kobo.ts';

export interface ScanProgress {
  stage: string;
  current: number;
  total: number;
}

const IDLE: ScanProgress = { stage: '', current: 0, total: 0 };

/** Scan a Kobo device: database + book files. */
export function useKoboDevice() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>(IDLE);
  const [error, setError] = useState<UiError | null>(null);

  const scanDevice = useCallback(async (dirHandle: FileSystemDirectoryHandle): Promise<ScanResult> => {
    setIsScanning(true);
    setError(null);
    const step = (current: number, stage: string) => setScanProgress({ stage, current, total: 4 });

    try {
      step(1, 'Reading database...');
      const database = await readFile(await getFileByPath(dirHandle, '.kobo/KoboReader.sqlite'));

      step(2, 'Analyzing books...');
      const extracted = await extractAllData(database);

      step(3, 'Finding book files...');
      const candidates = (await getAllFiles(dirHandle)).filter((file) => isValidBookFile(file.name));
      // File size only (metadata, no content read) so the size estimate is accurate.
      const bookFiles: BookFileEntry[] = await Promise.all(
        candidates.map(async (file) => {
          try {
            return { ...file, size: (await file.handle.getFile()).size };
          } catch {
            return { ...file, size: 0 };
          }
        }),
      );

      step(4, 'Scan complete');
      return {
        books: extracted.books,
        annotations: extracted.annotations,
        stats: extracted.stats,
        deviceInfo: extracted.deviceInfo,
        bookFiles,
        database,
      };
    } catch (err) {
      setError({
        title: 'Scan Failed',
        message: errorMessage(err, 'Failed to scan Kobo device'),
        code: errorCode(err, 'SCAN_FAILED'),
      });
      throw err;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearDevice = useCallback(() => {
    setError(null);
    setScanProgress(IDLE);
  }, []);

  return { isScanning, scanProgress, error, scanDevice, clearDevice };
}
