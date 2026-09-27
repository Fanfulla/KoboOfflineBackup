import { useDeferredValue, useMemo, useState } from 'react';
import { useI18n } from '../i18n/core.ts';
import { Link } from '../router/Router.tsx';
import { useDevice } from '../hooks/useDevice.ts';
import { useKoboStore } from '../stores/koboStore.ts';
import { downloadBlob } from '../utils/fileSystem.ts';
import { errorMessage } from '../utils/errors.ts';
import { Container } from '../components/layout/Container.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { Card } from '../components/common/Card.tsx';
import { Button } from '../components/common/Button.tsx';
import { Icon } from '../components/common/Icon.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Tabs } from '../components/common/Tabs.tsx';
import { Alert } from '../components/common/Alert.tsx';
import { ConnectDevice } from '../components/device/ConnectDevice.tsx';
import { CoverImage } from '../components/library/CoverImage.tsx';
import type { KoboAnnotation, KoboBook, ScanResult } from '../types/kobo.ts';
import type { KoboSource } from '../utils/deviceSource.ts';

type Tab = 'books' | 'annotations' | 'collections' | 'stats';
type Filter = 'all' | 'reading' | 'finished' | 'unread';
type Sort = 'recent' | 'title' | 'author' | 'progress';

const isFinished = (b: KoboBook) => b.ReadStatus === 2 || b.Progress >= 100;
const isReading = (b: KoboBook) => !isFinished(b) && (b.ReadStatus === 1 || b.Progress > 0);
const FILTERS: Record<Filter, (b: KoboBook) => boolean> = {
  all: () => true,
  reading: isReading,
  finished: isFinished,
  unread: (b) => !isFinished(b) && !isReading(b),
};

const today = () => new Date().toISOString().split('T')[0];

export function Library() {
  const { m } = useI18n();
  const device = useDevice();
  const source = useKoboStore((s) => s.source);

  return (
    <Container className="py-12">
      <PageHeader title={m.library.title} subtitle={m.library.subtitle} />
      {device.scan ? (
        <Dashboard scan={device.scan} source={source} onDisconnect={device.disconnect} />
      ) : (
        <ConnectDevice device={device} />
      )}
    </Container>
  );
}

function Dashboard({
  scan,
  source,
  onDisconnect,
}: {
  scan: ScanResult;
  source: KoboSource | null;
  onDisconnect: () => void;
}) {
  const { m, fmt, plural } = useI18n();
  const [tab, setTab] = useState<Tab>('books');
  const [selected, setSelected] = useState<KoboBook | null>(null);

  const annotationsByBook = useMemo(() => {
    const map: Record<string, KoboAnnotation[]> = {};
    for (const a of scan.annotations) (map[a.VolumeID] ||= []).push(a);
    return map;
  }, [scan.annotations]);

  return (
    <>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-xs sm:flex-row">
        <p className="text-kobo-dark">
          <Icon type="device" className="mr-2 inline text-kobo-accent-ink" />
          {fmt(m.library.connected, {
            model: scan.deviceInfo.model,
            firmware: scan.deviceInfo.firmwareVersion,
          })}
        </p>
        <div className="flex gap-2">
          <Link
            to="backup"
            className="rounded-lg bg-kobo-accent px-4 py-2 font-semibold text-kobo-dark hover:bg-kobo-accent-dark focus-visible-ring"
          >
            {m.library.backupCta}
          </Link>
          <Button variant="ghost" onClick={onDisconnect}>
            {m.connect.disconnect}
          </Button>
        </div>
      </div>

      <Tabs<Tab>
        label={m.library.title}
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'books', label: `${m.library.tabs.books} (${scan.books.length})` },
          { id: 'annotations', label: `${m.library.tabs.annotations} (${scan.annotations.length})` },
          { id: 'collections', label: `${m.library.tabs.collections} (${scan.collections.length})` },
          { id: 'stats', label: m.library.tabs.stats },
        ]}
      >
        {tab === 'books' && (
          <BooksTab
            scan={scan}
            source={source}
            annotationsByBook={annotationsByBook}
            onSelect={setSelected}
          />
        )}
        {tab === 'annotations' && (
          <AnnotationsTab scan={scan} source={source} annotationsByBook={annotationsByBook} />
        )}
        {tab === 'collections' && <CollectionsTab scan={scan} onSelect={setSelected} />}
        {tab === 'stats' && <StatsTab scan={scan} />}
      </Tabs>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={m.library.details}
        closeLabel={m.common.close}
        size="lg"
      >
        {selected && (
          <BookDetails
            book={selected}
            source={source}
            annotations={annotationsByBook[selected.ContentID] ?? []}
          />
        )}
      </Modal>
      <p className="sr-only" aria-live="polite">
        {plural(m.library.results, scan.books.length)}
      </p>
    </>
  );
}

