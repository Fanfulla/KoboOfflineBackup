/**
 * Hook to detect browser feature support
 */

import { useState, useEffect } from 'react';

/**
 * Detect browser features and capabilities
 * @returns {object} Feature detection results
 */
export function useFeatureDetection() {
  const [features, setFeatures] = useState({
    fileSystemAccess: false,
    fileReader: false,
    webAssembly: false,
    serviceWorker: false,
    blob: false,
    loading: true,
  });

  useEffect(() => {
    const detectFeatures = () => {
      const detected = {
        fileSystemAccess: 'showDirectoryPicker' in window,
        fileReader: 'FileReader' in window,
        webAssembly: typeof WebAssembly !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        blob: typeof Blob !== 'undefined',
        loading: false,
      };

      setFeatures(detected);
    };

    detectFeatures();
  }, []);

  // Check if all critical features are supported
  const isSupported =
    features.fileReader &&
    features.webAssembly &&
    features.blob;

  // Check if modern features are supported
  const hasModernFeatures = features.fileSystemAccess;

  return {
    ...features,
    isSupported,
    hasModernFeatures,
  };
}
