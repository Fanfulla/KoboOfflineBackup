/**
 * Card component with elevation and glass variants
 */

import PropTypes from 'prop-types';

export function Card({
  children,
  variant = 'elevated',
  gradient = false,
  className = '',
  ...props
}) {
  const baseStyles = 'rounded-2xl p-6 relative overflow-hidden';

  const variants = {
    elevated: 'bg-white card-elevated',
    glass: 'glass',
    flat: 'bg-kobo-cream-dark',
  };

  const variantClass = variants[variant] || variants.elevated;

  return (
    <div className={`${baseStyles} ${variantClass} ${className}`} {...props}>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-kobo-cream/40 to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['elevated', 'glass', 'flat']),
  gradient: PropTypes.bool,
  className: PropTypes.string,
};
