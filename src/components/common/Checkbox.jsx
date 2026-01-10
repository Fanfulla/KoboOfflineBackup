/**
 * Custom styled checkbox component
 */

import PropTypes from 'prop-types';

export function Checkbox({
  checked = false,
  onChange,
  label = null,
  sublabel = null,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label className={`flex items-start gap-2 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative flex items-center justify-center mt-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`w-5 h-5 rounded border-2 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-kobo-accent peer-focus-visible:ring-offset-2 ${
            checked
              ? 'bg-kobo-accent border-kobo-accent'
              : 'bg-white border-kobo-gray-light group-hover:border-kobo-accent'
          } ${disabled ? '' : 'cursor-pointer'}`}
        >
          {checked && (
            <svg
              className="w-full h-full text-white p-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      {(label || sublabel) && (
        <div className="flex-1">
          {label && (
            <div className="text-base font-medium text-kobo-dark">
              {label}
            </div>
          )}
          {sublabel && (
            <div className="text-sm text-kobo-gray mt-1">
              {sublabel}
            </div>
          )}
        </div>
      )}
    </label>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.node,
  sublabel: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
