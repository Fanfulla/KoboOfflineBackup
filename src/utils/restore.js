/**
 * Restore utilities for Kobo Backup Manager
 * Handles extracting and restoring backup ZIPs to Kobo devices
 */

import JSZip from 'jszip';
import { writeFile, writeFileToPath } from './fileSystem.js';
import { RestoreError, ERROR_CODES } from './errors.js';
import { validateBackupMetadata } from './validation.js';
import { openDatabase } from './koboDatabase.js';

/**
 * Parse and validate a backup ZIP file
 * @param {File|Blob} file - Backup ZIP file
 * @returns {Promise<object>} Parsed backup data
 */
export async function parseBackupFile(file) {
  try {
    // Load ZIP
    const zip = await JSZip.loadAsync(file);

    // Check for required files
    const requiredFiles = ['KoboReader.sqlite', 'backup-metadata.json'];

    for (const filename of requiredFiles) {
      if (!zip.files[filename]) {
        throw new RestoreError(
          `Invalid backup: missing ${filename}`,
          ERROR_CODES.RESTORE_INVALID_FILE,
          { missingFile: filename }
        );
      }
    }

    // Parse metadata
    const metadataText = await zip.files['backup-metadata.json'].async('text');
    const metadata = JSON.parse(metadataText);

    // Validate metadata
    const validation = validateBackupMetadata(metadata);
    if (!validation.valid) {
      throw new RestoreError(
        `Invalid backup metadata: ${validation.error}`,
        ERROR_CODES.RESTORE_INVALID_FILE,
        { validationError: validation.error }
      );
    }

    // Extract database
    const database = await zip.files['KoboReader.sqlite'].async('arraybuffer');

    // Extract original book paths from database
    const bookPathMap = await extractBookPathsFromDatabase(database);

    // Get list of book files with their original paths
    const bookFiles = [];

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (path.startsWith('books/') && !zipEntry.dir) {
        // zipRelPath: the part after "books/"
        // New backup format: "Libri/Author/book.epub" (full relative path embedded in ZIP)
        // Old backup format: "book.epub" (filename only, path recovered via pathMap)
        const zipRelPath = path.replace('books/', '');
        const displayName = zipRelPath.split('/').pop();

        let originalPath;
        if (zipRelPath.includes('/')) {
          // New format: path is already embedded in the ZIP structure — use it directly.
          // This is the most reliable approach since it doesn't depend on the database lookup.
          originalPath = zipRelPath;
        } else {
          // Old backup format (backwards compatibility):
          // look up the full path from the database-derived pathMap.
          originalPath = bookPathMap.get(zipRelPath) || zipRelPath;
        }

        bookFiles.push({
          name: displayName,
          path: path,
          originalPath: originalPath,
          zipEntry: zipEntry,
        });
      }
    }

    return {
      metadata,
      database,
      bookFiles,
      bookPathMap,
      zip,
      valid: true,
    };
  } catch (error) {
    if (error instanceof RestoreError) {
      throw error;
    }

    throw new RestoreError(
      'Failed to parse backup file',
      ERROR_CODES.RESTORE_CORRUPTED,
      { originalError: error }
    );
  }
}

/**
 * Restore backup to a Kobo device
 * @param {FileSystemDirectoryHandle} deviceHandle - Kobo device directory handle
 * @param {object} backupData - Parsed backup data from parseBackupFile()
 * @param {object} options - Restore options
 * @returns {Promise<object>} Restore result
 */
