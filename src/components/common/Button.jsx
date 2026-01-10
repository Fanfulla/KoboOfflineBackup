/**
 * Button component with Kobo design system variants
 */

import PropTypes from 'prop-types';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold rounded-lg transition-all-smooth focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-kobo-accent hover:bg-kobo-accent-dark text-white',
    secondary: 'bg-kobo-cream-dark hover:bg-kobo-gray-light/10 text-kobo-dark border-2 border-kobo-gray-light transition-colors',
    ghost: 'text-kobo-accent hover:bg-kobo-accent/10 transition-colors',
    danger: 'bg-kobo-error hover:bg-kobo-error/90 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="spinner w-4 h-4" />
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};
