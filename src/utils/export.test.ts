import { describe, it, expect } from 'vitest';
import { ZipReader, BlobReader } from '@zip.js/zip.js';
import { generateObsidianMarkdown, exportToAnkiCsv, exportToObsidianZip } from './export.ts';

describe('export.ts - Obsidian Markdown Generator', () => {
  it('formats Obsidian Markdown with YAML frontmatter', () => {
    const book = {
      Title: 'Test Book "Special Edition"',
      Author: 'Author Name',
      Publisher: 'Publisher Name',
      ISBN: '1234567890',
      Progress: 42,
      TimeSpentReading: 80,
      ContentID: 'book-1',
    };
    const bookAnns = [
      {
        HighlightedText: 'This is a sample highlight.\nWith a new line.',
        Note: 'My thoughts on this.',
        DateCreated: new Date('2026-05-19T20:20:00.000Z'),
      },
    ];

    const result = generateObsidianMarkdown(book, bookAnns);

    expect(result).toContain('---');
    expect(result).toContain('title: "Test Book \\"Special Edition\\""');
    expect(result).toContain('author: "Author Name"');
    expect(result).toContain('publisher: "Publisher Name"');
    expect(result).toContain('isbn: "1234567890"');
    expect(result).toContain('progress: 42');
    expect(result).toContain('time_spent_minutes: 80');
    expect(result).toContain('source: Kobo');
    expect(result).toContain('# Test Book "Special Edition"');
    expect(result).toContain('**Reading Progress:** 42%');
    expect(result).toContain('This is a sample highlight.');
    expect(result).toContain('My thoughts on this.');
    expect(result).toContain('Added on');
  });
});

describe('export.ts - Anki CSV Exporter', () => {
  it('formats annotations into escaped CSV lines', async () => {
    const text = await exportToAnkiCsv([
      {
        BookTitle: 'Title A',
        Author: 'Author A',
        HighlightedText: 'Highlight A with "quotes"',
        Note: 'Note A',
        BookmarkID: 'ann-1',
      },
      {
        BookTitle: 'Title B',
        Author: 'Author B',
        HighlightedText: 'Highlight B',
        Note: '',
        BookmarkID: 'ann-2',
      },
    ]).text();

    const lines = text.split('\n');
    expect(lines[0]).toBe('Front,Back,Tags');
    expect(lines[1]).toContain('Title A');
    expect(lines[1]).toContain('Author A');
    expect(lines[1]).toContain('Highlight A with ""quotes""');
    expect(lines[1]).toContain('Note A');
    expect(lines[1]).toContain('kobo_notes title_a');
    expect(lines[2]).toContain('Title B');
    expect(lines[2]).toContain('Highlight B');
    expect(lines[2]).toContain('No custom note');
    expect(lines[2]).toContain('kobo_notes title_b');
  });

  it('neutralizes CSV/formula injection in note field', async () => {
    const text = await exportToAnkiCsv([
      {
        BookTitle: 'Book',
        Author: 'Auth',
        HighlightedText: 'safe',
        Note: '=HYPERLINK("http://evil")',
        BookmarkID: 'x',
      },
    ]).text();
    expect(text).toContain(`"'=HYPERLINK`);
    expect(text).not.toContain('"=HYPERLINK');
  });
});

describe('export.ts - Obsidian ZIP de-duplication', () => {
  it('gives colliding titles distinct filenames', async () => {
    const blob = await exportToObsidianZip(
      [
        { ContentID: 'c1', Title: 'My Book' },
        { ContentID: 'c2', Title: 'My Book' },
      ],
      { c1: [{ HighlightedText: 'a' }], c2: [{ HighlightedText: 'b' }] },
    );
    const reader = new ZipReader(new BlobReader(blob));
    const names = (await reader.getEntries()).map((e) => e.filename);
    await reader.close();

    expect(names).toHaveLength(2);
    expect(names).toContain('my_book.md');
    expect(names).toContain('my_book_2.md');
  });
});
