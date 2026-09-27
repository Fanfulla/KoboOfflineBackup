import { useState } from 'react';
import { useI18n } from '../i18n/core.ts';
import { Link } from '../router/Router.tsx';
import { useNavigateTo } from '../router/context.ts';
import { useKoboStore } from '../stores/koboStore.ts';
import { deleteBackupHandle, fileFromHandle, loadBackupHandle } from '../utils/handleStore.ts';
import { errorMessage } from '../utils/errors.ts';
import { Container } from '../components/layout/Container.tsx';
import { PageHeader } from '../components/common/PageHeader.tsx';
import { Card } from '../components/common/Card.tsx';
import { Button } from '../components/common/Button.tsx';
import { Icon } from '../components/common/Icon.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Alert } from '../components/common/Alert.tsx';
import { StatusBadge } from '../components/common/StatusBadge.tsx';
import type { BackupHistoryEntry } from '../types/kobo.ts';

type Feedback = { tone: 'success' | 'error'; text: string };

export function History() {
  const { m } = useI18n();
  const backups = useKoboStore((s) => s.backups);
  const removeBackup = useKoboStore((s) => s.removeBackup);
  const [toRemove, setToRemove] = useState<BackupHistoryEntry | null>(null);

  return (
    <Container size="sm" className="py-12">
      <PageHeader title={m.history.title} subtitle={m.history.subtitle} />

      {backups.length === 0 ? (
        <Card className="text-center">
          <Icon type="history" size={48} className="mx-auto mb-4 text-kobo-gray-light" />
          <h2 className="mb-2 text-2xl text-kobo-dark">{m.history.emptyTitle}</h2>
          <p className="mb-6 text-kobo-gray">{m.history.emptyBody}</p>
          <Link
            to="backup"
            className="rounded-lg bg-kobo-accent px-6 py-3 font-semibold text-kobo-dark hover:bg-kobo-accent-dark focus-visible-ring"
          >
            {m.history.create}
          </Link>
        </Card>
      ) : (
        <ul className="space-y-4">
          {backups.map((b) => (
            <li key={b.id}>
              <BackupCard backup={b} onRemove={() => setToRemove(b)} />
            </li>
          ))}
        </ul>
      )}

      <Card className="mt-8 border border-kobo-info/20 bg-kobo-info/5">
        <h2 className="mb-2 text-lg text-kobo-dark">{m.history.bestTitle}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-kobo-gray">
          {m.history.best.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </Card>

      <Modal
        isOpen={!!toRemove}
        onClose={() => setToRemove(null)}
        title={m.history.removeTitle}
        closeLabel={m.common.close}
        size="sm"
      >
        <p className="mb-2 text-kobo-gray">{m.history.removeBody}</p>
        <p className="mb-6 font-semibold text-kobo-dark">{toRemove?.filename}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setToRemove(null)}>
            {m.common.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (toRemove) {
                removeBackup(toRemove.id);
                void deleteBackupHandle(toRemove.id);
              }
              setToRemove(null);
            }}
          >
            <Icon type="trash" size="sm" />
            {m.history.remove}
          </Button>
        </div>
      </Modal>
    </Container>
  );
}

function BackupCard({ backup, onRemove }: { backup: BackupHistoryEntry; onRemove: () => void }) {
  const { m, fmt, plural, formatBytes, formatDate } = useI18n();
  const navigateTo = useNavigateTo();
  const setPendingRestore = useKoboStore((s) => s.setPendingRestore);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const openFile = async (): Promise<File | null> => {
    const handle = await loadBackupHandle(backup.id);
    if (!handle) return null;
    try {
      return await fileFromHandle(handle);
    } catch {
      return null;
    }
  };

  const verify = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const file = await openFile();
      if (!file) return setFeedback({ tone: 'error', text: m.history.notAvailable });
      const { verifyBackupArchive } = await import('../utils/backup.ts');
      const { parseBackupFile } = await import('../utils/restore.ts');
      // Encrypted archives can only be listed; their integrity is checked on restore.
      const result = await verifyBackupArchive(file, {});
      let checksumOk: boolean | null = null;
      if (result.ok && !backup.encrypted) checksumOk = (await parseBackupFile(file)).checksumOk;
      const ok = result.ok && checksumOk !== false;
      setFeedback(
        ok
          ? { tone: 'success', text: m.history.verifyOk }
          : {
              tone: 'error',
              text: fmt(m.history.verifyBad, {
                details: result.error ?? result.missing.join(', ') ?? 'checksum',
              }),
            },
      );
    } catch (err) {
      setFeedback({ tone: 'error', text: fmt(m.history.verifyBad, { details: errorMessage(err) }) });
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    const file = backup.hasHandle ? await openFile() : null;
    if (file) setPendingRestore(file);
    else if (backup.hasHandle) return setFeedback({ tone: 'error', text: m.history.notAvailable });
    navigateTo('restore');
  };

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-kobo-accent to-kobo-accent-dark">
          <Icon type="backup" size={28} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-bold text-kobo-dark">{backup.filename}</h2>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-kobo-gray">
            <span>{formatDate(backup.created, { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <span>{formatBytes(backup.size)}</span>
            <span>{plural(m.common.books, backup.bookCount)}</span>
            {backup.annotationCount > 0 && (
              <span>{plural(m.common.annotations, backup.annotationCount)}</span>
            )}
          </p>
          <p className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status="default">{backup.deviceModel}</StatusBadge>
            {backup.encrypted && <StatusBadge status="warning">{m.history.encrypted}</StatusBadge>}
            {backup.verified && <StatusBadge status="success">{m.history.verified}</StatusBadge>}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {backup.hasHandle && (
            <Button size="sm" variant="secondary" onClick={verify} loading={busy}>
              {busy ? m.history.verifying : m.history.verify}
            </Button>
          )}
          <Button size="sm" onClick={restore}>
            <Icon type="restore" size="sm" />
            {m.history.restore}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            aria-label={m.history.remove}
            title={m.history.remove}
          >
            <Icon type="trash" size="sm" />
          </Button>
        </div>
      </div>
      {feedback && (
        <Alert tone={feedback.tone} className="mt-4" live>
          {feedback.text}
        </Alert>
      )}
    </Card>
  );
}
