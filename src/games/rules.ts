/**
 * Cómo llega la chuleta de reglas de un juego del catálogo amplio.
 *
 * Los juegos escritos a mano en `definitions/` traen su `rules` dentro de la propia
 * `GameDefinition`: son dos docenas y su chuleta es justo lo que los distingue. Los del
 * catálogo amplio, no. Sus chuletas viven en `catalog.rules.ts`, que pesa más que el
 * catálogo entero (76 kB para 27 juegos, ~2,8 kB por chuleta) y solo se mira al abrir la
 * ficha de UN juego. Engancharlas al expandir el catálogo —como se hacía antes— metía
 * los 76 kB en el arranque de todo el mundo para que casi nadie los leyera.
 *
 * Así que se cargan con `import()` a demanda. El mapa entero se trae de una vez porque
 * es un solo módulo: partirlo por juego daría cientos de peticiones. Una vez cargado se
 * queda en memoria, así que la segunda ficha es instantánea.
 *
 * Esta frontera es temporal por diseño: cuando el catálogo se sirva desde la base de
 * datos, `rules` será una columna más y esto pasará a ser una consulta. Lo que no
 * cambiará es que las reglas nunca viajan en la lista, solo en la ficha.
 */
import type { GameDefinition, RuleSheet } from './types'

let cache: Record<string, RuleSheet> | null = null
let pending: Promise<Record<string, RuleSheet>> | null = null

/** El mapa ya cargado, o `null` si todavía no se ha pedido. Nunca espera. */
export function loadedRules(): Record<string, RuleSheet> | null {
  return cache
}

/** Trae el mapa de chuletas. Llamarla varias veces a la vez no duplica la descarga. */
export function loadRules(): Promise<Record<string, RuleSheet>> {
  if (cache) return Promise.resolve(cache)
  pending ??= import('./catalog.rules').then((module) => {
    cache = module.CATALOG_RULES
    pending = null
    return cache
  })
  return pending
}

/**
 * La chuleta de un juego, si se puede resolver sin esperar: la suya propia (juegos
 * escritos a mano y juegos de grupo) o la del mapa si ya está cargado.
 */
export function ruleSheetOf(game: GameDefinition): RuleSheet | undefined {
  return game.rules ?? cache?.[game.slug] ?? undefined
}

/**
 * Si este juego necesita el mapa para tener chuleta. Un juego que ya trae la suya no
 * dispara ninguna carga: los de `definitions/` y los que crea un grupo nunca la piden.
 */
export function needsRuleLoad(game: GameDefinition): boolean {
  return !game.rules && !cache && !game.slug.startsWith('c-')
}
