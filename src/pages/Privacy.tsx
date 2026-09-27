import { useI18n } from '../i18n/core.ts';
import { REPO_URL } from '../seo/meta.ts';
import { Container } from '../components/layout/Container.tsx';

/** Date of the last change to the privacy policy content. */
const POLICY_DATE = '2026-09-27';

export function Privacy() {
  const { m, fmt, formatDate } = useI18n();
  const p = m.privacy;

  return (
    <Container size="sm" className="py-12">
      <article>
        <h1 className="mb-2 text-4xl text-kobo-dark sm:text-5xl">{p.title}</h1>
        <p className="mb-8 text-sm text-kobo-gray">
          {fmt(p.updated, { date: formatDate(POLICY_DATE, { dateStyle: 'long', timeZone: 'UTC' }) })}
        </p>
        <p className="mb-10 text-lg text-kobo-dark">{p.intro}</p>

        {p.sections.map((section) => (
          <section key={section.title} className="mb-10" aria-label={section.title}>
            <h2 className="mb-3 text-2xl text-kobo-dark">{section.title}</h2>
            {section.paragraphs.map((text) => (
              <p key={text} className="mb-3 text-kobo-gray">
                {text}
              </p>
            ))}
            {section.items && (
              <ul className="list-disc space-y-1 pl-6 text-kobo-gray">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="rounded-lg bg-kobo-cream-dark/60 p-4 text-sm text-kobo-dark">
          GitHub:{' '}
          <a
            href={REPO_URL}
            className="text-kobo-accent-ink underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {REPO_URL.replace('https://', '')}
          </a>
        </p>
      </article>
    </Container>
  );
}
