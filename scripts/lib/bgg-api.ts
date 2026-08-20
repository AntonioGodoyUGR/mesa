/**
 * El cliente de BoardGameGeek, con el token leído del `.env` del proyecto.
 *
 * El cliente en sí está en `supabase/functions/_shared/bgg-api.ts`, que es código
 * compartido con la función `resolve-game`: la misma pausa, los mismos reintentos del
 * `202` y el mismo parser de XML para los dos caminos que hablan con BGG. Lo único que
 * no puede ser común es de dónde sale el token —aquí un fichero en disco, allí una
 * variable de entorno de Supabase—, y eso es lo que añade este fichero.
 *
 * Sin token los scripts no fallan: se saltan esa etapa y tiran del volcado CSV y de
 * Wikidata, que no piden credenciales.
 */
import { readEnv } from './env'

export * from '../../supabase/functions/_shared/bgg-api'

/** Lee `BGG_API_TOKEN` del entorno o del `.env` del proyecto. */
export function readToken(): string | undefined {
  return readEnv('BGG_API_TOKEN')
}
