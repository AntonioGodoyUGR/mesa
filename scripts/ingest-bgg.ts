/**
 * Llena `public.games` con el catálogo amplio de BoardGameGeek.
 *
 * Es el relevo de `npm run seed:games` en cuanto el catálogo pasa de unos miles: 30.000
 * juegos son ~37 MB de SQL y eso no se pega en el editor de Supabase, así que este
 * script escribe por red con la clave de servicio. Las filas las monta `lib/game-rows.ts`,
 * el mismo módulo que usa la semilla, para que un juego se comporte igual sin importar
 * por cuál de los dos caminos entró.
 *
 *   npm run ingest:bgg -- --min-votes=100 --limit=30000
 *   npm run ingest:bgg -- --dry-run          # sin escribir nada, para ver qué saldría
 *
 * Qué hace falta:
 *
 *   - `scripts/data/*.csv`, el volcado de BGG. De ahí salen los identificadores y los
 *     votos, y por eso no hay que recorrer el ranking pidiéndolo por red.
 *   - `BGG_API_TOKEN` en `.env`, para pedir las fichas.
 *   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env`, para escribirlas. La clave
 *     de servicio se salta la RLS: es la única forma de sembrar un catálogo público, y
 *     la razón de que esto viva en `scripts/` y nunca en la app.
 *
 * Va despacio a propósito: BGG pide ~1 petición cada 2 s y el límite es del token, no de
 * la máquina. 30.000 fichas en lotes de 20 son unos 50 minutos. Por eso guarda el avance
 * en `scripts/data/` y se puede parar y reanudar sin repetir trabajo.
 *
 * Lo que NO hace, y conviene que quede escrito: no pisa ningún juego que el proyecto ya
 * describa. Si un identificador de BGG corresponde a uno de ellos, se conserva su ficha
 * entera —nombre, lema, hoja de puntuación, chuleta— y de BGG solo se le añaden el año,
 * los votos y las carátulas. La traducción de una ficha de BGG a un juego está en
 * `lib/bgg-games.ts`, que se testea aparte; aquí solo se orquesta.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { BGG_PAUSE_MS, readToken, things } from './lib/bgg-api'
import { bggSeedGame, factsOf } from './lib/bgg-games'
import { DATA_DIR, loadDumps, type DumpEntry } from './lib/bgg-dump'
import { readEnv } from './lib/env'
import { withRetries } from './lib/games'
import { fieldRows, gameRow, seedGames, type Row, type SeedGame } from './lib/game-rows'

/** Fichas por petición. Es el máximo que acepta `/thing`. */
const BATCH = 20
/** Filas por escritura a Supabase. Más grande no va más rápido y arriesga tiempos. */
const CHUNK = 500
/** Cuántas carátulas se comprueban antes de dar por buenas las 30.000. */
const PROBE = 20

const progressPath = join(DATA_DIR, 'ingest-bgg.progress.json')

// -----------------------------------------------------------------------------
// Argumentos
// -----------------------------------------------------------------------------

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

function option(name: string, fallback: number): number {
  const found = process.argv.find((arg) => arg.startsWith(`--${name}=`))
  const value = found ? Number.parseInt(found.split('=')[1], 10) : NaN
  return Number.isFinite(value) ? value : fallback
}

const options = {
  /**
   * Cuánta gente tiene que haber votado un juego para que entre. Cien votos es el corte
   * entre «un juego que alguien puede querer apuntar» y las decenas de miles de fichas
   * de BGG que no ha jugado casi nadie.
   */
  minVotes: option('min-votes', 100),
  limit: option('limit', 30000),
  dryRun: flag('dry-run'),
  /** Empieza de cero aunque haya avance guardado. */
  restart: flag('restart'),
}

// -----------------------------------------------------------------------------
// Carátulas: comprobarlas antes de dar por buenas 30.000
// -----------------------------------------------------------------------------

/**
 * Comprueba con `HEAD` que las URLs de carátula responden.
 *
 * Las de BGG son Thumbor **firmadas** y la firma cubre el recorte, así que no se puede
 * dar por hecho que una variante de tamaño distinta funcione. Aquí no se forja ninguna:
 * se usan las dos que devuelve la propia API (`<image>` y `<thumbnail>`) y se comprueba
 * una muestra antes de meterlas en decenas de miles de filas.
 */
