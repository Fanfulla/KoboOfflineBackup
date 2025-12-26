/**
 * Hook for restoring backups
 */

import { useState, useCallback } from 'react';
import {
  parseBackupFile,
  restoreToDevice,
  checkCompatibility,
  previewBackup,
  validateRestoreTarget,
} from '../utils/restore.js';

/**
 * Hook to manage backup restoration
 * @returns {object} Restore utilities and state
 */
export function useRestore() {
  const [isParsing, setIsParsing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [compatibility, setCompatibility] = useState(null);

  const [progress, setProgress] = useState({
    stage: '',
    percent: 0,
    filesProcessed: 0,
    totalFiles: 0,
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Parse a backup file
   * @param {File} file - Backup ZIP file
   */
  const parse = useCallback(async (file) => {
    setIsParsing(true);
    setError(null);

    try {
      const parsed = await parseBackupFile(file);
      setBackupData(parsed);

      // Generate preview
      const previewData = previewBackup(parsed);
      setPreview(previewData);

      return parsed;
    } catch (err) {
      setError({
        title: 'Invalid Backup File',
        message: err.message || 'Failed to parse backup file',
        code: err.code || 'PARSE_FAILED',
      });
      throw err;
    } finally {
      setIsParsing(false);
    }
  }, []);

  /**
   * Check compatibility with target device
   * @param {object} deviceInfo - Target device information
   */
  const checkDeviceCompatibility = useCallback((deviceInfo) => {
    if (!backupData) {
      throw new Error('No backup loaded');
    }

    const compat = checkCompatibility(backupData.metadata, deviceInfo);
    setCompatibility(compat);

    return compat;
  }, [backupData]);

  /**
   * Validate restore target
   * @param {FileSystemDirectoryHandle} deviceHandle - Target device directory
   */
  const validateTarget = useCallback(async (deviceHandle) => {
    return await validateRestoreTarget(deviceHandle);
  }, []);

  /**
   * Restore backup to device
   * @param {FileSystemDirectoryHandle} deviceHandle - Target device directory
   * @param {object} options - Restore options
   */
  const restore = useCallback(async (deviceHandle, options = {}) => {
    if (!backupData) {
      throw new Error('No backup loaded');
    }

    setIsRestoring(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    try {
      // Validate target first
      const validation = await validateTarget(deviceHandle);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Restore with progress tracking
      const restoreResult = await restoreToDevice(deviceHandle, backupData, {
        ...options,
        onProgress: (progressData) => {
          setProgress({
            stage: progressData.stage,
            percent: progressData.percent,
            filesProcessed: progressData.filesProcessed || 0,
            totalFiles: progressData.totalFiles || backupData.bookFiles.length,
          });
        },
      });

      const finalResult = {
        ...restoreResult,
        duration: Date.now() - startTime,
      };

      setResult(finalResult);
      setProgress({
        stage: 'Restore complete',
        percent: 100,
        filesProcessed: backupData.bookFiles.length,
        totalFiles: backupData.bookFiles.length,
      });

      return finalResult;
    } catch (err) {
      setError({
        title: 'Restore Failed',
        message: err.message || 'Failed to restore backup',
        code: err.code || 'RESTORE_FAILED',
      });
      throw err;
    } finally {
      setIsRestoring(false);
    }
  }, [backupData, validateTarget]);

  /**
   * Clear backup data and reset state
   */
  const clear = useCallback(() => {
    setBackupData(null);
    setPreview(null);
    setCompatibility(null);
    setProgress({
      stage: '',
      percent: 0,
      filesProcessed: 0,
      totalFiles: 0,
    });
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
    validateTarget,
    restore,
    clear,

    hasBackup: backupData !== null,
    isComplete: result !== null,
  };
}
