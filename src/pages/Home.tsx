import { Link } from '../router/Router.tsx';
import { useI18n } from '../i18n/core.ts';
import { Container } from '../components/layout/Container.tsx';
import { Card } from '../components/common/Card.tsx';
import { Icon, type IconType } from '../components/common/Icon.tsx';
import { useKoboStore } from '../stores/koboStore.ts';

const FEATURE_ICONS: IconType[] = ['backup', 'shield', 'lock', 'restore', 'book', 'check'];

const cta =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold transition-all-smooth focus-visible-ring sm:w-auto';

export function Home() {
  const { m, fmt, plural } = useI18n();
  const scan = useKoboStore((s) => s.scan);
  const faqTeaser = m.faq.categories.flatMap((c) => c.items).slice(0, 4);

  return (
    <>
      {scan && (
        <div className="border-b border-kobo-accent/30 bg-kobo-accent/10 py-3 text-center text-sm text-kobo-dark">
          <Container>
            {fmt(m.connect.connected, { model: scan.deviceInfo.model })} ·{' '}
            {plural(m.common.books, scan.books.length)} ·{' '}
            <Link to="library" className="font-semibold text-kobo-accent-ink underline">
              {m.home.ctaLibrary}
            </Link>
          </Container>
        </div>
      )}

      <section className="bg-linear-to-b from-kobo-cream to-white py-16 sm:py-24">
        <Container className="text-center">
          <h1 className="mb-6 text-4xl text-kobo-dark sm:text-5xl lg:text-6xl">
            {m.home.heroTitle}
            <br />
            <span className="text-kobo-accent-ink">{m.home.heroHighlight}</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-kobo-gray sm:text-2xl">{m.home.heroBody}</p>
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="backup" className={`${cta} bg-kobo-accent text-kobo-dark hover:bg-kobo-accent-dark`}>
              <Icon type="download" />
              {m.home.ctaBackup}
            </Link>
            <Link
              to="restore"
              className={`${cta} border-2 border-kobo-gray-light bg-white text-kobo-dark hover:bg-kobo-cream`}
            >
              <Icon type="upload" />
              {m.home.ctaRestore}
            </Link>
          </div>
          <ul className="flex flex-wrap justify-center gap-6 text-sm text-kobo-gray">
            {m.home.trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Icon type="check" size="sm" className="text-kobo-success" />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16" aria-labelledby="features-title">
        <Container>
          <h2 id="features-title" className="mb-12 text-center text-3xl text-kobo-dark sm:text-4xl">
            {m.home.featuresTitle}
          </h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {m.home.features.map((feature, i) => (
              <li key={feature.title}>
                <Card gradient className="h-full">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-kobo-accent/15">
                    <Icon type={FEATURE_ICONS[i] ?? 'check'} size={28} className="text-kobo-accent-ink" />
                  </div>
                  <h3 className="mb-2 text-xl text-kobo-dark">{feature.title}</h3>
                  <p className="text-kobo-gray">{feature.body}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-kobo-cream-dark/40 py-16" aria-labelledby="how-title">
        <Container size="sm">
          <h2 id="how-title" className="mb-12 text-center text-3xl text-kobo-dark sm:text-4xl">
            {m.home.howTitle}
          </h2>
          <ol className="space-y-8">
            {m.home.how.map((step, i) => (
              <li key={step.title} className="flex items-start gap-6">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kobo-accent text-xl font-bold text-kobo-dark"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1 text-xl text-kobo-dark">{step.title}</h3>
                  <p className="text-kobo-gray">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Link to="backup" className={`${cta} bg-kobo-accent text-kobo-dark hover:bg-kobo-accent-dark`}>
              {m.home.ctaBackup}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-16" aria-labelledby="faq-title">
        <Container size="sm">
          <h2 id="faq-title" className="mb-8 text-center text-3xl text-kobo-dark sm:text-4xl">
            {m.home.faqTitle}
          </h2>
          <div className="space-y-3">
            {faqTeaser.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-kobo-cream-dark bg-white p-5 shadow-xs"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-kobo-dark">
                  {item.q}
                  <Icon
                    type="chevronDown"
                    className="shrink-0 text-kobo-accent-ink transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-kobo-gray">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link to="faq" className="font-semibold text-kobo-accent-ink underline">
              {m.home.faqMore}
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
