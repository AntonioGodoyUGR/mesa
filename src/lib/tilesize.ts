/**
 * Cuántos juegos caben de un vistazo en la rejilla con la que se busca.
 *
 * Es una preferencia de quien mira, no un dato del grupo, así que vive en el
 * navegador igual que el tema (`theme.ts`) y no pasa por `TableTrackerApi`:
 * cambiarla en el móvil no se la cambia a nadie más —y por eso tampoco viaja
 * al portátil, que es el precio de no inventar un campo en la cuenta.
 *
 * Ojo con dónde se aplica. La rejilla de arriba de Inicio —los que más jugáis y
 * los vuestros— NO la consulta: son cuatro o seis juegos que se tocan a diario y
 * ahí manda el tamaño grande siempre. Esto gobierna la rejilla del catálogo y la
 * de los resultados de búsqueda, que son las que tienen cientos de portadas y
 * las únicas donde la densidad cambia algo.
 */

export type TileSize = 'large' | 'medium' | 'small'

const STORAGE_KEY = 'mesa.tilesize'

/** El de en medio: dos columnas es la rejilla de arriba, cuatro ya es para quien se sabe el catálogo. */
const FALLBACK: TileSize = 'medium'

export type TileSizeInfo = {
  id: TileSize
  label: string
  /** Lo que se lee al pasar por encima y lo que oye quien no ve el icono. */
  hint: string
  /** Columnas en móvil. Sirve para el texto del botón, no para pintar la rejilla. */
  columns: number
}

export const TILE_SIZES: TileSizeInfo[] = [
  { id: 'large', label: 'Grandes', hint: 'Dos por fila', columns: 2 },
  { id: 'medium', label: 'Medianas', hint: 'Tres por fila', columns: 3 },
  { id: 'small', label: 'Pequeñas', hint: 'Cuatro por fila', columns: 4 },
]

function isTileSize(value: string | null): value is TileSize {
  return value === 'large' || value === 'medium' || value === 'small'
}

export function getStoredTileSize(): TileSize {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isTileSize(stored) ? stored : FALLBACK
}

export function setStoredTileSize(size: TileSize) {
  localStorage.setItem(STORAGE_KEY, size)
}

/** Las clases de `index.css` que le tocan a la rejilla. El tamaño grande es el de por sí. */
export function tileGridClass(size: TileSize): string {
  if (size === 'medium') return 'game-grid game-grid-md'
  if (size === 'small') return 'game-grid game-grid-sm'
  return 'game-grid'
}
