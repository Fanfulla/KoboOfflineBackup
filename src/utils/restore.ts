/**
 * Restore utilities: parse backup ZIPs and write them back to a Kobo device.
 */

import {
  ZipReader,
  BlobReader,
  BlobWriter,
  TextWriter,
  ERR_INVALID_PASSWORD,
  type Entry,
  type FileEntry,
} from '@zip.js/zip.js';
import { writeFile, writeFileToPath } from './fileSystem.ts';
import { RestoreError, ERROR_CODES, errorMessage } from './errors.ts';
import { validateBackupMetadata } from './validation.ts';
import { openDatabase } from './koboDatabase.ts';
import { calculateChecksum, BOOKS_PREFIX, DEVICE_PREFIX } from './backup.ts';
import { isPersonalisationPath } from './scan.ts';
import type { MergeOptions, MergeReport } from './merge.ts';
import type { BackupMetadata, BackupOptions, DeviceInfo, ReadingStats } from '../types/kobo.ts';

export interface RestoreBookFile {
  /** Display name (filename only). */
  name: string;
  /** Entry path inside the ZIP, e.g. "books/Author/title.epub". */
  path: string;
  /** Destination path relative to the device root. */
  originalPath: string;
}

export interface ParsedBackup {
  metadata: BackupMetadata;
  database: ArrayBuffer;
  bookFiles: RestoreBookFile[];
  bookPathMap: Map<string, string>;
  /** Settings, custom fonts and screensavers stored under `device/`. */
  extraFiles: RestoreBookFile[];
  /** Reading statistics computed from the backup database (null if unreadable). */
  stats: ReadingStats | null;
  /** Database matches the checksum recorded at backup time (null: not recorded). */
  checksumOk: boolean | null;
  file: Blob;
  /** True when the archive entries are AES-encrypted. */
  encrypted: boolean;
  /** Kept in memory only, needed to extract books during the restore. */
  password?: string;
  valid: true;
}

export interface FailedBook {
  name: string;
  originalPath: string;
  error: string;
}

export interface RestoreVerification {
  dbBooksCount: number;
  expectedCount: number;
  ok: boolean;
}

export interface RestoreResult {
  success: true;
  booksRestored: number;
  failedBooks: FailedBook[];
  databaseRestored: boolean;
  /** A copy of the previous device database was saved (see undoLastRestore). */
  safetySnapshot: boolean;
  /** How the database was restored ("merge" falls back to "full" on an empty device). */
  mode: RestoreMode;
  merge: MergeReport | null;
  settingsRestored: number;
  metadata: BackupMetadata;
  verification: RestoreVerification | null;
}

/**
 * - `full`: replace the device database with the backup (exact copy, including
 *   the old account and settings).
 * - `merge`: copy reading data of sideloaded books into the device database.
 */
export type RestoreMode = 'full' | 'merge';

export interface RestoreProgress {
  stage: string;
  percent: number;
  filesProcessed?: number;
  totalFiles?: number;
}

export type RestoreRunOptions = Partial<Pick<BackupOptions, 'includeBooks' | 'includeSettings'>> & {
  /** Default: `full`. */
  mode?: RestoreMode;
  /** What to copy in `merge` mode (all by default). */
  merge?: MergeOptions;
  /**
   * Opt-in: recursively removes top-level book folders before restore. Off by
   * default because it can delete files added to those folders AFTER the backup.
   */
  cleanExistingBooks?: boolean;
  /** Save the current device database before overwriting it (default: true). */
  safetySnapshot?: boolean;
  onProgress?: (progress: RestoreProgress) => void;
};

/** Name of the pre-restore copy of the device database, inside `.kobo/`. */
export const SAFETY_SNAPSHOT_NAME = 'KoboReader.sqlite.before-restore';
const DB_NAME = 'KoboReader.sqlite';
const DB_SIDECARS = ['KoboReader.sqlite-wal', 'KoboReader.sqlite-shm'];

const isFileEntry = (entry: Entry): entry is FileEntry => !entry.directory;
const isInvalidPassword = (error: unknown) =>
  error instanceof Error && error.message === ERR_INVALID_PASSWORD;

