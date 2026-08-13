import { isSupabaseConfigured } from './supabase'
import { supabaseApi } from './api.supabase'
import { demoApi } from './api.demo'
import type { GameDefinition } from '../games/types'
import type {
  Group,
  GroupMember,
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
}
