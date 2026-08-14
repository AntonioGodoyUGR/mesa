import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { NO_FILTERS, filterGames, hasActiveFilters, type GameFilters } from '../games/filters'
import { GameFinder } from '../components/GameFinder'
import { GameTile } from '../components/GameTile'
import { MatchCard } from '../components/MatchCard'
import { ShowMore, usePaged } from '../components/ShowMore'
import { Spinner } from '../components/ui'
import { useGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { api, queryKeys } from '../lib/api'
import type { GameDefinition } from '../games/types'

/**
 * Pantalla principal: la rejilla de juegos ES el botón de «nueva partida».
 * Debajo, las últimas partidas del grupo.
 */
export function HomePage() {
  const { group } = useGroup()
  const { games, builtin, custom } = useGames()
  const [filters, setFilters] = useState<GameFilters>(NO_FILTERS)

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data])
  const recent = matches.slice(0, 5)

  // Con más de veinte juegos la rejilla entera no es útil: arriba van los que el
  // grupo juega de verdad, y el resto queda debajo o se busca por nombre.
  const favourites = useMemo(() => {
    const counts = new Map<string, number>()
    for (const match of matches) {
      counts.set(match.game_slug, (counts.get(match.game_slug) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slug]) => games.find((game) => game.slug === slug))
      .filter((game): game is GameDefinition => !!game)
  }, [matches, games])

  // Cada juego sale una sola vez: lo que ya está arriba no se repite abajo.
  const favouriteSlugs = new Set(favourites.map((game) => game.slug))
  const ours = custom.filter((game) => !favouriteSlugs.has(game.slug))
  const rest = builtin.filter((game) => !favouriteSlugs.has(game.slug))

  const found = useMemo(() => filterGames(games, filters), [games, filters])
  const searching = hasActiveFilters(filters)

  // El catálogo son cientos de juegos: se enseñan por tandas, tanto los resultados de
  // una búsqueda como la rejilla de abajo.
  const results = usePaged(found)
  const catalogue = usePaged(rest)

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Nueva partida</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            Elige el juego para apuntar el resultado.
          </p>
        </div>

        <GameFinder
          filters={filters}
          onChange={setFilters}
          placeholder="Buscar entre los juegos…"
          results={found.length}
          total={games.length}
        />

        {searching ? (
          found.length > 0 ? (
            <>
              <GameGrid games={results.shown} />
              <ShowMore hidden={results.hidden} onClick={results.showMore} />
            </>
          ) : (
            <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
              Ningún juego cumple lo que buscas.{' '}
              <Link to="/juegos/nuevo" className="font-medium text-[var(--color-brand)]">
                Créalo tú
              </Link>
              .
            </p>
          )
        ) : (
          <>
            {favourites.length > 0 && (
              <>
                <h2 className="font-bold tracking-tight">Los que más jugáis</h2>
                <GameGrid games={favourites} />
              </>
            )}

            <h2 className="font-bold tracking-tight">Vuestros juegos</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ours.map((game) => (
                <GameTile key={game.slug} game={game} to={`/nueva/${game.slug}`} />
              ))}
              <Link
                to="/juegos/nuevo"
                className="card flex flex-col items-center justify-center gap-2 border-dashed p-4 text-center transition-transform active:scale-[0.98]"
              >
                <span className="text-3xl leading-none" aria-hidden="true">
                  ＋
                </span>
                <span className="text-sm font-semibold">Crear juego</span>
                <span className="text-[11px] text-[var(--color-muted)]">
                  Con vuestras reglas
                </span>
              </Link>
            </div>

            <h2 className="font-bold tracking-tight">
              {favourites.length > 0 ? 'Del catálogo' : 'Todos los juegos'}
            </h2>
            <GameGrid games={catalogue.shown} />
            <ShowMore hidden={catalogue.hidden} onClick={catalogue.showMore} />
          </>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold tracking-tight">Últimas partidas</h2>
          <Link to="/partidas" className="text-sm font-medium text-[var(--color-brand)]">
            Ver todas
          </Link>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {matchesQuery.isLoading && <Spinner label="Cargando partidas…" />}

          {!matchesQuery.isLoading && recent.length === 0 && (
            <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
              Todavía no hay ninguna partida apuntada. Toca un juego para empezar.
            </p>
          )}

          {recent.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </div>
  )
}

function GameGrid({ games }: { games: GameDefinition[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {games.map((game) => (
        <GameTile key={game.slug} game={game} to={`/nueva/${game.slug}`} />
      ))}
    </div>
  )
}
