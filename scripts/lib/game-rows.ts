/**
 * Cómo se convierte una `GameDefinition` en filas de Postgres.
 *
 * Lo comparten los dos caminos que siembran el catálogo, que hasta ahora era uno solo:
 *
 *   - `seed-games.ts`, que escribe SQL para pegar en el editor de Supabase. Sigue
 *     siendo lo que arranca un proyecto nuevo desde cero.
 *   - `ingest-bgg.ts`, que escribe por red con la clave de servicio. Es el único
 *     camino posible en cuanto el catálogo pasa de unos miles: 30.000 juegos son
 *     ~37 MB de SQL, y eso no se pega a mano en ningún editor.
 *
 * Están aquí juntos a propósito. Los dos tienen que producir exactamente la misma
 * fila, porque los dos escriben en la misma tabla y la app no puede notar por cuál de
 * ellos entró un juego. Si divergieran, el fallo aparecería en la interfaz de alguien
 * y no en ningún test.
 */
import { expandCatalogSeedRow, type SheetId } from '../../src/games/catalog'
import { searchable } from '../../src/games/registry'
import { CURATED_GAMES } from '../../src/games/curated'
import { COVERS } from '../../src/games/covers'
import { CATALOG_ROWS } from '../catalog.data'
import { CATALOG_RULES } from '../catalog.rules'
import { EXTERNAL_IDS } from '../external-ids.generated'
import type { GameDefinition, ScoreField } from '../../src/games/types'

/** Una fila lista para `insert`, columna a columna. */
export type Row = Record<string, string | number | boolean | object | null>

/**
 * Un juego del proyecto, con lo que la fila necesita y la definición no lleva.
 *
 * `sheetId` es la pieza que permite servir una fila de ~150 B en vez de la definición
 * entera: dice cuál de las cinco hojas genéricas usa el juego, y con eso el cliente
 * reconstruye el resto sin bajárselo. Los escritos a mano van a `null`: su hoja es
 * suya y no se parece a ninguna otra, así que viajan enteros.
 */
export interface SeedGame {
  game: GameDefinition
  sheetId: SheetId | null
  bgg?: BggFacts
}

/**
 * Lo que aporta BoardGameGeek y el proyecto no sabe: el identificador, el año, cuánta
 * gente lo ha votado y las dos URLs de portada.
 *
 * Va aparte de la definición a propósito. La definición es lo que la app entiende de un
 * juego —cómo se puntúa, de qué color es—, y eso lo decide el proyecto. Esto de aquí es
 * metadato de catálogo: sirve para ordenar y para ilustrar, y ninguna pantalla lo
 * necesita para funcionar. La semilla llega casi sin ello; la ingesta lo trae entero.
 */
export interface BggFacts {
  id?: number
  year?: number
  /** Número de votos en BGG. Es la medida de popularidad con la que se ordena. */
  popularity?: number
  /** La carátula grande, para la ficha. */
  coverUrl?: string
  /** La miniatura, para la rejilla. Es la que pesa poco y la que se pide primero. */
  coverThumbUrl?: string
}

/**
 * El catálogo que el proyecto describe él mismo: los escritos a mano primero y
 * después las filas de la semilla, sin repetir slug.
 *
 * Es lo que era `GAME_LIST` antes de que el catálogo se mudara a Postgres. Ya no puede
 * salir de ahí: `registry.ts` solo conoce los 24 que viajan en la app.
 */
export function seedGames(): SeedGame[] {
  const curatedSlugs = new Set(CURATED_GAMES.map((game) => game.slug))

  return [
    ...CURATED_GAMES.map((game) => ({
      game: withRules(game),
      sheetId: null,
      bgg: bggFacts(game.slug),
    })),
    ...CATALOG_ROWS.filter((row) => !curatedSlugs.has(row[0])).map((row) => ({
      game: withRules(expandCatalogSeedRow(row)),
      sheetId: row[9],
      bgg: bggFacts(row[0]),
    })),
  ]
}

/**
 * De la semilla solo se sabe el identificador de BGG, que lo resolvió `npm run ids`.
 * El año, los votos y las portadas los trae la ingesta: son datos de BGG y hay que
 * pedírselos a BGG.
 */
