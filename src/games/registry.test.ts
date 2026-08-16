import { describe, expect, it } from 'vitest'
import {
  applyUniqueField,
  computeTotal,
  CURATED_GAMES,
  emptyScores,
  GAME_LIST,
  rankPlayers,
  requireGame,
  validateScores,
} from './registry'
import { CATALOG_GAMES } from './catalog'
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

  // `rules` es opcional en el tipo: no la traen los juegos que crea un usuario. Los del
  // catálogo amplio PUEDEN llevarla —los más jugados la tienen en `catalog.rules.ts`— o
  // quedarse sin ella y enseñar «Sin chuleta de reglas». Los escritos a mano en
  // `definitions/` sí están obligados a llevar la chuleta entera: es lo que los distingue.
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
  // formas de que se desincronice son que sobreviva la entrada de un juego que ya no
  // existe, y que se commitee el fichero generado sin las imágenes: ninguna de las dos
  // rompe la compilación, solo dejan un hueco en la interfaz.
  it('cada portada generada apunta a un juego real y a un fichero que existe', () => {
    const slugs = new Set(GAME_LIST.map((game) => game.slug))
    // Se listan con `import.meta.glob` en vez de leer el disco con `node:fs` porque este
    // fichero compila con el tsconfig de la app, que no trae los tipos de Node. Sin
    // `eager` no se importa ninguna imagen: solo interesan las claves.
    const enDisco = new Set(
      Object.keys(import.meta.glob('../../public/covers/*.webp')).map((path) =>
        path.replace('../../public/', ''),
      ),
    )

    for (const [slug, cover] of Object.entries(COVERS)) {
      expect(slugs.has(slug), `${slug} no está en GAME_LIST`).toBe(true)
      expect(cover.file.startsWith('/'), `${slug}: la ruta debe ser relativa`).toBe(false)
      expect(enDisco.has(cover.file), `falta public/${cover.file}`).toBe(true)
    }
  })

  it('ningún juego integrado usa el prefijo reservado a los juegos de grupo', () => {
    for (const game of GAME_LIST) {
      expect(game.slug.startsWith('c-'), `${game.slug} pisa el prefijo c-`).toBe(false)
    }
  })
})

describe('catálogo amplio', () => {
  const curatedSlugs = new Set(CURATED_GAMES.map((game) => game.slug))

  it('está entero dentro de la lista de juegos integrados', () => {
    const slugs = new Set(GAME_LIST.map((game) => game.slug))
    for (const game of CATALOG_GAMES) {
      expect(slugs.has(game.slug), `${game.slug} no llegó a GAME_LIST`).toBe(true)
    }
    expect(GAME_LIST.length).toBe(CURATED_GAMES.length + CATALOG_GAMES.length)
  })

  // Si un juego del catálogo repitiera el slug de uno escrito a mano, el registro se
  // quedaría con el escrito a mano y la fila del catálogo desaparecería sin avisar.
  // Cuando eso pase, lo correcto es borrar la fila de `catalog.data.ts`.
  it('ninguna fila pisa el slug de un juego escrito a mano', () => {
    const pisados = CATALOG_GAMES.filter((game) => curatedSlugs.has(game.slug))
    expect(pisados.map((game) => game.slug)).toEqual([])
  })

  it('cada juego trae nombre, icono y lema', () => {
    for (const game of CATALOG_GAMES) {
      expect(game.name.trim(), game.slug).not.toBe('')
      expect(game.icon.trim(), game.slug).not.toBe('')
      expect(game.tagline.trim(), game.slug).not.toBe('')
      expect(game.slug, `${game.name}: slug con mayúsculas o símbolos`).toMatch(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
      )
    }
  })

  it('los rangos de jugadores son posibles', () => {
    for (const game of CATALOG_GAMES) {
      expect(game.minPlayers, game.slug).toBeGreaterThan(0)
      expect(game.maxPlayers, game.slug).toBeGreaterThanOrEqual(game.minPlayers)
    }
  })

  it('todos declaran una hoja de puntuación utilizable', () => {
    for (const game of CATALOG_GAMES) {
      expect(game.fields.length, `${game.slug} sin campos`).toBeGreaterThan(0)
      expect(game.scoreLabel.trim(), game.slug).not.toBe('')
    }
  })

  // Cada juego copia los campos de su hoja: si los compartieran, tocar el mínimo de uno
  // se lo cambiaría a los otros trescientos que usan la misma hoja.
  it('dos juegos con la misma hoja no comparten el objeto de los campos', () => {
    const conPuntos = CATALOG_GAMES.filter((game) => game.fields[0]?.key === 'points')
    expect(conPuntos.length).toBeGreaterThan(1)
    expect(conPuntos[0].fields[0]).not.toBe(conPuntos[1].fields[0])
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
