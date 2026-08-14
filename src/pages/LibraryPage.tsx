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
import { LibraryToggle } from '../components/LibraryToggle'
import { ShowMore, usePaged } from '../components/ShowMore'
import { ErrorNote, PageHeader, Spinner } from '../components/ui'
import { useGames } from '../context/GamesContext'
import { useLibrary } from '../context/LibraryContext'
import { LIBRARY_STATUSES, libraryGames } from '../lib/library'
import type { GameDefinition } from '../games/types'
import type { LibraryStatus } from '../lib/types'

/** Además de las dos secciones de la biblioteca, el catálogo entero para ir marcando. */
type Tab = LibraryStatus | 'all'

/**
 * Biblioteca personal: qué juegos has comprado y cuáles tienes en la lista de deseos.
 *
 * Es de la cuenta, no del grupo, así que la pantalla no depende del grupo activo.
 * Las tres pestañas pintan la MISMA lista de filas —portada, datos y los dos
 * botones—: marcar un juego desde «Todos» y desmarcarlo desde «En casa» es el
 * mismo gesto, y así no hay dos maneras distintas de hacer lo mismo.
 */
export function LibraryPage() {
  const { games, loading: gamesLoading } = useGames()
  const { entries, counts, statusOf, setStatus, loading, saving, error } = useLibrary()
  const [tab, setTab] = useState<Tab>('owned')
  const [filters, setFilters] = useState<GameFilters>(NO_FILTERS)

  const listed = useMemo(
    () => (tab === 'all' ? games : libraryGames(games, entries, tab)),
    [tab, games, entries],
  )
  const shown = useMemo(() => filterGames(listed, filters), [listed, filters])
  // La pestaña «Todos» es el catálogo entero: se enseña por tandas.
  const page = usePaged(shown)

  const tabs: { id: Tab; label: string; count: number | null }[] = [
    { id: 'owned', label: 'En casa', count: counts.owned },
    { id: 'wishlist', label: 'Deseados', count: counts.wishlist },
    { id: 'all', label: 'Todos', count: null },
  ]

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tu biblioteca"
        subtitle="Lo que tienes en casa y lo que te falta por comprar."
      />

      <section className="grid grid-cols-2 gap-2">
        {LIBRARY_STATUSES.map((info) => (
          <button
            key={info.id}
            type="button"
            onClick={() => setTab(info.id)}
            aria-label={`${info.title}: ${info.id === 'owned' ? counts.owned : counts.wishlist} juegos`}
            className="card px-3 py-4 text-center transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <span className="block text-xl leading-none" aria-hidden="true">
              {info.icon}
            </span>
            <span className="tnum mt-1 block text-2xl font-black leading-none">
              {info.id === 'owned' ? counts.owned : counts.wishlist}
            </span>
            <span className="mt-1 block text-[11px] text-[var(--color-muted)]">
              {info.title}
            </span>
          </button>
        ))}
      </section>

      <div role="group" aria-label="Qué parte de la biblioteca" className="flex gap-2">
        {tabs.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={tab === option.id}
            onClick={() => setTab(option.id)}
            className={`chip tnum flex-1 justify-center ${tab === option.id ? 'chip-on' : ''}`}
          >
            {/* Un solo nodo de texto: partirlo deja el nombre accesible sin el espacio. */}
            {option.count === null ? option.label : `${option.label} (${option.count})`}
          </button>
        ))}
      </div>

      <GameFinder
        filters={filters}
        onChange={setFilters}
        placeholder="Buscar en la biblioteca…"
        results={shown.length}
        total={listed.length}
      />

      <ErrorNote error={error} />

      {(loading || gamesLoading) && <Spinner label="Cargando tu biblioteca…" />}

      {!loading && !gamesLoading && shown.length === 0 && (
        <EmptyLibrary tab={tab} filtered={hasActiveFilters(filters)} onSeeAll={() => setTab('all')} />
      )}

      <ul className="flex flex-col gap-2">
        {page.shown.map((game) => (
          <li key={game.slug}>
            <GameRow
              game={game}
              status={statusOf(game.slug)}
              onChange={(next) => setStatus(game.slug, next)}
              disabled={saving}
            />
          </li>
        ))}
      </ul>

      <ShowMore hidden={page.hidden} onClick={page.showMore} />

      <p className="text-xs text-[var(--color-muted)]">
        La biblioteca es tuya, no del grupo: te acompaña a todos los grupos en los que
        juegues y solo la ves tú.
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

function GameRow({
  game,
  status,
  onChange,
  disabled,
}: {
  game: GameDefinition
  status: LibraryStatus | undefined
  onChange: (next: LibraryStatus | null) => void
  disabled: boolean
}) {
  return (
    <div
      className="card game-edge flex items-center gap-3 p-3"
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      {/* El nombre lleva a su chuleta; los botones quedan fuera del enlace a propósito. */}
      <Link to={`/reglas/${game.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
        <GameCover game={game} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{game.name}</span>
          <span className="tnum block truncate text-xs text-[var(--color-muted)]">
            {gameMeta(game)}
          </span>
        </span>
      </Link>

      <LibraryToggle
        gameName={game.name}
        status={status}
        onChange={onChange}
        disabled={disabled}
        compact
      />
    </div>
  )
}

function EmptyLibrary({
  tab,
  filtered,
  onSeeAll,
}: {
  tab: Tab
  filtered: boolean
  onSeeAll: () => void
}) {
  if (filtered) {
    return (
      <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
        Ningún juego cumple lo que buscas.
      </p>
    )
  }

  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="text-4xl" aria-hidden="true">
        {tab === 'wishlist' ? '⭐' : '📦'}
      </span>
      <p className="text-sm text-[var(--color-muted)]">
        {tab === 'wishlist'
          ? 'Todavía no has apuntado ningún juego en la lista de deseos.'
          : 'Todavía no has marcado ningún juego como comprado.'}
      </p>
      <button type="button" className="btn btn-primary" onClick={onSeeAll}>
        Ver todos los juegos
      </button>
    </div>
  )
}
