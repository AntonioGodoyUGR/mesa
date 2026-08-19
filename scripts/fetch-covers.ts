/**
 * Genera `src/games/covers.generated.ts` y las imágenes de `public/covers/`.
 *
 *   npm run covers                # resuelve, descarga lo que falte y escribe
 *   npm run covers -- --dry-run   # solo el informe de cobertura, sin tocar nada
 *   npm run covers -- --force     # vuelve a descargar todas las imágenes
 *
 * Cómo se sabe qué caja es la de cada juego
 * -----------------------------------------
 * Por su ID de BoardGameGeek, que resuelve `npm run ids` y vive en
 * `scripts/external-ids.generated.ts`. Antes esto buscaba el nombre del juego en la
 * Wikipedia inglesa y luego intentaba adivinar si el artículo era el bueno; con cientos
 * de expansiones y ediciones («Clank! In! Space!», «Azul: Stained Glass of Sintra») eso
 * no funciona: Wikipedia tiene un artículo por familia, no por caja. Yendo por ID no
 * hay ambigüedad que resolver.
 *
 * La cascada, hasta que una dé imagen
 * -----------------------------------
 *   1. `scripts/covers.overrides.ts` — las puestas a mano, mandan sobre todo.
 *   2. El volcado CSV de `scripts/data/`, si trae columna de imagen. Sin red.
 *   3. La ficha de BGG (`/thing`), si hay `BGG_API_TOKEN`. Es la que tiene la caja real.
 *   4. Wikidata: de ahí salen el artículo de Wikipedia y la imagen de Commons (`P18`).
 *   5. La imagen de la ficha del artículo de Wikipedia (español primero, inglés después),
 *      llegando por el sitelink de Wikidata: por título exacto, nunca por búsqueda.
 *   6. La imagen principal del artículo, para los que no tienen ficha.
 *   7. La imagen de Commons, que casi siempre es una foto de la partida y no la caja.
 * Lo que no resuelve ninguna se queda sin portada y la app pinta su icono (`GameCover`).
 *
 * Qué se guarda
 * -------------
 * La imagen NO se enlaza: se descarga, se recorta a un cuadrado centrado de 512 px y se
 * pasa a webp, igual que hace `src/lib/image.ts` con las que suben los usuarios. Así las
 * portadas se sirven desde el propio dominio (enlazar a `upload.wikimedia.org` va contra
 * su política de uso), no se rompen si la fuente mueve el fichero y pesan lo mismo que
 * las del grupo. De cada una se guarda de dónde salió, que hasta ahora no se anotaba.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { BUILTIN_ENTRIES, inBatches, withRetries } from './lib/games'
import { loadDumps } from './lib/bgg-dump'
import { readToken, things, BGG_PAUSE_MS } from './lib/bgg-api'
import { fetchDetails } from './lib/wikidata'
import { infoboxImages, pageImages } from './lib/wikipedia'
import { EXTERNAL_IDS } from './external-ids.generated'
import { COVER_OVERRIDES } from './covers.overrides'
import { COVER_SOURCES } from './covers.sources.generated'

const here = dirname(fileURLToPath(import.meta.url))
const coversDir = resolve(here, '..', 'public', 'covers')
const outputPath = resolve(here, '..', 'src', 'games', 'covers.generated.ts')
const sourcesPath = resolve(here, 'covers.sources.generated.ts')

const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

/** Mismo tamaño y calidad que `resizeToWebp` en `src/lib/image.ts`. */
const SIZE = 512
const QUALITY = 82
const USER_AGENT = 'TableTracker/1.0 (https://github.com/; contacto en el repo)'

type Source = 'manual' | 'bgg' | 'wikidata' | 'wikipedia'

interface Found {
  url: string
  source: Source
}

const games = BUILTIN_ENTRIES
const found = new Map<string, Found>()

