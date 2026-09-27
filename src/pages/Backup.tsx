import { useId, useState } from 'react';
import { useI18n } from '../i18n/core.ts';
import { Link } from '../router/Router.tsx';
import { useDevice } from '../hooks/useDevice.ts';
import { useBackup } from '../hooks/useBackup.ts';
import { useFeatureDetection } from '../hooks/useFeatureDetection.ts';
import { newBackupId, useKoboStore } from '../stores/koboStore.ts';
import { saveBackupHandle } from '../utils/handleStore.ts';
import { estimateBackupSize, generateBackupFilename } from '../utils/backupInfo.ts';
import { Container } from '../components/layout/Container.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { Stepper } from '../components/common/Stepper.tsx';
import { Card } from '../components/common/Card.tsx';
import { Button } from '../components/common/Button.tsx';
import { Checkbox } from '../components/common/Checkbox.tsx';
import { Icon, type IconType } from '../components/common/Icon.tsx';
import { Alert, ErrorAlert } from '../components/common/Alert.tsx';
import { CircularProgress } from '../components/common/CircularProgress.tsx';
import { ConnectDevice } from '../components/device/ConnectDevice.tsx';
import type { BackupOptions, ScanResult } from '../types/kobo.ts';

type Step = 'overview' | 'options' | 'run';

const MIN_PASSWORD = 8;

export function Backup() {
  const { m } = useI18n();
  const device = useDevice();
  const [step, setStep] = useState<Step>('overview');
  const scan = device.scan;

  const stepIndex = !scan ? 0 : step === 'overview' ? 1 : step === 'options' ? 2 : 3;

  return (
    <Container className="max-w-5xl py-12">
      <PageHeader title={m.backup.title} />
      <Stepper steps={m.backup.stepLabels} current={stepIndex} />
      {!scan ? (
        <ConnectDevice device={device} />
      ) : step === 'overview' ? (
        <Overview scan={scan} onContinue={() => setStep('options')} onDisconnect={device.disconnect} />
      ) : (
        <BackupFlow
          scan={scan}
          step={step}
          setStep={setStep}
          onAnother={() => {
            device.disconnect();
            setStep('overview');
          }}
        />
      )}
    </Container>
  );
}

function Stat({ icon, label, value }: { icon: IconType; label: string; value: string | number }) {
  return (
    <Card className="text-center">
      <Icon type={icon} size={28} className="mx-auto mb-2 text-kobo-accent-ink" />
      <p className="font-display text-2xl text-kobo-dark">{value}</p>
      <p className="text-sm text-kobo-gray">{label}</p>
    </Card>
  );
}

