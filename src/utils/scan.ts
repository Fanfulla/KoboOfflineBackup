/**
 * Scan a connected Kobo: database, device identity and book files.
 */

import { getFileByPath, readFile, getAllFiles } from './fileSystem.ts';
import { extractAllData } from './koboDatabase.ts';
import { readDeviceVersion } from './koboDevice.ts';
import { isValidBookFile } from './validation.ts';
import type { BookFileEntry, ScanResult, ScanWarning } from '../types/kobo.ts';

export const SCAN_STEPS = 4;

/** Returns true when a non-empty WAL file sits next to the database. */
async function hasPendingWal(root: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    const wal = await getFileByPath(root, '.kobo/KoboReader.sqlite-wal');
    return (await wal.getFile()).size > 0;
  } catch {
    return false;
  }
}

export async function scanKoboDevice(
  root: FileSystemDirectoryHandle,
  onStep: (step: number) => void = () => {},
): Promise<ScanResult> {
  onStep(1);
  const [database, version, walPending] = await Promise.all([
    getFileByPath(root, '.kobo/KoboReader.sqlite').then(readFile),
    readDeviceVersion(root),
    hasPendingWal(root),
  ]);

  onStep(2);
  const extracted = await extractAllData(database);
  const deviceInfo = version
    ? {
        ...extracted.deviceInfo,
        model: version.model,
        modelId: version.modelId,
        firmwareVersion: version.firmwareVersion,
      }
    : extracted.deviceInfo;

  onStep(3);
  const candidates = (await getAllFiles(root)).filter((file) => isValidBookFile(file.name));
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

  onStep(4);
  const warnings: ScanWarning[] = walPending ? ['wal-pending'] : [];
  return {
    books: extracted.books,
    annotations: extracted.annotations,
    stats: extracted.stats,
    collections: extracted.collections,
    deviceInfo,
    bookFiles,
    database,
    warnings,
  };
}
