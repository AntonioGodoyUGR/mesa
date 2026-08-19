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
            // Se sirven de caché sin preguntar: son cientos y no cambian de un día
            // para otro. Pero el fichero de una portada sí puede cambiar de contenido
            // sin cambiar de nombre (`npm run covers` la vuelve a bajar de BGG), y con
            // CacheFirst el móvil se quedaría con la vieja durante meses. Por eso el
            // nombre de la caché lleva versión: al subirlo, todo el mundo se baja las
            // portadas nuevas la próxima vez que abre la app.
            handler: 'CacheFirst',
            options: {
              cacheName: 'portadas-v2',
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
