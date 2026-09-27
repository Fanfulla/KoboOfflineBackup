import { describe, it, expect } from 'vitest';
import { serveStream, type PageToWorker } from './protocol.ts';

/** Plays the service worker's role: pull until done, collecting the bytes. */
function pullAll(port: MessagePort): Promise<Uint8Array[]> {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    port.onmessage = (event: MessageEvent<PageToWorker>) => {
      const msg = event.data;
      if (msg.type === 'chunk') {
        chunks.push(new Uint8Array(msg.chunk));
        port.postMessage({ type: 'pull' });
      } else if (msg.type === 'done') resolve(chunks);
      else reject(new Error(msg.message));
    };
    port.postMessage({ type: 'registered' });
    port.postMessage({ type: 'pull' });
  });
}

const streamOf = (...parts: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const p of parts) controller.enqueue(new TextEncoder().encode(p));
      controller.close();
    },
  });

describe('service-worker download protocol', () => {
  it('sends every chunk in order, then done', async () => {
    const { port1, port2 } = new MessageChannel();
    const { registered, done } = serveStream(streamOf('PK', 'zip-', 'data'), port1);
    const received = pullAll(port2);
    await registered;
    await done;
    const text = (await received).map((c) => new TextDecoder().decode(c)).join('');
    expect(text).toBe('PKzip-data');
    port2.close();
  });

  it('only reads from the source when the worker pulls (back-pressure)', async () => {
    let reads = 0;
    const source = new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          reads++;
          controller.enqueue(new Uint8Array([reads]));
        },
      },
      { highWaterMark: 0 },
    );
    const { port1, port2 } = new MessageChannel();
    serveStream(source, port1);
    await new Promise((r) => setTimeout(r, 20));
    expect(reads).toBe(0);
    port2.postMessage({ type: 'pull' });
    await new Promise((r) => setTimeout(r, 20));
    expect(reads).toBe(1);
    port1.close();
    port2.close();
  });

  it('propagates source errors and cancellation', async () => {
    const failing = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.error(new Error('disk unplugged'));
      },
    });
    const a = new MessageChannel();
    const failed = serveStream(failing, a.port1);
    await expect(pullAll(a.port2)).rejects.toThrow('disk unplugged');
    await expect(failed.done).rejects.toThrow('disk unplugged');

    const b = new MessageChannel();
    const cancelled = serveStream(streamOf('x'), b.port1);
    b.port2.postMessage({ type: 'cancel' });
    await expect(cancelled.done).rejects.toMatchObject({ name: 'AbortError' });
    b.port2.close();
  });
});
