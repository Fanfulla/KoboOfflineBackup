/**
 * Connect a Kobo (File System Access picker, or <input webkitdirectory> files
 * as a fallback), scan it and share the result through the global store.
 */
import { useCallback, useState } from 'react';
import { useKoboStore } from '../stores/koboStore.ts';
import { selectKoboDirectory } from '../utils/fileSystem.ts';
import { directorySource, fileListSource, type KoboSource } from '../utils/deviceSource.ts';
import { scanKoboDevice, DATABASE_PATH } from '../utils/scan.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import type { UiError } from '../types/kobo.ts';

export type ConnectStatus = 'idle' | 'selecting' | 'scanning' | 'ready' | 'error';

const invalidDevice: UiError = {
  title: 'Not a Kobo Device',
  message: 'Please select your Kobo drive (usually named "KOBOeReader")',
  code: 'INVALID_DEVICE',
};

export function useDevice() {
  const scan = useKoboStore((s) => s.scan);
  const setDevice = useKoboStore((s) => s.setDevice);
  const clearDevice = useKoboStore((s) => s.clearDevice);
  const [status, setStatus] = useState<ConnectStatus>(scan ? 'ready' : 'idle');
  const [step, setStep] = useState(0);
  const [error, setError] = useState<UiError | null>(null);

  const connect = useCallback(
    async (source: KoboSource) => {
      setError(null);
      if (!(await source.getFile(DATABASE_PATH))) {
        setError(invalidDevice);
        setStatus('error');
        return null;
      }
      setStatus('scanning');
      setStep(0);
      try {
        const result = await scanKoboDevice(source, setStep);
        setDevice(source, result);
        setStatus('ready');
        return result;
      } catch (err) {
        setError({ title: 'Scan Failed', message: errorMessage(err), code: errorCode(err, 'SCAN_FAILED') });
        setStatus('error');
        return null;
      }
    },
    [setDevice],
  );

  const connectWithPicker = useCallback(async () => {
    setStatus('selecting');
    setError(null);
    try {
      const handle = await selectKoboDirectory('read');
      if (!handle) {
        setStatus(scan ? 'ready' : 'idle');
        return null;
      }
      return await connect(directorySource(handle));
    } catch (err) {
      setError({
        title: 'Selection Failed',
        message: errorMessage(err),
        code: errorCode(err, 'FS_PERMISSION_DENIED'),
      });
      setStatus('error');
      return null;
    }
  }, [connect, scan]);

  const connectWithFiles = useCallback(
    (files: FileList | File[]) =>
      files.length ? connect(fileListSource(Array.from(files))) : Promise.resolve(null),
    [connect],
  );

  const disconnect = useCallback(() => {
    clearDevice();
    setError(null);
    setStatus('idle');
  }, [clearDevice]);

  return { scan, status, step, error, connectWithPicker, connectWithFiles, disconnect };
}
