/**
 * Restore success screen
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';

export function RestoreSuccess({ result, onDone }) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="text-center">
        {/* Success Animation */}
        <div className="w-24 h-24 bg-kobo-success/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Icon type="check" size={48} className="text-kobo-success" />
        </div>

        <h2 className="text-4xl font-display text-kobo-dark mb-4">
          Restore Complete!
        </h2>

        <p className="text-lg font-body text-kobo-gray mb-8">
          Your library has been successfully restored to your Kobo
        </p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <SummaryCard
            icon="book"
            value={result.booksRestored || 0}
            label="Books Restored"
          />
          <SummaryCard
            icon="note"
            value={result.metadata?.statistics?.totalAnnotations || 0}
            label="Annotations"
          />
          <SummaryCard
            icon="bookmark"
            value="All"
            label="Progress"
          />
        </div>

        {/* Next Steps */}
        <div className="text-left p-6 bg-kobo-cream-dark rounded-lg mb-8">
          <h3 className="font-bold font-body text-kobo-dark mb-4 flex items-center gap-2">
            <Icon type="info" size={20} />
            What's Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-kobo-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-kobo-accent font-body font-bold">1</span>
              </div>
              <div>
                <p className="font-medium font-body text-kobo-dark">Safely eject your Kobo</p>
                <p className="text-sm font-body text-kobo-gray">
                  Use your operating system's "Eject" or "Safely Remove Hardware" option
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-kobo-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-kobo-accent font-body font-bold">2</span>
              </div>
              <div>
                <p className="font-medium font-body text-kobo-dark">Disconnect USB cable</p>
                <p className="text-sm font-body text-kobo-gray">
                  Unplug the USB cable from your Kobo device
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-kobo-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-kobo-accent font-body font-bold">3</span>
              </div>
              <div>
                <p className="font-medium font-body text-kobo-dark">Your books are ready!</p>
                <p className="text-sm font-body text-kobo-gray">
                  Open your Kobo and start reading from where you left off
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="p-4 bg-kobo-success/10 border border-kobo-success/20 rounded-lg mb-8">
          <p className="font-body text-kobo-dark">
            <Icon type="check" size={16} className="inline text-kobo-success mr-2" />
            All your books, annotations, and reading progress have been restored
          </p>
        </div>

        {/* Done Button */}
        <Button
          size="lg"
          variant="primary"
          onClick={onDone}
          className="w-full sm:w-auto"
        >
          Done
        </Button>
      </Card>
    </div>
  );
}

function SummaryCard({ icon, value, label }) {
  return (
    <div className="p-4 bg-white rounded-lg border-2 border-kobo-cream-dark">
      <Icon type={icon} size={24} className="text-kobo-accent mx-auto mb-2" />
      <p className="text-2xl font-display text-kobo-dark mb-1">{value}</p>
      <p className="text-sm font-body text-kobo-gray">{label}</p>
    </div>
  );
}
