import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { computeLeaderboard, formatPercent } from '../lib/stats'
import { Avatar } from '../components/Avatar'
import { ErrorNote, PageHeader, Spinner } from '../components/ui'
import { useGames, useMatchGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { api, queryKeys } from '../lib/api'

const MEDALS = ['🥇', '🥈', '🥉']

export function PlayersPage() {
  const { group, groups, setGroupId, players, me } = useGroup()
  const { getGame } = useGames()

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  // La clasificación resuelve el juego de cada partida, así que se piden todos juntos.
  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data])
  useMatchGames(matches)

  const board = computeLeaderboard(matches, players, getGame)

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Jugadores" subtitle="Clasificación por victorias" />

      {groups.length > 1 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base">Cambiar de grupo</h2>
          <div className="flex flex-wrap gap-2">
            {groups.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setGroupId(candidate.id)}
                className={`chip ${candidate.id === group?.id ? 'chip-on' : ''}`}
              >
                {candidate.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <Link to="/grupo/nuevo" className="btn btn-ghost">
        Crear o unirme a otro grupo
      </Link>

      <ErrorNote error={matchesQuery.error} />
      {matchesQuery.isLoading && <Spinner />}

      <ul className="card divide-y divide-[var(--color-border)]">
        {board.map(({ player, stats }, index) => (
          <li key={player.id}>
            <Link to={`/jugadores/${player.id}`} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 text-center text-sm">
                {MEDALS[index] ?? (
                  <span className="tnum text-[var(--color-muted)]">{index + 1}</span>
                )}
              </span>

              <Avatar
                name={player.display_name}
                avatar={player.avatar_url}
                size={36}
                registered={!!player.user_id}
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  {player.display_name}
                  {player.id === me?.id && (
                    <span className="font-normal text-[var(--color-muted)]"> · tú</span>
                  )}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {stats.played} partidas · {formatPercent(stats.winRate)} de victorias
                </span>
              </span>

              <span className="text-right">
                <span className="tnum block text-lg font-extrabold leading-none">
                  {stats.wins}
                </span>
                <span className="block text-xs text-[var(--color-muted)]">
                  victorias
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
