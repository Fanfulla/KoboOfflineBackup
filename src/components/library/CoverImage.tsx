import { useEffect, useRef, useState } from 'react';
import { getCoverUrl } from '../../utils/koboCovers.ts';
import type { KoboSource } from '../../utils/deviceSource.ts';

/** Deterministic colors per title for the generated placeholder cover. */
function bookColors(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (title.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  const hue = Math.abs(hash % 360);
  const saturation = 45 + Math.abs((hash >> 8) % 25);
  const lightness = 25 + Math.abs((hash >> 16) % 20);
  return {
    bg: `hsl(${hue} ${saturation}% ${lightness}%)`,
    bgLight: `hsl(${hue} ${saturation}% ${lightness + 15}%)`,
    accent: `hsl(${(hue + 40) % 360} ${saturation + 10}% 80%)`,
  };
}

interface CoverImageProps {
  source: KoboSource | null;
  coverId: string | null;
  title: string;
  author: string;
  className?: string;
}

/**
 * Real Kobo thumbnail when available, loaded only once the cover scrolls into
 * view (hundreds of books otherwise mean thousands of file lookups).
 */
export function CoverImage({ source, coverId, title, author, className = '' }: CoverImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !source || !coverId) return;
    let active = true;
    let created: string | null = null;
    getCoverUrl(source, coverId)
      .then((u) => {
        created = u;
        if (active) setUrl(u);
        else if (u) URL.revokeObjectURL(u);
      })
      .catch(() => {});
    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [visible, source, coverId]);

  const colors = bookColors(title);
  const frame = `relative aspect-3/4 overflow-hidden rounded-md shadow-md ${className}`;

  return (
    <div
      ref={ref}
      className={frame}
      style={url ? undefined : { background: `linear-gradient(135deg, ${colors.bgLight}, ${colors.bg})` }}
    >
      <div className="absolute left-0 top-0 z-10 h-full w-1 bg-black/25" aria-hidden="true" />
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" decoding="async" />
      ) : (
        <div
          className="absolute inset-0 flex flex-col justify-center p-3 text-left text-white"
          aria-hidden="true"
        >
          <span className="mb-2 line-clamp-3 font-display text-sm font-bold leading-tight">{title}</span>
          <span className="line-clamp-2 text-xs uppercase tracking-wider" style={{ color: colors.accent }}>
            {author}
          </span>
        </div>
      )}
    </div>
  );
}
