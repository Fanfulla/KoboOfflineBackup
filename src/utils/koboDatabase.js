/**
 * Kobo Database Parser using sql.js
 * Reads KoboReader.sqlite and extracts books, annotations, and reading progress
 */

import { DatabaseError, ERROR_CODES } from './errors.js';

/**
 * Kobo Database wrapper class
 */
export class KoboDatabase {
  /**
   * Create a new KoboDatabase instance
   * @param {ArrayBuffer} arrayBuffer - SQLite database file as ArrayBuffer
   */
  constructor(arrayBuffer) {
    this.arrayBuffer = arrayBuffer;
    this.db = null;
    this.ready = this.initialize();
  }

  /**
   * Initialize sql.js and open the database
   * @private
   */
  async initialize() {
    try {
      // Dynamically import sql.js
      const initSqlJs = (await import('sql.js')).default;

      const SQL = await initSqlJs({
        // Load sql-wasm.wasm from local public directory
        locateFile: file => `/${file}`
      });

      this.db = new SQL.Database(new Uint8Array(this.arrayBuffer));
    } catch (error) {
      throw new DatabaseError(
        'Failed to initialize database',
        ERROR_CODES.DB_OPEN_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Parse SQL results to JavaScript array of objects
   * @private
   * @param {Array} results - SQL results from exec()
   * @returns {Array<object>} Array of row objects
   */
  parseResults(results) {
    if (!results || results.length === 0) {
      return [];
    }

    const result = results[0];
    const { columns, values } = result;

    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  /**
   * Get all books from the database
   * Fetches sideloaded books (not from Kobo store)
   * @returns {Promise<Array<object>>} Array of book objects
   */
  async getBooks() {
    await this.ready;

    try {

      // Use ContentID as FilePath - it contains the full file:// path
      const query = `
        SELECT
          ContentID,
          Title,
          Attribution as Author,
          Description,
          Publisher,
          Series,
          SeriesNumber,
          ISBN,
          Language,
          ___PercentRead as Progress,
          ReadStatus,
          DateCreated,
          DateLastRead,
          ContentID as FilePath,
          ImageId as CoverId,
          TimeSpentReading,
          MimeType
        FROM content
        WHERE ContentType = 6
          AND LOWER(IsDownloaded) = 'true'
          AND (BookTitle IS NULL OR BookTitle = '')
          AND ContentID LIKE 'file://%'
        ORDER BY DateLastRead DESC
      `;

      const result = this.db.exec(query);
      const books = this.parseResults(result);

      // Parse and clean the data
      return books.map(book => ({
        ...book,
        Progress: book.Progress ? Math.round(book.Progress) : 0,
        Author: book.Author || 'Unknown Author',
        DateLastRead: book.DateLastRead ? new Date(book.DateLastRead) : null,
        DateCreated: book.DateCreated ? new Date(book.DateCreated) : null,
        TimeSpentReading: book.TimeSpentReading || 0,
        FilePath: book.FilePath ? decodeURIComponent(book.FilePath.replace('file://', '')) : null,
      }));
    } catch (error) {
      console.error('[DB ERROR] getBooks failed:', error.message);
      throw new DatabaseError(
        'Failed to fetch books from database',
        ERROR_CODES.DB_QUERY_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Get all annotations (highlights and notes) from the database
   * @returns {Promise<Array<object>>} Array of annotation objects
   */
  async getAnnotations() {
    await this.ready;

    try {
      // Remove BookmarkType - column doesn't exist in this schema
      const query = `
        SELECT
          b.BookmarkID,
          b.VolumeID,
          b.Text as HighlightedText,
          b.Annotation as Note,
          b.DateCreated,
          b.DateModified,
          b.StartContainerPath,
          b.StartOffset,
          b.EndContainerPath,
          b.EndOffset,
          c.Title as BookTitle,
          c.Attribution as Author
        FROM Bookmark b
        LEFT JOIN content c ON b.VolumeID = c.ContentID
        WHERE (b.Text IS NOT NULL OR b.Annotation IS NOT NULL)
          AND c.ContentType = 6
        ORDER BY b.DateCreated DESC
      `;

      const result = this.db.exec(query);
      const annotations = this.parseResults(result);

      // Parse and clean the data
      return annotations.map(annotation => ({
        ...annotation,
        DateCreated: annotation.DateCreated ? new Date(annotation.DateCreated) : null,
        DateModified: annotation.DateModified ? new Date(annotation.DateModified) : null,
        BookTitle: annotation.BookTitle || 'Unknown Book',
        Author: annotation.Author || 'Unknown Author',
      }));
    } catch (error) {
      console.error('[DB ERROR] getAnnotations failed:', error);
      console.error('[DB ERROR] Error message:', error.message);
      throw new DatabaseError(
        'Failed to fetch annotations from database',
        ERROR_CODES.DB_QUERY_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Get reading statistics
   * @returns {Promise<object>} Reading statistics
   */
  async getReadingStats() {
    await this.ready;

    try {
      const query = `
        SELECT
          COUNT(*) as TotalBooks,
          SUM(CASE WHEN ___PercentRead > 0 THEN 1 ELSE 0 END) as BooksStarted,
          SUM(CASE WHEN ___PercentRead >= 100 THEN 1 ELSE 0 END) as BooksFinished,
          SUM(CASE WHEN ReadStatus = 1 THEN 1 ELSE 0 END) as CurrentlyReading,
          SUM(TimeSpentReading) as TotalMinutesRead,
          AVG(___PercentRead) as AverageProgress,
          COUNT(DISTINCT Attribution) as UniqueAuthors
        FROM content
        WHERE ContentType = 6
          AND BookTitle IS NULL
          AND IsDownloaded = 'true'
          AND ContentID LIKE 'file://%'
      `;

      const result = this.db.exec(query);
      const stats = this.parseResults(result)[0] || {};

      return {
        totalBooks: stats.TotalBooks || 0,
        booksStarted: stats.BooksStarted || 0,
        booksFinished: stats.BooksFinished || 0,
        currentlyReading: stats.CurrentlyReading || 0,
        totalMinutesRead: stats.TotalMinutesRead || 0,
        averageProgress: stats.AverageProgress ? Math.round(stats.AverageProgress) : 0,
        uniqueAuthors: stats.UniqueAuthors || 0,
      };
    } catch (error) {
      console.error('[DB ERROR] getReadingStats failed:', error);
      console.error('[DB ERROR] Error message:', error.message);
      throw new DatabaseError(
        'Failed to fetch reading statistics',
        ERROR_CODES.DB_QUERY_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Get device information from database
   * @returns {Promise<object>} Device information
   */
  async getDeviceInfo() {
    await this.ready;

    try {
      // Try to get device info from various tables
      let deviceModel = 'Unknown Kobo Device';
      let firmwareVersion = 'Unknown';

      // Check if there's a device info table
      const tablesQuery = `
        SELECT name FROM sqlite_master
        WHERE type='table' AND name LIKE '%device%'
      `;
      const tablesResult = this.db.exec(tablesQuery);

      // Get version from user table if available
      try {
        const versionQuery = `SELECT UserID, StoreUserID FROM user LIMIT 1`;
        const versionResult = this.db.exec(versionQuery);
        const userData = this.parseResults(versionResult)[0];

        if (userData) {
          // Extract some info (but anonymize sensitive data)
          deviceModel = 'Kobo Device';
        }
      } catch (e) {
        // Table might not exist, that's okay
      }

      return {
        model: deviceModel,
        firmwareVersion: firmwareVersion,
        databaseVersion: this.getDatabaseVersion(),
        schemaVersion: this.getSchemaVersion(),
      };
    } catch (error) {
      // If we can't get device info, return defaults
      return {
        model: 'Unknown Kobo Device',
        firmwareVersion: 'Unknown',
        databaseVersion: 'Unknown',
        schemaVersion: 0,
      };
    }
  }

  /**
   * Get SQLite library version
   * @private
   * @returns {string} SQLite version string
   */
  getDatabaseVersion() {
    try {
      const query = `SELECT sqlite_version() as version`;
      const result = this.db.exec(query);
      const data = this.parseResults(result)[0];
      return data ? data.version : 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Get Kobo database schema version via PRAGMA user_version
   * Different Kobo firmware versions bump this number when changing the schema
   * @returns {number} Schema version (0 if unknown)
   */
  getSchemaVersion() {
    try {
      const result = this.db.exec('PRAGMA user_version');
      const data = this.parseResults(result)[0];
      return data ? data.user_version : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get collections (shelves)
   * @returns {Promise<Array<object>>} Array of collection objects
   */
  async getCollections() {
    await this.ready;

    try {
      const query = `
        SELECT
          Id,
          Name,
          InternalName,
          Type,
          CreationDate,
          LastModified
        FROM Shelf
        WHERE Type != 'SystemTag'
        ORDER BY Name
      `;

      const result = this.db.exec(query);
      const collections = this.parseResults(result);

      return collections.map(collection => ({
        ...collection,
        CreationDate: collection.CreationDate ? new Date(collection.CreationDate) : null,
        LastModified: collection.LastModified ? new Date(collection.LastModified) : null,
      }));
    } catch (error) {
      // Collections might not exist
      return [];
    }
  }

  /**
   * Get books in a specific collection
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Array<string>>} Array of ContentIDs
   */
  async getBooksInCollection(collectionId) {
    await this.ready;

    try {
      const query = `
        SELECT ContentId
        FROM ShelfContent
        WHERE ShelfName = ?
      `;

      const stmt = this.db.prepare(query);
      stmt.bind([collectionId]);

      const contentIds = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        contentIds.push(row.ContentId);
      }
      stmt.free();

      return contentIds;
    } catch (error) {
      return [];
    }
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Export database to ArrayBuffer
   * @returns {Promise<ArrayBuffer>} Database as ArrayBuffer
   */
  async export() {
    await this.ready;
    const data = this.db.export();
    return data.buffer;
  }

  /**
   * Sanitize database for restore
   * Runs VACUUM and sets incompatible flags to defaults
   * @returns {Promise<void>}
   */
  async sanitize() {
    await this.ready;
    try {
      console.log('[DB] Running integrity check...');
      const integrity = this.db.exec("PRAGMA integrity_check");
      console.log('[DB] Integrity check result:', integrity[0].values[0][0]);

      console.log('[DB] Sanitizing database...');
      // 1. Force rollback journal mode (no WAL)
      this.db.exec("PRAGMA journaling_mode = DELETE");

      // 2. Vacuum to rebuild the database file structure cleanly
      // This fixes fragmentation and ensures a clean SQLite file
      this.db.exec("VACUUM");

      console.log('[DB] Database sanitized successfully');
    } catch (error) {
      console.error('[DB ERROR] Sanitize failed:', error);
      throw new DatabaseError(
        'Failed to sanitize database',
        ERROR_CODES.DB_WRITE_ERROR,
        { originalError: error }
      );
    }
  }
}

/**
 * Open a Kobo database from ArrayBuffer
 * @param {ArrayBuffer} arrayBuffer - Database file as ArrayBuffer
 * @returns {Promise<KoboDatabase>} KoboDatabase instance
 */
export async function openDatabase(arrayBuffer) {
  const db = new KoboDatabase(arrayBuffer);
  await db.ready;
  return db;
}

/**
 * Extract all data from Kobo database
 * @param {ArrayBuffer} arrayBuffer - Database file as ArrayBuffer
 * @returns {Promise<object>} All extracted data
 */
export async function extractAllData(arrayBuffer) {
  const db = await openDatabase(arrayBuffer);

  try {
    const [books, annotations, stats, deviceInfo, collections] = await Promise.all([
      db.getBooks(),
      db.getAnnotations(),
      db.getReadingStats(),
      db.getDeviceInfo(),
      db.getCollections(),
    ]);

    return {
      books,
      annotations,
      stats,
      deviceInfo,
      collections,
      databaseSize: arrayBuffer.byteLength,
    };
  } finally {
    db.close();
  }
}
