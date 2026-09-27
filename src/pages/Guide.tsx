import { useI18n } from '../i18n/core.ts';
import { Link } from '../router/Router.tsx';
import { Container } from '../components/layout/Container.tsx';
import { Alert } from '../components/common/Alert.tsx';

export function Guide() {
  const { m } = useI18n();
  const g = m.guide;

  return (
    <Container size="sm" className="py-12">
      <article>
        <h1 className="mb-4 text-4xl text-kobo-dark sm:text-5xl">{g.title}</h1>
        <p className="mb-8 text-lg text-kobo-gray">{g.intro}</p>

        <nav aria-label={g.title} className="mb-10 rounded-xl bg-kobo-cream-dark/50 p-5">
          <ul className="grid gap-2 sm:grid-cols-2">
            {g.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-kobo-accent-ink underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="mb-12" aria-labelledby="requirements">
          <h2 id="requirements" className="mb-4 text-2xl text-kobo-dark">
            {g.requirementsTitle}
          </h2>
          <Alert tone="info">
            <ul className="list-disc space-y-1 pl-5">
              {g.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Alert>
        </section>

        {g.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="mb-12 scroll-mt-24"
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`} className="mb-4 text-2xl text-kobo-dark">
              {section.title}
            </h2>
            <ol className="space-y-3">
              {section.steps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kobo-accent font-bold text-kobo-dark"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="pt-1 text-kobo-dark">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section className="mb-12" aria-labelledby="troubleshooting">
          <h2 id="troubleshooting" className="mb-4 text-2xl text-kobo-dark">
            {g.troubleshootingTitle}
          </h2>
          <dl className="space-y-4">
            {g.troubleshooting.map((item) => (
              <div key={item.q} className="rounded-xl border border-kobo-cream-dark bg-white p-5">
                <dt className="mb-1 font-display text-lg font-bold text-kobo-dark">{item.q}</dt>
                <dd className="text-kobo-gray">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="text-center">
          <Link to="faq" className="font-semibold text-kobo-accent-ink underline">
            {m.home.faqMore}
          </Link>
        </p>
      </article>
    </Container>
  );
}
