/**
 * Analytics disclosure banner - shown once on first visit.
 * Informs the user that only Vercel Analytics (cookieless) is used.
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'analytics_banner_dismissed';

export function AnalyticsBanner({ onNavigate }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-kobo-dark text-kobo-cream shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="flex-1 text-sm">
          This site uses{' '}
          <strong>Vercel Analytics</strong> — a cookieless, privacy-preserving service that collects
          only anonymous page-view counts. No personal data, no cookies, no tracking across sites.{' '}
          <button
            onClick={() => { dismiss(); onNavigate('privacy'); }}
            className="underline text-kobo-accent hover:text-kobo-accent/80 transition-colors"
          >
            Privacy Policy
          </button>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 bg-kobo-accent hover:bg-kobo-accent/90 text-kobo-dark font-semibold text-sm px-4 py-1.5 rounded transition-colors"
        >
          OK, got it
        </button>
      </div>
    </div>
  );
}

AnalyticsBanner.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
