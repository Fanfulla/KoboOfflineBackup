import { useCallback, useEffect, useId, useState, type DragEvent } from 'react';
import { useI18n } from '../i18n/core.ts';
import { useRestore } from '../hooks/useRestore.ts';
import { useFeatureDetection } from '../hooks/useFeatureDetection.ts';
import { useKoboStore } from '../stores/koboStore.ts';
import { selectKoboDirectory } from '../utils/fileSystem.ts';
import { isValidKoboDirectory } from '../utils/validation.ts';
import { errorCode, errorMessage } from '../utils/errors.ts';
import { Container } from '../components/layout/Container.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { Stepper } from '../components/common/Stepper.tsx';
import { Card } from '../components/common/Card.tsx';
import { Button } from '../components/common/Button.tsx';
import { Checkbox } from '../components/common/Checkbox.tsx';
import { Icon } from '../components/common/Icon.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Alert, ErrorAlert } from '../components/common/Alert.tsx';
import { CircularProgress } from '../components/common/CircularProgress.tsx';
import type { RestoreMode } from '../utils/restore.ts';
import type { UiError } from '../types/kobo.ts';

type Step = 'file' | 'device' | 'review' | 'run';
const STEP_INDEX: Record<Step, number> = { file: 0, device: 1, review: 2, run: 3 };
const LARGE_FILE = 2 * 1024 ** 3;
const PASSWORD_CODES = new Set(['RESTORE_PASSWORD_REQUIRED', 'RESTORE_WRONG_PASSWORD']);

export function Restore() {
  const { m } = useI18n();
  const restore = useRestore();
  const [step, setStep] = useState<Step>('file');
  const toDevice = useCallback(() => setStep('device'), []);

  return (
    <Container className="max-w-5xl py-12">
      <PageHeader title={m.restore.title} />
      <Stepper steps={m.restore.stepLabels} current={STEP_INDEX[step]} />
      {step === 'file' && <FileStep restore={restore} onDone={toDevice} />}
      {step === 'device' && (
        <DeviceStep restore={restore} onBack={() => setStep('file')} onDone={() => setStep('review')} />
      )}
      {step === 'review' && (
        <ReviewStep restore={restore} onBack={() => setStep('device')} onStart={() => setStep('run')} />
      )}
      {step === 'run' && (
        <RunStep
          restore={restore}
          onRetry={() => {
            restore.clearError();
            setStep('review');
          }}
        />
      )}
    </Container>
  );
}

type RestoreApi = ReturnType<typeof useRestore>;

