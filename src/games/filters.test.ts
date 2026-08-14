import { describe, expect, it } from 'vitest'
import { GAME_LIST, requireGame } from './registry'
import {
  DURATION_OPTIONS,
  NO_FILTERS,
  activeFilterCount,
  difficultyLabel,
  filterGames,
  formatPlayTime,
  hasActiveFilters,
  matchesDuration,
  toggleFilter,
  type GameFilters,
} from './filters'
import type { GameDefinition } from './types'

const catan = requireGame('catan') // 60–90 min, medio, 3–6 jugadores
const camelUp = requireGame('camel-up') // 20–30 min, sencillo, 3–8 jugadores
const terraforming = requireGame('terraforming-mars') // 90–150 min, sesudo, 1–5

/** Un juego de grupo recién creado: sin duración ni dificultad declaradas. */
const sinDatos: GameDefinition = {
  ...requireGame('uno'),
  slug: 'c-el-de-los-jueves',
  name: 'El de los jueves',
  tagline: 'Cartas y gritos',
  playTime: undefined,
  difficulty: undefined,
  groupId: 'grupo-1',
}

const catalogo = [...GAME_LIST, sinDatos]

function filters(patch: Partial<GameFilters> = {}): GameFilters {
  return { ...NO_FILTERS, ...patch }
}

const names = (games: GameDefinition[]) => games.map((game) => game.name)

describe('matchesDuration', () => {
  it('corta = se puede acabar en media hora', () => {
    expect(matchesDuration({ min: 20, max: 30 }, 'short')).toBe(true)
    expect(matchesDuration({ min: 30, max: 45 }, 'short')).toBe(true)
    expect(matchesDuration({ min: 40, max: 70 }, 'short')).toBe(false)
  })

  it('media = pasa de media hora pero puede quedarse en una', () => {
    expect(matchesDuration({ min: 30, max: 45 }, 'medium')).toBe(true)
    expect(matchesDuration({ min: 60, max: 90 }, 'medium')).toBe(true)
    expect(matchesDuration({ min: 20, max: 30 }, 'medium')).toBe(false)
    expect(matchesDuration({ min: 90, max: 150 }, 'medium')).toBe(false)
  })

  it('larga = se puede ir de la hora', () => {
    expect(matchesDuration({ min: 90, max: 180 }, 'long')).toBe(true)
    expect(matchesDuration({ min: 60, max: 90 }, 'long')).toBe(true)
    expect(matchesDuration({ min: 30, max: 60 }, 'long')).toBe(false)
  })

  it('todos los juegos del catálogo caen en algún tramo', () => {
    for (const game of GAME_LIST) {
      const tramos = DURATION_OPTIONS.filter((option) =>
        matchesDuration(game.playTime!, option.id),
      )
      expect(tramos.length, `${game.slug} no cae en ningún tramo`).toBeGreaterThan(0)
    }
  })
})

describe('filterGames', () => {
  it('sin nada puesto devuelve la lista tal cual', () => {
    expect(filterGames(catalogo, NO_FILTERS)).toEqual(catalogo)
  })

  it('busca por nombre sin tildes ni mayúsculas', () => {
    expect(names(filterGames(catalogo, filters({ query: 'CATAN' })))).toEqual(['Catán'])
  })

  it('filtra por duración', () => {
    const rapidos = filterGames(catalogo, filters({ durations: ['short'] }))
    expect(rapidos).toContain(camelUp)
    expect(rapidos).not.toContain(catan)
    expect(rapidos).not.toContain(terraforming)
  })

  it('varios tramos de duración suman', () => {
    const found = filterGames(catalogo, filters({ durations: ['short', 'long'] }))
    expect(found).toContain(camelUp)
    expect(found).toContain(terraforming)
  })

  it('filtra por dificultad', () => {
    const sesudos = filterGames(catalogo, filters({ difficulties: ['hard'] }))
    expect(sesudos).toContain(terraforming)
    expect(sesudos).not.toContain(camelUp)
    expect(sesudos.every((game) => game.difficulty === 'hard')).toBe(true)
  })

  it('filtra por número de jugadores, incluidos los extremos', () => {
    expect(filterGames(catalogo, filters({ players: 3 }))).toContain(catan)
    expect(filterGames(catalogo, filters({ players: 4 }))).toContain(catan)
    expect(filterGames(catalogo, filters({ players: 6 }))).toContain(catan)
    expect(filterGames(catalogo, filters({ players: 2 }))).not.toContain(catan)
    expect(filterGames(catalogo, filters({ players: 7 }))).not.toContain(catan)
  })

  it('combina texto y filtros', () => {
    const found = filterGames(
      catalogo,
      filters({ query: 'catan', durations: ['short'] }),
    )
    expect(found).toEqual([])
  })

  it('un juego sin duración declarada solo desaparece al filtrar por duración', () => {
    expect(filterGames(catalogo, filters({ players: 4 }))).toContain(sinDatos)
    expect(filterGames(catalogo, filters({ durations: ['short'] }))).not.toContain(
      sinDatos,
    )
    expect(filterGames(catalogo, filters({ difficulties: ['easy'] }))).not.toContain(
      sinDatos,
    )
  })
})

describe('estado de los filtros', () => {
  it('toggleFilter añade y quita', () => {
    expect(toggleFilter<string>([], 'short')).toEqual(['short'])
    expect(toggleFilter(['short', 'long'], 'short')).toEqual(['long'])
  })

  it('activeFilterCount no cuenta el texto, hasActiveFilters sí', () => {
    const conTexto = filters({ query: 'azul' })
    expect(activeFilterCount(conTexto)).toBe(0)
    expect(hasActiveFilters(conTexto)).toBe(true)

    const conFiltros = filters({ durations: ['short'], players: 4 })
    expect(activeFilterCount(conFiltros)).toBe(2)
    expect(hasActiveFilters(conFiltros)).toBe(true)

    expect(hasActiveFilters(filters({ query: '   ' }))).toBe(false)
  })
})

describe('texto', () => {
  it('formatPlayTime abrevia cuando la partida dura siempre lo mismo', () => {
    expect(formatPlayTime({ min: 30, max: 30 })).toBe('30 min')
    expect(formatPlayTime({ min: 30, max: 45 })).toBe('30–45 min')
    expect(formatPlayTime(undefined)).toBeNull()
  })

  it('difficultyLabel traduce la dificultad', () => {
    expect(difficultyLabel('easy')).toBe('Sencillo')
    expect(difficultyLabel(undefined)).toBeNull()
  })
})
