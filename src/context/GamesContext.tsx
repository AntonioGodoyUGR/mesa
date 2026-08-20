import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { api, queryKeys } from '../lib/api'
import { GAMES } from '../games/registry'
import { CATALOG_PAGE, filterGames, needsBggLookup, type GameFilters } from '../games/filters'
import { useGroup } from './GroupContext'
import type { GameDefinition } from '../games/types'
import type { CatalogQuery } from '../lib/types'

/**
 * Resolución de juegos en tiempo de ejecución.
 *
 * Ya no hay «la lista de juegos»: el catálogo vive en la base de datos y puede tener
 * decenas de miles de filas, así que este contexto NO expone ningún array completo. Lo
 * que expone es cómo resolver un slug, que es lo único que necesita una pantalla:
 *
 *   1. los juegos que se ha inventado el grupo (`listGames`, son un puñado),
 *   2. los que viajan dentro de la app —arranque en frío y modo demostración—,
 *   3. los que ya se han traído del servidor en esta sesión (`remember`).
 *
 * Los tres pasos son síncronos a propósito: una tarjeta de partida tiene que pintar el
 * nombre de su juego sin esperar a nadie. Quien pueda encontrarse con un slug que no
 * esté en ninguno de los tres —la cola larga del catálogo— usa `useGame` (uno) o
 * `useGamesBySlugs` (varios de golpe, nunca una petición por juego).
 *
 * `registry.ts` sigue exponiendo sus funciones puras (`computeTotal`, `rankPlayers`…),
 * que reciben la definición por parámetro y no necesitan saber de dónde salió.
 */
interface GamesValue {
  /** Los juegos del grupo activo. Es la única lista que sigue siendo pequeña. */
  custom: GameDefinition[]
  getGame: (slug: string | undefined) => GameDefinition | undefined
  /** Guarda lo que llegue del servidor para que `getGame` lo resuelva sin esperar. */
  remember: (games: GameDefinition[]) => void
  loading: boolean
}

/**
 * Un día. El catálogo oficial es idéntico para todo el mundo y no cambia de una tarde
 * para otra: cacheado así, miles de personas buscando lo mismo comparten respuesta.
 */
const CATALOG_STALE = 1000 * 60 * 60 * 24

/**
 * Lo que se espera desde la última tecla hasta pedirle nada al servidor.
 *
 * Cuando el catálogo estaba en memoria no hacía falta: buscar era filtrar un array. Con
 * la búsqueda en el servidor, sin esto «catan» serían cinco peticiones.
 */
const SEARCH_DELAY = 250

const GamesContext = createContext<GamesValue | null>(null)

export function GamesProvider({ children }: { children: ReactNode }) {
  const { group } = useGroup()

  const gamesQuery = useQuery({
    queryKey: queryKeys.games(group?.id ?? ''),
    queryFn: () => api.listGames(group!.id),
    enabled: !!group,
  })

  const custom = useMemo(() => gamesQuery.data ?? [], [gamesQuery.data])

  const [known, setKnown] = useState<ReadonlyMap<string, GameDefinition>>(() => new Map())

  // Solo se apunta lo que no estaba: si no hay nada nuevo se devuelve el mismo mapa y
  // React no vuelve a pintar. Sin esa comparación, cada respuesta del catálogo
  // dispararía un render que volvería a apuntar lo mismo, y otro, y otro.
  const remember = useCallback((games: GameDefinition[]) => {
    setKnown((current) => {
      const fresh = games.filter((game) => !current.has(game.slug))
      if (fresh.length === 0) return current
      const next = new Map(current)
      for (const game of fresh) next.set(game.slug, game)
      return next
    })
  }, [])

  const value = useMemo<GamesValue>(() => {
    const own = new Map(custom.map((game) => [game.slug, game]))

    return {
      custom,
      remember,
      // El del grupo manda sobre el del catálogo, y el que viaja en la app sobre el que
      // llegó por red: si un juego tiene hoja escrita a mano, esa es la buena.
      getGame: (slug) =>
        slug ? (own.get(slug) ?? GAMES[slug] ?? known.get(slug)) : undefined,
      loading: !!group && gamesQuery.isLoading,
    }
  }, [custom, group, gamesQuery.isLoading, known, remember])

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export function useGames(): GamesValue {
  const value = useContext(GamesContext)
  if (!value) throw new Error('useGames debe usarse dentro de <GamesProvider>')
  return value
}

/** Retrasa un valor: solo cambia cuando deja de cambiar durante `delay`. */
function useDebounced<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return settled
}

