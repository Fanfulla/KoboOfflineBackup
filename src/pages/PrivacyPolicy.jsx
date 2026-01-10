/**
 * Privacy Policy page - GDPR compliant (January 2026)
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

      <h1 className="text-4xl font-bold text-kobo-dark mb-4">Privacy Policy</h1>
      <p className="text-kobo-gray mb-8">
        <strong>Last Updated:</strong> January 11, 2026
      </p>

      {/* Introduction */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Introduction</h2>
        <p className="text-kobo-gray mb-4">
          Kobo Backup Manager ("we," "our," or "the Service") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information when you use
          our web application.
        </p>
        <p className="text-kobo-gray">
          This Service is designed with privacy as a core principle. All backup and restore operations
          occur entirely within your browser, and your Kobo library data never leaves your device.
        </p>
      </section>

      {/* Data Controller */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Data Controller</h2>
        <p className="text-kobo-gray mb-4">
          For the purposes of the General Data Protection Regulation (GDPR) and other applicable data
          protection laws, the data controller is:
        </p>
        <div className="bg-kobo-cream p-4 rounded-lg">
          <p className="text-kobo-gray">
            Kobo Backup Manager<br />
            Website: [Your Website URL]<br />
            Email: [Your Contact Email]
          </p>
        </div>
      </section>

      {/* Information We Collect */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Information We Collect</h2>

        <h3 className="text-xl font-bold text-kobo-dark mb-3 mt-6">1. Library Data (Processed Locally Only)</h3>
        <p className="text-kobo-gray mb-4">
          When you use the Service to create or restore backups, we process:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 mb-4 space-y-1">
          <li>Kobo database contents (books, highlights, bookmarks, reading progress)</li>
          <li>Book files and metadata</li>
          <li>Collections and shelf information</li>
        </ul>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="font-medium text-green-800">
            ✓ This data is processed entirely within your browser using JavaScript and WebAssembly.
            It is never transmitted to our servers or any third party.
          </p>
        </div>

        <h3 className="text-xl font-bold text-kobo-dark mb-3 mt-6">2. Browser Storage (Local Storage)</h3>
        <p className="text-kobo-gray mb-4">
          We store the following information in your browser's local storage:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 mb-4 space-y-1">
          <li>Backup history (dates, file sizes, statistics)</li>
          <li>Application preferences and settings</li>
          <li>Feature compatibility information</li>
        </ul>
        <p className="text-kobo-gray mb-4">
          This data remains on your device and can be deleted at any time by clearing your browser data.
        </p>

        <h3 className="text-xl font-bold text-kobo-dark mb-3 mt-6">3. Analytics Data</h3>
        <p className="text-kobo-gray mb-4">
          We use Google Analytics 4 (GA4) and ContentSquare to collect anonymous usage statistics:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 mb-4 space-y-1">
          <li>Pages visited and features used</li>
          <li>Browser type, version, and operating system</li>
          <li>Device type (desktop, tablet, mobile)</li>
          <li>Approximate location (country/region level)</li>
          <li>Session duration and interaction patterns</li>
          <li>Error messages and technical issues</li>
        </ul>
        <p className="text-kobo-gray mb-4">
          <strong>Important:</strong> Analytics tools do not access, collect, or transmit your Kobo library
          data, backup files, or any personal reading information. They only track how you interact with
          the application interface.
        </p>
      </section>

      {/* How We Use Your Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">How We Use Your Information</h2>
        <p className="text-kobo-gray mb-4">We use collected information for the following purposes:</p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Service Operation:</strong> To provide backup and restore functionality</li>
          <li><strong>Service Improvement:</strong> To understand usage patterns and improve features</li>
          <li><strong>Bug Detection:</strong> To identify and fix technical issues</li>
          <li><strong>Browser Compatibility:</strong> To ensure the app works across different browsers</li>
          <li><strong>User Experience:</strong> To optimize interface design and usability</li>
        </ul>
      </section>

      {/* Legal Basis for Processing (GDPR) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Legal Basis for Processing (GDPR)</h2>
        <p className="text-kobo-gray mb-4">
          Under GDPR, we process your data based on the following legal grounds:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Consent:</strong> Analytics tracking requires your consent via cookie banner</li>
          <li><strong>Legitimate Interests:</strong> Service improvement and bug detection serve our legitimate
            interest in providing a reliable, high-quality application</li>
          <li><strong>Contract Performance:</strong> Local data processing is necessary to provide the backup
            service you request</li>
        </ul>
      </section>

      {/* Data Sharing and Third Parties */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Data Sharing and Third Parties</h2>
        <p className="text-kobo-gray mb-4">
          We share analytics data with the following third-party processors:
        </p>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-kobo-gray-light">
            <h3 className="font-bold text-kobo-dark mb-2">Google Analytics 4</h3>
            <p className="text-kobo-gray text-sm mb-2">
              Purpose: Website analytics and usage statistics
            </p>
            <p className="text-kobo-gray text-sm mb-2">
              Data Collected: Anonymous usage patterns, browser info, approximate location
            </p>
            <p className="text-kobo-gray text-sm">
              Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-kobo-accent hover:underline">https://policies.google.com/privacy</a>
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-kobo-gray-light">
            <h3 className="font-bold text-kobo-dark mb-2">ContentSquare</h3>
            <p className="text-kobo-gray text-sm mb-2">
              Purpose: User experience analysis and interaction tracking
            </p>
            <p className="text-kobo-gray text-sm mb-2">
              Data Collected: Mouse movements, clicks, scrolling behavior, session recordings (anonymized)
            </p>
            <p className="text-kobo-gray text-sm">
              Privacy Policy: <a href="https://contentsquare.com/privacy-center/" target="_blank" rel="noopener noreferrer" className="text-kobo-accent hover:underline">https://contentsquare.com/privacy-center/</a>
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
          <p className="font-medium text-blue-800">
            Important: Your Kobo library data, backup files, and reading information are NEVER shared
            with any third party. They are processed only within your browser.
          </p>
        </div>
      </section>

      {/* Data Retention */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Data Retention</h2>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Local Storage:</strong> Retained until you clear browser data or uninstall the app</li>
          <li><strong>Analytics Data:</strong> Google Analytics retains data for 14 months, ContentSquare for 13 months</li>
          <li><strong>Library Data:</strong> Never retained on our servers (processed locally only)</li>
        </ul>
      </section>

      {/* Your Rights (GDPR) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Your Rights Under GDPR</h2>
        <p className="text-kobo-gray mb-4">
          If you are located in the European Economic Area (EEA), you have the following rights:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Right to Access:</strong> Request access to your personal data</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
          <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
          <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
          <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Right to Withdraw Consent:</strong> Withdraw analytics consent at any time</li>
          <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your supervisory authority</li>
        </ul>
        <p className="text-kobo-gray mt-4">
          To exercise these rights, contact us at [Your Contact Email] or use your browser's privacy
          settings to manage cookies and clear local storage.
        </p>
      </section>

      {/* International Data Transfers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">International Data Transfers</h2>
        <p className="text-kobo-gray mb-4">
          Analytics data may be transferred to and processed in countries outside the EEA, including the
          United States. These transfers are protected by:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li>Google Analytics: EU-U.S. Data Privacy Framework certification</li>
          <li>ContentSquare: Standard Contractual Clauses (SCCs) approved by the European Commission</li>
        </ul>
      </section>

      {/* Cookies and Tracking Technologies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Cookies and Tracking Technologies</h2>
        <p className="text-kobo-gray mb-4">We use the following types of cookies:</p>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-kobo-dark mb-2">Essential Cookies (No Consent Required)</h3>
            <p className="text-kobo-gray text-sm">
              Strictly necessary for the application to function. These store your preferences and backup
              history locally.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-kobo-dark mb-2">Analytics Cookies (Consent Required)</h3>
            <p className="text-kobo-gray text-sm">
              Google Analytics and ContentSquare cookies track usage patterns to help us improve the service.
              You can opt-out via cookie settings.
            </p>
          </div>
        </div>

        <p className="text-kobo-gray mt-4">
          Manage your cookie preferences using the cookie banner when you first visit the site, or adjust
          them in your browser settings.
        </p>
      </section>

      {/* Children's Privacy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Children's Privacy</h2>
        <p className="text-kobo-gray">
          Our Service is not directed to individuals under the age of 16. We do not knowingly collect
          personal information from children. If you believe a child has provided us with personal information,
          please contact us immediately.
        </p>
      </section>

      {/* Open Source Commitment */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Open Source Commitment</h2>
        <p className="text-kobo-gray mb-4">
          The complete source code of Kobo Backup Manager is available on GitHub under an open-source license.
          You can review, audit, and verify exactly what the application does:
        </p>
        <div className="bg-kobo-cream p-4 rounded-lg">
          <p className="text-kobo-gray">
            GitHub Repository: <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-kobo-accent hover:underline">github.com/[your-repo]</a>
          </p>
        </div>
      </section>

      {/* Changes to This Policy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Changes to This Privacy Policy</h2>
        <p className="text-kobo-gray">
          We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
          The "Last Updated" date at the top of this page indicates when the policy was last revised. Continued
          use of the Service after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      {/* Contact Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">Contact Us</h2>
        <p className="text-kobo-gray mb-4">
          If you have questions about this Privacy Policy or wish to exercise your GDPR rights, please contact us:
        </p>
        <div className="bg-kobo-cream p-4 rounded-lg">
          <p className="text-kobo-gray">
            Email: [Your Contact Email]<br />
            Website: [Your Website URL]<br />
            GitHub Issues: [Your GitHub Issues URL]
          </p>
        </div>
        <p className="text-kobo-gray mt-4">
          For GDPR-related complaints, you may also contact your local data protection supervisory authority.
        </p>
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
