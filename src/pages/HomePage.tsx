import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { NO_FILTERS, hasActiveFilters, type GameFilters } from '../games/filters'
import { GameFinder } from '../components/GameFinder'
import { GameGrid } from '../components/GameGrid'
import { GridSizePicker } from '../components/GridSizePicker'
import { Logo } from '../components/Logo'
import { MatchCard } from '../components/MatchCard'
import { ShowMore } from '../components/ShowMore'
import { ErrorNote, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useCatalogSearch, useGames, useMatchGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { api, queryKeys } from '../lib/api'
import { getStoredTileSize, setStoredTileSize, type TileSize } from '../lib/tilesize'
import type { GameDefinition } from '../games/types'

/**
 * Pantalla principal: la rejilla de juegos ES el botón de «nueva partida».
 * Debajo, las últimas partidas del grupo.
 *
 * También es la puerta de entrada de quien llega sin cuenta. Entonces la misma
 * rejilla lleva a la ficha de cada juego en vez de al marcador —no hay grupo con
 * quien jugar todavía— y las secciones que hablan del grupo no se pintan.
 *
 * Aquí hay tres rejillas del mismo aspecto haciendo dos trabajos distintos. Las de
 * arriba —«Los que más jugáis» y «Vuestros juegos»— son un lanzador: seis juegos
 * como mucho, se tocan a diario y se reconocen por la portada, así que van siempre
 * grandes. La de abajo es un catálogo de cientos por el que se navega leyendo
 * nombres, y ahí el tamaño lo decide quien mira, con el mando del titular.
 */
export function HomePage() {
  const { group, loading: groupLoading } = useGroup()
  const { user, loading: authLoading } = useAuth()
  const { custom, getGame } = useGames()
  const [filters, setFilters] = useState<GameFilters>(NO_FILTERS)
  const [tileSize, setTileSize] = useState<TileSize>(getStoredTileSize)

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data])
  const recent = matches.slice(0, 5)

  // Los juegos de las partidas, resueltos de una tacada: los de la cola larga del
  // catálogo no viajan en la app, y una tarjeta sin el nombre del juego no vale nada.
  useMatchGames(matches)

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
      .map(([slug]) => getGame(slug))
      .filter((game): game is GameDefinition => !!game)
  }, [matches, getGame])

  const searching = hasActiveFilters(filters)

  // El catálogo ya no cabe en la app: se pide al servidor por tandas, con los mismos
  // criterios que pinta el buscador. Sin nada puesto, lo que llega es el catálogo por
  // orden de popularidad, que es justo la rejilla de abajo.
  const catalogue = useCatalogSearch(filters, { groupId: group?.id })

  // Cada juego sale una sola vez: lo que ya está arriba no se repite abajo. Solo
  // mientras no se busca — buscando, lo que vale es lo que se ha pedido.
  const favouriteSlugs = new Set(favourites.map((game) => game.slug))
  const ourSlugs = new Set(custom.map((game) => game.slug))
  const ours = custom.filter((game) => !favouriteSlugs.has(game.slug))
  const rest = searching
    ? catalogue.games
    : catalogue.games.filter(
        (game) => !favouriteSlugs.has(game.slug) && !ourSlugs.has(game.slug),
      )

  // El tamaño elegido se queda en este navegador, como el tema: es de quien mira,
  // no del grupo, y no tiene por qué viajar a la otra pantalla.
  const chooseTileSize = (size: TileSize) => {
    setTileSize(size)
    setStoredTileSize(size)
  }

  // Media portada depende de si hay grupo. Mientras no se sepa no se pinta: es
  // la espera que antes hacían los guardianes de la ruta, no una nueva.
  if (authLoading || groupLoading) return <Spinner label="Comprobando sesión…" />

  // Tocar un juego siempre abre su ficha: ahí están las reglas, las
  // estadísticas y el botón «Crear partida», con o sin grupo.
  const tileLink = (game: GameDefinition) => `/juegos/${game.slug}`

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center text-[var(--color-brand)]">
        <Logo stacked animated className="text-3xl sm:text-4xl" />
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h1 className="display text-xl">{group ? 'Nueva partida' : 'Juegos'}</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted)]">
            {group
              ? 'Elige un juego para ver su ficha y crear una partida.'
              : 'Reglas y estadísticas de cada juego, sin cuenta.'}
          </p>
        </div>

        <GameFinder
          filters={filters}
          onChange={setFilters}
          placeholder="Buscar entre los juegos…"
          results={catalogue.games.length}
          more={catalogue.more}
        />

        <ErrorNote error={catalogue.error} />

        {searching ? (
          catalogue.loading ? (
            <Spinner label="Buscando…" />
          ) : rest.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="display text-base">Resultados</h2>
                <GridSizePicker value={tileSize} onChange={chooseTileSize} />
              </div>
              <GameGrid games={rest} to={tileLink} size={tileSize} />
              <ShowMore
                more={catalogue.more}
                loading={catalogue.loadingMore}
                onClick={catalogue.showMore}
              />
            </>
          ) : (
            <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
              Ningún juego cumple lo que buscas.{' '}
              {group && (
                <Link to="/juegos/nuevo" className="font-medium text-[var(--color-brand)]">
                  Créalo tú
                </Link>
              )}
            </p>
          )
        ) : (
          <>
            {favourites.length > 0 && (
              <>
                <h2 className="display text-base">Los que más jugáis</h2>
                <GameGrid games={favourites} to={tileLink} />
              </>
            )}

            {/* Crear un juego es de un grupo: sin él no habría dónde guardarlo. */}
            {group && (
              <>
                <h2 className="display text-base">Vuestros juegos</h2>
                <GameGrid games={ours} to={tileLink}>
                  <Link
                    to="/juegos/nuevo"
                    className="card flex flex-col items-center justify-center gap-2 border-dashed p-4 text-center transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                  >
                    <span className="text-3xl leading-none" aria-hidden="true">
                      ＋
                    </span>
                    <span className="text-sm font-semibold">Crear juego</span>
                    <span className="text-xs text-[var(--color-muted)]">
                      Con vuestras reglas
                    </span>
                  </Link>
                </GameGrid>
              </>
            )}

            <div className="flex items-center justify-between gap-3">
              <h2 className="display text-base">
                {group ? 'Del catálogo' : 'Todos los juegos'}
              </h2>
              <GridSizePicker value={tileSize} onChange={chooseTileSize} />
            </div>
            {catalogue.loading ? (
              <Spinner label="Cargando el catálogo…" />
            ) : (
              <>
                <GameGrid games={rest} to={tileLink} size={tileSize} />
                <ShowMore
                  more={catalogue.more}
                  loading={catalogue.loadingMore}
                  onClick={catalogue.showMore}
                />
              </>
            )}
          </>
        )}
      </section>

      {group ? (
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="display text-base">Últimas partidas</h2>
            <Link
              to="/partidas"
              className="text-sm font-medium text-[var(--color-brand)]"
            >
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
      ) : (
        <section className="card flex flex-col items-center gap-3 px-4 py-6 text-center">
          <h2 className="display text-base">Apuntad vuestras partidas</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Con un grupo, cada juego se convierte en un marcador: resultados, récords y
            quién gana más.
          </p>
          {/* Sin sesión, el guardián de `grupo/nuevo` pasa antes por el login y
              devuelve aquí; no hace falta bifurcar el destino. */}
          <Link to="/grupo/nuevo" className="btn btn-primary">
            {user ? 'Crear o unirse a un grupo' : 'Crear cuenta'}
          </Link>
        </section>
      )}
    </div>
  )
}
