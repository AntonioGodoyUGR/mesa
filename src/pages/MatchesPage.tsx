import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MatchCard } from '../components/MatchCard'
import { EmptyState, ErrorNote, PageHeader, Spinner } from '../components/ui'
import { useGames, useMatchGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { api, queryKeys } from '../lib/api'

export function MatchesPage() {
  const { group } = useGroup()
  const { getGame } = useGames()
  const [filter, setFilter] = useState<string | null>(null)

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data])
  useMatchGames(matches) // los juegos de todas ellas, en una sola petición

  const shown = filter ? matches.filter((match) => match.game_slug === filter) : matches

  // Un chip por juego que el grupo haya jugado de verdad, ordenados por frecuencia:
  // con el catálogo entero saldrían más de veinte y la fila se haría inservible.
  const chips = useMemo(() => {
    const counts = new Map<string, number>()
    for (const match of matches) {
      counts.set(match.game_slug, (counts.get(match.game_slug) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => ({ slug, game: getGame(slug) }))
  }, [matches, getGame])

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Partidas"
        subtitle={`${matches.length} apuntadas en ${group?.name ?? 'el grupo'}`}
      />

      <div className="scroll-x -mx-4 flex gap-2 px-4 pb-1">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>
          Todas
        </FilterChip>
        {chips.map(({ slug, game }) => (
          <FilterChip key={slug} active={filter === slug} onClick={() => setFilter(slug)}>
            <span aria-hidden="true">{game?.icon ?? '🎲'}</span> {game?.name ?? slug}
          </FilterChip>
        ))}
      </div>

      <ErrorNote error={matchesQuery.error} />
      {matchesQuery.isLoading && <Spinner />}

      {!matchesQuery.isLoading && shown.length === 0 && (
        <EmptyState
          icon="🎲"
          title="Ninguna partida todavía"
          description="Apunta el resultado de vuestra próxima partida y aparecerá aquí."
          action={
            <Link to="/" className="btn btn-primary">
              Nueva partida
            </Link>
          }
        />
      )}

      <div className="grid gap-2 lg:grid-cols-2">
        {shown.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`chip shrink-0 ${active ? 'chip-on' : ''}`}
    >
      {children}
    </button>
  )
}
