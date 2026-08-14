/**
 * La lista de juegos integrados, vista desde los scripts.
 *
 * Se arma desde `catalog.data.ts` y `curated.ts` en vez de desde `registry.ts`
 * a propósito: `registry.ts` arrastra `catalog.ts`, y ese importa
 * `covers.generated.ts`, que es justo el fichero que estos scripts escriben.
 * Importarlo desde aquí ataría la generación al resultado de la vez anterior.
 */
import { CATALOG_ROWS } from '../../src/games/catalog.data'
import { CURATED_GAMES } from '../../src/games/curated'

export interface GameEntry {
  slug: string
  /** El nombre tal y como se ve en la app: a veces en español («Catán», «Parchís»). */
  name: string
}

const catalog: GameEntry[] = CATALOG_ROWS.map(([slug, name]) => ({ slug, name }))
const curated: GameEntry[] = CURATED_GAMES.map(({ slug, name }) => ({ slug, name }))
const curatedSlugs = new Set(curated.map((game) => game.slug))

/**
 * Los 393 juegos que trae la app, curados primero, sin repetir slug.
 * Mismo criterio que `BUILTIN_GAMES` en `registry.ts`.
 */
export const BUILTIN_ENTRIES: GameEntry[] = [
  ...curated,
  ...catalog.filter((game) => !curatedSlugs.has(game.slug)),
]

/** Minúsculas, sin tildes, sin paréntesis y sin puntuación. Para comparar nombres. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** «Dune: Imperium – Uprising» → «dune». Lo de antes de los dos puntos o la raya. */
export function baseName(name: string): string {
  return normalise(name.split(/[:–—-]/)[0])
}

/** «aventureros-al-tren» → «Aventureros Al Tren». Otro nombre que probar. */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Ejecuta `worker` en tandas de `size`, pintando el avance. */
export async function inBatches<T, R>(
  items: T[],
  size: number,
  worker: (item: T) => Promise<R>,
  pauseMs = 0,
): Promise<R[]> {
  const results: R[] = []
  for (let start = 0; start < items.length; start += size) {
    const batch = items.slice(start, start + size)
    results.push(...(await Promise.all(batch.map(worker))))
    process.stdout.write(`\r  ${Math.min(start + size, items.length)}/${items.length}`)
    if (pauseMs > 0 && start + size < items.length) {
      await new Promise((done) => setTimeout(done, pauseMs))
    }
  }
  process.stdout.write('\n')
  return results
}

/** Reintentos con espera creciente. Devuelve `null` si se agotan. */
export async function withRetries<T>(
  attempt: () => Promise<T>,
  attempts: number,
  onGiveUp: (error: Error) => void,
): Promise<T | null> {
  for (let n = 1; n <= attempts; n += 1) {
    try {
      return await attempt()
    } catch (error) {
      if (n === attempts) {
        onGiveUp(error as Error)
        return null
      }
      await new Promise((done) => setTimeout(done, 1000 * n))
    }
  }
  return null
}
