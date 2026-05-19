import { useState, useEffect } from 'react';
import { getCoverUrl } from '../../utils/koboCovers.js';

// Simple hash function to generate consistent color palettes per book title
function getBookColors(title = '') {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 45 + Math.abs((hash >> 8) % 25); // 45% - 70%
  const lightness = 25 + Math.abs((hash >> 16) % 20); // 25% - 45% (sleek dark colors)
  
  return {
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    bgLight: `hsl(${hue}, ${saturation}%, ${lightness + 15}%)`,
    accent: `hsl(${(hue + 40) % 360}, ${saturation + 10}%, 75%)`,
    text: '#ffffff',
  };
}

export function CoverPreview({ deviceHandle, coverId, title = 'Untitled', author = 'Unknown', className = '' }) {
  const [coverUrl, setCoverUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const colors = getBookColors(title);

  useEffect(() => {
    let active = true;
    let url = null;

    async function loadCover() {
      if (!deviceHandle || !coverId) {
        setLoading(false);
        return;
      }
      
      try {
        url = await getCoverUrl(deviceHandle, coverId);
        if (active) {
          setCoverUrl(url);
        }
      } catch (err) {
        console.error('[CoverPreview] Failed to load cover:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCover();

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [deviceHandle, coverId]);

  const wrapperClass = `relative aspect-[3/4] rounded-md shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.03] select-none ${className}`;

  if (coverUrl && !loading) {
    return (
      <div className={wrapperClass}>
        {/* Real book spine effect */}
        <div className="absolute top-0 left-0 w-[4px] h-full bg-black/25 z-10" />
        <div className="absolute top-0 left-[4px] w-[2px] h-full bg-white/10 z-10" />
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Soft overlay shadow to look like a book */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 mix-blend-multiply pointer-events-none" />
      </div>
    );
  }

  // Beautiful SVG generated cover fallback
  return (
    <div
      className={wrapperClass}
      style={{
        background: `linear-gradient(135deg, ${colors.bgLight} 0%, ${colors.bg} 100%)`
      }}
    >
      {/* Book spine elements */}
      <div className="absolute top-0 left-0 w-[6px] h-full bg-black/20 z-10" />
      <div className="absolute top-0 left-[6px] w-[2px] h-full bg-white/10 z-10" />
      
      <div className="absolute inset-0 flex flex-col justify-between p-4 z-0 text-left select-none text-white">
        {/* Decorative elements */}
        <div className="h-[2px] w-12 rounded-full" style={{ backgroundColor: colors.accent }} />
        
        {/* Typography */}
        <div className="flex-grow flex flex-col justify-center my-4 overflow-hidden">
          <h4 className="font-display font-bold text-sm sm:text-base leading-tight tracking-wide line-clamp-3 mb-2">
            {title}
          </h4>
          <span 
            className="text-xs font-semibold tracking-wider uppercase opacity-75 line-clamp-2"
            style={{ color: colors.accent }}
          >
            {author}
          </span>
        </div>
        
        {/* Bottom decorative bar */}
        <div className="flex justify-between items-center text-[10px] opacity-50 uppercase tracking-widest font-mono">
          <span>Kobo Edition</span>
          <span>●</span>
        </div>
      </div>
      
      {/* Real book shadow overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10 mix-blend-multiply pointer-events-none" />
    </div>
  );
}