export interface CatalogSearch {
  /** Lo traído hasta ahora, en el orden que manda el servidor. */
  games: GameDefinition[]
  loading: boolean
  /** Queda más por traer. */
  more: boolean
  loadingMore: boolean
  showMore: () => void
  error: Error | null
}

/**
 * El catálogo, por tandas y desde el servidor.
 *
 * Los criterios son los mismos que pinta `GameFinder` y van tal cual a `search_catalog`:
 * filtrar en el cliente dejó de ser posible cuando la lista dejó de caber en el cliente.
 * El texto se retrasa; los chips de filtro no, porque tocar uno ya es una decisión
 * tomada.
 */
export function useCatalogSearch(
  filters: GameFilters,
  options: { groupId?: string; enabled?: boolean } = {},
): CatalogSearch {
  const { remember } = useGames()
  const query = useDebounced(filters.query.trim(), SEARCH_DELAY)
  const enabled = options.enabled ?? true

  const criteria: CatalogQuery = {
    query,
    durations: filters.durations,
    difficulties: filters.difficulties,
    players: filters.players,
    groupId: options.groupId,
  }

  const catalog = useInfiniteQuery({
    // La consulta ES la clave: dos personas buscando lo mismo comparten respuesta.
    queryKey: queryKeys.catalog(criteria),
    queryFn: ({ pageParam }) =>
      api.searchCatalog({ ...criteria, limit: CATALOG_PAGE, offset: pageParam }),
    initialPageParam: 0,
    // Una tanda incompleta es el final: así no hay que pedir el total por separado.
    getNextPageParam: (last, pages) =>
      last.length < CATALOG_PAGE ? undefined : pages.length * CATALOG_PAGE,
    staleTime: CATALOG_STALE,
    enabled,
  })

  const found = useMemo(() => catalog.data?.pages.flat() ?? [], [catalog.data])

  /**
   * El rescate: lo que el catálogo no tiene, se le pregunta a BoardGameGeek.
   *
   * Va después y aparte, nunca en vez de: primero se responde con lo que hay —que es
   * instantáneo y es el 99 % de las veces— y solo si eso se queda corto sale la
   * petición lenta. Se espera además a que el catálogo termine (`isFetching`), porque
   * con resultados a medio llegar no se sabe todavía si hace falta.
   */
  const rescue = useQuery({
    queryKey: queryKeys.resolve(query),
    queryFn: () => api.resolveGame(query),
    enabled: enabled && !catalog.isFetching && needsBggLookup(query, found.length),
    staleTime: CATALOG_STALE,
  })

  const games = useMemo(() => {
    if (!rescue.data?.length) return found

    // Los filtros de pantalla se aplican aquí porque BGG no los conoce: busca por
    // nombre y devuelve lo que encuentra. El texto se deja fuera a propósito —de eso
    // se ha encargado ya BGG, y su criterio es mejor que un `includes`—, pero «a
    // cuatro jugadores» o «menos de media hora» tienen que seguir cumpliéndose.
    const known = new Set(found.map((game) => game.slug))
    const extra = filterGames(rescue.data, { ...filters, query: '' }).filter(
      (game) => !known.has(game.slug),
    )
    return extra.length > 0 ? [...found, ...extra] : found
  }, [found, rescue.data, filters])

  // Lo que se ha pintado una vez se resuelve después sin volver a pedirlo: es lo que
  // hace que abrir la ficha de un juego recién buscado no espere a nadie.
  useEffect(() => {
    if (games.length > 0) remember(games)
  }, [games, remember])

  return {
    games,
    // El rescate cuenta como «buscando» solo mientras no haya nada que enseñar: con
    // dos juegos ya en pantalla, taparlos con una ruedecita sería ir a peor. Sin
    // ninguno, el aviso de «no hay nada» sería mentira todavía.
    loading: enabled && (catalog.isLoading || (found.length === 0 && rescue.isFetching)),
    more: catalog.hasNextPage,
    loadingMore: catalog.isFetchingNextPage,
    showMore: () => {
      if (catalog.hasNextPage && !catalog.isFetchingNextPage) void catalog.fetchNextPage()
    },
    error: catalog.error,
  }
}

