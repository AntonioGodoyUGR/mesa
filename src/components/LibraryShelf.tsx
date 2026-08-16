import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { GameCover } from './GameCover'
import { LIBRARY_STATUSES, libraryGames, type LibraryStatusInfo } from '../lib/library'
import type { GameDefinition } from '../games/types'
import type { LibraryEntry } from '../lib/types'

/**
 * Tu biblioteca resumida: los juegos que tienes en casa y los que quieres.
 *
 * En `/biblioteca` se marca, se busca y se filtra; aquí solo se mira, así que se
 * enseñan los últimos apuntados de cada estante y el resto se deja para esa
 * pantalla. Pinta las secciones que declare `LIBRARY_STATUSES`, igual que los dos
 * botones, y no sabe de comprados ni de deseados en concreto.
 *
 * La biblioteca cuelga de la cuenta y es privada, así que solo tiene sentido en el
 * perfil de quien tiene la sesión iniciada: eso lo decide quien lo pinta.
 */
const SHELF = 6

export function LibraryShelf({
  games,
  entries,
}: {
  /** El catálogo con el que resolver cada slug (el del grupo incluido). */
  games: GameDefinition[]
  entries: LibraryEntry[]
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="display text-base">Tu biblioteca</h2>
        <Link to="/biblioteca" className="text-sm font-medium text-[var(--color-brand)]">
          Ver todo
        </Link>
      </div>

      {LIBRARY_STATUSES.map((info) => (
        <Shelf key={info.id} info={info} games={libraryGames(games, entries, info.id)} />
      ))}
    </section>
  )
}

function Shelf({ info, games }: { info: LibraryStatusInfo; games: GameDefinition[] }) {
  const rest = games.length - SHELF

  return (
    <div className="flex flex-col gap-2">
      <h3 className="flex items-baseline gap-2 text-sm">
        <span aria-hidden="true">{info.icon}</span>
        <span className="overline">{info.title}</span>
        <span className="tnum text-xs text-[var(--color-muted)]">({games.length})</span>
      </h3>

      {games.length === 0 ? (
        <p className="card px-4 py-4 text-center text-sm text-[var(--color-muted)]">
          {info.empty}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {games.slice(0, SHELF).map((game) => (
            <li key={game.slug}>
              <Link
                to={`/juegos/${game.slug}`}
                className="card game-edge flex items-center gap-2 p-2"
                style={{ '--game': game.theme.primary } as CSSProperties}
              >
                <GameCover game={game} size={32} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                  {game.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {rest > 0 && (
        <Link to="/biblioteca" className="text-xs text-[var(--color-muted)] underline">
          Y {rest} más en tu biblioteca
        </Link>
      )}
    </div>
  )
}
