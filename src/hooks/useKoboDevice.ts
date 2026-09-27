import { useState, useCallback } from 'react';
import { scanKoboDevice, SCAN_STEPS } from '../utils/scan.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import type { ScanResult, UiError } from '../types/kobo.ts';

export interface ScanProgress {
  /** 1 = reading database, 2 = analyzing books, 3 = finding files, 4 = done. */
  current: number;
  total: number;
}

const IDLE: ScanProgress = { current: 0, total: SCAN_STEPS };

/** Scan a Kobo device: database + book files. */
export function useKoboDevice() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>(IDLE);
  const [error, setError] = useState<UiError | null>(null);

  const scanDevice = useCallback(async (dirHandle: FileSystemDirectoryHandle): Promise<ScanResult> => {
    setIsScanning(true);
    setError(null);
    try {
      return await scanKoboDevice(dirHandle, (current) => setScanProgress({ current, total: SCAN_STEPS }));
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
