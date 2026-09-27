import { useId, useRef } from 'react';
import { useI18n } from '../../i18n/core.ts';
import { useFeatureDetection } from '../../hooks/useFeatureDetection.ts';
import type { useDevice } from '../../hooks/useDevice.ts';
import { Button } from '../common/Button.tsx';
import { Card } from '../common/Card.tsx';
import { Icon } from '../common/Icon.tsx';
import { ErrorAlert } from '../common/Alert.tsx';
import { ProgressBar } from '../common/ProgressBar.tsx';

type Device = ReturnType<typeof useDevice>;

/** Instructions + picker (File System Access) or folder input fallback. */
export function ConnectDevice({ device }: { device: Device }) {
  const { m } = useI18n();
  const features = useFeatureDetection();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  if (device.status === 'scanning') return <ScanProgress step={device.step} />;

  return (
    <Card className="mx-auto max-w-4xl text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-kobo-accent/15">
        <Icon type="device" size={32} className="text-kobo-accent-ink" />
      </div>
      <h2 className="mb-2 text-3xl text-kobo-dark">{m.connect.title}</h2>
      <p className="mb-8 text-lg text-kobo-gray">{m.connect.subtitle}</p>

      <ol className="mb-8 grid grid-cols-1 gap-4 text-left md:grid-cols-3">
        {m.connect.steps.map((step, i) => (
          <li key={step.title} className="rounded-lg bg-kobo-cream-dark p-4">
            <span
              className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-kobo-accent font-bold text-kobo-dark"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <h3 className="mb-1 text-lg text-kobo-dark">{step.title}</h3>
            <p className="text-sm text-kobo-gray">{step.body}</p>
          </li>
        ))}
      </ol>

      {device.error && (
        <div className="mb-6">
          <ErrorAlert error={device.error} />
        </div>
      )}

      {features.fileSystemAccess ? (
        <Button size="lg" onClick={device.connectWithPicker} loading={device.status === 'selecting'}>
          <Icon type="folder" />
          {device.status === 'selecting' ? m.connect.selecting : m.connect.selectButton}
        </Button>
      ) : (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="sr-only"
            {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
            onChange={(e) => {
              if (e.target.files) void device.connectWithFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <Button size="lg" onClick={() => inputRef.current?.click()} aria-describedby={`${inputId}-hint`}>
            <Icon type="folder" />
            {m.connect.folderButton}
          </Button>
          <p id={`${inputId}-hint`} className="mx-auto mt-3 max-w-xl text-sm text-kobo-gray">
            {m.connect.folderHint}
          </p>
        </>
      )}
      <p className="mt-4 text-sm text-kobo-gray">{m.connect.driveHint}</p>
    </Card>
  );
}

export function ScanProgress({ step }: { step: number }) {
  const { m } = useI18n();
  const total = m.scanning.steps.length;
  return (
    <Card className="mx-auto max-w-2xl text-center">
      <div
        className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-8 border-kobo-cream-dark border-t-kobo-accent"
        aria-hidden="true"
      />
      <h2 className="mb-2 text-2xl text-kobo-dark">{m.scanning.title}</h2>
      <p className="mb-6 text-kobo-gray" role="status" aria-live="polite">
        {m.scanning.steps[Math.max(0, step - 1)] ?? m.common.loading}
      </p>
      <ProgressBar percent={(step / total) * 100} label={m.scanning.title} className="mb-6" />
      <p className="text-sm text-kobo-gray">{m.scanning.hint}</p>
    </Card>
  );
}
