/**
 * Full-page error for completely unsupported browsers
 */

import { Card } from './common/Card.jsx';
import { Button } from './common/Button.jsx';

export function UnsupportedBrowser({ missingFeatures = [] }) {
  const recommendedBrowsers = [
    {
      name: 'Google Chrome',
      version: '86+',
      url: 'https://www.google.com/chrome/',
      icon: '🌐',
    },
    {
      name: 'Microsoft Edge',
      version: '86+',
      url: 'https://www.microsoft.com/edge',
      icon: '🌊',
    },
    {
      name: 'Opera',
      version: '72+',
      url: 'https://www.opera.com/',
      icon: '🎭',
    },
  ];

  return (
    <div className="min-h-screen bg-kobo-cream flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-kobo-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-kobo-error"
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

          <h1 className="text-4xl font-display font-bold text-kobo-dark mb-4">
            Browser Not Supported
          </h1>

          <p className="text-lg text-kobo-gray mb-8">
            Unfortunately, your current browser doesn't support the technologies
            required to run Kobo Backup Manager.
          </p>

          {/* Missing Features */}
          {missingFeatures.length > 0 && (
            <div className="bg-kobo-cream-dark rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-kobo-dark mb-3">
                Missing Required Features:
              </h3>
              <ul className="space-y-2">
                {missingFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-kobo-gray">
                    <svg
                      className="w-5 h-5 text-kobo-error flex-shrink-0 mt-0.5"
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
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Browsers */}
          <div className="mb-8">
            <h3 className="font-semibold text-kobo-dark mb-4">
              Recommended Browsers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedBrowsers.map((browser) => (
                <a
                  key={browser.name}
                  href={browser.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white rounded-lg border-2 border-kobo-gray-light hover:border-kobo-accent hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-2">{browser.icon}</div>
                  <h4 className="font-semibold text-kobo-dark">{browser.name}</h4>
                  <p className="text-sm text-kobo-gray">{browser.version}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="text-sm text-kobo-gray">
            <p>
              After installing a supported browser, return to this page and the app
              will work automatically.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
