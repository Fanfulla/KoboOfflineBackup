/**
 * Scanning screen showing progress while reading Kobo device
 */

import { Card } from '../common/Card.jsx';
import { ProgressBar } from '../common/ProgressBar.jsx';
import { Icon } from '../common/Icon.jsx';

export function ScanningScreen({ scanProgress }) {
  const { stage, current, total } = scanProgress;

  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        {/* Animated Loader */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-kobo-cream-dark rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-8 border-kobo-accent rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>

          <h2 className="text-2xl font-display text-kobo-dark mb-2">
            Scanning Your Kobo
          </h2>
          <p className="text-lg font-body text-kobo-gray">
            {stage || 'Preparing...'}
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          percent={percent}
          animated={true}
          className="mb-8"
        />

        {/* Status Details */}
        <div className="space-y-3">
          <StatusItem
            icon="check"
            text="Device connected"
            status="completed"
          />
          <StatusItem
            icon={current >= 1 ? "check" : "loading"}
            text="Reading database"
            status={current >= 1 ? "completed" : current === 0 ? "pending" : "active"}
          />
          <StatusItem
            icon={current >= 2 ? "check" : "loading"}
            text="Analyzing books"
            status={current >= 2 ? "completed" : current < 1 ? "pending" : "active"}
          />
          <StatusItem
            icon={current >= 3 ? "check" : "loading"}
            text="Finding book files"
            status={current >= 3 ? "completed" : current < 2 ? "pending" : "active"}
          />
          <StatusItem
            icon={current >= 4 ? "check" : "loading"}
            text="Scan complete"
            status={current >= 4 ? "completed" : "pending"}
          />
        </div>

        {/* Info Message */}
        <div className="mt-8 p-4 bg-kobo-info/10 rounded-lg">
          <p className="text-sm font-body text-kobo-gray">
            This may take a moment depending on your library size
          </p>
        </div>
      </Card>
    </div>
  );
}

function StatusItem({ icon, text, status }) {
  const statusColors = {
    completed: 'text-kobo-success',
    active: 'text-kobo-accent',
    pending: 'text-kobo-gray-light',
  };

  const statusIcons = {
    completed: 'check',
    active: 'loading',
    pending: 'loading',
  };

  const iconType = statusIcons[status] || icon;
  const colorClass = statusColors[status] || statusColors.pending;

  return (
    <div className={`flex items-center gap-3 ${status === 'pending' ? 'opacity-50' : ''}`}>
      <Icon type={iconType} size={20} className={colorClass} />
      <span className="font-body text-kobo-dark">{text}</span>
    </div>
  );
}
