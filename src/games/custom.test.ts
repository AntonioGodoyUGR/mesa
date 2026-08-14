import { describe, expect, it } from 'vitest'
import {
  blankCustomGame,
  cleanRules,
  customSlug,
  fieldKeyFor,
  formatScoringRows,
  formatTurnPhases,
  isCustomSlug,
  normalizeDefinition,
  parseRuleLines,
  parseScoringRows,
  parseTurnPhases,
  slugify,
  toDefinition,
  validateDefinition,
} from './custom'
import { computeTotal, emptyScores, rankPlayers } from './registry'
import type { GameDefinition } from './types'

describe('slugify y customSlug', () => {
  it('quita tildes, espacios y símbolos', () => {
    expect(slugify('Mi Juego Ñoño')).toBe('mi-juego-nono')
    expect(slugify('  ¡El Rey del Tejado!  ')).toBe('el-rey-del-tejado')
    expect(slugify('7 Maravillas')).toBe('7-maravillas')
  })

  it('no deja guiones sueltos ni cadenas larguísimas', () => {
    expect(slugify('---hola---')).toBe('hola')
    expect(slugify('a'.repeat(80)).length).toBe(40)
  })

  it('los juegos de grupo llevan el prefijo reservado', () => {
    const slug = customSlug('Mi Juego', () => 0.5)
    expect(slug.startsWith('c-mi-juego-')).toBe(true)
    expect(isCustomSlug(slug)).toBe(true)
    expect(isCustomSlug('catan')).toBe(false)
  })

  it('un nombre solo de emojis sigue dando un slug usable', () => {
    expect(customSlug('🎲🎲', () => 0.1).startsWith('c-juego-')).toBe(true)
  })

  it('dos juegos con el mismo nombre no comparten slug', () => {
    let seed = 0
    const random = () => {
      seed += 0.37
      return seed % 1
    }
    expect(customSlug('Torneo', random)).not.toBe(customSlug('Torneo', random))
  })
})

describe('fieldKeyFor', () => {
  it('deriva la clave de la etiqueta', () => {
    expect(fieldKeyFor('Puntos de victoria', [])).toBe('puntos_de_victoria')
  })

  it('numera cuando la clave ya está cogida', () => {
    expect(fieldKeyFor('Puntos', ['puntos'])).toBe('puntos_2')
    expect(fieldKeyFor('Puntos', ['puntos', 'puntos_2'])).toBe('puntos_3')
  })
})

describe('validateDefinition', () => {
  it('acepta el juego que propone el formulario', () => {
    const game = blankCustomGame()
    game.name = 'Mi juego'
    expect(validateDefinition(game)).toEqual([])
  })

  it('exige nombre y campos', () => {
    const game = { ...blankCustomGame(), fields: [] }
    const problems = validateDefinition(game)
    expect(problems.some((p) => p.includes('nombre'))).toBe(true)
    expect(problems.some((p) => p.includes('al menos un campo'))).toBe(true)
  })

  it('detecta claves repetidas', () => {
    const game = blankCustomGame()
    game.name = 'Mi juego'
    game.fields = [
      { key: 'a', label: 'Uno', icon: '⭐', type: 'number', points: 1, isTotal: true },
      { key: 'a', label: 'Dos', icon: '⭐', type: 'number' },
    ]
    expect(validateDefinition(game).some((p) => p.includes('misma clave'))).toBe(true)
  })

  it('el total explícito necesita exactamente un campo marcado', () => {
    const game = blankCustomGame()
    game.name = 'Mi juego'
    game.fields = [{ key: 'a', label: 'Uno', icon: '⭐', type: 'number' }]
    expect(validateDefinition(game).some((p) => p.includes('exactamente un campo'))).toBe(
      true,
    )
  })

  it('el total sumado no admite campos marcados como total', () => {
    const game = blankCustomGame()
    game.name = 'Mi juego'
    game.totalMode = 'computed'
    expect(validateDefinition(game).some((p) => p.includes('ningún campo'))).toBe(true)
  })

  it('el total sumado necesita algún campo que dé puntos', () => {
    const game = blankCustomGame()
    game.name = 'Mi juego'
    game.totalMode = 'computed'
    game.fields = [{ key: 'a', label: 'Uno', icon: '⭐', type: 'counter' }]
    expect(validateDefinition(game).some((p) => p.includes('dar puntos'))).toBe(true)
  })

  it('detecta rangos de jugadores imposibles', () => {
    const game = { ...blankCustomGame(), name: 'Mi juego', minPlayers: 6, maxPlayers: 2 }
    expect(validateDefinition(game).some((p) => p.includes('mínimo de jugadores'))).toBe(
      true,
    )
  })

  it('la duración es opcional, pero si se declara tiene que tener sentido', () => {
    const game = { ...blankCustomGame(), name: 'Mi juego' }
    expect(validateDefinition(game)).toEqual([])
    expect(validateDefinition({ ...game, playTime: { min: 20, max: 40 } })).toEqual([])

    const alReves = validateDefinition({ ...game, playTime: { min: 60, max: 30 } })
    expect(alReves.some((p) => p.includes('duración mínima'))).toBe(true)
  })

  it('detecta un campo con el mínimo por encima del máximo', () => {
    const game = blankCustomGame()
    game.name = 'Mi juego'
    game.fields = [
      { key: 'a', label: 'Uno', icon: '⭐', type: 'counter', points: 1, isTotal: true, min: 5, max: 2 },
    ]
    expect(validateDefinition(game).some((p) => p.includes('el mínimo supera'))).toBe(true)
  })
})

