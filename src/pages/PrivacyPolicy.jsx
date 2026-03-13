/**
 * Privacy Policy page - GDPR compliant (March 2026)
 */

import PropTypes from 'prop-types';
import { Button } from '../components/common/Button.jsx';

export function PrivacyPolicy({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-8"
      >
        ← Back to Home
      </Button>

      <h1 className="text-4xl font-display font-bold text-kobo-dark mb-4">Privacy Policy</h1>
      <p className="text-kobo-gray mb-8">
        <strong>Last Updated:</strong> March 13, 2026
      </p>

      {/* Introduction */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Introduction</h2>
        <p className="text-kobo-gray mb-4">
          Kobo Backup Manager is a <strong>free, non-commercial, open-source</strong> web application
          that helps Kobo e-reader users backup their libraries. This Privacy Policy explains how data
          is processed when you use this tool.
        </p>
        <p className="text-kobo-gray mb-4">
          <strong>Key principles:</strong>
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1 mb-4">
          <li>No commercial purpose — this is a free personal project</li>
          <li>No account required — no registration or login</li>
          <li>Privacy-first architecture — all backup operations happen entirely in your browser</li>
          <li>Your Kobo library data never leaves your device</li>
          <li>Open source — full code available on GitHub for audit</li>
          <li>No cookies — the only analytics used is cookieless</li>
        </ul>
      </section>

      {/* About This Project */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">About This Project</h2>
        <p className="text-kobo-gray mb-4">
          This is a <strong>personal open-source project</strong> with no commercial entity behind it.
          The complete source code is available on GitHub, where you can:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1 mb-4">
          <li>Review the code to verify privacy claims</li>
          <li>Report issues or suggest improvements</li>
          <li>Fork and self-host your own copy (without any analytics)</li>
        </ul>
        <p className="text-kobo-gray mb-4">
          <strong>GDPR note:</strong> Although this is a non-commercial project, we still respect EU
          residents' privacy rights. The minimal analytics described below serves only to understand
          basic usage; it is never used for commercial gain.
        </p>
      </section>

      {/* Information We Collect */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Information We Collect</h2>

        <h3 className="text-xl font-display font-bold text-kobo-dark mb-3 mt-6">1. Library Data (Processed Locally Only)</h3>
        <p className="text-kobo-gray mb-4">
          When you create or restore a backup, the app processes:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 mb-4 space-y-1">
          <li>Kobo database contents (books, highlights, bookmarks, reading progress)</li>
          <li>Book files and metadata</li>
          <li>Collections and shelf information</li>
        </ul>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-medium text-green-800">
            ✓ This data is processed entirely within your browser using JavaScript and WebAssembly.
            It is never transmitted to any server or third party.
          </p>
        </div>

        <h3 className="text-xl font-display font-bold text-kobo-dark mb-3 mt-6">2. Browser Local Storage</h3>
        <p className="text-kobo-gray mb-4">
          The app stores the following in your browser's local storage:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 mb-4 space-y-1">
          <li>Backup history (dates, file sizes, statistics)</li>
          <li>Application preferences and settings</li>
          <li>Analytics banner dismissal flag</li>
        </ul>
        <p className="text-kobo-gray mb-4">
          This data stays on your device and can be deleted by clearing browser data.
        </p>

        <h3 className="text-xl font-display font-bold text-kobo-dark mb-3 mt-6">3. Vercel Analytics (Anonymous Page Views)</h3>
        <p className="text-kobo-gray mb-4">
          The site uses <strong>Vercel Analytics</strong> to collect anonymous, aggregated page-view
          statistics. Vercel Analytics is designed with privacy as a core feature:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 mb-4 space-y-1">
          <li><strong>No cookies</strong> — does not set any cookies</li>
          <li><strong>No fingerprinting</strong> — does not track individual users across sessions</li>
          <li><strong>No personal data</strong> — IP addresses are not stored; only aggregated counts are kept</li>
          <li>Data collected: page URL, referrer, approximate country, browser/OS family, screen size</li>
        </ul>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="font-medium text-blue-800">
            Vercel Analytics does not access, collect, or transmit your Kobo library data, backup
            files, or any personal reading information. It only counts page visits at an aggregate level.
          </p>
        </div>
      </section>

      {/* How We Use Your Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">How We Use Your Information</h2>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Service Operation:</strong> To provide backup and restore functionality (local only)</li>
          <li><strong>Service Improvement:</strong> To understand which features are used most (via aggregate analytics)</li>
          <li><strong>Browser Compatibility:</strong> To ensure the app works across different browsers</li>
        </ul>
      </section>

      {/* Legal Basis for Processing (GDPR) */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Legal Basis for Processing (GDPR)</h2>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li>
            <strong>Legitimate Interests (Art. 6(1)(f)):</strong> Vercel Analytics provides only
            aggregate, cookieless statistics that cannot identify individuals. This minimal processing
            serves our legitimate interest in understanding how the app is used, and does not override
            your privacy rights.
          </li>
          <li>
            <strong>Contract Performance:</strong> Local data processing is necessary to provide the
            backup service you request.
          </li>
        </ul>
        <p className="text-kobo-gray mt-4">
          Because Vercel Analytics is cookieless and processes no personal data, it does not require
          a prior consent banner under the ePrivacy Directive.
        </p>
      </section>

      {/* Data Sharing and Third Parties */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Data Sharing and Third Parties</h2>
        <p className="text-kobo-gray mb-4">
          The only third-party service this site sends data to is:
        </p>

        <div className="bg-white p-4 rounded-lg border border-kobo-gray-light">
          <h3 className="font-display font-bold text-kobo-dark mb-2">Vercel Analytics</h3>
          <p className="text-kobo-gray text-sm mb-1">
            <strong>Purpose:</strong> Anonymous, aggregate page-view statistics
          </p>
          <p className="text-kobo-gray text-sm mb-1">
            <strong>Data collected:</strong> Page URL, referrer, approximate country, browser family,
            screen size — no personal identifiers, no cookies
          </p>
          <p className="text-kobo-gray text-sm mb-1">
            <strong>Data processor:</strong> Vercel Inc. (San Francisco, CA, USA) — EU Standard
            Contractual Clauses apply for transfers outside the EEA
          </p>
          <p className="text-kobo-gray text-sm">
            <strong>Privacy Policy:</strong>{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kobo-accent hover:underline"
            >
              vercel.com/legal/privacy-policy
            </a>
          </p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
          <p className="font-medium text-green-800">
            Your Kobo library data, backup files, and reading information are NEVER shared with any
            third party. They are processed only within your browser and never leave your device.
          </p>
        </div>
      </section>

      {/* Data Retention */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Data Retention</h2>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Local Storage:</strong> Retained until you clear browser data</li>
          <li><strong>Vercel Analytics:</strong> Aggregated data retained for up to 1 year per Vercel's policy; no personal data is stored</li>
          <li><strong>Library Data:</strong> Never retained on any server — processed locally only</li>
        </ul>
      </section>

      {/* Your Rights (GDPR) */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Your Rights Under GDPR</h2>
        <p className="text-kobo-gray mb-4">
          If you are in the European Economic Area (EEA), you have the following rights:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Right to Access:</strong> All data is stored locally in your browser — you have full access</li>
          <li><strong>Right to Erasure:</strong> Clear your browser's local storage to delete all app data</li>
          <li><strong>Right to Data Portability:</strong> Your backup files are portable ZIP files under your full control</li>
          <li><strong>Right to Object:</strong> You can block Vercel Analytics by using a browser extension that blocks network requests to <code className="text-sm bg-kobo-cream px-1 rounded">va.vercel-scripts.com</code></li>
          <li><strong>Right to Lodge a Complaint:</strong> Contact your local data protection supervisory authority</li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
          <p className="font-medium text-blue-800 mb-2">
            ✓ Managing Your Data (No Contact Needed):
          </p>
          <ul className="list-disc list-inside text-blue-800 ml-4 space-y-1 text-sm">
            <li><strong>Local Storage:</strong> Clear via browser settings (e.g., Chrome → Settings → Privacy → Clear browsing data)</li>
            <li><strong>Analytics:</strong> Block via an ad/tracker blocker, or use browser developer tools to block <code>va.vercel-scripts.com</code></li>
            <li><strong>Backups:</strong> You control the ZIP files — delete from your computer as needed</li>
          </ul>
        </div>

        <p className="text-kobo-gray mt-4">
          Since this is a non-commercial open-source project with no central data controller, there
          is no email or support entity to contact for data requests. For questions about the app,
          please open a GitHub Issue.
        </p>
      </section>

      {/* International Data Transfers */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">International Data Transfers</h2>
        <p className="text-kobo-gray mb-4">
          Vercel Analytics data may be transferred to and processed in the United States. Vercel Inc.
          relies on Standard Contractual Clauses (SCCs) approved by the European Commission for
          transfers of personal data from the EEA.
        </p>
        <p className="text-kobo-gray">
          Because Vercel Analytics collects no personal data (no IP addresses stored, no cookies),
          the practical privacy risk of these transfers is negligible.
        </p>
      </section>

      {/* Cookies */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Cookies</h2>
        <p className="text-kobo-gray mb-4">
          This website <strong>does not use any cookies</strong> for tracking or analytics.
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>No tracking cookies</strong> — Vercel Analytics is entirely cookieless</li>
          <li><strong>No third-party cookies</strong> — no advertising or retargeting networks</li>
          <li><strong>Local Storage only</strong> — app preferences (backup history, settings, banner dismissal) are stored in browser local storage, which is not a cookie and is not shared with any third party</li>
        </ul>
      </section>

      {/* Children's Privacy */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Children's Privacy</h2>
        <p className="text-kobo-gray">
          This Service is not directed to individuals under the age of 16. We do not knowingly collect
          personal information from children.
        </p>
      </section>

      {/* Open Source */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Open Source & Transparency</h2>
        <p className="text-kobo-gray mb-4">
          The complete source code is available on GitHub. This transparency allows you to:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1 mb-4">
          <li>Audit the code to verify every privacy claim in this policy</li>
          <li>Self-host your own version — without any analytics at all</li>
          <li>Contribute improvements or report issues</li>
        </ul>
        <div className="bg-kobo-cream p-4 rounded-lg">
          <p className="text-kobo-gray mb-2">
            <strong>GitHub Repository:</strong>{' '}
            <a
              href="https://github.com/Fanfulla/KoboOfflineBackup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kobo-accent hover:underline"
            >
              github.com/Fanfulla/KoboOfflineBackup
            </a>
          </p>
          <p className="text-kobo-gray text-sm">
            All questions, bug reports, and feature requests should be submitted via GitHub Issues.
          </p>
        </div>
      </section>

      {/* Changes to This Policy */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Changes to This Privacy Policy</h2>
        <p className="text-kobo-gray">
          We may update this Privacy Policy to reflect changes in our practices or legal requirements.
          The "Last Updated" date at the top indicates when the policy was last revised. Continued use
          of the Service after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      {/* Questions */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Questions</h2>
        <div className="bg-kobo-cream p-4 rounded-lg mb-4">
          <p className="text-kobo-gray mb-2">
            <strong>GitHub Issues:</strong>{' '}
            <a
              href="https://github.com/Fanfulla/KoboOfflineBackup/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kobo-accent hover:underline"
            >
              github.com/Fanfulla/KoboOfflineBackup/issues
            </a>
          </p>
          <p className="text-kobo-gray text-sm">
            Open an issue for questions, bug reports, or privacy concerns.
          </p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="font-medium text-yellow-800">
            Note: This is a personal open-source project with no commercial entity or formal data
            controller. There is no support email or helpdesk. Community support is provided via GitHub.
          </p>
        </div>
      </section>

      <div className="text-center mt-12">
        <Button onClick={() => onNavigate('home')}>
          Return to Home
        </Button>
      </div>
    </div>
  );
}

PrivacyPolicy.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
