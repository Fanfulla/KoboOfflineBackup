/**
 * Circular progress indicator (SVG-based)
 */

import PropTypes from 'prop-types';

export function CircularProgress({
  percent = 0,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
  className = '',
}) {
  const normalizedPercent = Math.min(100, Math.max(0, percent));

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedPercent / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-kobo-gray-light/30"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-kobo-accent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-display font-bold text-kobo-dark">
            {Math.round(normalizedPercent)}%
          </span>
        </div>
      )}
    </div>
  );
}

CircularProgress.propTypes = {
  percent: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};
