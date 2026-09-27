/**
 * Validation utilities for Kobo Backup Manager
 */

/**
 * Check if a directory handle represents a valid Kobo device
 * @param {FileSystemDirectoryHandle} dirHandle - Directory handle to validate
 * @returns {Promise<boolean>} True if valid Kobo directory
 */
export async function isValidKoboDirectory(dirHandle) {
  if (!dirHandle) return false;

  try {
    // Check for .kobo folder
    let koboFolder = null;

    for await (const entry of dirHandle.values()) {
      if (entry.name === '.kobo' && entry.kind === 'directory') {
        koboFolder = entry;
        break;
      }
    }

    if (!koboFolder) {
      return false;
    }

    // Check for KoboReader.sqlite inside .kobo folder
    for await (const entry of koboFolder.values()) {
      if (entry.name === 'KoboReader.sqlite' && entry.kind === 'file') {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error validating Kobo directory:', error);
    return false;
  }
}

/**
 * Validate a backup ZIP file
 * @param {File} file - ZIP file to validate
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 */
export async function validateBackupFile(file) {
  // Check file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  if (!file.name.endsWith('.zip')) {
    return { valid: false, error: 'File must be a ZIP archive' };
  }

  // Check file size (max 10GB)
  const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
  if (file.size > maxSize) {
    return { valid: false, error: 'Backup file is too large (max 10GB)' };
  }

  // Check minimum size (at least 1KB)
  if (file.size < 1024) {
    return { valid: false, error: 'Backup file is too small to be valid' };
  }

  return { valid: true };
}

/**
 * Validate backup metadata
 * @param {object} metadata - Metadata object to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateBackupMetadata(metadata) {
  if (!metadata) {
    return { valid: false, error: 'No metadata provided' };
  }

  // Check required fields
  const requiredFields = ['version', 'created', 'statistics'];
  for (const field of requiredFields) {
    if (!(field in metadata)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Check version format
  if (typeof metadata.version !== 'string') {
    return { valid: false, error: 'Invalid version format' };
  }

  // Check created date
  const createdDate = new Date(metadata.created);
  if (isNaN(createdDate.getTime())) {
    return { valid: false, error: 'Invalid creation date' };
  }

  // Check statistics
  if (typeof metadata.statistics !== 'object') {
    return { valid: false, error: 'Invalid statistics format' };
  }

  return { valid: true };
}

/**
 * Validate file extension
 * @param {string} filename - Filename to check
 * @param {string[]} validExtensions - Array of valid extensions (e.g., ['.epub', '.pdf'])
 * @returns {boolean} True if file has valid extension
 */
export function hasValidExtension(filename, validExtensions) {
  if (!filename) return false;

  const lowerFilename = filename.toLowerCase();
  return validExtensions.some(ext => lowerFilename.endsWith(ext.toLowerCase()));
}

/**
 * Validate Kobo book file
 * @param {string} filename - Filename to validate
 * @returns {boolean} True if valid book file
 */
export function isValidBookFile(filename) {
  const validExtensions = ['.epub', '.kepub.epub', '.pdf', '.mobi', '.txt', '.cbz', '.cbr'];
  return hasValidExtension(filename, validExtensions);
}
