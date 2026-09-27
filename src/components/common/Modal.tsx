import { useEffect, useRef, type ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Accessible label when no visible title is rendered. */
  ariaLabel?: string;
  closeLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

/**
 * Accessible modal built on the native <dialog> element: focus trapping,
 * Escape-to-close and inert background come for free.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  ariaLabel,
  closeLabel = 'Close',
  size = 'md',
  className = '',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Clicking the ::backdrop targets the <dialog> element itself.
    const onBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog) onClose();
    };
    dialog.addEventListener('click', onBackdropClick);
    return () => dialog.removeEventListener('click', onBackdropClick);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-label={title ? undefined : ariaLabel}
      aria-labelledby={title ? 'modal-title' : undefined}
      className={`w-full ${SIZES[size]} m-auto max-h-[90vh] rounded-2xl bg-white p-0 shadow-elevated-hover backdrop:bg-kobo-overlay backdrop:backdrop-blur-xs open:animate-fade-in ${className}`}
    >
      {isOpen && (
        <div className="p-6 sm:p-8">
          {title && (
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="modal-title" className="text-xl font-display font-bold text-kobo-dark">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-kobo-gray-light/20 rounded-lg transition-colors focus-visible-ring"
                aria-label={closeLabel}
              >
                <svg
                  className="w-6 h-6 text-kobo-gray"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}
