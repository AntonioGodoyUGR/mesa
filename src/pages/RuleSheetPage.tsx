import { Link, useParams } from 'react-router-dom'
import { RuleSheetView } from '../components/RuleSheetView'
import { EmptyState, Spinner } from '../components/ui'
import { useGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'

export function RuleSheetPage() {
  const { slug } = useParams()
  const { getGame, loading } = useGames()
  const game = getGame(slug)
  const { group } = useGroup()

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
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <span className="text-3xl leading-none" aria-hidden="true">
          {game.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-xl font-bold tracking-tight"
            style={{ color: game.theme.primary }}
          >
            {game.name}
          </h1>
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

      <RuleSheetView game={game} />

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
