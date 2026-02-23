/**
 * Restore success screen
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';

export function RestoreSuccess({ result, onDone }) {
  const failedBooks = result.failedBooks || [];
  const verification = result.verification || null;
  const hasFailures = failedBooks.length > 0;
  const verificationFailed = verification && !verification.ok;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="text-center">
        {/* Success / Partial-success Animation */}
        <div className={`w-24 h-24 ${hasFailures ? 'bg-yellow-100' : 'bg-kobo-success/10'} rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce`}>
          <Icon
            type={hasFailures ? 'warning' : 'check'}
            size={48}
            className={hasFailures ? 'text-yellow-500' : 'text-kobo-success'}
          />
        </div>

        <h2 className="text-4xl font-display text-kobo-dark mb-4">
          {hasFailures ? 'Restore Completed with Warnings' : 'Restore Complete!'}
        </h2>

        <p className="text-lg font-body text-kobo-gray mb-8">
          {hasFailures
            ? `${result.booksRestored || 0} books restored, ${failedBooks.length} failed`
            : 'Your library has been successfully restored to your Kobo'}
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

        {/* Failed Books Warning */}
        {hasFailures && (
          <div className="text-left p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <h3 className="font-bold font-body text-yellow-800 mb-2 flex items-center gap-2">
              <Icon type="warning" size={18} />
              {failedBooks.length} book{failedBooks.length > 1 ? 's' : ''} could not be restored
            </h3>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {failedBooks.map((b, i) => (
                <li key={i} className="text-sm font-body text-yellow-700 flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  <span>
                    <span className="font-medium">{b.name}</span>
                    {b.error && <span className="text-yellow-600"> — {b.error}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verification Warning */}
        {verificationFailed && (
          <div className="text-left p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6">
            <h3 className="font-bold font-body text-orange-800 mb-1 flex items-center gap-2">
              <Icon type="warning" size={18} />
              Database count mismatch
            </h3>
            <p className="text-sm font-body text-orange-700">
              The restored database contains {verification.dbBooksCount} books but the backup
              reported {verification.expectedCount}. Some records may not have transferred.
              Try ejecting the device and reconnecting to trigger a full rescan.
            </p>
          </div>
        )}

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

        {/* Success / Partial message */}
        <div className={`p-4 ${hasFailures ? 'bg-yellow-50 border border-yellow-200' : 'bg-kobo-success/10 border border-kobo-success/20'} rounded-lg mb-8`}>
          <p className="font-body text-kobo-dark">
            {hasFailures ? (
              <>
                <Icon type="warning" size={16} className="inline text-yellow-500 mr-2" />
                Books and reading progress have been restored. Check the warnings above for any issues.
              </>
            ) : (
              <>
                <Icon type="check" size={16} className="inline text-kobo-success mr-2" />
                All your books, annotations, and reading progress have been restored
              </>
            )}
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
