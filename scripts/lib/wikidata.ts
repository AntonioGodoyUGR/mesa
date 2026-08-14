/**
 * Consultas a Wikidata para los scripts de portadas.
 *
 * Wikidata se usa para dos cosas distintas:
 *   - resolver el ID de BoardGameGeek de un juego por su nombre (propiedad `P2339`), y
 *   - sacar su imagen (`P18`) y el título exacto de su artículo en Wikipedia.
 *
 * El filtro que evita los falsos positivos es exigir `P2339`: «Lisboa» o «Meadow» son
 * también una ciudad y un prado, pero solo el juego de mesa tiene ficha en BGG. Cuando
 * hace falta buscar sin ese requisito se filtra por tipo (`P31/P279* → Q131436`).
 */
import { normalise, slugToTitle, type GameEntry } from './games'

const ENDPOINT = 'https://query.wikidata.org/sparql'
/** Wikimedia exige un agente que identifique a quien llama. */
const USER_AGENT = 'MesaBoardGameTracker/1.0 (https://github.com/; contacto en el repo)'

interface Binding {
  value: string
  'xml:lang'?: string
}

/**
 * El endpoint público limita el ritmo y contesta `429` con una cabecera `Retry-After`
 * que dice cuántos segundos hay que esperar. Se respeta: es la forma de no acabar
 * bloqueado, y de todos modos esto se ejecuta a mano de vez en cuando.
 */
async function sparql(query: string): Promise<Record<string, Binding>[]> {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ query }),
    })

    // 502/504: el endpoint ha cortado la consulta por tiempo. Reintentar suele bastar.
    if ([429, 502, 503, 504].includes(response.status)) {
      const retryAfter = Number.parseInt(response.headers.get('retry-after') ?? '', 10)
      const waitMs = Number.isFinite(retryAfter) ? (retryAfter + 1) * 1000 : 5000 * attempt
      process.stdout.write(`\n  ${response.status}: esperando ${Math.round(waitMs / 1000)} s…\n`)
      await new Promise((done) => setTimeout(done, waitMs))
      continue
    }
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

    const body = (await response.json()) as { results?: { bindings?: Record<string, Binding>[] } }
    return body.results?.bindings ?? []
  }
  throw new Error('Wikidata sigue limitando el ritmo tras varios reintentos')
}

function literal(text: string, lang: string): string {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"@${lang}`
}

/** `http://www.wikidata.org/entity/Q123` → `Q123`. */
function qid(uri: string): string {
  return uri.slice(uri.lastIndexOf('/') + 1)
}

export interface WikidataHit {
  qid: string
  bgg?: number
}

/**
 * Los nombres con los que buscar un juego, del más al menos fiable.
 *
 * El de la app está a veces en español («Catán», «Ajedrez») y la etiqueta de Wikidata
 * en inglés, así que se prueba también el que sale del slug: «catan» → «Catan».
 *
 * Se comparan como cadenas exactas, no normalizadas: aquí las tildes importan porque
 * el literal de la consulta tiene que coincidir carácter a carácter con la etiqueta.
 * «Catán» y «Catan» normalizan igual pero solo la segunda encuentra el juego.
 */
function variantsOf(game: GameEntry): string[] {
  const variants = [game.name, slugToTitle(game.slug)].filter((name) => normalise(name))
  return [...new Set(variants)]
}

/**
 * Busca cada juego por nombre en las etiquetas y alias de Wikidata.
 *
 * Se consulta en español y en inglés porque en la app conviven los dos idiomas. Si un
 * nombre trae varios ítems con IDs de BGG distintos se descarta: no hay forma de saber
 * cuál es el bueno, y colgar la caja equivocada es peor que no colgar ninguna.
 */
