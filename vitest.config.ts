import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/**
 * Configuración propia de los tests: la de Vite arrastra el plugin de PWA,
 * que no pinta nada aquí.
 */
export default defineConfig({
  plugins: [react()],
  // Los tests recorren la app en modo demostración, con los datos de mentira
  // de `api.demo.ts`. Si Vite cargase el `.env` real, `isSupabaseConfigured`
  // daría true y las pruebas acabarían llamando a Supabase de verdad.
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
})
