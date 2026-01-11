/**
 * Device selector for restore flow - distinct from backup flow
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';

export function RestoreDeviceSelector({ onSelectDevice, isSelecting, error }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-kobo-info/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon type="restore" size="lg" className="text-kobo-info" />
          </div>
          <h2 className="text-3xl font-display text-kobo-dark mb-2">
            Select Restore Destination
          </h2>
          <p className="text-lg font-body text-kobo-gray">
            Choose the Kobo device where you want to restore your backup
          </p>
        </div>

        {/* Important Warning */}
        <div className="mb-8 p-4 bg-kobo-warning/10 border-2 border-kobo-warning/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon type="alert" className="text-kobo-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-semibold text-kobo-dark mb-1">
                Important: Data Will Be Replaced
              </h4>
              <p className="text-sm font-body text-kobo-gray">
                Restoring will replace the current database on your Kobo device. Make sure you've backed up your current library if needed.
              </p>
            </div>
          </div>
        </div>

        {/* Prerequisites Checklist */}
        <div className="mb-8 p-6 bg-kobo-cream-dark rounded-lg">
          <h3 className="font-display font-semibold text-kobo-dark mb-4">
            Before You Continue
          </h3>
          <div className="space-y-3">
            <ChecklistItem
              text="Your Kobo device is connected via USB"
            />
            <ChecklistItem
              text="You've tapped 'Connect' on your Kobo screen"
            />
            <ChecklistItem
              text="Your Kobo appears as a drive (KOBOeReader)"
            />
            <ChecklistItem
              text="You have a backup of current data (if needed)"
              warning
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-kobo-error/10 border-2 border-kobo-error/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon type="alert" className="text-kobo-error flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-display font-semibold text-kobo-error mb-1">
                  {error.title}
                </h4>
                <p className="text-sm font-body text-kobo-gray">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="primary"
            onClick={onSelectDevice}
            loading={isSelecting}
          >
            <Icon type="folder" size={20} />
            {isSelecting ? 'Waiting for selection...' : 'Choose Kobo Device'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-kobo-cream-dark text-center">
          <p className="text-sm font-body text-kobo-gray">
            Select the root folder of your Kobo device (usually named "KOBOeReader")
          </p>
        </div>
      </Card>
    </div>
  );
}

function ChecklistItem({ text, warning = false }) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        type={warning ? "alert" : "check"}
        size={16}
        className={`flex-shrink-0 mt-0.5 ${warning ? 'text-kobo-warning' : 'text-kobo-success'}`}
      />
      <span className="text-sm font-body text-kobo-dark">{text}</span>
    </div>
  );
}
