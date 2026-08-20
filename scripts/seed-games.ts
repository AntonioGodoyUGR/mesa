/**
 * Genera `supabase/seed_games.sql` con el catálogo que describe el proyecto: los juegos
 * escritos a mano en `src/games/definitions/` y las filas de la semilla amplia
 * (`scripts/catalog.data.ts`).
 *
 * Es lo que arranca un proyecto de Supabase desde cero, y lo que mantiene una sola
 * fuente de verdad: las reglas de puntuación se escriben una vez en TypeScript y de ahí
 * bajan a la base de datos, que las necesita para recalcular totales en `save_match()`.
 *
 *   npm run seed:games
 *
 * Después, pega el fichero generado en el SQL Editor de Supabase.
 *
 * Ojo con el tamaño: esto vale para los cientos de juegos que trae el repo y no para el
 * catálogo entero. Decenas de miles de juegos son decenas de MB de SQL, que ningún
 * editor traga; ese camino es `npm run ingest:bgg`, que escribe por red. Los dos montan
 * la fila con `lib/game-rows.ts`, así que salen idénticas.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fieldRows, gameRow, seedGames, type Row } from './lib/game-rows'
import { COVERS } from '../src/games/covers'

const here = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(here, '..', 'supabase', 'seed_games.sql')

/** Literal SQL de texto, o NULL. */
function text(value: string | undefined | null): string {
  if (value === undefined || value === null) return 'null'
  return `'${value.replace(/'/g, "''")}'`
}

/**
 * Un valor de fila, escrito como literal SQL. El tipo de la columna se deduce del de
 * JavaScript: lo que llega como objeto es jsonb, que son `theme`, `definition` y
 * `rules`.
 */
function literal(value: Row[string]): string {
  if (value === null) return 'null'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'string') return text(value)
  return `${text(JSON.stringify(value))}::jsonb`
}

/** Los nombres de columna, repartidos en líneas que quepan en la pantalla. */
function columnList(columns: string[]): string {
  const lines: string[] = []
  for (const column of columns) {
    const last = lines[lines.length - 1]
    if (last && `${last} ${column},`.length <= 88) lines[lines.length - 1] = `${last} ${column},`
    else lines.push(`  ${column},`)
  }
  return lines.join('\n').replace(/,$/, '')
}

/** `(a, b, c)`, en el orden de las columnas. */
function values(row: Row): string {
  return `  (${Object.values(row).map(literal).join(', ')})`
}

/**
 * Lo que la semilla NO pisa si la fila ya existe.
 *
 * Son las columnas que llena `npm run ingest:bgg` y la semilla no sabe: el año, los
 * votos y las portadas de BoardGameGeek. Sin esto, volver a sembrar después de una
 * ingesta —que es lo normal al añadir un juego escrito a mano— dejaría el catálogo
 * entero con `popularity` a cero y sin carátulas.
 */
const KEEP_IF_SET: Record<string, string> = {
  bgg_id: 'coalesce(excluded.bgg_id, public.games.bgg_id)',
  year: 'coalesce(excluded.year, public.games.year)',
  cover_url: 'coalesce(excluded.cover_url, public.games.cover_url)',
  cover_thumb_url: 'coalesce(excluded.cover_thumb_url, public.games.cover_thumb_url)',
  // `popularity` es `not null`, así que no hay null que detectar: se queda el mayor.
  popularity: 'greatest(excluded.popularity, public.games.popularity)',
}

/** `columna = excluded.columna` para todo menos la clave primaria. */
function upsertSet(columns: string[], keys: string[]): string {
  return columns
    .filter((column) => !keys.includes(column))
    .map((column) => `  ${column} = ${KEEP_IF_SET[column] ?? `excluded.${column}`}`)
    .join(',\n')
}

const SEED = seedGames()
const GAMES = SEED.map((seed, index) => gameRow(seed, index))
const FIELDS = SEED.flatMap((seed) => fieldRows(seed.game))

const gameColumns = Object.keys(GAMES[0])
const fieldColumns = Object.keys(FIELDS[0])

const slugList = GAMES.map((row) => text(row.slug as string)).join(', ')

const sql = `-- =============================================================================
-- GENERADO AUTOMÁTICAMENTE POR \`npm run seed:games\` — NO EDITAR A MANO.
-- Fuente: src/games/definitions/ y scripts/catalog.data.ts
-- Juegos: ${GAMES.length}
-- =============================================================================

insert into public.games (
${columnList(gameColumns)}
) values
${GAMES.map(values).join(',\n')}
on conflict (slug) do update set
${upsertSet(gameColumns, ['slug'])},
  updated_at = now();

insert into public.game_score_fields (
${columnList(fieldColumns)}
) values
${FIELDS.map(values).join(',\n')}
on conflict (game_slug, field_key) do update set
${upsertSet(fieldColumns, ['game_slug', 'field_key'])};

-- Retira los campos que ya no existen en la definición TypeScript.
-- Las partidas antiguas conservan su jsonb intacto: solo dejan de mostrarse.
delete from public.game_score_fields f
where f.game_slug in (${slugList})
  and not exists (
    select 1 from (values
${FIELDS.map((row) => `      (${text(row.game_slug as string)}, ${text(row.field_key as string)})`).join(',\n')}
    ) as keep(slug, field_key)
    where keep.slug = f.game_slug and keep.field_key = f.field_key
  );
`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, sql, 'utf8')

console.log(`✓ supabase/seed_games.sql — ${GAMES.length} juegos, ${FIELDS.length} campos de puntuación`)
// Listarlos todos serían cientos de líneas: se enseña cuántos hay de cada tipo.
const conChuleta = GAMES.filter((row) => row.rules).length
const conPortada = Object.keys(COVERS).length
console.log(`  ${conChuleta} con chuleta de reglas, ${conPortada} con portada`)
