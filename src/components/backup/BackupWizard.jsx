/**
 * Backup wizard — orchestrates the entire backup flow.
 */

import { useState } from 'react';
import { useFileSystem } from '../../hooks/useFileSystem.js';
import { useKoboDevice } from '../../hooks/useKoboDevice.js';
import { useBackup } from '../../hooks/useBackup.js';
import { useKoboStore } from '../../stores/koboStore.js';
import { generateBackupFilename } from '../../utils/backup.js';
import { Container } from '../layout/Container.jsx';

import { DeviceSelector } from './DeviceSelector.jsx';
import { ScanningScreen } from './ScanningScreen.jsx';
import { LibraryOverview } from './LibraryOverview.jsx';
import { BackupConfiguration } from './BackupConfiguration.jsx';
import { BackupProgress } from './BackupProgress.jsx';
import { BackupSuccess } from './BackupSuccess.jsx';

export function BackupWizard({ onComplete }) {
  const [step, setStep] = useState('select'); // select | scanning | overview | configure | progress | success
  const [backupOptions, setBackupOptions] = useState({
    includeBooks: true,
    includeAnnotations: true,
    includeProgress: true,
    includeSettings: false,
  });
  const [backupError, setBackupError] = useState(null);

  const fileSystem = useFileSystem();
  const koboDevice = useKoboDevice();
  const backup = useBackup();
  const addBackup = useKoboStore((state) => state.addBackup);

  const [koboData, setKoboData] = useState(null);

  // Step 1: Select device
  const handleSelectDevice = async () => {
    const dirHandle = await fileSystem.selectDirectory();
    if (dirHandle) {
      setStep('scanning');
      try {
        const data = await koboDevice.scanDevice(dirHandle);
        setKoboData(data);
        setStep('overview');
      } catch (error) {
        console.error('Scan failed:', error);
        setStep('select');
      }
    }
  };

  // Step 2: After overview, go to configuration
  const handleContinueToConfig = () => setStep('configure');

  // Step 3: Start backup
  //
  // CRITICAL: showSaveFilePicker must be called BEFORE any await inside this
  // function. Chrome requires a synchronous user-gesture chain — any await
  // before the picker call breaks that chain and throws SecurityError.
  // The picker IS async (it shows a dialog), but calling await on it from
  // within a synchronous click handler preserves the gesture context.
  const handleStartBackup = async () => {
    const suggestedFilename = generateBackupFilename();

    // Try to get a writable file handle via the streaming-friendly API.
    let writableFileHandle = null;
    if ('showSaveFilePicker' in window) {
      try {
        writableFileHandle = await window.showSaveFilePicker({
          suggestedName: suggestedFilename,
          startIn: 'downloads',
          types: [{ description: 'Kobo Backup Archive', accept: { 'application/zip': ['.zip'] } }],
        });
      } catch (err) {
        if (err.name === 'AbortError') {
          // User dismissed the dialog — stay on configure screen
          return;
        }
        // Other error (e.g. browser restriction) — fall through to blob path
        console.warn('[BACKUP] showSaveFilePicker failed, using blob fallback:', err.message);
      }
    }

    setStep('progress');
    setBackupError(null);

    try {
      const result = await backup.create(koboData, {
        ...backupOptions,
        writableFileHandle,
        suggestedFilename,
      });

      if (result) {
        addBackup({
          filename: result.filename,
          created: new Date().toISOString(),
          size: result.size,
          deviceModel: koboData.deviceInfo?.model || 'Unknown',
          bookCount: koboData.books?.length || 0,
          annotationCount: koboData.annotations?.length || 0,
        });
        setStep('success');
      } else {
        setStep('configure');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      // Stay on progress screen and show the error there instead of
      // silently returning to configure (which gave users zero feedback).
      setBackupError(error.message || 'An unexpected error occurred during backup.');
    }
  };

  const handleRetryAfterError = () => {
    setBackupError(null);
    backup.reset();
    setStep('configure');
  };

  // Step 4: Create another or done
  const handleCreateAnother = () => {
    fileSystem.clearDirectory();
    koboDevice.clearDevice();
    backup.reset();
    setKoboData(null);
    setBackupError(null);
    setStep('select');
  };

  const handleDone = () => {
    if (onComplete) {
      onComplete();
    } else {
      handleCreateAnother();
    }
  };

  return (
    <div className="min-h-screen py-12">
      <Container className="max-w-6xl">
        {step === 'select' && (
          <DeviceSelector
            onSelectDevice={handleSelectDevice}
            isSelecting={fileSystem.isSelecting}
            error={fileSystem.error || koboDevice.error}
          />
        )}

        {step === 'scanning' && (
          <ScanningScreen scanProgress={koboDevice.scanProgress} />
        )}

        {step === 'overview' && koboData && (
          <LibraryOverview
            books={koboData.books}
            annotations={koboData.annotations}
            stats={koboData.stats}
            estimatedSize={backup.estimateSize(koboData)}
            onContinue={handleContinueToConfig}
          />
        )}

        {step === 'configure' && koboData && (
          <BackupConfiguration
            options={backupOptions}
            onOptionsChange={setBackupOptions}
            onStartBackup={handleStartBackup}
            estimatedSize={backup.estimateSize(koboData)}
            bookCount={koboData.books?.length || 0}
            annotationCount={koboData.annotations?.length || 0}
          />
        )}

        {step === 'progress' && (
          <BackupProgress
            progress={backup.progress}
            error={backupError}
            onRetry={handleRetryAfterError}
          />
        )}

        {step === 'success' && backup.result && (
          <BackupSuccess
            result={backup.result}
            onCreateAnother={handleCreateAnother}
            onDone={handleDone}
          />
        )}
      </Container>
    </div>
  );
}
