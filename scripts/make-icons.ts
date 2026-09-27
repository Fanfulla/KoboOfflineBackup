/**
 * Generates the PWA / touch icons (PNG) from code, without image libraries:
 * a rounded accent square with an open-book glyph, matching favicon.svg.
 *
 *   node scripts/make-icons.ts
 */
import { writeFileSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';

type RGBA = [number, number, number, number];

const ACCENT_TOP: RGBA = [212, 165, 116, 255]; // #D4A574
const ACCENT_BOTTOM: RGBA = [184, 137, 94, 255]; // #B8895E
const WHITE: RGBA = [255, 255, 255, 255];

function chunk(type: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])) >>> 0, 0);
  return Buffer.concat([head, data, crc]);
}

function png(size: number, pixel: (x: number, y: number) => RGBA): Buffer {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const mix = (a: RGBA, b: RGBA, t: number): RGBA => a.map((v, i) => Math.round(v + (b[i]! - v) * t)) as RGBA;

/** Icon in unit coordinates (0..1). `maskable` keeps the glyph inside the safe zone. */
function icon(size: number, { rounded, maskable }: { rounded: boolean; maskable: boolean }) {
  const radius = rounded ? 0.2 : 0;
  const scale = maskable ? 0.6 : 0.75;
  return png(size, (px, py) => {
    const x = (px + 0.5) / size;
    const y = (py + 0.5) / size;
    // Rounded square mask
    const dx = Math.max(radius - x, 0, x - (1 - radius));
    const dy = Math.max(radius - y, 0, y - (1 - radius));
    if (radius && dx * dx + dy * dy > radius * radius) return [0, 0, 0, 0];

    // Open book: two pages with a spine, in glyph space u,v ∈ [-1, 1]
    const u = (x - 0.5) / (scale / 2);
    const v = (y - 0.5) / (scale / 2);
    const inBook = Math.abs(u) <= 0.9 && v >= -0.55 + Math.abs(u) * 0.12 && v <= 0.6 + Math.abs(u) * 0.08;
    const spine = Math.abs(u) < 0.05;
    const line =
      Math.abs(u) > 0.2 &&
      Math.abs(u) < 0.75 &&
      [-0.2, 0.05, 0.3].some((l) => Math.abs(v - l - Math.abs(u) * 0.1) < 0.035);
    if (inBook && !spine && !line) return WHITE;
    return mix(ACCENT_TOP, ACCENT_BOTTOM, y);
  });
}

const out = new URL('../public/', import.meta.url);
writeFileSync(new URL('icon-192.png', out), icon(192, { rounded: true, maskable: false }));
writeFileSync(new URL('icon-512.png', out), icon(512, { rounded: true, maskable: false }));
writeFileSync(new URL('icon-maskable-512.png', out), icon(512, { rounded: false, maskable: true }));
writeFileSync(new URL('apple-touch-icon.png', out), icon(180, { rounded: false, maskable: false }));
console.log('Icons written to public/');
