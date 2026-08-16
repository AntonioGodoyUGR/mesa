import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { GameCover } from './GameCover'
import { useGames } from '../context/GamesContext'
import { formatDate } from '../lib/stats'
import type { MatchWithPlayers } from '../lib/types'

/**
 * Fila de partida: se reutiliza en Inicio, Partidas y los perfiles.
 *
 * Dos enlaces, no uno: la portada y el nombre del juego llevan a su ficha (ahí
 * están sus reglas y sus estadísticas), y el resto de la fila —quién jugó y el
 * resultado— a esta partida en concreto. Dos `<a>` en paralelo dentro de la
 * misma tarjeta, nunca uno anidado en el otro.
 */
export function MatchCard({
  match,
  highlightPlayerId,
}: {
  match: MatchWithPlayers
  highlightPlayerId?: string
}) {
  const { getGame } = useGames()
  const game = getGame(match.game_slug)
  const entries = [...match.match_players].sort((a, b) => a.rank - b.rank)

  return (
    <div
      className="card game-edge flex items-stretch gap-1 p-1"
      style={{ '--game': game?.theme.primary ?? 'var(--color-brand)' } as CSSProperties}
    >
      {game ? (
        <Link
          to={`/juegos/${game.slug}`}
          className="flex shrink-0 items-center gap-2 rounded-md p-2 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
        >
          <GameCover game={game} size={40} />
          <span className="block max-w-16 truncate text-sm font-semibold sm:max-w-24">
            {game.name}
          </span>
        </Link>
      ) : (
        <span className="flex shrink-0 items-center gap-2 p-2">
          <span className="text-2xl leading-none" aria-hidden="true">
            🎲
          </span>
          <span className="block max-w-16 truncate text-sm font-semibold sm:max-w-24">
            {match.game_slug}
          </span>
        </span>
      )}

      <Link
        to={`/partidas/${match.id}`}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-2 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-[var(--color-muted)]">
            {formatDate(match.played_at)}
          </span>
          <span className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-[var(--color-muted)]">
            {entries.map((entry) => (
              <span
                key={entry.id}
                className={
                  entry.player_id === highlightPlayerId ? 'font-semibold text-[var(--color-text)]' : ''
                }
              >
                {entry.is_winner && '🏆 '}
                {entry.player.display_name}{' '}
                <span className="tnum font-semibold">{entry.total}</span>
              </span>
            ))}
          </span>
        </span>

        <span className="text-[var(--color-muted)]" aria-hidden="true">
          ›
        </span>
      </Link>
    </div>
  )
}
