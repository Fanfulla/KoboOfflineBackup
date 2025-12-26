/**
 * Zustand store for global state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useKoboStore = create(
  persist(
    (set, get) => ({
      // Device state
      device: null,
      books: [],
      annotations: [],
      stats: null,

      // Backup history (persisted to localStorage)
      backups: [],

      // User settings
      settings: {
        theme: 'light',
        language: 'en',
        includeAnnotationsByDefault: true,
        includeProgressByDefault: true,
        includeSettingsByDefault: false,
      },

      // UI state
      currentPage: 'home',

      // Actions
      setDevice: (device) => set({ device }),

      setBooks: (books) => set({ books }),

      setAnnotations: (annotations) => set({ annotations }),

      setStats: (stats) => set({ stats }),

      addBackup: (backup) =>
        set((state) => ({
          backups: [
            {
              id: `backup_${Date.now()}`,
              ...backup,
            },
            ...state.backups,
          ].slice(0, 20), // Keep only last 20 backups in history
        })),

      removeBackup: (id) =>
        set((state) => ({
          backups: state.backups.filter((b) => b.id !== id),
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setCurrentPage: (page) => set({ currentPage: page }),

      clearDevice: () =>
        set({
          device: null,
          books: [],
          annotations: [],
          stats: null,
        }),

      reset: () =>
        set({
          device: null,
          books: [],
          annotations: [],
          stats: null,
          currentPage: 'home',
        }),
    }),
    {
      name: 'kobo-backup-storage',
      // Only persist backups and settings, not device data
      partialize: (state) => ({
        backups: state.backups,
        settings: state.settings,
      }),
    }
  )
);
