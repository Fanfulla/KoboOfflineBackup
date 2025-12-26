/**
 * File uploader for backup ZIP files (drag and drop)
 */

import { useState, useCallback } from 'react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';

export function FileUploader({ onFileSelect, error }) {
  const [isDragging, setIsDragging] = useState(false);

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
      onFileSelect(zipFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h2 className="text-3xl font-bold text-kobo-dark mb-2 text-center">
          Select Backup File
        </h2>
        <p className="text-lg text-kobo-gray mb-8 text-center">
          Choose your Kobo backup ZIP file to restore
        </p>

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

          <h3 className="text-xl font-bold text-kobo-dark mb-2">
            {isDragging ? 'Drop your backup file here' : 'Drag & drop your backup file'}
          </h3>

          <p className="text-kobo-gray mb-6">
            or
          </p>

          <input
            type="file"
            accept=".zip"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />

          <label htmlFor="file-input">
            <Button variant="secondary" size="lg" as="span">
              <Icon type="folder" size={20} />
              Browse Files
            </Button>
          </label>

          <p className="text-sm text-kobo-gray mt-4">
            Looking for: kobo_backup_*.zip
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-kobo-error/10 border-2 border-kobo-error/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon type="alert" className="text-kobo-error flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-semibold text-kobo-error mb-1">
                  {error.title}
                </h4>
                <p className="text-sm text-kobo-gray">
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
