import { downloadZip } from 'client-zip';
import type { KoboAnnotation, KoboBook } from '../types/kobo.ts';

export type AnnotationsByBook = Record<string, KoboAnnotation[]>;

type BookLike = Pick<KoboBook, 'ContentID'> & Partial<KoboBook>;
type AnnotationLike = Partial<KoboAnnotation>;

const yamlString = (value: string | null | undefined) =>
  `"${(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** Filesystem-safe lowercase slug. */
export function slugify(value: string | null | undefined, maxLength = 50): string {
  return (value || 'untitled')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .slice(0, maxLength);
}

/** Obsidian Markdown (with YAML frontmatter) for one book's annotations. */
export function generateObsidianMarkdown(book: Partial<KoboBook>, bookAnns: AnnotationLike[]): string {
  const frontmatter = [
    '---',
    `title: ${yamlString(book.Title)}`,
    `author: ${yamlString(book.Author)}`,
    `publisher: ${yamlString(book.Publisher)}`,
    `isbn: ${yamlString(book.ISBN)}`,
    `progress: ${book.Progress || 0}`,
    `time_spent_minutes: ${book.TimeSpentReading || 0}`,
    'source: Kobo',
    `exported_at: ${new Date().toISOString()}`,
    '---',
    '',
  ].join('\n');

  let content = `# ${book.Title}\n`;
  content += `**Author:** ${book.Author || 'Unknown'}\n`;
  if (book.Publisher) content += `**Publisher:** ${book.Publisher}\n`;
  if (book.ISBN) content += `**ISBN:** ${book.ISBN}\n`;
  content += `**Reading Progress:** ${book.Progress || 0}%\n\n`;
  content += '## Highlights & Notes\n\n';
  content += annotationsToMarkdown(bookAnns, 'Highlight');

  return frontmatter + content;
}

/** Shared Markdown body for a list of annotations. */
export function annotationsToMarkdown(annotations: AnnotationLike[], heading = 'Highlight'): string {
  return annotations
    .map((ann, idx) => {
      let md = `### ${heading} ${idx + 1}\n`;
      if (ann.HighlightedText) md += `> ${ann.HighlightedText.replace(/\n/g, '\n> ')}\n\n`;
      if (ann.Note) md += `**Note:** ${ann.Note}\n\n`;
      if (ann.DateCreated) md += `*Added on ${new Date(ann.DateCreated).toLocaleString()}*\n\n`;
      return `${md}---\n\n`;
    })
    .join('');
}

/** Export all annotated books to an Obsidian vault ZIP (one .md per book). */
export async function exportToObsidianZip(
  books: BookLike[],
  annotationsByBook: Record<string, AnnotationLike[]>,
): Promise<Blob> {
  const entries: { name: string; input: string }[] = [];
  const usedNames = new Set<string>();

  for (const book of books) {
    const bookAnns = annotationsByBook[book.ContentID] || [];
    if (bookAnns.length === 0) continue;

    // De-duplicate: books with the same/similar title would otherwise collide.
    const safeTitle = slugify(book.Title);
    let filename = `${safeTitle}.md`;
    for (let counter = 2; usedNames.has(filename); counter++) filename = `${safeTitle}_${counter}.md`;
    usedNames.add(filename);

    entries.push({ name: filename, input: generateObsidianMarkdown(book, bookAnns) });
  }

  if (entries.length === 0) throw new Error('No annotations found to export.');
  return downloadZip(entries).blob();
}

/**
 * Escape a CSV field and neutralize CSV/formula injection: a field starting
 * with = + - @ (or a control char) can execute as a formula in a spreadsheet.
 */
function escapeCsvField(str: unknown = ''): string {
  let value = String(str ?? '');
  if (/^[=+\-@\t\r]/.test(value)) value = `'${value}`;
  return `"${value.replace(/"/g, '""')}"`;
}

/** Anki-compatible CSV: Front, Back, Tags. */
export function exportToAnkiCsv(annotations: AnnotationLike[]): Blob {
  let csvContent = 'Front,Back,Tags\n';

  for (const ann of annotations) {
    const title = ann.BookTitle || 'Unknown';
    const author = ann.Author || 'Unknown';
    const frontText = `<blockquote>${ann.HighlightedText || ''}</blockquote><br/><small>— ${title} by ${author}</small>`;
    const backText = ann.Note || '<i>No custom note</i>';
    const tag = `kobo_notes ${slugify(title, 200)}`;
    csvContent += `${escapeCsvField(frontText)},${escapeCsvField(backText)},${escapeCsvField(tag)}\n`;
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
