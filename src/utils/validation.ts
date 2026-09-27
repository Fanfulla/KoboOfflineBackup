/**
 * Validation utilities.
 */

import type { BackupMetadata } from '../types/kobo.ts';

export type ValidationResult = { valid: true } | { valid: false; error: string };

/** A valid Kobo root contains `.kobo/KoboReader.sqlite`. */
export async function isValidKoboDirectory(dirHandle: FileSystemDirectoryHandle | null): Promise<boolean> {
  if (!dirHandle) return false;
  try {
    const koboFolder = await dirHandle.getDirectoryHandle('.kobo');
    await koboFolder.getFileHandle('KoboReader.sqlite');
    return true;
  } catch {
    return false;
  }
}

const MAX_BACKUP_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB

export function validateBackupFile(file: File | null | undefined): ValidationResult {
  if (!file) return { valid: false, error: 'No file provided' };
  if (!file.name.toLowerCase().endsWith('.zip')) return { valid: false, error: 'File must be a ZIP archive' };
  if (file.size > MAX_BACKUP_SIZE) return { valid: false, error: 'Backup file is too large (max 10GB)' };
  if (file.size < 1024) return { valid: false, error: 'Backup file is too small to be valid' };
  return { valid: true };
}

export function validateBackupMetadata(metadata: unknown): ValidationResult {
  if (!metadata || typeof metadata !== 'object') return { valid: false, error: 'No metadata provided' };

  const m = metadata as Partial<BackupMetadata>;
  for (const field of ['version', 'created', 'statistics'] as const) {
    if (!(field in m)) return { valid: false, error: `Missing required field: ${field}` };
  }
  if (typeof m.version !== 'string') return { valid: false, error: 'Invalid version format' };
  if (isNaN(new Date(m.created as string).getTime())) return { valid: false, error: 'Invalid creation date' };
  if (!m.statistics || typeof m.statistics !== 'object')
    return { valid: false, error: 'Invalid statistics format' };

  return { valid: true };
}

export function hasValidExtension(filename: string | null | undefined, validExtensions: string[]): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return validExtensions.some((ext) => lower.endsWith(ext.toLowerCase()));
}

const BOOK_EXTENSIONS = ['.epub', '.kepub.epub', '.pdf', '.mobi', '.txt', '.cbz', '.cbr'];

export function isValidBookFile(filename: string): boolean {
  return hasValidExtension(filename, BOOK_EXTENSIONS);
}
