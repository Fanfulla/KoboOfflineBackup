/**
 * Domain types shared across the app (Kobo database rows, scan results,
 * backup metadata, progress/error state).
 */

export interface KoboBook {
  ContentID: string;
  Title: string | null;
  Author: string;
  Description: string | null;
  Publisher: string | null;
  Series: string | null;
  SeriesNumber: string | null;
  ISBN: string | null;
  Language: string | null;
  Progress: number;
  ReadStatus: number | null;
  DateCreated: Date | null;
  DateLastRead: Date | null;
  FilePath: string | null;
  CoverId: string | null;
  TimeSpentReading: number;
  MimeType: string | null;
}

export interface KoboAnnotation {
  BookmarkID: string;
  VolumeID: string;
  HighlightedText: string | null;
  Note: string | null;
  DateCreated: Date | null;
  DateModified: Date | null;
  StartContainerPath?: string | null;
  StartOffset?: number | null;
  EndContainerPath?: string | null;
  EndOffset?: number | null;
  BookTitle: string;
  Author: string;
}

export interface ReadingStats {
  totalBooks: number;
  booksStarted: number;
  booksFinished: number;
  currentlyReading: number;
  totalMinutesRead: number;
  averageProgress: number;
  uniqueAuthors: number;
}

export interface DeviceInfo {
  model: string;
  /** Numeric Kobo model id from `.kobo/version` (e.g. "388"). */
  modelId?: string;
  firmwareVersion: string;
  databaseVersion: string;
  /** Kobo DbVersion (schema) number. */
  schemaVersion: number;
}

export interface KoboCollection {
  Id: string;
  Name: string;
  InternalName: string | null;
  Type: string | null;
  CreationDate: Date | null;
  LastModified: Date | null;
  ContentIds: string[];
}

export interface ExtractedData {
  books: KoboBook[];
  annotations: KoboAnnotation[];
  stats: ReadingStats;
  deviceInfo: DeviceInfo;
  collections: KoboCollection[];
  databaseSize: number;
}

/** A file found on the device (book, font, settings...). */
export interface BookFileEntry {
  /** Path relative to the device root, e.g. "Author/Title.kepub.epub". */
  path: string;
  name: string;
  size: number;
  getFile(): Promise<File>;
}

/**
 * - `wal-pending`: a non-empty KoboReader.sqlite-wal exists, i.e. the most
 *   recent changes are not yet in the main database file.
 */
export type ScanWarning = 'wal-pending';

export interface ScanResult {
  books: KoboBook[];
  annotations: KoboAnnotation[];
  stats: ReadingStats;
  collections: KoboCollection[];
  deviceInfo: DeviceInfo;
  bookFiles: BookFileEntry[];
  /** Settings, custom fonts and screensavers (backed up with "Device settings"). */
  extraFiles: BookFileEntry[];
  database: ArrayBuffer;
  warnings: ScanWarning[];
}

export interface BackupOptions {
  includeBooks: boolean;
  includeAnnotations: boolean;
  includeProgress: boolean;
  includeSettings: boolean;
}

export interface BackupMetadata {
  version: string;
  created: string;
  generator: string;
  device: {
    model: string;
    firmwareVersion: string;
    schemaVersion: number;
  };
  statistics: {
    totalBooks: number;
    totalAnnotations: number;
    totalSize?: number;
    booksStarted?: number;
    booksFinished?: number;
    totalReadingTime?: number;
  };
  options?: Partial<BackupOptions> & { encrypted?: boolean };
  integrity?: {
    databaseChecksum: string;
    filesChecked: number;
    fileChecksums: Record<string, string>;
    errors: { file: string; error: string }[];
    /** Conditions detected while scanning the device (see ScanWarning). */
    warnings?: ScanWarning[];
  };
  compatibility?: { minAppVersion: string; supportedDevices: string[] };
}

export type BackupStage =
  'preparing' | 'books' | 'settings' | 'annotations' | 'metadata' | 'finalizing' | 'verifying' | 'complete';

export type ProgressCallback = (stage: BackupStage, percent: number, filesProcessed?: number) => void;

export interface UiError {
  title: string;
  message: string;
  code: string;
}

export interface BackupHistoryEntry {
  id: string;
  filename: string;
  created: string;
  size: number;
  deviceModel: string;
  bookCount: number;
  annotationCount: number;
  encrypted?: boolean;
  /** The saved file's handle is stored in IndexedDB (verify/restore in one click). */
  hasHandle?: boolean;
  /** Result of the read-back verification right after writing. */
  verified?: boolean;
}
