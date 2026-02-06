import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'db': ['sql.js'], // SQLite WASM - large file, separate chunk
          'zip': ['jszip'], // ZIP library - separate chunk
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Don't exclude sql.js - let Vite handle it
  },
  server: {
    headers: {
      // Enable SharedArrayBuffer for sql.js WASM
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
