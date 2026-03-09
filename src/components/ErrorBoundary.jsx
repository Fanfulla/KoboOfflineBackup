/**
 * Error boundary - catches React errors and displays friendly error UI
 */

import { Component } from 'react';
import { Card } from './common/Card.jsx';
import { Button } from './common/Button.jsx';
import { Icon } from './common/Icon.jsx';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to log this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Clear error state and attempt to recover
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Optionally reload the page
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen bg-kobo-cream flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Card>
              <div className="text-center">
                {/* Error Icon */}
                <div className="w-24 h-24 bg-kobo-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon type="alert" size={48} className="text-kobo-error" />
                </div>

                {/* Error Heading */}
                <h1 className="text-4xl font-display font-bold text-kobo-dark mb-4">
                  Oops! Something Went Wrong
                </h1>

                <p className="text-lg text-kobo-gray mb-8">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>

                {/* Error Details (in development) */}
                {import.meta.env.DEV && this.state.error && (
                  <div className="mb-8 text-left">
                    <details className="bg-kobo-cream-dark rounded-lg p-4">
                      <summary className="font-semibold text-kobo-dark cursor-pointer mb-2">
                        Error Details (Development Only)
                      </summary>
                      <div className="text-sm text-kobo-gray font-mono overflow-x-auto">
                        <p className="mb-2">
                          <strong>Error:</strong> {this.state.error.toString()}
                        </p>
                        {this.state.errorInfo && (
                          <pre className="whitespace-pre-wrap text-xs bg-white p-3 rounded border border-kobo-gray-light">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        )}
                      </div>
                    </details>
                  </div>
                )}

                {/* Recovery Suggestions */}
                <div className="text-left p-6 bg-kobo-info/10 border border-kobo-info/20 rounded-lg mb-8">
                  <h3 className="font-semibold text-kobo-dark mb-3 flex items-center gap-2">
                    <Icon type="info" size={20} />
                    Try These Steps
                  </h3>
                  <ul className="space-y-2 text-sm text-kobo-gray">
                    <li className="flex items-start gap-2">
                      <span className="text-kobo-accent mt-1">•</span>
                      <span>Click "Try Again" to attempt recovery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-kobo-accent mt-1">•</span>
                      <span>Refresh the page to start fresh</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-kobo-accent mt-1">•</span>
                      <span>Make sure your Kobo device is properly connected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-kobo-accent mt-1">•</span>
                      <span>Check that your browser is up to date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-kobo-accent mt-1">•</span>
                      <span>Clear your browser cache and try again</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={this.handleReset}
                  >
                    Try Again
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={this.handleReload}
                  >
                    <Icon type="refresh" size={20} />
                    Reload Page
                  </Button>
                </div>

                {/* Support Link */}
                <div className="mt-8 pt-6 border-t border-kobo-cream-dark">
                  <p className="text-sm text-kobo-gray">
                    If the problem persists, please{' '}
                    <a
                      href="https://github.com/Fanfulla/KoboOfflineBackup/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-kobo-accent hover:underline font-semibold"
                    >
                      report this issue on GitHub
                    </a>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    // Render children normally when there's no error
    return this.props.children;
  }
}
