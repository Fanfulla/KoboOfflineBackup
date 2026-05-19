import { downloadZip } from 'client-zip';

/**
 * Generate Obsidian Markdown file content for a book
 * @param {object} book - Book object
 * @param {Array<object>} bookAnns - Book annotations
 * @returns {string} Markdown content with YAML frontmatter
 */
export function generateObsidianMarkdown(book, bookAnns) {
  const frontmatter = [
    '---',
    `title: "${(book.Title || '').replace(/"/g, '\\"')}"`,
    `author: "${(book.Author || '').replace(/"/g, '\\"')}"`,
    `publisher: "${(book.Publisher || '').replace(/"/g, '\\"')}"`,
    `isbn: "${book.ISBN || ''}"`,
    `progress: ${book.Progress || 0}`,
    `time_spent_minutes: ${book.TimeSpentReading || 0}`,
    'source: Kobo',
    `exported_at: ${new Date().toISOString()}`,
    '---',
    ''
  ].join('\n');

  let content = `# ${book.Title}\n`;
  content += `**Author:** ${book.Author || 'Unknown'}\n`;
  if (book.Publisher) content += `**Publisher:** ${book.Publisher}\n`;
  if (book.ISBN) content += `**ISBN:** ${book.ISBN}\n`;
  content += `**Reading Progress:** ${book.Progress || 0}%\n\n`;
  content += `## Highlights & Notes\n\n`;

  bookAnns.forEach((ann, idx) => {
    content += `### Highlight ${idx + 1}\n`;
    if (ann.HighlightedText) {
      content += `> ${ann.HighlightedText.replace(/\n/g, '\n> ')}\n\n`;
    }
    if (ann.Note) {
      content += `**Note:** ${ann.Note}\n\n`;
    }
    if (ann.DateCreated) {
      content += `*Added on ${new Date(ann.DateCreated).toLocaleString()}*\n\n`;
    }
    content += `---\n\n`;
  });

  return frontmatter + content;
}

/**
 * Export all annotated books to Obsidian ZIP archive
 * @param {Array<object>} books - All books
 * @param {object} annotationsByBook - Map of book ContentID to array of annotations
 * @returns {Promise<Blob>} ZIP blob
 */
export async function exportToObsidianZip(books, annotationsByBook) {
  const entries = [];

  books.forEach((book) => {
    const bookAnns = annotationsByBook[book.ContentID] || [];
    if (bookAnns.length === 0) return;

    // Create a clean filename
    const safeTitle = (book.Title || 'Untitled')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .slice(0, 50);
    const filename = `${safeTitle}.md`;
    const markdownContent = generateObsidianMarkdown(book, bookAnns);

    entries.push({
      name: filename,
      input: markdownContent
    });
  });

  if (entries.length === 0) {
    throw new Error('No annotations found to export.');
  }

  return await downloadZip(entries).blob();
}

/**
 * Clean string for CSV escaping
 */
function escapeCsvField(str = '') {
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Export annotations as Anki-compatible CSV
 * @param {Array<object>} annotations - Array of annotations
 * @returns {Blob} CSV blob
 */
export function exportToAnkiCsv(annotations) {
  // CSV header: Front, Back, Tags
  let csvContent = 'Front,Back,Tags\n';

  annotations.forEach((ann) => {
    const title = ann.BookTitle || 'Unknown';
    const author = ann.Author || 'Unknown';
    
    // Anki card design: Front shows blockquote of text and the source
    const frontText = `<blockquote>${ann.HighlightedText || ''}</blockquote><br/><small>— ${title} by ${author}</small>`;
    
    // Back shows note or a default string
    const backText = ann.Note || '<i>No custom note</i>';
    
    // Create tag based on book title
    const tag = `kobo_notes ${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;

    csvContent += `${escapeCsvField(frontText)},${escapeCsvField(backText)},${escapeCsvField(tag)}\n`;
  });

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
