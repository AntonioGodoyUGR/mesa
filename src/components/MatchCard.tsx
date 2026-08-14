import { Link } from 'react-router-dom'
import { GameCover } from './GameCover'
import { useGames } from '../context/GamesContext'
import { formatDate } from '../lib/stats'
import type { MatchWithPlayers } from '../lib/types'

/** Fila de partida: se reutiliza en Inicio, Partidas y los perfiles. */
export function MatchCard({
  match,
  highlightPlayerId,
}: {
  match: MatchWithPlayers
  highlightPlayerId?: string
}) {
  const { getGame } = useGames()
  const game = getGame(match.game_slug)
  const color = game?.theme.primary ?? 'var(--color-brand)'
  const entries = [...match.match_players].sort((a, b) => a.rank - b.rank)

  return (
    <Link
      to={`/partidas/${match.id}`}
      className="card flex items-center gap-3 p-3 transition-transform active:scale-[0.99]"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {game ? (
        <GameCover game={game} size={40} />
      ) : (
        <span className="text-2xl leading-none" aria-hidden="true">
          🎲
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-semibold">{game?.name ?? match.game_slug}</span>
          <span className="shrink-0 text-xs text-[var(--color-muted)]">
            {formatDate(match.played_at)}
          </span>
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
  )
}
