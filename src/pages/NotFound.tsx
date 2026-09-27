import { useI18n } from '../i18n/core.ts';
import { Link } from '../router/Router.tsx';
import { Container } from '../components/layout/Container.tsx';

export function NotFound() {
  const { m } = useI18n();
  return (
    <Container size="sm" className="py-24 text-center">
      <p className="mb-2 font-display text-6xl text-kobo-accent-ink">404</p>
      <h1 className="mb-4 text-4xl text-kobo-dark">{m.notFound.title}</h1>
      <p className="mb-8 text-lg text-kobo-gray">{m.notFound.body}</p>
      <Link
        to="home"
        className="rounded-lg bg-kobo-accent px-6 py-3 font-semibold text-kobo-dark hover:bg-kobo-accent-dark focus-visible-ring"
      >
        {m.notFound.home}
      </Link>
    </Container>
  );
}
