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

      <h1 className="text-4xl font-display font-bold text-kobo-dark mb-4">Privacy Policy</h1>
      <p className="text-kobo-gray mb-8">
        <strong>Last Updated:</strong> January 11, 2026
      </p>

      {/* Introduction */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Introduction</h2>
        <p className="text-kobo-gray mb-4">
          Kobo Backup Manager is a <strong>free, non-commercial, open-source</strong> web application
          created by the community to help Kobo e-reader users backup their libraries. This Privacy Policy
          explains how data is processed when you use this tool.
        </p>
        <p className="text-kobo-gray mb-4">
          <strong>Key principles:</strong>
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1 mb-4">
          <li>No commercial purpose - this is a free community tool</li>
          <li>No account required - no registration or login</li>
          <li>Privacy-first architecture - all backup operations happen in your browser</li>
          <li>Your Kobo library data never leaves your device</li>
          <li>Open source - full code available on GitHub for security audit</li>
        </ul>
      </section>

      {/* About This Project */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">About This Open Source Project</h2>
        <p className="text-kobo-gray mb-4">
          This project has <strong>no commercial entity</strong> behind it. It is maintained by volunteers
          and provided free of charge to the community. The complete source code is available on GitHub,
          where you can:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1 mb-4">
          <li>Review the code to verify privacy claims</li>
          <li>Report issues or suggest improvements</li>
          <li>Contribute to the project</li>
          <li>Fork and modify for your own use</li>
        </ul>
        <p className="text-kobo-gray mb-4">
          <strong>GDPR Compliance:</strong> While this is a non-commercial project, we still comply with
          the General Data Protection Regulation (GDPR) to protect EU residents' privacy rights. The use
          of limited analytics (described below) is for service improvement only, never for commercial gain.
        </p>
      </section>

      {/* Information We Collect */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Information We Collect</h2>

        <h3 className="text-xl font-display font-bold text-kobo-dark mb-3 mt-6">1. Library Data (Processed Locally Only)</h3>
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

        <h3 className="text-xl font-display font-bold text-kobo-dark mb-3 mt-6">2. Browser Storage (Local Storage)</h3>
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

        <h3 className="text-xl font-display font-bold text-kobo-dark mb-3 mt-6">3. Analytics Data</h3>
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
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">How We Use Your Information</h2>
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
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Legal Basis for Processing (GDPR)</h2>
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
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Data Sharing and Third Parties</h2>
        <p className="text-kobo-gray mb-4">
          We share analytics data with the following third-party processors:
        </p>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-kobo-gray-light">
            <h3 className="font-display font-bold text-kobo-dark mb-2">Google Analytics 4</h3>
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
            <h3 className="font-display font-bold text-kobo-dark mb-2">ContentSquare</h3>
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
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Data Retention</h2>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Local Storage:</strong> Retained until you clear browser data or uninstall the app</li>
          <li><strong>Analytics Data:</strong> Google Analytics retains data for 14 months, ContentSquare for 13 months</li>
          <li><strong>Library Data:</strong> Never retained on our servers (processed locally only)</li>
        </ul>
      </section>

      {/* Your Rights (GDPR) */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Your Rights Under GDPR</h2>
        <p className="text-kobo-gray mb-4">
          If you are located in the European Economic Area (EEA), you have the following rights:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-2">
          <li><strong>Right to Access:</strong> All data is stored locally in your browser - you have full access</li>
          <li><strong>Right to Erasure:</strong> Clear your browser's local storage to delete all app data ("right to be forgotten")</li>
          <li><strong>Right to Data Portability:</strong> Your backup files are already portable ZIP files under your control</li>
          <li><strong>Right to Object:</strong> Opt out of analytics via browser cookie settings</li>
          <li><strong>Right to Withdraw Consent:</strong> Disable analytics cookies at any time through browser settings</li>
          <li><strong>Right to Lodge a Complaint:</strong> Contact your local data protection supervisory authority</li>
        </ul>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
          <p className="font-medium text-blue-800 mb-2">
            ✓ Managing Your Data (No Contact Needed):
          </p>
          <ul className="list-disc list-inside text-blue-800 ml-4 space-y-1 text-sm">
            <li><strong>Local Storage:</strong> Clear via browser settings (e.g., Chrome → Settings → Privacy → Clear browsing data)</li>
            <li><strong>Analytics:</strong> Block via browser settings or use Do Not Track headers</li>
            <li><strong>Backups:</strong> You control the files - delete from your computer as needed</li>
          </ul>
        </div>

        <p className="text-kobo-gray mt-4">
          Since this is a non-commercial open-source project with no central data controller, there is
          no email or entity to contact for data requests. All personal data is either stored locally on
          your device (under your control) or anonymized analytics sent to third parties (Google, ContentSquare).
        </p>

        <p className="text-kobo-gray mt-4">
          <strong>For analytics data requests:</strong> Contact Google or ContentSquare directly through
          their privacy portals. For questions about the app itself, use the GitHub repository to open an issue.
        </p>
      </section>

      {/* International Data Transfers */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">International Data Transfers</h2>
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
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Cookies and Tracking Technologies</h2>
        <p className="text-kobo-gray mb-4">We use the following types of cookies:</p>

        <div className="space-y-4">
          <div>
            <h3 className="font-display font-bold text-kobo-dark mb-2">Essential Cookies (No Consent Required)</h3>
            <p className="text-kobo-gray text-sm">
              Strictly necessary for the application to function. These store your preferences and backup
              history locally.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-kobo-dark mb-2">Analytics Cookies (Consent Required)</h3>
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
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Children's Privacy</h2>
        <p className="text-kobo-gray">
          Our Service is not directed to individuals under the age of 16. We do not knowingly collect
          personal information from children. If you believe a child has provided us with personal information,
          please contact us immediately.
        </p>
      </section>

      {/* Open Source & Community */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Open Source & Community</h2>
        <p className="text-kobo-gray mb-4">
          The complete source code is available on GitHub under an open-source license. This transparency
          allows you to:
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1 mb-4">
          <li>Audit the code to verify privacy and security claims</li>
          <li>Understand exactly what data is collected and how it's used</li>
          <li>Self-host your own version without analytics</li>
          <li>Contribute improvements or report issues</li>
        </ul>
        <div className="bg-kobo-cream p-4 rounded-lg">
          <p className="text-kobo-gray mb-2">
            <strong>GitHub Repository:</strong> <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-kobo-accent hover:underline">github.com/[your-repo-name]</a>
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
          We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.
          The "Last Updated" date at the top of this page indicates when the policy was last revised. Continued
          use of the Service after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      {/* Contact & Support */}
      <section className="mb-12">
        <h2 className="text-2xl font-display font-bold text-kobo-dark mb-4">Questions & Support</h2>

        <p className="text-kobo-gray mb-4">
          <strong>For questions about this Privacy Policy or the application:</strong>
        </p>
        <div className="bg-kobo-cream p-4 rounded-lg mb-4">
          <p className="text-kobo-gray mb-2">
            <strong>GitHub Issues:</strong> <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-kobo-accent hover:underline">github.com/[your-repo]/issues</a>
          </p>
          <p className="text-kobo-gray text-sm">
            Open an issue on GitHub for questions, bug reports, or privacy concerns.
          </p>
        </div>

        <p className="text-kobo-gray mb-4">
          <strong>For GDPR data requests related to analytics:</strong>
        </p>
        <ul className="list-disc list-inside text-kobo-gray ml-4 space-y-1 mb-4">
          <li>Google Analytics: <a href="https://support.google.com/analytics/answer/6004245" target="_blank" rel="noopener noreferrer" className="text-kobo-accent hover:underline">Google Privacy Controls</a></li>
          <li>ContentSquare: <a href="https://contentsquare.com/privacy-center/" target="_blank" rel="noopener noreferrer" className="text-kobo-accent hover:underline">ContentSquare Privacy Center</a></li>
        </ul>

        <p className="text-kobo-gray">
          <strong>For GDPR complaints:</strong> Contact your local EU data protection supervisory authority.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
          <p className="font-medium text-yellow-800">
            ℹ️ Note: This is a volunteer-maintained open-source project with no commercial entity or formal
            data controller. There is no customer support email or helpdesk. Community support is provided
            via GitHub.
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
