import { useState, useCallback } from 'react';
import {
  parseBackupFile,
  restoreToDevice,
  checkCompatibility,
  previewBackup,
  validateRestoreTarget,
  type BackupPreviewData,
  type CompatibilityResult,
  type ParsedBackup,
  type RestoreResult,
  type RestoreRunOptions,
} from '../utils/restore.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import type { DeviceInfo, ProgressState, UiError } from '../types/kobo.ts';

export type RestoreOutcome = RestoreResult & { duration: number };

const IDLE: ProgressState = { stage: '', percent: 0, filesProcessed: 0, totalFiles: 0 };

/** Restore orchestration: parse → preview → restore. */
export function useRestore() {
  const [isParsing, setIsParsing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupData, setBackupData] = useState<ParsedBackup | null>(null);
  const [preview, setPreview] = useState<BackupPreviewData | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [progress, setProgress] = useState<ProgressState>(IDLE);
  const [result, setResult] = useState<RestoreOutcome | null>(null);
  const [error, setError] = useState<UiError | null>(null);

  const parse = useCallback(async (file: File, password?: string) => {
    setIsParsing(true);
    setError(null);
    try {
      const parsed = await parseBackupFile(file, password);
      setBackupData(parsed);
      setPreview(previewBackup(parsed));
      return parsed;
    } catch (err) {
      setError({
        title: 'Invalid Backup File',
        message: errorMessage(err, 'Failed to parse backup file'),
        code: errorCode(err, 'PARSE_FAILED'),
      });
      throw err;
    } finally {
      setIsParsing(false);
    }
  }, []);

  const checkDeviceCompatibility = useCallback(
    (deviceInfo: Partial<DeviceInfo> | null) => {
      if (!backupData) throw new Error('No backup loaded');
      const compat = checkCompatibility(backupData.metadata, deviceInfo);
      setCompatibility(compat);
      return compat;
    },
    [backupData],
  );

  const restore = useCallback(
    async (deviceHandle: FileSystemDirectoryHandle, options: RestoreRunOptions = {}) => {
      if (!backupData) throw new Error('No backup loaded');

      setIsRestoring(true);
      setError(null);
      setResult(null);
      const startTime = Date.now();
      const totalBooks = backupData.bookFiles.length;

      try {
        const validation = await validateRestoreTarget(deviceHandle);
        if (!validation.valid) throw new Error(validation.error);

        const restoreResult = await restoreToDevice(deviceHandle, backupData, {
          ...options,
          onProgress: (p) =>
            setProgress({
              stage: p.stage,
              percent: p.percent,
              filesProcessed: p.filesProcessed || 0,
              totalFiles: p.totalFiles || totalBooks,
            }),
        });

        const finalResult = { ...restoreResult, duration: Date.now() - startTime };
        setResult(finalResult);
        setProgress({
          stage: 'Restore complete',
          percent: 100,
          filesProcessed: totalBooks,
          totalFiles: totalBooks,
        });
        return finalResult;
      } catch (err) {
        setError({
          title: 'Restore Failed',
          message: errorMessage(err, 'Failed to restore backup'),
          code: errorCode(err, 'RESTORE_FAILED'),
        });
        throw err;
      } finally {
        setIsRestoring(false);
      }
    },
    [backupData],
  );

  const clear = useCallback(() => {
    setBackupData(null);
    setPreview(null);
    setCompatibility(null);
    setProgress(IDLE);
    setResult(null);
    setError(null);
  }, []);

  return {
    isParsing,
    isRestoring,
    backupData,
    preview,
    compatibility,
    progress,
    result,
    error,
    parse,
    checkDeviceCompatibility,
    restore,
    clear,
    hasBackup: backupData !== null,
    isComplete: result !== null,
  };
}
