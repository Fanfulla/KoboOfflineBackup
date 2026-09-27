/**
 * Restore utilities: parse backup ZIPs and write them back to a Kobo device.
 */

import { ZipReader, BlobReader, BlobWriter, TextWriter, type Entry, type FileEntry } from '@zip.js/zip.js';
import { writeFile, writeFileToPath } from './fileSystem.ts';
import { RestoreError, ERROR_CODES, errorMessage } from './errors.ts';
import { validateBackupMetadata } from './validation.ts';
import { openDatabase } from './koboDatabase.ts';
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
  /** Reading statistics computed from the backup database (null if unreadable). */
  stats: ReadingStats | null;
  file: Blob;
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
  metadata: BackupMetadata;
  verification: RestoreVerification | null;
}

export interface RestoreProgress {
  stage: string;
  percent: number;
  filesProcessed?: number;
  totalFiles?: number;
}

export type RestoreRunOptions = Partial<
  Pick<BackupOptions, 'includeBooks' | 'includeAnnotations' | 'includeProgress'>
> & {
  /**
   * Opt-in: recursively removes top-level book folders before restore. Off by
   * default because it can delete files added to those folders AFTER the backup.
   */
  cleanExistingBooks?: boolean;
  onProgress?: (progress: RestoreProgress) => void;
};

const isFileEntry = (entry: Entry): entry is FileEntry => !entry.directory;

/** Parse and validate a backup ZIP file. */
export async function parseBackupFile(file: Blob): Promise<ParsedBackup> {
  const zipReader = new ZipReader(new BlobReader(file));
  try {
    const entries = (await zipReader.getEntries()).filter(isFileEntry);

    const metadataEntry = entries.find((e) => e.filename === 'backup-metadata.json');
    const dbEntry = entries.find((e) => e.filename === 'KoboReader.sqlite');

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
        missingFile: 'KoboReader.sqlite',
      });
    }

    const metadata: unknown = JSON.parse(await metadataEntry.getData(new TextWriter()));
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
      .filter((entry) => entry.filename.startsWith('books/'))
      .map((entry) => {
        // New format: "books/Author/book.epub" (full relative path embedded in the ZIP)
        // Old format: "books/book.epub" (filename only, path recovered via pathMap)
        const zipRelPath = entry.filename.slice('books/'.length);
        const name = zipRelPath.split('/').pop()!;
        const originalPath = zipRelPath.includes('/')
          ? zipRelPath
          : (bookPathMap.get(zipRelPath) ?? zipRelPath);
        return { name, path: entry.filename, originalPath };
      });

    return {
      metadata: metadata as BackupMetadata,
      database,
      bookFiles,
      bookPathMap,
      stats,
      file,
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

/** Restore a parsed backup to a Kobo device. */
export async function restoreToDevice(
  deviceHandle: FileSystemDirectoryHandle,
  backupData: ParsedBackup,
  options: RestoreRunOptions = {},
): Promise<RestoreResult> {
  const { includeBooks = true, cleanExistingBooks = false, onProgress } = options;
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

    if (includeBooks && cleanExistingBooks && backupData.bookFiles.length > 0) {
      reportProgress('Removing existing books...', 5);
      try {
        await cleanExistingBooksFromDevice(deviceHandle, backupData.bookPathMap);
      } catch (error) {
        console.warn('[RESTORE] Failed to clean existing books:', error);
      }
    }

    reportProgress('Restoring database...', 15);
    try {
      // CRITICAL: delete WAL/SHM files first. If we overwrite the .sqlite but
      // leave an old WAL behind, SQLite replays the mismatched WAL and corrupts it.
      for (const name of ['KoboReader.sqlite-wal', 'KoboReader.sqlite-shm']) {
        await koboFolder.removeEntry(name).catch(() => {});
      }

      reportProgress('Sanitizing database...', 18);
      let dbData: ArrayBuffer | Uint8Array<ArrayBuffer> = backupData.database;
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

      await writeFile(koboFolder, 'KoboReader.sqlite', dbData);
    } catch (error) {
      throw new RestoreError('Failed to write database to device', ERROR_CODES.RESTORE_FAILED, {
        originalError: error,
      });
    }
    reportProgress('Database restored', 20);

    const failedBooks: FailedBook[] = [];
    if (includeBooks && backupData.bookFiles.length > 0) {
      const totalBooks = backupData.bookFiles.length;
      const zipReader = new ZipReader(new BlobReader(backupData.file));
      try {
        const entries = new Map(
          (await zipReader.getEntries()).filter(isFileEntry).map((entry) => [entry.filename, entry]),
        );

        for (const [i, bookFile] of backupData.bookFiles.entries()) {
          const zipEntry = entries.get(bookFile.path);
          if (!zipEntry) {
            failedBooks.push({
              name: bookFile.name,
              originalPath: bookFile.originalPath,
              error: 'File not found in ZIP archive',
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
      } finally {
        await zipReader.close();
      }
      reportProgress('Books restored', 85);
    }

    // Post-restore validation: reopen the database from the device and count books
    reportProgress('Verifying restore...', 90);
    let verification: RestoreVerification | null = null;
    try {
      const restored = await (
        await (await koboFolder.getFileHandle('KoboReader.sqlite')).getFile()
      ).arrayBuffer();
      const verifyDb = await openDatabase(restored);
      const dbBooksCount = verifyDb.getBooks().length;
      verifyDb.close();
      const expectedCount = backupData.metadata?.statistics?.totalBooks || 0;
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
      booksRestored: includeBooks ? backupData.bookFiles.length - failedBooks.length : 0,
      failedBooks,
      databaseRestored: true,
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
