import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        // Spikes de Sprint 0; salen del build cuando el motor real los reemplaza.
        spike: fileURLToPath(new URL('./spike.html', import.meta.url)),
        'spike-layers': fileURLToPath(new URL('./spike-layers.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    headers: {
      // Habilita SharedArrayBuffer y los threads de WASM en localhost.
      // La app debe seguir funcionando sin estas cabeceras (architecture.md §5).
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
