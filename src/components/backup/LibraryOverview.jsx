/**
 * Library overview showing statistics after scan
 */

import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Icon } from '../common/Icon.jsx';
import { formatBytes, formatDuration } from '../../utils/formatters.js';

export function LibraryOverview({ books, annotations, stats, estimatedSize, onContinue }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display text-kobo-dark mb-2">
          Your Library
        </h2>
        <p className="text-lg font-body text-kobo-gray">
          Here's what we found on your Kobo
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="book"
          value={stats?.totalBooks || books?.length || 0}
          label="Books Found"
          color="blue"
        />
        <StatCard
          icon="note"
          value={stats?.totalAnnotations || annotations?.length || 0}
          label="Annotations"
          color="green"
        />
        <StatCard
          icon="storage"
          value={formatBytes(estimatedSize)}
          label="Estimated Size"
          color="purple"
        />
        <StatCard
          icon="chart"
          value={`${stats?.booksFinished || 0}`}
          label="Books Finished"
          color="orange"
        />
      </div>

      {/* Reading Stats */}
      {stats && (
        <Card>
          <h3 className="text-xl font-display text-kobo-dark mb-4">
            Reading Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-body text-kobo-gray mb-1">Books Started</p>
              <p className="text-2xl font-display text-kobo-dark">
                {stats.booksStarted}
              </p>
            </div>
            <div>
              <p className="text-sm font-body text-kobo-gray mb-1">Currently Reading</p>
              <p className="text-2xl font-display text-kobo-dark">
                {stats.currentlyReading}
              </p>
            </div>
            <div>
              <p className="text-sm font-body text-kobo-gray mb-1">Time Spent Reading</p>
              <p className="text-2xl font-display text-kobo-dark">
                {formatDuration(stats.totalMinutesRead)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recently Read Books Preview */}
      {books && books.length > 0 && (
        <Card>
          <h3 className="text-xl font-display text-kobo-dark mb-4">
            Recently Read Books
          </h3>
          <div className="space-y-3">
            {books.slice(0, 5).map((book, index) => (
              <div
                key={book.ContentID || index}
                className="flex items-center gap-4 p-3 bg-kobo-cream-dark rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold font-body text-kobo-dark truncate">
                    {book.Title}
                  </h4>
                  <p className="text-sm font-body text-kobo-gray truncate">
                    {book.Author}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-kobo-accent">
                    {book.Progress}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          {books.length > 5 && (
            <p className="text-sm font-body text-kobo-gray mt-3 text-center">
              And {books.length - 5} more books...
            </p>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          size="lg"
          variant="primary"
          onClick={onContinue}
          className="w-full sm:w-auto"
        >
          <Icon type="download" size={20} />
          Create Backup Now
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: 'bg-kobo-info/10 text-kobo-info',
    green: 'bg-kobo-success/10 text-kobo-success',
    purple: 'bg-kobo-accent/10 text-kobo-accent',
    orange: 'bg-kobo-warning/10 text-kobo-warning',
  };

  const colorClass = colors[color] || colors.blue;

  return (
    <Card className="text-center">
      <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center mx-auto mb-3`}>
        <Icon type={icon} size={24} />
      </div>
      <div className="text-2xl font-display text-kobo-dark mb-1">
        {value}
      </div>
      <div className="text-sm font-body text-kobo-gray">
        {label}
      </div>
    </Card>
  );
}
