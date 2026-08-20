/**
 * Lo que la ingesta añade a la traducción compartida de BoardGameGeek.
 *
 * La traducción en sí —categorías en español, icono, dificultad, hoja, slug y la
 * definición completa— está en `supabase/functions/_shared/bgg-games.ts`, porque la
 * comparten Node y la función `resolve-game`, que corre en Deno. Aquí se queda lo que
 * solo necesita quien escribe filas desde `scripts/`: los metadatos de catálogo y el
 * descarte de lo que no debe entrar.
 */
import { definitionOf, freeSlug, sheetOf } from '../../supabase/functions/_shared/bgg-games'
import type { BggThing } from './bgg-api'
import type { BggFacts, SeedGame } from './game-rows'

export * from '../../supabase/functions/_shared/bgg-games'

/** Lo que BGG aporta de un juego, valga o no la pena su ficha. */
export function factsOf(thing: BggThing): BggFacts {
  return {
    id: thing.id,
    year: thing.year,
    popularity: thing.votes ?? 0,
    coverUrl: thing.image,
    coverThumbUrl: thing.thumbnail,
  }
}

/**
 * La ficha entera, lista para que `gameRow` la convierta en fila.
 *
 * Devuelve `null` para lo que no debe entrar en el catálogo: las expansiones —la
 * partida es del juego base, no de su caja de ampliación—, las fichas sin nombre y las
 * que no consiguen un slug libre.
 */
export function bggSeedGame(thing: BggThing, taken: ReadonlySet<string>): SeedGame | null {
  if (thing.type !== 'boardgame' || !thing.name) return null

  const slug = freeSlug(thing, taken)
  if (!slug) return null

  return {
    game: definitionOf(thing, slug),
    sheetId: sheetOf(thing.mechanics ?? []),
    bgg: factsOf(thing),
  }
}
