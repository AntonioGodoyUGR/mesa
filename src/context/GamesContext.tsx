import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '../lib/api'
import { BUILTIN_GAMES } from '../games/registry'
import { useGroup } from './GroupContext'
import type { GameDefinition } from '../games/types'

/**
 * Resolución de juegos en tiempo de ejecución.
 *
 * El catálogo integrado viaja en el bundle, pero los juegos que se inventa un grupo
 * viven en la base de datos, así que ya no vale con importar `getGame` del registro:
 * hay que preguntar por los dos sitios. Este contexto junta ambas listas y es lo que
 * usan las pantallas. `registry.ts` sigue exponiendo sus funciones puras
 * (`computeTotal`, `rankPlayers`…), que reciben la definición por parámetro y no
 * necesitan saber de dónde salió.
 */
interface GamesValue {
  /** Integrados + los del grupo activo. */
  games: GameDefinition[]
  builtin: GameDefinition[]
  custom: GameDefinition[]
  getGame: (slug: string | undefined) => GameDefinition | undefined
  loading: boolean
}

const GamesContext = createContext<GamesValue | null>(null)

export function GamesProvider({ children }: { children: ReactNode }) {
  const { group } = useGroup()

  const gamesQuery = useQuery({
    queryKey: queryKeys.games(group?.id ?? ''),
    queryFn: () => api.listGames(group!.id),
    enabled: !!group,
  })

  const custom = useMemo(() => gamesQuery.data ?? [], [gamesQuery.data])

  const value = useMemo<GamesValue>(() => {
    const games = [...BUILTIN_GAMES, ...custom]
    const index = new Map(games.map((game) => [game.slug, game]))

    return {
      games,
      builtin: BUILTIN_GAMES,
      custom,
      getGame: (slug) => (slug ? index.get(slug) : undefined),
      loading: !!group && gamesQuery.isLoading,
    }
  }, [custom, group, gamesQuery.isLoading])

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export function useGames(): GamesValue {
  const value = useContext(GamesContext)
  if (!value) throw new Error('useGames debe usarse dentro de <GamesProvider>')
  return value
}
