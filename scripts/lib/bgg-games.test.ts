/**
 * Lo único de la ingesta que se puede comprobar sin red.
 *
 * `npm run ingest:bgg` escribe decenas de miles de filas con estas reglas y nadie las va
 * a mirar una a una: si el slug sale mal, si el lema queda vacío o si una expansión se
 * cuela como juego, se descubre en la interfaz de alguien meses después. Aquí se fija el
 * comportamiento de la traducción BGG → catálogo, que es donde puede torcerse.
 */
import { describe, expect, it } from 'vitest'
import {
  bggSeedGame,
  definitionOf,
  difficultyOf,
  factsOf,
  freeSlug,
  iconOf,
  sheetOf,
  slugify,
  taglineOf,
} from './bgg-games'
import type { BggThing } from './bgg-api'

/** Una ficha de BGG mínima, para no repetir el objeto entero en cada test. */
function thing(extra: Partial<BggThing> = {}): BggThing {
  return { id: 13, name: 'Catan', type: 'boardgame', ...extra }
}

describe('slugify', () => {
  it('baja a minúsculas y junta con guiones', () => {
    expect(slugify('Ticket to Ride: Europe')).toBe('ticket-to-ride-europe')
    expect(slugify('7 Wonders Duel')).toBe('7-wonders-duel')
  })

  it('quita tildes y signos, y no deja guiones sueltos en los extremos', () => {
    expect(slugify('Catán')).toBe('catan')
    expect(slugify('¡Aventureros!')).toBe('aventureros')
    expect(slugify('Kingdomino — Duel')).toBe('kingdomino-duel')
  })

  // `games_custom_slug_prefix` exige que un juego de catálogo NO empiece por `c-`: ese
  // prefijo es de los que se inventa un grupo. Un título con una «C» suelta lo pisaría.
  it('esquiva el prefijo reservado a los juegos de grupo', () => {
    expect(slugify('C&C: Ancients').startsWith('c-')).toBe(false)
    expect(slugify('C&C: Ancients')).toBe('bgg-c-c-ancients')
  })

  it('recorta los títulos larguísimos sin dejar el guion al final', () => {
    const slug = slugify('a'.repeat(58) + ' bcdefghij')
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('freeSlug', () => {
  it('usa el título si está libre', () => {
    expect(freeSlug(thing(), new Set())).toBe('catan')
  })

  it('desempata con el año y, si tampoco, con el ID de BGG', () => {
    expect(freeSlug(thing({ year: 1995 }), new Set(['catan']))).toBe('catan-1995')
    expect(freeSlug(thing({ year: 1995 }), new Set(['catan', 'catan-1995']))).toBe('catan-13')
  })

  it('se rinde si el título no da ningún slug', () => {
    expect(freeSlug(thing({ name: '???' }), new Set())).toBeNull()
  })
})

describe('lema e icono', () => {
  it('el lema son hasta tres categorías, en español', () => {
    expect(taglineOf(['Card Game', 'Fantasy', 'Fighting'])).toBe('Cartas · Fantasía · Combate')
    expect(taglineOf(['Dice', 'Economic', 'Medieval', 'Nautical'])).toBe(
      'Dados · Económico · Medieval',
    )
  })

  it('una categoría sin traducir se queda como está, que es mejor que nada', () => {
    expect(taglineOf(['Book'])).toBe('Book')
  })

  it('sin categorías queda un lema genérico, nunca vacío', () => {
    expect(taglineOf([])).toBe('Juego de mesa')
  })

  it('el icono sale de la primera categoría que tenga uno', () => {
    expect(iconOf(['Age of Reason', 'Card Game'])).toBe('🃏')
    expect(iconOf(['Age of Reason'])).toBe('🎲')
    expect(iconOf([])).toBe('🎲')
  })
})

describe('difficultyOf', () => {
  it('parte el peso de BGG por donde lo parte su propia comunidad', () => {
    expect(difficultyOf(1.2)).toBe('easy')
    expect(difficultyOf(1.99)).toBe('easy')
    expect(difficultyOf(2)).toBe('medium')
    expect(difficultyOf(2.99)).toBe('medium')
    expect(difficultyOf(3)).toBe('hard')
    expect(difficultyOf(4.7)).toBe('hard')
  })

  it('sin votos de peso no se inventa una dificultad', () => {
    expect(difficultyOf(undefined)).toBeUndefined()
    expect(difficultyOf(0)).toBeUndefined()
  })
})

describe('sheetOf', () => {
  it('distingue los dos casos en los que apuntar puntos sería incorrecto', () => {
    expect(sheetOf(['Cooperative Game', 'Hand Management'])).toBe('coop')
    expect(sheetOf(['Team-Based Game'])).toBe('teams')
  })

  it('todo lo demás se apunta a puntos, que es lo que hace la gente', () => {
    expect(sheetOf(['Worker Placement'])).toBe('points')
    expect(sheetOf([])).toBe('points')
  })
})

describe('definitionOf', () => {
  const full = thing({
    name: 'Catan',
    year: 1995,
    minPlayers: 3,
    maxPlayers: 4,
    minTime: 60,
    maxTime: 120,
    weight: 2.3,
    mechanics: ['Trading', 'Dice Rolling'],
    categories: ['Economic', 'Negotiation'],
  })

  it('reconstruye el juego con la hoja y el color que decide el motor', () => {
    const game = definitionOf(full, 'catan')

    expect(game.slug).toBe('catan')
    expect(game.name).toBe('Catan')
    expect(game.icon).toBe('💰')
    expect(game.tagline).toBe('Económico · Negociación')
    expect(game.minPlayers).toBe(3)
    expect(game.maxPlayers).toBe(4)
    expect(game.playTime).toEqual({ min: 60, max: 120 })
    expect(game.difficulty).toBe('medium')
    expect(game.fields.map((field) => field.key)).toEqual(['points'])
    expect(game.theme.primary).toMatch(/^#[0-9a-f]{6}$/i)
  })

  // Una duración de «0 a 0 minutos» saldría en los filtros y sería mentira.
  it('lo que BGG no sabe se queda sin poner', () => {
    const game = definitionOf(thing({ name: 'Sin datos' }), 'sin-datos')

    expect(game.playTime).toBeUndefined()
    expect(game.difficulty).toBeUndefined()
  })

  it('un rango de jugadores imposible se corrige en vez de guardarse', () => {
    const game = definitionOf(thing({ minPlayers: 4, maxPlayers: 2 }), 'raro')

    expect(game.minPlayers).toBe(4)
    expect(game.maxPlayers).toBeGreaterThanOrEqual(game.minPlayers)
  })
})

describe('bggSeedGame', () => {
  it('deja el juego listo para `gameRow`', () => {
    const seed = bggSeedGame(
      thing({ year: 1995, votes: 130000, image: 'https://x/g.jpg', thumbnail: 'https://x/t.jpg' }),
      new Set(),
    )

    expect(seed?.game.slug).toBe('catan')
    expect(seed?.sheetId).toBe('points')
    expect(seed?.bgg).toEqual({
      id: 13,
      year: 1995,
      popularity: 130000,
      coverUrl: 'https://x/g.jpg',
      coverThumbUrl: 'https://x/t.jpg',
    })
  })

  // La partida es del juego base, no de su caja de ampliación: `matches.game_slug`
  // apunta a un juego con el que se juega.
  it('descarta lo que no es un juego de mesa', () => {
    expect(bggSeedGame(thing({ type: 'boardgameexpansion' }), new Set())).toBeNull()
    expect(bggSeedGame(thing({ type: 'videogame' }), new Set())).toBeNull()
  })

  it('descarta las fichas sin nombre y las que no consiguen slug', () => {
    expect(bggSeedGame(thing({ name: undefined }), new Set())).toBeNull()
    expect(bggSeedGame(thing({ year: 1995 }), new Set(['catan', 'catan-1995', 'catan-13']))).toBeNull()
  })

  it('sin votos, popularidad cero: existe pero no se cuela por delante de nadie', () => {
    expect(factsOf(thing()).popularity).toBe(0)
  })
})
