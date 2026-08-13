import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mesa — Marcador de juegos de mesa',
        short_name: 'Mesa',
        description:
          'Registra los resultados de tus partidas, consulta el histórico con cada jugador y ten las reglas siempre a mano.',
        theme_color: '#b8562f',
        background_color: '#f7f6f3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Las respuestas de Supabase NO se cachean en el service worker:
        // la lectura offline la cubre la caché persistida de TanStack Query,
        // que sabe invalidar por consulta.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})
