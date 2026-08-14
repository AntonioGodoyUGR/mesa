/**
 * Genera `supabase/seed_games.sql` a partir del catálogo de la app: los juegos
 * escritos a mano en `src/games/definitions/` y las filas del catálogo amplio
 * (`src/games/catalog.data.ts`), que es exactamente lo que hay en `GAME_LIST`.
 *
 * Es lo que mantiene una sola fuente de verdad: las reglas de puntuación se
 * escriben una vez en TypeScript y de ahí bajan a la base de datos, que las
 * necesita para recalcular totales en `save_match()`.
 *
 *   npm run seed:games
 *
 * Después, pega el fichero generado en el SQL Editor de Supabase.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GAME_LIST } from '../src/games/registry'
import { COVERS } from '../src/games/covers'
import type { GameDefinition, ScoreField } from '../src/games/types'

const here = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(here, '..', 'supabase', 'seed_games.sql')

/** Literal SQL de texto, o NULL. */
function text(value: string | undefined | null): string {
  if (value === undefined || value === null) return 'null'
  return `'${value.replace(/'/g, "''")}'`
}

function num(value: number | undefined | null): string {
  return value === undefined || value === null ? 'null' : String(value)
}

function bool(value: boolean | undefined): string {
  return value ? 'true' : 'false'
}

/** Literal jsonb, escapado para SQL. */
function json(value: unknown): string {
  return `${text(JSON.stringify(value))}::jsonb`
}

function gameRow(game: GameDefinition, index: number): string {
  return `  (${[
    text(game.slug),
    text(game.name),
    text(game.icon),
    text(game.tagline),
    text(game.imageUrl),
    json(game.theme),
    num(game.minPlayers),
    num(game.maxPlayers),
    text(game.scoreLabel),
    text(game.scoreLabelShort),
    text(game.totalMode),
    text(game.winnerRule),
    num(game.targetScore),
    num(index),
    json(game),
  ].join(', ')})`
}

function fieldRow(game: GameDefinition, field: ScoreField, index: number): string {
  return `  (${[
    text(game.slug),
    text(field.key),
    text(field.label),
    text(field.short),
    text(field.icon),
    text(field.type),
    num(field.points),
    bool(field.isTotal),
    text(field.group),
    num(field.min),
    num(field.max),
    bool(field.uniquePerMatch),
    bool(field.showInSummary),
    text(field.hint),
    num(index),
  ].join(', ')})`
}

/**
 * Las portadas integradas viven en `public/covers/` y su ruta depende de dónde esté
 * publicada la app: en la raíz (Vercel) o bajo `/mesa/` (GitHub Pages). Guardarla en la
 * base de datos ataría las filas a un despliegue concreto, así que se quita: la app ya
 * resuelve la portada por su cuenta desde `covers.generated.ts`, que viaja en el bundle.
 * En `games.image_url` solo acaban URLs absolutas, que son las de los juegos del grupo.
 */
function forDatabase(game: GameDefinition): GameDefinition {
  if (!COVERS[game.slug]) return game
  const { imageUrl: _local, ...rest } = game
  return rest
}

const GAMES = GAME_LIST.map(forDatabase)

const gameRows = GAMES.map(gameRow).join(',\n')
const fieldRows = GAMES.flatMap((game) =>
  game.fields.map((field, index) => fieldRow(game, field, index)),
).join(',\n')

const slugList = GAMES.map((game) => text(game.slug)).join(', ')

const sql = `-- =============================================================================
-- GENERADO AUTOMÁTICAMENTE POR \`npm run seed:games\` — NO EDITAR A MANO.
-- Fuente: src/games/definitions/ y src/games/catalog.data.ts
-- Juegos: ${GAMES.length}
-- =============================================================================

insert into public.games (
  slug, name, icon, tagline, image_url, theme, min_players, max_players,
  score_label, score_label_short, total_mode, winner_rule, target_score,
  sort_order, definition
) values
${gameRows}
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  tagline = excluded.tagline,
  image_url = excluded.image_url,
  theme = excluded.theme,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  score_label = excluded.score_label,
  score_label_short = excluded.score_label_short,
  total_mode = excluded.total_mode,
  winner_rule = excluded.winner_rule,
  target_score = excluded.target_score,
  sort_order = excluded.sort_order,
  definition = excluded.definition,
  updated_at = now();

insert into public.game_score_fields (
  game_slug, field_key, label, short, icon, field_type, points, is_total,
  field_group, min_value, max_value, unique_per_match, show_in_summary,
  hint, sort_order
) values
${fieldRows}
on conflict (game_slug, field_key) do update set
  label = excluded.label,
  short = excluded.short,
  icon = excluded.icon,
  field_type = excluded.field_type,
  points = excluded.points,
  is_total = excluded.is_total,
  field_group = excluded.field_group,
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  unique_per_match = excluded.unique_per_match,
  show_in_summary = excluded.show_in_summary,
  hint = excluded.hint,
  sort_order = excluded.sort_order;

-- Retira los campos que ya no existen en la definición TypeScript.
-- Las partidas antiguas conservan su jsonb intacto: solo dejan de mostrarse.
delete from public.game_score_fields f
where f.game_slug in (${slugList})
  and not exists (
    select 1 from (values
${GAMES.flatMap((game) =>
  game.fields.map((field) => `      (${text(game.slug)}, ${text(field.key)})`),
).join(',\n')}
    ) as keep(slug, field_key)
    where keep.slug = f.game_slug and keep.field_key = f.field_key
  );
`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, sql, 'utf8')

const fieldCount = GAMES.reduce((total, game) => total + game.fields.length, 0)
console.log(
  `✓ supabase/seed_games.sql — ${GAMES.length} juegos, ${fieldCount} campos de puntuación`,
)
// Listarlos todos serían cientos de líneas: se enseña cuántos hay de cada tipo.
const conChuleta = GAMES.filter((game) => game.rules).length
const conPortada = Object.keys(COVERS).length
console.log(`  ${conChuleta} con chuleta de reglas, ${conPortada} con portada`)
