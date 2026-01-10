/**
 * Backup creation utilities using JSZip
 */

import JSZip from 'jszip';
import { saveFile } from './fileSystem.js';
import { BackupError, ERROR_CODES } from './errors.js';

/**
 * Create a backup ZIP file from Kobo data
 * @param {object} koboData - Kobo device data
 * @param {object} options - Backup options
 * @returns {Promise<{filename: string, size: number, blob: Blob}>} Backup result
 */
export async function createBackup(koboData, options = {}) {
  const {
    includeBooks = true,
    includeAnnotations = true,
    includeProgress = true,
    includeSettings = false,
    onProgress = null,
  } = options;

  try {
    const zip = new JSZip();

    // Report progress
    const reportProgress = (stage, percent) => {
      if (onProgress) {
        onProgress({ stage, percent });
      }
    };

    reportProgress('Preparing backup...', 0);

    // Add database file
    if (koboData.database) {
      zip.file('KoboReader.sqlite', koboData.database);
      reportProgress('Adding database...', 10);
    } else {
      throw new BackupError(
        'No database provided',
        ERROR_CODES.BACKUP_FAILED,
        { reason: 'Missing database file' }
      );
    }

    // Add books
    if (includeBooks && koboData.bookFiles && koboData.bookFiles.length > 0) {
      const booksFolder = zip.folder('books');
      const totalBooks = koboData.bookFiles.length;

      for (let i = 0; i < koboData.bookFiles.length; i++) {
        const bookFile = koboData.bookFiles[i];
        booksFolder.file(bookFile.name, bookFile.blob);

        const progress = 10 + (i / totalBooks) * 60; // 10-70%
        reportProgress(`Adding books (${i + 1}/${totalBooks})...`, progress);
      }
    }

    reportProgress('Adding metadata...', 75);

    // Create backup metadata
    const metadata = {
      version: '1.0.0',
      created: new Date().toISOString(),
      generator: 'Kobo Backup Manager v1.0',

      device: koboData.deviceInfo || {
        model: 'Unknown',
        firmwareVersion: 'Unknown',
      },

      statistics: {
        totalBooks: koboData.books?.length || 0,
        totalAnnotations: koboData.annotations?.length || 0,
        totalSize: koboData.totalSize || 0,
        booksStarted: koboData.stats?.booksStarted || 0,
        booksFinished: koboData.stats?.booksFinished || 0,
        totalReadingTime: koboData.stats?.totalMinutesRead || 0,
      },

      options: {
        includeBooks,
        includeAnnotations,
        includeProgress,
        includeSettings,
      },

      integrity: {
        databaseChecksum: await calculateChecksum(koboData.database),
        filesChecked: koboData.bookFiles?.length || 0,
        errors: [],
      },

      compatibility: {
        minAppVersion: '1.0.0',
        supportedDevices: ['all'],
      },
    };

    zip.file('backup-metadata.json', JSON.stringify(metadata, null, 2));

    // Optionally add human-readable exports
    if (includeAnnotations && koboData.annotations && koboData.annotations.length > 0) {
      const annotationsFolder = zip.folder('annotations');

      // Export annotations as Markdown
      const annotationsMarkdown = exportAnnotationsAsMarkdown(koboData.annotations);
      annotationsFolder.file('all-annotations.md', annotationsMarkdown);

      reportProgress('Exporting annotations...', 80);
    }

    // Add README
    const readme = generateReadme(metadata);
    zip.file('README.txt', readme);

    reportProgress('Compressing backup...', 85);

    // Generate ZIP file
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // Balance between size and speed
      },
    }, (metadata) => {
      // Progress callback during compression
      const progress = 85 + (metadata.percent * 0.15); // 85-100%
      reportProgress('Compressing backup...', progress);
    });

    reportProgress('Backup complete', 100);

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `kobo_backup_${timestamp}.zip`;

    return {
      filename,
      size: blob.size,
      blob,
      metadata,
    };
  } catch (error) {
    console.error('[BACKUP ERROR] Failed to create backup:', error);
    console.error('[BACKUP ERROR] Error message:', error.message);
    console.error('[BACKUP ERROR] Error stack:', error.stack);
    throw new BackupError(
      'Failed to create backup',
      ERROR_CODES.BACKUP_FAILED,
      { originalError: error }
    );
  }
}

/**
 * Save backup to user's downloads folder
 * @param {Blob} blob - Backup blob
 * @param {string} filename - Filename for backup
 * @returns {Promise<{filename: string, size: number}>} Save result
 */