export async function restoreToDevice(deviceHandle, backupData, options = {}) {
  const {
    includeBooks = true,
    includeAnnotations = true,
    includeProgress = true,
    cleanExistingBooks = true, // NEW: Clean existing books before restore
    onProgress = null,
  } = options;

  try {
    const reportProgress = (stage, percent, details = {}) => {
      if (onProgress) {
        onProgress({ stage, percent, ...details });
      }
    };

    reportProgress('Preparing device...', 0);

    // Get .kobo folder
    let koboFolder;
    try {
      koboFolder = await deviceHandle.getDirectoryHandle('.kobo');
    } catch (error) {
      throw new RestoreError(
        'Could not find .kobo folder on device',
        ERROR_CODES.RESTORE_FAILED,
        { reason: 'Invalid Kobo device' }
      );
    }

    // Clean existing books if requested
    if (includeBooks && cleanExistingBooks && backupData.bookFiles.length > 0) {
      reportProgress('Removing existing books...', 5);

      try {
        const cleanedCount = await cleanExistingBooksFromDevice(deviceHandle, backupData.bookPathMap, reportProgress);
        console.log(`[RESTORE] Cleaned ${cleanedCount} existing book files/folders`);
      } catch (error) {
        console.warn('[RESTORE] Failed to clean existing books:', error);
        // Continue with restore even if cleanup fails
      }
    }

    // Restore database
    reportProgress('Restoring database...', 15);

    try {
      // CRITICAL: Delete existing WAL/SHM files to prevent database corruption
      // If we overwrite the .sqlite file but leave old WAL files, SQLite will try to recover
      // from the mismatched WAL, corrupting the database.
      try {
        await koboFolder.removeEntry('KoboReader.sqlite-wal');
        console.log('[RESTORE] Removed existing WAL file');
      } catch (e) { /* Warning is fine, file might not exist */ }

      try {
        await koboFolder.removeEntry('KoboReader.sqlite-shm');
        console.log('[RESTORE] Removed existing SHM file');
      } catch (e) { /* Warning is fine */ }

      // NEW: Sanitize database before writing
      reportProgress('Sanitizing database...', 18);
      let dbData = backupData.database;
      try {
        const db = await openDatabase(backupData.database);
        await db.sanitize();
        dbData = await db.export();
        // db.close() is handled by garbage collection or we could add close() if we refactor,
        // but openDatabase returns a new instance. Ideally we should close it.
        db.close();
        console.log('[RESTORE] Database sanitized and exported');
      } catch (error) {
        console.warn('[RESTORE] Database sanitization failed, using original:', error);
        // Fallback to original
      }

      await writeFile(koboFolder, 'KoboReader.sqlite', dbData);
    } catch (error) {
      throw new RestoreError(
        'Failed to write database to device',
        ERROR_CODES.RESTORE_FAILED,
        { originalError: error }
      );
    }

    reportProgress('Database restored', 20);

    // Restore books
    const failedBooks = [];
    if (includeBooks && backupData.bookFiles.length > 0) {
      const totalBooks = backupData.bookFiles.length;
      let restoredBooks = 0;

      for (let i = 0; i < backupData.bookFiles.length; i++) {
        const bookFile = backupData.bookFiles[i];

        // Retry up to 2 times before marking a book as failed
        let lastError = null;
        let success = false;

        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            // Extract book file from ZIP
            const bookBlob = await bookFile.zipEntry.async('blob');

            // Log the path being used (first 5 books only)
            if (i < 5) {
              console.log(`[RESTORE] Book ${i + 1}: "${bookFile.name}" -> "${bookFile.originalPath}"`);
            }

            // Write to original path (preserves database ContentID references).
            // The Kobo matches book files to DB records via ContentID which encodes
            // the full path (file:///mnt/onboard/<originalPath>). If this path is
            // wrong, the Kobo creates a new empty record and progress/annotations
            // are lost.
            await writeFileToPath(deviceHandle, bookFile.originalPath, bookBlob);

            success = true;
            break;
          } catch (error) {
            lastError = error;
            if (attempt < 2) {
              // Brief pause before retry
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }

        if (success) {
          restoredBooks++;
        } else {
          console.error(`Failed to restore book after retries: ${bookFile.name}`, lastError);
          failedBooks.push({
            name: bookFile.name,
            originalPath: bookFile.originalPath,
            error: lastError?.message || 'Unknown error',
          });
        }

        const progress = 20 + ((i + 1) / totalBooks) * 65; // 20-85%
        reportProgress(
          `Restoring books (${i + 1}/${totalBooks})...`,
          progress,
          { filesProcessed: i + 1, totalFiles: totalBooks }
        );
      }

      reportProgress('Books restored', 85);
    }

    // Post-restore validation: reopen the database from the device and count books
    reportProgress('Verifying restore...', 90);
    let verification = null;
    try {
      const restoredDbHandle = await koboFolder.getFileHandle('KoboReader.sqlite');
      const restoredDbBuffer = await (await restoredDbHandle.getFile()).arrayBuffer();
      const verifyDb = await openDatabase(restoredDbBuffer);
      const verifyBooks = await verifyDb.getBooks();
      verifyDb.close();

      const dbBooksCount = verifyBooks.length;
      const expectedCount = backupData.metadata?.statistics?.totalBooks || 0;
      verification = {
        dbBooksCount,
        expectedCount,
        ok: expectedCount === 0 || dbBooksCount >= expectedCount,
      };
      console.log(`[RESTORE] Verification: ${dbBooksCount}/${expectedCount} books in restored DB`);
    } catch (verifyError) {
      console.warn('[RESTORE] Post-restore verification failed:', verifyError);
    }

    // Final steps
    reportProgress('Finalizing restore...', 95);
    reportProgress('Restore complete', 100);

    return {
      success: true,
      booksRestored: backupData.bookFiles.length - failedBooks.length,
      failedBooks,
      databaseRestored: true,
      metadata: backupData.metadata,
      verification,
    };
  } catch (error) {
    if (error instanceof RestoreError) {
      throw error;
    }

    throw new RestoreError(
      'Failed to restore backup to device',
      ERROR_CODES.RESTORE_FAILED,
      { originalError: error }
    );
  }
}

