/**
 * Scan a connected Kobo: database, device identity, book files and
 * personalisation files (settings, custom fonts, screensavers).
 */

import { extractAllData } from './koboDatabase.ts';
import { parseKoboVersionFile } from './koboDevice.ts';
import { isValidBookFile, hasValidExtension } from './validation.ts';
import { FileSystemError, ERROR_CODES } from './errors.ts';
import type { KoboSource } from './deviceSource.ts';
import type { ScanResult, ScanWarning } from '../types/kobo.ts';

export const DATABASE_PATH = '.kobo/KoboReader.sqlite';
export const SETTINGS_PATH = '.kobo/Kobo/Kobo eReader.conf';

const FONT_EXTENSIONS = ['.ttf', '.otf'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];

/**
 * Personalisation files that are safe to back up and put back:
 *  - `.kobo/Kobo/Kobo eReader.conf` (reading preferences, device settings)
 *  - `fonts/*.ttf|otf` (sideloaded fonts)
 *  - `.kobo/screensaver/*` (custom sleep screens)
 */
export function isPersonalisationPath(path: string): boolean {
  if (path.split('/').some((p) => p === '..' || p === '.')) return false;
  if (path === SETTINGS_PATH) return true;
  if (path.startsWith('fonts/')) return hasValidExtension(path, FONT_EXTENSIONS);
  if (path.startsWith('.kobo/screensaver/')) return hasValidExtension(path, IMAGE_EXTENSIONS);
  return false;
}

export async function scanKoboDevice(
  source: KoboSource,
  onStep: (step: number) => void = () => {},
): Promise<ScanResult> {
  onStep(1);
  const [dbFile, versionFile, walFile] = await Promise.all([
    source.getFile(DATABASE_PATH),
    source.getFile('.kobo/version'),
    source.getFile(`${DATABASE_PATH}-wal`),
  ]);
  if (!dbFile) {
    throw new FileSystemError(`File not found: ${DATABASE_PATH}`, ERROR_CODES.FS_NOT_FOUND, {
      path: DATABASE_PATH,
    });
  }
  const database = await dbFile.arrayBuffer();
  const version = versionFile ? parseKoboVersionFile(await versionFile.text()) : null;

  onStep(2);
  const extracted = await extractAllData(database);
  const deviceInfo = version
    ? {
        ...extracted.deviceInfo,
        model: version.model,
        modelId: version.modelId,
        firmwareVersion: version.firmwareVersion,
      }
    : extracted.deviceInfo;

  onStep(3);
  const [visible, fonts, screensavers, settings] = await Promise.all([
    source.listFiles(),
    source.listFiles({ under: 'fonts' }),
    source.listFiles({ under: '.kobo/screensaver', includeHidden: true }),
    source.getFile(SETTINGS_PATH),
  ]);
  const bookFiles = visible.filter((f) => isValidBookFile(f.name));
  const extraFiles = [...fonts, ...screensavers].filter((f) => isPersonalisationPath(f.path));
  if (settings) {
    extraFiles.unshift({
      path: SETTINGS_PATH,
      name: settings.name,
      size: settings.size,
      getFile: async () => settings,
    });
  }

  onStep(4);
  const warnings: ScanWarning[] = walFile && walFile.size > 0 ? ['wal-pending'] : [];
  return {
    books: extracted.books,
    annotations: extracted.annotations,
    stats: extracted.stats,
    collections: extracted.collections,
    deviceInfo,
    bookFiles,
    extraFiles,
    database,
    warnings,
  };
}
