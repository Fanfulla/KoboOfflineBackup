import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const BASE =
  'font-semibold rounded-lg transition-all-smooth focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-kobo-accent hover:bg-kobo-accent-dark text-kobo-dark',
  secondary: 'bg-kobo-cream-dark hover:bg-kobo-gray-light/10 text-kobo-dark border-2 border-kobo-gray-light',
  outline: 'bg-white hover:bg-kobo-cream text-kobo-dark border-2 border-kobo-accent',
  ghost: 'text-kobo-dark hover:bg-kobo-accent/15',
  danger: 'bg-kobo-error hover:bg-kobo-error/90 text-white',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="spinner w-4 h-4" aria-hidden="true" />}
      {children}
    </button>
  );
}
