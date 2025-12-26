/**
 * Linear progress bar with shimmer animation
 */

import PropTypes from 'prop-types';
import { formatProgress } from '../../utils/formatters.js';

export function ProgressBar({
  percent = 0,
  showLabel = false,
  label = null,
  animated = true,
  className = '',
}) {
  const normalizedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-kobo-gray">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-semibold text-kobo-dark">
            {formatProgress(normalizedPercent)}
          </span>
        </div>
      )}
      <div className="h-3 bg-kobo-cream-dark rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-kobo-accent to-kobo-accent-dark rounded-full transition-all duration-500 ease-out relative ${animated ? 'progress-shimmer' : ''}`}
          style={{ width: `${normalizedPercent}%` }}
        >
          {animated && normalizedPercent < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  percent: PropTypes.number,
  showLabel: PropTypes.bool,
  label: PropTypes.string,
  animated: PropTypes.bool,
  className: PropTypes.string,
};
