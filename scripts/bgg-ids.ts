/**
 * Genera `scripts/external-ids.generated.ts`: el ID de BoardGameGeek y el de Wikidata
 * de cada juego integrado.
 *
 *   npm run ids            # resuelve y escribe el fichero
 *   npm run ids -- --dry-run   # solo el informe, no escribe nada
 *
 * Por qué existe
 * -------------
 * El modelo de un juego (`src/games/types.ts`) solo tiene `slug` y `name`: no hay
 * ningún identificador externo. Sin él, cada vez que se busca una portada hay que
 * adivinar a qué juego se refiere un nombre, y ahí es donde se cuelan las cajas
 * equivocadas («Splendor Duel» con la caja de «Splendor») y los homónimos («Lisboa»
 * con la foto de la ciudad). Este mapa se resuelve una vez y se congela; a partir de
 * ahí `npm run covers` pide portadas por ID, que no tiene ambigüedad posible.
 *
 * La cascada, por orden de fiabilidad
 * -----------------------------------
 *   1. Volcado CSV de BGG en `scripts/data/` — sin credenciales, sin red.
 *   2. Wikidata (`P2339`) — sin credenciales; también da el `Q…` para las portadas.
 *   3. Búsqueda en la XML API2 de BGG — solo si hay `BGG_API_TOKEN`.
 *   4. `scripts/bgg-ids.overrides.ts` — las correcciones a mano, que mandan sobre todo.
 *
 * Lo que no resuelve ninguna etapa se escribe como bloque PENDIENTE en el fichero
 * generado, con los mejores candidatos en comentario para copiarlos al de overrides.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BUILTIN_ENTRIES, slugToTitle, normalise, type GameEntry } from './lib/games'
import { loadDumps, type BggDump } from './lib/bgg-dump'
import { resolveByName } from './lib/wikidata'
import { readToken, search, BGG_PAUSE_MS } from './lib/bgg-api'
import { ID_OVERRIDES } from './bgg-ids.overrides'

const here = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(here, 'external-ids.generated.ts')

const dryRun = process.argv.includes('--dry-run')

type Source = 'csv' | 'wikidata' | 'bgg' | 'override'

interface Resolved {
  bgg?: number
  wikidata?: string
  source: Source
  /** El nombre con el que ha encajado, para poder revisar el informe de un vistazo. */
  matched?: string
}

const resolved = new Map<string, Resolved>()
const games = BUILTIN_ENTRIES

function set(slug: string, patch: Resolved): void {
  const current = resolved.get(slug)
  resolved.set(slug, { ...current, ...patch })
}

function hasBgg(slug: string): boolean {
  return resolved.get(slug)?.bgg !== undefined
}

// ---------------------------------------------------------------------------
// 1. Volcado CSV
// ---------------------------------------------------------------------------

console.log(`Resolviendo identificadores de ${games.length} juegos.\n`)
console.log('1. Volcados de BGG en scripts/data/')

const dump: BggDump = await loadDumps()

if (dump.size === 0) {
  console.log(
    '  · No hay ningún CSV. Descarga boardgamegeek.com/data_dumps/bg_ranks (cuenta\n' +
      '    gratuita) o el dataset de Kaggle y déjalo en scripts/data/. Se sigue sin él.',
  )
} else {
  console.log(`  · ${dump.size.toLocaleString('es')} juegos indexados` +
    `${dump.hasImages ? ', con columna de imagen' : ', sin columna de imagen'}`)
  let count = 0
  for (const game of games) {
    const match = dump.find(game)
    if (!match) continue
    set(game.slug, { bgg: match.entry.id, source: 'csv', matched: match.entry.name })
    count += 1
  }
  console.log(`  · resueltos ${count}/${games.length}`)
}

// ---------------------------------------------------------------------------
// 2. Wikidata
// ---------------------------------------------------------------------------

console.log('\n2. Wikidata (P2339)')

/**
 * Se consulta con TODOS los juegos, no solo con los que faltan: además del ID de BGG,
 * Wikidata da el `Q…`, que es lo que después permite llegar a la imagen (`P18`) y al
 * artículo exacto de Wikipedia sin volver a buscar por texto.
 */
const strict = await resolveByName(games, {
  requireBgg: true,
  onProgress: (done) => process.stdout.write(`\r  ${done}/${games.length}`),
})
process.stdout.write('\n')

