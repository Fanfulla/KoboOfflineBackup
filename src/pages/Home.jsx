/**
 * Home page - Landing with value proposition
 */

import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Container } from '../components/layout/Container.jsx';
import { Icon } from '../components/common/Icon.jsx';

export function Home({ onNavigate }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-kobo-cream to-white py-16 sm:py-24">
        <Container>
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-display font-bold text-kobo-dark mb-6">
              Never Lose Your
              <br />
              <span className="text-kobo-accent">Kobo Library</span> Again
            </h1>

            <p className="text-xl sm:text-2xl text-kobo-gray max-w-3xl mx-auto mb-8">
              Free, secure backup for all your ebooks, annotations, and reading
              progress. Works 100% in your browser.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                variant="primary"
                onClick={() => onNavigate('backup')}
                className="w-full sm:w-auto"
              >
                <Icon type="download" size={20} />
                Create Backup
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate('restore')}
                className="w-full sm:w-auto"
              >
                <Icon type="upload" size={20} />
                Restore Backup
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-kobo-gray">
              <div className="flex items-center gap-2">
                <Icon type="check" size={16} className="text-kobo-success" />
                <span>No Installation</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon type="check" size={16} className="text-kobo-success" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon type="check" size={16} className="text-kobo-success" />
                <span>Open Source</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <Container>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-kobo-dark text-center mb-12">
            Why Use Kobo Backup Manager?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card gradient className="text-center">
              <div className="w-16 h-16 bg-kobo-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon type="device" size={32} className="text-kobo-accent" />
              </div>
              <h3 className="text-xl font-display font-bold text-kobo-dark mb-3">
                Complete Protection
              </h3>
              <p className="text-kobo-gray">
                Backup all your sideloaded books, annotations, highlights, and
                reading progress in one secure archive.
              </p>
            </Card>

            <Card gradient className="text-center">
              <div className="w-16 h-16 bg-kobo-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon type="check" size={32} className="text-kobo-success" />
              </div>
              <h3 className="text-xl font-display font-bold text-kobo-dark mb-3">
                Privacy First
              </h3>
              <p className="text-kobo-gray">
                All processing happens in your browser. Your data never leaves your
                device - no servers, no tracking, no accounts.
              </p>
            </Card>

            <Card gradient className="text-center">
              <div className="w-16 h-16 bg-kobo-info/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon type="restore" size={32} className="text-kobo-info" />
              </div>
              <h3 className="text-xl font-display font-bold text-kobo-dark mb-3">
                Easy Restore
              </h3>
              <p className="text-kobo-gray">
                Moving to a new Kobo? Restore your entire library with just a few
                clicks. Pick up right where you left off.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-kobo-cream-dark/30">
        <Container>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-kobo-dark text-center mb-12">
            How It Works
          </h2>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-kobo-accent text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-kobo-dark mb-2">
                  Connect Your Kobo
                </h3>
                <p className="text-kobo-gray">
                  Plug your Kobo into your computer via USB and unlock it. The device
                  will appear as a drive.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-kobo-accent text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-kobo-dark mb-2">
                  Select Your Device
                </h3>
                <p className="text-kobo-gray">
                  Click the button to select your Kobo drive. The app will
                  automatically find your books and reading data.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-kobo-accent text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-kobo-dark mb-2">
                  Create Backup
                </h3>
                <p className="text-kobo-gray">
                  Everything is packaged into a single ZIP file and saved to your
                  Downloads folder. That's it!
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="primary"
              onClick={() => onNavigate('backup')}
            >
              Get Started Now
            </Button>
          </div>
        </Container>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16">
        <Container size="sm">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-kobo-dark text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <Card>
              <h3 className="font-display font-bold text-kobo-dark mb-2">
                Is my data safe?
              </h3>
              <p className="text-kobo-gray">
                Absolutely! All processing happens locally in your browser. Your
                books and data never leave your computer. We don't have any servers
                to send data to.
              </p>
            </Card>

            <Card>
              <h3 className="font-display font-bold text-kobo-dark mb-2">
                Does this work with Kobo store books?
              </h3>
              <p className="text-kobo-gray">
                This tool is designed for sideloaded books (books you added yourself).
                Kobo store books are already backed up in your Kobo account.
              </p>
            </Card>

            <Card>
              <h3 className="font-display font-bold text-kobo-dark mb-2">
                Which browsers are supported?
              </h3>
              <p className="text-kobo-gray">
                For the best experience, use Chrome 86+, Edge 86+, or Opera 72+. Other
                browsers may work with limited functionality.
              </p>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
