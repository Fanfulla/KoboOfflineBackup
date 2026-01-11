/**
 * Backup success screen
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';
import { formatBytes, formatDate } from '../../utils/formatters.js';

export function BackupSuccess({ result, onCreateAnother, onDone }) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="text-center">
        {/* Success Animation */}
        <div className="w-24 h-24 bg-kobo-success/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Icon type="check" size={48} className="text-kobo-success" />
        </div>

        <h2 className="text-4xl font-display text-kobo-dark mb-4">
          Backup Complete!
        </h2>

        <p className="text-lg font-body text-kobo-gray mb-8">
          Your Kobo library has been successfully backed up
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon="file"
            label="Filename"
            value={result.filename}
            truncate
          />
          <SummaryCard
            icon="storage"
            label="Size"
            value={formatBytes(result.size)}
          />
          <SummaryCard
            icon="book"
            label="Books"
            value={result.metadata?.statistics?.totalBooks || 0}
          />
          <SummaryCard
            icon="note"
            label="Annotations"
            value={result.metadata?.statistics?.totalAnnotations || 0}
          />
        </div>

        {/* Download Info */}
        <div className="p-4 bg-kobo-success/10 border border-kobo-success/20 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <Icon type="download" className="text-kobo-success flex-shrink-0 mt-1" />
            <div className="text-left flex-1">
              <p className="font-semibold font-body text-kobo-dark mb-1">
                Backup saved to your Downloads folder
              </p>
              <p className="text-sm font-body text-kobo-gray">
                Look for: {result.filename}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-left mb-8 p-6 bg-kobo-cream-dark rounded-lg">
          <h3 className="font-display text-kobo-dark mb-4 flex items-center gap-2">
            <Icon type="info" size={20} />
            Recommended Next Steps
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-kobo-accent">☁️</span>
              <div>
                <p className="font-medium font-body text-kobo-dark">Upload to cloud storage</p>
                <p className="text-sm font-body text-kobo-gray">Google Drive, Dropbox, or OneDrive</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-kobo-accent">💾</span>
              <div>
                <p className="font-medium font-body text-kobo-dark">Copy to external drive</p>
                <p className="text-sm font-body text-kobo-gray">Keep a physical backup for safety</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-kobo-accent">🔒</span>
              <div>
                <p className="font-medium font-body text-kobo-dark">Store in multiple locations</p>
                <p className="text-sm font-body text-kobo-gray">3-2-1 backup rule: 3 copies, 2 different media, 1 offsite</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={onCreateAnother}
          >
            Create Another Backup
          </Button>
          <Button
            size="lg"
            variant="primary"
            onClick={onDone}
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, label, value, truncate }) {
  return (
    <div className="p-4 bg-white rounded-lg border-2 border-kobo-cream-dark">
      <Icon type={icon} size={24} className="text-kobo-accent mx-auto mb-2" />
      <p className="text-xs font-body text-kobo-gray mb-1">{label}</p>
      <p className={`text-base font-body text-kobo-dark ${truncate ? 'truncate' : ''}`}>
        {value}
      </p>
    </div>
  );
}
