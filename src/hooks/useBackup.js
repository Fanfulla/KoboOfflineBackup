/**
 * Hook for creating backups (streaming-first approach).
 *
 * Flow:
 *  - Chrome/Edge: BackupWizard calls showSaveFilePicker() first (user-gesture),
 *    passes the fileHandle here -> streamBackupToDisk() -> one file at a time, no OOM.
 *  - Firefox/Safari: no fileHandle -> createBackupBlob() + saveBackup() -> may OOM
 *    for very large libraries, but that is unavoidable without native streaming support.
 */

import { useState, useCallback } from 'react';
import {
  streamBackupToDisk,
  createBackupBlob,
  saveBackup,
  estimateBackupSize,
} from '../utils/backup.js';

export function useBackup() {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState({
    stage: '', percent: 0, filesProcessed: 0, totalFiles: 0,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Create a backup.
   *
   * @param {object} koboData       - scan result; bookFiles items must have .handle
   * @param {object} options
   * @param {FileSystemFileHandle} [options.writableFileHandle] - from showSaveFilePicker (streaming path)
   * @param {string}               [options.suggestedFilename] - used as filename on the streaming path
   */
  const create = useCallback(async (koboData, options = {}) => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();
    const totalFiles = koboData.bookFiles?.length || 0;
    const { writableFileHandle, suggestedFilename, ...backupOptions } = options;

    const onProgress = (stage, percent, filesProcessed) => {
      setProgress({
        stage,
        percent: Math.min(Math.round(percent || 0), 100),
        filesProcessed: filesProcessed ?? 0,
        totalFiles,
      });
    };

    try {
      let finalResult;

      if (writableFileHandle) {
        // STREAMING PATH — no OOM regardless of library size
        finalResult = await streamBackupToDisk(
          koboData,
          writableFileHandle,
          suggestedFilename,
          { ...backupOptions, onProgress },
        );
      } else {
        // BLOB FALLBACK — Firefox / Safari (may OOM for large libraries)
        const blobResult = await createBackupBlob(koboData, { ...backupOptions, onProgress });
        await saveBackup(blobResult.blob, blobResult.filename);
        finalResult = { filename: blobResult.filename, size: blobResult.size, metadata: blobResult.metadata };
      }

      finalResult.duration = Date.now() - startTime;
      setResult(finalResult);
      setProgress({ stage: 'Backup complete', percent: 100, filesProcessed: totalFiles, totalFiles });
      return finalResult;

    } catch (err) {
      setError({
        title: 'Backup Failed',
        message: err.message || 'Failed to create backup',
        code: err.code || 'BACKUP_FAILED',
      });
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const estimateSize = useCallback((koboData) => estimateBackupSize(koboData), []);

  const reset = useCallback(() => {
    setIsCreating(false);
    setProgress({ stage: '', percent: 0, filesProcessed: 0, totalFiles: 0 });
    setResult(null);
    setError(null);
  }, []);

  return {
    isCreating,
    progress,
    result,
    error,
    create,
    estimateSize,
    reset,
    isComplete: result !== null,
  };
}
