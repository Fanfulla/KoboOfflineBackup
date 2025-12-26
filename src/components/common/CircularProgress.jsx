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
          stroke="var(--kobo-cream-dark)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--kobo-accent)" />
            <stop offset="100%" stopColor="var(--kobo-accent-dark)" />
          </linearGradient>
        </defs>
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-kobo-dark">
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