/** Parse and validate a backup ZIP file (optionally password-protected). */
export async function parseBackupFile(file: Blob, password?: string): Promise<ParsedBackup> {
  const zipReader = new ZipReader(new BlobReader(file), password ? { password } : {});
  try {
    const entries = (await zipReader.getEntries()).filter(isFileEntry);
    const encrypted = entries.some((e) => e.encrypted);
    if (encrypted && !password) {
      throw new RestoreError('This backup is password-protected', ERROR_CODES.RESTORE_PASSWORD_REQUIRED);
    }

    const metadataEntry = entries.find((e) => e.filename === 'backup-metadata.json');
    const dbEntry = entries.find((e) => e.filename === DB_NAME);

    if (!metadataEntry) {
      throw new RestoreError(
        'Invalid backup: missing backup-metadata.json',
        ERROR_CODES.RESTORE_INVALID_FILE,
        {
          missingFile: 'backup-metadata.json',
        },
      );
    }
    if (!dbEntry) {
      throw new RestoreError('Invalid backup: missing KoboReader.sqlite', ERROR_CODES.RESTORE_INVALID_FILE, {
        missingFile: DB_NAME,
      });
    }

    let metadataText: string;
    try {
      metadataText = await metadataEntry.getData(new TextWriter());
    } catch (error) {
      if (isInvalidPassword(error)) {
        throw new RestoreError('Wrong password for this backup', ERROR_CODES.RESTORE_WRONG_PASSWORD);
      }
      throw error;
    }

    const metadata: unknown = JSON.parse(metadataText);
    const validation = validateBackupMetadata(metadata);
    if (!validation.valid) {
      throw new RestoreError(
        `Invalid backup metadata: ${validation.error}`,
        ERROR_CODES.RESTORE_INVALID_FILE,
        {
          validationError: validation.error,
        },
      );
    }

    const database = await (await dbEntry.getData(new BlobWriter())).arrayBuffer();
    const { bookPathMap, stats } = await inspectBackupDatabase(database);

    const bookFiles: RestoreBookFile[] = entries
      .filter((entry) => entry.filename.startsWith(BOOKS_PREFIX))
      .map((entry) => {
        // New format: "books/Author/book.epub" (full relative path embedded in the ZIP)
        // Old format: "books/book.epub" (filename only, path recovered via pathMap)
        const zipRelPath = entry.filename.slice(BOOKS_PREFIX.length);
        const name = zipRelPath.split('/').pop()!;
        const originalPath = zipRelPath.includes('/')
          ? zipRelPath
          : (bookPathMap.get(zipRelPath) ?? zipRelPath);
        return { name, path: entry.filename, originalPath };
      });

    // Only whitelisted personalisation files are ever written back.
    const extraFiles: RestoreBookFile[] = entries
      .filter((entry) => entry.filename.startsWith(DEVICE_PREFIX))
      .map((entry) => {
        const originalPath = entry.filename.slice(DEVICE_PREFIX.length);
        return { name: originalPath.split('/').pop()!, path: entry.filename, originalPath };
      })
      .filter((f) => isPersonalisationPath(f.originalPath));

    const recorded = (metadata as BackupMetadata).integrity?.databaseChecksum;
    const checksumOk = recorded?.startsWith('sha256:')
      ? (await calculateChecksum(database)) === recorded
      : null;

    return {
      metadata: metadata as BackupMetadata,
      database,
      bookFiles,
      bookPathMap,
      extraFiles,
      stats,
      checksumOk,
      file,
      encrypted,
      password: encrypted ? password : undefined,
      valid: true,
    };
  } catch (error) {
    if (error instanceof RestoreError) throw error;
    throw new RestoreError('Failed to parse backup file', ERROR_CODES.RESTORE_CORRUPTED, {
      originalError: error,
    });
  } finally {
    await zipReader.close();
  }
}

/**
 * Why a restore path is refused, or null if it is a safe book destination.
 * Books never live in hidden/system folders (backups skip them), so writing
 * there can only come from a crafted archive, e.g. "books/.kobo/KoboReader.sqlite".
 */
function unsafeBookPathReason(path: string): string | null {
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length === 0 || parts.some((p) => p === '..' || p === '.'))
    return 'Unsafe path rejected (path traversal)';
  if (parts.some((p) => p.startsWith('.')) || parts[0] === 'System Volume Information') {
    return 'Unsafe path rejected (hidden or system folder)';
  }
  return null;
}

async function removeDatabaseSidecars(koboFolder: FileSystemDirectoryHandle): Promise<void> {
  for (const name of DB_SIDECARS) await koboFolder.removeEntry(name).catch(() => {});
}

async function readOptionalFile(dir: FileSystemDirectoryHandle, name: string): Promise<File | null> {
  try {
    return await (await dir.getFileHandle(name)).getFile();
  } catch {
    return null;
  }
}

