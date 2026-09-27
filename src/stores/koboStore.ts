/**
 * Global state (Zustand).
 *  - session: the connected device and its scan (shared by Backup and Library)
 *  - history: past backups, persisted to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BackupHistoryEntry, ScanResult } from '../types/kobo.ts';
import type { KoboSource } from '../utils/deviceSource.ts';

interface KoboState {
  source: KoboSource | null;
  scan: ScanResult | null;
  backups: BackupHistoryEntry[];
  /** A backup file handed from History to the Restore page. */
  pendingRestore: File | null;

  setDevice: (source: KoboSource, scan: ScanResult) => void;
  setPendingRestore: (file: File | null) => void;
  clearDevice: () => void;
  addBackup: (backup: BackupHistoryEntry) => void;
  removeBackup: (id: string) => void;
}

const MAX_HISTORY = 20;

export const newBackupId = () => `backup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useKoboStore = create<KoboState>()(
  persist(
    (set) => ({
      source: null,
      scan: null,
      backups: [],
      pendingRestore: null,

      setDevice: (source, scan) => set({ source, scan }),
      setPendingRestore: (pendingRestore) => set({ pendingRestore }),
      clearDevice: () => set({ source: null, scan: null }),

      addBackup: (backup) => set((state) => ({ backups: [backup, ...state.backups].slice(0, MAX_HISTORY) })),
      removeBackup: (id) => set((state) => ({ backups: state.backups.filter((b) => b.id !== id) })),
    }),
    {
      name: 'kobo-backup-storage',
      partialize: (state) => ({ backups: state.backups }),
      // Rehydrated on the client after mount (see App) so prerendered HTML matches.
      skipHydration: true,
    },
  ),
);
