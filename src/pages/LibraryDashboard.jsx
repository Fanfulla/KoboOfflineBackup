import { useState, useMemo } from 'react';
import { useKoboStore } from '../stores/koboStore.js';
import { CoverPreview } from '../components/backup/CoverPreview.jsx';
import { Container } from '../components/layout/Container.jsx';
import { Card } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Icon } from '../components/common/Icon.jsx';
import { formatDuration } from '../utils/formatters.js';
import { exportToObsidianZip, exportToAnkiCsv } from '../utils/export.js';

export function LibraryDashboard({ onNavigate }) {
  const books = useKoboStore((state) => state.books);
  const annotations = useKoboStore((state) => state.annotations);
  const stats = useKoboStore((state) => state.stats);
  const device = useKoboStore((state) => state.device);
  const deviceHandle = useKoboStore((state) => state.deviceHandle);

  // Tab state: 'books' | 'annotations' | 'stats'
  const [activeTab, setActiveTab] = useState('books');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | reading | finished | unread
  const [sortBy, setSortBy] = useState('recent'); // recent | title | progress

  // Selected book for details modal
  const [selectedBook, setSelectedBook] = useState(null);

  // Copy success feedback state
  const [copiedAnnotationId, setCopiedAnnotationId] = useState(null);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesSearch =
          book.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.Author?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'reading') {
          matchesStatus = book.ReadStatus === 1 || (book.Progress > 0 && book.Progress < 100);
        } else if (statusFilter === 'finished') {
          matchesStatus = book.ReadStatus === 2 || book.Progress >= 100;
        } else if (statusFilter === 'unread') {
          matchesStatus = book.ReadStatus === 0 && book.Progress === 0;
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          const dateA = a.DateLastRead ? new Date(a.DateLastRead).getTime() : 0;
          const dateB = b.DateLastRead ? new Date(b.DateLastRead).getTime() : 0;
          return dateB - dateA; // Newest first
        }
        if (sortBy === 'title') {
          return (a.Title || '').localeCompare(b.Title || '');
        }
        if (sortBy === 'progress') {
          return b.Progress - a.Progress; // Highest progress first
        }
        return 0;
      });
  }, [books, searchQuery, statusFilter, sortBy]);

  // Group annotations by volume ID
  const annotationsByBook = useMemo(() => {
    const map = {};
    annotations.forEach((ann) => {
      if (!map[ann.VolumeID]) {
        map[ann.VolumeID] = [];
      }
      map[ann.VolumeID].push(ann);
    });
    return map;
  }, [annotations]);

  const handleCopyAnnotation = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAnnotationId(id);
    setTimeout(() => setCopiedAnnotationId(null), 2000);
  };

  const handleExportAllObsidian = async () => {
    try {
      const blob = await exportToObsidianZip(books, annotationsByBook);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kobo_obsidian_notes_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Export] Obsidian failed:', err);
      alert('Failed to export notes: ' + err.message);
    }
  };

  const handleExportAllAnki = () => {
    try {
      const blob = exportToAnkiCsv(annotations);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kobo_anki_flashcards_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Export] Anki failed:', err);
      alert('Failed to export flashcards: ' + err.message);
    }
  };

  const handleExportBookNotes = (book, bookAnns) => {
    if (!bookAnns || bookAnns.length === 0) return;
    
    let markdown = `# Notes: ${book.Title}\n`;
    markdown += `By ${book.Author}\n\n`;
    markdown += `*Exported from Kobo Backup Manager on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    
    bookAnns.forEach((ann, idx) => {
      markdown += `### Highlight ${idx + 1}\n`;
      if (ann.HighlightedText) markdown += `> ${ann.HighlightedText}\n\n`;
      if (ann.Note) markdown += `**Note:** ${ann.Note}\n\n`;
      if (ann.DateCreated) markdown += `*Date: ${new Date(ann.DateCreated).toLocaleString()}*\n\n`;
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${book.Title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8 bg-kobo-cream min-h-screen">
      <Container className="max-w-7xl">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-kobo-dark">
              Library Dashboard
            </h2>
            <p className="text-kobo-gray font-body mt-1">
              Connected: <span className="font-semibold text-kobo-dark">{device?.model || 'Kobo Device'}</span> (Firmware: {device?.firmwareVersion || 'Unknown'})
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onNavigate('backup')}
            >
              Create Backup
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-kobo-cream-dark mb-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'books'
                ? 'border-kobo-accent text-kobo-accent'
                : 'border-transparent text-kobo-gray hover:text-kobo-dark'
            }`}
          >
            📚 Books ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('annotations')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'annotations'
                ? 'border-kobo-accent text-kobo-accent'
                : 'border-transparent text-kobo-gray hover:text-kobo-dark'
            }`}
          >
            ✍️ Annotations ({annotations.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'border-kobo-accent text-kobo-accent'
                : 'border-transparent text-kobo-gray hover:text-kobo-dark'
            }`}
          >
            📊 Statistics
          </button>
        </div>

        {/* Tab 1: Books */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm">
              <div className="flex-1 max-w-md relative">
                <input
                  type="text"
                  placeholder="Search books or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-kobo-cream-dark rounded-lg focus:ring-2 focus:ring-kobo-accent/50 focus:border-kobo-accent outline-none font-body text-sm"
                />
                <span className="absolute left-3 top-2.5 text-kobo-gray">🔍</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-kobo-cream-dark rounded-lg px-3 py-2 text-sm font-body bg-white outline-none focus:ring-2 focus:ring-kobo-accent/50"
                >
                  <option value="all">All Books</option>
                  <option value="reading">Currently Reading</option>
                  <option value="finished">Finished</option>
                  <option value="unread">Unread</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-kobo-cream-dark rounded-lg px-3 py-2 text-sm font-body bg-white outline-none focus:ring-2 focus:ring-kobo-accent/50"
                >
                  <option value="recent">Recently Read</option>
                  <option value="title">Alphabetical</option>
                  <option value="progress">Reading Progress</option>
                </select>
              </div>
            </div>

            {/* Books Grid */}
            {filteredBooks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-kobo-cream-dark">
                <p className="text-kobo-gray font-body text-lg">No books found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredBooks.map((book) => {
                  const bookAnns = annotationsByBook[book.ContentID] || [];
                  return (
                    <div
                      key={book.ContentID}
                      onClick={() => setSelectedBook(book)}
                      className="group flex flex-col cursor-pointer"
                    >
                      <CoverPreview
                        deviceHandle={deviceHandle}
                        coverId={book.CoverId}
                        title={book.Title}
                        author={book.Author}
                        className="mb-3"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-kobo-dark text-sm leading-tight line-clamp-2 group-hover:text-kobo-accent transition-colors">
                          {book.Title}
                        </h4>
                        <p className="text-xs font-body text-kobo-gray truncate mt-1">
                          {book.Author}
                        </p>
                      </div>
                      
                      {/* Reading Progress Indicator */}
                      <div className="mt-2">
                        <div className="w-full bg-kobo-cream-dark rounded-full h-[6px] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              book.Progress >= 100 ? 'bg-kobo-success' : 'bg-kobo-accent'
                            }`}
                            style={{ width: `${book.Progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-semibold font-body text-kobo-gray mt-1">
                          <span>{book.Progress}% read</span>
                          {bookAnns.length > 0 && (
                            <span className="bg-kobo-accent/10 text-kobo-accent px-1.5 py-0.5 rounded-md">
                              ✍️ {bookAnns.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Annotations */}
        {activeTab === 'annotations' && (
          <div className="space-y-6">
            {annotations.length > 0 && (
              <Card className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-br from-kobo-accent/5 to-kobo-accent/15 border border-kobo-accent/25">
                <div className="text-left">
                  <h4 className="font-display font-bold text-kobo-dark text-lg">
                    🎒 Advanced Notes Exporter
                  </h4>
                  <p className="text-sm font-body text-kobo-gray mt-1">
                    Export all your Highlights & Notes to Obsidian or Anki format.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExportAllObsidian}
                    className="flex justify-center items-center gap-1.5"
                  >
                    <span>Obsidian (ZIP)</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportAllAnki}
                    className="flex justify-center items-center gap-1.5"
                  >
                    <span>Anki (CSV)</span>
                  </Button>
                </div>
              </Card>
            )}

            {annotations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-kobo-cream-dark">
                <span className="text-4xl block mb-2">✍️</span>
                <h3 className="text-xl font-display text-kobo-dark font-semibold">No annotations found</h3>
                <p className="text-kobo-gray font-body mt-1">Make sure you have highlights or notes in your books.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books
                  .filter((b) => (annotationsByBook[b.ContentID] || []).length > 0)
                  .map((book) => {
                    const bookAnns = annotationsByBook[book.ContentID] || [];
                    return (
                      <Card key={book.ContentID} className="flex flex-col h-[400px]">
                        <div className="flex gap-4 pb-4 border-b border-kobo-cream-dark">
                          <div className="w-16 flex-shrink-0">
                            <CoverPreview
                              deviceHandle={deviceHandle}
                              coverId={book.CoverId}
                              title={book.Title}
                              author={book.Author}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display font-bold text-kobo-dark text-base truncate">
                              {book.Title}
                            </h4>
                            <p className="text-sm font-body text-kobo-gray truncate">
                              {book.Author}
                            </p>
                            <span className="inline-block bg-kobo-accent/15 text-kobo-accent text-xs font-semibold px-2 py-0.5 rounded-full mt-2">
                              {bookAnns.length} highlights
                            </span>
                          </div>
                        </div>

                        {/* Scrolling highlights list */}
                        <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1 font-body text-sm text-kobo-dark">
                          {bookAnns.map((ann) => (
                            <div key={ann.BookmarkID} className="bg-kobo-cream/50 p-3 rounded-lg border border-kobo-cream-dark relative group/ann">
                              <p className="italic text-kobo-dark/95 border-l-2 border-kobo-accent pl-3 mb-2 whitespace-pre-line">
                                {ann.HighlightedText}
                              </p>
                              {ann.Note && (
                                <div className="mt-2 bg-white/70 p-2 rounded border border-kobo-cream-dark/50">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-kobo-accent block mb-1">My Note</span>
                                  <p className="text-xs">{ann.Note}</p>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-[10px] text-kobo-gray mt-2">
                                <span>{ann.DateCreated ? new Date(ann.DateCreated).toLocaleDateString() : ''}</span>
                                <button
                                  onClick={() => handleCopyAnnotation(ann.HighlightedText, ann.BookmarkID)}
                                  className="opacity-0 group-hover/ann:opacity-100 transition-opacity hover:text-kobo-accent font-semibold flex items-center gap-1"
                                >
                                  {copiedAnnotationId === ann.BookmarkID ? 'Copied! ✓' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-kobo-cream-dark flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBook(book)}
                          >
                            View Book Details
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleExportBookNotes(book, bookAnns)}
                          >
                            Export MD
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Statistics */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary statistics */}
            <Card className="col-span-1 md:col-span-3">
              <h3 className="text-xl font-display font-semibold text-kobo-dark mb-6">Reading Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-4 bg-kobo-cream rounded-xl">
                  <span className="text-3xl block mb-1">🕒</span>
                  <span className="text-sm text-kobo-gray font-body block mb-1">Time Spent Reading</span>
                  <span className="text-2xl font-display font-bold text-kobo-dark">
                    {stats ? formatDuration(stats.totalMinutesRead) : '0 mins'}
                  </span>
                </div>
                <div className="p-4 bg-kobo-cream rounded-xl">
                  <span className="text-3xl block mb-1">📚</span>
                  <span className="text-sm text-kobo-gray font-body block mb-1">Books Added</span>
                  <span className="text-2xl font-display font-bold text-kobo-dark">{books.length}</span>
                </div>
                <div className="p-4 bg-kobo-cream rounded-xl">
                  <span className="text-3xl block mb-1">✅</span>
                  <span className="text-sm text-kobo-gray font-body block mb-1">Books Finished</span>
                  <span className="text-2xl font-display font-bold text-kobo-dark">{stats?.booksFinished || 0}</span>
                </div>
                <div className="p-4 bg-kobo-cream rounded-xl">
                  <span className="text-3xl block mb-1">✍️</span>
                  <span className="text-sm text-kobo-gray font-body block mb-1">Total Highlights</span>
                  <span className="text-2xl font-display font-bold text-kobo-dark">{annotations.length}</span>
                </div>
              </div>
            </Card>

            {/* Reading progress breakdown */}
            <Card>
              <h4 className="text-lg font-display font-semibold text-kobo-dark mb-4">Reading Progress</h4>
              <div className="space-y-4 font-body">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-kobo-gray">
                    <span>Finished (100%)</span>
                    <span className="font-semibold text-kobo-dark">
                      {books.filter((b) => b.Progress >= 100).length} books
                    </span>
                  </div>
                  <div className="w-full bg-kobo-cream-dark h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-kobo-success h-full"
                      style={{
                        width: `${
                          books.length > 0
                            ? (books.filter((b) => b.Progress >= 100).length / books.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 text-kobo-gray">
                    <span>In Progress (1-99%)</span>
                    <span className="font-semibold text-kobo-dark">
                      {books.filter((b) => b.Progress > 0 && b.Progress < 100).length} books
                    </span>
                  </div>
                  <div className="w-full bg-kobo-cream-dark h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-kobo-accent h-full"
                      style={{
                        width: `${
                          books.length > 0
                            ? (books.filter((b) => b.Progress > 0 && b.Progress < 100).length /
                                books.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1 text-kobo-gray">
                    <span>Unread (0%)</span>
                    <span className="font-semibold text-kobo-dark">
                      {books.filter((b) => b.Progress === 0).length} books
                    </span>
                  </div>
                  <div className="w-full bg-kobo-cream-dark h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-kobo-gray h-full opacity-40"
                      style={{
                        width: `${
                          books.length > 0
                            ? (books.filter((b) => b.Progress === 0).length / books.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Reading speeds or time spent details */}
            <Card className="col-span-1 md:col-span-2">
              <h4 className="text-lg font-display font-semibold text-kobo-dark mb-4">Top Authors</h4>
              <div className="space-y-3 font-body">
                {Object.entries(
                  books.reduce((acc, book) => {
                    const author = book.Author || 'Unknown';
                    acc[author] = (acc[author] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([author, count]) => (
                    <div key={author} className="flex justify-between items-center bg-kobo-cream/50 p-2.5 rounded-lg border border-kobo-cream-dark/50">
                      <span className="font-semibold text-kobo-dark text-sm">{author}</span>
                      <span className="bg-kobo-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {count} {count === 1 ? 'book' : 'books'}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}
      </Container>

      {/* Book details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-kobo-cream-dark bg-kobo-cream/30">
              <h3 className="text-xl font-display font-bold text-kobo-dark truncate max-w-[85%]">
                Book Details
              </h3>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-kobo-gray hover:text-kobo-dark p-1.5 rounded-full hover:bg-kobo-cream-dark transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 font-body">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover and Progress */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="w-40 mb-4">
                    <CoverPreview
                      deviceHandle={deviceHandle}
                      coverId={selectedBook.CoverId}
                      title={selectedBook.Title}
                      author={selectedBook.Author}
                    />
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full text-center">
                    <span className="text-2xl font-display font-bold text-kobo-accent">
                      {selectedBook.Progress}%
                    </span>
                    <span className="text-xs text-kobo-gray block mb-2">Reading Progress</span>
                    <div className="w-full bg-kobo-cream-dark h-[8px] rounded-full overflow-hidden">
                      <div
                        className="bg-kobo-accent h-full rounded-full"
                        style={{ width: `${selectedBook.Progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-kobo-dark leading-tight">
                      {selectedBook.Title}
                    </h2>
                    <p className="text-lg text-kobo-gray font-medium mt-1">
                      {selectedBook.Author}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm bg-kobo-cream/30 p-4 rounded-xl border border-kobo-cream-dark/55">
                    <div>
                      <span className="text-xs text-kobo-gray block">Time Spent Reading</span>
                      <span className="font-semibold text-kobo-dark">
                        {formatDuration(selectedBook.TimeSpentReading)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-kobo-gray block">Format / File Type</span>
                      <span className="font-semibold text-kobo-dark uppercase">
                        {selectedBook.MimeType?.split('/').pop() || 'EPUB'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-kobo-gray block">ISBN</span>
                      <span className="font-semibold text-kobo-dark">
                        {selectedBook.ISBN || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-kobo-gray block">Publisher</span>
                      <span className="font-semibold text-kobo-dark truncate">
                        {selectedBook.Publisher || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Highlights section inside book details modal */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-base font-display font-semibold text-kobo-dark">
                        Highlights & Notes ({ (annotationsByBook[selectedBook.ContentID] || []).length })
                      </h4>
                      {(annotationsByBook[selectedBook.ContentID] || []).length > 0 && (
                        <button
                          onClick={() =>
                            handleExportBookNotes(
                              selectedBook,
                              annotationsByBook[selectedBook.ContentID]
                            )
                          }
                          className="text-xs text-kobo-accent hover:underline font-semibold"
                        >
                          Export to MD
                        </button>
                      )}
                    </div>

                    {(annotationsByBook[selectedBook.ContentID] || []).length === 0 ? (
                      <p className="text-sm text-kobo-gray italic bg-kobo-cream/10 p-3 rounded-lg border border-dashed border-kobo-cream-dark/80">
                        No highlights or notes for this book yet.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {(annotationsByBook[selectedBook.ContentID] || []).map((ann) => (
                          <div
                            key={ann.BookmarkID}
                            className="bg-kobo-cream/40 p-3 rounded-lg border border-kobo-cream-dark/40 relative group/modal-ann"
                          >
                            <p className="text-xs italic text-kobo-dark/95 border-l-2 border-kobo-accent pl-2 whitespace-pre-line">
                              {ann.HighlightedText}
                            </p>
                            {ann.Note && (
                              <div className="mt-2 bg-white/70 p-2 rounded border border-kobo-cream-dark/50">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-kobo-accent block mb-0.5">My Note</span>
                                <p className="text-xs">{ann.Note}</p>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[9px] text-kobo-gray mt-1.5">
                              <span>{ann.DateCreated ? new Date(ann.DateCreated).toLocaleDateString() : ''}</span>
                              <button
                                onClick={() => handleCopyAnnotation(ann.HighlightedText, ann.BookmarkID)}
                                className="opacity-0 group-hover/modal-ann:opacity-100 transition-opacity hover:text-kobo-accent font-semibold"
                              >
                                {copiedAnnotationId === ann.BookmarkID ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-kobo-cream-dark bg-kobo-cream/20 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setSelectedBook(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
