import { useId, type ReactNode } from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  sublabel?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Native checkbox with a custom look. The sublabel is linked with
 * aria-describedby (kept out of the label so the accessible name stays short).
 */
export function Checkbox({
  checked = false,
  onChange,
  label,
  sublabel,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const descriptionId = useId();
  return (
    <div className={`${disabled ? 'opacity-50' : ''} ${className}`}>
      <label className={`group flex items-start gap-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <span className="relative mt-1 flex items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => !disabled && onChange?.(e.target.checked)}
            disabled={disabled}
            aria-describedby={sublabel ? descriptionId : undefined}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className={`h-5 w-5 rounded-sm border-2 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-kobo-accent peer-focus-visible:ring-offset-2 ${
              checked
                ? 'border-kobo-accent bg-kobo-accent'
                : 'border-kobo-gray-light bg-white group-hover:border-kobo-accent'
            }`}
          >
            {checked && (
              <svg
                className="h-full w-full p-0.5 text-kobo-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        </span>
        {label && <span className="flex-1 text-base font-medium text-kobo-dark">{label}</span>}
      </label>
      {sublabel && (
        <p id={descriptionId} className="ml-7 mt-1 text-sm text-kobo-gray">
          {sublabel}
        </p>
      )}
    </div>
  );
}
