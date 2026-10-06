import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // ADR-017: Workbox via vite-plugin-pwa en vez de un service worker a mano.
      registerType: 'autoUpdate',
      // Las paginas de spike no son parte de la app real (architecture.md dice que salen
      // del build cuando el motor las reemplaza) y no deben quedar cacheadas offline.
      includeAssets: ['icons/mark.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['spike.html', 'spike-layers.html', '**/dev/**', '**/spike*.{js,css}'],
        // Sin ancla ^: en GitHub Pages las rutas viven bajo /stratum/.
        navigateFallbackDenylist: [/\/spike(-layers)?\.html$/, /\/dev\//],
      },
      manifest: {
        id: '/',
        name: 'Stratum — editor de imágenes',
        short_name: 'Stratum',
        description:
          'Editor de imagenes raster por capas, 100% en el navegador, con IA local y privada.',
        lang: 'es',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        // Mismo tono que --bg-app en packages/ui-kit/src/tokens.css.
        background_color: '#17181b',
        theme_color: '#17181b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        // Spikes de Sprint 0; salen del build cuando el motor real los reemplaza.
        spike: fileURLToPath(new URL('./spike.html', import.meta.url)),
        'spike-layers': fileURLToPath(new URL('./spike-layers.html', import.meta.url)),
        // Kitchen Sink del ui-kit (S0-11): referencia viva, se publica pero no se cachea offline.
        'dev/ui': fileURLToPath(new URL('./dev/ui.html', import.meta.url)),
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
