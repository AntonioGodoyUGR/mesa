import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import App from './App'
import { applyStoredTheme } from './lib/theme'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: WEEK }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
