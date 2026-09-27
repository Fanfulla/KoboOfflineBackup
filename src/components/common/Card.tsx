import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'elevated' | 'glass' | 'flat';
  gradient?: boolean;
}

const VARIANTS = {
  elevated: 'bg-white shadow-elevated',
  glass: 'bg-kobo-glass backdrop-blur-xs',
  flat: 'bg-kobo-cream-dark',
};

export function Card({
  children,
  variant = 'elevated',
  gradient = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div className={`rounded-2xl p-6 relative overflow-hidden ${VARIANTS[variant]} ${className}`} {...props}>
      {gradient && (
        <div className="absolute inset-0 bg-linear-to-br from-kobo-cream/40 to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
