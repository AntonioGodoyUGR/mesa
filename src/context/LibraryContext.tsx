import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, queryKeys } from '../lib/api'
import { countLibrary, libraryIndex, type LibraryCounts } from '../lib/library'
import { useAuth } from './AuthContext'
import type { LibraryEntry, LibraryStatus } from '../lib/types'

/**
 * Biblioteca personal de la cuenta con la sesión iniciada.
 *
 * Va aparte de `GamesContext` porque no habla del catálogo sino de TI: los mismos
 * juegos, marcados como comprados o deseados. Y aparte de `GroupContext` porque no
 * es del grupo: la caja sigue en tu estantería juegues con quien juegues, así que
 * la lista no se recarga al cambiar de grupo.
 */
interface LibraryValue {
  entries: LibraryEntry[]
  counts: LibraryCounts
  /** Cómo tienes marcado un juego, o `undefined` si no está en la biblioteca. */
  statusOf: (slug: string) => LibraryStatus | undefined
  /** Marca, mueve de sección o —con `null`— saca el juego de la biblioteca. */
  setStatus: (slug: string, status: LibraryStatus | null) => void
  loading: boolean
  saving: boolean
  error: unknown
}

const LibraryContext = createContext<LibraryValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const libraryQuery = useQuery({
    queryKey: queryKeys.library,
    queryFn: () => api.listLibrary(),
    enabled: !!user,
  })

  const entries = useMemo(() => libraryQuery.data ?? [], [libraryQuery.data])

  const save = useMutation({
    mutationFn: ({ slug, status }: { slug: string; status: LibraryStatus | null }) =>
      api.setLibraryStatus(slug, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.library }),
  })

  // `useMutation` devuelve un objeto nuevo en cada render: se desmenuza para que el
  // valor del contexto no cambie de identidad sin que haya cambiado nada.
  const { mutate, isPending, error } = save

  const value = useMemo<LibraryValue>(() => {
    const index = libraryIndex(entries)

    return {
      entries,
      counts: countLibrary(entries),
      statusOf: (slug) => index.get(slug),
      setStatus: (slug, status) => mutate({ slug, status }),
      loading: !!user && libraryQuery.isLoading,
      saving: isPending,
      error,
    }
  }, [entries, user, libraryQuery.isLoading, mutate, isPending, error])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryValue {
  const value = useContext(LibraryContext)
  if (!value) throw new Error('useLibrary debe usarse dentro de <LibraryProvider>')
  return value
}