export async function resolveByName(
  games: GameEntry[],
  options: { requireBgg: boolean; batchSize?: number; onProgress?: (done: number) => void },
): Promise<Map<string, WikidataHit>> {
  const found = new Map<string, WikidataHit>()
  const batchSize = options.batchSize ?? 40

  for (let start = 0; start < games.length; start += batchSize) {
    const batch = games.slice(start, start + batchSize)
    const values = [
      ...new Set(
        batch.flatMap((game) =>
          variantsOf(game).flatMap((name) => [literal(name, 'es'), literal(name, 'en')]),
        ),
      ),
    ].join(' ')

    // El filtro por tipo va como `FILTER EXISTS` y después de las etiquetas: recorrer
    // `P279*` sobre todos los ítems que encajan por nombre agota el tiempo del endpoint.
    const filter = options.requireBgg
      ? '?item wdt:P2339 ?bgg .'
      : 'FILTER EXISTS { ?item wdt:P31/wdt:P279* wd:Q131436 } OPTIONAL { ?item wdt:P2339 ?bgg }'

    const bindings = await sparql(`
      SELECT ?item ?bgg ?name WHERE {
        VALUES ?name { ${values} }
        ?item rdfs:label|skos:altLabel ?name .
        ${filter}
      }
    `)

    // Se agrupa por nombre para detectar los empates antes de quedarse con nada.
    const perName = new Map<string, WikidataHit[]>()
    for (const row of bindings) {
      const key = normalise(row.name.value)
      const hit: WikidataHit = {
        qid: qid(row.item.value),
        bgg: row.bgg ? Number.parseInt(row.bgg.value, 10) : undefined,
      }
      const list = perName.get(key) ?? []
      if (!list.some((other) => other.qid === hit.qid)) list.push(hit)
      perName.set(key, list)
    }

    // Se recorren los juegos, no los resultados: así el nombre de la app manda sobre
    // el derivado del slug cuando los dos encuentran algo.
    for (const game of batch) {
      for (const variant of variantsOf(game)) {
        const hits = perName.get(normalise(variant))
        if (!hits || hits.length === 0) continue
        const ids = new Set(hits.map((hit) => hit.bgg).filter((id) => id !== undefined))
        if (hits.length > 1 && ids.size !== 1) break
        found.set(game.slug, hits.find((hit) => hit.bgg !== undefined) ?? hits[0])
        break
      }
    }

    options.onProgress?.(Math.min(start + batchSize, games.length))
    if (start + batchSize < games.length) {
      await new Promise((done) => setTimeout(done, 1500))
    }
  }

  return found
}

export interface WikidataDetails {
  /** URL directa del fichero en Commons, ya resuelta por el endpoint. */
  image?: string
  /** Título exacto del artículo, para pedirle la imagen a la API de MediaWiki. */
  esTitle?: string
  enTitle?: string
}

/** Imagen y artículos de Wikipedia de una lista de ítems ya identificados. */
export async function fetchDetails(
  qids: string[],
  options: { batchSize?: number; onProgress?: (done: number) => void } = {},
): Promise<Map<string, WikidataDetails>> {
  const details = new Map<string, WikidataDetails>()
  const batchSize = options.batchSize ?? 100
  const unique = [...new Set(qids)]

  for (let start = 0; start < unique.length; start += batchSize) {
    const batch = unique.slice(start, start + batchSize)
    const values = batch.map((id) => `wd:${id}`).join(' ')

    const bindings = await sparql(`
      SELECT ?item ?image ?es ?en WHERE {
        VALUES ?item { ${values} }
        OPTIONAL { ?item wdt:P18 ?image }
        OPTIONAL { ?es schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> }
        OPTIONAL { ?en schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> }
      }
    `)

    for (const row of bindings) {
      const id = qid(row.item.value)
      details.set(id, {
        image: row.image?.value,
        // El sitelink es la URL del artículo: el título es su último segmento.
        esTitle: row.es ? decodeURIComponent(row.es.value.split('/wiki/')[1] ?? '') : undefined,
        enTitle: row.en ? decodeURIComponent(row.en.value.split('/wiki/')[1] ?? '') : undefined,
      })
    }

    options.onProgress?.(Math.min(start + batchSize, unique.length))
    if (start + batchSize < unique.length) {
      await new Promise((done) => setTimeout(done, 1500))
    }
  }

  return details
}
