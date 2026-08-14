import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GameCover } from '../components/GameCover'
import { LibraryToggle } from '../components/LibraryToggle'
import { RuleSheetView } from '../components/RuleSheetView'
import { EmptyState, Spinner } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { useLibrary } from '../context/LibraryContext'

export function RuleSheetPage() {
  const { slug } = useParams()
  const { getGame, loading } = useGames()
  const game = getGame(slug)
  const { group } = useGroup()
  const { user } = useAuth()
  const { statusOf, setStatus, saving } = useLibrary()

  if (loading) return <Spinner />

  if (!game) {
    return (
      <EmptyState
        icon="📖"
        title="No tenemos esa chuleta"
        action={
          <Link to="/reglas" className="btn btn-primary">
            Ver reglas
          </Link>
        }
      />
    )
  }

  return (
    <div
      className="flex flex-col gap-4"
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      <header className="flex items-center gap-3">
        <GameCover game={game} size={52} />
        <div className="min-w-0 flex-1">
          <h1 className="game-ink display truncate text-xl">{game.name}</h1>
          <p className="truncate text-sm text-[var(--color-muted)]">{game.tagline}</p>
        </div>
        {group && (
          <Link
            to={`/nueva/${game.slug}`}
            className="btn btn-primary shrink-0 px-3 py-1.5 text-sm"
          >
            Jugar
          </Link>
        )}
      </header>

      {/* Sin sesión no hay biblioteca donde guardarlo: la chuleta es ruta pública. */}
      {user && (
        <section className="card flex flex-wrap items-center gap-3 p-3">
          <span className="min-w-0 flex-1 text-sm text-[var(--color-muted)]">
            ¿Lo tienes en casa?{' '}
            <Link to="/biblioteca" className="font-medium text-[var(--color-brand)]">
              Tu biblioteca
            </Link>
          </span>
          <LibraryToggle
            gameName={game.name}
            status={statusOf(game.slug)}
            onChange={(next) => setStatus(game.slug, next)}
            disabled={saving}
          />
        </section>
      )}

      <RuleSheetView game={game} />

      <Link to={`/juegos/${game.slug}`} className="btn btn-ghost">
        📊 Estadísticas de {game.name}
      </Link>

      {game.groupId && (
        <Link to={`/juegos/${game.slug}/editar`} className="btn btn-ghost">
          Editar este juego
        </Link>
      )}

      <Link to="/reglas" className="btn btn-ghost">
        Otras reglas
      </Link>
    </div>
  )
}
