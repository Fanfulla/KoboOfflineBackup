import { useI18n } from '../i18n/core.ts';
import { useFeatureDetection } from '../hooks/useFeatureDetection.ts';
import { useLocalFlag } from '../hooks/useLocalFlag.ts';
import { Icon } from './common/Icon.tsx';

/** Explains what works in browsers without the File System Access API. */
export function BrowserNotice() {
  const { m } = useI18n();
  const features = useFeatureDetection();
  const [dismissed, dismiss] = useLocalFlag('browser_notice_dismissed');

  if (!features.isSupported) {
    return (
      <div role="alert" className="bg-kobo-error/10 px-4 py-4 text-center text-sm text-kobo-dark">
        <strong className="font-semibold">{m.browser.unsupportedTitle}.</strong> {m.browser.unsupportedBody}
      </div>
    );
  }
  if (features.fileSystemAccess || dismissed) return null;

  return (
    <div className="border-b border-kobo-warning/40 bg-kobo-warning/15">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Icon type="info" className="mt-0.5 shrink-0 text-kobo-dark" />
        <p className="flex-1 text-sm text-kobo-dark">
          <strong className="font-semibold">{m.browser.limitedTitle}.</strong> {m.browser.limitedBody}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="rounded p-1 hover:bg-kobo-warning/30 focus-visible-ring"
          aria-label={m.browser.dismiss}
        >
          <Icon type="x" className="text-kobo-dark" />
        </button>
      </div>
    </div>
  );
}
