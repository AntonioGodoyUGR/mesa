import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useCover } from './GameCover'
import { isCustomGame, type GameDefinition } from '../games/types'

/**
 * Tarjeta de un juego en la pantalla principal.
 * Todo lo que pinta (portada, icono, color, nombre, número de jugadores) sale de la
 * definición: no conoce ningún juego en concreto.
 *
 * La caja es cuadrada porque las portadas se guardan cuadradas (512 px recortados al
 * centro, ver `scripts/fetch-covers.ts`): cualquier otra proporción se comería un
 * trozo de la carátula. El nombre va debajo y no encima, para que se lea igual sobre
 * una portada clara que sobre una oscura.
 */
export function GameTile({ game, to }: { game: GameDefinition; to: string }) {
  const custom = isCustomGame(game)
  const cover = useCover(game)

  return (
    <Link
      to={to}
      className="card group flex flex-col overflow-hidden transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:hard-lift active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      <span className="relative block aspect-square border-b-2 border-[var(--color-border)]">
        {cover.src ? (
          <img
            src={cover.src}
            alt=""
            loading="lazy"
            onError={cover.onError}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="game-wash flex h-full w-full items-center justify-center">
            <span className="text-4xl leading-none" aria-hidden="true">
              {game.icon}
            </span>
          </span>
        )}

        {custom && (
          <span className="overline hard-sm absolute right-1.5 top-1.5 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-accent)] px-2 py-0.5 text-[9px] text-[var(--color-accent-ink)]">
            Vuestro
          </span>
        )}
      </span>

      <span className="block px-2.5 pb-2.5 pt-2">
        <span className="display block text-[0.8125rem] leading-tight">{game.name}</span>
        <span className="overline tnum mt-0.5 block text-[0.625rem] text-[var(--color-muted)]">
          {game.minPlayers}–{game.maxPlayers} jugadores · {game.scoreLabel}
        </span>
      </span>
    </Link>
  )
}
