/**
 * FAQ page - SEO optimized with structured data for search engines
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../components/common/Button.jsx';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'What is Kobo Backup Manager?',
        answer: 'Kobo Backup Manager is a free, open-source web application that allows you to backup and restore your Kobo e-reader library entirely within your browser. It processes all data locally without sending anything to external servers, ensuring complete privacy.'
      },
      {
        question: 'Which browsers are supported?',
        answer: 'Kobo Backup Manager requires Chrome 86 or later, Microsoft Edge 86 or later, or any Chromium-based browser that supports the File System Access API. Unfortunately, Safari and Firefox do not currently support the required APIs.'
      },
      {
        question: 'Do I need to create an account?',
        answer: 'No account is required. Kobo Backup Manager works entirely in your browser without any registration, login, or personal information collection.'
      },
      {
        question: 'Is Kobo Backup Manager free?',
        answer: 'Yes, Kobo Backup Manager is completely free and open source. The source code is available on GitHub for anyone to review, use, or contribute to.'
      }
    ]
  },
  {
    category: 'Backup & Restore',
    questions: [
      {
        question: 'What data does a backup include?',
        answer: 'A backup includes your Kobo library database (books, reading progress, highlights, annotations, bookmarks, collections, shelves) and optionally the book files themselves. You can choose which data to include when creating a backup.'
      },
      {
        question: 'How long does it take to create a backup?',
        answer: 'Backup time depends on your library size. Small libraries (under 100 books) typically take 30-60 seconds, while larger libraries (500+ books) may take 3-5 minutes. All processing happens in your browser, so performance varies based on your device.'
      },
      {
        question: 'Where are my backups stored?',
        answer: 'Backups are saved as ZIP files to a location of your choice on your computer. You have complete control over where backups are stored, and they can be moved or copied like any other file.'
      },
      {
        question: 'Can I restore a backup to a different Kobo device?',
        answer: 'Yes, you can restore backups to any Kobo e-reader. This is useful when upgrading to a new device or recovering from a device reset. Note that some device-specific settings may not transfer.'
      },
      {
        question: 'Will restoring delete my current library?',
        answer: 'Restoring a backup will replace the database on your Kobo device, which effectively replaces your current library with the backed-up version. Always create a backup of your current library before restoring an older one.'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        question: 'Is my data sent to any servers?',
        answer: 'No. All processing happens entirely within your browser using JavaScript and WebAssembly. No data is uploaded to any server or cloud service. Your library data never leaves your device.'
      },
      {
        question: 'Does Kobo Backup Manager use analytics?',
        answer: 'Yes, we use Google Analytics 4 (GA4) and ContentSquare to understand how users interact with the app and improve the service. These tools collect anonymous usage statistics but do not access your Kobo library data or backup files. See our Privacy Policy for full details.'
      },
      {
        question: 'Can I verify the code is safe?',
        answer: 'Yes! Kobo Backup Manager is fully open source. You can review the complete source code on GitHub to verify what it does and ensure it meets your security standards.'
      },
      {
        question: 'Is this affiliated with Rakuten Kobo?',
        answer: 'No, Kobo Backup Manager is an independent, community-created tool and is not affiliated with, endorsed by, or supported by Rakuten Kobo Inc.'
      }
    ]
  },
  {
    category: 'Technical Questions',
    questions: [
      {
        question: 'Why can\'t I use Firefox or Safari?',
        answer: 'Kobo Backup Manager requires the File System Access API to directly read from and write to your Kobo device. This API is currently only available in Chromium-based browsers (Chrome, Edge, Opera, Brave). Firefox and Safari have not yet implemented this standard.'
      },
      {
        question: 'What is the File System Access API?',
        answer: 'The File System Access API is a modern web standard that allows web applications to read and write files with user permission. It enables Kobo Backup Manager to access your Kobo device without requiring browser extensions or native applications.'
      },
      {
        question: 'Does this work offline?',
        answer: 'After the initial load, Kobo Backup Manager can work offline. The app is cached in your browser, so you can create and restore backups without an internet connection once you\'ve visited the site.'
      },
      {
        question: 'Can I use this on mobile devices?',
        answer: 'Currently, mobile browsers do not support the File System Access API needed to read from Kobo devices. Kobo Backup Manager is designed for desktop use with Chrome, Edge, or other Chromium-based browsers.'
      }
    ]
  },
  {
    category: 'Troubleshooting',
    questions: [
      {
        question: 'I can\'t find the KoboReader.sqlite file',
        answer: 'The KoboReader.sqlite file is located in the .kobo folder inside your Kobo device. Make sure your Kobo is connected via USB and recognized as a storage device. On Windows, look for the .kobo folder in your Kobo\'s root directory. Note that folders starting with a dot may be hidden by default.'
      },
      {
        question: 'The backup process failed or got stuck',
        answer: 'Try disconnecting and reconnecting your Kobo device, then close and reopen your browser. If the issue persists, your Kobo database may be corrupted - try connecting your Kobo to Kobo Desktop software first to let it repair the database.'
      },
      {
        question: 'My device isn\'t recognized',
        answer: 'Ensure your Kobo is connected via USB and is in USB storage mode (not charging only). Some USB cables are charge-only and won\'t work - use a data-capable USB cable. Also verify your browser has permission to access files.'
      },
      {
        question: 'The app shows "Browser not supported"',
        answer: 'This means you\'re using a browser that doesn\'t support the File System Access API. Please switch to Chrome 86+, Edge 86+, or another Chromium-based browser. Update your browser to the latest version if the message persists.'
      }
    ]
  }
];

export function FAQ({ onNavigate }) {
  const [openIndex, setOpenIndex] = useState(null);

  // Add structured data for SEO
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.flatMap(category =>
        category.questions.map(q => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer
          }
        }))
      )
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button
        variant="ghost"
        onClick={() => onNavigate('home')}
        className="mb-8"
      >
        ← Back to Home
      </Button>

      <header className="mb-12">
        <h1 className="text-4xl font-bold text-kobo-dark mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-kobo-gray">
          Everything you need to know about backing up and restoring your Kobo e-reader library.
        </p>
      </header>

      {faqs.map((category, categoryIndex) => (
        <section key={categoryIndex} className="mb-12">
          <h2 className="text-2xl font-bold text-kobo-dark mb-6 border-b-2 border-kobo-accent pb-2">
            {category.category}
          </h2>
          <div className="space-y-4">
            {category.questions.map((faq, questionIndex) => {
              const isOpen = openIndex === `${categoryIndex}-${questionIndex}`;
              return (
                <div
                  key={questionIndex}
                  className="bg-white rounded-xl shadow-sm border border-kobo-gray-light overflow-hidden"
                >
                  <button
                    onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-kobo-cream/50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-lg font-bold text-kobo-dark pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className={`w-6 h-6 text-kobo-accent flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4">
                      <p className="text-kobo-gray leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section className="mt-16 bg-kobo-accent/10 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-kobo-dark mb-4">
          Still have questions?
        </h2>
        <p className="text-kobo-gray mb-6">
          Check out our comprehensive User Guide for detailed instructions, or visit our GitHub repository
          to report issues and contribute.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => onNavigate('guide')}>
            Read User Guide
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open('https://github.com', '_blank')}
          >
            Visit GitHub
          </Button>
        </div>
      </section>
    </div>
  );
}

FAQ.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
