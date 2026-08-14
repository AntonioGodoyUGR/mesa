import type { GameDefinition, ScoreValues } from '../games/types'

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
}

export interface Group {
  id: string
  name: string
  join_code: string
  created_by: string
  created_at: string
}

export interface GroupMember {
  group_id: string
  user_id: string
  role: 'admin' | 'member'
  profile?: Profile | null
}

/**
 * Un jugador del grupo. `user_id` a null = invitado sin cuenta:
 * tiene histórico y estadísticas propias igualmente.
 */
export interface Player {
  id: string
  group_id: string
  display_name: string
  avatar_url: string | null
  user_id: string | null
  created_at: string
}

export interface MatchPlayer {
  id: string
  match_id: string
  player_id: string
  seat: number
  scores: ScoreValues
  total: number
  rank: number
  is_winner: boolean
}

export interface Match {
  id: string
  group_id: string
  game_slug: string
  played_at: string
  notes: string | null
  winner_player_id: string | null
  created_by: string
  created_at: string
}

export interface MatchWithPlayers extends Match {
  match_players: (MatchPlayer & { player: Player })[]
}

export interface SaveMatchInput {
  groupId: string
  gameSlug: string
  playedAt: string
  notes?: string | null
  players: { playerId: string; seat: number; scores: ScoreValues }[]
  /** Ganador elegido a mano para resolver un empate. */
  winnerPlayerId?: string | null
}

export interface SaveCustomGameInput {
  groupId: string
  /** Ausente al crear: el servidor genera el slug `c-…`. */
  slug?: string
  definition: GameDefinition
}

export interface SessionUser {
  id: string
  email: string | null
  displayName: string
}

/**
 * Qué relación tiene el usuario con un juego concreto:
 * `owned` lo tiene en casa, `wishlist` le gustaría tenerlo.
 * No hay tercer estado: un juego que no está en la biblioteca no tiene fila.
 */
export type LibraryStatus = 'owned' | 'wishlist'

/**
 * Una entrada de la biblioteca personal.
 *
 * Es de la CUENTA, no del grupo: la caja está en tu estantería juegues con quien
 * juegues. Los juegos que crea un grupo también se pueden marcar, y entonces la
 * entrada solo tiene sentido mientras sigas en ese grupo.
 */
export interface LibraryEntry {
  user_id: string
  game_slug: string
  status: LibraryStatus
  created_at: string
}
