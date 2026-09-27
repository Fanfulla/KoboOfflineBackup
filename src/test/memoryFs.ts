/**
 * Minimal in-memory implementation of the File System Access API handles,
 * so restore/backup code can run end-to-end under node in tests.
 */

type Data = Blob | ArrayBuffer | ArrayBufferView | string;

function namedError(name: string, message: string): Error {
  const e = new Error(message);
  e.name = name;
  return e;
}

class MemWritable {
  private readonly fh: MemFileHandle;
  constructor(fh: MemFileHandle) {
    this.fh = fh;
  }
  async write(d: Data) {
    this.fh.data = d;
  }
  async close() {}
  async abort() {}
}

export class MemFileHandle {
  readonly kind = 'file' as const;
  readonly name: string;
  data: Data | null = null;
  constructor(name: string) {
    this.name = name;
  }
  async createWritable() {
    return new MemWritable(this);
  }
  async getFile(): Promise<File> {
    return new File(this.data == null ? [] : [this.data as BlobPart], this.name);
  }
}

export class MemDirHandle {
  readonly kind = 'directory' as const;
  readonly name: string;
  readonly dirs = new Map<string, MemDirHandle>();
  readonly files = new Map<string, MemFileHandle>();

  constructor(name = 'root') {
    this.name = name;
  }

  // Mirror the browser API, which throws on "." / ".." / separators.
  private check(n: string) {
    if (n === '.' || n === '..' || /[\\/]/.test(n)) throw new TypeError(`Name "${n}" is not allowed.`);
  }

  async getDirectoryHandle(name: string, opts: { create?: boolean } = {}) {
    this.check(name);
    const existing = this.dirs.get(name);
    if (existing) return existing;
    if (!opts.create) throw namedError('NotFoundError', `not found: ${name}`);
    const d = new MemDirHandle(name);
    this.dirs.set(name, d);
    return d;
  }

  async getFileHandle(name: string, opts: { create?: boolean } = {}) {
    this.check(name);
    const existing = this.files.get(name);
    if (existing) return existing;
    if (!opts.create) throw namedError('NotFoundError', `not found: ${name}`);
    const f = new MemFileHandle(name);
    this.files.set(name, f);
    return f;
  }

  async removeEntry(name: string, opts: { recursive?: boolean } = {}) {
    this.check(name);
    if (this.files.delete(name)) return;
    const d = this.dirs.get(name);
    if (!d) throw namedError('NotFoundError', `not found: ${name}`);
    if (!opts.recursive && (d.dirs.size || d.files.size))
      throw namedError('InvalidModificationError', 'not empty');
    this.dirs.delete(name);
  }

  async *values(): AsyncGenerator<MemDirHandle | MemFileHandle> {
    yield* this.dirs.values();
    yield* this.files.values();
  }

  async *entries(): AsyncGenerator<[string, MemDirHandle | MemFileHandle]> {
    for await (const v of this.values()) yield [v.name, v];
  }

  // ---- test helpers ----
  dir(path: string): MemDirHandle | undefined {
    return path.split('/').reduce<MemDirHandle | undefined>((h, seg) => (seg ? h?.dirs.get(seg) : h), this);
  }

  fileAt(path: string): MemFileHandle | null {
    const parts = path.split('/');
    const name = parts.pop()!;
    return this.dir(parts.join('/'))?.files.get(name) ?? null;
  }

  hasFile(path: string): boolean {
    return !!this.fileAt(path);
  }

  async writeText(path: string, content: Data): Promise<void> {
    const parts = path.split('/');
    const name = parts.pop()!;
    const dir = await parts.reduce<Promise<MemDirHandle>>(
      async (parent, p) => (await parent).getDirectoryHandle(p, { create: true }),
      Promise.resolve(this),
    );
    (await dir.getFileHandle(name, { create: true })).data = content;
  }

  /** Cast to the DOM type expected by production code. */
  get handle(): FileSystemDirectoryHandle {
    return this as unknown as FileSystemDirectoryHandle;
  }
}

/** A fresh device with an empty `.kobo` folder. */
export async function freshDevice(): Promise<MemDirHandle> {
  const dev = new MemDirHandle('device');
  await dev.getDirectoryHandle('.kobo', { create: true });
  return dev;
}
