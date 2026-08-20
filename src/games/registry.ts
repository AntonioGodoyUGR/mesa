import type { GameDefinition, ScoreField, ScoreValues } from './types'
import { CURATED_GAMES } from './curated'
import { expandCatalogRow, type CatalogGameRow } from './catalog'
import { coverUrl } from './covers'

export { CURATED_GAMES } from './curated'
export type { CatalogGameRow } from './catalog'

/**
 * Los juegos que viajan dentro de la app: los 24 escritos a mano en `definitions/`,
 * con su hoja de puntuación propia y su chuleta de reglas.
 *
 * No están todos los que son, y es a propósito. El catálogo amplio —cientos de títulos
 * hoy, decenas de miles cuando acabe la ingesta de BGG— vive en Postgres y llega por
 * `search_catalog`: meterlo aquí serían megabytes de JavaScript en cada visita para que
 * cada cual mire cuatro juegos. Estos 24 son el arranque en frío: lo que hace que la app
 * funcione entera sin red y lo que usa el modo demostración.
 *
 * Los juegos que crean los usuarios tampoco están aquí: viven en la base de datos y se
 * resuelven en tiempo de ejecución (ver `context/GamesContext`). Su slug empieza por
 * `c-`, prefijo que ningún juego integrado puede usar.
 */
export const BUILTIN_GAMES: GameDefinition[] = CURATED_GAMES.map(withCover)

/**
 * Le pone al juego la portada descargada, si la tiene.
 *
 * Se hace aquí, en un solo sitio, y no en cada definición ni al expandir el catálogo:
 * las portadas las genera `npm run covers` a partir de la propia lista de juegos, así
 * que si `definitions/` o `catalog.ts` importaran el fichero generado se cerraría el
 * círculo. Un juego escrito a mano puede seguir trayendo su `imageUrl` puesta a dedo:
 * se respeta cuando no hay portada descargada.
 */
function withCover(game: GameDefinition): GameDefinition {
  const url = coverUrl(game.slug)
  return url ? { ...game, imageUrl: url } : game
}

/** Alias histórico de `BUILTIN_GAMES`. */
export const GAME_LIST = BUILTIN_GAMES

export const GAMES: Record<string, GameDefinition> = Object.fromEntries(
  BUILTIN_GAMES.map((game) => [game.slug, game]),
)

export function getGame(slug: string | undefined): GameDefinition | undefined {
  return slug ? GAMES[slug] : undefined
}

/** Lanza si el slug no existe: úsalo cuando el juego ya debería estar validado. */
export function requireGame(slug: string): GameDefinition {
  const game = GAMES[slug]
  if (!game) throw new Error(`Juego desconocido: ${slug}`)
  return game
}

/**
 * Un juego que ha llegado del servidor, listo para pintarse.
 *
 * Es el punto de encuentro de las dos capas del catálogo. Si el juego ya viaja en el
 * bundle manda esa copia: trae su portada descargada, su hoja escrita a mano y su
 * chuleta, que es más de lo que cabe en una fila de lista. Si no —la cola larga, que
 * es casi todo el catálogo cuando este llega a decenas de miles—, se reconstruye a
 * partir de la fila con `expandCatalogRow`.
 *
 * Así el servidor puede mandar filas de 150 B sin que la interfaz note la diferencia:
 * de aquí sale siempre una `GameDefinition` completa, venga de donde venga.
 */
export function catalogGame(row: CatalogGameRow): GameDefinition {
  const builtin = row.group_id === null ? GAMES[row.slug] : undefined
  return builtin ?? withCover(expandCatalogRow(row))
}

/**
 * Sin tildes ni mayúsculas: buscar «azul» tiene que encontrar «Azul».
 *
 * Se exporta porque la misma regla está escrita en Postgres (`public.searchable`, en
 * `supabase/schema.sql`), que es quien normaliza la columna `search_text` sobre la que
 * busca el servidor. Si cambia una, cambia la otra: si dejaran de coincidir, un juego
 * se encontraría en modo demostración y no en producción, o al revés.
 */
export function searchable(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, '')
    .toLowerCase()
}

/**
 * Filtro por nombre o lema para los buscadores de la home y de las reglas.
 * Con una consulta vacía devuelve la lista tal cual.
 */
export function searchGames(games: GameDefinition[], query: string): GameDefinition[] {
  const needle = searchable(query).trim()
  if (!needle) return games
  return games.filter((game) =>
    searchable(`${game.name} ${game.tagline}`).includes(needle),
  )
}

// ---------------------------------------------------------------------------
// Valores
// ---------------------------------------------------------------------------

function defaultValue(field: ScoreField): number | boolean {
  if (field.defaultValue !== undefined) return field.defaultValue
  return field.type === 'toggle' ? false : 0
}

/** Puntuaciones iniciales de un jugador para un juego. */
export function emptyScores(game: GameDefinition): ScoreValues {
  const scores: ScoreValues = {}
  for (const field of game.fields) {
    scores[field.key] = defaultValue(field)
  }
  return scores
}

/** Valor numérico de un campo: los `toggle` valen 1 o 0. */
export function fieldValue(scores: ScoreValues, field: ScoreField): number {
  const raw = scores[field.key]
  if (field.type === 'toggle') return raw ? 1 : 0
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
}

/** Recorta un valor a los límites declarados por el campo. */
export function clampField(field: ScoreField, value: number): number {
  let next = Math.trunc(value)
  if (field.min !== undefined) next = Math.max(field.min, next)
  if (field.max !== undefined) next = Math.min(field.max, next)
  return next
}

