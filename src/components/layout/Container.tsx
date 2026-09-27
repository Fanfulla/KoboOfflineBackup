import type { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'default' | 'lg' | 'full';
  className?: string;
}

const SIZES = {
  sm: 'max-w-3xl',
  default: 'max-w-7xl',
  lg: 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function Container({ children, size = 'default', className = '' }: ContainerProps) {
  return <div className={`${SIZES[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
