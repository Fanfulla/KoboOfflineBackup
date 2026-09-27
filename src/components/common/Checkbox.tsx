import { useId, type ReactNode } from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  sublabel?: ReactNode;
  disabled?: boolean;
  className?: string;
}

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
    <label
      className={`flex items-start gap-2 group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <span className="relative flex items-center justify-center mt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
          disabled={disabled}
          aria-describedby={sublabel ? descriptionId : undefined}
          className="sr-only peer"
        />
        <span
          aria-hidden="true"
          className={`w-5 h-5 rounded-sm border-2 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-kobo-accent peer-focus-visible:ring-offset-2 ${
            checked
              ? 'bg-kobo-accent border-kobo-accent'
              : 'bg-white border-kobo-gray-light group-hover:border-kobo-accent'
          }`}
        >
          {checked && (
            <svg
              className="w-full h-full text-kobo-dark p-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
      </span>

      {(label || sublabel) && (
        <span className="flex-1">
          {label && <span className="block text-base font-medium text-kobo-dark">{label}</span>}
          {sublabel && (
            <span id={descriptionId} className="block text-sm text-kobo-gray mt-1">
              {sublabel}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
