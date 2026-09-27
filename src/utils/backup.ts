/**
 * Backup creation - streaming approach via client-zip.
 *
 * WHY: JSZip buffers ALL files simultaneously. For a 4 GB library this peaks
 * at ~10 GB and throws "RangeError: Array buffer allocation failed".
 * client-zip streams one file at a time to disk, so peak RAM = 1 book file.
 */

import { downloadZip } from 'client-zip';
import { downloadBlob } from './fileSystem.ts';
import { BackupError, ERROR_CODES } from './errors.ts';
import type {
  BackupMetadata,
  BackupOptions,
  KoboAnnotation,
  ProgressCallback,
  ScanResult,
} from '../types/kobo.ts';

export const APP_VERSION = __APP_VERSION__;

export interface BackupResult {
  filename: string;
  size: number;
  metadata: BackupMetadata;
}

export type BackupRunOptions = Partial<BackupOptions> & { onProgress?: ProgressCallback };

type IntegrityErrors = NonNullable<BackupMetadata['integrity']>['errors'];

export interface ZipEntry {
  name: string;
  input: Blob | string;
  size?: number;
  lastModified?: Date;
}

function buildMetadata(
  koboData: ScanResult,
  options: Partial<BackupOptions>,
  databaseChecksum: string,
  errors: IntegrityErrors,
): BackupMetadata {
  const {
    includeBooks = true,
    includeAnnotations = true,
    includeProgress = true,
    includeSettings = false,
  } = options;
  const dev = koboData.deviceInfo;
  return {
    version: '1.0.0',
    created: new Date().toISOString(),
    generator: `KoBup v${APP_VERSION}`,
    device: {
      model: dev?.model || 'Unknown',
      firmwareVersion: dev?.firmwareVersion || 'Unknown',
      schemaVersion: dev?.schemaVersion ?? 0,
    },
    statistics: {
      totalBooks: koboData.books?.length || 0,
      totalAnnotations: koboData.annotations?.length || 0,
      totalSize: koboData.bookFiles?.reduce((sum, f) => sum + (f.size || 0), 0) || 0,
      booksStarted: koboData.stats?.booksStarted || 0,
      booksFinished: koboData.stats?.booksFinished || 0,
      totalReadingTime: koboData.stats?.totalMinutesRead || 0,
    },
    options: { includeBooks, includeAnnotations, includeProgress, includeSettings },
    integrity: {
      databaseChecksum,
      filesChecked: koboData.bookFiles?.length || 0,
      // Per-file checksums are not computed in streaming mode (would need two reads per file)
      fileChecksums: {},
      // Shared mutable array filled by the generator; JSON.stringify captures
      // the final state when the metadata entry is yielded (after all books).
      errors,
    },
    compatibility: { minAppVersion: '1.0.0', supportedDevices: ['all'] },
  };
}

async function* generateZipEntries(
  koboData: ScanResult,
  options: Partial<BackupOptions>,
  onProgress: ProgressCallback,
  metadata: BackupMetadata,
): AsyncGenerator<ZipEntry> {
  const { includeBooks = true, includeAnnotations = true } = options;

  // 1. SQLite database (small, safe to buffer)
  onProgress('Preparing backup...', 0);
  yield {
    name: 'KoboReader.sqlite',
    input: new Blob([koboData.database]),
    size: koboData.database.byteLength,
  };

  // 2. Book files - ONE at a time. handle.getFile() returns a lazy File;
  //    client-zip streams it to disk before requesting the next one.
  if (includeBooks && koboData.bookFiles?.length > 0) {
    const total = koboData.bookFiles.length;
    for (let i = 0; i < total; i++) {
      const bf = koboData.bookFiles[i]!;
      try {
        const file = await bf.handle.getFile();
        yield {
          name: `books/${bf.path || bf.name}`,
          input: file,
          size: file.size,
          lastModified: new Date(file.lastModified),
        };
      } catch (err) {
        console.warn('[BACKUP] Skipping unreadable file:', bf.name, err);
        metadata.integrity?.errors.push({
          file: bf.name,
          error: err instanceof Error ? err.message : String(err),
        });
      }
      onProgress(`Adding books (${i + 1}/${total})...`, 10 + ((i + 1) / total) * 72, i + 1);
    }
  }

  // 3. Annotations (human-readable export)
  if (includeAnnotations && koboData.annotations?.length > 0) {
    onProgress('Exporting annotations...', 85);
    yield {
      name: 'annotations/all-annotations.md',
      input: exportAnnotationsAsMarkdown(koboData.annotations),
    };
  }

  // 4. Metadata - AFTER all books so the errors array is complete
  onProgress('Adding metadata...', 90);
  yield { name: 'backup-metadata.json', input: JSON.stringify(metadata, null, 2) };

  // 5. README
  yield { name: 'README.txt', input: generateReadme(metadata) };

  onProgress('Finalizing...', 95);
}

/**
 * PRIMARY PATH: stream the backup directly to disk via showSaveFilePicker.
 * Peak memory: ~1 book file at a time, regardless of library size.
 *
 * fileHandle MUST be obtained from window.showSaveFilePicker() inside the
 * click handler to satisfy the user-gesture requirement (BackupWizard does this).
 */