export async function saveBackup(blob, filename) {
  try {
    return await saveFile(blob, {
      fileName: filename,
      extensions: ['.zip'],
    });
  } catch (error) {
    throw new BackupError(
      'Failed to save backup file',
      ERROR_CODES.BACKUP_FAILED,
      { originalError: error }
    );
  }
}

/**
 * Calculate checksum of data (SHA-256)
 * @param {ArrayBuffer|Blob} data - Data to checksum
 * @returns {Promise<string>} Hex checksum
 */
export async function calculateChecksum(data) {
  try {
    let buffer;

    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else {
      buffer = data;
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hashHex}`;
  } catch (error) {
    return 'unavailable';
  }
}

/**
 * Export annotations as Markdown
 * @param {Array<object>} annotations - Array of annotation objects
 * @returns {string} Markdown formatted annotations
 */
function exportAnnotationsAsMarkdown(annotations) {
  let markdown = '# Kobo Annotations Export\n\n';
  markdown += `Exported on: ${new Date().toLocaleString()}\n\n`;
  markdown += `Total annotations: ${annotations.length}\n\n`;
  markdown += '---\n\n';

  // Group by book
  const byBook = {};
  annotations.forEach(annotation => {
    const bookTitle = annotation.BookTitle || 'Unknown Book';
    if (!byBook[bookTitle]) {
      byBook[bookTitle] = [];
    }
    byBook[bookTitle].push(annotation);
  });

  // Export each book's annotations
  Object.entries(byBook).forEach(([bookTitle, bookAnnotations]) => {
    markdown += `## ${bookTitle}\n\n`;

    const author = bookAnnotations[0]?.Author;
    if (author) {
      markdown += `*by ${author}*\n\n`;
    }

    bookAnnotations.forEach((annotation, index) => {
      markdown += `### Annotation ${index + 1}\n\n`;

      if (annotation.HighlightedText) {
        markdown += `> ${annotation.HighlightedText}\n\n`;
      }

      if (annotation.Note) {
        markdown += `**Note:** ${annotation.Note}\n\n`;
      }

      if (annotation.DateCreated) {
        markdown += `*Created: ${new Date(annotation.DateCreated).toLocaleString()}*\n\n`;
      }

      markdown += '---\n\n';
    });
  });

  return markdown;
}

/**
 * Generate README for backup
 * @param {object} metadata - Backup metadata
 * @returns {string} README content
 */
function generateReadme(metadata) {
  return `Kobo Backup Archive
====================

Created: ${new Date(metadata.created).toLocaleString()}
Generator: ${metadata.generator}

Device Information
------------------
Model: ${metadata.device.model}
Firmware: ${metadata.device.firmwareVersion}

Backup Statistics
-----------------
Total Books: ${metadata.statistics.totalBooks}
Total Annotations: ${metadata.statistics.totalAnnotations}
Books Started: ${metadata.statistics.booksStarted}
Books Finished: ${metadata.statistics.booksFinished}
Total Reading Time: ${Math.floor(metadata.statistics.totalReadingTime / 60)} hours

Contents
--------
- KoboReader.sqlite: Your Kobo database with all reading data
- books/: All your ebook files
- annotations/: Human-readable export of your highlights and notes
- backup-metadata.json: Technical metadata about this backup

How to Restore
--------------
1. Open Kobo Backup Manager (https://kobo-backup.app)
2. Click "Restore Backup"
3. Select this ZIP file
4. Follow the wizard to restore to your Kobo device

Privacy Note
------------
This backup was created entirely in your browser.
No data was sent to any server.
Keep this file safe and private.

For more information, visit: https://kobo-backup.app
`;
}

/**
 * Estimate backup size before creating
 * @param {object} koboData - Kobo device data
 * @returns {number} Estimated size in bytes
 */
export function estimateBackupSize(koboData) {
  let size = 0;

  // Database size
  if (koboData.database) {
    size += koboData.database.byteLength || koboData.database.size || 0;
  }

  // Books size
  if (koboData.bookFiles) {
    koboData.bookFiles.forEach(bookFile => {
      size += bookFile.blob?.size || bookFile.size || 0;
    });
  }

  // Metadata and extras (estimate 100KB)
  size += 100 * 1024;

  // Compression typically reduces size by 10-30%, but be conservative
  return Math.floor(size * 0.9);
}
