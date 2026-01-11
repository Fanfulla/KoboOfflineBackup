/**
 * Backup configuration - choose what to include
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Checkbox } from '../common/Checkbox.jsx';
import { Icon } from '../common/Icon.jsx';
import { formatBytes } from '../../utils/formatters.js';

export function BackupConfiguration({
  options,
  onOptionsChange,
  onStartBackup,
  estimatedSize,
  bookCount,
  annotationCount,
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h2 className="text-3xl font-display text-kobo-dark mb-2 text-center">
          Backup Configuration
        </h2>
        <p className="text-lg font-body text-kobo-gray mb-8 text-center">
          Choose what to include in your backup
        </p>

        <div className="space-y-4 mb-8">
          <Checkbox
            checked={true}
            disabled={true}
            label={`All Books (${bookCount} files)`}
            sublabel="Required - Your ebook files"
          />

          <Checkbox
            checked={options.includeAnnotations}
            onChange={(checked) => onOptionsChange({ ...options, includeAnnotations: checked })}
            label={`Annotations & Highlights (${annotationCount})`}
            sublabel="Recommended - Your notes and highlights"
          />

          <Checkbox
            checked={options.includeProgress}
            onChange={(checked) => onOptionsChange({ ...options, includeProgress: checked })}
            label="Reading Progress"
            sublabel="Recommended - Track where you left off"
          />

          <Checkbox
            checked={options.includeSettings}
            onChange={(checked) => onOptionsChange({ ...options, includeSettings: checked })}
            label="Device Settings"
            sublabel="Optional - May not work on different models"
          />
        </div>

        {/* Storage Estimate */}
        <div className="p-4 bg-kobo-info/10 border border-kobo-info/20 rounded-lg mb-8">
          <div className="flex items-center gap-3">
            <Icon type="info" className="text-kobo-info flex-shrink-0" />
            <div>
              <p className="font-semibold font-body text-kobo-dark">
                Estimated backup size: {formatBytes(estimatedSize)}
              </p>
              <p className="text-sm font-body text-kobo-gray">
                Make sure you have enough disk space available
              </p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          variant="primary"
          onClick={onStartBackup}
          className="w-full"
        >
          <Icon type="download" size={20} />
          Start Backup
        </Button>
      </Card>
    </div>
  );
}
