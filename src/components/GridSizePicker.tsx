import { Icon, type IconName } from './Icon'
import { TILE_SIZES, type TileSize } from '../lib/tilesize'

/**
 * El mando de tres posiciones que decide cuántas columnas tiene la rejilla del
 * catálogo. Lo que guarda y dónde manda está explicado en `lib/tilesize.ts`.
 *
 * Va pegado al titular de la rejilla que cambia, y no en una pantalla de
 * ajustes: así se ve el efecto en el mismo gesto y no hay que acordarse de
 * dónde estaba. Se dibuja como una sola pieza con tres posiciones —tres
 * botones sueltos no dirían que son excluyentes—, y por eso el estado va en
 * `aria-pressed` y no en un `radiogroup`: son tres formas de ver lo mismo, no
 * un formulario.
 */

const ICONS: Record<TileSize, IconName> = {
  large: 'rejilla-2',
  medium: 'rejilla-3',
  small: 'rejilla-4',
}

export function GridSizePicker({
  value,
  onChange,
}: {
  value: TileSize
  onChange: (size: TileSize) => void
}) {
  return (
    <span className="seg" role="group" aria-label="Tamaño de las tarjetas">
      {TILE_SIZES.map((size) => (
        <button
          key={size.id}
          type="button"
          aria-pressed={value === size.id}
          aria-label={`Tarjetas ${size.label.toLowerCase()}: ${size.hint.toLowerCase()}`}
          title={`${size.label} · ${size.hint}`}
          onClick={() => onChange(size.id)}
          className={`seg-btn ${value === size.id ? 'seg-btn-on' : ''}`}
        >
          <Icon name={ICONS[size.id]} className="seg-icon" />
        </button>
      ))}
    </span>
  )
}
