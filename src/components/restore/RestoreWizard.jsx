/**
 * Restore wizard - orchestrates the entire restore flow
 */

import { useState } from 'react';
import { useFileSystem } from '../../hooks/useFileSystem.js';
import { useRestore } from '../../hooks/useRestore.js';
import { Container } from '../layout/Container.jsx';

import { RestoreDeviceSelector } from './RestoreDeviceSelector.jsx';
import { FileUploader } from './FileUploader.jsx';
import { BackupPreview } from './BackupPreview.jsx';
import { RestoreOptions } from './RestoreOptions.jsx';
import { RestoreProgress } from './RestoreProgress.jsx';
import { RestoreSuccess } from './RestoreSuccess.jsx';

export function RestoreWizard({ onComplete }) {
  const [step, setStep] = useState('upload'); // upload, selectDevice, preview, options, progress, success
  const [restoreOptions, setRestoreOptions] = useState({
    includeAnnotations: true,
    includeProgress: true,
    confirmed: false,
  });
  const [deviceHandle, setDeviceHandle] = useState(null);

  const fileSystem = useFileSystem();
  const restore = useRestore();

  // Step 1: Upload backup file
  const handleFileSelect = async (file) => {
    try {
      await restore.parse(file);
      setStep('selectDevice');
    } catch (error) {
      console.error('Failed to parse backup:', error);
    }
  };

  // Step 2: Select target device
  const handleSelectDevice = async () => {
    const dirHandle = await fileSystem.selectDirectory();

    if (dirHandle) {
      setDeviceHandle(dirHandle);

      // Check compatibility
      if (restore.backupData) {
        // For now, just proceed to preview
        // In a real app, you'd extract device info and check compatibility
        setStep('preview');
      }
    }
  };

  // Step 3: After preview, go to options
  const handleConfirmPreview = () => {
    setStep('options');
  };

  // Step 4: Start restore
  const handleStartRestore = async () => {
    if (!deviceHandle) {
      console.error('No device selected');
      return;
    }

    setStep('progress');

    try {
      const result = await restore.restore(deviceHandle, restoreOptions);

      if (result) {
        setStep('success');
      } else {
        // User cancelled or error
        setStep('options');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      setStep('options');
    }
  };

  // Done or cancel
  const handleDone = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleCancel = () => {
    // Go back to previous step or start
    if (step === 'preview') {
      setStep('selectDevice');
    } else if (step === 'options') {
      setStep('preview');
    } else {
      setStep('upload');
      restore.clear();
      setDeviceHandle(null);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <Container maxWidth="6xl">
        {step === 'upload' && (
          <FileUploader
            onFileSelect={handleFileSelect}
            error={restore.error}
          />
        )}

        {step === 'selectDevice' && (
          <RestoreDeviceSelector
            onSelectDevice={handleSelectDevice}
            isSelecting={fileSystem.isSelecting}
            error={fileSystem.error}
          />
        )}

        {step === 'preview' && restore.preview && (
          <BackupPreview
            preview={restore.preview}
            compatibility={restore.compatibility}
            onRestore={handleConfirmPreview}
            onCancel={handleCancel}
          />
        )}

        {step === 'options' && restore.preview && (
          <RestoreOptions
            options={restoreOptions}
            onOptionsChange={setRestoreOptions}
            onConfirm={handleStartRestore}
            onCancel={handleCancel}
            bookCount={restore.preview.contents.bookCount}
            annotationCount={restore.preview.statistics.totalAnnotations}
          />
        )}

        {step === 'progress' && (
          <RestoreProgress progress={restore.progress} />
        )}

        {step === 'success' && restore.result && (
          <RestoreSuccess
            result={restore.result}
            onDone={handleDone}
          />
        )}
      </Container>
    </div>
  );
}
