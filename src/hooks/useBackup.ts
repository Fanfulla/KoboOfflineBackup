/**
 * Backup orchestration (streaming-first). The ZIP code is loaded on demand.
 *
 *  - Chrome/Edge: the wizard calls showSaveFilePicker() first (user gesture)
 *    and passes the handle here → streamed to disk, no memory limit.
 *  - Firefox/Safari with the service worker active: streamed as a download.
 *  - Otherwise: the archive is built in memory and downloaded.
 */
import { useCallback, useState } from 'react';
import type { BackupResult } from '../utils/backup.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import { canStreamDownload, streamDownload } from '../sw/protocol.ts';
import type { BackupOptions, BackupStage, ScanResult, UiError } from '../types/kobo.ts';

export interface CreateBackupOptions extends Partial<BackupOptions> {
  writableFileHandle?: FileSystemFileHandle | null;
  suggestedFilename: string;
  password?: string;
}

export type BackupOutcome = BackupResult & { duration: number; streamed: boolean };

export interface BackupProgressState {
  stage: BackupStage;
  percent: number;
  filesProcessed: number;
  totalFiles: number;
}

const IDLE: BackupProgressState = { stage: 'preparing', percent: 0, filesProcessed: 0, totalFiles: 0 };

export function useBackup() {
  const [progress, setProgress] = useState<BackupProgressState>(IDLE);
  const [result, setResult] = useState<BackupOutcome | null>(null);
  const [error, setError] = useState<UiError | null>(null);
  const [running, setRunning] = useState(false);

  const create = useCallback(async (scan: ScanResult, options: CreateBackupOptions) => {
    setRunning(true);
    setError(null);
    setResult(null);
    const startTime = Date.now();
    const { writableFileHandle, suggestedFilename, ...runOptions } = options;
    const totalFiles = runOptions.includeBooks === false ? 0 : scan.bookFiles.length;
    const onProgress = (stage: BackupStage, percent: number, filesProcessed?: number) =>
      setProgress((prev) => ({
        stage,
        percent: Math.min(Math.round(percent || 0), 100),
        filesProcessed: filesProcessed ?? prev.filesProcessed,
        totalFiles,
      }));

    try {
      const backup = await import('../utils/backup.ts');
      let outcome: BackupResult;
      const streamed = !!writableFileHandle;
      if (writableFileHandle) {
        outcome = await backup.streamBackupToDisk(scan, writableFileHandle, suggestedFilename, {
          ...runOptions,
          onProgress,
        });
      } else if (canStreamDownload()) {
        // Firefox/Safari: stream through the service worker, no memory limit.
        const { stream, metadata, getSize } = await backup.createBackupStream(scan, {
          ...runOptions,
          onProgress,
        });
        await streamDownload(stream, suggestedFilename);
        outcome = { filename: suggestedFilename, size: getSize(), metadata, verification: null };
      } else {
        const { blob, ...rest } = await backup.createBackupBlob(scan, { ...runOptions, onProgress });
        backup.saveBackup(blob, suggestedFilename);
        outcome = { ...rest, filename: suggestedFilename };
      }
      const final = { ...outcome, duration: Date.now() - startTime, streamed };
      setResult(final);
      return final;
    } catch (err) {
      setError({ title: 'Backup Failed', message: errorMessage(err), code: errorCode(err, 'BACKUP_FAILED') });
      return null;
    } finally {
      setRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(IDLE);
    setResult(null);
    setError(null);
  }, []);

  return { progress, result, error, running, create, reset };
}
