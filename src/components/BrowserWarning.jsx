/**
 * Browser warning banner for limited support browsers
 */

import { useState } from 'react';
import { StatusBadge } from './common/StatusBadge.jsx';
import { Button } from './common/Button.jsx';

export function BrowserWarning({ features }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || features.hasModernFeatures) {
    return null;
  }

  return (
    <div className="bg-kobo-warning/10 border-b-2 border-kobo-warning/30 py-4 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-kobo-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-kobo-dark mb-2">
              Limited Browser Support
            </h3>
            <p className="text-sm text-kobo-gray mb-3">
              Your browser has limited support for this application. For the best
              experience, we recommend using Google Chrome 86+, Microsoft Edge 86+, or
              Opera 72+.
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="warning">
                Slower backup process
              </StatusBadge>
              <StatusBadge status="warning">
                Manual file selection required
              </StatusBadge>
            </div>
            <div className="mt-3 flex gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                Continue Anyway
              </Button>
              <a
                href="https://www.google.com/chrome/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-kobo-accent hover:text-kobo-accent-dark inline-flex items-center gap-1"
              >
                Download Chrome
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-kobo-warning/20 rounded"
            aria-label="Dismiss warning"
          >
            <svg
              className="w-5 h-5 text-kobo-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
