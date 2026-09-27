import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useI18n } from '../i18n/core.ts';
import { REPO_URL } from '../seo/meta.ts';
import { Button } from './common/Button.tsx';
import { Card } from './common/Card.tsx';
import { Icon } from './common/Icon.tsx';

function ErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const { m } = useI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-xl text-center" role="alert">
        <Icon type="alert" size={48} className="mx-auto mb-4 text-kobo-error" />
        <h1 className="mb-3 text-3xl text-kobo-dark">{m.errors.genericTitle}</h1>
        <p className="mb-6 text-kobo-gray">{m.errors.genericBody}</p>
        {import.meta.env.DEV && (
          <pre className="mb-6 overflow-x-auto text-left text-xs text-kobo-gray">{error.stack}</pre>
        )}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={onReset}>{m.common.retry}</Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            {m.errors.reload}
          </Button>
        </div>
        <a
          href={`${REPO_URL}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-sm text-kobo-accent-ink underline"
        >
          {m.errors.report}
        </a>
      </Card>
    </div>
  );
}

interface State {
  error: Error | null;
}

/** Catches render errors in a page without taking down the whole layout. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    return this.state.error ? (
      <ErrorFallback error={this.state.error} onReset={() => this.setState({ error: null })} />
    ) : (
      this.props.children
    );
  }
}