describe('reglas escritas a mano', () => {
  it('una línea es un elemento y las vacías se ignoran', () => {
    expect(parseRuleLines('Uno\n\n  Dos  \nTres')).toEqual(['Uno', 'Dos', 'Tres'])
  })

  it('las fases del turno van y vuelven sin perder nada', () => {
    const text = 'Robar · Coge dos cartas\nJugar · Baja lo que puedas'
    const phases = parseTurnPhases(text)
    expect(phases).toEqual([
      { name: 'Robar', detail: 'Coge dos cartas' },
      { name: 'Jugar', detail: 'Baja lo que puedas' },
    ])
    expect(formatTurnPhases(phases)).toBe(text)
  })

  it('la tabla de puntuación va y vuelve sin perder nada', () => {
    const text = 'Carta baja · 1 punto\nTrío · 5 puntos'
    const rows = parseScoringRows(text)
    expect(rows).toEqual([
      { what: 'Carta baja', points: '1 punto' },
      { what: 'Trío', points: '5 puntos' },
    ])
    expect(formatScoringRows(rows)).toBe(text)
  })

  it('una línea sin punto medio deja la parte derecha vacía', () => {
    expect(parseScoringRows('Solo el concepto')).toEqual([
      { what: 'Solo el concepto', points: '' },
    ])
  })

  it('sin ningún apartado escrito, el juego se guarda sin reglas', () => {
    expect(cleanRules({})).toBeUndefined()
    expect(cleanRules({ players: '   ', setup: [] })).toBeUndefined()
    expect(cleanRules({ endCondition: 'Gana quien llegue a 50.' })).toEqual({
      endCondition: 'Gana quien llegue a 50.',
    })
  })
})

describe('normalizeDefinition', () => {
  it('recorta textos y quita las reglas vacías', () => {
    const game: GameDefinition = {
      ...blankCustomGame(),
      name: '  Mi juego  ',
      tagline: '  Una frase  ',
      rules: { players: '  ', setup: [] },
    }
    const normalized = normalizeDefinition(game)
    expect(normalized.name).toBe('Mi juego')
    expect(normalized.tagline).toBe('Una frase')
    expect('rules' in normalized).toBe(false)
  })

  it('no guarda la duración ni la dificultad si no se han dicho', () => {
    const normalized = normalizeDefinition({ ...blankCustomGame(), name: 'Mi juego' })
    expect('playTime' in normalized).toBe(false)
    expect('difficulty' in normalized).toBe(false)
  })

  it('un campo de sí o no no arrastra límites numéricos', () => {
    const game = blankCustomGame()
    game.fields = [
      { key: 'a', label: 'Ganó', icon: '⭐', type: 'toggle', points: 1, isTotal: true, min: 0, max: 3 },
    ]
    const [field] = normalizeDefinition(game).fields
    expect(field.min).toBeUndefined()
    expect(field.max).toBeUndefined()
  })
})

describe('un juego propio se comporta como uno integrado', () => {
  const game: GameDefinition = {
    ...blankCustomGame(),
    slug: 'c-mi-juego-ab12',
    name: 'Mi juego',
    groupId: 'grupo-1',
    totalMode: 'computed',
    winnerRule: 'lowest',
    fields: [
      { key: 'cartas', label: 'Cartas en mano', icon: '🃏', type: 'number', points: 1 },
      { key: 'penalty', label: 'Penalización', icon: '💀', type: 'counter', points: 5 },
      { key: 'cerro', label: 'Cerró', icon: '🚪', type: 'toggle', points: -10 },
    ],
  }

  it('emptyScores cubre sus campos', () => {
    expect(Object.keys(emptyScores(game)).sort()).toEqual(['cartas', 'cerro', 'penalty'])
  })

  it('computeTotal suma sus reglas, negativos incluidos', () => {
    expect(computeTotal(game, { cartas: 12, penalty: 2, cerro: true })).toBe(12)
  })

  it('rankPlayers respeta que gane la puntuación más baja', () => {
    const ranked = rankPlayers(
      game,
      [
        { name: 'Ana', scores: { cartas: 30 } },
        { name: 'Beto', scores: { cartas: 4 } },
      ],
      (player) => player.scores,
    )
    expect(ranked[0].entry.name).toBe('Beto')
  })
})

describe('toDefinition', () => {
  it('reconstruye la definición desde la fila de la base de datos', () => {
    const stored = { ...blankCustomGame(), slug: 'viejo', name: 'Mi juego' }
    const game = toDefinition({
      slug: 'c-mi-juego-ab12',
      image_url: 'https://cdn/mi.webp',
      group_id: 'grupo-1',
      created_by: 'usuario-1',
      definition: stored,
    })

    expect(game.slug).toBe('c-mi-juego-ab12')
    expect(game.imageUrl).toBe('https://cdn/mi.webp')
    expect(game.groupId).toBe('grupo-1')
    expect(game.createdBy).toBe('usuario-1')
    expect(game.name).toBe('Mi juego')
  })
})
