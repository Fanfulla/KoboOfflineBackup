/**
 * A read-only view of a connected Kobo, independent of how it was opened:
 *  - `directory`: File System Access API handle (Chromium; also writable for restore)
 *  - `files`: a FileList from <input webkitdirectory> (Firefox/Safari backup)
 */

export interface SourceFile {
  /** Path relative to the device root, e.g. "Author/Title.kepub.epub". */
  path: string;
  name: string;
  size: number;
  getFile(): Promise<File>;
}

export interface ListOptions {
  /** Include files inside hidden folders (".kobo", ".kobo-images", ...). */
  includeHidden?: boolean;
  /** Only list files under this relative folder. */
  under?: string;
}

export interface KoboSource {
  readonly kind: 'directory' | 'files';
  /** Present for `directory` sources: needed for writing (restore). */
  readonly handle?: FileSystemDirectoryHandle;
  getFile(path: string): Promise<File | null>;
  listFiles(options?: ListOptions): Promise<SourceFile[]>;
}

const SYSTEM_FOLDERS = new Set(['System Volume Information', '$RECYCLE.BIN']);

function splitPath(path: string): string[] {
  return path.replace(/\\/g, '/').split('/').filter(Boolean);
}

const isHiddenSegment = (segment: string) => segment.startsWith('.') || SYSTEM_FOLDERS.has(segment);

function matches(path: string, { includeHidden = false, under }: ListOptions): boolean {
  const parts = splitPath(path);
  if (under) {
    const prefix = splitPath(under);
    if (!prefix.every((p, i) => parts[i] === p)) return false;
  }
  // The file name itself may start with a dot; only folders make it hidden.
  return includeHidden || !parts.slice(0, -1).some(isHiddenSegment);
}

export function directorySource(root: FileSystemDirectoryHandle): KoboSource {
  const dirCache = new Map<string, Promise<FileSystemDirectoryHandle>>();

  const getDir = (parts: string[]): Promise<FileSystemDirectoryHandle> => {
    if (parts.length === 0) return Promise.resolve(root);
    const key = parts.join('/');
    let cached = dirCache.get(key);
    if (!cached) {
      cached = getDir(parts.slice(0, -1)).then((parent) => parent.getDirectoryHandle(parts.at(-1)!));
      // Do not cache failures (the folder may be created later).
      cached.catch(() => dirCache.delete(key));
      dirCache.set(key, cached);
    }
    return cached;
  };

  async function walk(
    dir: FileSystemDirectoryHandle,
    prefix: string,
    options: ListOptions,
    out: SourceFile[],
  ) {
    for await (const entry of dir.values()) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.kind === 'directory') {
        if (options.includeHidden || !isHiddenSegment(entry.name)) await walk(entry, path, options, out);
      } else if (matches(path, options)) {
        const handle = entry;
        let size = 0;
        try {
          size = (await handle.getFile()).size;
        } catch {
          // unreadable entry: keep it with size 0, the backup will report it
        }
        out.push({ path, name: entry.name, size, getFile: () => handle.getFile() });
      }
    }
  }

  return {
    kind: 'directory',
    handle: root,
    async getFile(path) {
      const parts = splitPath(path);
      try {
        const dir = await getDir(parts.slice(0, -1));
        return await (await dir.getFileHandle(parts.at(-1)!)).getFile();
      } catch {
        return null;
      }
    },
    async listFiles(options = {}) {
      const out: SourceFile[] = [];
      const start = options.under ? splitPath(options.under) : [];
      try {
        await walk(await getDir(start), start.join('/'), options, out);
      } catch (error) {
        // A missing optional folder (e.g. "fonts") is normal.
        if ((error as { name?: string } | null)?.name !== 'NotFoundError') {
          console.error('[Source] Error reading directory:', options.under || '/', error);
        }
      }
      return out;
    },
  };
}

/**
 * Build a source from <input type="file" webkitdirectory> files. Their
 * webkitRelativePath starts with the picked folder's name, which is removed.
 */
export function fileListSource(files: Iterable<File>): KoboSource {
  const byPath = new Map<string, File>();
  for (const file of files) {
    const parts = splitPath(file.webkitRelativePath || file.name);
    byPath.set((parts.length > 1 ? parts.slice(1) : parts).join('/'), file);
  }

  return {
    kind: 'files',
    async getFile(path) {
      return byPath.get(splitPath(path).join('/')) ?? null;
    },
    async listFiles(options = {}) {
      return [...byPath]
        .filter(([path]) => matches(path, options))
        .map(([path, file]) => ({ path, name: file.name, size: file.size, getFile: async () => file }));
    },
  };
}
