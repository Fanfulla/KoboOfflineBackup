/**
 * Helper to fetch cover images from connected Kobo device (.kobo/images folder)
 */
import { getDirectoryByPath } from './fileSystem.js';

/**
 * Common suffixes used by Kobo firmware for pre-rendered book cover JPEGs
 */
const COB_COVER_SUFFIXES = [
  ' - N3_LIBRARY_GRID.parsed',
  ' - N3_LIBRARY_SHELF.parsed',
  ' - N3_LIBRARY_LIST.parsed',
  ' - N3_LIBRARY_FULL.parsed',
  ' - NickelBookCover.parsed'
];

/**
 * Retrieve the cover file from Kobo device
 * @param {FileSystemDirectoryHandle} deviceHandle - Connected Kobo device directory handle
 * @param {string} coverId - ImageId / CoverId from SQLite database
 * @returns {Promise<File|null>} Image file or null if not found
 */
export async function getCoverFile(deviceHandle, coverId) {
  if (!deviceHandle || !coverId) {
    return null;
  }

  try {
    const imagesDir = await getDirectoryByPath(deviceHandle, '.kobo/images');

    for (const suffix of COB_COVER_SUFFIXES) {
      try {
        const filename = `${coverId}${suffix}`;
        const fileHandle = await imagesDir.getFileHandle(filename);
        const file = await fileHandle.getFile();
        return file;
      } catch (err) {
        // Try next suffix on NotFoundError
      }
    }
  } catch (error) {
    // .kobo/images might not exist or be accessible
    console.debug('[Covers] Could not access .kobo/images directory:', error.message);
  }

  return null;
}

/**
 * Create a local Object URL for the cover image
 * @param {FileSystemDirectoryHandle} deviceHandle - Connected Kobo device directory handle
 * @param {string} coverId - ImageId / CoverId from SQLite database
 * @returns {Promise<string|null>} Object URL string or null if not found (caller is responsible for revoking)
 */
export async function getCoverUrl(deviceHandle, coverId) {
  const file = await getCoverFile(deviceHandle, coverId);
  if (file) {
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      console.error('[Covers] Failed to create Object URL:', e);
    }
  }
  return null;
}
