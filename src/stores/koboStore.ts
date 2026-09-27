/**
 * Global state (Zustand). Only the backup history is persisted.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BackupHistoryEntry,
  DeviceInfo,
  KoboAnnotation,
  KoboBook,
  ReadingStats,
} from '../types/kobo.ts';
import type { KoboSource } from '../utils/deviceSource.ts';

export type Page = 'home' | 'dashboard' | 'backup' | 'restore' | 'history' | 'guide' | 'faq' | 'privacy';

interface KoboState {
  device: DeviceInfo | null;
  books: KoboBook[];
  annotations: KoboAnnotation[];
  stats: ReadingStats | null;
  source: KoboSource | null;
  backups: BackupHistoryEntry[];
  currentPage: Page;

  setDevice: (device: DeviceInfo | null) => void;
  setBooks: (books: KoboBook[]) => void;
  setAnnotations: (annotations: KoboAnnotation[]) => void;
  setStats: (stats: ReadingStats | null) => void;
  setSource: (source: KoboSource | null) => void;
  addBackup: (backup: Omit<BackupHistoryEntry, 'id'>) => void;
  removeBackup: (id: string) => void;
  setCurrentPage: (page: Page) => void;
  clearDevice: () => void;
}

const MAX_HISTORY = 20;

export const useKoboStore = create<KoboState>()(
  persist(
    (set) => ({
      device: null,
      books: [],
      annotations: [],
      stats: null,
      source: null,
      backups: [],
      currentPage: 'home',

      setDevice: (device) => set({ device }),
      setBooks: (books) => set({ books }),
      setAnnotations: (annotations) => set({ annotations }),
      setStats: (stats) => set({ stats }),
      setSource: (source) => set({ source }),

      addBackup: (backup) =>
        set((state) => ({
          backups: [{ id: `backup_${Date.now()}`, ...backup }, ...state.backups].slice(0, MAX_HISTORY),
        })),

      removeBackup: (id) => set((state) => ({ backups: state.backups.filter((b) => b.id !== id) })),

      setCurrentPage: (page) => set({ currentPage: page }),

      clearDevice: () => set({ device: null, books: [], annotations: [], stats: null, source: null }),
    }),
    {
      name: 'kobo-backup-storage',
      partialize: (state) => ({ backups: state.backups }),
    },
  ),
);