const conflicts: string[] = []
let fromWikidata = 0

for (const game of games) {
  const hit = strict.get(game.slug)
  if (!hit) continue
  const current = resolved.get(game.slug)

  if (current?.bgg === undefined) {
    set(game.slug, { bgg: hit.bgg, wikidata: hit.qid, source: 'wikidata', matched: game.name })
    if (hit.bgg !== undefined) fromWikidata += 1
    continue
  }

  set(game.slug, { wikidata: hit.qid })
  if (hit.bgg !== undefined && hit.bgg !== current.bgg) {
    // Wikidata está curado a mano y el CSV se ha casado por parecido de nombre: cuando
    // no coinciden gana Wikidata, salvo que el CSV hubiera encajado el nombre exacto.
    const csvName = dump.byBggId(current.bgg)?.name ?? '?'
    const exact = normalise(csvName) === normalise(game.name)
    conflicts.push(
      `  · ${game.name}: CSV ${current.bgg} («${csvName}») vs Wikidata ${hit.bgg}` +
        ` → se queda ${exact ? 'el del CSV' : 'el de Wikidata'}`,
    )
    if (!exact) set(game.slug, { bgg: hit.bgg, source: 'wikidata', matched: game.name })
  }
}

console.log(`  · ${fromWikidata} IDs nuevos, ${strict.size} juegos con ítem de Wikidata`)
if (conflicts.length > 0) {
  console.log(`\n  Discrepancias entre CSV y Wikidata (${conflicts.length}):`)
  console.log(conflicts.join('\n'))
}

// Los que siguen sin ID: al menos se intenta localizar su ítem para poder tirar de
// `P18` o del artículo de Wikipedia en el paso de portadas.
const stillMissing = games.filter((game) => !hasBgg(game.slug) && !resolved.get(game.slug)?.wikidata)
if (stillMissing.length > 0) {
  // Lotes más pequeños: esta consulta lleva el filtro por tipo y es mucho más cara.
  const loose = await resolveByName(stillMissing, {
    requireBgg: false,
    batchSize: 15,
    onProgress: (done) => process.stdout.write(`\r  sin ID de BGG: ${done}/${stillMissing.length}`),
  })
  process.stdout.write('\n')
  for (const [slug, hit] of loose) {
    set(slug, { bgg: hit.bgg, wikidata: hit.qid, source: 'wikidata', matched: 'tipo juego de mesa' })
  }
  console.log(`  · ${loose.size} ítems más localizados por tipo (juego de mesa)`)
}

// ---------------------------------------------------------------------------
// 3. Búsqueda en la API de BGG
// ---------------------------------------------------------------------------

console.log('\n3. Búsqueda en la XML API2 de BGG')

const token = readToken()
const pendingBeforeApi = games.filter((game) => !hasBgg(game.slug))

if (!token) {
  console.log(
    '  · Sin BGG_API_TOKEN: se salta. Da de alta el token gratuito en\n' +
      '    boardgamegeek.com/using_the_xml_api y ponlo en .env para resolver el resto.',
  )
} else if (pendingBeforeApi.length === 0) {
  console.log('  · No queda ninguno por resolver.')
} else {
  let count = 0
  for (const [index, game] of pendingBeforeApi.entries()) {
    process.stdout.write(`\r  ${index + 1}/${pendingBeforeApi.length}`)
    // Los nombres a probar: el de la app (a veces en español) y el del slug.
    const attempts = [...new Set([game.name, slugToTitle(game.slug)])]
    let hit: { id: number; name: string } | undefined

    for (const attempt of attempts) {
      for (const exact of [true, false]) {
        try {
          const hits = await search(attempt, token, exact)
          hit = exact
            ? hits[0]
            : hits.find((candidate) => normalise(candidate.name) === normalise(attempt))
        } catch (error) {
          console.warn(`\n  ⚠ ${game.name}: ${(error as Error).message}`)
        }
        await new Promise((done) => setTimeout(done, BGG_PAUSE_MS))
        if (hit) break
      }
      if (hit) break
    }

    if (hit) {
      set(game.slug, { bgg: hit.id, source: 'bgg', matched: hit.name })
      count += 1
    }
  }
  process.stdout.write('\n')
  console.log(`  · ${count}/${pendingBeforeApi.length} resueltos`)
}

