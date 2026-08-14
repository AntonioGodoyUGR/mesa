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
  // Estos tres son juegos escritos a mano que traían su portada puesta a dedo en
  // `definitions/`. Ni Wikidata ni Wikipedia los resuelven —«Camel Up» y «Terraforming
  // Mars» no tienen ID de BGG en Wikidata, y a «Aventureros al Tren» le pasa que el
  // artículo está bajo su título en inglés—, así que sus URLs se conservan aquí para
  // que sigan teniendo caja. Cuando haya token de BGG, se pueden borrar.
  'camel-up': 'https://upload.wikimedia.org/wikipedia/en/f/fb/Camel_Up_box_cover.jpg',
  'aventureros-al-tren':
    'https://upload.wikimedia.org/wikipedia/en/9/92/Ticket_to_Ride_Board_Game_Box_EN.jpg',
  'terraforming-mars':
    'https://upload.wikimedia.org/wikipedia/en/f/f0/Terraforming_Mars_board_game_box_cover.jpg',
}