/** Los campos que suman al total en modo `computed`. */
export function scoringFields(game: GameDefinition): ScoreField[] {
  if (game.totalMode === 'explicit') {
    return game.fields.filter((field) => field.isTotal)
  }
  return game.fields.filter((field) => field.points !== undefined)
}

/** El campo marcado como total, en juegos de modo `explicit`. */
export function totalField(game: GameDefinition): ScoreField | undefined {
  return game.fields.find((field) => field.isTotal)
}

// ---------------------------------------------------------------------------
// Cálculo de la puntuación
// ---------------------------------------------------------------------------

/**
 * Puntuación total de un jugador.
 * - `computed`: suma de `valor × points` de cada campo puntuable (Catán).
 * - `explicit`: el valor del campo marcado como total (Carcassonne, Camel Up).
 */
export function computeTotal(game: GameDefinition, scores: ScoreValues): number {
  if (game.totalMode === 'explicit') {
    const field = totalField(game)
    return field ? fieldValue(scores, field) : 0
  }

  return game.fields.reduce((total, field) => {
    if (field.points === undefined) return total
    return total + fieldValue(scores, field) * field.points
  }, 0)
}

export interface BreakdownEntry {
  field: ScoreField
  value: number
  /** Puntos que aporta este campo al total, o `null` si es informativo. */
  contribution: number | null
}

/** Desglose del total campo a campo, para la pantalla de detalle. */
export function computeBreakdown(
  game: GameDefinition,
  scores: ScoreValues,
): BreakdownEntry[] {
  return game.fields.map((field) => {
    const value = fieldValue(scores, field)
    const contributes = game.totalMode === 'computed' ? field.points !== undefined : !!field.isTotal
    return {
      field,
      value,
      contribution: contributes ? value * (field.points ?? 1) : null,
    }
  })
}

// ---------------------------------------------------------------------------
// Clasificación
// ---------------------------------------------------------------------------

export interface RankedEntry<T> {
  entry: T
  total: number
  /** 1 = primero. Los empates comparten posición. */
  rank: number
}

/**
 * Ordena a los jugadores aplicando `winnerRule`.
 * Los empates comparten posición (1, 2, 2, 4) — el ganador definitivo lo confirma el usuario.
 */
export function rankPlayers<T>(
  game: GameDefinition,
  players: T[],
  getScores: (player: T) => ScoreValues,
): RankedEntry<T>[] {
  const withTotals = players.map((entry) => ({
    entry,
    total: computeTotal(game, getScores(entry)),
  }))

  const direction = game.winnerRule === 'lowest' ? 1 : -1
  withTotals.sort((a, b) => direction * (a.total - b.total))

  let lastTotal: number | null = null
  let lastRank = 0

  return withTotals.map((item, index) => {
    const rank = lastTotal !== null && item.total === lastTotal ? lastRank : index + 1
    lastTotal = item.total
    lastRank = rank
    return { ...item, rank }
  })
}

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

export interface ScoreIssue {
  /** Índice del jugador afectado, o `null` si el problema es de la partida entera. */
  playerIndex: number | null
  fieldKey?: string
  message: string
}

/**
 * Comprueba límites por campo y unicidad de las cartas especiales.
 * Devuelve una lista vacía si todo es correcto.
 */
export function validateScores(
  game: GameDefinition,
  players: { name: string; scores: ScoreValues }[],
): ScoreIssue[] {
  const issues: ScoreIssue[] = []

  if (players.length < game.minPlayers) {
    issues.push({
      playerIndex: null,
      message: `${game.name} necesita al menos ${game.minPlayers} jugadores.`,
    })
  }
  if (players.length > game.maxPlayers) {
    issues.push({
      playerIndex: null,
      message: `${game.name} admite como mucho ${game.maxPlayers} jugadores.`,
    })
  }

  players.forEach((player, playerIndex) => {
    for (const field of game.fields) {
      if (field.type === 'toggle') continue
      const value = fieldValue(player.scores, field)
      if (field.min !== undefined && value < field.min) {
        issues.push({
          playerIndex,
          fieldKey: field.key,
          message: `${player.name}: «${field.label}» no puede bajar de ${field.min}.`,
        })
      }
      if (field.max !== undefined && value > field.max) {
        issues.push({
          playerIndex,
          fieldKey: field.key,
          message: `${player.name}: «${field.label}» no puede pasar de ${field.max}.`,
        })
      }
    }
  })

  for (const field of game.fields) {
    if (!field.uniquePerMatch) continue
    const holders = players.filter((player) => fieldValue(player.scores, field) > 0)
    if (holders.length > 1) {
      issues.push({
        playerIndex: null,
        fieldKey: field.key,
        message: `«${field.label}» solo puede tenerlo un jugador (ahora: ${holders
          .map((holder) => holder.name)
          .join(', ')}).`,
      })
    }
  }

  return issues
}

/**
 * Aplica la unicidad de una carta especial: al dársela a un jugador se la quita al resto.
 * Devuelve las puntuaciones ya corregidas.
 */
export function applyUniqueField(
  game: GameDefinition,
  allScores: ScoreValues[],
  fieldKey: string,
  ownerIndex: number,
  active: boolean,
): ScoreValues[] {
  const field = game.fields.find((candidate) => candidate.key === fieldKey)
  if (!field?.uniquePerMatch) {
    return allScores.map((scores, index) =>
      index === ownerIndex ? { ...scores, [fieldKey]: active } : scores,
    )
  }

  return allScores.map((scores, index) => {
    if (index === ownerIndex) return { ...scores, [fieldKey]: active }
    if (!active) return scores
    return { ...scores, [fieldKey]: false }
  })
}
