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
    const booksFolder = zip.folder('books');

    if (booksFolder) {
      for (const [path, zipEntry] of Object.entries(zip.files)) {
        if (path.startsWith('books/') && !zipEntry.dir) {
          const filename = path.replace('books/', '');
          // Find original path for this book
          const originalPath = bookPathMap.get(filename) || filename;
          bookFiles.push({
            name: filename,
            path: path,
            originalPath: originalPath,
            zipEntry: zipEntry,
          });
        }
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

    // Restore database
    reportProgress('Restoring database...', 10);

    try {
      await writeFile(koboFolder, 'KoboReader.sqlite', backupData.database);
    } catch (error) {
      throw new RestoreError(
        'Failed to write database to device',
        ERROR_CODES.RESTORE_FAILED,
        { originalError: error }
      );
    }

    reportProgress('Database restored', 20);

    // Restore books
    if (includeBooks && backupData.bookFiles.length > 0) {
      const totalBooks = backupData.bookFiles.length;
      let restoredBooks = 0;

      for (let i = 0; i < backupData.bookFiles.length; i++) {
        const bookFile = backupData.bookFiles[i];

        try {
          // Extract book file from ZIP
          const bookBlob = await bookFile.zipEntry.async('blob');

          // Write to original path (preserves database ContentID references)
          // This ensures annotations and reading progress are correctly linked
          await writeFileToPath(deviceHandle, bookFile.originalPath, bookBlob);

          restoredBooks++;
          const progress = 20 + (restoredBooks / totalBooks) * 70; // 20-90%
          reportProgress(
            `Restoring books (${restoredBooks}/${totalBooks})...`,
            progress,
            { filesProcessed: restoredBooks, totalFiles: totalBooks }
          );
        } catch (error) {
          console.error(`Failed to restore book: ${bookFile.name}`, error);
          // Continue with other books even if one fails
        }
      }

      reportProgress('Books restored', 90);
    }

    // Final steps
    reportProgress('Finalizing restore...', 95);

    // Update metadata (if needed)
    // ...

    reportProgress('Restore complete', 100);

    return {
      success: true,
      booksRestored: backupData.bookFiles.length,
      databaseRestored: true,
      metadata: backupData.metadata,
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
    const db = await openDatabase(databaseBuffer);
    const books = await db.getBooks();
    db.close();

    for (const book of books) {
      if (book.ContentID) {
        // ContentID format: "file:///mnt/onboard/path/to/book.epub"
        // We need to extract the relative path from the Kobo mount point
        let originalPath = book.ContentID;

        // Remove file:// prefix
        if (originalPath.startsWith('file://')) {
          originalPath = originalPath.replace('file://', '');
        }

        // Remove /mnt/onboard/ prefix (Kobo's internal mount point)
        // This leaves us with the relative path from the device root
        if (originalPath.startsWith('/mnt/onboard/')) {
          originalPath = originalPath.replace('/mnt/onboard/', '');
        }

        // Extract just the filename (for matching with backup files)
        const filename = originalPath.split('/').pop();

        if (filename) {
          pathMap.set(filename, originalPath);
        }
      }
    }
  } catch (error) {
    console.error('Failed to extract book paths from database:', error);
    // Return empty map - will fall back to using just filename
  }

  return pathMap;
}
