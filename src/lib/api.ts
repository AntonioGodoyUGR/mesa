import { isSupabaseConfigured } from './supabase'
import { supabaseApi } from './api.supabase'
import { demoApi } from './api.demo'
import type { GameDefinition } from '../games/types'
import type {
  CatalogQuery,
  GameGlobalStats,
  Group,
  GroupMember,
  LibraryEntry,
  LibraryStatus,
  MatchWithPlayers,
  Player,
  SaveCustomGameInput,
  SaveMatchInput,
  SessionUser,
} from './types'

/**
 * Contrato único de datos.
 *
 * La app entera habla con esta interfaz y nunca con Supabase directamente.
 * Hay dos implementaciones y se elige UNA sola vez, aquí abajo:
 *   · `supabaseApi` — la real.
 *   · `demoApi`     — datos en memoria, para probar la interfaz sin backend.
 */
export interface TableTrackerApi {
  getUser(): Promise<SessionUser | null>
  onUserChange(callback: (user: SessionUser | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string, displayName: string): Promise<void>
  signOut(): Promise<void>

  listGroups(): Promise<Group[]>
  createGroup(name: string): Promise<Group>
  joinGroup(code: string): Promise<Group>
  listMembers(groupId: string): Promise<GroupMember[]>

  listPlayers(groupId: string): Promise<Player[]>
  addPlayer(groupId: string, displayName: string): Promise<Player>
  renamePlayer(playerId: string, displayName: string): Promise<void>
  /**
   * Guarda el muñeco de un jugador (`lib/avatar.ts` decide qué significa la cadena).
   * Con `null` vuelve al que le toca por su nombre.
   */
  setPlayerAvatar(playerId: string, avatar: string | null): Promise<void>

  listMatches(groupId: string): Promise<MatchWithPlayers[]>
  saveMatch(input: SaveMatchInput): Promise<string>
  deleteMatch(matchId: string): Promise<void>

  /** Los juegos que ha creado este grupo (el catálogo integrado no viaja por red). */
  listGames(groupId: string): Promise<GameDefinition[]>

  /**
   * Busca en el catálogo, con los mismos criterios que el buscador de pantalla.
   *
   * Devuelve definiciones ya montadas, no filas: el servidor manda lo mínimo y
   * `catalogGame()` reconstruye el resto con lo que ya viaja en el bundle. Ningún
   * componente tiene que saber que el catálogo dejó de estar dentro de la app.
   *
   * Las definiciones NO traen la chuleta de reglas: eso se pide al abrir la ficha,
   * con `getGameBySlug`.
   */
  searchCatalog(query: CatalogQuery): Promise<GameDefinition[]>
  /** Un juego con todo lo suyo, chuleta incluida. `null` si no existe. */
  getGameBySlug(slug: string): Promise<GameDefinition | null>
  /**
   * Resuelve varios juegos de una vez, sin chuleta.
   * Es lo que necesitan la biblioteca y el historial: decenas de slugs sueltos que
   * hay que convertir en nombres y portadas sin hacer una petición por cabeza.
   */
  getGamesBySlugs(slugs: string[]): Promise<GameDefinition[]>
  /** Devuelve el slug: al crear, el que ha generado el servidor. */
  saveCustomGame(input: SaveCustomGameInput): Promise<string>
  deleteCustomGame(slug: string): Promise<void>
  /** Sube la portada ya redimensionada y devuelve su URL pública. */
  uploadGameImage(groupId: string, file: Blob): Promise<string>

  /**
   * Cómo se juega a un juego en toda la app, en agregado.
   * No necesita sesión: la ficha de un juego se consulta como invitado.
   */
  getGameStats(gameSlug: string): Promise<GameGlobalStats>

  /** La biblioteca de la cuenta con la sesión iniciada: comprados y deseados. */
  listLibrary(): Promise<LibraryEntry[]>
  /** Marca un juego, lo mueve de sección o —con `null`— lo saca de la biblioteca. */
  setLibraryStatus(gameSlug: string, status: LibraryStatus | null): Promise<void>
}

export const api: TableTrackerApi = isSupabaseConfigured ? supabaseApi : demoApi

/** `true` cuando la app funciona con datos de mentira en memoria. */
export const isDemoMode = !isSupabaseConfigured

/** Claves de consulta de TanStack Query, en un único sitio. */
export const queryKeys = {
  user: ['user'] as const,
  groups: ['groups'] as const,
  members: (groupId: string) => ['members', groupId] as const,
  players: (groupId: string) => ['players', groupId] as const,
  matches: (groupId: string) => ['matches', groupId] as const,
  games: (groupId: string) => ['games', groupId] as const,
  // La consulta ES la clave. El catálogo oficial es idéntico para todo el mundo y no
  // cambia de un día para otro, así que se puede cachear a lo bruto (`staleTime` de
  // un día) y miles de personas buscando lo mismo comparten respuesta. El grupo va
  // dentro de la consulta porque sus juegos propios salen en la misma lista.
  catalog: (query: CatalogQuery) => ['catalog', query] as const,
  game: (slug: string) => ['game', slug] as const,
  // Ordenados: la misma biblioteca pedida en otro orden es la misma consulta.
  gamesBySlugs: (slugs: string[]) => ['games-by-slug', [...slugs].sort()] as const,
  // Las estadísticas globales son de la app entera: no dependen ni del grupo ni
  // de la cuenta, solo del juego.
  gameStats: (gameSlug: string) => ['game-stats', gameSlug] as const,
  // La biblioteca es de la cuenta, no del grupo: no lleva id en la clave.
  library: ['library'] as const,
}
