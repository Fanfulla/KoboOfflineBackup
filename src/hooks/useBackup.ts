/**
 * Backup orchestration (streaming-first).
 *
 *  - Chrome/Edge: BackupWizard calls showSaveFilePicker() first (user gesture)
 *    and passes the handle here -> streamBackupToDisk() -> no OOM.
 *  - Otherwise: createBackupBlob() + saveBackup() (may OOM on huge libraries).
 */

import { useState, useCallback } from 'react';
import {
  streamBackupToDisk,
  createBackupBlob,
  saveBackup,
  estimateBackupSize,
  type BackupResult,
} from '../utils/backup.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import type { BackupOptions, ProgressState, ScanResult, UiError } from '../types/kobo.ts';

export interface CreateBackupOptions extends Partial<BackupOptions> {
  /** From showSaveFilePicker (streaming path). */
  writableFileHandle?: FileSystemFileHandle | null;
  suggestedFilename?: string;
  /** AES-256 encrypt the archive with this password. */
  password?: string;
}

export type BackupOutcome = BackupResult & { duration: number };

const IDLE: ProgressState = { stage: '', percent: 0, filesProcessed: 0, totalFiles: 0 };

export function useBackup() {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(IDLE);
  const [result, setResult] = useState<BackupOutcome | null>(null);
  const [error, setError] = useState<UiError | null>(null);

  const create = useCallback(async (koboData: ScanResult, options: CreateBackupOptions = {}) => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();
    const totalFiles = koboData.bookFiles?.length || 0;
    const { writableFileHandle, suggestedFilename, ...backupOptions } = options;

    const onProgress = (stage: string, percent: number, filesProcessed?: number) =>
      setProgress({
        stage,
        percent: Math.min(Math.round(percent || 0), 100),
        filesProcessed: filesProcessed ?? 0,
        totalFiles,
      });

    try {
      let backupResult: BackupResult;
      if (writableFileHandle) {
        backupResult = await streamBackupToDisk(
          koboData,
          writableFileHandle,
          suggestedFilename ?? 'backup.zip',
          {
            ...backupOptions,
            onProgress,
          },
        );
      } else {
        const { blob, ...blobResult } = await createBackupBlob(koboData, { ...backupOptions, onProgress });
        saveBackup(blob, blobResult.filename);
        backupResult = blobResult;
      }

      const finalResult = { ...backupResult, duration: Date.now() - startTime };
      setResult(finalResult);
      setProgress({ stage: 'Backup complete', percent: 100, filesProcessed: totalFiles, totalFiles });
      return finalResult;
    } catch (err) {
      setError({
        title: 'Backup Failed',
        message: errorMessage(err, 'Failed to create backup'),
        code: errorCode(err, 'BACKUP_FAILED'),
      });
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const estimateSize = useCallback((koboData: ScanResult) => estimateBackupSize(koboData), []);

  const reset = useCallback(() => {
    setIsCreating(false);
    setProgress(IDLE);
    setResult(null);
    setError(null);
  }, []);

  return { isCreating, progress, result, error, create, estimateSize, reset, isComplete: result !== null };
}
