/**
 * Buscador de juegos: nombre + filtros por duración, dificultad y jugadores.
 *
 * Vive aparte de `registry.ts` porque no sabe nada de puntuaciones: solo mira los
 * metadatos de la definición. Igual que el resto del motor, no conoce ningún juego
 * en concreto — un juego creado por un grupo se filtra exactamente igual.
 */
import { searchGames } from './registry'
import type { GameDefinition, GameDifficulty, PlayTime } from './types'

/** Tramos de duración. Son los que se usan al decidir a qué jugar: «¿cuánto tenemos?». */
export type DurationBucket = 'short' | 'medium' | 'long'

export interface FilterOption<T> {
  id: T
  /** Texto del chip. */
  label: string
  /** Aclaración bajo el chip y en el `title`. */
  hint: string
  icon: string
}

export const DURATION_OPTIONS: FilterOption<DurationBucket>[] = [
  { id: 'short', label: 'Rápida', hint: 'Hasta 30 min', icon: '⚡' },
  { id: 'medium', label: 'Media', hint: 'De 30 min a 1 h', icon: '⏱️' },
  { id: 'long', label: 'Larga', hint: 'Más de 1 h', icon: '🌙' },
]

export const DIFFICULTY_OPTIONS: FilterOption<GameDifficulty>[] = [
  { id: 'easy', label: 'Sencillo', hint: 'Se explica en cinco minutos', icon: '🟢' },
  { id: 'medium', label: 'Medio', hint: 'Se pilla jugando', icon: '🟡' },
  { id: 'hard', label: 'Sesudo', hint: 'Hay que leerse las reglas', icon: '🔴' },
]

/** Jugadores que ofrece el desplegable: ningún juego del catálogo pasa de diez. */
export const PLAYER_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const

export interface GameFilters {
  query: string
  /** Vacío = cualquier duración. Varios tramos suman (se piden con «o»). */
  durations: DurationBucket[]
  /** Vacío = cualquier dificultad. */
  difficulties: GameDifficulty[]
  /** Cuántos van a jugar, o `null` si da igual. */
  players: number | null
}

/**
 * Cuántos juegos trae cada tanda del catálogo.
 *
 * Es el mismo número que enseña `usePaged` en pantalla, y ahora también lo que se le
 * pide al servidor: una tanda son 24 filas de ~150 B, unos 4 kB. Vive aquí y no en el
 * componente porque a partir de ahora lo usan los dos lados, el que pinta y el que pide.
 */
export const CATALOG_PAGE = 24

/**
 * ¿Vale la pena ir a buscar este juego a BoardGameGeek?
 *
 * El catálogo trae los ~18.000 juegos con más de cien votos. Por debajo de ese corte
 * hay muchísimos más, y quien busca su juego raro se merece encontrarlo — pero
 * preguntar por ahí cuesta segundos y gasta un cupo que es de la aplicación entera
 * (`supabase/functions/resolve-game`), así que se pregunta solo cuando tiene sentido:
 *
 *   · Con menos de tres letras no se está buscando nada concreto, se está tecleando.
 *   · Con un puñado de resultados ya en pantalla, lo que se busca probablemente está
 *     ahí: la ampliación sobra y molestaría reordenando la rejilla.
 *   · Sin texto —solo filtros puestos— no hay nada que preguntar: BGG busca por
 *     nombre, no por «a cuatro y de media hora».
 *
 * La misma decisión la vuelve a tomar Postgres antes de tocar la red
 * (`claim_catalog_lookup`), que es quien sabe si ya se preguntó esta semana.
 */
export function needsBggLookup(query: string, found: number): boolean {
  return query.trim().length >= 3 && found < LOOKUP_ENOUGH
}

/** Con estos resultados en pantalla ya no se molesta a BoardGameGeek. */
const LOOKUP_ENOUGH = 3

export const NO_FILTERS: GameFilters = {
  query: '',
  durations: [],
  difficulties: [],
  players: null,
}

/** Cuántos filtros hay puestos, sin contar el texto: es el número del botón «Filtros». */
export function activeFilterCount(filters: GameFilters): number {
  return (
    filters.durations.length + filters.difficulties.length + (filters.players ? 1 : 0)
  )
}

export function hasActiveFilters(filters: GameFilters): boolean {
  return activeFilterCount(filters) > 0 || filters.query.trim().length > 0
}

/** Añade o quita un valor de una lista de filtros: es lo que hace un chip al tocarlo. */
export function toggleFilter<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value]
}

/**
 * ¿La duración del juego cae en el tramo?
 *
 * Se compara el intervalo entero, no la media: un juego de 60–90 min sale tanto en
 * «media» como en «larga», porque puede acabar en una hora o irse a la noche. Los
 * cortes son 30 min y 1 h, y cada tramo empieza donde acaba el anterior.
 */
export function matchesDuration(playTime: PlayTime, bucket: DurationBucket): boolean {
  switch (bucket) {
    case 'short':
      return playTime.min <= 30
    case 'medium':
      return playTime.max > 30 && playTime.min <= 60
    case 'long':
      return playTime.max > 60
  }
}

function matchesPlayers(game: GameDefinition, players: number): boolean {
  return players >= game.minPlayers && players <= game.maxPlayers
}

/**
 * Aplica el buscador entero: primero el texto y después cada filtro.
 *
 * Un juego sin duración o sin dificultad declaradas (los que crea un grupo pueden no
 * tenerlas) desaparece en cuanto se filtra por ese dato: no se puede afirmar que dure
 * media hora si nadie lo ha dicho. Sin filtros puestos sale siempre.
 */
export function filterGames(
  games: GameDefinition[],
  filters: GameFilters,
): GameDefinition[] {
  let found = searchGames(games, filters.query)

  if (filters.durations.length > 0) {
    found = found.filter(
      (game) =>
        !!game.playTime &&
        filters.durations.some((bucket) => matchesDuration(game.playTime!, bucket)),
    )
  }

  if (filters.difficulties.length > 0) {
    found = found.filter(
      (game) => !!game.difficulty && filters.difficulties.includes(game.difficulty),
    )
  }

  if (filters.players !== null) {
    found = found.filter((game) => matchesPlayers(game, filters.players!))
  }

  return found
}

// ---------------------------------------------------------------------------
// Texto
// ---------------------------------------------------------------------------

/** «30 min», «30–45 min». */
export function formatPlayTime(playTime: PlayTime | undefined): string | null {
  if (!playTime) return null
  if (playTime.min === playTime.max) return `${playTime.min} min`
  return `${playTime.min}–${playTime.max} min`
}

export function difficultyLabel(difficulty: GameDifficulty | undefined): string | null {
  return DIFFICULTY_OPTIONS.find((option) => option.id === difficulty)?.label ?? null
}

export function difficultyIcon(difficulty: GameDifficulty | undefined): string | null {
  return DIFFICULTY_OPTIONS.find((option) => option.id === difficulty)?.icon ?? null
}
