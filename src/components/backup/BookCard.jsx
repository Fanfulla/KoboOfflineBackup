/**
 * Book card - displays individual book with cover, title, author, and progress
 */

import PropTypes from 'prop-types';
import { Icon } from '../common/Icon.jsx';
import { ProgressBar } from '../common/ProgressBar.jsx';

export function BookCard({ book, variant = 'default' }) {
  const { title, author, progress = 0, coverUrl } = book;

  if (variant === 'compact') {
    return (
      <div className="flex gap-3 p-3 bg-white rounded-lg border border-kobo-cream-dark hover:shadow-md transition-shadow">
        {/* Book Cover */}
        <div className="w-12 h-16 bg-gradient-to-br from-kobo-accent-light to-kobo-accent rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <Icon type="book" size={20} className="text-white" />
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold font-body text-kobo-dark text-sm truncate mb-0.5">
            {title}
          </h4>
          <p className="text-xs font-body text-kobo-gray truncate mb-2">{author}</p>

          {/* Progress */}
          {progress > 0 && (
            <div className="flex items-center gap-2">
              <ProgressBar percent={progress} height={4} />
              <span className="text-xs font-body text-kobo-gray font-medium whitespace-nowrap">
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-xl border-2 border-kobo-cream-dark hover:border-kobo-accent transition-all hover:shadow-lg overflow-hidden">
      {/* Book Cover */}
      <div className="aspect-[2/3] bg-gradient-to-br from-kobo-accent-light to-kobo-accent flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <Icon type="book" size={48} className="text-white opacity-75" />
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="text-lg font-body text-kobo-dark mb-1 line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>
        <p className="text-sm font-body text-kobo-gray mb-3 truncate">{author}</p>

        {/* Progress Bar */}
        {progress > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-body text-kobo-gray">Reading Progress</span>
              <span className="text-xs font-body font-semibold text-kobo-accent">
                {Math.round(progress)}%
              </span>
            </div>
            <ProgressBar percent={progress} />
          </div>
        )}

        {progress === 0 && (
          <div className="flex items-center gap-1 text-xs font-body text-kobo-gray">
            <Icon type="bookmark" size={14} />
            <span>Not started</span>
          </div>
        )}

        {progress === 100 && (
          <div className="flex items-center gap-1 text-xs font-body text-kobo-success font-medium">
            <Icon type="check" size={14} />
            <span>Finished</span>
          </div>
        )}
      </div>
    </div>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string,
    progress: PropTypes.number,
    coverUrl: PropTypes.string,
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'compact']),
};
