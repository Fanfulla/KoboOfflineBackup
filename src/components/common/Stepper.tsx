import { useI18n } from '../../i18n/core.ts';
import { Icon } from './Icon.tsx';

/** Wizard progress indicator (ordered list with aria-current). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  const { m, fmt } = useI18n();
  return (
    <nav aria-label={fmt(m.common.stepOf, { current: current + 1, total: steps.length })} className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li
              key={label}
              className="flex items-center gap-2 sm:gap-4"
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    state === 'todo' ? 'bg-kobo-cream-dark text-kobo-gray' : 'bg-kobo-accent text-kobo-dark'
                  }`}
                  aria-hidden="true"
                >
                  {state === 'done' ? <Icon type="check" size="sm" /> : i + 1}
                </span>
                <span
                  className={`hidden text-sm sm:inline ${state === 'current' ? 'font-semibold text-kobo-dark' : 'text-kobo-gray'}`}
                >
                  {label}
                </span>
              </span>
              {i < steps.length - 1 && (
                <span className="h-0.5 w-6 bg-kobo-cream-dark sm:w-10" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
