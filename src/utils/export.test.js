import { describe, it, expect } from 'vitest';
import { generateObsidianMarkdown, exportToAnkiCsv, exportToObsidianZip } from './export.js';

describe('export.js - Obsidian Markdown Generator', () => {
  it('should correctly format Obsidian Markdown with YAML frontmatter', () => {
    const book = {
      Title: 'Test Book "Special Edition"',
      Author: 'Author Name',
      Publisher: 'Publisher Name',
      ISBN: '1234567890',
      Progress: 42,
      TimeSpentReading: 80,
      ContentID: 'book-1'
    };

    const bookAnns = [
      {
        HighlightedText: 'This is a sample highlight.\nWith a new line.',
        Note: 'My thoughts on this.',
        DateCreated: '2026-05-19T20:20:00.000Z'
      }
    ];

    const result = generateObsidianMarkdown(book, bookAnns);

    // Verify frontmatter exists
    expect(result).toContain('---');
    expect(result).toContain('title: "Test Book \\"Special Edition\\""');
    expect(result).toContain('author: "Author Name"');
    expect(result).toContain('publisher: "Publisher Name"');
    expect(result).toContain('isbn: "1234567890"');
    expect(result).toContain('progress: 42');
    expect(result).toContain('time_spent_minutes: 80');
    expect(result).toContain('source: Kobo');

    // Verify content exists
    expect(result).toContain('# Test Book "Special Edition"');
    expect(result).toContain('**Reading Progress:** 42%');
    expect(result).toContain('This is a sample highlight.');
    expect(result).toContain('My thoughts on this.');
    expect(result).toContain('Added on');
  });
});

describe('export.js - Anki CSV Exporter', () => {
  it('should format annotations into escaped CSV lines', async () => {
    const annotations = [
      {
        BookTitle: 'Title A',
        Author: 'Author A',
        HighlightedText: 'Highlight A with "quotes"',
        Note: 'Note A',
        BookmarkID: 'ann-1'
      },
      {
        BookTitle: 'Title B',
        Author: 'Author B',
        HighlightedText: 'Highlight B',
        Note: '',
        BookmarkID: 'ann-2'
      }
    ];

    const blob = exportToAnkiCsv(annotations);
    const text = await blob.text();

    const lines = text.split('\n');
    expect(lines[0]).toBe('Front,Back,Tags');
    
    // Check second line (first annotation)
    expect(lines[1]).toContain('Title A');
    expect(lines[1]).toContain('Author A');
    expect(lines[1]).toContain('Highlight A with ""quotes""');
    expect(lines[1]).toContain('Note A');
    expect(lines[1]).toContain('kobo_notes title_a');

    // Check third line (second annotation)
    expect(lines[2]).toContain('Title B');
    expect(lines[2]).toContain('Highlight B');
    expect(lines[2]).toContain('No custom note'); // Default fallback
    expect(lines[2]).toContain('kobo_notes title_b');
  });

  it('should neutralize CSV/formula injection in note field', async () => {
    const annotations = [
      {
        BookTitle: 'Book',
        Author: 'Auth',
        HighlightedText: 'safe',
        Note: '=HYPERLINK("http://evil")',
        BookmarkID: 'ann-x'
      }
    ];

    const text = await exportToAnkiCsv(annotations).text();
    // The leading '=' must be prefixed with a single quote so spreadsheets
    // treat it as text, not a formula.
    expect(text).toContain(`"'=HYPERLINK`);
    expect(text).not.toContain('"=HYPERLINK');
  });
});

describe('export.js - Obsidian ZIP de-duplication', () => {
  it('should give colliding titles distinct filenames', async () => {
    const books = [
      { ContentID: 'c1', Title: 'My Book' },
      { ContentID: 'c2', Title: 'My Book' }, // same title -> same slug
    ];
    const annotationsByBook = {
      c1: [{ HighlightedText: 'a' }],
      c2: [{ HighlightedText: 'b' }],
    };

    const blob = await exportToObsidianZip(books, annotationsByBook);
    // Two annotated books -> two distinct entries, not one overwritten file.
    expect(blob.size).toBeGreaterThan(0);

    const { ZipReader, BlobReader, TextWriter } = await import('@zip.js/zip.js');
    const reader = new ZipReader(new BlobReader(blob));
    const names = (await reader.getEntries()).map((e) => e.filename);
    await reader.close();

    expect(names).toHaveLength(2);
    expect(new Set(names).size).toBe(2); // no collision
    expect(names).toContain('my_book.md');
    expect(names).toContain('my_book_2.md');
  });
});
