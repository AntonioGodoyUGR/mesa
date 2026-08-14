/**
 * Correcciones a mano del mapa de identificadores externos.
 *
 * `npm run ids` resuelve los IDs automáticamente y sobrescribe
 * `scripts/external-ids.generated.ts`, así que las correcciones no pueden vivir ahí:
 * se escriben aquí y el script las fusiona por encima de lo que haya encontrado.
 *
 * Se usa para dos cosas:
 *   - los juegos que quedan en el bloque PENDIENTE del fichero generado, y
 *   - los que resuelve mal (la caja equivocada de una familia, un homónimo).
 *
 * El ID de BGG está en la URL de la ficha del juego:
 * `boardgamegeek.com/boardgame/224517/brass-birmingham` → 224517.
 * El de Wikidata es el `Q…` de la URL del ítem, y solo hace falta si BGG no lo tiene.
 */
export interface IdOverride {
  bgg?: number
  wikidata?: string
}

export const ID_OVERRIDES: Record<string, IdOverride> = {
  // 'spirit-island-jagged-earth': { bgg: 264220 },
}
