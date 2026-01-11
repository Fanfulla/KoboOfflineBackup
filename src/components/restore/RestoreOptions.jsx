/**
 * Restore options - choose what to restore and confirm
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Checkbox } from '../common/Checkbox.jsx';
import { Icon } from '../common/Icon.jsx';

export function RestoreOptions({
  options,
  onOptionsChange,
  onConfirm,
  onCancel,
  bookCount,
  annotationCount,
}) {
  const handleConfirmChange = (checked) => {
    onOptionsChange({ ...options, confirmed: checked });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h2 className="text-3xl font-display text-kobo-dark mb-2 text-center">
          Restore Options
        </h2>
        <p className="text-lg font-body text-kobo-gray mb-8 text-center">
          Choose what to restore to your Kobo
        </p>

        {/* Options */}
        <div className="space-y-4 mb-8">
          <Checkbox
            checked={true}
            disabled={true}
            label={`All Books (${bookCount} files)`}
            sublabel="Required"
          />

          <Checkbox
            checked={options.includeAnnotations}
            onChange={(checked) => onOptionsChange({ ...options, includeAnnotations: checked })}
            label={`Annotations & Highlights (${annotationCount})`}
            sublabel="Restore your notes and highlights"
          />

          <Checkbox
            checked={options.includeProgress}
            onChange={(checked) => onOptionsChange({ ...options, includeProgress: checked })}
            label="Reading Progress"
            sublabel="Continue where you left off"
          />
        </div>

        {/* Warning */}
        <div className="p-4 bg-kobo-error/10 border-2 border-kobo-error/30 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <Icon type="alert" className="text-kobo-error flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold font-body text-kobo-error mb-2">
                Warning: This Will Erase Current Device Content
              </h4>
              <p className="text-sm font-body text-kobo-gray mb-3">
                Restoring this backup will replace all current content on your Kobo
                device. Make sure you have a backup of any important data before
                proceeding.
              </p>
              <ul className="text-sm font-body text-kobo-gray space-y-1 list-disc list-inside">
                <li>Current sideloaded books will be replaced</li>
                <li>Reading progress will be overwritten</li>
                <li>Annotations will be replaced</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="mb-8">
          <Checkbox
            checked={options.confirmed || false}
            onChange={handleConfirmChange}
            label={
              <span className="font-semibold">
                I understand this will replace all content on the device
              </span>
            }
          />
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
            variant="danger"
            onClick={onConfirm}
            disabled={!options.confirmed}
          >
            <Icon type="restore" size={20} />
            Start Restore
          </Button>
        </div>
      </Card>
    </div>
  );
}
