import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  NO_FILTERS,
  difficultyLabel,
  filterGames,
  formatPlayTime,
  hasActiveFilters,
  type GameFilters,
} from '../games/filters'
import { GameCover } from '../components/GameCover'
import { GameFinder } from '../components/GameFinder'
import { ShowMore, usePaged } from '../components/ShowMore'
import { PageHeader } from '../components/ui'
import { useGames } from '../context/GamesContext'
import type { GameDefinition } from '../games/types'

/**
 * Índice de chuletas. Es una ruta pública, así que los juegos del grupo solo
 * aparecen cuando hay sesión y grupo cargados; el catálogo integrado siempre.
 */
export function RulesIndexPage() {
  const { builtin, custom } = useGames()
  const [filters, setFilters] = useState<GameFilters>(NO_FILTERS)

  const official = useMemo(() => filterGames(builtin, filters), [builtin, filters])
  const ours = useMemo(() => filterGames(custom, filters), [custom, filters])
  const nothing = official.length === 0 && ours.length === 0

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Reglas"
        subtitle="Chuletas de una ojeada, disponibles sin conexión."
      />

      <GameFinder
        filters={filters}
        onChange={setFilters}
        results={official.length + ours.length}
        total={builtin.length + custom.length}
      />

      {nothing && (
        <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
          {hasActiveFilters(filters)
            ? 'Ningún juego cumple lo que buscas.'
            : 'Todavía no hay ninguna chuleta.'}
        </p>
      )}

      {ours.length > 0 && <GameList title="Vuestros juegos" games={ours} />}
      {official.length > 0 && (
        <GameList title={ours.length > 0 ? 'Del catálogo' : null} games={official} />
      )}

      <p className="text-xs text-[var(--color-muted)]">
        Son resúmenes escritos por nosotros para consultar en la mesa, no los reglamentos
        oficiales.
      </p>
    </div>
  )
}

/** «2–4 jugadores · 30–45 min · Medio», saltándose lo que el juego no declare. */
function gameMeta(game: GameDefinition): string {
  return [
    `${game.minPlayers}–${game.maxPlayers} jugadores`,
    formatPlayTime(game.playTime),
    difficultyLabel(game.difficulty),
  ]
    .filter(Boolean)
    .join(' · ')
}

function GameList({ title, games }: { title: string | null; games: GameDefinition[] }) {
  // El índice de chuletas lista el catálogo entero: por tandas, como en la portada.
  const page = usePaged(games)

  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="display text-base">{title}</h2>}
      <ul className="flex flex-col gap-2">
        {page.shown.map((game) => (
          <li key={game.slug}>
            <Link
              to={`/reglas/${game.slug}`}
              className="card game-edge flex items-center gap-3 p-3"
              style={{ '--game': game.theme.primary } as CSSProperties}
            >
              <GameCover game={game} size={40} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{game.name}</span>
                <span className="block truncate text-xs text-[var(--color-muted)]">
                  {game.rules ? game.tagline : 'Sin chuleta de reglas'}
                </span>
                <span className="tnum block truncate text-xs text-[var(--color-muted)]">
                  {gameMeta(game)}
                </span>
              </span>
              <span className="text-[var(--color-muted)]" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <ShowMore hidden={page.hidden} onClick={page.showMore} />
    </section>
  )
}