function BooksTab({
  scan,
  source,
  annotationsByBook,
  onSelect,
}: {
  scan: ScanResult;
  source: KoboSource | null;
  annotationsByBook: Record<string, KoboAnnotation[]>;
  onSelect: (b: KoboBook) => void;
}) {
  const { m, fmt, plural, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const deferredQuery = useDeferredValue(query);

  const books = useMemo(() => {
    const q = deferredQuery.trim().toLocaleLowerCase(locale);
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    const sorters: Record<Sort, (a: KoboBook, b: KoboBook) => number> = {
      recent: (a, b) => (b.DateLastRead?.getTime() ?? 0) - (a.DateLastRead?.getTime() ?? 0),
      title: (a, b) => collator.compare(a.Title ?? '', b.Title ?? ''),
      author: (a, b) => collator.compare(a.Author, b.Author),
      progress: (a, b) => b.Progress - a.Progress,
    };
    return scan.books
      .filter((b) => FILTERS[filter](b))
      .filter((b) => !q || `${b.Title} ${b.Author}`.toLocaleLowerCase(locale).includes(q))
      .sort(sorters[sort]);
  }, [scan.books, deferredQuery, filter, sort, locale]);

  const selectClass =
    'rounded-lg border border-kobo-gray-light bg-white px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-kobo-accent/50';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-xs sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-medium text-kobo-dark">
          {m.library.search}
          <span className="relative mt-1 block">
            <Icon type="search" className="pointer-events-none absolute left-3 top-2.5 text-kobo-gray" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-kobo-gray-light py-2 pl-10 pr-3 focus:outline-hidden focus:ring-2 focus:ring-kobo-accent/50"
            />
          </span>
        </label>
        <label className="text-sm font-medium text-kobo-dark">
          {m.library.filter}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            className={`mt-1 block ${selectClass}`}
          >
            {(Object.keys(FILTERS) as Filter[]).map((f) => (
              <option key={f} value={f}>
                {m.library.filters[f]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-kobo-dark">
          {m.library.sort}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className={`mt-1 block ${selectClass}`}
          >
            {(['recent', 'title', 'author', 'progress'] as Sort[]).map((s) => (
              <option key={s} value={s}>
                {m.library.sorts[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-kobo-gray" aria-live="polite">
        {plural(m.library.results, books.length)}
      </p>

      {books.length === 0 ? (
        <p className="rounded-xl bg-white p-12 text-center text-kobo-gray">{m.library.noResults}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => {
            const count = annotationsByBook[book.ContentID]?.length ?? 0;
            return (
              <li
                key={book.ContentID}
                className="[content-visibility:auto] [contain-intrinsic-size:auto_320px]"
              >
                <button
                  type="button"
                  onClick={() => onSelect(book)}
                  className="group flex w-full flex-col rounded-md text-left focus-visible-ring"
                >
                  <CoverImage
                    source={source}
                    coverId={book.CoverId}
                    title={book.Title ?? ''}
                    author={book.Author}
                    className="mb-3 transition-transform group-hover:scale-[1.03]"
                  />
                  <span className="line-clamp-2 font-display text-sm font-bold leading-tight text-kobo-dark">
                    {book.Title}
                  </span>
                  <span className="mt-1 truncate text-xs text-kobo-gray">{book.Author}</span>
                  <span
                    className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-kobo-cream-dark"
                    aria-hidden="true"
                  >
                    <span
                      className={`block h-full rounded-full ${isFinished(book) ? 'bg-kobo-success' : 'bg-kobo-accent'}`}
                      style={{ width: `${Math.min(book.Progress, 100)}%` }}
                    />
                  </span>
                  <span className="mt-1 flex justify-between text-xs text-kobo-gray">
                    <span>{fmt(m.library.read, { percent: book.Progress })}</span>
                    {count > 0 && <span>{plural(m.common.annotations, count)}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AnnotationList({ annotations }: { annotations: KoboAnnotation[] }) {
  const { m, formatDate } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (a: KoboAnnotation) => {
    await navigator.clipboard?.writeText([a.HighlightedText, a.Note].filter(Boolean).join('\n\n'));
    setCopied(a.BookmarkID);
    setTimeout(() => setCopied((c) => (c === a.BookmarkID ? null : c)), 2000);
  };

  return (
    <ul className="space-y-3">
      {annotations.map((a) => (
        <li
          key={a.BookmarkID}
          className="rounded-lg border border-kobo-cream-dark bg-kobo-cream/50 p-3 text-sm"
        >
          {a.HighlightedText && (
            <blockquote className="whitespace-pre-line border-l-2 border-kobo-accent pl-3 italic text-kobo-dark">
              {a.HighlightedText}
            </blockquote>
          )}
          {a.Note && (
            <p className="mt-2 rounded bg-white/80 p-2 text-kobo-dark">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-kobo-accent-ink">
                {m.library.note}
              </span>
              {a.Note}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-kobo-gray">
            <span>{a.DateCreated ? formatDate(a.DateCreated) : ''}</span>
            <button
              type="button"
              onClick={() => void copy(a)}
              className="flex items-center gap-1 rounded px-2 py-1 font-semibold hover:bg-kobo-cream-dark focus-visible-ring"
              aria-live="polite"
            >
              <Icon type={copied === a.BookmarkID ? 'check' : 'copy'} size="sm" />
              {copied === a.BookmarkID ? m.library.copied : m.library.copy}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

async function exportBookMarkdown(book: KoboBook, annotations: KoboAnnotation[]) {
  const { generateObsidianMarkdown, slugify } = await import('../utils/export.ts');
  downloadBlob(
    new Blob([generateObsidianMarkdown(book, annotations)], { type: 'text/markdown;charset=utf-8' }),
    `${slugify(book.Title)}.md`,
  );
}

function AnnotationsTab({
  scan,
  source,
  annotationsByBook,
}: {
  scan: ScanResult;
  source: KoboSource | null;
  annotationsByBook: Record<string, KoboAnnotation[]>;
}) {
  const { m, fmt, plural } = useI18n();
  const [open, setOpen] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const books = scan.books.filter((b) => annotationsByBook[b.ContentID]?.length);

  const run = async (fn: () => Promise<void>) => {
    setExportError(null);
    try {
      await fn();
    } catch (err) {
      setExportError(fmt(m.library.exportFailed, { error: errorMessage(err) }));
    }
  };

  if (scan.annotations.length === 0)
    return <p className="rounded-xl bg-white p-12 text-center text-kobo-gray">{m.library.noAnnotations}</p>;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col items-center justify-between gap-4 border border-kobo-accent/30 bg-kobo-accent/5 sm:flex-row">
        <div>
          <h2 className="text-xl text-kobo-dark">{m.library.exportTitle}</h2>
          <p className="text-sm text-kobo-gray">{m.library.exportBody}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="sm"
            onClick={() =>
              run(async () => {
                const { exportToObsidianZip } = await import('../utils/export.ts');
                downloadBlob(
                  await exportToObsidianZip(scan.books, annotationsByBook),
                  `kobo_obsidian_notes_${today()}.zip`,
                );
              })
            }
          >
            {m.library.exportObsidian}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              run(async () => {
                const { exportToAnkiCsv } = await import('../utils/export.ts');
                downloadBlob(exportToAnkiCsv(scan.annotations), `kobo_anki_flashcards_${today()}.csv`);
              })
            }
          >
            {m.library.exportAnki}
          </Button>
        </div>
      </Card>
      {exportError && (
        <Alert tone="error" live>
          {exportError}
        </Alert>
      )}

      <ul className="space-y-3">
        {books.map((book) => {
          const anns = annotationsByBook[book.ContentID]!;
          const expanded = open === book.ContentID;
          const panelId = `ann-${book.ContentID.replace(/[^a-z0-9]/gi, '')}`;
          return (
            <li key={book.ContentID} className="rounded-xl bg-white shadow-xs">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 shrink-0">
                  <CoverImage
                    source={source}
                    coverId={book.CoverId}
                    title={book.Title ?? ''}
                    author={book.Author}
                  />
                </div>
                <button
                  type="button"
                  className="min-w-0 flex-1 rounded text-left focus-visible-ring"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? null : book.ContentID)}
                >
                  <span className="block truncate font-display font-bold text-kobo-dark">{book.Title}</span>
                  <span className="block truncate text-sm text-kobo-gray">
                    {book.Author} · {plural(m.common.annotations, anns.length)}
                  </span>
                </button>
                <Button size="sm" variant="ghost" onClick={() => run(() => exportBookMarkdown(book, anns))}>
                  {m.library.exportBook}
                </Button>
                <Icon
                  type="chevronDown"
                  className={`shrink-0 text-kobo-gray transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </div>
              {expanded && (
                <div id={panelId} className="border-t border-kobo-cream-dark p-4">
                  <AnnotationList annotations={anns} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CollectionsTab({ scan, onSelect }: { scan: ScanResult; onSelect: (b: KoboBook) => void }) {
  const { m, plural } = useI18n();
  const byId = useMemo(() => new Map(scan.books.map((b) => [b.ContentID, b])), [scan.books]);
  if (scan.collections.length === 0)
    return <p className="rounded-xl bg-white p-12 text-center text-kobo-gray">{m.library.noCollections}</p>;

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {scan.collections.map((c) => {
        const books = c.ContentIds.map((id) => byId.get(id)).filter((b): b is KoboBook => !!b);
        return (
          <li key={c.Id}>
            <Card>
              <h2 className="mb-1 text-xl text-kobo-dark">{c.Name}</h2>
              <p className="mb-3 text-sm text-kobo-gray">{plural(m.common.books, c.ContentIds.length)}</p>
              <ul className="space-y-1 text-sm">
                {books.map((b) => (
                  <li key={b.ContentID}>
                    <button
                      type="button"
                      onClick={() => onSelect(b)}
                      className="text-left text-kobo-accent-ink underline-offset-2 hover:underline focus-visible-ring"
                    >
                      {b.Title}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function StatsTab({ scan }: { scan: ScanResult }) {
  const { m, plural, formatDuration, formatNumber } = useI18n();
  const total = scan.books.length || 1;
  const counts = {
    finished: scan.books.filter(isFinished).length,
    reading: scan.books.filter(isReading).length,
    unread: scan.books.filter(FILTERS.unread).length,
  };
  const topAuthors = Object.entries(
    scan.books.reduce<Record<string, number>>(
      (acc, b) => ({ ...acc, [b.Author]: (acc[b.Author] ?? 0) + 1 }),
      {},
    ),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const overview: [string, string][] = [
    [m.backup.stats.timeRead, formatDuration(scan.stats.totalMinutesRead)],
    [m.backup.stats.books, formatNumber(scan.books.length)],
    [m.backup.stats.finished, formatNumber(counts.finished)],
    [m.backup.stats.annotations, formatNumber(scan.annotations.length)],
  ];
  const bars: [string, number, string][] = [
    [m.library.finishedLabel, counts.finished, 'bg-kobo-success'],
    [m.library.readingLabel, counts.reading, 'bg-kobo-accent'],
    [m.library.unreadLabel, counts.unread, 'bg-kobo-gray-light'],
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-3">
        <h2 className="mb-6 text-xl text-kobo-dark">{m.library.statsOverview}</h2>
        <dl className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          {overview.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-kobo-cream p-4">
              <dt className="mb-1 text-sm text-kobo-gray">{label}</dt>
              <dd className="font-display text-2xl text-kobo-dark">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card>
        <h2 className="mb-4 text-xl text-kobo-dark">{m.library.progressBreakdown}</h2>
        <ul className="space-y-4">
          {bars.map(([label, count, color]) => (
            <li key={label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-kobo-gray">{label}</span>
                <span className="font-semibold text-kobo-dark">{plural(m.common.books, count)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-kobo-cream-dark" aria-hidden="true">
                <div className={`h-full ${color}`} style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="md:col-span-2">
        <h2 className="mb-4 text-xl text-kobo-dark">{m.library.topAuthors}</h2>
        <ol className="space-y-2">
          {topAuthors.map(([author, count]) => (
            <li
              key={author}
              className="flex items-center justify-between rounded-lg bg-kobo-cream/60 px-3 py-2 text-sm"
            >
              <span className="font-semibold text-kobo-dark">{author}</span>
              <span className="rounded-full bg-kobo-accent px-2 py-0.5 text-xs font-semibold text-kobo-dark">
                {plural(m.common.books, count)}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function BookDetails({
  book,
  source,
  annotations,
}: {
  book: KoboBook;
  source: KoboSource | null;
  annotations: KoboAnnotation[];
}) {
  const { m, fmt, formatDate, formatDuration } = useI18n();
  const [exportError, setExportError] = useState<string | null>(null);
  const details: [string, string][] = [
    [m.library.timeRead, formatDuration(book.TimeSpentReading)],
    [m.library.format, (book.MimeType?.split('/').pop() ?? 'epub').replace('application/', '').toUpperCase()],
    [m.library.lastRead, book.DateLastRead ? formatDate(book.DateLastRead) : m.library.never],
    [m.library.isbn, book.ISBN || '—'],
    [m.library.publisher, book.Publisher || '—'],
    [
      m.library.series,
      book.Series ? `${book.Series}${book.SeriesNumber ? ` #${book.SeriesNumber}` : ''}` : '—',
    ],
  ];

  return (
    <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto md:flex-row">
      <div className="mx-auto w-40 shrink-0">
        <CoverImage source={source} coverId={book.CoverId} title={book.Title ?? ''} author={book.Author} />
        <p className="mt-3 text-center font-display text-2xl text-kobo-accent-ink">
          {fmt(m.library.read, { percent: book.Progress })}
        </p>
      </div>
      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <h3 className="text-2xl leading-tight text-kobo-dark">{book.Title}</h3>
          <p className="text-lg text-kobo-gray">{book.Author}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 rounded-xl bg-kobo-cream/40 p-4 text-sm">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-kobo-gray">{label}</dt>
              <dd className="truncate font-semibold text-kobo-dark">{value}</dd>
            </div>
          ))}
        </dl>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-base text-kobo-dark">
              {m.library.tabs.annotations} ({annotations.length})
            </h4>
            {annotations.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  exportBookMarkdown(book, annotations).catch((e: unknown) => setExportError(errorMessage(e)))
                }
              >
                {m.library.exportBook}
              </Button>
            )}
          </div>
          {exportError && <Alert tone="error">{fmt(m.library.exportFailed, { error: exportError })}</Alert>}
          {annotations.length ? (
            <AnnotationList annotations={annotations} />
          ) : (
            <p className="text-sm italic text-kobo-gray">{m.library.noAnnotationsForBook}</p>
          )}
        </div>
      </div>
    </div>
  );
}
