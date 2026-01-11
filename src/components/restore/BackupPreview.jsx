/**
 * Preview backup contents before restoring
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { formatBytes, formatDate } from '../../utils/formatters.js';

export function BackupPreview({ preview, compatibility, onRestore, onCancel }) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <h2 className="text-3xl font-display text-kobo-dark mb-2 text-center">
          Backup Details
        </h2>
        <p className="text-lg font-body text-kobo-gray mb-8 text-center">
          Review your backup before restoring
        </p>

        {/* Backup Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <InfoItem
            label="Created"
            value={formatDate(preview.created)}
          />
          <InfoItem
            label="Device Model"
            value={preview.deviceModel}
          />
          <InfoItem
            label="Books"
            value={preview.statistics.totalBooks}
          />
          <InfoItem
            label="Annotations"
            value={preview.statistics.totalAnnotations}
          />
        </div>

        {/* Reading Stats */}
        <div className="p-4 bg-kobo-cream-dark rounded-lg mb-8">
          <h3 className="font-semibold font-body text-kobo-dark mb-3">
            Reading Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-display text-kobo-dark">
                {preview.statistics.booksStarted}
              </p>
              <p className="text-sm font-body text-kobo-gray">Started</p>
            </div>
            <div>
              <p className="text-2xl font-display text-kobo-dark">
                {preview.statistics.booksFinished}
              </p>
              <p className="text-sm font-body text-kobo-gray">Finished</p>
            </div>
            <div>
              <p className="text-2xl font-display text-kobo-dark">
                {Math.floor(preview.statistics.totalReadingTime / 60)}h
              </p>
              <p className="text-sm font-body text-kobo-gray">Reading Time</p>
            </div>
          </div>
        </div>

        {/* Compatibility Check */}
        {compatibility && (
          <div className="mb-8">
            <h3 className="font-semibold font-body text-kobo-dark mb-3">
              Compatibility
            </h3>

            {compatibility.warnings.length === 0 ? (
              <StatusBadge status="success">
                <Icon type="check" size={16} />
                Fully compatible
              </StatusBadge>
            ) : (
              <div className="space-y-2">
                {compatibility.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="p-3 bg-kobo-warning/10 border border-kobo-warning/20 rounded-lg text-sm font-body text-kobo-gray"
                  >
                    <div className="flex items-start gap-2">
                      <Icon type="alert" size={16} className="text-kobo-warning flex-shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contents */}
        <div className="p-4 bg-kobo-info/10 border border-kobo-info/20 rounded-lg mb-8">
          <h3 className="font-semibold font-body text-kobo-dark mb-3">
            Backup Contents
          </h3>
          <div className="space-y-2 text-sm font-body">
            <div className="flex items-center justify-between">
              <span className="text-kobo-gray">Database</span>
              <Icon type="check" size={16} className="text-kobo-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-kobo-gray">Books ({preview.contents.bookCount})</span>
              {preview.contents.booksIncluded ? (
                <Icon type="check" size={16} className="text-kobo-success" />
              ) : (
                <Icon type="x" size={16} className="text-kobo-gray-light" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-kobo-gray">Annotations</span>
              {preview.contents.annotationsIncluded ? (
                <Icon type="check" size={16} className="text-kobo-success" />
              ) : (
                <Icon type="x" size={16} className="text-kobo-gray-light" />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            variant="primary"
            onClick={onRestore}
          >
            <Icon type="restore" size={20} />
            Restore This Backup
          </Button>
        </div>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="p-3 bg-white rounded-lg border-2 border-kobo-cream-dark">
      <p className="text-sm font-body text-kobo-gray mb-1">{label}</p>
      <p className="font-semibold font-body text-kobo-dark">{value}</p>
    </div>
  );
}
