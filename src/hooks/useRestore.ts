/**
 * Restore orchestration: parse → inspect target → restore → (undo).
 * The ZIP/SQLite code is loaded on demand.
 */
import { useCallback, useState } from 'react';
import type {
  BackupPreviewData,
  CompatibilityResult,
  ParsedBackup,
  RestoreResult,
  RestoreRunOptions,
  RestoreStage,
  RestoreTargetInfo,
} from '../utils/restore.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import type { UiError } from '../types/kobo.ts';

const loadRestore = () => import('../utils/restore.ts');

export interface RestoreProgressState {
  stage: RestoreStage;
  percent: number;
  filesProcessed: number;
  totalFiles: number;
}

const IDLE: RestoreProgressState = { stage: 'preparing', percent: 0, filesProcessed: 0, totalFiles: 0 };

const toUiError = (title: string, err: unknown, fallback: string): UiError => ({
  title,
  message: errorMessage(err),
  code: errorCode(err, fallback),
});

export function useRestore() {
  const [backup, setBackup] = useState<ParsedBackup | null>(null);
  const [preview, setPreview] = useState<BackupPreviewData | null>(null);
  const [target, setTarget] = useState<{ handle: FileSystemDirectoryHandle; info: RestoreTargetInfo } | null>(
    null,
  );
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [progress, setProgress] = useState<RestoreProgressState>(IDLE);
  const [result, setResult] = useState<RestoreResult | null>(null);
  const [error, setError] = useState<UiError | null>(null);
  const [busy, setBusy] = useState(false);

  const parse = useCallback(async (file: Blob, password?: string) => {
    setBusy(true);
    setError(null);
    try {
      const { parseBackupFile, previewBackup } = await loadRestore();
      const parsed = await parseBackupFile(file, password);
      setBackup(parsed);
      setPreview(previewBackup(parsed));
      return parsed;
    } catch (err) {
      setError(toUiError('Invalid Backup File', err, 'RESTORE_INVALID_FILE'));
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const selectTarget = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      setBusy(true);
      setError(null);
      try {
        const { inspectRestoreTarget, validateRestoreTarget, checkCompatibility } = await loadRestore();
        const validation = await validateRestoreTarget(handle);
        if (!validation.valid) {
          setError({ title: 'Invalid target', message: validation.error, code: 'INVALID_DEVICE' });
          return null;
        }
        const info = await inspectRestoreTarget(handle);
        setTarget({ handle, info });
        if (backup) setCompatibility(checkCompatibility(backup.metadata, info.device));
        return info;
      } catch (err) {
        setError(toUiError('Invalid target', err, 'FS_PERMISSION_DENIED'));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [backup],
  );

  const restore = useCallback(
    async (options: Omit<RestoreRunOptions, 'onProgress'>) => {
      if (!backup || !target) return null;
      setBusy(true);
      setError(null);
      setResult(null);
      try {
        const { restoreToDevice } = await loadRestore();
        const res = await restoreToDevice(target.handle, backup, {
          ...options,
          onProgress: (p) =>
            setProgress({
              stage: p.stage,
              percent: Math.round(p.percent),
              filesProcessed: p.filesProcessed ?? 0,
              totalFiles: p.totalFiles ?? 0,
            }),
        });
        setResult(res);
        return res;
      } catch (err) {
        setError(toUiError('Restore Failed', err, 'RESTORE_FAILED'));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [backup, target],
  );

  const undo = useCallback(async () => {
    if (!target) return false;
    try {
      const { undoLastRestore } = await loadRestore();
      return await undoLastRestore(target.handle);
    } catch (err) {
      setError(toUiError('Undo failed', err, 'RESTORE_FAILED'));
      return false;
    }
  }, [target]);

  const reset = useCallback(() => {
    setBackup(null);
    setPreview(null);
    setTarget(null);
    setCompatibility(null);
    setProgress(IDLE);
    setResult(null);
    setError(null);
  }, []);

  return {
    backup,
    preview,
    target,
    compatibility,
    progress,
    result,
    error,
    busy,
    parse,
    selectTarget,
    restore,
    undo,
    reset,
    clearError: () => setError(null),
  };
}
