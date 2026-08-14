/**
 * Biblioteca personal: qué juegos tienes comprados y cuáles quieres.
 *
 * Aquí solo hay funciones puras sobre las entradas y el catálogo; quién las lee o
 * las escribe es cosa de `MesaApi`. Igual que el resto del motor, no conoce ningún
 * juego en concreto: un juego creado por un grupo se marca exactamente igual.
 */
import type { GameDefinition } from '../games/types'
import type { LibraryEntry, LibraryStatus } from './types'

export interface LibraryStatusInfo {
  id: LibraryStatus
  /** Texto del botón: cabe en un móvil. */
  label: string
  /** Título de la sección de la biblioteca. */
  title: string
  icon: string
  /** Aclaración bajo el título y en el `title` del botón. */
  hint: string
}

export const LIBRARY_STATUSES: LibraryStatusInfo[] = [
  {
    id: 'owned',
    label: 'La tengo',
    title: 'En casa',
    icon: '📦',
    hint: 'Comprado: la caja está en tu estantería',
  },
  {
    id: 'wishlist',
    label: 'La quiero',
    title: 'Lista de deseos',
    icon: '⭐',
    hint: 'Deseado: te lo apuntas para el próximo cumpleaños',
  },
]

export function libraryStatusInfo(status: LibraryStatus): LibraryStatusInfo {
  // El `!` es seguro: `LibraryStatus` no admite más valores que los de la lista.
  return LIBRARY_STATUSES.find((info) => info.id === status)!
}

/** Estado de cada juego, indexado por slug, para preguntarlo sin recorrer la lista. */
export function libraryIndex(entries: LibraryEntry[]): Map<string, LibraryStatus> {
  return new Map(entries.map((entry) => [entry.game_slug, entry.status]))
}

export interface LibraryCounts {
  owned: number
  wishlist: number
}

export function countLibrary(entries: LibraryEntry[]): LibraryCounts {
  return {
    owned: entries.filter((entry) => entry.status === 'owned').length,
    wishlist: entries.filter((entry) => entry.status === 'wishlist').length,
  }
}

/**
 * Los juegos marcados con un estado, del último apuntado al primero.
 *
 * Una entrada cuyo juego no aparece en el catálogo se ignora en silencio: pasa al
 * marcar un juego de un grupo y salirse después de ese grupo, y no es un error que
 * merezca romper la pantalla.
 */
export function libraryGames(
  games: GameDefinition[],
  entries: LibraryEntry[],
  status: LibraryStatus,
): GameDefinition[] {
  const catalogue = new Map(games.map((game) => [game.slug, game]))

  return entries
    .filter((entry) => entry.status === status)
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((entry) => catalogue.get(entry.game_slug))
    .filter((game): game is GameDefinition => !!game)
}

/**
 * Qué guardar al tocar un botón: volver a pulsar el estado que ya tenía lo quita
 * de la biblioteca (`null`), y pulsar el otro lo mueve de sección.
 */
export function nextLibraryStatus(
  current: LibraryStatus | undefined,
  pressed: LibraryStatus,
): LibraryStatus | null {
  return current === pressed ? null : pressed
}