/**
 * Un juego con todo lo suyo, incluida la chuleta de reglas.
 *
 * Se pregunta al servidor salvo que el juego ya esté entero, que es lo que pasa con los
 * 24 que viajan en la app y con los que se inventa el grupo. Una fila del catálogo, en
 * cambio, llega sin chuleta: son ~2,8 kB que no pintan nada en una rejilla de tarjetas y
 * que solo hacen falta en la ficha, así que se piden aquí. Mientras llegan se devuelve
 * la copia que ya había, y por eso abrir un juego recién buscado no espera a nadie.
 */
export function useGame(slug: string | undefined): {
  game: GameDefinition | undefined
  loading: boolean
  /** Hay un juego que pintar, pero todavía le falta lo que no cabe en una fila. */
  completing: boolean
} {
  const { getGame, remember, loading } = useGames()
  const local = getGame(slug)
  const complete = !!local && (!!local.rules || !!local.groupId)

  const query = useQuery({
    queryKey: queryKeys.game(slug ?? ''),
    queryFn: () => api.getGameBySlug(slug!),
    enabled: !!slug && !complete && !loading,
    staleTime: CATALOG_STALE,
  })

  useEffect(() => {
    if (query.data) remember([query.data])
  }, [query.data, remember])

  return {
    game: query.data ?? local,
    loading: loading || (!local && query.isLoading),
    completing: !!local && query.isLoading,
  }
}

/**
 * Varios juegos de una vez.
 *
 * Es lo que necesitan la biblioteca y el historial: decenas de slugs sueltos que hay que
 * convertir en nombres y portadas. Solo se pide lo que no se puede resolver ya, y en una
 * sola petición: una por juego serían cuarenta al abrir un perfil.
 */
export function useGamesBySlugs(slugs: string[]): {
  games: GameDefinition[]
  loading: boolean
} {
  const { getGame, remember } = useGames()

  const wanted = useMemo(() => [...new Set(slugs)], [slugs])
  const missing = useMemo(() => wanted.filter((slug) => !getGame(slug)), [wanted, getGame])

  const query = useQuery({
    queryKey: queryKeys.gamesBySlugs(missing),
    queryFn: () => api.getGamesBySlugs(missing),
    enabled: missing.length > 0,
    staleTime: CATALOG_STALE,
  })

  useEffect(() => {
    if (query.data && query.data.length > 0) remember(query.data)
  }, [query.data, remember])

  const games = useMemo(
    () => wanted.map(getGame).filter((game): game is GameDefinition => !!game),
    [wanted, getGame],
  )

  return { games, loading: query.isLoading }
}

/**
 * Los juegos que salen en una lista de partidas, resueltos de una tacada.
 *
 * Lo llama la pantalla que pinta las partidas, no cada tarjeta: si lo pidiera la
 * tarjeta serían tantas peticiones como filas.
 */
export function useMatchGames(matches: { game_slug: string }[]): void {
  const slugs = useMemo(() => matches.map((match) => match.game_slug), [matches])
  useGamesBySlugs(slugs)
}
