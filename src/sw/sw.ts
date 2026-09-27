/// <reference lib="webworker" />
/**
 * KoBup service worker:
 *  - offline: precaches the prerendered pages and hashed assets
 *  - streaming downloads for browsers without showSaveFilePicker
 *
 * Built by scripts/postbuild.ts, which injects the precache list and version.
 */
import { DOWNLOAD_PREFIX, type PageToWorker, type WorkerMessage, type WorkerToPage } from './protocol.ts';

declare const self: ServiceWorkerGlobalScope;
declare const __PRECACHE__: string[];
declare const __SW_VERSION__: string;

const CACHE = `kobup-${__SW_VERSION__}`;
const downloads = new Map<string, { port: MessagePort; filename: string; mime: string }>();

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(__PRECACHE__)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith('kobup-') && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data as WorkerMessage;
  if (data?.type === 'kobup-download-register' && event.ports[0]) {
    const port = event.ports[0];
    downloads.set(data.id, { port, filename: data.filename, mime: data.mime });
    port.postMessage({ type: 'registered' } satisfies WorkerToPage);
  }
  // 'kobup-keepalive': receiving the event is enough to extend the worker's lifetime.
});

function downloadResponse(id: string): Response {
  const download = downloads.get(id);
  if (!download) return new Response('Download expired', { status: 404 });
  downloads.delete(id);
  const { port, filename, mime } = download;

  const stream = new ReadableStream<Uint8Array>(
    {
      pull: (controller) =>
        new Promise<void>((resolve) => {
          port.onmessage = (event: MessageEvent<PageToWorker>) => {
            const msg = event.data;
            if (msg.type === 'chunk') controller.enqueue(new Uint8Array(msg.chunk));
            else if (msg.type === 'done') controller.close();
            else controller.error(new Error(msg.message));
            resolve();
          };
          port.postMessage({ type: 'pull' } satisfies WorkerToPage);
        }),
      cancel: () => port.postMessage({ type: 'cancel' } satisfies WorkerToPage),
    },
    { highWaterMark: 1 },
  );

  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '');
  return new Response(stream, {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  });
}

async function networkFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) void cache.put(request, response.clone());
    return response;
  } catch {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    return (
      (await cache.match(path)) ??
      (await cache.match(path.startsWith('/it') ? '/it' : '/')) ??
      new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
    );
  }
}

async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) void cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  if (url.pathname.startsWith(DOWNLOAD_PREFIX)) {
    event.respondWith(downloadResponse(url.pathname.slice(DOWNLOAD_PREFIX.length)));
    return;
  }
  if (url.pathname.startsWith('/_vercel/')) return; // analytics: network only

  if (request.mode === 'navigate') event.respondWith(networkFirst(request));
  else event.respondWith(cacheFirst(request));
});
