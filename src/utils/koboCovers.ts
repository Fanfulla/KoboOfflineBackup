/**
 * Fetch cover images from a connected Kobo device.
 */
import { getDirectoryByPath } from './fileSystem.ts';

/** Suffixes used by Kobo firmware for pre-rendered cover JPEGs. */
const COVER_SUFFIXES = [
  ' - N3_LIBRARY_GRID.parsed',
  ' - N3_LIBRARY_SHELF.parsed',
  ' - N3_LIBRARY_LIST.parsed',
  ' - N3_LIBRARY_FULL.parsed',
  ' - NickelBookCover.parsed',
];

/** Retrieve the cover file for an ImageId, or null if not found. */
export async function getCoverFile(
  deviceHandle: FileSystemDirectoryHandle | null,
  coverId: string | null,
): Promise<File | null> {
  if (!deviceHandle || !coverId) return null;

  try {
    const imagesDir = await getDirectoryByPath(deviceHandle, '.kobo/images');
    for (const suffix of COVER_SUFFIXES) {
      try {
        return await (await imagesDir.getFileHandle(`${coverId}${suffix}`)).getFile();
      } catch {
        // Try next suffix
      }
    }
  } catch (error) {
    console.debug('[Covers] Could not access .kobo/images directory:', error);
  }
  return null;
}

/** Object URL for the cover image (caller must revoke it). */
export async function getCoverUrl(
  deviceHandle: FileSystemDirectoryHandle | null,
  coverId: string | null,
): Promise<string | null> {
  const file = await getCoverFile(deviceHandle, coverId);
  return file ? URL.createObjectURL(file) : null;
}
