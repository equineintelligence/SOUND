import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'

// VITE_BASE_PATH is set by the GitHub Pages workflow to "/<repo-name>/".
// Leave it unset (or "/") when the site has its own domain.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
