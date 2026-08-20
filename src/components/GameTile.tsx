import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useCover } from './GameCover'
import { isCustomGame, type GameDefinition } from '../games/types'
import type { TileSize } from '../lib/tilesize'

/**
 * Tarjeta de un juego en la pantalla principal.
 * Todo lo que pinta (portada, icono, color, nombre, número de jugadores) sale de la
 * definición: no conoce ningún juego en concreto.
 *
 * La caja es cuadrada porque las portadas descargadas se guardan cuadradas (512 px
 * recortados al centro, ver `scripts/fetch-covers.ts`). Las que enlazamos de BGG NO
 * lo son —vienen en 200x150 y cada caja con su proporción—, así que la imagen va
 * `absolute inset-0` dentro de la caja: con `h-full` a secas, un alto en porcentaje
 * sobre un padre de altura automática se resuelve como `auto` y es la imagen la que
 * estira la caja, que es lo que descuadraba la rejilla entera. El recorte lo hace
 * `object-cover`. El nombre va debajo y no encima, para que se lea igual sobre una
 * portada clara que sobre una oscura.
 *
 * Viene en tres tamaños (ver `lib/tilesize.ts`). Encogerla no es escalarla: a dos
 * columnas la portada mide 169 px y hay sitio para el nombre entero y la línea de
 * abajo, pero a cuatro son 76 px y ahí sobra todo lo que no sea la portada y el
 * nombre. Por eso el detalle se cae por pasos en vez de reducirse: la línea de
 * «3–6 jugadores · Puntos» desaparece, el nombre pasa a poder partirse en dos
 * líneas en lugar de cortarse, y la chapa de «Vuestro» se queda en un punto de
 * color con el texto solo para quien lee la pantalla en voz alta.
 *
 * Las medidas de cada paso están en `index.css` (`.tile`, `.tile-md`, `.tile-sm`) y
 * no en clases sueltas aquí: son las que tienen que cuadrar entre sí.
 */

const SIZE_CLASS: Record<TileSize, string> = {
  large: '',
  medium: 'tile-md',
  small: 'tile-sm',
}

export function GameTile({
  game,
  to,
  size = 'large',
}: {
  game: GameDefinition
  to: string
  size?: TileSize
}) {
  const custom = isCustomGame(game)
  const cover = useCover(game)
  const compact = size !== 'large'

  return (
    <Link
      to={to}
      className={`card tile ${SIZE_CLASS[size]} group transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:hard-lift active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`}
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      <span
        className={`${size === 'small' ? 'game-rule-thin' : 'game-rule'} relative block aspect-square overflow-hidden`}
      >
        {cover.src ? (
          <img
            src={cover.src}
            alt=""
            loading="lazy"
            onError={cover.onError}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="game-wash flex h-full w-full items-center justify-center">
            <span className="tile-glyph" aria-hidden="true">
              {game.icon}
            </span>
          </span>
        )}

        {custom && (
          <span className="tile-badge overline hard-sm">
            <span className={compact ? 'sr-only' : ''}>Vuestro</span>
          </span>
        )}
      </span>

      <span className="game-tint tile-band">
        <span className="nombre tile-name">{game.name}</span>
        {!compact && (
          <span className="tnum mt-0.5 block text-[0.78125rem] font-semibold text-[var(--color-muted)]">
            {game.minPlayers}–{game.maxPlayers} jugadores · {game.scoreLabel}
          </span>
        )}
      </span>
    </Link>
  )
}
