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
    success: 'bg-kobo-success/10 border-kobo-success/20 text-kobo-success',
    warning: 'bg-kobo-warning/10 border-kobo-warning/20 text-kobo-warning',
    error: 'bg-kobo-error/10 border-kobo-error/20 text-kobo-error',
    info: 'bg-kobo-info/10 border-kobo-info/20 text-kobo-info',
  };

  const variantClass = variants[status] || variants.info;

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm ${variantClass} ${className}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
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