function Overview({
  scan,
  onContinue,
  onDisconnect,
}: {
  scan: ScanResult;
  onContinue: () => void;
  onDisconnect: () => void;
}) {
  const { m, fmt, plural, formatBytes, formatDuration, formatNumber } = useI18n();
  const s = m.backup.stats;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-1 text-3xl text-kobo-dark">{m.backup.overviewTitle}</h2>
        <p className="text-kobo-gray">{fmt(m.backup.overviewSubtitle, { model: scan.deviceInfo.model })}</p>
      </div>

      {scan.warnings.includes('wal-pending') && <Alert tone="warning">{m.warnings.walPending}</Alert>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon="book" label={s.books} value={formatNumber(scan.books.length)} />
        <Stat icon="note" label={s.annotations} value={formatNumber(scan.annotations.length)} />
        <Stat icon="storage" label={s.size} value={formatBytes(estimateBackupSize(scan))} />
        <Stat icon="chart" label={s.finished} value={formatNumber(scan.stats.booksFinished)} />
      </div>

      <Card>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            [s.started, formatNumber(scan.stats.booksStarted)],
            [s.reading, formatNumber(scan.stats.currentlyReading)],
            [s.timeRead, formatDuration(scan.stats.totalMinutesRead)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-kobo-gray">{label}</dt>
              <dd className="font-display text-2xl text-kobo-dark">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {scan.books.length > 0 && (
        <Card>
          <h3 className="mb-4 text-xl text-kobo-dark">{m.backup.recent}</h3>
          <ul className="space-y-2">
            {scan.books.slice(0, 5).map((book) => (
              <li key={book.ContentID} className="flex items-center gap-4 rounded-lg bg-kobo-cream-dark p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-kobo-dark">{book.Title}</p>
                  <p className="truncate text-sm text-kobo-gray">{book.Author}</p>
                </div>
                <span className="text-sm font-semibold text-kobo-accent-ink">
                  {fmt(m.library.read, { percent: book.Progress })}
                </span>
              </li>
            ))}
          </ul>
          {scan.books.length > 5 && (
            <p className="mt-3 text-center text-sm text-kobo-gray">
              {plural(m.backup.more, scan.books.length - 5)}
            </p>
          )}
        </Card>
      )}

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" onClick={onContinue}>
          {m.backup.toOptions}
        </Button>
        <Button size="lg" variant="ghost" onClick={onDisconnect}>
          {m.connect.disconnect}
        </Button>
      </div>
    </div>
  );
}

function BackupFlow({
  scan,
  step,
  setStep,
  onAnother,
}: {
  scan: ScanResult;
  step: Step;
  setStep: (s: Step) => void;
  onAnother: () => void;
}) {
  const { m, fmt, formatBytes } = useI18n();
  const features = useFeatureDetection();
  const addBackup = useKoboStore((s) => s.addBackup);
  const backup = useBackup();
  const pwId = useId();

  const [options, setOptions] = useState<Omit<BackupOptions, 'includeProgress'>>({
    includeBooks: true,
    includeAnnotations: true,
    includeSettings: scan.extraFiles.length > 0,
  });
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);

  const passwordError = !encrypt
    ? null
    : password.length < MIN_PASSWORD
      ? m.backup.passwordTooShort
      : password !== confirm
        ? m.backup.passwordMismatch
        : null;

  const start = async () => {
    setTouched(true);
    if (passwordError) return;
    const suggestedFilename = generateBackupFilename();

    // showSaveFilePicker must run inside the click (user gesture), before other awaits.
    let handle: FileSystemFileHandle | null = null;
    if (features.saveFilePicker && 'showSaveFilePicker' in window) {
      try {
        handle = await window.showSaveFilePicker({
          suggestedName: suggestedFilename,
          startIn: 'downloads',
          types: [{ description: 'KoBup backup', accept: { 'application/zip': ['.zip'] } }],
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.warn('[BACKUP] showSaveFilePicker failed, using in-memory download:', err);
      }
    }

    setStep('run');
    const result = await backup.create(scan, {
      ...options,
      includeProgress: true,
      password: encrypt ? password : undefined,
      writableFileHandle: handle,
      suggestedFilename: handle?.name ?? suggestedFilename,
    });
    if (!result) return;

    const id = newBackupId();
    const hasHandle = handle ? await saveBackupHandle(id, handle) : false;
    addBackup({
      id,
      filename: result.filename,
      created: new Date().toISOString(),
      size: result.size,
      deviceModel: scan.deviceInfo.model,
      bookCount: scan.books.length,
      annotationCount: scan.annotations.length,
      encrypted: encrypt,
      hasHandle,
      verified: result.verification?.ok ?? undefined,
    });
  };

  if (step === 'options') {
    const size = estimateBackupSize(scan, options);
    return (
      <Card className="mx-auto max-w-2xl">
        <h2 className="mb-2 text-center text-3xl text-kobo-dark">{m.backup.optionsTitle}</h2>
        <p className="mb-8 text-center text-kobo-gray">{m.backup.optionsSubtitle}</p>

        <fieldset className="mb-8 space-y-4">
          <legend className="sr-only">{m.backup.optionsTitle}</legend>
          <Checkbox
            checked={options.includeBooks}
            onChange={(v) => setOptions({ ...options, includeBooks: v })}
            label={fmt(m.backup.includeBooks, { count: scan.bookFiles.length })}
            sublabel={m.backup.includeBooksHint}
          />
          <Checkbox
            checked={options.includeAnnotations}
            onChange={(v) => setOptions({ ...options, includeAnnotations: v })}
            label={m.backup.includeAnnotations}
            sublabel={m.backup.includeAnnotationsHint}
            disabled={scan.annotations.length === 0}
          />
          <Checkbox
            checked={options.includeSettings}
            onChange={(v) => setOptions({ ...options, includeSettings: v })}
            label={fmt(m.backup.includeSettings, { count: scan.extraFiles.length })}
            sublabel={m.backup.includeSettingsHint}
            disabled={scan.extraFiles.length === 0}
          />
        </fieldset>

        <fieldset className="mb-8 rounded-lg border border-kobo-cream-dark p-4">
          <legend className="sr-only">{m.backup.encryptTitle}</legend>
          <Checkbox
            checked={encrypt}
            onChange={setEncrypt}
            label={m.backup.encryptTitle}
            sublabel={m.backup.encryptHint}
          />
          {encrypt && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-kobo-dark">
                {m.backup.password}
                <input
                  id={pwId}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={touched && !!passwordError}
                  aria-describedby={`${pwId}-error`}
                  className="mt-1 w-full rounded-lg border border-kobo-gray-light px-3 py-2 focus:border-kobo-accent focus:outline-hidden focus:ring-2 focus:ring-kobo-accent/50"
                />
              </label>
              <label className="block text-sm font-medium text-kobo-dark">
                {m.backup.passwordConfirm}
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={touched && !!passwordError}
                  aria-describedby={`${pwId}-error`}
                  className="mt-1 w-full rounded-lg border border-kobo-gray-light px-3 py-2 focus:border-kobo-accent focus:outline-hidden focus:ring-2 focus:ring-kobo-accent/50"
                />
              </label>
              <p
                id={`${pwId}-error`}
                className="text-sm text-kobo-error sm:col-span-2"
                role={touched && passwordError ? 'alert' : undefined}
              >
                {touched ? passwordError : null}
              </p>
            </div>
          )}
        </fieldset>

        <Alert tone="info" className="mb-8">
          <p className="font-semibold">{fmt(m.backup.estimated, { size: formatBytes(size) })}</p>
          <p className="text-kobo-gray">{m.backup.diskSpace}</p>
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button size="lg" onClick={start} className="flex-1">
            <Icon type="download" />
            {m.backup.start}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setStep('overview')}>
            {m.common.back}
          </Button>
        </div>
        {features.saveFilePicker && (
          <p className="mt-3 text-center text-sm text-kobo-gray">{m.backup.saveDialogHint}</p>
        )}
      </Card>
    );
  }

  if (backup.error) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h2 className="mb-2 text-2xl text-kobo-dark">{m.backup.failedTitle}</h2>
        <p className="mb-4 text-kobo-gray">{m.backup.failedBody}</p>
        <ErrorAlert error={backup.error} />
        <p className="my-6 text-sm text-kobo-gray">{m.backup.failedHint}</p>
        <Button
          onClick={() => {
            backup.reset();
            setStep('options');
          }}
        >
          {m.common.retry}
        </Button>
      </Card>
    );
  }

  if (backup.result) {
    const r = backup.result;
    return (
      <Card className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-kobo-success/20">
          <Icon type="check" size={40} className="text-kobo-dark" />
        </div>
        <h2 className="mb-2 text-4xl text-kobo-dark">{m.backup.successTitle}</h2>
        <p className="mb-6 text-lg text-kobo-gray">{m.backup.successBody}</p>

        <div className="mb-6 space-y-3">
          {r.verification && (
            <Alert tone={r.verification.ok ? 'success' : 'error'} live>
              {r.verification.ok ? m.backup.verifiedOk : m.backup.verifiedFail}
            </Alert>
          )}
          {r.metadata.options?.encrypted && <Alert tone="warning">{m.backup.encryptedNote}</Alert>}
          <Alert tone="info">
            {r.streamed ? fmt(m.backup.savedAs, { filename: r.filename }) : m.backup.downloadNote}
          </Alert>
        </div>

        <dl className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            [m.backup.summary.file, r.filename],
            [m.backup.summary.size, formatBytes(r.size)],
            [m.backup.summary.books, String(r.metadata.statistics.totalBooks)],
            [m.backup.summary.annotations, String(r.metadata.statistics.totalAnnotations)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border-2 border-kobo-cream-dark p-3">
              <dt className="text-xs text-kobo-gray">{label}</dt>
              <dd className="truncate text-kobo-dark" title={value}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mb-8 rounded-lg bg-kobo-cream-dark p-6 text-left">
          <h3 className="mb-3 text-xl text-kobo-dark">{m.backup.nextTitle}</h3>
          <ul className="list-disc space-y-1 pl-5 text-kobo-gray">
            {m.backup.next.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="library"
            className="rounded-lg bg-kobo-accent px-6 py-3 text-lg font-semibold text-kobo-dark hover:bg-kobo-accent-dark focus-visible-ring"
          >
            {m.backup.openLibrary}
          </Link>
          <Button size="lg" variant="secondary" onClick={onAnother}>
            {m.backup.another}
          </Button>
        </div>
      </Card>
    );
  }

  const p = backup.progress;
  return (
    <Card className="mx-auto max-w-2xl text-center">
      <h2 className="mb-8 text-3xl text-kobo-dark">{m.backup.progressTitle}</h2>
      <div className="mb-6 flex justify-center">
        <CircularProgress percent={p.percent} label={m.backup.progressTitle} />
      </div>
      <p className="mb-6 text-lg text-kobo-dark" role="status" aria-live="polite">
        {fmt(m.backup.stages[p.stage], { current: p.filesProcessed, total: p.totalFiles })}
      </p>
      <Alert tone="warning">{m.backup.keepOpen}</Alert>
    </Card>
  );
}
