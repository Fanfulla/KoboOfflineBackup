/**
 * Device selector component with connection instructions
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';

export function DeviceSelector({ onSelectDevice, isSelecting, error }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-kobo-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon type="device" size="lg" className="text-kobo-accent" />
          </div>
          <h2 className="text-3xl font-display text-kobo-dark mb-2">
            Connect Your Kobo
          </h2>
          <p className="text-lg font-body text-kobo-gray">
            Follow these steps to connect your device
          </p>
        </div>

        {/* Connection Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-kobo-cream-dark rounded-lg">
            <div className="w-12 h-12 bg-kobo-accent text-white rounded-full flex items-center justify-center mx-auto mb-3 font-body font-bold text-xl">
              1
            </div>
            <h3 className="font-semibold font-display text-kobo-dark mb-2">
              Plug in USB
            </h3>
            <p className="text-sm font-body text-kobo-gray">
              Connect your Kobo to your computer using the USB cable
            </p>
          </div>

          <div className="p-4 bg-kobo-cream-dark rounded-lg">
            <div className="w-12 h-12 bg-kobo-accent text-white rounded-full flex items-center justify-center mx-auto mb-3 font-body font-bold text-xl">
              2
            </div>
            <h3 className="font-semibold font-display text-kobo-dark mb-2">
              Unlock Device
            </h3>
            <p className="text-sm font-body text-kobo-gray">
              Tap "Connect" on your Kobo screen when prompted
            </p>
          </div>

          <div className="p-4 bg-kobo-cream-dark rounded-lg">
            <div className="w-12 h-12 bg-kobo-accent text-white rounded-full flex items-center justify-center mx-auto mb-3 font-body font-bold text-xl">
              3
            </div>
            <h3 className="font-semibold font-display text-kobo-dark mb-2">
              Select Device
            </h3>
            <p className="text-sm font-body text-kobo-gray">
              Click the button below to select your Kobo drive
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-kobo-error/10 border-2 border-kobo-error/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon type="alert" className="text-kobo-error flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-semibold font-display text-kobo-error mb-1">
                  {error.title}
                </h4>
                <p className="text-sm font-body text-kobo-gray">
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Select Button */}
        <Button
          size="lg"
          variant="primary"
          onClick={onSelectDevice}
          loading={isSelecting}
          className="w-full md:w-auto"
        >
          <Icon type="folder" size={20} />
          {isSelecting ? 'Waiting for selection...' : 'Select Kobo Device'}
        </Button>

        {/* Help Text */}
        <div className="mt-6 text-sm font-body text-kobo-gray">
          <p>
            Your Kobo should appear as a drive named "KOBOeReader"
          </p>
        </div>
      </Card>
    </div>
  );
}
