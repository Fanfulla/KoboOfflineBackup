/**
 * Lightweight backup helpers (no ZIP libraries), safe to import eagerly.
 */
import type { BackupOptions, ScanResult } from '../types/kobo.ts';

/** ZIP layout: files keep their device-relative path under these prefixes. */
export const BOOKS_PREFIX = 'books/';
export const DEVICE_PREFIX = 'device/';

export function generateBackupFilename(date = new Date()): string {
  return `kobo_backup_${date.toISOString().split('T')[0]}.zip`;
}

/** Uncompressed size of what the backup will contain (books are stored, not compressed). */
export function estimateBackupSize(
  scan: Pick<ScanResult, 'database' | 'bookFiles'> & Partial<Pick<ScanResult, 'extraFiles'>>,
  options: Partial<Pick<BackupOptions, 'includeBooks' | 'includeSettings'>> = {},
): number {
  const { includeBooks = true, includeSettings = false } = options;
  const sum = (files: { size: number }[] = []) => files.reduce((total, f) => total + (f.size || 0), 0);
  return (
    (scan.database?.byteLength || 0) +
    (includeBooks ? sum(scan.bookFiles) : 0) +
    (includeSettings ? sum(scan.extraFiles) : 0) +
    64 * 1024 // metadata, README, ZIP directory
  );
}