/**
 * Check compatibility between backup and target device
 * @param {object} backupMetadata - Backup metadata
 * @param {object} deviceInfo - Target device info
 * @returns {{compatible: boolean, warnings: string[]}} Compatibility check result
 */
export function checkCompatibility(backupMetadata, deviceInfo) {
  const warnings = [];

  // Check device model
  if (backupMetadata.device?.model && deviceInfo?.model) {
    if (backupMetadata.device.model !== deviceInfo.model) {
      warnings.push(
        `Backup is from a different device model (${backupMetadata.device.model} → ${deviceInfo.model}). Settings may not transfer correctly.`
      );
    }
  }

  // Check firmware version
  if (backupMetadata.device?.firmwareVersion && deviceInfo?.firmwareVersion) {
    const backupVersion = backupMetadata.device.firmwareVersion;
    const deviceVersion = deviceInfo.firmwareVersion;

    if (backupVersion !== deviceVersion) {
      warnings.push(
        `Different firmware versions (${backupVersion} → ${deviceVersion}). This should work but may have minor issues.`
      );
    }
  }

  // Check backup age
  if (backupMetadata.created) {
    const backupDate = new Date(backupMetadata.created);
    const daysSinceBackup = (new Date() - backupDate) / (1000 * 60 * 60 * 24);

    if (daysSinceBackup > 180) {
      warnings.push(
        `This backup is ${Math.floor(daysSinceBackup)} days old. Your Kobo may have received firmware updates since then.`
      );
    }
  }

  // Check app version compatibility
  if (backupMetadata.compatibility?.minAppVersion) {
    const currentVersion = '1.0.0';
    // In a real app, you'd compare versions properly
    // For now, just check if it exists
  }

  return {
    compatible: true, // Backups are generally forward-compatible
    warnings,
  };
}

/**
 * Preview backup contents without restoring
 * @param {object} backupData - Parsed backup data
 * @returns {object} Backup preview information
 */
