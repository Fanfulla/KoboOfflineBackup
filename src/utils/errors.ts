/**
 * Custom error classes for KoBup.
 */

export const ERROR_CODES = {
  BACKUP_FAILED: 'BACKUP_FAILED',
  BACKUP_CANCELLED: 'BACKUP_CANCELLED',
  BACKUP_INVALID_DEVICE: 'BACKUP_INVALID_DEVICE',

  RESTORE_FAILED: 'RESTORE_FAILED',
  RESTORE_CANCELLED: 'RESTORE_CANCELLED',
  RESTORE_INVALID_FILE: 'RESTORE_INVALID_FILE',
  RESTORE_CORRUPTED: 'RESTORE_CORRUPTED',
  RESTORE_INCOMPATIBLE: 'RESTORE_INCOMPATIBLE',
  RESTORE_PASSWORD_REQUIRED: 'RESTORE_PASSWORD_REQUIRED',
  RESTORE_WRONG_PASSWORD: 'RESTORE_WRONG_PASSWORD',

  FS_PERMISSION_DENIED: 'FS_PERMISSION_DENIED',
  FS_NOT_FOUND: 'FS_NOT_FOUND',
  FS_READ_ERROR: 'FS_READ_ERROR',
  FS_WRITE_ERROR: 'FS_WRITE_ERROR',
  FS_NOT_SUPPORTED: 'FS_NOT_SUPPORTED',

  DB_OPEN_FAILED: 'DB_OPEN_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_WRITE_ERROR: 'DB_WRITE_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export type ErrorDetails = Record<string, unknown> & { originalError?: unknown };

/** Base class: every app error carries a machine-readable code and details. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details: ErrorDetails;

  constructor(message: string, code: ErrorCode, details: ErrorDetails = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }
}

export class BackupError extends AppError {}
export class RestoreError extends AppError {}
export class FileSystemError extends AppError {}
export class DatabaseError extends AppError {}

/** Best-effort human readable message for any thrown value. */
export function errorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof AppError) {
    const original = error.details.originalError;
    const cause =
      original instanceof Error && original.message !== error.message ? `: ${original.message}` : '';
    return `${error.message}${cause}`;
  }
  if (error instanceof Error) return error.message || fallback;
  return typeof error === 'string' ? error : fallback;
}

export function errorCode(error: unknown, fallback: string): string {
  return error instanceof AppError ? error.code : fallback;
}