/**
 * De dónde salía cada portada en la generación anterior. Sirve para no volver a
 * descargar lo que no ha cambiado.
 *
 * Sale de `covers.sources.generated.ts` y no del mapa que usa la app: allí solo queda la
 * ruta del fichero, porque la procedencia no pinta nada en el navegador y sus URLs pesan
 * más que todo lo demás junto.
 */
const previous = new Map<string, string>(
  Object.entries(COVER_SOURCES).map(([slug, origin]) => [slug, origin.url]),
)

function pending(): typeof games {
  return games.filter((game) => !found.has(game.slug))
}

console.log(`Buscando la portada de ${games.length} juegos.\n`)

// ---------------------------------------------------------------------------
// 1. Portadas puestas a mano
// ---------------------------------------------------------------------------

const knownSlugs = new Set(games.map((game) => game.slug))
for (const [slug, url] of Object.entries(COVER_OVERRIDES)) {
  if (!knownSlugs.has(slug)) {
    console.warn(`⚠ covers.overrides.ts: «${slug}» no es ningún juego integrado`)
    continue
  }
  found.set(slug, { url, source: 'manual' })
}
console.log(`1. Puestas a mano: ${found.size}`)

// ---------------------------------------------------------------------------
// 2. Volcado CSV
// ---------------------------------------------------------------------------

console.log('\n2. Volcados de BGG en scripts/data/')
const dump = await loadDumps()

if (dump.size === 0) {
  console.log('  · No hay ningún CSV, se sigue sin él.')
} else if (!dump.hasImages) {
  console.log(`  · ${dump.size.toLocaleString('es')} juegos, pero sin columna de imagen.`)
} else {
  let count = 0
  for (const game of pending()) {
    const id = EXTERNAL_IDS[game.slug]?.bgg
    const image = id ? dump.byBggId(id)?.image : undefined
    if (!image) continue
    found.set(game.slug, { url: image, source: 'bgg' })
    count += 1
  }
  console.log(`  · ${count} portadas sacadas del volcado, sin una sola petición`)
}

// ---------------------------------------------------------------------------
// 3. Ficha de BoardGameGeek
// ---------------------------------------------------------------------------

console.log('\n3. Fichas de BGG (/thing)')
const token = readToken()
const withBggId = pending().filter((game) => EXTERNAL_IDS[game.slug]?.bgg !== undefined)

if (!token) {
  console.log(
    `  · Sin BGG_API_TOKEN: se saltan ${withBggId.length} juegos que tienen ID.\n` +
      '    Da de alta el token gratuito en boardgamegeek.com/using_the_xml_api,\n' +
      '    ponlo en .env y vuelve a lanzarlo: es la fuente con la caja de cada edición.',
  )
} else if (withBggId.length === 0) {
  console.log('  · No queda ninguno pendiente con ID de BGG.')
} else {
  const bySlug = new Map(withBggId.map((game) => [EXTERNAL_IDS[game.slug]!.bgg!, game.slug]))
  const ids = [...bySlug.keys()]
  let count = 0

  // Veinte fichas por petición y dos segundos entre lotes: es el ritmo que pide BGG.
  for (let start = 0; start < ids.length; start += 20) {
    const batch = ids.slice(start, start + 20)
    process.stdout.write(`\r  ${Math.min(start + 20, ids.length)}/${ids.length}`)
    try {
      for (const thing of await things(batch, token)) {
        const slug = bySlug.get(thing.id)
        if (!slug || !thing.image) continue
        found.set(slug, { url: thing.image, source: 'bgg' })
        count += 1
      }
    } catch (error) {
      console.warn(`\n  ⚠ lote ${batch[0]}…: ${(error as Error).message}`)
    }
    if (start + 20 < ids.length) await new Promise((done) => setTimeout(done, BGG_PAUSE_MS))
  }
  process.stdout.write('\n')
  console.log(`  · ${count}/${ids.length} resueltos`)
}

// ---------------------------------------------------------------------------
// 4 y 5. Wikidata y Wikipedia
// ---------------------------------------------------------------------------

console.log('\n4. Wikidata: artículo de Wikipedia e imagen (P18)')
const withQid = pending().filter((game) => EXTERNAL_IDS[game.slug]?.wikidata)

