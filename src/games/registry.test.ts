import { describe, expect, it } from 'vitest'
import {
  applyUniqueField,
  catalogGame,
  computeTotal,
  CURATED_GAMES,
  emptyScores,
  GAME_LIST,
  rankPlayers,
  requireGame,
  searchable,
  validateScores,
} from './registry'
import type { CatalogGameRow } from './registry'
import { COVERS, coverUrl } from './covers'
import type { ScoreValues } from './types'

const catan = requireGame('catan')
const carcassonne = requireGame('carcassonne')
const camelUp = requireGame('camel-up')
const patchwork = requireGame('patchwork')
const azul = requireGame('azul')
const splendor = requireGame('splendor')

describe('coherencia de las definiciones', () => {
  it('cada juego tiene slug único y claves de campo únicas', () => {
    const slugs = GAME_LIST.map((game) => game.slug)
    expect(new Set(slugs).size).toBe(slugs.length)

    for (const game of GAME_LIST) {
      const keys = game.fields.map((field) => field.key)
      expect(new Set(keys).size, `claves duplicadas en ${game.slug}`).toBe(keys.length)
    }
  })

  it('los juegos de total explícito declaran exactamente un campo total', () => {
    for (const game of GAME_LIST) {
      const totals = game.fields.filter((field) => field.isTotal)
      if (game.totalMode === 'explicit') {
        expect(totals.length, `${game.slug} debe tener 1 campo total`).toBe(1)
      } else {
        expect(totals.length, `${game.slug} no debe declarar campo total`).toBe(0)
      }
    }
  })

  it('emptyScores cubre todos los campos del juego', () => {
    for (const game of GAME_LIST) {
      const scores = emptyScores(game)
      expect(Object.keys(scores).sort()).toEqual(game.fields.map((f) => f.key).sort())
    }
  })

  // `rules` es opcional en el tipo: no la traen los juegos que crea un usuario, y los del
  // catálogo amplio la tienen en Postgres o no la tienen. Los escritos a mano en
  // `definitions/` sí están obligados a llevar la chuleta entera, y además dentro del
  // bundle: son los que funcionan sin red.
  it('la chuleta de reglas está completa en todos los juegos escritos a mano', () => {
    for (const game of CURATED_GAMES) {
      const rules = game.rules
      expect(rules, `${game.slug} sin chuleta`).toBeDefined()
      expect(rules?.players, game.slug).toBeTruthy()
      expect(rules?.duration, game.slug).toBeTruthy()
      expect(rules?.setup?.length, game.slug).toBeGreaterThan(0)
      expect(rules?.turn?.length, game.slug).toBeGreaterThan(0)
      expect(rules?.scoring?.length, game.slug).toBeGreaterThan(0)
      expect(rules?.endCondition?.length, game.slug).toBeGreaterThan(0)
      expect(rules?.reminders?.length, game.slug).toBeGreaterThan(0)
    }
  })

  // `playTime` y `difficulty` también son opcionales en el tipo (un juego de grupo
  // puede no declararlos), pero sin ellos un juego del catálogo desaparecería del
  // buscador en cuanto alguien filtrase por duración o dificultad.
  it('todos los juegos integrados declaran duración y dificultad', () => {
    for (const game of GAME_LIST) {
      expect(game.playTime, `${game.slug} sin duración`).toBeDefined()
      expect(game.playTime!.min, game.slug).toBeGreaterThan(0)
      expect(game.playTime!.max, game.slug).toBeGreaterThanOrEqual(game.playTime!.min)
      expect(['easy', 'medium', 'hard'], game.slug).toContain(game.difficulty)
    }
  })

  // La portada es opcional: los juegos que no tienen caja que enseñar se quedan con su
  // icono. Las que hay son las descargadas por `npm run covers`, servidas desde el propio
  // dominio bajo la base del despliegue; no debe quedar ninguna URL remota escrita a mano,
  // que es lo que había antes y suponía hacer hotlink al servidor de otro.
  it('las portadas declaradas salen de public/covers/', () => {
    for (const game of GAME_LIST) {
      if (game.imageUrl === undefined) continue
      expect(game.imageUrl, game.slug).toBe(coverUrl(game.slug))
    }
  })

  // `covers.generated.ts` lo escribe un script y se commitea junto a los .webp. Las dos
  // forma de que se desincronice es que se commitee sin las imágenes, que no rompe la
  // compilación: solo deja un hueco en la interfaz. Que cada portada corresponda a un
  // juego que existe se comprueba en `scripts/seed.test.ts`, que es donde están los 393
  // juegos de la semilla; aquí solo viajan los 24 escritos a mano.
  it('cada portada generada apunta a un fichero que existe', () => {
    // Se listan con `import.meta.glob` en vez de leer el disco con `node:fs` porque este
    // fichero compila con el tsconfig de la app, que no trae los tipos de Node. Sin
    // `eager` no se importa ninguna imagen: solo interesan las claves.
    const enDisco = new Set(
      Object.keys(import.meta.glob('../../public/covers/*.webp')).map((path) =>
        path.replace('../../public/', ''),
      ),
    )

    for (const [slug, cover] of Object.entries(COVERS)) {
      expect(cover.startsWith('/'), `${slug}: la ruta debe ser relativa`).toBe(false)
      expect(enDisco.has(cover), `falta public/${cover}`).toBe(true)
    }
  })

  it('ningún juego integrado usa el prefijo reservado a los juegos de grupo', () => {
    for (const game of GAME_LIST) {
      expect(game.slug.startsWith('c-'), `${game.slug} pisa el prefijo c-`).toBe(false)
    }
  })
})

