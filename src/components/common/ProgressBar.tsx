export interface ProgressBarProps {
  percent?: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ percent = 0, label, showLabel = false, className = '' }: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, percent));

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-kobo-gray">{label}</span>
          <span className="text-sm font-semibold text-kobo-dark">{Math.round(value)}%</span>
        </div>
      )}
      <div
        className="h-2 bg-kobo-gray-light/30 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-label={label}
      >
        <div
          className="h-full bg-kobo-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
