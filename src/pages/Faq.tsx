import { useI18n } from '../i18n/core.ts';
import { Link } from '../router/Router.tsx';
import { REPO_URL } from '../seo/meta.ts';
import { Container } from '../components/layout/Container.tsx';
import { Icon } from '../components/common/Icon.tsx';

export function Faq() {
  const { m } = useI18n();
  const f = m.faq;

  return (
    <Container size="sm" className="py-12">
      <h1 className="mb-4 text-4xl text-kobo-dark sm:text-5xl">{f.title}</h1>
      <p className="mb-12 text-lg text-kobo-gray">{f.intro}</p>

      {f.categories.map((category) => (
        <section key={category.title} className="mb-12" aria-label={category.title}>
          <h2 className="mb-6 border-b-2 border-kobo-accent pb-2 text-2xl text-kobo-dark">
            {category.title}
          </h2>
          <div className="space-y-3">
            {category.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-kobo-cream-dark bg-white shadow-xs"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 hover:bg-kobo-cream/50">
                  <h3 className="font-display text-lg font-bold text-kobo-dark">{item.q}</h3>
                  <Icon
                    type="chevronDown"
                    className="shrink-0 text-kobo-accent-ink transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="px-6 pb-5 leading-relaxed text-kobo-gray">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl bg-kobo-accent/10 p-8 text-center">
        <h2 className="mb-3 text-2xl text-kobo-dark">{f.moreTitle}</h2>
        <p className="mb-6 text-kobo-gray">{f.moreBody}</p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="guide"
            className="rounded-lg bg-kobo-accent px-5 py-2.5 font-semibold text-kobo-dark hover:bg-kobo-accent-dark focus-visible-ring"
          >
            {f.moreGuide}
          </Link>
          <a
            href={`${REPO_URL}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border-2 border-kobo-gray-light bg-white px-5 py-2.5 font-semibold text-kobo-dark hover:bg-kobo-cream focus-visible-ring"
          >
            GitHub <span className="sr-only">{m.common.opensInNewTab}</span>
          </a>
        </div>
      </section>
    </Container>
  );
}