/** Copy the current device database (and a pending WAL) aside before a restore. */
async function snapshotDeviceDatabase(koboFolder: FileSystemDirectoryHandle): Promise<boolean> {
  const current = await readOptionalFile(koboFolder, DB_NAME);
  if (!current || current.size === 0) return false;
  await writeFile(koboFolder, SAFETY_SNAPSHOT_NAME, current);
  const wal = await readOptionalFile(koboFolder, DB_SIDECARS[0]!);
  if (wal && wal.size > 0) await writeFile(koboFolder, `${SAFETY_SNAPSHOT_NAME}-wal`, wal);
  else await koboFolder.removeEntry(`${SAFETY_SNAPSHOT_NAME}-wal`).catch(() => {});
  return true;
}

/** Whether a pre-restore snapshot exists on the device. */
export async function hasSafetySnapshot(deviceHandle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    const koboFolder = await deviceHandle.getDirectoryHandle('.kobo');
    return ((await readOptionalFile(koboFolder, SAFETY_SNAPSHOT_NAME))?.size ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Put back the database saved by the last restore. Returns false if none exists. */
export async function undoLastRestore(deviceHandle: FileSystemDirectoryHandle): Promise<boolean> {
  const koboFolder = await deviceHandle.getDirectoryHandle('.kobo');
  const snapshot = await readOptionalFile(koboFolder, SAFETY_SNAPSHOT_NAME);
  if (!snapshot || snapshot.size === 0) return false;

  const snapshotWal = await readOptionalFile(koboFolder, `${SAFETY_SNAPSHOT_NAME}-wal`);
  await removeDatabaseSidecars(koboFolder);
  await writeFile(koboFolder, DB_NAME, snapshot);
  if (snapshotWal && snapshotWal.size > 0) await writeFile(koboFolder, DB_SIDECARS[0]!, snapshotWal);
  return true;
}

/** Restore a parsed backup to a Kobo device. */
export async function restoreToDevice(
  deviceHandle: FileSystemDirectoryHandle,
  backupData: ParsedBackup,
  options: RestoreRunOptions = {},
): Promise<RestoreResult> {
  const {
    includeBooks = true,
    includeSettings = false,
    cleanExistingBooks = false,
    safetySnapshot = true,
    onProgress,
  } = options;
  const reportProgress = (stage: string, percent: number, details: Partial<RestoreProgress> = {}) =>
    onProgress?.({ stage, percent, ...details });

  try {
    reportProgress('Preparing device...', 0);

    let koboFolder: FileSystemDirectoryHandle;
    try {
      koboFolder = await deviceHandle.getDirectoryHandle('.kobo');
    } catch {
      throw new RestoreError('Could not find .kobo folder on device', ERROR_CODES.RESTORE_FAILED, {
        reason: 'Invalid Kobo device',
      });
    }

    // Merging needs a complete device database: with a pending WAL the main
    // file misses recent changes (e.g. a freshly signed-in account).
    let mode: RestoreMode = options.mode ?? 'full';
    const deviceDb = mode === 'merge' ? await readOptionalFile(koboFolder, DB_NAME) : null;
    if (mode === 'merge') {
      if (!deviceDb || deviceDb.size === 0) {
        mode = 'full';
      } else if (((await readOptionalFile(koboFolder, DB_SIDECARS[0]!))?.size ?? 0) > 0) {
        throw new RestoreError(
          'The Kobo database has unsaved changes. Eject the Kobo, wait a few seconds, reconnect it and try again.',
          ERROR_CODES.RESTORE_DEVICE_BUSY,
        );
      }
    }

    let snapshotSaved = false;
    if (safetySnapshot) {
      reportProgress('Saving a copy of the current database...', 3);
      try {
        snapshotSaved = await snapshotDeviceDatabase(koboFolder);
      } catch (error) {
        throw new RestoreError(
          'Could not save a safety copy of the current database',
          ERROR_CODES.RESTORE_FAILED,
          {
            originalError: error,
          },
        );
      }
    }

    if (includeBooks && cleanExistingBooks && backupData.bookFiles.length > 0) {
      reportProgress('Removing existing books...', 5);
      try {
        await cleanExistingBooksFromDevice(deviceHandle, backupData.bookPathMap);
      } catch (error) {
        console.warn('[RESTORE] Failed to clean existing books:', error);
      }
    }

    reportProgress(mode === 'merge' ? 'Merging reading data...' : 'Restoring database...', 15);
    let mergeReport: MergeReport | null = null;
    try {
      let dbData: ArrayBuffer | Uint8Array<ArrayBuffer> = backupData.database;
      if (mode === 'merge') {
        const target = await openDatabase(await deviceDb!.arrayBuffer());
        const source = await openDatabase(backupData.database);
        try {
          mergeReport = target.mergeReadingDataFrom(source, options.merge);
          target.sanitize();
          dbData = target.export();
        } finally {
          target.close();
          source.close();
        }
      } else {
        reportProgress('Sanitizing database...', 18);
        try {
          const db = await openDatabase(backupData.database);
          try {
            db.sanitize();
            dbData = db.export();
          } finally {
            db.close();
          }
        } catch (error) {
          console.warn('[RESTORE] Database sanitization failed, using original:', error);
        }
      }

      // CRITICAL: delete WAL/SHM files first. If we overwrite the .sqlite but
      // leave an old WAL behind, SQLite replays the mismatched WAL and corrupts it.
      await removeDatabaseSidecars(koboFolder);
      await writeFile(koboFolder, DB_NAME, dbData);
    } catch (error) {
      throw new RestoreError('Failed to write database to device', ERROR_CODES.RESTORE_FAILED, {
        originalError: error,
      });
    }
    reportProgress('Database restored', 20);

    const failedBooks: FailedBook[] = [];
    let settingsRestored = 0;
    const booksToWrite = includeBooks ? backupData.bookFiles : [];
    const extrasToWrite = includeSettings ? backupData.extraFiles : [];

    if (booksToWrite.length + extrasToWrite.length > 0) {
      const zipReader = new ZipReader(
        new BlobReader(backupData.file),
        backupData.password ? { password: backupData.password } : {},
      );
      try {
        const entries = new Map(
          (await zipReader.getEntries()).filter(isFileEntry).map((entry) => [entry.filename, entry]),
        );
        const totalBooks = booksToWrite.length;

        for (const [i, bookFile] of booksToWrite.entries()) {
          const zipEntry = entries.get(bookFile.path);
          const unsafe = unsafeBookPathReason(bookFile.originalPath);
          if (!zipEntry || unsafe) {
            failedBooks.push({
              name: bookFile.name,
              originalPath: bookFile.originalPath,
              error: unsafe ?? 'File not found in ZIP archive',
            });
            continue;
          }

          // Write to the original path: Kobo matches files to DB rows via
          // ContentID (file:///mnt/onboard/<originalPath>). A wrong path makes
          // the Kobo create a new empty record, losing progress and annotations.
          let lastError: unknown = null;
          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              await writeFileToPath(
                deviceHandle,
                bookFile.originalPath,
                await zipEntry.getData(new BlobWriter()),
              );
              lastError = null;
              break;
            } catch (error) {
              lastError = error;
              if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
          if (lastError) {
            console.error(`Failed to restore book after retries: ${bookFile.name}`, lastError);
            failedBooks.push({
              name: bookFile.name,
              originalPath: bookFile.originalPath,
              error: errorMessage(lastError),
            });
          }

          reportProgress(`Restoring books (${i + 1}/${totalBooks})...`, 20 + ((i + 1) / totalBooks) * 65, {
            filesProcessed: i + 1,
            totalFiles: totalBooks,
          });
        }

        if (extrasToWrite.length > 0) reportProgress('Restoring device settings...', 86);
        for (const extra of extrasToWrite) {
          const zipEntry = entries.get(extra.path);
          if (!zipEntry || !isPersonalisationPath(extra.originalPath)) continue;
          try {
            await writeFileToPath(deviceHandle, extra.originalPath, await zipEntry.getData(new BlobWriter()));
            settingsRestored++;
          } catch (error) {
            failedBooks.push({
              name: extra.name,
              originalPath: extra.originalPath,
              error: errorMessage(error),
            });
          }
        }
      } finally {
        await zipReader.close();
      }
      reportProgress('Files restored', 88);
    }

    // Post-restore validation: reopen the database from the device and count books
    reportProgress('Verifying restore...', 90);
    let verification: RestoreVerification | null = null;
    try {
      const restored = await (await (await koboFolder.getFileHandle(DB_NAME)).getFile()).arrayBuffer();
      const verifyDb = await openDatabase(restored);
      const dbBooksCount = verifyDb.getBooks().length;
      verifyDb.close();
      const expectedCount = backupData.stats?.totalBooks ?? backupData.metadata?.statistics?.totalBooks ?? 0;
      verification = {
        dbBooksCount,
        expectedCount,
        ok: expectedCount === 0 || dbBooksCount >= expectedCount,
      };
    } catch (verifyError) {
      console.warn('[RESTORE] Post-restore verification failed:', verifyError);
    }

    reportProgress('Restore complete', 100);

    return {
      success: true,
      booksRestored:
        booksToWrite.length - failedBooks.filter((f) => !isPersonalisationPath(f.originalPath)).length,
      failedBooks,
      databaseRestored: true,
      safetySnapshot: snapshotSaved,
      mode,
      merge: mergeReport,
      settingsRestored,
      metadata: backupData.metadata,
      verification,
    };
  } catch (error) {
    if (error instanceof RestoreError) throw error;
    throw new RestoreError('Failed to restore backup to device', ERROR_CODES.RESTORE_FAILED, {
      originalError: error,
    });
  }
}

export type CompatibilityCode = 'model' | 'firmware' | 'schema-newer' | 'old-backup';

export interface CompatibilityWarning {
  code: CompatibilityCode;
  /** Values for the localized message (e.g. { from, to } or { days }). */
  params: Record<string, string | number>;
  /** English fallback message. */
  message: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  warnings: CompatibilityWarning[];
}

const UNKNOWN = new Set(['', 'Unknown', 'Unknown Kobo Device', 'Kobo Device']);
const known = (value: string | undefined): value is string => !!value && !UNKNOWN.has(value);

/** Compare backup metadata with the target device. */
export function checkCompatibility(
  backupMetadata: BackupMetadata,
  deviceInfo: Partial<DeviceInfo> | null,
): CompatibilityResult {
  const warnings: CompatibilityWarning[] = [];
  const add = (code: CompatibilityCode, params: CompatibilityWarning['params'], message: string) =>
    warnings.push({ code, params, message });

  const backupModel = backupMetadata.device?.model;
  const backupFw = backupMetadata.device?.firmwareVersion;
  const backupSchema = backupMetadata.device?.schemaVersion ?? 0;
  const targetSchema = deviceInfo?.schemaVersion ?? 0;

  if (known(backupModel) && known(deviceInfo?.model) && backupModel !== deviceInfo.model) {
    add(
      'model',
      { from: backupModel, to: deviceInfo.model },
      `Backup is from a different device model (${backupModel} → ${deviceInfo.model}). Settings may not transfer correctly.`,
    );
  }
  if (known(backupFw) && known(deviceInfo?.firmwareVersion) && backupFw !== deviceInfo.firmwareVersion) {
    add(
      'firmware',
      { from: backupFw, to: deviceInfo.firmwareVersion },
      `Different firmware versions (${backupFw} → ${deviceInfo.firmwareVersion}). This should work but may have minor issues.`,
    );
  }
  // Nickel upgrades older schemas on boot, but cannot read a NEWER one.
  if (backupSchema > 0 && targetSchema > 0 && backupSchema > targetSchema) {
    add(
      'schema-newer',
      { from: backupSchema, to: targetSchema },
      `The backup database (schema ${backupSchema}) is newer than this device's firmware supports (schema ${targetSchema}). Update the Kobo firmware before restoring.`,
    );
  }
  if (backupMetadata.created) {
    const days = Math.floor((Date.now() - new Date(backupMetadata.created).getTime()) / 86_400_000);
    if (days > 180) {
      add(
        'old-backup',
        { days },
        `This backup is ${days} days old. Your Kobo may have received firmware updates since then.`,
      );
    }
  }

  return { compatible: !warnings.some((w) => w.code === 'schema-newer'), warnings };
}

export interface BackupPreviewData {
  created: string;
  deviceModel: string;
  firmwareVersion: string;
  statistics: {
    totalBooks: number;
    totalAnnotations: number;
    booksStarted: number;
    booksFinished: number;
    totalReadingTime: number;
  };
  contents: {
    databaseIncluded: boolean;
    booksIncluded: boolean;
    bookCount: number;
    annotationsIncluded: boolean;
  };
  options: Partial<BackupOptions>;
}

export function previewBackup({
  metadata,
  bookFiles,
  stats,
}: Pick<ParsedBackup, 'metadata' | 'bookFiles'> & Partial<Pick<ParsedBackup, 'stats'>>): BackupPreviewData {
  const s = metadata.statistics;
  return {
    created: metadata.created,
    deviceModel: metadata.device?.model || 'Unknown',
    firmwareVersion: metadata.device?.firmwareVersion || 'Unknown',
    // Prefer values computed from the database itself: metadata written by
    // older versions stored reading time in seconds while labelling it minutes.
    statistics: {
      totalBooks: stats?.totalBooks ?? s?.totalBooks ?? 0,
      totalAnnotations: s?.totalAnnotations || 0,
      booksStarted: stats?.booksStarted ?? s?.booksStarted ?? 0,
      booksFinished: stats?.booksFinished ?? s?.booksFinished ?? 0,
      totalReadingTime: stats?.totalMinutesRead ?? s?.totalReadingTime ?? 0,
    },
    contents: {
      databaseIncluded: true,
      booksIncluded: bookFiles.length > 0,
      bookCount: bookFiles.length,
      annotationsIncluded: metadata.options?.includeAnnotations || false,
    },
    options: metadata.options || {},
  };
}

export type TargetValidation = { valid: true } | { valid: false; error: string };

/** Check the restore target is a Kobo and writable. */
export async function validateRestoreTarget(
  deviceHandle: FileSystemDirectoryHandle,
): Promise<TargetValidation> {
  try {
    await deviceHandle.getDirectoryHandle('.kobo');
  } catch {
    return { valid: false, error: 'Not a valid Kobo device (missing .kobo folder)' };
  }
  try {
    await deviceHandle.getFileHandle('_test_write.tmp', { create: true });
    await deviceHandle.removeEntry('_test_write.tmp');
  } catch {
    return { valid: false, error: 'Cannot write to device (check permissions)' };
  }
  return { valid: true };
}

/** Kobo ContentID ("file:///mnt/onboard/a/b.epub") → device-relative path ("a/b.epub"). */
export function contentIdToRelativePath(contentId: string): string {
  let path = contentId.replace(/^file:\/\//, '').replace(/^\/mnt\/onboard\//, '');
  // ContentIDs may be URL-encoded (%20 etc.); decoding is a no-op for plain paths.
  try {
    path = decodeURIComponent(path);
  } catch {
    // keep as-is if malformed
  }
  return path;
}

/**
 * Read the backup database once: filename → original relative path (for old
 * flat-format backups) and reading statistics.
 */
async function inspectBackupDatabase(
  databaseBuffer: ArrayBuffer,
): Promise<{ bookPathMap: Map<string, string>; stats: ReadingStats | null }> {
  const bookPathMap = new Map<string, string>();
  try {
    const db = await openDatabase(databaseBuffer);
    try {
      for (const book of db.getBooks()) {
        const originalPath = contentIdToRelativePath(book.ContentID);
        const filename = originalPath.split('/').pop();
        // First occurrence wins for duplicate filenames in different folders.
        if (filename && !bookPathMap.has(filename)) bookPathMap.set(filename, originalPath);
      }
      return { bookPathMap, stats: db.getReadingStats() };
    } finally {
      db.close();
    }
  } catch (error) {
    console.error('[RESTORE] Failed to read backup database:', error);
    return { bookPathMap, stats: null };
  }
}

/** Never recursively delete these top-level entries. */
const PROTECTED_DIRS = new Set([
  '',
  '.',
  '..',
  '.kobo',
  '.adobe-digital-editions',
  'System Volume Information',
]);

/** Remove book folders/files that the restore would overwrite (opt-in). */
async function cleanExistingBooksFromDevice(
  deviceHandle: FileSystemDirectoryHandle,
  bookPathMap: Map<string, string>,
): Promise<number> {
  const dirsToClean = new Set<string>();
  const filesToClean = new Set<string>();

  for (const [filename, originalPath] of bookPathMap) {
    const [topLevel, ...rest] = originalPath.split('/');
    if (rest.length > 0 && topLevel && !PROTECTED_DIRS.has(topLevel)) dirsToClean.add(topLevel);
    // Also remove flat copies in the root left by older buggy restores.
    filesToClean.add(filename);
  }

  let cleanedCount = 0;
  const remove = async (name: string, recursive: boolean) => {
    try {
      await deviceHandle.removeEntry(name, { recursive });
      cleanedCount++;
    } catch (error) {
      if ((error as { name?: string } | null)?.name !== 'NotFoundError') {
        console.warn(`[RESTORE CLEANUP] Could not remove ${name}:`, errorMessage(error));
      }
    }
  };

  for (const dirName of dirsToClean) await remove(dirName, true);
  for (const filename of filesToClean) await remove(filename, false);
  return cleanedCount;
}
