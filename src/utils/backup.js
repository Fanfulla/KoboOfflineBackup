/**
 * Backup creation utilities - streaming approach via client-zip.
 *
 * WHY: JSZip buffers ALL files simultaneously. For a 4 GB library
 * this peaks at ~10 GB and throws RangeError: Array buffer allocation failed.
 * client-zip streams one file at a time to disk, so peak RAM = 1 book file.
 */

import { downloadZip } from 'client-zip';
import { saveFile } from './fileSystem.js';
import { BackupError, ERROR_CODES } from './errors.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildMetadata(koboData, options, extra = {}) {
  const {
    includeBooks = true, includeAnnotations = true,
    includeProgress = true, includeSettings = false,
  } = options;
  const dev = koboData.deviceInfo || {};
  return {
    version: '1.0.0',
    created: new Date().toISOString(),
    generator: 'Kobo Backup Manager v1.0',
    device: {
      model: dev.model || 'Unknown',
      firmwareVersion: dev.firmwareVersion || 'Unknown',
      schemaVersion: dev.schemaVersion ?? 0,
    },
    statistics: {
      totalBooks: koboData.books?.length || 0,
      totalAnnotations: koboData.annotations?.length || 0,
      totalSize: koboData.totalSize || 0,
      booksStarted: koboData.stats?.booksStarted || 0,
      booksFinished: koboData.stats?.booksFinished || 0,
      totalReadingTime: koboData.stats?.totalMinutesRead || 0,
    },
    options: { includeBooks, includeAnnotations, includeProgress, includeSettings },
    integrity: {
      databaseChecksum: extra.databaseChecksum || 'unavailable',
      filesChecked: koboData.bookFiles?.length || 0,
      // Per-file checksums not computed in streaming mode (would need two reads per file)
      fileChecksums: {},
      // Shared mutable array filled by the generator; JSON.stringify captures
      // the final state when the metadata entry is yielded (after all books).
      errors: extra.errors || [],
    },
    compatibility: { minAppVersion: '1.0.0', supportedDevices: ['all'] },
  };
}

