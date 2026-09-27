import type { ReactNode } from 'react';
import { Icon, type IconType } from './Icon.tsx';
import { errorText, useI18n } from '../../i18n/core.ts';
import type { UiError } from '../../types/kobo.ts';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const TONES: Record<AlertTone, { box: string; icon: IconType; iconClass: string }> = {
  info: { box: 'bg-kobo-info/10 border-kobo-info/30', icon: 'info', iconClass: 'text-kobo-info' },
  success: { box: 'bg-kobo-success/15 border-kobo-success/40', icon: 'check', iconClass: 'text-kobo-dark' },
  warning: { box: 'bg-kobo-warning/15 border-kobo-warning/50', icon: 'alert', iconClass: 'text-kobo-dark' },
  error: { box: 'bg-kobo-error/10 border-kobo-error/40', icon: 'alert', iconClass: 'text-kobo-error' },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Announce to screen readers when it appears. */
  live?: boolean;
}

export function Alert({ tone = 'info', title, children, className = '', live = false }: AlertProps) {
  const t = TONES[tone];
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 text-left ${t.box} ${className}`}
      role={live ? (tone === 'error' ? 'alert' : 'status') : undefined}
    >
      <Icon type={t.icon} className={`mt-0.5 shrink-0 ${t.iconClass}`} />
      <div className="min-w-0 flex-1 text-sm text-kobo-dark">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/** A localized error with the technical message tucked into <details>. */
export function ErrorAlert({
  error,
  title,
  children,
}: {
  error: UiError;
  title?: string;
  children?: ReactNode;
}) {
  const i18n = useI18n();
  const text = errorText(i18n, error);
  return (
    <Alert tone="error" title={title} live>
      <p>{text}</p>
      {text !== error.message && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-kobo-gray">
            {i18n.m.common.technicalDetails}
          </summary>
          <p className="mt-1 break-words font-mono text-xs text-kobo-gray">
            {error.code}: {error.message}
          </p>
        </details>
      )}
      {children}
    </Alert>
  );
}