export async function streamBackupToDisk(
  koboData: ScanResult,
  fileHandle: FileSystemFileHandle,
  filename: string,
  options: BackupRunOptions = {},
): Promise<BackupResult> {
  const { onProgress = () => {} } = options;
  try {
    const metadata = buildMetadata(koboData, options, await calculateChecksum(koboData.database), []);
    const zipResponse = downloadZip(generateZipEntries(koboData, options, onProgress, metadata));

    const writable = await fileHandle.createWritable();
    try {
      await zipResponse.body!.pipeTo(writable);
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
 * WARNING: may OOM for very large libraries.
 */
export async function createBackupBlob(
  koboData: ScanResult,
  options: BackupRunOptions = {},
): Promise<BackupResult & { blob: Blob }> {
  const { onProgress = () => {} } = options;
  try {
    const metadata = buildMetadata(koboData, options, await calculateChecksum(koboData.database), []);
    const blob = await downloadZip(generateZipEntries(koboData, options, onProgress, metadata)).blob();
    onProgress('Backup complete', 100);
    return { blob, filename: generateBackupFilename(), size: blob.size, metadata };
  } catch (error) {
    console.error('[BACKUP] Blob creation failed:', error);
    throw new BackupError('Failed to create backup', ERROR_CODES.BACKUP_FAILED, { originalError: error });
  }
}

export function saveBackup(blob: Blob, filename: string): { filename: string; size: number } {
  try {
    return downloadBlob(blob, filename);
  } catch (error) {
    throw new BackupError('Failed to save backup file', ERROR_CODES.BACKUP_FAILED, { originalError: error });
  }
}

/** Suggested filename. Exported so BackupWizard can use it before the save dialog. */
export function generateBackupFilename(date = new Date()): string {
  return `kobo_backup_${date.toISOString().split('T')[0]}.zip`;
}

export async function calculateChecksum(data: ArrayBuffer | Uint8Array<ArrayBuffer> | Blob): Promise<string> {
  try {
    const buffer = data instanceof Blob ? await data.arrayBuffer() : data;
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return `sha256:${Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')}`;
  } catch {
    return 'unavailable';
  }
}

export function estimateBackupSize(koboData: Pick<ScanResult, 'database' | 'bookFiles'>): number {
  let size = koboData.database?.byteLength || 0;
  for (const f of koboData.bookFiles ?? []) size += f.size || 0;
  return Math.floor((size + 100 * 1024) * 0.9);
}

function exportAnnotationsAsMarkdown(annotations: KoboAnnotation[]): string {
  let md = '# Kobo Annotations Export\n\n';
  md += `Exported on: ${new Date().toLocaleString()}\n\nTotal annotations: ${annotations.length}\n\n---\n\n`;
  const byBook = new Map<string, KoboAnnotation[]>();
  for (const a of annotations) {
    const title = a.BookTitle || 'Unknown Book';
    byBook.set(title, [...(byBook.get(title) ?? []), a]);
  }
  for (const [title, list] of byBook) {
    md += `## ${title}\n\n`;
    if (list[0]?.Author) md += `*by ${list[0].Author}*\n\n`;
    list.forEach((a, idx) => {
      md += `### Annotation ${idx + 1}\n\n`;
      if (a.HighlightedText) md += `> ${a.HighlightedText}\n\n`;
      if (a.Note) md += `**Note:** ${a.Note}\n\n`;
      if (a.DateCreated) md += `*Created: ${new Date(a.DateCreated).toLocaleString()}*\n\n`;
      md += '---\n\n';
    });
  }
  return md;
}

function generateReadme(m: BackupMetadata): string {
  return [
    'Kobo Backup Archive',
    '====================',
    '',
    `Created: ${new Date(m.created).toLocaleString()}`,
    `Generator: ${m.generator}`,
    '',
    'Device Information',
    '------------------',
    `Model: ${m.device.model}`,
    `Firmware: ${m.device.firmwareVersion}`,
    '',
    'Backup Statistics',
    '-----------------',
    `Total Books: ${m.statistics.totalBooks}`,
    `Total Annotations: ${m.statistics.totalAnnotations}`,
    `Books Started: ${m.statistics.booksStarted ?? 0}`,
    `Books Finished: ${m.statistics.booksFinished ?? 0}`,
    `Total Reading Time: ${Math.floor((m.statistics.totalReadingTime ?? 0) / 60)} hours`,
    '',
    'Contents',
    '--------',
    '- KoboReader.sqlite: Your Kobo database with all reading data',
    '- books/: All your ebook files',
    '- annotations/: Human-readable export of your highlights and notes',
    '- backup-metadata.json: Technical metadata about this backup',
    '',
    'How to Restore',
    '--------------',
    '1. Open KoBup (https://www.kobup.org)',
    '2. Click "Restore Backup"',
    '3. Select this ZIP file',
    '4. Follow the wizard to restore to your Kobo device',
    '',
    'Privacy Note',
    '------------',
    'This backup was created entirely in your browser.',
    'No data was sent to any server.',
    'Keep this file safe and private.',
    '',
  ].join('\n');
}
