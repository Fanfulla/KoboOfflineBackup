/**
 * User Guide page - comprehensive instructions for using Kobo Backup Manager
 */

import PropTypes from 'prop-types';
import { Button } from '../components/common/Button.jsx';

export function UserGuide({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-8"
      >
        ← Back to Home
      </Button>

      <h1 className="text-4xl font-bold text-kobo-dark mb-8">User Guide</h1>

      {/* Getting Started */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Getting Started</h2>
        <div className="prose prose-lg">
          <p className="text-kobo-gray mb-4">
            Kobo Backup Manager is a privacy-first web application that helps you backup and restore
            your Kobo e-reader library entirely in your browser. No data is sent to any server.
          </p>
          <div className="bg-kobo-accent/10 border-l-4 border-kobo-accent p-4 mb-4">
            <p className="font-medium text-kobo-dark">
              Requirements: Chrome 86+, Edge 86+, or any Chromium-based browser with File System Access API support.
            </p>
          </div>
        </div>
      </section>

      {/* Creating a Backup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Creating a Backup</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 1: Connect Your Kobo</h3>
            <p className="text-kobo-gray mb-2">
              Connect your Kobo e-reader to your computer using a USB cable. Wait for it to be recognized
              as a storage device.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 2: Start Backup Wizard</h3>
            <p className="text-kobo-gray mb-2">
              Click the "Create Backup" button on the home page. The backup wizard will guide you through
              the process.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 3: Select Kobo Device Folder</h3>
            <p className="text-kobo-gray mb-2">
              Click "Select Kobo Device" and navigate to your Kobo's root folder. This is typically named
              "KOBOeReader" in your file system.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 4: Scan Library</h3>
            <p className="text-kobo-gray mb-2">
              The app will scan your Kobo's database (KoboReader.sqlite) and display your library statistics:
              number of books, highlights, bookmarks, and shelves.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 5: Choose What to Backup</h3>
            <p className="text-kobo-gray mb-2">
              Select which data you want to include in your backup:
            </p>
            <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1">
              <li>Books and documents</li>
              <li>Reading progress and statistics</li>
              <li>Highlights and annotations</li>
              <li>Collections and shelves</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 6: Create Backup</h3>
            <p className="text-kobo-gray mb-2">
              Click "Create Backup" and choose where to save the backup ZIP file. The backup will be created
              entirely in your browser and downloaded to your chosen location.
            </p>
          </div>
        </div>
      </section>

      {/* Restoring a Backup */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Restoring a Backup</h2>
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="font-medium text-yellow-800">
              ⚠️ Restoring will overwrite existing data on your Kobo device. Make sure to backup your current
              library before restoring.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 1: Connect Your Kobo</h3>
            <p className="text-kobo-gray mb-2">
              Connect the Kobo device where you want to restore the backup using a USB cable.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 2: Start Restore Wizard</h3>
            <p className="text-kobo-gray mb-2">
              Click the "Restore Backup" button on the home page.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 3: Select Backup File</h3>
            <p className="text-kobo-gray mb-2">
              Choose the backup ZIP file you want to restore from your computer.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 4: Select Target Device</h3>
            <p className="text-kobo-gray mb-2">
              Choose your Kobo device folder as the restore destination.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Step 5: Review and Restore</h3>
            <p className="text-kobo-gray mb-2">
              Review what will be restored, then click "Restore Backup" to complete the process. Safely
              eject your Kobo device when done.
            </p>
          </div>
        </div>
      </section>

      {/* Viewing History */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Viewing Backup History</h2>
        <p className="text-kobo-gray mb-4">
          Click "View History" on the home page to see all your previous backups. The history includes:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1">
          <li>Backup creation date and time</li>
          <li>Number of books, highlights, and bookmarks</li>
          <li>Backup file size</li>
          <li>Device information</li>
        </ul>
        <p className="text-kobo-gray mt-4">
          History is stored locally in your browser's storage and never sent to any server.
        </p>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Troubleshooting</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Can't find KoboReader.sqlite?</h3>
            <p className="text-kobo-gray">
              Make sure your Kobo is connected and recognized as a storage device. Look for a folder named
              ".kobo" inside your Kobo device - the database file is located there.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Browser not supported?</h3>
            <p className="text-kobo-gray">
              This app requires Chrome 86+, Edge 86+, or another Chromium-based browser. Safari and Firefox
              do not yet support the File System Access API needed for direct device access.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Backup takes a long time?</h3>
            <p className="text-kobo-gray">
              Large libraries (500+ books) may take a few minutes to backup. This is normal as all processing
              happens in your browser without server assistance.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-kobo-dark mb-2">Restore didn't work?</h3>
            <p className="text-kobo-gray">
              Make sure you selected the correct Kobo device folder and that the device is not locked or
              write-protected. Try safely ejecting and reconnecting your Kobo.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Privacy & Security</h2>
        <p className="text-kobo-gray mb-4">
          Kobo Backup Manager is designed with privacy as a core principle:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li>All processing happens locally in your browser</li>
          <li>No data is sent to any server or cloud service</li>
          <li>Your backups remain on your computer under your control</li>
          <li>No account required, no registration needed</li>
          <li>Open source code available for security audit</li>
        </ul>
        <p className="text-kobo-gray mt-4">
          We use Google Analytics and ContentSquare solely to improve the service. See our{' '}
          <button
            onClick={() => onNavigate('privacy')}
            className="text-kobo-accent hover:underline"
          >
            Privacy Policy
          </button>
          {' '}for details.
        </p>
      </section>

      <div className="text-center mt-12">
        <Button onClick={() => onNavigate('home')}>
          Return to Home
        </Button>
      </div>
    </div>
  );
}

UserGuide.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
