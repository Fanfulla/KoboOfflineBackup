/**
 * Custom error classes for Kobo Backup Manager
 */

/**
 * Base error class for backup operations
 */
export class BackupError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'BackupError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error for restore operations
 */
export class RestoreError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'RestoreError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error for file system operations
 */
export class FileSystemError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'FileSystemError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error for database operations
 */
export class DatabaseError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Error codes for different failure scenarios
 */
export const ERROR_CODES = {
  // Backup errors
  BACKUP_FAILED: 'BACKUP_FAILED',
  BACKUP_CANCELLED: 'BACKUP_CANCELLED',
  BACKUP_INVALID_DEVICE: 'BACKUP_INVALID_DEVICE',
  BACKUP_NO_BOOKS: 'BACKUP_NO_BOOKS',
  BACKUP_SIZE_LIMIT: 'BACKUP_SIZE_LIMIT',

  // Restore errors
  RESTORE_FAILED: 'RESTORE_FAILED',
  RESTORE_CANCELLED: 'RESTORE_CANCELLED',
  RESTORE_INVALID_FILE: 'RESTORE_INVALID_FILE',
  RESTORE_CORRUPTED: 'RESTORE_CORRUPTED',
  RESTORE_INCOMPATIBLE: 'RESTORE_INCOMPATIBLE',

  // File system errors
  FS_PERMISSION_DENIED: 'FS_PERMISSION_DENIED',
  FS_NOT_FOUND: 'FS_NOT_FOUND',
  FS_READ_ERROR: 'FS_READ_ERROR',
  FS_WRITE_ERROR: 'FS_WRITE_ERROR',
  FS_NOT_SUPPORTED: 'FS_NOT_SUPPORTED',

  // Database errors
  DB_OPEN_FAILED: 'DB_OPEN_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_CORRUPTED: 'DB_CORRUPTED',
  DB_NOT_FOUND: 'DB_NOT_FOUND',

  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_MISSING_FIELD: 'VALIDATION_MISSING_FIELD',

  // Browser compatibility errors
  BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED',
  BROWSER_FEATURE_MISSING: 'BROWSER_FEATURE_MISSING',
};

/**
 * Get recovery suggestions for error codes
 * @param {string} errorCode - Error code
 * @returns {string[]} Array of recovery suggestions
 */
export function getRecoverySteps(errorCode) {
  const steps = {
    [ERROR_CODES.BACKUP_INVALID_DEVICE]: [
      'Make sure your Kobo is connected via USB',
      'Unlock your Kobo device and tap "Connect"',
      'Select the Kobo drive (usually named "KOBOeReader")',
      'Try reconnecting the USB cable',
    ],
    [ERROR_CODES.BACKUP_NO_BOOKS]: [
      'Make sure you have books on your Kobo',
      'Check that the books are sideloaded (not from the Kobo store)',
      'Try syncing your Kobo with the Kobo app first',
    ],
    [ERROR_CODES.RESTORE_INVALID_FILE]: [
      'Make sure you selected a valid backup ZIP file',
      'Check that the backup file is not corrupted',
      'Try creating a new backup',
    ],
    [ERROR_CODES.FS_PERMISSION_DENIED]: [
      'Grant permission when the browser asks',
      'Make sure the Kobo device is not write-protected',
      'Try closing other programs that might be using the Kobo',
    ],
    [ERROR_CODES.FS_NOT_SUPPORTED]: [
      'Use Google Chrome 86+ or Microsoft Edge 86+',
      'Update your browser to the latest version',
      'Try the drag-and-drop fallback method',
    ],
    [ERROR_CODES.DB_CORRUPTED]: [
      'Try restarting your Kobo device',
      'Check if you can read books on the Kobo normally',
      'Consider restoring the device to factory settings (as last resort)',
    ],
    [ERROR_CODES.BROWSER_NOT_SUPPORTED]: [
      'Use Google Chrome 86+ or Microsoft Edge 86+',
      'Update your browser to the latest version',
      'Enable required browser features in settings',
    ],
  };

  return steps[errorCode] || [
    'Try the operation again',
    'Check your internet connection',
    'Restart the browser',
    'Contact support if the problem persists',
  ];
}

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {{title: string, message: string, recovery: string[]}} Formatted error info
 */
export function formatError(error) {
  let title = 'Error';
  let message = error.message || 'An unexpected error occurred';
  let recovery = [];

  if (error instanceof BackupError) {
    title = 'Backup Failed';
    recovery = getRecoverySteps(error.code);
  } else if (error instanceof RestoreError) {
    title = 'Restore Failed';
    recovery = getRecoverySteps(error.code);
  } else if (error instanceof FileSystemError) {
    title = 'File System Error';
    recovery = getRecoverySteps(error.code);
  } else if (error instanceof DatabaseError) {
    title = 'Database Error';
    recovery = getRecoverySteps(error.code);
  } else if (error instanceof ValidationError) {
    title = 'Validation Error';
    recovery = getRecoverySteps(error.code);
  } else if (error.name === 'AbortError') {
    title = 'Operation Cancelled';
    message = 'You cancelled the operation';
    recovery = ['Try again when ready'];
  } else if (error.name === 'NotAllowedError') {
    title = 'Permission Denied';
    message = 'You need to grant permission to access files';
    recovery = getRecoverySteps(ERROR_CODES.FS_PERMISSION_DENIED);
  }

  return { title, message, recovery };
}
