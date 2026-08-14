import { getGame } from '../games/registry'
import type { GameDefinition } from '../games/types'
import type { MatchWithPlayers, Player } from './types'

/**
 * Todas las estadísticas se calculan en el cliente a partir de la lista de
 * partidas del grupo, que ya está en la caché persistida. Ventaja: los perfiles
 * y el cara a cara siguen funcionando sin conexión, sin vistas SQL adicionales.
 */

/**
 * Cómo se traduce un slug a su definición. Por defecto solo mira el catálogo
 * integrado; las pantallas le pasan el `getGame` de `useGames()` para que los
 * juegos que se ha inventado el grupo también cuenten con su regla de victoria.
 */
export type ResolveGame = (slug: string) => GameDefinition | undefined

export interface GameRecord {
  gameSlug: string
  played: number
  wins: number
  bestTotal: number | null
  averageTotal: number | null
}

export interface PlayerStats {
  played: number
  wins: number
  winRate: number
  /** Partidas ganadas seguidas contando desde la más reciente. */
  currentStreak: number
  byGame: GameRecord[]
  favouriteGame: string | null
}

function participation(match: MatchWithPlayers, playerId: string) {
  return match.match_players.find((entry) => entry.player_id === playerId)
}

/** Partidas en las que aparece el jugador, de la más reciente a la más antigua. */
export function matchesOf(
  matches: MatchWithPlayers[],
  playerId: string,
): MatchWithPlayers[] {
  return matches.filter((match) => participation(match, playerId))
}

/**
 * Las partidas de un juego concreto, conservando el orden de entrada
 * (de la más reciente a la más antigua).
 *
 * Pasando el resultado a `computePlayerStats` o a `computeLeaderboard` se
 * obtienen esas mismas estadísticas acotadas a un solo juego, sin duplicar
 * ni un cálculo.
 */
export function matchesOfGame(
  matches: MatchWithPlayers[],
  gameSlug: string,
): MatchWithPlayers[] {
  return matches.filter((match) => match.game_slug === gameSlug)
}

export function computePlayerStats(
  matches: MatchWithPlayers[],
  playerId: string,
  resolve: ResolveGame = getGame,
): PlayerStats {
  const own = matchesOf(matches, playerId)
  const byGame = new Map<string, { played: number; wins: number; totals: number[] }>()

  let wins = 0
  for (const match of own) {
    const entry = participation(match, playerId)
    if (!entry) continue
    if (entry.is_winner) wins += 1

    const record = byGame.get(match.game_slug) ?? { played: 0, wins: 0, totals: [] }
    record.played += 1
    if (entry.is_winner) record.wins += 1
    record.totals.push(entry.total)
    byGame.set(match.game_slug, record)
  }

  let currentStreak = 0
  for (const match of own) {
    const entry = participation(match, playerId)
    if (entry?.is_winner) currentStreak += 1
    else break
  }

  const records: GameRecord[] = [...byGame.entries()]
    .map(([gameSlug, record]) => {
      const game = resolve(gameSlug)
      const best =
        record.totals.length === 0
          ? null
          : game?.winnerRule === 'lowest'
            ? Math.min(...record.totals)
            : Math.max(...record.totals)
      return {
        gameSlug,
        played: record.played,
        wins: record.wins,
        bestTotal: best,
        averageTotal:
          record.totals.length === 0
            ? null
            : record.totals.reduce((sum, value) => sum + value, 0) / record.totals.length,
      }
    })
    .sort((a, b) => b.played - a.played)

  return {
    played: own.length,
    wins,
    winRate: own.length === 0 ? 0 : wins / own.length,
    currentStreak,
    byGame: records,
    favouriteGame: records[0]?.gameSlug ?? null,
  }
}

export interface HeadToHead {
  together: number
  /** Victorias del jugador del perfil en esas partidas. */
  theirWins: number
  /** Victorias de quien está mirando el perfil. */
  yourWins: number
  /** Partidas que ganó un tercero. */
  otherWins: number
  matches: MatchWithPlayers[]
}

/** Partidas en las que coincidieron los dos jugadores y quién ganó cada una. */
export function computeHeadToHead(
  matches: MatchWithPlayers[],
  theirPlayerId: string,
  yourPlayerId: string | null,
): HeadToHead {
  if (!yourPlayerId || yourPlayerId === theirPlayerId) {
    return { together: 0, theirWins: 0, yourWins: 0, otherWins: 0, matches: [] }
  }

  const shared = matches.filter(
    (match) => participation(match, theirPlayerId) && participation(match, yourPlayerId),
  )

  let theirWins = 0
  let yourWins = 0
  for (const match of shared) {
    if (participation(match, theirPlayerId)?.is_winner) theirWins += 1
    else if (participation(match, yourPlayerId)?.is_winner) yourWins += 1
  }

  return {
    together: shared.length,
    theirWins,
    yourWins,
    otherWins: shared.length - theirWins - yourWins,
    matches: shared,
  }
}

/** Tabla del grupo, ordenada por victorias. */
export function computeLeaderboard(
  matches: MatchWithPlayers[],
  players: Player[],
  resolve: ResolveGame = getGame,
) {
  return players
    .map((player) => ({ player, stats: computePlayerStats(matches, player.id, resolve) }))
    .sort(
      (a, b) =>
        b.stats.wins - a.stats.wins ||
        b.stats.winRate - a.stats.winRate ||
        b.stats.played - a.stats.played,
    )
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatAverage(value: number | null): string {
  if (value === null) return '—'
  return value.toFixed(1).replace(/\.0$/, '')
}

const DATE_FORMAT = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return DATE_FORMAT.format(date)
}
