/**
 * El catálogo crece por donde la gente lo busca.
 *
 * La ingesta (`npm run ingest:bgg`) baja los ~18.000 juegos que ha votado al menos
 * cien personas. Por debajo de ese corte quedan otras ~160.000 fichas en
 * BoardGameGeek: juegos raros, ediciones locales, cosas que ha jugado poca gente. No
 * se bajan «por si acaso» —son gigabytes de nada—, pero alguien buscará el suyo. Esta
 * función es lo que pasa entonces: se le pregunta a BGG, se escribe en el catálogo y
 * se devuelve ya listo para pintar.
 *
 * Por qué vive en el servidor y no en el navegador, que sería más simple:
 *
 *   · BGG no manda cabeceras CORS. Desde una página, la petición ni sale.
 *   · Pide un token, y un token en el bundle es un token público.
 *   · Su límite —~1 petición cada 2 s— es del TOKEN, no de cada usuario. Diez
 *     personas buscando a la vez son diez peticiones al mismo cubo. Por eso el freno
 *     de verdad es `catalog_misses`: cada consulta se le pregunta a BGG UNA vez por
 *     semana, venga de quien venga.
 *
 * Y la invariante que no se puede saltar: `matches.game_slug` es clave ajena a
 * `games.slug`. Un juego que no esté escrito en la base de datos no se puede apuntar
 * en una partida, así que aquí se INSERTA y solo entonces se devuelve. Si se
 * devolviera primero, se podría pintar un juego con el que después falla guardar.
 *
 * Cómo se despliega (hace falta la CLI de Supabase, esto no sale con el push a
 * GitHub Pages como el resto de la app):
 *
 *     supabase login
 *     supabase link --project-ref <ref>
 *     supabase secrets set BGG_API_TOKEN=…
 *     supabase functions deploy resolve-game
 *
 * Un aviso sobre el empaquetado: `_shared/bgg-games.ts` importa `src/games/catalog.ts`,
 * que está fuera de `supabase/`. Es a propósito —un juego tiene que salir igual por la
 * ingesta que por aquí, y esa es la única puerta que lo construye—, y la CLI lo admite
 * desde que arreglaron el bundler (`supabase/cli#1028`). Con una CLI vieja el `deploy`
 * se queja de que no encuentra el módulo: se actualiza y ya.
 *
 * `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los pone Supabase sola. La clave de
 * servicio se salta la RLS: es lo que permite escribir en el catálogo público, y la
 * razón de que las dos funciones de Postgres que usa —`claim_catalog_lookup` y
 * `resolve_catalog_games`, en `supabase/schema.sql`— no estén abiertas a nadie más.
 *
 * Sin desplegar no se rompe nada: `resolveGame` en `api.supabase.ts` se traga el
 * error y devuelve una lista vacía, que es lo mismo que pasaba antes de existir esto.
 */
import { BGG_PAUSE_MS, search, things } from '../_shared/bgg-api.ts'
import { definitionOf, freeSlug, sheetOf } from '../_shared/bgg-games.ts'

/** Cuántos juegos se traen de una búsqueda. `/thing` admite 20 por petición. */
const MAX_GAMES = 12

/** Peticiones por IP y minuto. Es un grifo, no una cerradura: ver `recent`. */
const IP_LIMIT = 5
const IP_WINDOW_MS = 60_000

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Lo que ha pedido cada IP en el último minuto.
 *
 * Vive en la memoria del proceso a propósito, y hay que saber lo que eso significa:
 * Supabase levanta y tira estos procesos cuando quiere, así que el contador se
 * reinicia solo y no cuenta lo que hicieron otros procesos a la vez. Es un freno
 * contra el bucle accidental —una pantalla que se repinta, un dedo en F5—, no contra
 * quien quiera hacer daño. Contra eso está `catalog_misses`, que sí es compartida y
 * sí sobrevive. La alternativa sería una tabla de IPs, y guardar la IP de quien busca
 * un juego de mesa no compensa.
 */
const recent = new Map<string, number[]>()

function tooMany(ip: string): boolean {
  const now = Date.now()
  const times = (recent.get(ip) ?? []).filter((at) => now - at < IP_WINDOW_MS)
  times.push(now)
  recent.set(ip, times)

  // La memoria no se limpia sola: sin esto, un proceso longevo acumula una entrada
  // por cada IP que haya buscado alguna vez.
  if (recent.size > 5000) {
    for (const [key, seen] of recent) {
      if (seen.every((at) => now - at >= IP_WINDOW_MS)) recent.delete(key)
    }
  }

  return times.length > IP_LIMIT
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

/** Llama a una función de Postgres con la clave de servicio. */
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')

  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })

  if (!response.ok) throw new Error(`${name}: ${response.status} ${await response.text()}`)
  return (await response.json()) as T
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const token = Deno.env.get('BGG_API_TOKEN')
  if (!token) return json({ error: 'Falta BGG_API_TOKEN' }, 500)

  let query = ''
  try {
    const body = (await request.json()) as { query?: unknown }
    query = typeof body.query === 'string' ? body.query.trim() : ''
  } catch {
    return json({ error: 'Cuerpo ilegible' }, 400)
  }
  if (query.length < 3) return json({ games: [] })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'desconocida'
  if (tooMany(ip)) return json({ games: [] })

  try {
    // El apunte va ANTES de preguntar, no después: si fuera después, diez búsquedas
    // simultáneas de lo mismo saldrían las diez hacia BGG antes de que ninguna
    // hubiera vuelto para contarlo.
    const worth = await rpc<boolean>('claim_catalog_lookup', { p_query: query })
    if (!worth) return json({ games: [] })

    const hits = await search(query, token, false)
    if (hits.length === 0) {
      await rpc('resolve_catalog_games', { p_query: query, p_games: [] })
      return json({ games: [] })
    }

    // La pausa que pide BGG entre petición y petición. Aquí es de verdad: son dos
    // llamadas seguidas al mismo cubo.
    await new Promise((wait) => setTimeout(wait, BGG_PAUSE_MS))
    const fetched = await things(
      hits.slice(0, MAX_GAMES).map((hit) => hit.id),
      token,
      { stats: true },
    )

    // La misma traducción que usa la ingesta, y los mismos descartes: una expansión
    // no es un juego con el que se juegue una partida, es la caja de al lado.
    const taken = new Set<string>()
    const games = []
    for (const thing of fetched) {
      if (thing.type !== 'boardgame' || !thing.name) continue
      const slug = freeSlug(thing, taken)
      if (!slug) continue
      taken.add(slug)

      games.push({
        slug,
        bgg_id: thing.id,
        year: thing.year ?? null,
        popularity: thing.votes ?? 0,
        cover_url: thing.image ?? null,
        cover_thumb_url: thing.thumbnail ?? null,
        sheet_id: sheetOf(thing.mechanics ?? []),
        definition: definitionOf(thing, slug),
      })
    }

    const rows = await rpc<unknown[]>('resolve_catalog_games', {
      p_query: query,
      p_games: games,
    })
    return json({ games: rows })
  } catch (error) {
    // `instanceof` y no `as Error`: el fichero de un solo trozo que se pega en el
    // panel de Supabase sale sin tipos, y ahí `as Error` no protegería de nada.
    const message = error instanceof Error ? error.message : String(error)
    console.error('resolve-game', message)
    return json({ error: message }, 502)
  }
})