async function probeCovers(urls: string[]): Promise<number> {
  let ok = 0
  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) ok += 1
      else console.warn(`  ⚠ ${response.status} ${url}`)
    } catch {
      console.warn(`  ⚠ sin respuesta ${url}`)
    }
  }
  return ok
}

// -----------------------------------------------------------------------------
// Avance guardado
// -----------------------------------------------------------------------------

interface Progress {
  /** Identificadores de BGG ya procesados, valieran o no. */
  done: number[]
  /** Slugs ya escritos: sin esto, reanudar podría darle a dos juegos el mismo. */
  slugs: string[]
}

function loadProgress(): Progress {
  if (options.restart || !existsSync(progressPath)) return { done: [], slugs: [] }
  try {
    const saved = JSON.parse(readFileSync(progressPath, 'utf8')) as Partial<Progress>
    return { done: saved.done ?? [], slugs: saved.slugs ?? [] }
  } catch {
    console.warn('  ⚠ el fichero de avance no se entiende, se empieza de cero')
    return { done: [], slugs: [] }
  }
}

function saveProgress(progress: Progress): void {
  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(progressPath, JSON.stringify(progress), 'utf8')
}

// -----------------------------------------------------------------------------
// Escritura
// -----------------------------------------------------------------------------

async function flush(client: SupabaseClient, games: Row[], fields: Row[]): Promise<void> {
  for (let start = 0; start < games.length; start += CHUNK) {
    const { error } = await client
      .from('games')
      .upsert(games.slice(start, start + CHUNK), { onConflict: 'slug' })
    if (error) throw new Error(`games: ${error.message}`)
  }

  // Siempre después de `games`: `game_score_fields.game_slug` es clave foránea, y una
  // hoja de puntuación sin su juego delante no entra.
  for (let start = 0; start < fields.length; start += CHUNK) {
    const { error } = await client
      .from('game_score_fields')
      .upsert(fields.slice(start, start + CHUNK), { onConflict: 'game_slug,field_key' })
    if (error) throw new Error(`game_score_fields: ${error.message}`)
  }
}

// -----------------------------------------------------------------------------
// Programa
// -----------------------------------------------------------------------------

