/**
 * Cover thumbnails pre-rendered by the Kobo firmware.
 *
 * Current firmware stores them in `.kobo-images/<d1>/<d2>/<ImageId> - <SUFFIX>.parsed`
 * where d1/d2 come from a Qt3-era string hash of the ImageId (same algorithm
 * as calibre's KoboTouch driver). Very old firmware used a flat `.kobo/images`.
 * The `.parsed` files are plain JPEGs.
 */
import type { KoboSource } from './deviceSource.ts';

/** Smallest first: the grid thumbnail is enough for the dashboard. */
const SUFFIXES = [' - N3_LIBRARY_GRID.parsed', ' - N3_LIBRARY_FULL.parsed', ' - N3_FULL.parsed'];
const LEGACY_SUFFIXES = [...SUFFIXES, ' - N3_LIBRARY_SHELF.parsed', ' - N3_LIBRARY_LIST.parsed'];

const encoder = new TextEncoder();

/** Nickel's image-cache hash (28-bit). */
export function qhash(imageId: string): number {
  let h = 0;
  for (const byte of encoder.encode(imageId)) {
    h = h * 16 + byte;
    h ^= (h & 0xf0000000) >>> 23;
    h &= 0x0fffffff;
  }
  return h;
}

export function coverCandidatePaths(imageId: string): string[] {
  const h = qhash(imageId);
  const dir = `.kobo-images/${h & 0xff}/${(h & 0xff00) >> 8}`;
  return [
    ...SUFFIXES.map((suffix) => `${dir}/${imageId}${suffix}`),
    ...LEGACY_SUFFIXES.map((suffix) => `.kobo/images/${imageId}${suffix}`),
  ];
}

/** The first available cover file for an ImageId, or null. */
export async function getCoverFile(source: KoboSource | null, imageId: string | null): Promise<File | null> {
  if (!source || !imageId) return null;
  for (const path of coverCandidatePaths(imageId)) {
    const file = await source.getFile(path);
    if (file && file.size > 0) return file;
  }
  return null;
}

/** Object URL for the cover image (caller must revoke it). */
export async function getCoverUrl(source: KoboSource | null, imageId: string | null): Promise<string | null> {
  const file = await getCoverFile(source, imageId);
  return file ? URL.createObjectURL(file) : null;
}
