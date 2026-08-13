import { Link } from 'react-router-dom'
import { isCustomGame, type GameDefinition } from '../games/types'

/**
 * Tarjeta de un juego en la pantalla principal.
 * Todo lo que pinta (portada, icono, color, nombre, número de jugadores) sale de la
 * definición: no conoce ningún juego en concreto.
 */
export function GameTile({ game, to }: { game: GameDefinition; to: string }) {
  const custom = isCustomGame(game)

  return (
    <Link
      to={to}
      className="card group relative flex flex-col justify-between overflow-hidden p-4 transition-transform active:scale-[0.98]"
      style={{ borderColor: `${game.theme.primary}40` }}
    >
      {game.imageUrl ? (
        <>
          <img
            src={game.imageUrl}
            alt=""
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          {/* Degradado de abajo arriba: el nombre tiene que leerse sobre cualquier foto. */}
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10"
            aria-hidden="true"
          />
        </>
      ) : (
        <span
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 transition-transform group-hover:scale-110"
          style={{ backgroundColor: game.theme.primary }}
          aria-hidden="true"
        />
      )}

      <span className="relative flex items-start justify-between gap-2">
        <span className="text-4xl leading-none" aria-hidden="true">
          {game.imageUrl ? '' : game.icon}
        </span>
        {custom && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: game.imageUrl ? '#00000066' : game.theme.surface,
              color: game.imageUrl ? '#fff' : game.theme.primary,
            }}
          >
            Vuestro
          </span>
        )}
      </span>

      <span className="relative mt-3">
        <span
          className="block font-bold"
          style={{ color: game.imageUrl ? '#fff' : game.theme.primary }}
        >
          {game.name}
        </span>
        <span
          className={`mt-0.5 block text-xs ${
            game.imageUrl ? 'text-white/75' : 'text-[var(--color-muted)]'
          }`}
        >
          {game.minPlayers}–{game.maxPlayers} jugadores · {game.scoreLabel}
        </span>
      </span>
    </Link>
  )
}
