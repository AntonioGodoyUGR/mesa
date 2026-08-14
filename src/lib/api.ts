import { isSupabaseConfigured } from './supabase'
import { supabaseApi } from './api.supabase'
import { demoApi } from './api.demo'
import type { GameDefinition } from '../games/types'
import type {
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
export interface MesaApi {
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

export const api: MesaApi = isSupabaseConfigured ? supabaseApi : demoApi

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
  // Las estadísticas globales son de la app entera: no dependen ni del grupo ni
  // de la cuenta, solo del juego.
  gameStats: (gameSlug: string) => ['game-stats', gameSlug] as const,
  // La biblioteca es de la cuenta, no del grupo: no lleva id en la clave.
  library: ['library'] as const,
}
