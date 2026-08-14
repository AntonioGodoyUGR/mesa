import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages publica el sitio en un subdirectorio (/table-tracker/), mientras que el
// servidor de desarrollo y Vercel lo sirven en la raíz. El workflow de Pages
// exporta BASE_PATH=/table-tracker/; en cualquier otro sitio se queda en '/'.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Table Tracker — Marcador de juegos de mesa',
        short_name: 'Table Tracker',
        description:
          'Registra los resultados de tus partidas, consulta el histórico con cada jugador y ten las reglas siempre a mano.',
        theme_color: '#1461d1',
        background_color: '#d5f2ff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        lang: 'es',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Las portadas de public/covers/ NO entran aquí a propósito: son cientos de
        // webp y precargarlas obligaría a bajarse una veintena de megas al instalar el
        // service worker. Se cachean sobre la marcha, según se van viendo.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/covers\/[^/]+\.webp$/,
            // Una portada no cambia nunca: si está en caché, no hay nada que preguntar.
            handler: 'CacheFirst',
            options: {
              cacheName: 'portadas',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 180 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Las respuestas de Supabase NO se cachean en el service worker:
        // la lectura offline la cubre la caché persistida de TanStack Query,
        // que sabe invalidar por consulta.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})
