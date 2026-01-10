/**
 * Linear progress bar with shimmer animation
 */

import PropTypes from 'prop-types';
import { formatProgress } from '../../utils/formatters.js';

export function ProgressBar({
  percent = 0,
  showLabel = false,
  label = null,
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
      <div className="h-2 bg-kobo-gray-light/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-kobo-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${normalizedPercent}%` }}
        />
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
