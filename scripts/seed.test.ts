/**
 * Las invariantes de la semilla del catálogo.
 *
 * Estas comprobaciones vivían en `src/games/registry.test.ts` mientras el catálogo
 * entero viajaba en el bundle. Ahora las filas están en `scripts/catalog.data.ts` y
 * acaban en Postgres, así que se comprueban aquí, del lado que las escribe: `registry`
 * solo conoce los 24 juegos escritos a mano y no puede validar lo que ya no ve.
 *
 * Nada de esto rompe la compilación si falla —son datos, no tipos—, y todo deja un
 * hueco en la interfaz de alguien: un slug repetido hace desaparecer un juego, un lema
 * vacío deja una tarjeta muda, unos campos compartidos por referencia hacen que tocar
 * el mínimo de un juego se lo cambie a otros trescientos.
 */
import { describe, expect, it } from 'vitest'
import { CATALOG_ROWS } from './catalog.data'
import { fieldRows, gameRow, seedGames } from './lib/game-rows'
import { CURATED_GAMES } from '../src/games/curated'
import { COVERS } from '../src/games/covers'
import { expandCatalogSeedRow } from '../src/games/catalog'

const SEED = seedGames()
const CATALOG_GAMES = CATALOG_ROWS.map(expandCatalogSeedRow)
const curatedSlugs = new Set(CURATED_GAMES.map((game) => game.slug))

describe('catálogo amplio', () => {
  it('la semilla junta los escritos a mano y las filas, sin repetir slug', () => {
    const slugs = SEED.map((seed) => seed.game.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(SEED.length).toBe(CURATED_GAMES.length + CATALOG_ROWS.length)
  })

  // Si una fila repitiera el slug de un juego escrito a mano, `seedGames` se queda con
  // el escrito a mano y la fila desaparece sin avisar. Cuando eso pase, lo correcto es
  // borrar la fila de `catalog.data.ts`.
  it('ninguna fila pisa el slug de un juego escrito a mano', () => {
    const pisados = CATALOG_ROWS.filter((row) => curatedSlugs.has(row[0]))
    expect(pisados.map((row) => row[0])).toEqual([])
  })

  it('cada juego trae nombre, icono y lema', () => {
    for (const game of CATALOG_GAMES) {
      expect(game.name.trim(), game.slug).not.toBe('')
      expect(game.icon.trim(), game.slug).not.toBe('')
      expect(game.tagline?.trim(), game.slug).not.toBe('')
      expect(game.slug, `${game.name}: slug con mayúsculas o símbolos`).toMatch(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
      )
    }
  })

  // `games_custom_slug_prefix` reserva `c-` para los juegos que se inventa un grupo: una
  // fila de catálogo que empezara así ni siquiera entraría en la base de datos.
  it('ninguna fila usa el prefijo reservado a los juegos de grupo', () => {
    for (const seed of SEED) {
      expect(seed.game.slug.startsWith('c-'), `${seed.game.slug} pisa el prefijo c-`).toBe(false)
    }
  })

  it('los rangos de jugadores son posibles', () => {
    for (const game of CATALOG_GAMES) {
      expect(game.minPlayers, game.slug).toBeGreaterThan(0)
      expect(game.maxPlayers, game.slug).toBeGreaterThanOrEqual(game.minPlayers)
    }
  })

  // Sin duración ni dificultad un juego desaparece del buscador en cuanto alguien
  // filtra por ellas, y filtrar es justo lo que se hace con un catálogo de miles.
  it('todos declaran duración y dificultad', () => {
    for (const game of CATALOG_GAMES) {
      expect(game.playTime, `${game.slug} sin duración`).toBeDefined()
      expect(game.playTime!.min, game.slug).toBeGreaterThan(0)
      expect(game.playTime!.max, game.slug).toBeGreaterThanOrEqual(game.playTime!.min)
      expect(['easy', 'medium', 'hard'], game.slug).toContain(game.difficulty)
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

describe('portadas', () => {
  // `covers.generated.ts` lo escribe `npm run covers` y se commitea junto a los .webp.
  // Las dos formas de que se desincronice son que sobreviva la entrada de un juego que
  // ya no existe y que se commitee el fichero generado sin las imágenes.
  it('cada portada apunta a un juego de la semilla y a un fichero que existe', () => {
    const slugs = new Set(SEED.map((seed) => seed.game.slug))
    // Se listan con `import.meta.glob` en vez de leer el disco con `node:fs` porque el
    // test corre bajo Vite. Sin `eager` no se importa ninguna imagen: solo las claves.
    const enDisco = new Set(
      Object.keys(import.meta.glob('../public/covers/*.webp')).map((path) =>
        path.replace('../public/', ''),
      ),
    )

    for (const [slug, cover] of Object.entries(COVERS)) {
      expect(slugs.has(slug), `${slug} no está en la semilla`).toBe(true)
      expect(cover.startsWith('/'), `${slug}: la ruta debe ser relativa`).toBe(false)
      expect(enDisco.has(cover), `falta public/${cover}`).toBe(true)
    }
  })
})

describe('filas de Postgres', () => {
  // Las columnas `not null` de `public.games` se validan ANTES de resolver el
  // `on conflict`, así que una fila a la que le falte una no falla al actualizar: falla
  // el lote entero de 500 que la ingesta estaba escribiendo.
  it('ninguna fila deja vacía una columna obligatoria', () => {
    for (const [index, seed] of SEED.entries()) {
      const row = gameRow(seed, index)
      for (const column of ['slug', 'name', 'icon', 'score_label', 'total_mode', 'winner_rule']) {
        expect(row[column], `${seed.game.slug}.${column}`).toBeTruthy()
      }
      expect(typeof row.popularity, seed.game.slug).toBe('number')
      expect(row.search_text, `${seed.game.slug} no se podría buscar`).not.toBe('')
    }
  })

  // La portada descargada se sirve desde el propio dominio bajo la base del despliegue,
  // que cambia entre GitHub Pages y local: guardarla ataría la fila a un despliegue.
  it('las portadas locales no llegan a la base de datos', () => {
    for (const [index, seed] of SEED.entries()) {
      if (!COVERS[seed.game.slug]) continue
      expect(gameRow(seed, index).image_url, seed.game.slug).toBeNull()
    }
  })

  it('la hoja de puntuación baja campo a campo y en orden', () => {
    const catan = SEED.find((seed) => seed.game.slug === 'catan')!
    const rows = fieldRows(catan.game)

    expect(rows.map((row) => row.field_key)).toEqual(catan.game.fields.map((f) => f.key))
    expect(rows.map((row) => row.sort_order)).toEqual(rows.map((_, index) => index))
    expect(new Set(rows.map((row) => row.game_slug))).toEqual(new Set(['catan']))
  })
})