function bggFacts(slug: string): BggFacts | undefined {
  const id = EXTERNAL_IDS[slug]?.bgg
  return id ? { id } : undefined
}

/**
 * Las chuletas del catálogo amplio no viajan en `GameDefinition`: son ~2,8 kB por juego
 * que solo hacen falta al abrir una ficha, así que están aparte en `catalog.rules.ts`.
 * Aquí sí se enganchan, porque la base de datos guarda la definición íntegra y su
 * columna `rules` es de donde las lee la app.
 */
function withRules(game: GameDefinition): GameDefinition {
  if (game.rules) return game
  const rules = CATALOG_RULES[game.slug]
  return rules ? { ...game, rules } : game
}

/**
 * Las portadas descargadas viven en `public/covers/` y su ruta depende de dónde esté
 * publicada la app: en la raíz (Vercel) o bajo `/table-tracker/` (GitHub Pages). Guardarla
 * en la base de datos ataría las filas a un despliegue concreto, así que se quita: la app
 * ya resuelve la portada por su cuenta desde `covers.generated.ts`, que viaja en el
 * bundle. En `games.image_url` solo acaban URLs absolutas, que son las de los juegos que
 * sube un grupo.
 */
function forDatabase(game: GameDefinition): GameDefinition {
  if (!COVERS[game.slug]) return game
  const { imageUrl: _local, ...rest } = game
  return rest
}

/**
 * La fila de `public.games`.
 *
 * Las columnas de lista —`sheet_id`, duración, dificultad, `search_text`— están
 * duplicadas fuera de `definition` a propósito: con ellas el catálogo se puede buscar y
 * paginar en Postgres sin leer el jsonb, que es el 90 % del peso de la fila.
 */
export function gameRow(seed: SeedGame, sortOrder: number): Row {
  const game = forDatabase(seed.game)

  return {
    slug: game.slug,
    name: game.name,
    icon: game.icon,
    tagline: game.tagline ?? null,
    image_url: game.imageUrl ?? null,
    theme: game.theme,
    min_players: game.minPlayers,
    max_players: game.maxPlayers,
    score_label: game.scoreLabel,
    score_label_short: game.scoreLabelShort,
    total_mode: game.totalMode,
    winner_rule: game.winnerRule,
    target_score: game.targetScore ?? null,
    sort_order: sortOrder,
    definition: game,
    sheet_id: seed.sheetId,
    min_time: game.playTime?.min ?? null,
    max_time: game.playTime?.max ?? null,
    difficulty: game.difficulty ?? null,
    rules: game.rules ?? null,
    bgg_id: seed.bgg?.id ?? null,
    year: seed.bgg?.year ?? null,
    // Sin votos, cero: la fila existe y se puede buscar, pero no se cuela por delante
    // de un juego que sí los tiene. La ingesta la corrige en cuanto pasa por ella.
    popularity: seed.bgg?.popularity ?? 0,
    cover_url: seed.bgg?.coverUrl ?? null,
    cover_thumb_url: seed.bgg?.coverThumbUrl ?? null,
    // La misma normalización que hará el buscador. La escribe TypeScript porque es
    // aquí donde vive la regla; Postgres tiene su gemela para lo que inserta él.
    search_text: searchable(`${game.name} ${game.tagline ?? ''}`),
  }
}

/** Las filas de `public.game_score_fields`: la hoja de puntuación, campo a campo. */
export function fieldRows(game: GameDefinition): Row[] {
  return game.fields.map((field: ScoreField, index) => ({
    game_slug: game.slug,
    field_key: field.key,
    label: field.label,
    short: field.short ?? null,
    icon: field.icon,
    field_type: field.type,
    points: field.points ?? null,
    is_total: field.isTotal ?? false,
    field_group: field.group ?? null,
    min_value: field.min ?? null,
    max_value: field.max ?? null,
    unique_per_match: field.uniquePerMatch ?? false,
    show_in_summary: field.showInSummary ?? false,
    hint: field.hint ?? null,
    sort_order: index,
  }))
}
