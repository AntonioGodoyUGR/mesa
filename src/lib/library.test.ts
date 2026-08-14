import { describe, expect, it } from 'vitest'
import { GAME_LIST, requireGame } from '../games/registry'
import {
  countLibrary,
  libraryGames,
  libraryIndex,
  libraryStatusInfo,
  nextLibraryStatus,
} from './library'
import type { LibraryEntry } from './types'

function entry(
  game_slug: string,
  status: 'owned' | 'wishlist',
  created_at: string,
): LibraryEntry {
  return { user_id: 'u1', game_slug, status, created_at }
}

const biblioteca: LibraryEntry[] = [
  entry('catan', 'owned', '2026-01-10T20:00:00.000Z'),
  entry('azul', 'owned', '2026-03-02T20:00:00.000Z'),
  entry('wingspan', 'wishlist', '2026-02-14T20:00:00.000Z'),
]

describe('libraryIndex', () => {
  it('responde por slug qué estado tiene cada juego', () => {
    const index = libraryIndex(biblioteca)
    expect(index.get('catan')).toBe('owned')
    expect(index.get('wingspan')).toBe('wishlist')
    expect(index.get('uno')).toBeUndefined()
  })
})

describe('countLibrary', () => {
  it('cuenta comprados y deseados por separado', () => {
    expect(countLibrary(biblioteca)).toEqual({ owned: 2, wishlist: 1 })
    expect(countLibrary([])).toEqual({ owned: 0, wishlist: 0 })
  })
})

describe('libraryGames', () => {
  it('devuelve los juegos de un estado, del último marcado al primero', () => {
    const owned = libraryGames(GAME_LIST, biblioteca, 'owned')
    expect(owned.map((game) => game.slug)).toEqual(['azul', 'catan'])

    const wishlist = libraryGames(GAME_LIST, biblioteca, 'wishlist')
    expect(wishlist).toEqual([requireGame('wingspan')])
  })

  it('no altera la lista de entradas que recibe', () => {
    const original = [...biblioteca]
    libraryGames(GAME_LIST, biblioteca, 'owned')
    expect(biblioteca).toEqual(original)
  })

  it('ignora un juego que ya no está en el catálogo', () => {
    // Pasa al marcar el juego de un grupo y salirse después de ese grupo.
    const conFantasma = [...biblioteca, entry('c-el-de-los-jueves', 'owned', '2026-04-01T20:00:00.000Z')]
    expect(libraryGames(GAME_LIST, conFantasma, 'owned').map((game) => game.slug)).toEqual([
      'azul',
      'catan',
    ])
  })
})

describe('nextLibraryStatus', () => {
  it('pulsar el estado que ya tenía lo saca de la biblioteca', () => {
    expect(nextLibraryStatus('owned', 'owned')).toBeNull()
    expect(nextLibraryStatus('wishlist', 'wishlist')).toBeNull()
  })

  it('pulsar el otro lo mueve de sección', () => {
    expect(nextLibraryStatus('wishlist', 'owned')).toBe('owned')
    expect(nextLibraryStatus('owned', 'wishlist')).toBe('wishlist')
  })

  it('un juego que no estaba se marca sin más', () => {
    expect(nextLibraryStatus(undefined, 'owned')).toBe('owned')
  })
})

describe('libraryStatusInfo', () => {
  it('da el texto de cada estado', () => {
    expect(libraryStatusInfo('owned').title).toBe('En casa')
    expect(libraryStatusInfo('wishlist').title).toBe('Lista de deseos')
  })
})
