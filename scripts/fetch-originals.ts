/**
 * Guarda en disco los originales de las carátulas del catálogo, tal como los sirve BGG.
 *
 *   npm run covers:original                 # baja lo que falte y escribe el manifiesto
 *   npm run covers:original -- --dry-run    # el informe: cuántas faltan y cuánto pesarían
 *   npm run covers:original -- --limit=200  # una cata, para ver que va antes de las 18.000
 *   npm run covers:original -- --force      # vuelve a bajar también las que ya estén
 *
 * Por qué existe
 * --------------
 * La app no tiene ni una sola carátula del catálogo: `games.cover_url` es un enlace a
 * `cf.geekdo-images.com`, así que la imagen la sirve BGG a cada usuario y en cada visita.
 * Eso ata la app a que un tercero no cambie de CDN ni de política —esas URLs llevan firma
 * de Thumbor, y el día que rote se caen las 17.944 a la vez— y además deja el catálogo
 * entero fuera del service worker, que solo sabe cachear `public/covers/`.
 *
 * Por qué el original y no una miniatura
 * --------------------------------------
 * Porque el original es el archivo y las derivadas se regeneran. El tamaño al que se
 * pinta una portada es una decisión de interfaz que se puede cambiar diez veces; volver a
 * bajarse siete gigas de BGG, no. Con los originales en casa, sacar el catálogo entero a
 * 256 px o a 512 es un rato de `sharp` sin red de por medio.
 *
 * Dónde acaba su frontera
 * -----------------------
 * No redimensiona, no sube nada a ningún sitio y no escribe en la base de datos. Deja los
 * ficheros y un manifiesto en `scripts/data/`, que está en `.gitignore`. Cómo se le sirven
 * luego a la app —espejo propio, CDN, o nada— es la decisión siguiente, y este guion no la
 * prejuzga.
 *
 * Qué hace falta: `VITE_SUPABASE_URL` (o `SUPABASE_URL`) y `SUPABASE_SERVICE_ROLE_KEY` en
 * `.env`, para leer las URLs. El token de BGG **no** hace falta y la pausa de 2 s de la
 * ingesta tampoco aplica aquí: las imágenes salen de CloudFront, no de la API XML. Aun
 * así se baja de ocho en ocho, que es lo que abre un navegador y no molesta a nadie.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DATA_DIR } from './lib/bgg-dump'
import { readEnv } from './lib/env'
import { withRetries } from './lib/games'
import {
  emptyManifest,
  extensionFor,
  looksLikeImage,
  pendingOf,
  type CoverFile,
  type CoverRow,
  type Manifest,
} from './lib/originals'

/** Cuántas descargas a la vez. Ocho es lo que abre un navegador contra un mismo dominio. */
const CONCURRENCY = 8
/** Cada cuántas portadas se guarda el manifiesto, para poder cortar por lo sano. */
const CHECKPOINT = 250
/** Filas por página al leer `public.games`. PostgREST no devuelve más de mil de una vez. */
const PAGE = 1000
const ATTEMPTS = 3
const TIMEOUT_MS = 45_000
/** Media medida sobre 30 portadas reales. Solo se usa para el informe de `--dry-run`. */
const AVERAGE_BYTES = 402 * 1024

const originalsDir = join(DATA_DIR, 'covers-original')
const manifestPath = join(DATA_DIR, 'covers-original.manifest.json')

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
  limit: option('limit', Number.POSITIVE_INFINITY),
  concurrency: option('concurrency', CONCURRENCY),
  dryRun: flag('dry-run'),
  force: flag('force'),
}

// -----------------------------------------------------------------------------
// Manifiesto
// -----------------------------------------------------------------------------

function readManifest(): Manifest {
  if (!existsSync(manifestPath)) return emptyManifest()
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  } catch {
    console.warn('  ⚠ El manifiesto no se pudo leer; se empieza de cero.')
    return emptyManifest()
  }
}

