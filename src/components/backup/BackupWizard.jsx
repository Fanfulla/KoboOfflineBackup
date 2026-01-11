/**
 * Backup wizard - orchestrates the entire backup flow
 */

import { useState } from 'react';
import { useFileSystem } from '../../hooks/useFileSystem.js';
import { useKoboDevice } from '../../hooks/useKoboDevice.js';
import { useBackup } from '../../hooks/useBackup.js';
import { useKoboStore } from '../../stores/koboStore.js';
import { Container } from '../layout/Container.jsx';

import { DeviceSelector } from './DeviceSelector.jsx';
import { ScanningScreen } from './ScanningScreen.jsx';
import { LibraryOverview } from './LibraryOverview.jsx';
import { BackupConfiguration } from './BackupConfiguration.jsx';
import { BackupProgress } from './BackupProgress.jsx';
import { BackupSuccess } from './BackupSuccess.jsx';

export function BackupWizard({ onComplete }) {
  const [step, setStep] = useState('select'); // select, scanning, overview, configure, progress, success
  const [backupOptions, setBackupOptions] = useState({
    includeBooks: true,
    includeAnnotations: true,
    includeProgress: true,
    includeSettings: false,
  });

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
  const handleContinueToConfig = () => {
    setStep('configure');
  };

  // Step 3: Start backup
  const handleStartBackup = async () => {
    setStep('progress');

    try {
      const result = await backup.create(koboData, backupOptions);

      if (result) {
        // Add to history
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
        // User cancelled
        setStep('configure');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      setStep('configure');
    }
  };

  // Step 4: Create another or done
  const handleCreateAnother = () => {
    fileSystem.clearDirectory();
    koboDevice.clearDevice();
    backup.reset();
    setKoboData(null);
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
          <BackupProgress progress={backup.progress} />
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
