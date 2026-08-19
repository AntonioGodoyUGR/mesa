import {
  BUILTIN_GAMES,
  computeTotal,
  emptyScores,
  getGame,
  requireGame,
} from '../games/registry'
import { CATALOG_PAGE, filterGames } from '../games/filters'
import { loadRules } from '../games/rules'
import { customSlug } from '../games/custom'
import type { GameDefinition, ScoreValues } from '../games/types'
import type { TableTrackerApi } from './api'
import type {
  Group,
  GroupMember,
  LibraryEntry,
  Match,
  MatchPlayer,
  MatchWithPlayers,
  Player,
  SessionUser,
} from './types'

/**
 * Implementación de mentira, en memoria y persistida en `localStorage`.
 *
 * Existe para poder abrir la app y usarla entera sin haber creado todavía el
 * proyecto de Supabase. Se activa sola cuando faltan las variables de entorno.
 * Reutiliza `computeTotal` del registro de juegos, igual que hace el servidor:
 * las reglas de puntuación no se duplican en ningún sitio.
 */

const STORAGE_KEY = 'mesa.demo.v1'

interface DemoState {
  user: SessionUser
  group: Group
  players: Player[]
  matches: Match[]
  matchPlayers: MatchPlayer[]
  /** Los juegos que se inventa el usuario, con la imagen como data URL. */
  customGames: GameDefinition[]
  /** Biblioteca personal: lo comprado y lo deseado. */
  library: LibraryEntry[]
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function buildSeed(): DemoState {
  const user: SessionUser = {
    id: 'demo-user',
    email: 'demo@mesa.app',
    displayName: 'Tú',
  }

  const group: Group = {
    id: 'demo-group',
    name: 'Los del jueves',
    join_code: 'DEMO01',
    created_by: user.id,
    created_at: new Date().toISOString(),
  }

  const names = ['Tú', 'Ana', 'Beto', 'Cris']
  const players: Player[] = names.map((display_name, index) => ({
    id: `demo-player-${index}`,
    group_id: group.id,
    display_name,
    avatar_url: null,
    // Solo el primero tiene cuenta: los demás son invitados, como en la vida real.
    user_id: index === 0 ? user.id : null,
    created_at: new Date().toISOString(),
  }))

  const matches: Match[] = []
  const matchPlayers: MatchPlayer[] = []

  function addMatch(
    gameSlug: string,
    playedAt: string,
    rows: { playerIndex: number; scores: ScoreValues }[],
  ) {
    const game = requireGame(gameSlug)
    const matchId = uid('demo-match')

    const scored = rows.map((row, seat) => {
      const scores = { ...emptyScores(game), ...row.scores }
      return {
        playerId: players[row.playerIndex].id,
        seat,
        scores,
        total: computeTotal(game, scores),
      }
    })

    const sorted = [...scored].sort((a, b) =>
      game.winnerRule === 'lowest' ? a.total - b.total : b.total - a.total,
    )
    const winnerId = sorted[0].playerId

    matches.push({
      id: matchId,
      group_id: group.id,
      game_slug: gameSlug,
      played_at: playedAt,
      notes: null,
      winner_player_id: winnerId,
      created_by: user.id,
      created_at: `${playedAt}T21:00:00.000Z`,
    })

    for (const row of scored) {
      matchPlayers.push({
        id: uid('demo-mp'),
        match_id: matchId,
        player_id: row.playerId,
        seat: row.seat,
        scores: row.scores,
        total: row.total,
        rank: sorted.findIndex((entry) => entry.playerId === row.playerId) + 1,
        is_winner: row.playerId === winnerId,
      })
    }
  }

  addMatch('catan', daysAgo(2), [
    { playerIndex: 0, scores: { settlements: 3, cities: 2, longest_road: true, roads: 9 } },
    { playerIndex: 1, scores: { settlements: 4, cities: 1, dev_points: 1, knights: 2 } },
    { playerIndex: 2, scores: { settlements: 2, cities: 2, largest_army: true, knights: 4 } },
  ])

  addMatch('carcassonne', daysAgo(9), [
    { playerIndex: 0, scores: { points: 74, cities: 32, roads: 18, farms: 24 } },
    { playerIndex: 1, scores: { points: 91, cities: 45, roads: 19, farms: 27 } },
  ])

  addMatch('camel-up', daysAgo(9), [
    { playerIndex: 0, scores: { coins: 17, leg_bets: 9, race_bets: 5 } },
    { playerIndex: 1, scores: { coins: 24, leg_bets: 12, race_bets: 8 } },
    { playerIndex: 2, scores: { coins: 11, leg_bets: 6, race_bets: -1 } },
    { playerIndex: 3, scores: { coins: 19, leg_bets: 10, race_bets: 5 } },
  ])

  addMatch('catan', daysAgo(23), [
    { playerIndex: 0, scores: { settlements: 5, cities: 1, dev_points: 2, knights: 3 } },
    { playerIndex: 2, scores: { settlements: 2, cities: 3, longest_road: true, roads: 11 } },
    { playerIndex: 3, scores: { settlements: 3, cities: 1, largest_army: true, knights: 5 } },
  ])

  // Dos juegos ya marcados para que la biblioteca no salga vacía en la demostración.
  const library: LibraryEntry[] = [
    { user_id: user.id, game_slug: 'catan', status: 'owned', created_at: `${daysAgo(30)}T20:00:00.000Z` },
    { user_id: user.id, game_slug: 'wingspan', status: 'wishlist', created_at: `${daysAgo(5)}T20:00:00.000Z` },
  ]

  return { user, group, players, matches, matchPlayers, customGames: [], library }
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as DemoState
      // Los datos guardados por una versión anterior no traían juegos propios
      // ni biblioteca.
      return {
        ...stored,
        customGames: stored.customGames ?? [],
        library: stored.library ?? [],
      }
    }
  } catch {
    // Datos corruptos de una versión anterior: se regeneran.
  }
  const seed = buildSeed()
  save(seed)
  return seed
}

