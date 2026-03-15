/**
 * Hook for interacting with Kobo devices
 */

import { useState, useCallback } from 'react';
import { getFileByPath, readFile, getAllFiles } from '../utils/fileSystem.js';
import { extractAllData } from '../utils/koboDatabase.js';
import { isValidBookFile } from '../utils/validation.js';

/**
 * Hook to detect and read Kobo device data
 * @returns {object} Kobo device utilities and state
 */
export function useKoboDevice() {
  const [device, setDevice] = useState(null);
  const [books, setBooks] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [stats, setStats] = useState(null);
  const [bookFiles, setBookFiles] = useState([]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({
    stage: '',
    current: 0,
    total: 0,
  });
  const [error, setError] = useState(null);

  /**
   * Scan Kobo device and extract all data
   * @param {FileSystemDirectoryHandle} dirHandle - Kobo device directory
   */
  const scanDevice = useCallback(async (dirHandle) => {
    if (!dirHandle) {
      throw new Error('No directory handle provided');
    }

    setIsScanning(true);
    setError(null);

    try {
      // Step 1: Read database
      setScanProgress({
        stage: 'Reading database...',
        current: 1,
        total: 4,
      });

      const dbFileHandle = await getFileByPath(dirHandle, '.kobo/KoboReader.sqlite');
      const dbArrayBuffer = await readFile(dbFileHandle);

      // Step 2: Extract data from database
      setScanProgress({
        stage: 'Analyzing books...',
        current: 2,
        total: 4,
      });

      const extractedData = await extractAllData(dbArrayBuffer);

      setBooks(extractedData.books);
      setAnnotations(extractedData.annotations);
      setStats(extractedData.stats);
      setDevice(extractedData.deviceInfo);

      // Step 3: Find book files on device
      setScanProgress({
        stage: 'Finding book files...',
        current: 3,
        total: 4,
      });

      const allFiles = await getAllFiles(dirHandle);
      const filteredFiles = allFiles.filter(file => isValidBookFile(file.name));

      // Fetch file size for each book (metadata only, no content read)
      // so that estimateBackupSize() can return an accurate value.
      const foundBookFiles = await Promise.all(
        filteredFiles.map(async (file) => {
          try {
            const f = await file.handle.getFile();
            return { ...file, size: f.size };
          } catch {
            return { ...file, size: 0 };
          }
        })
      );

      setBookFiles(foundBookFiles);

      // Step 4: Complete
      setScanProgress({
        stage: 'Scan complete',
        current: 4,
        total: 4,
      });

      return {
        books: extractedData.books,
        annotations: extractedData.annotations,
        stats: extractedData.stats,
        deviceInfo: extractedData.deviceInfo,
        bookFiles: foundBookFiles,
        database: dbArrayBuffer,
      };
    } catch (err) {
      setError({
        title: 'Scan Failed',
        message: err.message || 'Failed to scan Kobo device',
        code: err.code || 'SCAN_FAILED',
      });
      throw err;
    } finally {
      setIsScanning(false);
    }
  }, []);

  /**
   * Get book by ContentID
   */
  const getBookById = useCallback((contentId) => {
    return books.find(book => book.ContentID === contentId);
  }, [books]);

  /**
   * Get annotations for a specific book
   */
  const getAnnotationsForBook = useCallback((contentId) => {
    return annotations.filter(annotation => annotation.VolumeID === contentId);
  }, [annotations]);

  /**
   * Clear all device data
   */
  const clearDevice = useCallback(() => {
    setDevice(null);
    setBooks([]);
    setAnnotations([]);
    setStats(null);
    setBookFiles([]);
    setError(null);
    setScanProgress({ stage: '', current: 0, total: 0 });
  }, []);

  return {
    device,
    books,
    annotations,
    stats,
    bookFiles,

    isScanning,
    scanProgress,
    error,

    scanDevice,
    getBookById,
    getAnnotationsForBook,
    clearDevice,

    hasDevice: device !== null,
    bookCount: books.length,
    annotationCount: annotations.length,
  };
}
