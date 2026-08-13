import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchGames } from '../games/registry'
import { PageHeader } from '../components/ui'
import { useGames } from '../context/GamesContext'
import type { GameDefinition } from '../games/types'

/**
 * Índice de chuletas. Es una ruta pública, así que los juegos del grupo solo
 * aparecen cuando hay sesión y grupo cargados; el catálogo integrado siempre.
 */
export function RulesIndexPage() {
  const { builtin, custom } = useGames()
  const [query, setQuery] = useState('')

  const official = useMemo(() => searchGames(builtin, query), [builtin, query])
  const ours = useMemo(() => searchGames(custom, query), [custom, query])
  const nothing = official.length === 0 && ours.length === 0

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Reglas"
        subtitle="Chuletas de una ojeada, disponibles sin conexión."
      />

      <input
        className="input"
        type="search"
        placeholder="Buscar juego…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {nothing && (
        <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
          Ningún juego se llama así.
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

function GameList({ title, games }: { title: string | null; games: GameDefinition[] }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="font-semibold">{title}</h2>}
      <ul className="flex flex-col gap-2">
        {games.map((game) => (
          <li key={game.slug}>
            <Link
              to={`/reglas/${game.slug}`}
              className="card flex items-center gap-3 p-3"
              style={{ borderLeft: `3px solid ${game.theme.primary}` }}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {game.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{game.name}</span>
                <span className="block truncate text-xs text-[var(--color-muted)]">
                  {game.rules ? game.tagline : 'Sin chuleta de reglas'}
                </span>
              </span>
              <span className="text-[var(--color-muted)]" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
