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
 * respuesta, así que hay que reintentar en vez de darlo por vacío.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = 'https://boardgamegeek.com/xmlapi2'
const USER_AGENT = 'MesaBoardGameTracker/1.0 (https://github.com/; contacto en el repo)'
/** BGG recomienda un máximo de una petición cada dos segundos. */
export const BGG_PAUSE_MS = 2000

/** Lee `BGG_API_TOKEN` del entorno o del `.env` del proyecto, sin dependencias. */
export function readToken(): string | undefined {
  if (process.env.BGG_API_TOKEN) return process.env.BGG_API_TOKEN.trim()

  const envPath = resolve(here, '..', '..', '.env')
  if (!existsSync(envPath)) return undefined
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = /^\s*BGG_API_TOKEN\s*=\s*(.*)$/.exec(line)
    if (match) return match[1].trim().replace(/^["']|["']$/g, '')
  }
  return undefined
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

export interface BggThing {
  id: number
  name?: string
  image?: string
}

/** `/thing`: la ficha de hasta 20 juegos por petición, con su carátula. */
export async function things(ids: number[], token: string): Promise<BggThing[]> {
  const xml = await get(`thing?id=${ids.join(',')}`, token)

  const items: BggThing[] = []
  for (const block of xml.split('<item ').slice(1)) {
    const id = Number.parseInt(attr(block, 'id') ?? '', 10)
    if (!Number.isFinite(id)) continue
    const nameTag = /<name[^>]*type="primary"[^>]*\/>/.exec(block)?.[0]
    items.push({
      id,
      name: nameTag ? decode(attr(nameTag, 'value') ?? '') : undefined,
      image: /<image>([^<]+)<\/image>/.exec(block)?.[1]?.trim(),
    })
  }
  return items
}
