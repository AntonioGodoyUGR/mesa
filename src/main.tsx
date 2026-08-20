import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import App from './App'
import { applyStoredTheme } from './lib/theme'
import { dropStaleCaches } from './lib/caches'
import './index.css'

const WEEK = 1000 * 60 * 60 * 24 * 7

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // La caché sobrevive al cierre de la app: es lo que permite consultar
      // reglas e histórico sin cobertura. Al recuperar red se refresca sola.
      gcTime: WEEK,
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Guardar una partida sí exige conexión: no se encola nada offline.
      networkMode: 'online',
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'mesa.query-cache',
})

applyStoredTheme()
dropStaleCaches()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: WEEK,
        dehydrateOptions: {
          // El catálogo no se guarda en disco. Cada búsqueda es una clave distinta
          // con sus fichas dentro, y `localStorage` son 5 MB para toda la app: unas
          // cuantas búsquedas lo llenarían y se perdería lo que de verdad hace falta
          // sin cobertura —partidas, biblioteca, fichas ya vistas—, que sí se guarda.
          // Volver a pedir el catálogo es una consulta; recuperar lo otro, imposible.
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) && query.queryKey[0] !== 'catalog',
        },
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
