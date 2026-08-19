/**
 * Portadas puestas a mano.
 *
 * `npm run covers` resuelve la portada de cada juego por su ID de BoardGameGeek y
 * sobrescribe `src/games/covers.generated.ts`, así que las elecciones a mano no pueden
 * vivir ahí: se escriben aquí y el script las respeta por encima de todo lo demás.
 *
 * Se usa cuando la cascada no encuentra nada o cuando cuelga la caja equivocada (la del
 * juego base en vez de la de la expansión, otra edición, una foto del contenido). La
 * URL puede ser cualquier imagen pública: se descarga y se procesa igual que el resto,
 * a webp cuadrado de 512 px en `public/covers/`.
 *
 * Antes de añadir una aquí, mira si el problema es de identificación: si el juego tiene
 * mal el ID de BGG, se corrige en `scripts/bgg-ids.overrides.ts` y de paso se arregla
 * la portada. Esto es para cuando el ID es correcto y la imagen no.
 */
export const COVER_OVERRIDES: Record<string, string> = {
  // Vacío a propósito: con el token de BGG puesto, todas las portadas salen de la API.
  // 'algun-juego': 'https://…/portada.jpg',
}
