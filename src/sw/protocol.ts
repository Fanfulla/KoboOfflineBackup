/**
 * Streaming downloads through the service worker (Firefox/Safari have no
 * showSaveFilePicker). The page registers a download on a MessagePort; the
 * worker answers a request to DOWNLOAD_PREFIX + id with a ReadableStream that
 * pulls chunks from the page one at a time, so memory stays flat no matter how
 * large the backup is.
 */

export const DOWNLOAD_PREFIX = '/__kobup_download__/';

/** page → worker (global postMessage) */
export type WorkerMessage =
  | { type: 'kobup-download-register'; id: string; filename: string; mime: string }
  | { type: 'kobup-keepalive' };

/** worker → page (on the port) */
export type WorkerToPage = { type: 'registered' } | { type: 'pull' } | { type: 'cancel' };

/** page → worker (on the port) */
export type PageToWorker =
  { type: 'chunk'; chunk: ArrayBuffer } | { type: 'done' } | { type: 'error'; message: string };

/**
 * Serve `stream` over `port`, one chunk per "pull". `registered` resolves when
 * the worker acknowledges the download; `done` when the stream is fully sent.
 */
export function serveStream(stream: ReadableStream<Uint8Array>, port: MessagePort) {
  const reader = stream.getReader();
  let resolveRegistered!: () => void;
  let resolveDone!: () => void;
  let rejectDone!: (reason: unknown) => void;
  const registered = new Promise<void>((resolve) => (resolveRegistered = resolve));
  const done = new Promise<void>((resolve, reject) => {
    resolveDone = resolve;
    rejectDone = reject;
  });
  // Callers await `registered` first; don't report `done` as unhandled meanwhile.
  done.catch(() => {});
  const send = (msg: PageToWorker, transfer: Transferable[] = []) => port.postMessage(msg, transfer);

  port.onmessage = async (event: MessageEvent<WorkerToPage>) => {
    switch (event.data.type) {
      case 'registered':
        resolveRegistered();
        break;
      case 'pull':
        try {
          const { value, done: finished } = await reader.read();
          if (finished) {
            send({ type: 'done' });
            port.close();
            resolveDone();
          } else {
            // Copy into an ArrayBuffer we own so it can be transferred (zero-copy).
            const copy = value.slice();
            send({ type: 'chunk', chunk: copy.buffer }, [copy.buffer]);
          }
        } catch (error) {
          send({ type: 'error', message: error instanceof Error ? error.message : String(error) });
          port.close();
          rejectDone(error);
        }
        break;
      case 'cancel':
        void reader.cancel().catch(() => {});
        port.close();
        rejectDone(new DOMException('The download was cancelled', 'AbortError'));
        break;
    }
  };

  return { registered, done };
}

/** Whether this page is controlled by our service worker (streaming possible). */
export function canStreamDownload(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.serviceWorker?.controller &&
    typeof ReadableStream !== 'undefined'
  );
}

/** Download `stream` as a file without buffering it in memory. */
export async function streamDownload(
  stream: ReadableStream<Uint8Array>,
  filename: string,
  mime = 'application/zip',
) {
  const worker = navigator.serviceWorker.controller;
  if (!worker) throw new Error('Service worker not active');

  const id = crypto.randomUUID();
  const { port1, port2 } = new MessageChannel();
  const { registered, done } = serveStream(stream, port1);
  worker.postMessage({ type: 'kobup-download-register', id, filename, mime } satisfies WorkerMessage, [
    port2,
  ]);
  await registered;

  const iframe = document.createElement('iframe');
  iframe.hidden = true;
  iframe.title = filename;
  iframe.src = `${DOWNLOAD_PREFIX}${id}`;
  document.body.append(iframe);

  // Messages keep the worker alive while the browser is writing the file.
  const keepAlive = setInterval(
    () =>
      navigator.serviceWorker.controller?.postMessage({ type: 'kobup-keepalive' } satisfies WorkerMessage),
    10_000,
  );
  try {
    await done;
  } finally {
    clearInterval(keepAlive);
    setTimeout(() => iframe.remove(), 30_000);
  }
}
