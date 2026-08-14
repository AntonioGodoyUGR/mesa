import type { CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { computeBreakdown } from '../games/registry'
import { formatDate } from '../lib/stats'
import { GameCover } from '../components/GameCover'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorNote, Spinner } from '../components/ui'
import { useGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { api, queryKeys } from '../lib/api'
import type { GameDefinition } from '../games/types'
import type { MatchPlayer, Player } from '../lib/types'

export function MatchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { group } = useGroup()
  const { getGame } = useGames()

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  const remove = useMutation({
    mutationFn: () => api.deleteMatch(id!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.matches(group!.id) })
      navigate('/partidas', { replace: true })
    },
  })

  if (matchesQuery.isLoading) return <Spinner />

  const match = matchesQuery.data?.find((candidate) => candidate.id === id)
  if (!match) {
    return (
      <EmptyState
        icon="🔍"
        title="Partida no encontrada"
        description="Puede que se haya borrado o que pertenezca a otro grupo."
        action={
          <Link to="/partidas" className="btn btn-primary">
            Ver partidas
          </Link>
        }
      />
    )
  }

  const game = getGame(match.game_slug)
  const entries = [...match.match_players].sort((a, b) => a.rank - b.rank)

  return (
    // `--game` se declara una vez y lo heredan las fichas de cada jugador.
    <div
      className="flex flex-col gap-4"
      style={{ '--game': game?.theme.primary ?? 'var(--color-brand)' } as CSSProperties}
    >
      <header className="flex items-center gap-3">
        {game ? (
          <GameCover game={game} size={52} />
        ) : (
          <span className="text-3xl leading-none" aria-hidden="true">
            🎲
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="game-ink display truncate text-xl">
            {game ? (
              // Desde una partida se llega a la ficha del juego, que es donde
              // están el resto de partidas y las estadísticas.
              <Link to={`/juegos/${game.slug}`}>{game.name}</Link>
            ) : (
              match.game_slug
            )}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {formatDate(match.played_at)} · {entries.length} jugadores
          </p>
        </div>
        {game && (
          <Link
            to={`/reglas/${game.slug}`}
            className="btn btn-ghost shrink-0 px-3 py-1.5 text-sm"
          >
            Reglas
          </Link>
        )}
      </header>

      {match.notes && (
        <p className="card px-4 py-3 text-sm italic text-[var(--color-muted)]">
          {match.notes}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <PlayerBreakdown key={entry.id} entry={entry} game={game} />
        ))}
      </div>

      <ErrorNote error={remove.error} />

      <button
        type="button"
        className="btn btn-ghost text-[var(--color-danger)]"
        disabled={remove.isPending}
        onClick={() => {
          if (window.confirm('¿Borrar esta partida? No se puede deshacer.')) remove.mutate()
        }}
      >
        {remove.isPending ? 'Borrando…' : 'Borrar partida'}
      </button>
    </div>
  )
}

function PlayerBreakdown({
  entry,
  game,
}: {
  entry: MatchPlayer & { player: Player }
  game: GameDefinition | undefined
}) {
  // Campos a cero que no aportan nada: se ocultan para que el desglose se lea de un vistazo.
  const breakdown = game
    ? computeBreakdown(game, entry.scores).filter((row) => row.value !== 0)
    : []

  return (
    // Mismo vestido que la hoja donde se anotó: filete del color del juego,
    // portada tenue por detrás y su icono asomando por la esquina.
    <section
      className={`card game-edge relative overflow-hidden ${entry.is_winner ? 'hard-lift' : ''}`}
    >
      {game?.imageUrl && (
        <span
          className="game-photo"
          style={{ backgroundImage: `url(${game.imageUrl})` }}
          aria-hidden="true"
        />
      )}

      <div className="relative">
        <header
          className={`flex items-center gap-3 px-4 py-3 ${entry.is_winner ? 'game-tint' : ''}`}
        >
          {game && (
            <span className="game-glyph" aria-hidden="true">
              {game.icon}
            </span>
          )}

          <span className="tnum w-5 text-center text-sm font-bold text-[var(--color-muted)]">
            {entry.rank}
          </span>
          <Avatar
            name={entry.player.display_name}
            avatar={entry.player.avatar_url}
            size={34}
            registered={!!entry.player.user_id}
          />
          <Link
            to={`/jugadores/${entry.player_id}`}
            className="min-w-0 flex-1 truncate font-semibold"
          >
            {entry.is_winner && '🏆 '}
            {entry.player.display_name}
          </Link>
          <span className="text-right">
            <span className="game-ink tnum block text-2xl font-black leading-none">
              {entry.total}
            </span>
            <span className="block text-[11px] text-[var(--color-muted)]">
              {game?.scoreLabelShort ?? 'pts'}
            </span>
          </span>
        </header>

        {breakdown.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] px-4">
            {breakdown.map((row) => (
              <li key={row.field.key} className="flex items-center gap-3 py-2 text-sm">
                <span aria-hidden="true">{row.field.icon}</span>
                <span className="min-w-0 flex-1 truncate">{row.field.label}</span>
                <span className="tnum font-semibold">
                  {row.field.type === 'toggle' ? 'Sí' : row.value}
                </span>
                {row.contribution !== null && row.field.points !== undefined && (
                  <span className="tnum w-12 text-right text-xs text-[var(--color-muted)]">
                    {row.contribution >= 0 ? '+' : ''}
                    {row.contribution}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
