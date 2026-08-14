import { describe, expect, it } from 'vitest'
import { computeLeaderboard, computePlayerStats, matchesOfGame } from './stats'
import type { MatchWithPlayers, Player } from './types'

/**
 * `matchesOfGame` es el único cálculo que añade la ficha de un juego: el resto
 * lo hacen `computePlayerStats` y `computeLeaderboard` sobre esa lista ya
 * recortada. Estas pruebas comprueban justo eso —que acotar por juego da las
 * mismas estadísticas, pero de un solo juego— más que el filtro en sí.
 */

function player(id: string, display_name: string): Player {
  return {
    id,
    group_id: 'g1',
    display_name,
    avatar_url: null,
    user_id: id === 'p1' ? 'u1' : null,
    created_at: '2026-01-01T20:00:00.000Z',
  }
}

const players = [player('p1', 'Tú'), player('p2', 'Ana')]

/** Una partida con un ganador y un perdedor, con los totales que se le pasen. */
function match(
  id: string,
  game_slug: string,
  played_at: string,
  totals: { playerId: string; total: number }[],
): MatchWithPlayers {
  const ranked = [...totals].sort((a, b) => b.total - a.total)
  const winner = ranked[0].playerId

  return {
    id,
    group_id: 'g1',
    game_slug,
    played_at,
    notes: null,
    winner_player_id: winner,
    created_by: 'u1',
    created_at: `${played_at}T21:00:00.000Z`,
    match_players: totals.map((row, seat) => ({
      id: `${id}-${row.playerId}`,
      match_id: id,
      player_id: row.playerId,
      seat,
      scores: {},
      total: row.total,
      rank: ranked.findIndex((entry) => entry.playerId === row.playerId) + 1,
      is_winner: row.playerId === winner,
      player: players.find((entry) => entry.id === row.playerId)!,
    })),
  }
}

// De la más reciente a la más antigua, como las devuelve la API.
const matches: MatchWithPlayers[] = [
  match('m1', 'catan', '2026-03-10', [
    { playerId: 'p1', total: 10 },
    { playerId: 'p2', total: 7 },
  ]),
  match('m2', 'azul', '2026-03-05', [
    { playerId: 'p1', total: 52 },
    { playerId: 'p2', total: 71 },
  ]),
  match('m3', 'catan', '2026-02-28', [
    { playerId: 'p1', total: 8 },
    { playerId: 'p2', total: 10 },
  ]),
  match('m4', 'catan', '2026-02-01', [
    { playerId: 'p1', total: 10 },
    { playerId: 'p2', total: 6 },
  ]),
]

describe('matchesOfGame', () => {
  it('se queda con las de un juego y conserva el orden', () => {
    const catan = matchesOfGame(matches, 'catan')
    expect(catan.map((entry) => entry.id)).toEqual(['m1', 'm3', 'm4'])
  })

  it('devuelve una lista vacía para un juego que nadie ha jugado', () => {
    expect(matchesOfGame(matches, 'wingspan')).toEqual([])
  })
})

describe('estadísticas acotadas a un juego', () => {
  it('cuenta solo las partidas de ese juego', () => {
    const stats = computePlayerStats(matchesOfGame(matches, 'catan'), 'p1')

    expect(stats.played).toBe(3)
    expect(stats.wins).toBe(2)
    // La derrota de Azul no cuenta aquí, pero sí la de la partida m3.
    expect(stats.winRate).toBeCloseTo(2 / 3)
  })

  it('la racha se corta con la última derrota del propio juego', () => {
    // m1 ganada, m3 perdida: la racha vigente es de una.
    expect(computePlayerStats(matchesOfGame(matches, 'catan'), 'p1').currentStreak).toBe(1)
  })

  it('el récord y la media salen del único registro que queda', () => {
    const record = computePlayerStats(matchesOfGame(matches, 'catan'), 'p1').byGame[0]

    expect(record.gameSlug).toBe('catan')
    expect(record.bestTotal).toBe(10)
    expect(record.averageTotal).toBeCloseTo((10 + 8 + 10) / 3)
  })

  it('la tabla del grupo ordena por victorias en ese juego', () => {
    const table = computeLeaderboard(matchesOfGame(matches, 'catan'), players)

    expect(table[0].player.display_name).toBe('Tú')
    expect(table[0].stats.wins).toBe(2)
    expect(table[1].stats.wins).toBe(1)
  })
})
