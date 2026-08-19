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

  // Homónimos: la búsqueda se quedó con el primer juego del mismo nombre, que es otro.
  // Se vieron por la portada —la de «Obsession» era una foto de gente jugando a un juego
  // de madera de los setenta— y se corrigen aquí, que es donde nace el problema.
  'obsession': { bgg: 231733 }, // el victoriano de 2018, no el «Obsession» de 1977
  'canvas': { bgg: 290236 }, // el de las cartas transparentes de 2021, no el de 2010
  'the-game': { bgg: 173090 }, // el de Benndorf, no «Wikipedia: The Game About Everything»
  'backgammon': { bgg: 2397 }, // el backgammon de siempre, no «Zocken»

  // Sin ID por el nombre: la búsqueda no llega a ellos porque el catálogo los llama
  // como se les llama aquí. Con el ID puesto, la portada sale de BGG y ya no hace
  // falta la imagen de Wikipedia.
  'aventureros-al-tren': { bgg: 9209 }, // «Ticket to Ride»
  'parchis': { bgg: 2136 }, // «Pachisi», del que viene el parchis
}
