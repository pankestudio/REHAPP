// vite.config.js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    viteSingleFile(),
  ],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100_000_000,
    // Ensure sw.js is copied as-is from public/ — not processed by singlefile
    // (vite-plugin-singlefile only inlines the entry HTML bundle)
    copyPublicDir: true,
  },
  // Dev server: serve sw.js and manifest from public/
  server: {
    headers: {
      // Required for correct SW scope in dev
      'Service-Worker-Allowed': '/',
    },
  },
});