function save(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Sin almacenamiento (modo privado): la sesión sigue en memoria.
  }
}

let state: DemoState | null = null

function db(): DemoState {
  state ??= load()
  return state
}

function commit() {
  if (state) save(state)
}

/**
 * Un slug puede ser de un juego integrado o de uno que se ha inventado el usuario.
 * En Supabase los dos salen de la tabla `games`; aquí hay que mirar en los dos sitios.
 */
function resolveGame(slug: string): GameDefinition {
  const custom = db().customGames.find((game) => game.slug === slug)
  if (custom) return custom

  const builtin = getGame(slug)
  if (!builtin) throw new Error(`Juego desconocido: ${slug}`)
  return builtin
}

/** Un decimal, como el `round(…, 1)` que hace la función equivalente en Postgres. */
function round1(value: number): number {
  return Math.round(value * 10) / 10
}

/** Pequeño retardo para que los estados de carga se vean como en producción. */
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 120))
}

function hydrate(match: Match): MatchWithPlayers {
  const players = db().matchPlayers
    .filter((entry) => entry.match_id === match.id)
    .map((entry) => ({
      ...entry,
      player:
        db().players.find((player) => player.id === entry.player_id) ??
        ({
          id: entry.player_id,
          group_id: match.group_id,
          display_name: 'Jugador',
          avatar_url: null,
          user_id: null,
          created_at: match.created_at,
        } satisfies Player),
    }))
    .sort((a, b) => a.rank - b.rank || a.seat - b.seat)

  return { ...match, match_players: players }
}

