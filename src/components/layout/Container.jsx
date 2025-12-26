/**
 * Container component for consistent max-width and padding
 */

import PropTypes from 'prop-types';

export function Container({ children, size = 'default', className = '' }) {
  const sizes = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const sizeClass = sizes[size] || sizes.default;

  return (
    <div className={`${sizeClass} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'full']),
  className: PropTypes.string,
};
