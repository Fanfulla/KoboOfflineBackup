/**
 * App footer with links and privacy info
 */

import PropTypes from 'prop-types';

export function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-kobo-dark text-kobo-cream py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-3">Kobo Backup Manager</h3>
            <p className="text-sm text-kobo-gray-light">
              A free, open-source tool to backup and restore your Kobo e-reader library.
              All processing happens in your browser - your data never leaves your device.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('guide')}
                  className="text-kobo-gray-light hover:text-kobo-accent transition-colors"
                >
                  User Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="text-kobo-gray-light hover:text-kobo-accent transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-kobo-gray-light hover:text-kobo-accent transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kobo-gray-light hover:text-kobo-accent transition-colors inline-flex items-center gap-1"
                >
                  GitHub
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy Badge */}
          <div>
            <h3 className="text-lg font-bold mb-3">Privacy First</h3>
            <div className="space-y-2 text-sm text-kobo-gray-light">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-kobo-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No data sent to servers</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-kobo-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No account required</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-kobo-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Open source & auditable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-kobo-gray text-center text-sm text-kobo-gray-light">
          <p>
            &copy; {currentYear} Kobo Backup Manager. Not affiliated with Rakuten Kobo Inc.
          </p>
          <p className="mt-2">
            Made with ❤️ for book lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