/** Título del artículo por idioma, para la etapa de Wikipedia. */
const articles = new Map<string, { es?: string; en?: string }>()
/**
 * Las imágenes de `P18` se guardan aparte y se aplican al final, después de Wikipedia.
 * El motivo es que Commons solo admite imágenes libres, y la carátula de un juego no lo
 * es: lo que suele haber en `P18` es una foto de la partida montada sobre la mesa. La
 * del infobox de Wikipedia sí es la caja, amparada en el uso legítimo. Así que la foto
 * de Commons vale como último recurso, no como primera opción.
 */
const commonsImages = new Map<string, string>()

if (withQid.length === 0) {
  console.log('  · No queda ninguno pendiente con ítem de Wikidata.')
} else {
  const details = await fetchDetails(
    withQid.map((game) => EXTERNAL_IDS[game.slug]!.wikidata!),
    { onProgress: (done) => process.stdout.write(`\r  ${done}/${withQid.length}`) },
  )
  process.stdout.write('\n')

  for (const game of withQid) {
    const detail = details.get(EXTERNAL_IDS[game.slug]!.wikidata!)
    if (!detail) continue
    if (detail.esTitle || detail.enTitle) {
      articles.set(game.slug, { es: detail.esTitle, en: detail.enTitle })
    }
    if (detail.image) commonsImages.set(game.slug, detail.image)
  }
  console.log(`  · ${articles.size} con artículo en Wikipedia, ${commonsImages.size} con imagen en Commons`)
}

/**
 * Un fichero subido a la Wikipedia de un idioma, y no a Commons, es una imagen de uso
 * legítimo: en un artículo de un juego de mesa, la caja. Todo lo que está en Commons es
 * libre por definición, y por tanto una foto que ha hecho alguien de la partida montada.
 *
 * Esto es lo que decide entre idiomas. La Wikipedia en español no admite uso legítimo,
 * así que sus fichas llevan la foto de Commons; la inglesa sí, y de ahí sale la caja.
 */
function isBoxArt(url: string): boolean {
  return !url.includes('/wikipedia/commons/')
}

/**
 * Busca el artículo en los dos idiomas con la función que se le pase y se queda con la
 * caja si alguno la tiene. Sin caja gana el español, que al menos será la edición que
 * se ve en la mesa.
 */
async function fromWikipedia(
  label: string,
  lookup: (lang: string, titles: string[]) => Promise<Map<string, string>>,
): Promise<void> {
  console.log(label)
  const candidates = new Map<string, string[]>()

  for (const lang of ['es', 'en'] as const) {
    const waiting = pending().filter((game) => articles.get(game.slug)?.[lang])
    if (waiting.length === 0) {
      console.log(`  · ${lang}: nada pendiente`)
      continue
    }
    try {
      const images = await lookup(lang, waiting.map((game) => articles.get(game.slug)![lang]!))
      let count = 0
      for (const game of waiting) {
        const image = images.get(articles.get(game.slug)![lang]!)
        if (!image) continue
        candidates.set(game.slug, [...(candidates.get(game.slug) ?? []), image])
        count += 1
      }
      console.log(`  · ${lang}: ${count}/${waiting.length}`)
    } catch (error) {
      console.warn(`  ⚠ ${lang}: ${(error as Error).message}`)
    }
  }

  let boxes = 0
  for (const [slug, urls] of candidates) {
    const box = urls.find(isBoxArt)
    if (box) boxes += 1
    found.set(slug, { url: box ?? urls[0], source: 'wikipedia' })
  }
  console.log(`  · ${candidates.size} resueltos, ${boxes} de ellos con la caja`)
}

await fromWikipedia('\n5. Imagen de la ficha del artículo (la caja)', infoboxImages)
await fromWikipedia('\n6. Imagen principal del artículo, para los que no tienen ficha', pageImages)

