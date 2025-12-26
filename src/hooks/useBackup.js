/**
 * Hook for creating backups
 */

import { useState, useCallback } from 'react';
import { createBackup, saveBackup, estimateBackupSize } from '../utils/backup.js';
import { readFile } from '../utils/fileSystem.js';

/**
 * Hook to manage backup creation
 * @returns {object} Backup utilities and state
 */
export function useBackup() {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState({
    stage: '',
    percent: 0,
    filesProcessed: 0,
    totalFiles: 0,
    speed: '',
    eta: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Create a backup from Kobo data
   * @param {object} koboData - Kobo device data
   * @param {object} options - Backup options
   */
  const create = useCallback(async (koboData, options = {}) => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    try {
      // Read book file blobs
      const bookFileBlobs = [];

      if (options.includeBooks && koboData.bookFiles) {
        setProgress({
          stage: 'Reading book files...',
          percent: 0,
          filesProcessed: 0,
          totalFiles: koboData.bookFiles.length,
        });

        for (let i = 0; i < koboData.bookFiles.length; i++) {
          const fileInfo = koboData.bookFiles[i];

          try {
            const blob = await readFile(fileInfo.handle);

            bookFileBlobs.push({
              name: fileInfo.name,
              blob: new Blob([blob]),
              size: blob.byteLength,
            });

            const percent = (i / koboData.bookFiles.length) * 20; // 0-20%
            setProgress(prev => ({
              ...prev,
              percent,
              filesProcessed: i + 1,
            }));
          } catch (err) {
            console.error(`Failed to read book file: ${fileInfo.name}`, err);
            // Continue with other files
          }
        }
      }

      // Create backup with progress tracking
      const backupData = {
        ...koboData,
        bookFiles: bookFileBlobs,
      };

      const backupResult = await createBackup(backupData, {
        ...options,
        onProgress: (progressData) => {
          const elapsed = Date.now() - startTime;
          const estimatedTotal = (elapsed / progressData.percent) * 100;
          const remaining = estimatedTotal - elapsed;

          setProgress({
            stage: progressData.stage,
            percent: progressData.percent,
            filesProcessed: progressData.filesProcessed || backupFileBlobs.length,
            totalFiles: backupFileBlobs.length,
            speed: calculateSpeed(bookFileBlobs.reduce((sum, f) => sum + f.size, 0), elapsed),
            eta: formatTimeRemaining(remaining),
          });
        },
      });

      // Save backup file
      setProgress({
        stage: 'Saving backup...',
        percent: 95,
        filesProcessed: bookFileBlobs.length,
        totalFiles: bookFileBlobs.length,
      });

      const saveResult = await saveBackup(backupResult.blob, backupResult.filename);

      if (saveResult) {
        const finalResult = {
          ...backupResult,
          ...saveResult,
          duration: Date.now() - startTime,
        };

        setResult(finalResult);
        setProgress({
          stage: 'Backup complete',
          percent: 100,
          filesProcessed: bookFileBlobs.length,
          totalFiles: bookFileBlobs.length,
        });

        return finalResult;
      }

      return null; // User cancelled save
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

  /**
   * Estimate backup size
   */
  const estimateSize = useCallback((koboData) => {
    return estimateBackupSize(koboData);
  }, []);

  /**
   * Reset backup state
   */
  const reset = useCallback(() => {
    setIsCreating(false);
    setProgress({
      stage: '',
      percent: 0,
      filesProcessed: 0,
      totalFiles: 0,
      speed: '',
      eta: '',
    });
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

/**
 * Calculate transfer speed
 * @private
 */
function calculateSpeed(bytes, milliseconds) {
  if (milliseconds === 0) return '0 MB/s';

  const bytesPerSecond = (bytes / milliseconds) * 1000;
  const mbPerSecond = bytesPerSecond / (1024 * 1024);

  if (mbPerSecond < 1) {
    const kbPerSecond = bytesPerSecond / 1024;
    return `${kbPerSecond.toFixed(1)} KB/s`;
  }

  return `${mbPerSecond.toFixed(1)} MB/s`;
}

/**
 * Format time remaining
 * @private
 */
function formatTimeRemaining(milliseconds) {
  if (milliseconds < 0 || !isFinite(milliseconds)) return 'Calculating...';

  const seconds = Math.floor(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}