async function* generateZipEntries(koboData, options, onProgress, metadata) {
  const { includeBooks = true, includeAnnotations = true } = options;

  // 1. SQLite database (small, safe to buffer)
  onProgress('Preparing backup...', 0);
  yield {
    name: 'KoboReader.sqlite',
    input: new Blob([koboData.database]),
    size: koboData.database.byteLength,
  };

  // 2. Book files — ONE at a time.
  //    handle.getFile() returns a File (Blob subclass) lazily; client-zip
  //    streams it to disk before requesting the next file.
  //    Peak memory = max single-file size, not the whole library.
  if (includeBooks && koboData.bookFiles?.length > 0) {
    const total = koboData.bookFiles.length;
    for (let i = 0; i < total; i++) {
      const bf = koboData.bookFiles[i];
      try {
        const file = await bf.handle.getFile();
        yield {
          name: 'books/' + (bf.path || bf.name),
          input: file,
          size: file.size,
          lastModified: new Date(file.lastModified),
        };
      } catch (err) {
        console.warn('[BACKUP] Skipping unreadable file:', bf.name, err);
        metadata.integrity.errors.push({ file: bf.name, error: err.message });
      }
      onProgress(
        'Adding books (' + (i + 1) + '/' + total + ')...',
        10 + ((i + 1) / total) * 72,
        i + 1,
      );
    }
  }

  // 3. Annotations
  if (includeAnnotations && koboData.annotations?.length > 0) {
    onProgress('Exporting annotations...', 85);
    yield {
      name: 'annotations/all-annotations.md',
      input: exportAnnotationsAsMarkdown(koboData.annotations),
    };
  }

  // 4. Metadata — AFTER all books so the errors array is complete when JSON.stringify runs
  onProgress('Adding metadata...', 90);
  yield { name: 'backup-metadata.json', input: JSON.stringify(metadata, null, 2) };

  // 5. README
  yield { name: 'README.txt', input: generateReadme(metadata) };

  onProgress('Finalizing...', 95);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * PRIMARY PATH: stream backup directly to disk via showSaveFilePicker.
 * Peak memory: ~1 book file at a time, regardless of library size.
 *
 * fileHandle MUST be obtained from window.showSaveFilePicker() synchronously
 * inside the click handler (before any await) to satisfy the user-gesture
 * requirement. BackupWizard is responsible for this.
 *
 * @param {object} koboData - scan result; bookFiles items must have .handle (FileSystemFileHandle)
 * @param {FileSystemFileHandle} fileHandle - writable handle from showSaveFilePicker
 * @param {string} filename - filename chosen by the user
 * @param {object} options
 * @returns {Promise<{filename, size, metadata}>}
 */
export async function streamBackupToDisk(koboData, fileHandle, filename, options = {}) {
  const { onProgress = () => {} } = options;
  try {
    const databaseChecksum = await calculateChecksum(koboData.database);
    const metadata = buildMetadata(koboData, options, { databaseChecksum, errors: [] });
    const entries = generateZipEntries(koboData, options, onProgress, metadata);
    const zipResponse = downloadZip(entries);

    const writable = await fileHandle.createWritable();
    try {
      await zipResponse.body.pipeTo(writable);
    } catch (err) {
      await writable.abort().catch(() => {});
      throw err;
    }

    onProgress('Backup complete', 100);
    const savedFile = await fileHandle.getFile();
    return { filename, size: savedFile.size, metadata };
  } catch (error) {
    console.error('[BACKUP] Streaming failed:', error);
    throw new BackupError('Failed to create backup', ERROR_CODES.BACKUP_FAILED, { originalError: error });
  }
}

/**
 * FALLBACK PATH: buffer the ZIP as a Blob then trigger a browser download.
 * Used when showSaveFilePicker is unavailable (Firefox, Safari).
 * WARNING: may still OOM for libraries > ~2 GB on these browsers.
 *
 * @param {object} koboData
 * @param {object} options
 * @returns {Promise<{blob, filename, size, metadata}>}
 */
export async function createBackupBlob(koboData, options = {}) {
  const { onProgress = () => {} } = options;
  try {
    const databaseChecksum = await calculateChecksum(koboData.database);
    const metadata = buildMetadata(koboData, options, { databaseChecksum, errors: [] });
    const entries = generateZipEntries(koboData, options, onProgress, metadata);
    const blob = await downloadZip(entries).blob();
    onProgress('Backup complete', 100);
    return { blob, filename: generateBackupFilename(), size: blob.size, metadata };
  } catch (error) {
    console.error('[BACKUP] Blob creation failed:', error);
    throw new BackupError('Failed to create backup', ERROR_CODES.BACKUP_FAILED, { originalError: error });
  }
}

export async function saveBackup(blob, filename) {
  try {
    return await saveFile(blob, { fileName: filename, extensions: ['.zip'] });
  } catch (error) {
    throw new BackupError('Failed to save backup file', ERROR_CODES.BACKUP_FAILED, { originalError: error });
  }
}

/** Generate the suggested filename. Exported so BackupWizard can use it before the save dialog. */
export function generateBackupFilename() {
  return 'kobo_backup_' + new Date().toISOString().split('T')[0] + '.zip';
}

export async function calculateChecksum(data) {
  try {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
    const hb = await crypto.subtle.digest('SHA-256', buffer);
    return 'sha256:' + Array.from(new Uint8Array(hb)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return 'unavailable';
  }
}

export function estimateBackupSize(koboData) {
  let size = 0;
  if (koboData.database) size += koboData.database.byteLength || koboData.database.size || 0;
  if (koboData.bookFiles) koboData.bookFiles.forEach(f => { size += f.size || f.blob?.size || 0; });
  return Math.floor((size + 100 * 1024) * 0.9);
}

// ---------------------------------------------------------------------------
// Private formatting helpers
// ---------------------------------------------------------------------------

function exportAnnotationsAsMarkdown(annotations) {
  let md = '# Kobo Annotations Export\n\n';
  md += 'Exported on: ' + new Date().toLocaleString() + '\n\nTotal annotations: ' + annotations.length + '\n\n---\n\n';
  const byBook = {};
  annotations.forEach(a => {
    const t = a.BookTitle || 'Unknown Book';
    (byBook[t] = byBook[t] || []).push(a);
  });
  Object.entries(byBook).forEach(([title, list]) => {
    md += '## ' + title + '\n\n';
    if (list[0]?.Author) md += '*by ' + list[0].Author + '*\n\n';
    list.forEach((a, idx) => {
      md += '### Annotation ' + (idx + 1) + '\n\n';
      if (a.HighlightedText) md += '> ' + a.HighlightedText + '\n\n';
      if (a.Note) md += '**Note:** ' + a.Note + '\n\n';
      if (a.DateCreated) md += '*Created: ' + new Date(a.DateCreated).toLocaleString() + '*\n\n';
      md += '---\n\n';
    });
  });
  return md;
}

function generateReadme(m) {
  return [
    'Kobo Backup Archive', '====================', '',
    'Created: ' + new Date(m.created).toLocaleString(),
    'Generator: ' + m.generator, '',
    'Device Information', '------------------',
    'Model: ' + m.device.model, 'Firmware: ' + m.device.firmwareVersion, '',
    'Backup Statistics', '-----------------',
    'Total Books: ' + m.statistics.totalBooks,
    'Total Annotations: ' + m.statistics.totalAnnotations,
    'Books Started: ' + m.statistics.booksStarted,
    'Books Finished: ' + m.statistics.booksFinished,
    'Total Reading Time: ' + Math.floor(m.statistics.totalReadingTime / 60) + ' hours', '',
    'Contents', '--------',
    '- KoboReader.sqlite: Your Kobo database with all reading data',
    '- books/: All your ebook files',
    '- annotations/: Human-readable export of your highlights and notes',
    '- backup-metadata.json: Technical metadata about this backup', '',
    'How to Restore', '--------------',
    '1. Open Kobo Backup Manager', '2. Click "Restore Backup"',
    '3. Select this ZIP file', '4. Follow the wizard to restore to your Kobo device', '',
    'Privacy Note', '------------',
    'This backup was created entirely in your browser.',
    'No data was sent to any server.',
    'Keep this file safe and private.', '',
  ].join('\n');
}