console.log('\n7. Imagen de Commons (P18), como último recurso')
let fromCommons = 0
for (const game of pending()) {
  const image = commonsImages.get(game.slug)
  if (!image) continue
  found.set(game.slug, { url: image, source: 'wikidata' })
  fromCommons += 1
}
console.log(`  · ${fromCommons} juegos se quedan con la foto de Commons`)

// ---------------------------------------------------------------------------
// Descarga y normalizado
// ---------------------------------------------------------------------------

interface Cover extends Found {
  file: string
}

const covers = new Map<string, Cover>()
const failed: string[] = []

/**
 * Descarga la imagen y la deja como webp cuadrado de 512 px.
 *
 * Wikimedia corta en seco al que descarga deprisa (`429`), y dice en `Retry-After`
 * cuánto hay que esperar. Se respeta: bajar 400 carátulas es cuestión de minutos y no
 * hay ninguna prisa, mientras que acabar bloqueado deja el script inservible.
 */
async function download(slug: string, url: string): Promise<void> {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

    if ([429, 503].includes(response.status)) {
      const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10)
      const waitMs = Number.isFinite(retryAfter) ? (retryAfter + 1) * 1000 : 10_000 * attempt
      process.stdout.write(`\n  ${response.status}: esperando ${Math.round(waitMs / 1000)} s…\n`)
      await new Promise((done) => setTimeout(done, waitMs))
      continue
    }
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

    const buffer = Buffer.from(await response.arrayBuffer())
    // `density` solo le importa a las vectoriales (algún logo llega en SVG): las rasteriza
    // con holgura para que el recorte a 512 px no salga pixelado. `flatten` pone fondo
    // blanco a lo que tenga transparencia, que si no se ve negro sobre la ficha.
    await sharp(buffer, { density: 300 })
      .flatten({ background: '#ffffff' })
      .resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
      .webp({ quality: QUALITY })
      .toFile(resolve(coversDir, `${slug}.webp`))
    return
  }
  throw new Error('el servidor sigue limitando el ritmo tras varios reintentos')
}

const toDownload = games.filter((game) => found.has(game.slug))

if (dryRun) {
  console.log('\n(--dry-run: no se descarga ni se escribe nada)')
  for (const game of toDownload) {
    covers.set(game.slug, { ...found.get(game.slug)!, file: `covers/${game.slug}.webp` })
  }
} else {
  mkdirSync(coversDir, { recursive: true })
  console.log(`\nDescargando y normalizando a webp de ${SIZE} px…`)

  // De una en una y con una pausa: es lo que aguanta Wikimedia sin cortar (ver `download`).
  await inBatches(toDownload, 1, async (game) => {
    const hit = found.get(game.slug)!
    const file = `covers/${game.slug}.webp`
    const onDisk = existsSync(resolve(coversDir, `${game.slug}.webp`))

    // Si la fuente no ha cambiado y el fichero sigue ahí, no hay nada que hacer.
    if (!force && onDisk && previous.get(game.slug) === hit.url) {
      covers.set(game.slug, { ...hit, file })
      return
    }

    const done = await withRetries(
      async () => {
        await download(game.slug, hit.url)
        return true
      },
      3,
      (error) => {
        console.warn(`\n  ⚠ ${game.name}: ${error.message}`)
        failed.push(game.slug)
      },
    )

    // Si la descarga falla pero la imagen anterior sigue en disco, se conserva: que la
    // red haya fallado una vez no es motivo para dejar al juego sin portada.
    if (done || onDisk) covers.set(game.slug, { ...hit, file })
  }, 300)

  // Si un juego cambia de fuente, se renombra o desaparece del catálogo, su .webp se
  // quedaría ahí para siempre engordando el repositorio. Se borra lo que ya no se usa.
  const orphans = readdirSync(coversDir).filter(
    (name) => name.endsWith('.webp') && !covers.has(name.slice(0, -'.webp'.length)),
  )
  for (const orphan of orphans) rmSync(resolve(coversDir, orphan))
  if (orphans.length > 0) console.log(`  ${orphans.length} portadas huérfanas borradas`)
}

