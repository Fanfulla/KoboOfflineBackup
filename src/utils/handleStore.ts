/**
 * Persist FileSystemFileHandle objects (structured-cloneable) in IndexedDB so
 * a backup saved earlier can be verified or restored in one click.
 * Only the handle is stored: no file content ever leaves the user's disk.
 */

const DB_NAME = 'kobup';
const STORE = 'backup-handles';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export const isHandleStoreAvailable = () => typeof indexedDB !== 'undefined';

export async function saveBackupHandle(id: string, handle: FileSystemFileHandle): Promise<boolean> {
  if (!isHandleStoreAvailable()) return false;
  try {
    await withStore('readwrite', (store) => store.put(handle, id));
    return true;
  } catch {
    return false;
  }
}

export async function loadBackupHandle(id: string): Promise<FileSystemFileHandle | null> {
  if (!isHandleStoreAvailable()) return null;
  try {
    return (
      ((await withStore('readonly', (store) => store.get(id))) as FileSystemFileHandle | undefined) ?? null
    );
  } catch {
    return null;
  }
}

export async function deleteBackupHandle(id: string): Promise<void> {
  if (!isHandleStoreAvailable()) return;
  await withStore('readwrite', (store) => store.delete(id)).catch(() => {});
}

/** Get a readable File from a stored handle, asking for permission if needed. */
export async function fileFromHandle(handle: FileSystemFileHandle): Promise<File> {
  const options = { mode: 'read' } as const;
  if ((await handle.queryPermission?.(options)) !== 'granted') {
    if ((await handle.requestPermission?.(options)) !== 'granted') {
      throw new DOMException('Permission to read the backup file was denied', 'NotAllowedError');
    }
  }
  return handle.getFile();
}
