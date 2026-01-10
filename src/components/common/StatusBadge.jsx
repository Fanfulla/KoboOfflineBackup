/**
 * Status badge component for success, warning, error states
 */

import PropTypes from 'prop-types';

export function StatusBadge({
  children,
  status = 'info',
  icon = null,
  className = '',
}) {
  const variants = {
    success: 'bg-kobo-success/10 text-kobo-success',
    warning: 'bg-kobo-warning/10 text-kobo-warning',
    error: 'bg-kobo-error/10 text-kobo-error',
    info: 'bg-kobo-info/10 text-kobo-info',
    default: 'bg-kobo-gray-light/20 text-kobo-gray',
  };

  const variantClass = variants[status] || variants.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs ${variantClass} ${className}`}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
}

StatusBadge.propTypes = {
  children: PropTypes.node.isRequired,
  status: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
  icon: PropTypes.node,
  className: PropTypes.string,
};