describe('computeTotal', () => {
  it('Catán: suma pueblos, ciudades, cartas y las dos especiales', () => {
    const scores: ScoreValues = {
      ...emptyScores(catan),
      settlements: 3, // 3
      cities: 2, // 4
      dev_points: 1, // 1
      longest_road: true, // 2
      largest_army: true, // 2
      knights: 5, // informativo
    }
    expect(computeTotal(catan, scores)).toBe(12)
  })

  it('Catán: los caballeros y las carreteras no suman puntos', () => {
    const base = { ...emptyScores(catan), settlements: 4 }
    expect(computeTotal(catan, base)).toBe(4)
    expect(computeTotal(catan, { ...base, knights: 9, roads: 12 })).toBe(4)
  })

  it('Carcassonne: el total es el campo declarado, el desglose no altera nada', () => {
    const scores: ScoreValues = {
      ...emptyScores(carcassonne),
      points: 87,
      cities: 40,
      roads: 15,
      farms: 24,
      monasteries: 8,
    }
    expect(computeTotal(carcassonne, scores)).toBe(87)
  })

  it('Camel Up: el total son las monedas finales', () => {
    const scores: ScoreValues = {
      ...emptyScores(camelUp),
      coins: 23,
      leg_bets: 11,
      race_bets: 8,
    }
    expect(computeTotal(camelUp, scores)).toBe(23)
  })

  it('Patchwork: los huecos restan de dos en dos', () => {
    const scores: ScoreValues = {
      ...emptyScores(patchwork),
      buttons: 12,
      empty_spaces: 3, // −6
    }
    expect(computeTotal(patchwork, scores)).toBe(6)
    expect(computeTotal(patchwork, { ...scores, special_tile: true })).toBe(13)
  })

  it('Patchwork: una manta llena de huecos deja el total en negativo', () => {
    const scores: ScoreValues = { ...emptyScores(patchwork), buttons: 2, empty_spaces: 10 }
    expect(computeTotal(patchwork, scores)).toBe(-18)
  })

  it('Azul: cada bonus multiplica por su valor', () => {
    const scores: ScoreValues = {
      ...emptyScores(azul),
      board: 41,
      full_rows: 2, // 4
      full_columns: 1, // 7
      full_colours: 2, // 20
    }
    expect(computeTotal(azul, scores)).toBe(72)
  })

  it('Splendor: el total es el prestigio, los nobles y las cartas son registro', () => {
    const scores: ScoreValues = {
      ...emptyScores(splendor),
      prestige: 16,
      nobles: 2,
      cards: 13,
    }
    expect(computeTotal(splendor, scores)).toBe(16)
  })

  it('tolera puntuaciones vacías o con claves ausentes', () => {
    expect(computeTotal(catan, {})).toBe(0)
    expect(computeTotal(carcassonne, {})).toBe(0)
    expect(computeTotal(catan, emptyScores(catan))).toBe(0)
  })
})