export const demoApi: TableTrackerApi = {
  async getUser() {
    return delay(db().user)
  },

  onUserChange() {
    return () => {}
  },

  async signIn() {},
  async signUp() {},

  async signOut() {
    // En demostración no hay sesión real que cerrar: se reinician los datos.
    localStorage.removeItem(STORAGE_KEY)
    state = null
  },

  async listGroups() {
    return delay([db().group])
  },

  async createGroup(name) {
    db().group = { ...db().group, name: name.trim() }
    commit()
    return delay(db().group)
  },

  async joinGroup() {
    return delay(db().group)
  },

  async listMembers(groupId) {
    const member: GroupMember = {
      group_id: groupId,
      user_id: db().user.id,
      role: 'admin',
      profile: {
        id: db().user.id,
        display_name: db().user.displayName,
        avatar_url: null,
      },
    }
    return delay([member])
  },

  async listPlayers(groupId) {
    return delay(db().players.filter((player) => player.group_id === groupId))
  },

  async addPlayer(groupId, displayName) {
    const name = displayName.trim()
    const clash = db().players.some(
      (player) =>
        player.group_id === groupId &&
        player.display_name.toLowerCase() === name.toLowerCase(),
    )
    if (clash) throw new Error(`Ya hay un jugador llamado «${name}» en el grupo`)

    const player: Player = {
      id: uid('demo-player'),
      group_id: groupId,
      display_name: name,
      avatar_url: null,
      user_id: null,
      created_at: new Date().toISOString(),
    }
    db().players.push(player)
    commit()
    return delay(player)
  },

  async renamePlayer(playerId, displayName) {
    const player = db().players.find((entry) => entry.id === playerId)
    if (player) player.display_name = displayName.trim()
    commit()
  },

  async setPlayerAvatar(playerId, avatar) {
    const player = db().players.find((entry) => entry.id === playerId)
    if (player) player.avatar_url = avatar
    commit()
  },

  async listMatches(groupId) {
    const matches = db()
      .matches.filter((match) => match.group_id === groupId)
      .sort(
        (a, b) =>
          b.played_at.localeCompare(a.played_at) || b.created_at.localeCompare(a.created_at),
      )
      .map(hydrate)
    return delay(matches)
  },

  async saveMatch(input) {
    const game = resolveGame(input.gameSlug)

    const registered = input.players.some((row) => {
      const player = db().players.find((entry) => entry.id === row.playerId)
      return player?.user_id != null
    })
    if (!registered) {
      throw new Error('La partida necesita al menos un jugador con cuenta registrada')
    }

    const matchId = uid('demo-match')
    const scored = input.players.map((row) => ({
      ...row,
      total: computeTotal(game, row.scores),
    }))
    const sorted = [...scored].sort((a, b) =>
      game.winnerRule === 'lowest' ? a.total - b.total : b.total - a.total,
    )
    const winnerId = input.winnerPlayerId ?? sorted[0]?.playerId ?? null

    db().matches.push({
      id: matchId,
      group_id: input.groupId,
      game_slug: input.gameSlug,
      played_at: input.playedAt,
      notes: input.notes?.trim() || null,
      winner_player_id: winnerId,
      created_by: db().user.id,
      created_at: new Date().toISOString(),
    })

    for (const row of scored) {
      db().matchPlayers.push({
        id: uid('demo-mp'),
        match_id: matchId,
        player_id: row.playerId,
        seat: row.seat,
        scores: row.scores,
        total: row.total,
        rank: sorted.findIndex((entry) => entry.playerId === row.playerId) + 1,
        is_winner: row.playerId === winnerId,
      })
    }

    commit()
    return delay(matchId)
  },

  async deleteMatch(matchId) {
    state = {
      ...db(),
      matches: db().matches.filter((match) => match.id !== matchId),
      matchPlayers: db().matchPlayers.filter((entry) => entry.match_id !== matchId),
    }
    commit()
  },

  async listGames(groupId) {
    return delay(db().customGames.filter((game) => game.groupId === groupId))
  },

  async searchCatalog(query) {
    // La contrapartida en memoria de `search_catalog`. Filtra con `filterGames`, que
    // es exactamente lo que hacía el buscador cuando el catálogo entero vivía dentro
    // de la app: los mismos criterios que ahora escribe Postgres, escritos una vez.
    const pool = [
      ...BUILTIN_GAMES,
      ...(query.groupId ? db().customGames.filter((g) => g.groupId === query.groupId) : []),
    ]

    // Con slugs puestos manda la lista y el resto de criterios sobra, igual que allí.
    const found = query.slugs
      ? pool.filter((game) => query.slugs!.includes(game.slug))
      : filterGames(pool, {
          query: query.query ?? '',
          durations: query.durations ?? [],
          difficulties: query.difficulties ?? [],
          players: query.players ?? null,
        })

    const offset = query.offset ?? 0
    return delay(found.slice(offset, offset + (query.limit ?? CATALOG_PAGE)))
  },

  async getGameBySlug(slug) {
    const custom = db().customGames.find((game) => game.slug === slug)
    if (custom) return delay(custom)

    const builtin = getGame(slug)
    if (!builtin) return delay(null)

    // En Supabase la chuleta es una columna de la fila; aquí está en `catalog.rules`,
    // que se carga a demanda. En los dos casos, quien pide un juego por su slug lo
    // recibe con reglas: es la pantalla donde se leen.
    const rules = builtin.rules ?? (await loadRules())[slug]
    return delay(rules ? { ...builtin, rules } : builtin)
  },

  async getGamesBySlugs(slugs) {
    if (slugs.length === 0) return []
    return demoApi.searchCatalog({ slugs, limit: slugs.length })
  },

  async saveCustomGame(input) {
    const slug = input.slug ?? customSlug(input.definition.name)
    const game: GameDefinition = {
      ...input.definition,
      slug,
      groupId: input.groupId,
      createdBy: db().user.id,
    }

    const index = db().customGames.findIndex((entry) => entry.slug === slug)
    if (index >= 0) db().customGames[index] = game
    else db().customGames.push(game)

    commit()
    return delay(slug)
  },

  async deleteCustomGame(slug) {
    const played = db().matches.filter((match) => match.game_slug === slug).length
    if (played > 0) {
      throw new Error(`No se puede borrar: hay ${played} partida(s) apuntadas con este juego`)
    }
    state = {
      ...db(),
      customGames: db().customGames.filter((game) => game.slug !== slug),
      // En Supabase lo hace la clave ajena de `game_library` con `on delete cascade`.
      library: db().library.filter((entry) => entry.game_slug !== slug),
    }
    commit()
  },

  async uploadGameImage(_groupId, file) {
    // Sin Storage, la portada se guarda como data URL dentro de la propia definición.
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('No se ha podido leer la imagen'))
      reader.readAsDataURL(file)
    })
    return dataUrl
  },

  async getGameStats(gameSlug) {
    // La contrapartida de `game_global_stats`. Aquí no hay RLS que saltarse ni
    // más grupos que el de la demostración, pero los números se calculan igual
    // para que la ficha se vea completa sin backend.
    const matches = db().matches.filter((match) => match.game_slug === gameSlug)
    const ids = new Set(matches.map((match) => match.id))
    const entries = db().matchPlayers.filter((entry) => ids.has(entry.match_id))

    const lowest = db().customGames.find((game) => game.slug === gameSlug)?.winnerRule
      ?? getGame(gameSlug)?.winnerRule
    const totals = entries.map((entry) => entry.total)

    return delay({
      gameSlug,
      matches: matches.length,
      groups: new Set(matches.map((match) => match.group_id)).size,
      players: new Set(entries.map((entry) => entry.player_id)).size,
      averagePlayers: matches.length === 0 ? null : round1(entries.length / matches.length),
      averageTotal:
        totals.length === 0
          ? null
          : round1(totals.reduce((sum, value) => sum + value, 0) / totals.length),
      bestTotal:
        totals.length === 0
          ? null
          : lowest === 'lowest'
            ? Math.min(...totals)
            : Math.max(...totals),
      lastPlayedAt:
        matches.length === 0
          ? null
          : matches.reduce((latest, match) =>
              match.played_at > latest.played_at ? match : latest,
            ).played_at,
    })
  },

  async listLibrary() {
    const entries = [...db().library].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )
    return delay(entries)
  },

  async setLibraryStatus(gameSlug, status) {
    const rest = db().library.filter((entry) => entry.game_slug !== gameSlug)
    state = {
      ...db(),
      library:
        status === null
          ? rest
          : [
              ...rest,
              {
                user_id: db().user.id,
                game_slug: gameSlug,
                status,
                created_at: new Date().toISOString(),
              },
            ],
    }
    commit()
  },
}