function FileStep({ restore, onDone }: { restore: RestoreApi; onDone: () => void }) {
  const { m } = useI18n();
  const inputId = useId();
  const pending = useKoboStore((s) => s.pendingRestore);
  const setPending = useKoboStore((s) => s.setPendingRestore);
  const [file, setFile] = useState<File | null>(() => pending);
  const [password, setPassword] = useState('');
  const [dragging, setDragging] = useState(false);
  const needsPassword = !!restore.error && PASSWORD_CODES.has(restore.error.code);
  const { parse } = restore;

  const load = async (f: File, pw?: string) => {
    setFile(f);
    if (await parse(f, pw)) onDone();
  };

  // Backup handed over from the History page.
  useEffect(() => {
    if (!pending) return;
    setPending(null);
    void parse(pending).then((ok) => ok && onDone());
  }, [pending, setPending, parse, onDone]);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const zip = Array.from(e.dataTransfer.files).find((f) => f.name.toLowerCase().endsWith('.zip'));
    if (zip) void load(zip);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <h2 className="mb-2 text-center text-3xl text-kobo-dark">{m.restore.fileTitle}</h2>
      <p className="mb-8 text-center text-kobo-gray">{m.restore.fileSubtitle}</p>

      {needsPassword && file ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void load(file, password);
          }}
        >
          <Alert tone="info" title={m.restore.passwordTitle}>
            {file.name}
          </Alert>
          <label className="block text-sm font-medium text-kobo-dark">
            {m.restore.passwordLabel}
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-kobo-gray-light px-3 py-2 focus:border-kobo-accent focus:outline-hidden focus:ring-2 focus:ring-kobo-accent/50"
              // eslint-disable-next-line jsx-a11y-x/no-autofocus -- the password field is the only action on this step
              autoFocus
            />
          </label>
          {restore.error?.code === 'RESTORE_WRONG_PASSWORD' && <ErrorAlert error={restore.error} />}
          <Button type="submit" size="lg" className="w-full" loading={restore.busy} disabled={!password}>
            <Icon type="lock" />
            {m.restore.unlock}
          </Button>
        </form>
      ) : (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-2xl border-4 border-dashed p-10 text-center transition-colors ${
              dragging
                ? 'border-kobo-accent bg-kobo-accent/10'
                : 'border-kobo-gray-light bg-kobo-cream-dark/30'
            }`}
          >
            <Icon type="upload" size={56} className="mx-auto mb-4 text-kobo-gray" />
            <p className="mb-2 text-xl text-kobo-dark">{m.restore.drop}</p>
            <p className="mb-4 text-kobo-gray">{m.restore.or}</p>
            <input
              id={inputId}
              type="file"
              accept=".zip,application/zip"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void load(f);
                e.target.value = '';
              }}
            />
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-kobo-gray-light bg-white px-6 py-3 text-lg font-semibold text-kobo-dark hover:bg-kobo-cream focus-within:ring-2 focus-within:ring-kobo-accent"
            >
              <Icon type="folder" />
              {m.restore.browse}
            </label>
            <p className="mt-4 text-sm text-kobo-gray">kobo_backup_*.zip</p>
          </div>

          {restore.busy && (
            <p className="mt-6 text-center text-kobo-gray" role="status">
              {m.restore.reading}
            </p>
          )}
          {file && file.size > LARGE_FILE && !restore.error && (
            <Alert tone="warning" className="mt-6">
              {m.restore.largeFile}
            </Alert>
          )}
          {restore.error && (
            <div className="mt-6">
              <ErrorAlert error={restore.error} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function DeviceStep({
  restore,
  onBack,
  onDone,
}: {
  restore: RestoreApi;
  onBack: () => void;
  onDone: () => void;
}) {
  const { m } = useI18n();
  const features = useFeatureDetection();
  const [error, setError] = useState<UiError | null>(null);
  const [selecting, setSelecting] = useState(false);

  const select = async () => {
    setError(null);
    setSelecting(true);
    try {
      const handle = await selectKoboDirectory('readwrite');
      if (!handle) return;
      if (!(await isValidKoboDirectory(handle))) {
        setError({ title: '', message: 'Not a Kobo device', code: 'INVALID_DEVICE' });
        return;
      }
      if (await restore.selectTarget(handle)) onDone();
    } catch (err) {
      setError({ title: '', message: errorMessage(err), code: errorCode(err, 'FS_PERMISSION_DENIED') });
    } finally {
      setSelecting(false);
    }
  };

  const shownError = error ?? restore.error;

  return (
    <Card className="mx-auto max-w-3xl text-center">
      <h2 className="mb-2 text-3xl text-kobo-dark">{m.restore.deviceTitle}</h2>
      <p className="mb-6 text-kobo-gray">{m.restore.deviceSubtitle}</p>
      <Alert tone="warning" className="mb-6">
        {m.restore.deviceWarning}
      </Alert>
      <ol className="mb-8 space-y-2 text-left text-sm text-kobo-dark">
        {m.connect.steps.map((s) => (
          <li key={s.title} className="flex gap-2">
            <Icon type="check" size="sm" className="mt-0.5 shrink-0 text-kobo-success" />
            <span>
              <strong>{s.title}.</strong> {s.body}
            </span>
          </li>
        ))}
      </ol>
      {shownError && (
        <div className="mb-6">
          <ErrorAlert error={shownError} />
        </div>
      )}
      {features.fileSystemAccess ? (
        <div className="flex flex-col justify-center gap-3 sm:flex-row-reverse">
          <Button size="lg" onClick={select} loading={selecting || restore.busy}>
            <Icon type="folder" />
            {m.restore.selectDevice}
          </Button>
          <Button size="lg" variant="secondary" onClick={onBack}>
            {m.common.back}
          </Button>
        </div>
      ) : (
        <Alert tone="error" title={m.browser.limitedTitle}>
          {m.browser.restoreNeedsChromium}
        </Alert>
      )}
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-kobo-cream-dark py-1.5 text-sm last:border-0">
      <dt className="text-kobo-gray">{label}</dt>
      <dd className="text-right font-medium text-kobo-dark">{value}</dd>
    </div>
  );
}

function ReviewStep({
  restore,
  onBack,
  onStart,
}: {
  restore: RestoreApi;
  onBack: () => void;
  onStart: () => void;
}) {
  const { m, fmt, formatDate, formatDuration, formatNumber } = useI18n();
  const { backup, preview, target, compatibility } = restore;
  const canMerge = !!target?.info.hasDatabase;
  const fullAllowed = compatibility?.compatible !== false;

  const [mode, setMode] = useState<RestoreMode>(canMerge ? 'merge' : 'full');
  const [merge, setMerge] = useState({ progress: true, annotations: true, collections: true });
  const [includeBooks, setIncludeBooks] = useState(true);
  const [includeSettings, setIncludeSettings] = useState(false);
  const [cleanExistingBooks, setClean] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!backup || !preview || !target) return null;
  const r = m.restore;

  const start = () => {
    onStart();
    void restore.restore({
      mode,
      merge,
      includeBooks,
      includeSettings,
      cleanExistingBooks: mode === 'full' && cleanExistingBooks,
    });
  };

  const modeOption = (value: RestoreMode, disabled: boolean) => (
    <label
      className={`flex cursor-pointer gap-3 rounded-lg border-2 p-4 text-left ${
        mode === value ? 'border-kobo-accent bg-kobo-accent/10' : 'border-kobo-cream-dark'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input
        type="radio"
        name="restore-mode"
        value={value}
        checked={mode === value}
        disabled={disabled}
        onChange={() => setMode(value)}
        className="mt-1 accent-kobo-accent-ink"
      />
      <span>
        <span className="flex items-center gap-2 font-semibold text-kobo-dark">
          {r.modes[value].title}
          {value === 'merge' && (
            <span className="rounded-full bg-kobo-success/20 px-2 py-0.5 text-xs font-medium">
              {r.modes.merge.badge}
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm text-kobo-gray">{r.modes[value].body}</span>
      </span>
    </label>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-center text-3xl text-kobo-dark">{r.reviewTitle}</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-xl text-kobo-dark">{r.backupDetails}</h3>
          <dl>
            <Detail
              label={r.created}
              value={formatDate(preview.created, { dateStyle: 'medium', timeStyle: 'short' })}
            />
            <Detail label={r.device} value={preview.deviceModel} />
            <Detail label={r.firmware} value={preview.firmwareVersion} />
            <Detail label={r.books} value={formatNumber(preview.statistics.totalBooks)} />
            <Detail label={r.annotations} value={formatNumber(preview.statistics.totalAnnotations)} />
            <Detail label={r.finished} value={formatNumber(preview.statistics.booksFinished)} />
            <Detail label={r.readingTime} value={formatDuration(preview.statistics.totalReadingTime)} />
            {backup.encrypted && <Detail label={r.encrypted} value="AES-256" />}
          </dl>
        </Card>
        <Card>
          <h3 className="mb-3 text-xl text-kobo-dark">{r.targetDevice}</h3>
          <dl>
            <Detail label={r.device} value={target.info.device.model} />
            <Detail label={r.firmware} value={target.info.device.firmwareVersion} />
          </dl>
          <div className="mt-4 space-y-2">
            {backup.checksumOk !== null && (
              <Alert tone={backup.checksumOk ? 'success' : 'error'}>
                {backup.checksumOk ? r.integrityOk : r.integrityBad}
              </Alert>
            )}
            <h4 className="pt-2 text-base font-semibold text-kobo-dark">{r.compatibility.title}</h4>
            {!compatibility || compatibility.warnings.length === 0 ? (
              <Alert tone="success">{r.compatibility.ok}</Alert>
            ) : (
              compatibility.warnings.map((w) => (
                <Alert key={w.code} tone={w.code === 'schema-newer' ? 'error' : 'warning'}>
                  {fmt(r.compatibility[w.code], w.params)}
                </Alert>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <fieldset className="mb-6">
          <legend className="mb-3 text-xl text-kobo-dark">{r.modeTitle}</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {modeOption('merge', !canMerge)}
            {modeOption('full', !fullAllowed)}
          </div>
        </fieldset>

        {mode === 'merge' && (
          <fieldset className="mb-6 space-y-3">
            <legend className="mb-2 font-semibold text-kobo-dark">{r.mergeWhat}</legend>
            <Checkbox
              checked={merge.progress}
              onChange={(v) => setMerge({ ...merge, progress: v })}
              label={r.mergeProgress}
            />
            <Checkbox
              checked={merge.annotations}
              onChange={(v) => setMerge({ ...merge, annotations: v })}
              label={r.mergeAnnotations}
            />
            <Checkbox
              checked={merge.collections}
              onChange={(v) => setMerge({ ...merge, collections: v })}
              label={r.mergeCollections}
            />
          </fieldset>
        )}

        <fieldset className="mb-6 space-y-3">
          <legend className="mb-2 font-semibold text-kobo-dark">{r.filesTitle}</legend>
          {backup.bookFiles.length > 0 ? (
            <Checkbox
              checked={includeBooks}
              onChange={setIncludeBooks}
              label={fmt(r.restoreBooks, { count: backup.bookFiles.length })}
              sublabel={r.restoreBooksHint}
            />
          ) : (
            <Alert tone="info">{r.noBooksInBackup}</Alert>
          )}
          {backup.extraFiles.length > 0 && (
            <Checkbox
              checked={includeSettings}
              onChange={setIncludeSettings}
              label={fmt(r.restoreSettings, { count: backup.extraFiles.length })}
              sublabel={r.restoreSettingsHint}
            />
          )}
          {mode === 'full' && includeBooks && backup.bookFiles.length > 0 && (
            <Checkbox
              checked={cleanExistingBooks}
              onChange={setClean}
              label={r.cleanFolders}
              sublabel={r.cleanFoldersHint}
            />
          )}
        </fieldset>

        <div className="rounded-lg border-2 border-kobo-error/30 bg-kobo-error/5 p-4">
          <Checkbox checked={confirmed} onChange={setConfirmed} label={<strong>{r.confirm}</strong>} />
        </div>
      </Card>

      <div className="flex flex-col justify-center gap-3 sm:flex-row-reverse">
        <Button size="lg" variant="danger" onClick={start} disabled={!confirmed}>
          <Icon type="restore" />
          {r.start}
        </Button>
        <Button size="lg" variant="secondary" onClick={onBack}>
          {m.common.back}
        </Button>
      </div>
    </div>
  );
}

function RunStep({ restore, onRetry }: { restore: RestoreApi; onRetry: () => void }) {
  const { m, fmt, plural, formatNumber } = useI18n();
  const r = m.restore;
  const [undoOpen, setUndoOpen] = useState(false);
  const [undone, setUndone] = useState(false);
  const { result, error, progress } = restore;
  const canUndo = !undone && (result?.safetySnapshot || (error && restore.target?.info.hasDatabase));

  const undoModal = (
    <Modal isOpen={undoOpen} onClose={() => setUndoOpen(false)} title={r.undo} closeLabel={m.common.close}>
      <p className="mb-6 text-kobo-gray">{r.undoConfirm}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setUndoOpen(false)}>
          {m.common.cancel}
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            setUndoOpen(false);
            if (await restore.undo()) setUndone(true);
          }}
        >
          {r.undo}
        </Button>
      </div>
    </Modal>
  );

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h2 className="mb-2 text-2xl text-kobo-dark">{r.failedTitle}</h2>
        <p className="mb-4 text-kobo-gray">{r.failedBody}</p>
        <ErrorAlert error={error} />
        {undone && (
          <Alert tone="success" className="mt-4" live>
            {r.undone}
          </Alert>
        )}
        {canUndo && <p className="mt-4 text-sm text-kobo-gray">{r.failedDbWritten}</p>}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={onRetry}>{m.common.retry}</Button>
          {canUndo && (
            <Button variant="secondary" onClick={() => setUndoOpen(true)}>
              {r.undo}
            </Button>
          )}
        </div>
        {undoModal}
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <h2 className="mb-8 text-3xl text-kobo-dark">{r.progressTitle}</h2>
        <div className="mb-6 flex justify-center">
          <CircularProgress percent={progress.percent} label={r.progressTitle} />
        </div>
        <p className="mb-6 text-lg text-kobo-dark" role="status" aria-live="polite">
          {fmt(r.stages[progress.stage], { current: progress.filesProcessed, total: progress.totalFiles })}
        </p>
        <Alert tone="error">{r.doNotDisconnect}</Alert>
      </Card>
    );
  }

  const failures = result.failedBooks;
  const verifyFailed = result.verification && !result.verification.ok;
  const summary: [string, number][] = [
    [r.summary.books, result.booksRestored],
    ...(result.merge
      ? ([
          [r.summary.merged, result.merge.booksUpdated],
          [r.summary.added, result.merge.booksAdded],
          [r.summary.annotations, result.merge.annotationsAdded],
          [r.summary.collections, result.merge.collectionsAdded],
        ] as [string, number][])
      : []),
    ...(result.settingsRestored
      ? ([[r.summary.settings, result.settingsRestored]] as [string, number][])
      : []),
  ];

  return (
    <Card className="mx-auto max-w-3xl text-center">
      <div
        className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${failures.length ? 'bg-kobo-warning/25' : 'bg-kobo-success/20'}`}
      >
        <Icon type={failures.length ? 'warning' : 'check'} size={40} className="text-kobo-dark" />
      </div>
      <h2 className="mb-6 text-4xl text-kobo-dark">{failures.length ? r.partialTitle : r.successTitle}</h2>

      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-lg border-2 border-kobo-cream-dark p-3">
            <dt className="text-xs text-kobo-gray">{label}</dt>
            <dd className="font-display text-2xl text-kobo-dark">{formatNumber(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-6 space-y-3">
        {failures.length > 0 && (
          <Alert tone="warning" title={plural(r.failedFiles, failures.length)}>
            <ul className="max-h-40 list-disc overflow-y-auto pl-5">
              {failures.map((f) => (
                <li key={f.originalPath}>
                  {f.originalPath} — {f.error}
                </li>
              ))}
            </ul>
          </Alert>
        )}
        {verifyFailed && result.verification && (
          <Alert tone="warning">
            {fmt(r.verifyMismatch, {
              actual: result.verification.dbBooksCount,
              expected: result.verification.expectedCount,
            })}
          </Alert>
        )}
        {result.safetySnapshot && !undone && <Alert tone="info">{r.snapshotNote}</Alert>}
        {undone && (
          <Alert tone="success" live>
            {r.undone}
          </Alert>
        )}
      </div>

      <div className="mb-8 rounded-lg bg-kobo-cream-dark p-6 text-left">
        <h3 className="mb-3 text-xl text-kobo-dark">{r.nextTitle}</h3>
        <ol className="list-decimal space-y-1 pl-5 text-kobo-gray">
          {r.next.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ol>
      </div>

      {canUndo && (
        <Button variant="secondary" onClick={() => setUndoOpen(true)}>
          <Icon type="restore" />
          {r.undo}
        </Button>
      )}
      {undoModal}
    </Card>
  );
}