describe('rankPlayers', () => {
  const scored = (total: number): ScoreValues => ({
    ...emptyScores(carcassonne),
    points: total,
  })

  it('ordena de mayor a menor cuando gana la puntuación más alta', () => {
    const players = [
      { name: 'Ana', scores: scored(52) },
      { name: 'Beto', scores: scored(91) },
      { name: 'Cris', scores: scored(70) },
    ]
    const ranked = rankPlayers(carcassonne, players, (p) => p.scores)
    expect(ranked.map((r) => r.entry.name)).toEqual(['Beto', 'Cris', 'Ana'])
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it('los empates comparten posición y la siguiente se salta', () => {
    const players = [
      { name: 'Ana', scores: scored(80) },
      { name: 'Beto', scores: scored(80) },
      { name: 'Cris', scores: scored(45) },
    ]
    const ranked = rankPlayers(carcassonne, players, (p) => p.scores)
    expect(ranked.map((r) => r.rank)).toEqual([1, 1, 3])
  })

  it('respeta winnerRule = lowest', () => {
    const golf = { ...carcassonne, winnerRule: 'lowest' as const }
    const players = [
      { name: 'Ana', scores: scored(30) },
      { name: 'Beto', scores: scored(12) },
    ]
    const ranked = rankPlayers(golf, players, (p) => p.scores)
    expect(ranked[0].entry.name).toBe('Beto')
  })

  it('Catán: gana quien más PV suma aunque no sea quien más construyó', () => {
    const players = [
      {
        name: 'Ana',
        scores: { ...emptyScores(catan), settlements: 5, cities: 1 }, // 7
      },
      {
        name: 'Beto',
        scores: {
          ...emptyScores(catan),
          settlements: 2,
          cities: 3,
          longest_road: true,
        }, // 2 + 6 + 2 = 10
      },
    ]
    const ranked = rankPlayers(catan, players, (p) => p.scores)
    expect(ranked[0].entry.name).toBe('Beto')
    expect(ranked[0].total).toBe(10)
  })
})

describe('validateScores', () => {
  const player = (name: string, scores: ScoreValues = {}) => ({
    name,
    scores: { ...emptyScores(catan), ...scores } as ScoreValues,
  })

  it('acepta una partida correcta', () => {
    const issues = validateScores(catan, [
      player('Ana', { settlements: 4, longest_road: true }),
      player('Beto', { cities: 3 }),
      player('Cris', { settlements: 2 }),
    ])
    expect(issues).toEqual([])
  })

  it('detecta que dos jugadores tengan la misma carta especial', () => {
    const issues = validateScores(catan, [
      player('Ana', { largest_army: true }),
      player('Beto', { largest_army: true }),
      player('Cris'),
    ])
    expect(issues).toHaveLength(1)
    expect(issues[0].fieldKey).toBe('largest_army')
    expect(issues[0].message).toContain('Ana')
    expect(issues[0].message).toContain('Beto')
  })

  it('detecta valores fuera de los límites del campo', () => {
    const issues = validateScores(catan, [
      player('Ana', { cities: 9 }),
      player('Beto'),
      player('Cris'),
    ])
    expect(issues.some((issue) => issue.fieldKey === 'cities')).toBe(true)
  })

  it('detecta un número de jugadores no admitido', () => {
    const tooFew = validateScores(catan, [player('Ana'), player('Beto')])
    expect(tooFew.some((issue) => issue.message.includes('al menos 3'))).toBe(true)
  })
})

describe('applyUniqueField', () => {
  it('al dar una carta especial se la quita a los demás', () => {
    const scores = [
      { ...emptyScores(catan), longest_road: true },
      { ...emptyScores(catan) },
      { ...emptyScores(catan) },
    ]
    const next = applyUniqueField(catan, scores, 'longest_road', 1, true)
    expect(next.map((s) => s.longest_road)).toEqual([false, true, false])
  })

  it('quitar la carta no se la da a nadie más', () => {
    const scores = [
      { ...emptyScores(catan), longest_road: true },
      { ...emptyScores(catan) },
    ]
    const next = applyUniqueField(catan, scores, 'longest_road', 0, false)
    expect(next.map((s) => s.longest_road)).toEqual([false, false])
  })
})

/**
 * `catalogGame` es la costura entre el catálogo que viaja en el bundle y el que
 * sirve Postgres. Lo que se prueba aquí es que una fila ligera —150 B, sin hoja de
 * puntuación ni chuleta— vuelve a ser un juego completo, porque de eso depende que
 * ningún componente tenga que enterarse de dónde salió el juego que está pintando.
 */
describe('catalogGame', () => {
  // Un juego de la cola larga: existe en Postgres y no viaja en el bundle, que es
  // justo el caso que esta función tiene que resolver.
  const row: CatalogGameRow = {
    slug: 'valle-de-los-mapaches',
    name: 'El valle de los mapaches',
    icon: '🦝',
    tagline: 'Cinco mapaches y un contenedor de basura',
    theme: { primary: '#1a7f4d' },
    min_players: 2,
    max_players: 5,
    min_time: 100,
    max_time: 150,
    difficulty: 'hard',
    sheet_id: 'points',
    image_url: null,
    cover_thumb_url: 'https://cf.geekdo-images.com/ejemplo.jpg',
    group_id: null,
    definition: null,
  }

  it('reconstruye la hoja de puntuación a partir de `sheet_id`', () => {
    const game = catalogGame(row)

    expect(game.name).toBe('El valle de los mapaches')
    expect(game.playTime).toEqual({ min: 100, max: 150 })
    expect(game.difficulty).toBe('hard')
    // La hoja «points» viaja en el bundle: es código, no dato.
    expect(game.totalMode).toBe('explicit')
    expect(game.winnerRule).toBe('highest')
    expect(game.fields.map((field) => field.key)).toEqual(['points'])
    // Sin portada propia, vale la que enlaza el servidor.
    expect(game.imageUrl).toBe('https://cf.geekdo-images.com/ejemplo.jpg')
  })

  it('un juego que ya viaja en la app manda sobre la fila', () => {
    // Catán tiene hoja escrita a mano; la fila remota no puede empeorarla.
    const game = catalogGame({ ...row, slug: 'catan', sheet_id: 'points' })

    expect(game).toBe(requireGame('catan'))
    expect(game.fields.length).toBeGreaterThan(1)
  })

  it('un juego de grupo llega con su definición entera', () => {
    const definition = { ...requireGame('azul'), slug: 'c-el-de-los-jueves' }
    const game = catalogGame({
      ...row,
      slug: 'c-el-de-los-jueves',
      group_id: 'grupo-1',
      sheet_id: null,
      definition,
    })

    expect(game.groupId).toBe('grupo-1')
    expect(game.fields).toEqual(definition.fields)
  })

  it('una fila sin hoja ni definición no rompe la ficha', () => {
    // Puede pasar con una fila a medio sembrar: cae en «apunta los puntos».
    const game = catalogGame({ ...row, sheet_id: null })

    expect(game.fields.map((field) => field.key)).toEqual(['points'])
  })

  it('sin duración declarada no se inventa una', () => {
    const game = catalogGame({ ...row, min_time: null, max_time: null })

    expect(game.playTime).toBeUndefined()
  })
})

describe('searchable', () => {
  it('quita tildes, signos y mayúsculas, como su gemela de Postgres', () => {
    expect(searchable('Catán')).toBe('catan')
    expect(searchable('7 Wonders: Duel')).toBe('7 wonders duel')
    expect(searchable('¡Ñam!')).toBe('nam')
  })
})
