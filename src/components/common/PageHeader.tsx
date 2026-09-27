import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 text-center">
      <h1 className="mb-3 text-4xl text-kobo-dark sm:text-5xl">{title}</h1>
      {subtitle && <p className="mx-auto max-w-2xl text-lg text-kobo-gray">{subtitle}</p>}
      {children}
    </header>
  );
}
