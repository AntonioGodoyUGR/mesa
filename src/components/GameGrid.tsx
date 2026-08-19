import type { ReactNode } from 'react'
import { GameTile } from './GameTile'
import { tileGridClass, type TileSize } from '../lib/tilesize'
import type { GameDefinition } from '../games/types'

/**
 * La rejilla de portadas. Vive aquí y no dentro de Inicio porque la misma
 * rejilla se pinta tres veces en esa pantalla —los que más jugáis, los
 * vuestros y el catálogo— y cada una en su tamaño.
 *
 * Ese es todo el criterio: la de arriba es un lanzador de cuatro o seis juegos
 * que se tocan a diario, y va grande; la de abajo es un catálogo de cientos
 * por el que se navega, y ahí manda el mando de tamaño. El `size` no lo decide
 * la rejilla, se lo dan.
 */
export function GameGrid({
  games,
  to,
  size = 'large',
  children,
}: {
  games: GameDefinition[]
  to: (game: GameDefinition) => string
  size?: TileSize
  /** Lo que va detrás de los juegos, como la tarjeta de «Crear juego». */
  children?: ReactNode
}) {
  return (
    <div className={tileGridClass(size)}>
      {games.map((game) => (
        <GameTile key={game.slug} game={game} to={to(game)} size={size} />
      ))}
      {children}
    </div>
  )
}