// ---------------------------------------------------------------------------
// 4. Correcciones a mano
// ---------------------------------------------------------------------------

const knownSlugs = new Set(games.map((game) => game.slug))
let overrides = 0
for (const [slug, override] of Object.entries(ID_OVERRIDES)) {
  if (!knownSlugs.has(slug)) {
    console.warn(`\n⚠ bgg-ids.overrides.ts: «${slug}» no es ningún juego integrado`)
    continue
  }
  set(slug, { ...override, source: 'override', matched: 'corrección a mano' })
  overrides += 1
}

// ---------------------------------------------------------------------------
// Informe y fichero
// ---------------------------------------------------------------------------

const bySource = new Map<Source, number>()
for (const game of games) {
  const entry = resolved.get(game.slug)
  if (entry?.bgg === undefined) continue
  bySource.set(entry.source, (bySource.get(entry.source) ?? 0) + 1)
}

const withBgg = games.filter((game) => hasBgg(game.slug))
const withWikidata = games.filter((game) => resolved.get(game.slug)?.wikidata)
const pending = games.filter((game) => !resolved.get(game.slug))

console.log('\n─────────────────────────────────────────────')
console.log(`Con ID de BGG:  ${withBgg.length}/${games.length}`)
for (const [source, count] of bySource) console.log(`  · ${source}: ${count}`)
console.log(`Con ítem de Wikidata: ${withWikidata.length}/${games.length}`)
console.log(`Correcciones a mano aplicadas: ${overrides}`)
console.log(`Sin resolver: ${pending.length}`)

/** Candidatos del volcado para el bloque PENDIENTE, listos para copiar al override. */
function candidateComment(game: GameEntry): string {
  const candidates = dump.candidates(game, 3)
  if (candidates.length === 0) return `  // '${game.slug}': ?,  // ${game.name}`
  const options = candidates
    .map((candidate) => `${candidate.entry.id} («${candidate.entry.name}»)`)
    .join(', ')
  return `  // '${game.slug}': ?,  // ${game.name} → ${options}`
}

const pendingBlock =
  pending.length === 0
    ? ''
    : `\n/**\n * PENDIENTES (${pending.length}): ningún método los ha resuelto.\n` +
      ` * Copia el ID bueno a scripts/bgg-ids.overrides.ts y vuelve a lanzar \`npm run ids\`.\n` +
      pending.map((game) => ` * ${candidateComment(game).trim()}`).join('\n') +
      '\n */\n'

const entries = games
  .filter((game) => resolved.get(game.slug))
  .slice()
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map((game) => {
    const entry = resolved.get(game.slug)!
    const fields = [
      entry.bgg !== undefined ? `bgg: ${entry.bgg}` : null,
      entry.wikidata ? `wikidata: '${entry.wikidata}'` : null,
    ].filter(Boolean)
    return `  '${game.slug}': { ${fields.join(', ')} },`
  })
  .join('\n')

const file = `/**
 * GENERADO AUTOMÁTICAMENTE POR \`npm run ids\` — NO EDITAR A MANO.
 * Las correcciones van en \`scripts/bgg-ids.overrides.ts\`, que se fusiona por encima.
 *
 * Identificador de cada juego integrado en BoardGameGeek y en Wikidata. Es lo que
 * permite que \`npm run covers\` pida la portada por ID en vez de buscarla por nombre.
 *
 * Última actualización: ${new Date().toISOString().slice(0, 10)}
 * Con ID de BGG: ${withBgg.length} de ${games.length} · con ítem de Wikidata: ${withWikidata.length}
 */
export interface ExternalIds {
  bgg?: number
  wikidata?: string
}
${pendingBlock}
export const EXTERNAL_IDS: Record<string, ExternalIds> = {
${entries}
}
`

if (dryRun) {
  console.log('\n(--dry-run: no se ha escrito nada)')
  if (pending.length > 0) {
    console.log(`\nSin resolver (${pending.length}):`)
    console.log(pending.map(candidateComment).join('\n'))
  }
} else {
  writeFileSync(outputPath, file, 'utf8')
  console.log(`\n✓ scripts/external-ids.generated.ts — ${withBgg.length}/${games.length} con ID de BGG`)
}
