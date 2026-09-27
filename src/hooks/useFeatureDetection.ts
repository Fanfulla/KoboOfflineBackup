import { useSyncExternalStore } from 'react';

export interface BrowserFeatures {
  fileSystemAccess: boolean;
  saveFilePicker: boolean;
  webAssembly: boolean;
  isSupported: boolean;
  hasModernFeatures: boolean;
}

// Optimistic during prerender/hydration (most visitors use Chromium); the real
// values are applied right after hydration.
const SERVER_FEATURES: BrowserFeatures = {
  fileSystemAccess: true,
  saveFilePicker: true,
  webAssembly: true,
  isSupported: true,
  hasModernFeatures: true,
};

let cached: BrowserFeatures | null = null;

function detect(): BrowserFeatures {
  if (cached) return cached;
  const fileSystemAccess = 'showDirectoryPicker' in window;
  const webAssembly = typeof WebAssembly !== 'undefined';
  cached = {
    fileSystemAccess,
    saveFilePicker: 'showSaveFilePicker' in window,
    webAssembly,
    isSupported: webAssembly && typeof Blob !== 'undefined',
    hasModernFeatures: fileSystemAccess,
  };
  return cached;
}

const noopSubscribe = () => () => {};

/** Browser capability detection (stable, SSR-safe). */
export function useFeatureDetection(): BrowserFeatures {
  return useSyncExternalStore(noopSubscribe, detect, () => SERVER_FEATURES);
}