// ---------------------------------------------------------------------------
// Fichero generado e informe
// ---------------------------------------------------------------------------

const bySource = new Map<Source, number>()
for (const cover of covers.values()) {
  bySource.set(cover.source, (bySource.get(cover.source) ?? 0) + 1)
}

/** Las URLs pueden llevar comillas simples: hay que escaparlas en el literal. */
function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

const stamp = new Date().toISOString().slice(0, 10)
const entries = [...covers.entries()].sort(([a], [b]) => a.localeCompare(b))

const file = `/**
 * GENERADO AUTOMÁTICAMENTE POR \`npm run covers\` — NO EDITAR A MANO.
 * Las portadas elegidas a mano van en \`scripts/covers.overrides.ts\`.
 *
 * Portada de cada juego integrado. El fichero está en \`public/covers/\` y la ruta es
 * relativa a la base del sitio: úsala siempre con \`coverUrl()\` de \`src/games/covers.ts\`,
 * que le pone delante \`import.meta.env.BASE_URL\` (en GitHub Pages el sitio cuelga de
 * \`/table-tracker/\`, así que una ruta absoluta no valdría).
 *
 * Los juegos que no salen aquí no tienen portada conocida y se pintan con su icono.
 *
 * Aquí solo está la ruta, y a propósito: este mapa viaja en el bundle y lo paga cada
 * visita. De dónde salió cada imagen es procedencia, no dato de ejecución, y se guarda
 * aparte en \`scripts/covers.sources.generated.ts\`. Las carátulas son de sus
 * editoriales; se guardan a ${SIZE} px con fines de identificación (ver la nota del README).
 *
 * Última actualización: ${stamp}
 * Con portada: ${covers.size} de ${games.length}
 */
export const COVERS: Record<string, string> = {
${entries.map(([slug, cover]) => `  '${slug}': '${cover.file}',`).join('\n')}
}
`

const sources = `/**
 * GENERADO AUTOMÁTICAMENTE POR \`npm run covers\` — NO EDITAR A MANO.
 *
 * De dónde salió la portada de cada juego. Vive en \`scripts/\` y no lo importa nadie de
 * \`src/\` a propósito: es procedencia, no dato de ejecución, y si viajara en el bundle
 * serían decenas de kB de URLs que ningún navegador llega a mirar. Lo que la app necesita
 * —la ruta del fichero— está en \`src/games/covers.generated.ts\`.
 *
 * \`npm run covers\` lo lee para no volver a descargar lo que no ha cambiado, y lo
 * reescribe al terminar.
 *
 * Última actualización: ${stamp}
 */
export type CoverSource = ${(['manual', 'bgg', 'wikidata', 'wikipedia'] as const).map((source) => `'${source}'`).join(' | ')}

export interface CoverOrigin {
  source: CoverSource
  url: string
}

export const COVER_SOURCES: Record<string, CoverOrigin> = {
${entries.map(([slug, cover]) => `  '${slug}': { source: '${cover.source}', url: ${quote(cover.url)} },`).join('\n')}
}
`

if (!dryRun) {
  writeFileSync(outputPath, file, 'utf8')
  writeFileSync(sourcesPath, sources, 'utf8')
}

console.log('\n─────────────────────────────────────────────')
console.log(`Con portada: ${covers.size}/${games.length} (${Math.round((covers.size / games.length) * 100)} %)`)
for (const [source, count] of bySource) console.log(`  · ${source}: ${count}`)
if (failed.length > 0) {
  console.log(`No se pudieron descargar: ${failed.length}`)
}

const missing = games.filter((game) => !covers.has(game.slug))
if (missing.length > 0) {
  console.log(`\nSin portada (${missing.length}), se quedan con su icono:`)
  console.log(missing.map((game) => `  · ${game.name}`).join('\n'))
}

if (!dryRun) {
  console.log(`\n✓ src/games/covers.generated.ts + scripts/covers.sources.generated.ts — ${covers.size}/${games.length} con portada`)
}
