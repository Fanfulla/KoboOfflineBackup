/**
 * Book list - displays grid of books with search and filter
 */

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { BookCard } from './BookCard.jsx';
import { Icon } from '../common/Icon.jsx';
import { Button } from '../common/Button.jsx';

export function BookList({ books, maxDisplay = 6, showSearch = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, reading, finished, unread
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter and search books
  const filteredBooks = useMemo(() => {
    let filtered = [...books];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          (book.author && book.author.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filterStatus === 'reading') {
      filtered = filtered.filter((book) => book.progress > 0 && book.progress < 100);
    } else if (filterStatus === 'finished') {
      filtered = filtered.filter((book) => book.progress === 100);
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter((book) => !book.progress || book.progress === 0);
    }

    return filtered;
  }, [books, searchQuery, filterStatus]);

  // Paginate books
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // For limited display (e.g., in preview)
  const displayBooks = maxDisplay ? filteredBooks.slice(0, maxDisplay) : paginatedBooks;

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-kobo-gray-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon type="book" size={48} className="text-kobo-gray-light" />
        </div>
        <p className="font-body text-kobo-gray">No books found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter */}
      {showSearch && (
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full px-4 py-3 pl-10 bg-white border-2 border-kobo-cream-dark rounded-lg focus:outline-none focus:border-kobo-accent transition-colors"
            />
            <Icon
              type="search"
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-kobo-gray-light"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filterStatus === 'all'}
              onClick={() => {
                setFilterStatus('all');
                setCurrentPage(1);
              }}
            >
              All ({books.length})
            </FilterButton>
            <FilterButton
              active={filterStatus === 'reading'}
              onClick={() => {
                setFilterStatus('reading');
                setCurrentPage(1);
              }}
            >
              Reading ({books.filter((b) => b.progress > 0 && b.progress < 100).length})
            </FilterButton>
            <FilterButton
              active={filterStatus === 'finished'}
              onClick={() => {
                setFilterStatus('finished');
                setCurrentPage(1);
              }}
            >
              Finished ({books.filter((b) => b.progress === 100).length})
            </FilterButton>
            <FilterButton
              active={filterStatus === 'unread'}
              onClick={() => {
                setFilterStatus('unread');
                setCurrentPage(1);
              }}
            >
              Unread ({books.filter((b) => !b.progress || b.progress === 0).length})
            </FilterButton>
          </div>
        </div>
      )}

      {/* Results Count */}
      {filteredBooks.length > 0 && (
        <p className="text-sm font-body text-kobo-gray mb-4">
          Showing {displayBooks.length} of {filteredBooks.length} book
          {filteredBooks.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-kobo-gray">No books match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {displayBooks.map((book, index) => (
            <BookCard key={book.id || index} book={book} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!maxDisplay && totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-kobo-accent text-white'
                    : 'bg-white text-kobo-dark hover:bg-kobo-cream-dark'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium font-body text-sm transition-colors ${
        active
          ? 'bg-kobo-accent text-white'
          : 'bg-white text-kobo-dark border-2 border-kobo-cream-dark hover:border-kobo-accent'
      }`}
    >
      {children}
    </button>
  );
}

FilterButton.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

BookList.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      author: PropTypes.string,
      progress: PropTypes.number,
      coverUrl: PropTypes.string,
    })
  ).isRequired,
  maxDisplay: PropTypes.number,
  showSearch: PropTypes.bool,
};