function saveManifest(manifest: Manifest): void {
  manifest.updatedAt = new Date().toISOString()
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

// -----------------------------------------------------------------------------
// Las URLs, de Postgres
// -----------------------------------------------------------------------------

function client(): SupabaseClient {
  const url = readEnv('SUPABASE_URL') ?? readEnv('VITE_SUPABASE_URL')
  const key = readEnv('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    throw new Error(
      'Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env (ver .env.example).\n' +
        '  La clave de servicio se salta la RLS: por eso vive aquí y nunca en la app.',
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Se piden por popularidad descendente a propósito: si esto se corta a media hora, lo que
 * hay en disco son los juegos que la gente busca, no los que empiezan por «A».
 */
async function readCovers(db: SupabaseClient): Promise<CoverRow[]> {
  const rows: CoverRow[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from('games')
      .select('slug, cover_url')
      .not('cover_url', 'is', null)
      .order('popularity', { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`No se pudo leer public.games: ${error.message}`)
    if (!data || data.length === 0) break
    rows.push(...(data as CoverRow[]))
    process.stdout.write(`\r  leídas ${rows.length} filas…`)
    if (data.length < PAGE) break
  }
  process.stdout.write('\r')
  return rows
}

// -----------------------------------------------------------------------------
// La descarga
// -----------------------------------------------------------------------------

const failures: string[] = []

async function download(row: CoverRow): Promise<CoverFile | null> {
  return withRetries(
    async () => {
      const response = await fetch(row.cover_url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const buffer = Buffer.from(await response.arrayBuffer())
      if (!looksLikeImage(buffer)) {
        throw new Error(`la respuesta no es una imagen (${buffer.length} bytes)`)
      }

      const file = `${row.slug}.${extensionFor(row.cover_url, response.headers.get('content-type'))}`
      writeFileSync(join(originalsDir, file), buffer)

      return {
        url: row.cover_url,
        file,
        bytes: buffer.length,
        sha256: createHash('sha256').update(buffer).digest('hex'),
        at: new Date().toISOString(),
      }
    },
    ATTEMPTS,
    (error) => failures.push(`${row.slug}: ${error.message}`),
  )
}

/**
 * Las descargas en paralelo, con el aviso de por dónde va. No se usa `inBatches` de
 * `lib/games` porque aquí el trabajo dura media hora: hace falta guardar el avance cada
 * tanto y decir cuánto queda, y eso no cabe en una función que solo reparte lotes. Además
 * `inBatches` espera a que acabe el lote entero, y con imágenes de peso muy desigual eso
 * deja siete descargas paradas esperando a la gorda.
 */
async function run(rows: CoverRow[], manifest: Manifest): Promise<number> {
  const started = Date.now()
  let done = 0
  let bytes = 0
  let next = 0

  async function worker(): Promise<void> {
    for (let index = next++; index < rows.length; index = next++) {
      const row = rows[index]
      const cover = await download(row)
      done += 1
      if (cover) {
        manifest.covers[row.slug] = cover
        bytes += cover.bytes
      }
      if (done % CHECKPOINT === 0) saveManifest(manifest)
      if (done % 25 === 0 || done === rows.length) {
        const seconds = (Date.now() - started) / 1000
        const rate = done / Math.max(seconds, 1)
        const left = Math.round((rows.length - done) / Math.max(rate, 0.01))
        process.stdout.write(
          `\r  ${done}/${rows.length} · ${size(bytes)} · ${rate.toFixed(1)}/s · faltan ~${clock(left)}   `,
        )
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, options.concurrency) }, worker))
  process.stdout.write('\n')
  return bytes
}

// -----------------------------------------------------------------------------
// Informe
// -----------------------------------------------------------------------------

function size(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`
  return `${Math.round(bytes / 1024 ** 2)} MB`
}

function clock(seconds: number): string {
  if (seconds < 60) return `${seconds} s`
  return `${Math.round(seconds / 60)} min`
}

// -----------------------------------------------------------------------------
// Principal
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  if (!existsSync(originalsDir)) mkdirSync(originalsDir, { recursive: true })

  const manifest = readManifest()
  const already = Object.keys(manifest.covers).length
  if (already > 0) console.log(`Manifiesto: ${already} portadas ya guardadas.`)

  console.log('Leyendo las URLs de public.games…')
  const rows = await readCovers(client())
  console.log(`  ${rows.length} juegos con carátula en el catálogo.`)

  const pending = pendingOf(rows, manifest, options.force, originalsDir)
  const todo = Number.isFinite(options.limit) ? pending.slice(0, options.limit) : pending
  const extra = todo.length !== pending.length ? ` (se piden ${todo.length})` : ''
  console.log(`  ${pending.length} por descargar${extra}.`)

  if (todo.length === 0) {
    console.log('\nNada que hacer: están todas.')
    return
  }

  if (options.dryRun) {
    console.log('\n--dry-run: no se descarga nada.')
    console.log(`  Ocuparían del orden de ${size(todo.length * AVERAGE_BYTES)} (media medida: 402 kB).`)
    console.log(`  Irían a ${originalsDir}`)
    return
  }

  console.log(`\nDescargando de ${options.concurrency} en ${options.concurrency} a ${originalsDir}`)
  const bytes = await run(todo, manifest)
  saveManifest(manifest)

  const total = Object.values(manifest.covers).reduce((sum, cover) => sum + cover.bytes, 0)
  console.log(`\nBajadas ${todo.length - failures.length} de ${todo.length} · ${size(bytes)}`)
  console.log(`En disco: ${Object.keys(manifest.covers).length} portadas · ${size(total)}`)

  if (failures.length > 0) {
    console.log(`\n⚠ ${failures.length} fallaron y no están en el manifiesto:`)
    for (const failure of failures.slice(0, 20)) console.log(`  · ${failure}`)
    if (failures.length > 20) console.log(`  … y ${failures.length - 20} más`)
    console.log('  Volver a lanzar el guion las reintenta: solo baja lo que falta.')
  }
}

main().catch((error: Error) => {
  console.error(`\n${error.message}`)
  process.exit(1)
})
