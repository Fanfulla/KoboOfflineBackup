/**
 * File uploader for backup ZIP files (drag and drop)
 */

import { useState, useCallback } from 'react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';

const LARGE_FILE_THRESHOLD = 2 * 1024 * 1024 * 1024; // 2 GB

export function FileUploader({ onFileSelect, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const [largeFileWarning, setLargeFileWarning] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(f => f.name.endsWith('.zip'));

    if (zipFile) {
      setLargeFileWarning(zipFile.size > LARGE_FILE_THRESHOLD);
      onFileSelect(zipFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLargeFileWarning(file.size > LARGE_FILE_THRESHOLD);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h2 className="text-3xl font-display text-kobo-dark mb-2 text-center">
          Select Backup File
        </h2>
        <p className="text-lg font-body text-kobo-gray mb-8 text-center">
          Choose your Kobo backup ZIP file to restore
        </p>

        {/* Browser Compatibility Warning */}
        <div className="mb-6 p-4 bg-kobo-info/10 border border-kobo-info/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon type="info" className="text-kobo-info flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="text-sm font-semibold font-body text-kobo-dark mb-1">
                Browser Compatibility
              </p>
              <p className="text-sm font-body text-kobo-gray">
                Restore requires Chrome or Edge desktop browser. Not supported in Firefox, Safari, or mobile browsers.
              </p>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-4 border-dashed rounded-2xl p-12 text-center transition-all
            ${isDragging
              ? 'border-kobo-accent bg-kobo-accent/5'
              : 'border-kobo-gray-light bg-kobo-cream-dark/30'
            }
          `}
        >
          <Icon
            type="upload"
            size={64}
            className={`mx-auto mb-4 ${isDragging ? 'text-kobo-accent' : 'text-kobo-gray-light'}`}
          />

          <h3 className="text-xl font-body text-kobo-dark mb-2">
            {isDragging ? 'Drop your backup file here' : 'Drag & drop your backup file'}
          </h3>

          <p className="font-body text-kobo-gray mb-6">
            or
          </p>

          <input
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />

          <label
            htmlFor="file-input"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold rounded-lg bg-kobo-cream-dark hover:bg-kobo-gray-light/10 text-kobo-dark border-2 border-kobo-gray-light transition-colors cursor-pointer"
          >
            <Icon type="folder" size={20} />
            Browse Files
          </label>

          <p className="text-sm font-body text-kobo-gray mt-4">
            Looking for: kobo_backup_*.zip
          </p>
        </div>

        {/* Large file warning */}
        {largeFileWarning && !error && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon type="alert" className="text-yellow-600 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-semibold font-body text-yellow-800 mb-1">
                  Large backup detected (&gt;2 GB)
                </h4>
                <p className="text-sm font-body text-yellow-700">
                  Restoring large backups requires loading the entire ZIP into browser memory.
                  Make sure you have enough free RAM and no other heavy tabs open.
                  If it fails, close other applications and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-kobo-error/10 border-2 border-kobo-error/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon type="alert" className="text-kobo-error flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-semibold font-body text-kobo-error mb-1">
                  {error.title}
                </h4>
                <p className="text-sm font-body text-kobo-gray">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