function die(message: string): never {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

async function main(): Promise<void> {
  const token = readToken()
  if (!token) {
    die(
      'Falta BGG_API_TOKEN en .env.\n' +
        '  El alta es gratuita para uso no comercial en\n' +
        '  https://boardgamegeek.com/using_the_xml_api',
    )
  }

  let client: SupabaseClient | null = null
  if (!options.dryRun) {
    const url = readEnv('SUPABASE_URL') ?? readEnv('VITE_SUPABASE_URL')
    const key = readEnv('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) {
      die(
        'Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env (ver .env.example).\n' +
          '  Están en Project Settings → API. La clave de servicio se salta la RLS: no\n' +
          '  lleva el prefijo VITE_ y no puede acabar en el bundle.\n' +
          '  Con --dry-run se prueba el script entero sin necesitar ninguna de las dos.',
      )
    }
    client = createClient(url, key, { auth: { persistSession: false } })
  }

  console.log('· Volcados de BoardGameGeek')
  const dump = await loadDumps()
  if (dump.size === 0) {
    die(
      `No hay ningún CSV en ${DATA_DIR}.\n` +
        '  Descarga el volcado oficial de rankings (gratis, pide cuenta) en\n' +
        '  https://boardgamegeek.com/data_dumps/bg_ranks y deja el .csv ahí.\n' +
        '  La carpeta está en .gitignore: son decenas de MB.',
    )
  }

  // El volcado trae los votos, así que el corte se hace aquí y no gastando peticiones.
  const candidates: DumpEntry[] = dump.all().filter((entry) => entry.votes >= options.minVotes)
  candidates.sort((a, b) => b.votes - a.votes || a.id - b.id)
  const wanted = candidates.slice(0, options.limit)

  console.log(
    `  ${dump.size.toLocaleString('es')} fichas · ` +
      `${candidates.length.toLocaleString('es')} con ${options.minVotes}+ votos · ` +
      `se piden ${wanted.length.toLocaleString('es')}`,
  )

  // Los juegos que el proyecto ya describe: se conservan enteros y solo se les añade lo
  // que sabe BGG. Su ficha está escrita a mano o revisada; la de BGG, no.
  const seed = seedGames()
  const sortOrders = new Map(seed.map((game, index) => [game.game.slug, index]))
  const known = new Map<number, SeedGame>()
  for (const game of seed) {
    if (game.bgg?.id) known.set(game.bgg.id, game)
  }

  const progress = loadProgress()
  const done = new Set(progress.done)
  const taken = new Set([...seed.map((game) => game.game.slug), ...progress.slugs])
  const pending = wanted.filter((entry) => !done.has(entry.id))

  if (progress.done.length > 0) {
    console.log(`  se reanuda: ${progress.done.length.toLocaleString('es')} ya procesados`)
  }
  if (pending.length === 0) {
    console.log('\n✓ no queda nada por traer\n')
    return
  }

  console.log(`\n· Fichas (lotes de ${BATCH}, ${BGG_PAUSE_MS / 1000} s entre lote y lote)`)

  let games: Row[] = []
  let fields: Row[] = []
  let written = 0
  let skipped = 0
  let probed = false
  const sample: string[] = []
  const started = Date.now()

  for (let start = 0; start < pending.length; start += BATCH) {
    const ids = pending.slice(start, start + BATCH).map((entry) => entry.id)

    const fetched = await withRetries(
      () => things(ids, token, { stats: true }),
      3,
      (error) => console.warn(`\n  ⚠ lote ${ids[0]}…: ${error.message}`),
    )

    for (const thing of fetched ?? []) {
      done.add(thing.id)

      if (thing.thumbnail && sample.length < PROBE) sample.push(thing.thumbnail)

      // Un juego que ya describe el proyecto: nombre, lema, hoja y chuleta se quedan
      // como están, que son nuestros, y de BGG solo entran el año, los votos y la
      // carátula.
      const already = known.get(thing.id)
      if (already) {
        const enriched = { ...already, bgg: { ...already.bgg, ...factsOf(thing) } }
        games.push(gameRow(enriched, sortOrders.get(already.game.slug) ?? 0))
        fields.push(...fieldRows(already.game))
        continue
      }

      const fresh = bggSeedGame(thing, taken)
      if (!fresh) {
        skipped += 1
        continue
      }
      taken.add(fresh.game.slug)

      // Detrás de todo lo que el proyecto describe: entre iguales manda `popularity` y
      // `sort_order` solo desempata.
      games.push(gameRow(fresh, seed.length))
      fields.push(...fieldRows(fresh.game))
    }

    // La muestra de carátulas se comprueba en cuanto hay bastantes, antes de haber
    // escrito decenas de miles de filas con URLs que a lo mejor no responden.
    if (!probed && sample.length >= PROBE) {
      probed = true
      console.log(`\n· Carátulas: se comprueban ${sample.length} con HEAD`)
      const ok = await probeCovers(sample)
      console.log(`  ${ok}/${sample.length} responden`)
      if (ok * 2 < sample.length) {
        die('más de la mitad de las carátulas no responden: revísalo antes de seguir')
      }
    }

    if (games.length >= CHUNK) {
      if (client) await flush(client, games, fields)
      written += games.length
      games = []
      fields = []
      saveProgress({ done: [...done], slugs: [...taken] })
    }

    const seen = Math.min(start + BATCH, pending.length)
    const left = Math.round(((pending.length - seen) * ((Date.now() - started) / seen)) / 60000)
    process.stdout.write(`\r  ${seen}/${pending.length} · quedan ~${left} min      `)

    if (start + BATCH < pending.length) {
      await new Promise((wait) => setTimeout(wait, BGG_PAUSE_MS))
    }
  }
  process.stdout.write('\n')

  if (games.length > 0) {
    if (client) await flush(client, games, fields)
    written += games.length
    saveProgress({ done: [...done], slugs: [...taken] })
  }

  const total = written.toLocaleString('es')
  if (options.dryRun) {
    console.log(`\n✓ ensayo: saldrían ${total} juegos (${skipped} descartados)`)
    console.log('  No se ha escrito nada. Quita --dry-run para hacerlo de verdad.\n')
  } else {
    const minutes = Math.round((Date.now() - started) / 60000)
    console.log(
      `\n✓ ${total} juegos escritos en ${minutes} min ` +
        `(${skipped} descartados: expansiones y fichas sin nombre)\n`,
    )
  }
}

main().catch((error: Error) => die(error.message))
