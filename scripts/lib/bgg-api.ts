/**
 * Cliente mínimo de la XML API2 de BoardGameGeek.
 *
 * Desde finales de 2025 la API dejó de ser abierta: sin credenciales responde `401` en
 * los tres endpoints (`/xmlapi2`, `/xmlapi` y `api.geekdo.com`). El alta es gratuita
 * para uso no comercial en <https://boardgamegeek.com/using_the_xml_api>; el token se
 * guarda como `BGG_API_TOKEN` en `.env` y viaja en la cabecera `Authorization`.
 *
 * Sin token los scripts no fallan: se saltan esta etapa y tiran del volcado CSV y de
 * Wikidata, que no piden credenciales.
 *
 * BGG pide ir despacio (~1 petición cada 2 s) y responde `202` mientras prepara la
 * respuesta, así que hay que reintentar en vez de darlo por vacío. Ese ritmo es también
 * la razón de que esto viva solo en `scripts/`: 0,5 peticiones por segundo es el techo
 * del token entero, no de cada usuario, así que la app nunca habla con BGG.
 */
import { readEnv } from './env'

const BASE = 'https://boardgamegeek.com/xmlapi2'
const USER_AGENT = 'TableTracker/1.0 (https://github.com/; contacto en el repo)'
/** BGG recomienda un máximo de una petición cada dos segundos. */
export const BGG_PAUSE_MS = 2000

/** Lee `BGG_API_TOKEN` del entorno o del `.env` del proyecto. */
export function readToken(): string | undefined {
  return readEnv('BGG_API_TOKEN')
}

async function get(path: string, token: string): Promise<string> {
  // `202` significa «lo estoy preparando, vuelve a preguntar»: se espera y se repite.
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(`${BASE}/${path}`, {
      headers: { 'User-Agent': USER_AGENT, Authorization: `Bearer ${token}` },
    })
    if (response.status === 202 || response.status === 429) {
      await new Promise((done) => setTimeout(done, BGG_PAUSE_MS * attempt))
      continue
    }
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return await response.text()
  }
  throw new Error('BGG no terminó de preparar la respuesta')
}

export interface BggSearchHit {
  id: number
  name: string
  year?: number
}

/** Atributo de una etiqueta XML, sin traerse un parser entero para esto. */
function attr(tag: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1]
}

function decode(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&')
}

/** `<etiqueta value="…"/>`, como número. Devuelve `undefined` si no está o es 0. */
function numberOf(block: string, tag: string): number | undefined {
  const found = new RegExp(`<${tag}[^>]*/>`).exec(block)?.[0]
  const value = found ? Number.parseFloat(attr(found, 'value') ?? '') : NaN
  return Number.isFinite(value) && value > 0 ? value : undefined
}

/** Los valores de `<link type="…" value="…"/>`: mecánicas, categorías, familias. */
function linksOf(block: string, type: string): string[] {
  const values: string[] = []
  for (const tag of block.match(/<link[^>]*\/>/g) ?? []) {
    if (attr(tag, 'type') !== type) continue
    const value = attr(tag, 'value')
    if (value) values.push(decode(value))
  }
  return values
}

/** `/search`: juegos y expansiones cuyo nombre encaja con la consulta. */
export async function search(
  query: string,
  token: string,
  exact: boolean,
): Promise<BggSearchHit[]> {
  const params = new URLSearchParams({ query, type: 'boardgame,boardgameexpansion' })
  if (exact) params.set('exact', '1')
  const xml = await get(`search?${params}`, token)

  const hits: BggSearchHit[] = []
  for (const block of xml.split('<item ').slice(1)) {
    const id = Number.parseInt(attr(block, 'id') ?? '', 10)
    const nameTag = /<name[^>]*type="primary"[^>]*\/>/.exec(block)?.[0]
    const name = nameTag ? attr(nameTag, 'value') : undefined
    if (!Number.isFinite(id) || !name) continue
    const yearTag = /<yearpublished[^>]*\/>/.exec(block)?.[0]
    hits.push({
      id,
      name: decode(name),
      year: yearTag ? Number.parseInt(attr(yearTag, 'value') ?? '', 10) || undefined : undefined,
    })
  }
  return hits
}

/**
 * La ficha de un juego en BGG.
 *
 * Lo de arriba lo lee cualquiera que llame; lo de `stats` en adelante solo llega si se
 * pide `stats: true`, que es lo que hace la ingesta. `fetch-covers.ts` no lo pide: solo
 * quiere la carátula, y con `stats=1` la respuesta de 20 juegos se multiplica por tres
 * para tirar el resto.
 */
export interface BggThing {
  id: number
  name?: string
  /** `boardgame`, `boardgameexpansion`… La ingesta descarta lo que no sea un juego. */
  type?: string
  /** La carátula original, de hasta ~1500 px. */
  image?: string
  /** La miniatura de ~200 px que sirve el propio CDN de BGG. */
  thumbnail?: string
  year?: number
  minPlayers?: number
  maxPlayers?: number
  minTime?: number
  maxTime?: number
  /** La dificultad que vota la gente, de 1 a 5. */
  weight?: number
  /** Cuánta gente la ha votado: es la medida de popularidad que usa la ingesta. */
  votes?: number
  mechanics?: string[]
  categories?: string[]
}

/**
 * `/thing`: la ficha de hasta 20 juegos por petición.
 *
 * Con `stats` viene además `<statistics>`, de donde salen el peso y los votos. No se
 * pide siempre porque engorda mucho la respuesta y casi nadie lo necesita.
 */
export async function things(
  ids: number[],
  token: string,
  options: { stats?: boolean } = {},
): Promise<BggThing[]> {
  const query = options.stats ? `thing?id=${ids.join(',')}&stats=1` : `thing?id=${ids.join(',')}`
  const xml = await get(query, token)

  const items: BggThing[] = []
  for (const block of xml.split('<item ').slice(1)) {
    const id = Number.parseInt(attr(block, 'id') ?? '', 10)
    if (!Number.isFinite(id)) continue
    const nameTag = /<name[^>]*type="primary"[^>]*\/>/.exec(block)?.[0]

    const thing: BggThing = {
      id,
      name: nameTag ? decode(attr(nameTag, 'value') ?? '') : undefined,
      type: attr(block, 'type'),
      image: /<image>([^<]+)<\/image>/.exec(block)?.[1]?.trim(),
      thumbnail: /<thumbnail>([^<]+)<\/thumbnail>/.exec(block)?.[1]?.trim(),
    }

    if (options.stats) {
      thing.year = numberOf(block, 'yearpublished')
      thing.minPlayers = numberOf(block, 'minplayers')
      thing.maxPlayers = numberOf(block, 'maxplayers')
      // `playingtime` es el único que traen todas las fichas antiguas: vale de respaldo.
      thing.minTime = numberOf(block, 'minplaytime') ?? numberOf(block, 'playingtime')
      thing.maxTime = numberOf(block, 'maxplaytime') ?? numberOf(block, 'playingtime')
      thing.weight = numberOf(block, 'averageweight')
      thing.votes = numberOf(block, 'usersrated') ?? 0
      thing.mechanics = linksOf(block, 'boardgamemechanic')
      thing.categories = linksOf(block, 'boardgamecategory')
    }

    items.push(thing)
  }
  return items
}