export function previewBackup(backupData) {
  const { metadata, bookFiles } = backupData;

  return {
    created: metadata.created,
    deviceModel: metadata.device?.model || 'Unknown',
    firmwareVersion: metadata.device?.firmwareVersion || 'Unknown',

    statistics: {
      totalBooks: metadata.statistics?.totalBooks || 0,
      totalAnnotations: metadata.statistics?.totalAnnotations || 0,
      booksStarted: metadata.statistics?.booksStarted || 0,
      booksFinished: metadata.statistics?.booksFinished || 0,
      totalReadingTime: metadata.statistics?.totalReadingTime || 0,
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

/**
 * Extract annotations from backup without restoring
 * @param {object} backupData - Parsed backup data
 * @returns {Promise<Array<object>>} Array of annotations
 */
export async function extractAnnotations(backupData) {
  try {
    // Check if annotations folder exists
    const annotationsFile = backupData.zip.files['annotations/all-annotations.md'];

    if (annotationsFile) {
      const markdown = await annotationsFile.async('text');
      return {
        format: 'markdown',
        content: markdown,
      };
    }

    // If no pre-exported annotations, would need to parse database
    // For now, return empty
    return {
      format: 'none',
      content: '',
    };
  } catch (error) {
    return {
      format: 'none',
      content: '',
      error: error.message,
    };
  }
}

/**
 * Validate restore target device
 * @param {FileSystemDirectoryHandle} deviceHandle - Device directory handle
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 */
export async function validateRestoreTarget(deviceHandle) {
  try {
    // Check for .kobo folder
    let koboFolder;
    try {
      koboFolder = await deviceHandle.getDirectoryHandle('.kobo');
    } catch (error) {
      return {
        valid: false,
        error: 'Not a valid Kobo device (missing .kobo folder)',
      };
    }

    // Check if we can write to the device
    try {
      // Try to get write permission
      const testFile = await deviceHandle.getFileHandle('_test_write.tmp', { create: true });
      // Clean up test file
      await deviceHandle.removeEntry('_test_write.tmp');
    } catch (error) {
      return {
        valid: false,
        error: 'Cannot write to device (check permissions)',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Validation failed: ${error.message}`,
    };
  }
}
/**
 * Extract book file paths from backup database
 * Creates a mapping from filename to original path (without file:// prefix)
 * @param {ArrayBuffer} databaseBuffer - SQLite database as ArrayBuffer
 * @returns {Promise<Map<string, string>>} Map of filename -> original relative path
 */
async function extractBookPathsFromDatabase(databaseBuffer) {
  const pathMap = new Map();

  try {
    console.log('[RESTORE DEBUG] Opening database to extract book paths...');
    const db = await openDatabase(databaseBuffer);
    const books = await db.getBooks();
    db.close();

    console.log(`[RESTORE DEBUG] Found ${books.length} books in database`);

    // Log first few books to see the data structure
    if (books.length > 0) {
      console.log('[RESTORE DEBUG] Sample book data:', {
        ContentID: books[0].ContentID,
        FilePath: books[0].FilePath,
        Title: books[0].Title
      });
    }

    for (const book of books) {
      // Use ContentID if available, otherwise try FilePath
      const contentPath = book.ContentID || book.FilePath;

      if (contentPath) {
        // ContentID format: "file:///mnt/onboard/path/to/book.epub"
        // We need to extract the relative path from the Kobo mount point
        let originalPath = contentPath;

        // Remove file:// prefix (note: file:///mnt/... → /mnt/... after removing file://)
        if (originalPath.startsWith('file://')) {
          originalPath = originalPath.replace('file://', '');
        }

        // Remove /mnt/onboard/ prefix (Kobo's internal mount point)
        // This leaves us with the relative path from the device root
        if (originalPath.startsWith('/mnt/onboard/')) {
          originalPath = originalPath.replace('/mnt/onboard/', '');
        }

        // CRITICAL: URL-decode the path so filenames with spaces/special chars
        // (stored as %20 etc. in ContentID) match the actual files in the ZIP.
        // decodeURIComponent is a no-op for paths that aren't encoded.
        try {
          originalPath = decodeURIComponent(originalPath);
        } catch (e) {
          // If decoding fails (malformed URI), keep the original
        }

        // Extract just the filename (for matching with backup files stored by name only)
        const filename = originalPath.split('/').pop();

        if (filename) {
          // Only set if not already present: first occurrence wins.
          // Duplicate filenames with different paths will use the first one.
          if (!pathMap.has(filename)) {
            pathMap.set(filename, originalPath);
          }
        }
      }
    }

    console.log(`[RESTORE DEBUG] Created path map with ${pathMap.size} entries`);

    // Log some sample mappings
    const entries = Array.from(pathMap.entries()).slice(0, 3);
    console.log('[RESTORE DEBUG] Sample path mappings:', entries);

  } catch (error) {
    console.error('[RESTORE DEBUG] Failed to extract book paths from database:', error);
    // Return empty map - will fall back to using just filename
  }

  return pathMap;
}

/**
 * Clean existing book files from device before restore
 * Removes book files that would conflict with the restore
 * @param {FileSystemDirectoryHandle} deviceHandle - Device root handle
 * @param {Map<string, string>} bookPathMap - Map of filename -> original path
 * @param {Function} reportProgress - Progress callback
 * @returns {Promise<number>} Number of items cleaned
 */
async function cleanExistingBooksFromDevice(deviceHandle, bookPathMap, reportProgress) {
  let cleanedCount = 0;

  // Sets to track what to remove
  const dirsToClean = new Set();
  const filesToClean = new Set();

  for (const [filename, originalPath] of bookPathMap.entries()) {
    // 1. Identify destination directories to clean (e.g. "AuthorName/")
    const parts = originalPath.split('/');
    if (parts.length > 1) {
      dirsToClean.add(parts[0]);
    }

    // 2. ALWAYS identify the flat filename in root to clean
    // This removes the "duplicates" caused by the previous buggy restore
    // or manual flat copies
    filesToClean.add(filename);
  }

  console.log(`[RESTORE CLEANUP] Targets: ${dirsToClean.size} directories, ${filesToClean.size} root files`);

  // Remove top-level directories (author folders)
  for (const dirName of dirsToClean) {
    try {
      await deviceHandle.removeEntry(dirName, { recursive: true });
      cleanedCount++;
      console.log(`[RESTORE CLEANUP] Removed directory: ${dirName}`);
    } catch (error) {
      // Directory might not exist, that's fine
      if (error.name !== 'NotFoundError') {
        console.warn(`[RESTORE CLEANUP] Could not remove directory ${dirName}:`, error.message);
      }
    }
  }

  // Remove root-level book files
  let fileCount = 0;
  for (const filename of filesToClean) {
    try {
      await deviceHandle.removeEntry(filename);
      cleanedCount++;
      fileCount++;
    } catch (error) {
      // File might not exist, that's fine
      if (error.name !== 'NotFoundError') {
        // Only warn for unexpected errors
        console.warn(`[RESTORE CLEANUP] Could not remove file ${filename}:`, error.message);
      }
    }
  }
  console.log(`[RESTORE CLEANUP] Removed ${fileCount} root files`);

  return cleanedCount;
}
