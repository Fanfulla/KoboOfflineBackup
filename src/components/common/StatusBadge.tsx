import type { ReactNode } from 'react';

export interface StatusBadgeProps {
  children: ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

const VARIANTS = {
  success: 'bg-kobo-success/15 text-kobo-dark',
  warning: 'bg-kobo-warning/15 text-kobo-dark',
  error: 'bg-kobo-error/10 text-kobo-error',
  info: 'bg-kobo-info/10 text-kobo-info',
  default: 'bg-kobo-gray-light/20 text-kobo-gray',
};

export function StatusBadge({ children, status = 'info', className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs ${VARIANTS[status]} ${className}`}
    >
      {children}
    </span>
  );
}
