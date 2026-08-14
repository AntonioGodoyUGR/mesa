import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GameCover } from '../components/GameCover'
import { GameTools } from '../components/GameTools'
import { LibraryToggle } from '../components/LibraryToggle'
import { MatchCard } from '../components/MatchCard'
import { EmptyState, ErrorNote, Spinner, Stat } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { useLibrary } from '../context/LibraryContext'
import { difficultyIcon, difficultyLabel, formatPlayTime } from '../games/filters'
import { api, queryKeys } from '../lib/api'
import {
  computeLeaderboard,
  computePlayerStats,
  formatAverage,
  formatDate,
  formatPercent,
  matchesOfGame,
} from '../lib/stats'

/**
 * La ficha de un juego: qué es, cómo se os da y cómo se le da al resto de Table Tracker.
 *
 * Es ruta pública, como la chuleta de reglas: sin sesión se ve la parte de arriba
 * y las estadísticas globales, y las tuyas invitan a entrar. Las de tu grupo salen
 * de las partidas que ya están en la caché (`computePlayerStats`,
 * `computeLeaderboard`), y las globales de la única llamada que no se puede
 * calcular en el cliente, porque la RLS solo deja ver lo de tu grupo.
 */
export function GamePage() {
  const { slug } = useParams()
  const { getGame, loading } = useGames()
  const game = getGame(slug)
  const { group, players, me } = useGroup()
  const { user } = useAuth()
  const { statusOf, setStatus, saving } = useLibrary()

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  const globalQuery = useQuery({
    queryKey: queryKeys.gameStats(slug ?? ''),
    queryFn: () => api.getGameStats(slug!),
    enabled: !!slug,
  })

  if (loading) return <Spinner />

  if (!game) {
    return (
      <EmptyState
        icon="🔍"
        title="No tenemos ese juego"
        description="Puede que lo haya creado otro grupo, o que el enlace esté mal."
        action={
          <Link to="/" className="btn btn-primary">
            Ver todos los juegos
          </Link>
        }
      />
    )
  }

  const played = matchesOfGame(matchesQuery.data ?? [], game.slug)
  const mine = me ? computePlayerStats(played, me.id, getGame) : null
  const record = mine?.byGame[0] ?? null
  const table = computeLeaderboard(played, players, getGame).filter(
    (row) => row.stats.played > 0,
  )
  const global = globalQuery.data

  const meta = [
    `${game.minPlayers}–${game.maxPlayers} jugadores`,
    formatPlayTime(game.playTime),
    difficultyLabel(game.difficulty) &&
      `${difficultyIcon(game.difficulty)} ${difficultyLabel(game.difficulty)}`,
    game.scoreLabel,
  ].filter((entry): entry is string => !!entry)

  return (
    <div
      className="flex flex-col gap-5"
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      <header className="flex items-center gap-3">
        <GameCover game={game} size={64} />
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

      <ul className="flex flex-wrap gap-1.5">
        {meta.map((entry) => (
          <li key={entry} className="chip">
            {entry}
          </li>
        ))}
      </ul>

      {/* Sin sesión no hay biblioteca donde guardarlo, igual que en la chuleta. */}
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

      {/* Los accesorios del juego son de lo poco que se puede usar aquí sin haber
          jugado nada, así que van antes que cualquier estadística. */}
      <GameTools game={game} />

      <section className="flex flex-col gap-2">
        <h2 className="display text-base">Tus partidas</h2>

        {!mine ? (
          <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
            {user
              ? 'Entra en un grupo para llevar la cuenta de tus partidas.'
              : 'Inicia sesión para ver cómo se te da este juego.'}{' '}
            <Link
              to={user ? '/grupo/nuevo' : '/login'}
              className="font-medium text-[var(--color-brand)]"
            >
              {user ? 'Crear o unirse a un grupo' : 'Entrar'}
            </Link>
          </p>
        ) : mine.played === 0 ? (
          <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
            Todavía no has jugado ninguna partida a {game.name}.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Stat value={String(mine.played)} label="Partidas" />
              <Stat value={String(mine.wins)} label="Victorias" />
              <Stat value={formatPercent(mine.winRate)} label="Ratio" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat
                value={record?.bestTotal === null ? '—' : String(record?.bestTotal)}
                label="Tu récord"
                hint={game.winnerRule === 'lowest' ? 'Cuanto menos, mejor' : undefined}
              />
              <Stat
                value={formatAverage(record?.averageTotal ?? null)}
                label={`Media de ${game.scoreLabelShort}`}
              />
            </div>
            {mine.currentStreak > 1 && (
              <p className="note">🔥 Llevas {mine.currentStreak} victorias seguidas.</p>
            )}
          </>
        )}
      </section>

      {table.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base">En vuestro grupo</h2>
          <ul className="card divide-y divide-[var(--color-border)]">
            {table.map((row, index) => (
              <li key={row.player.id} className="flex items-center gap-3 px-4 py-3">
                <span className="tnum w-5 shrink-0 text-sm font-black text-[var(--color-muted)]">
                  {index + 1}
                </span>
                <Link
                  to={`/jugadores/${row.player.id}`}
                  className="min-w-0 flex-1 truncate text-sm font-semibold"
                >
                  {row.player.display_name}
                </Link>
                <span className="tnum shrink-0 text-right text-xs text-[var(--color-muted)]">
                  {row.stats.wins}/{row.stats.played} ·{' '}
                  {formatPercent(row.stats.winRate)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="display text-base">En toda la app</h2>

        {globalQuery.isLoading && <Spinner label="Contando partidas…" />}
        <ErrorNote error={globalQuery.error} />

        {global &&
          (global.matches === 0 ? (
            <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
              Nadie ha apuntado todavía una partida a {game.name}. Podéis ser los
              primeros.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Stat value={String(global.matches)} label="Partidas" />
                <Stat value={String(global.groups)} label="Grupos" />
                <Stat value={String(global.players)} label="Jugadores" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat
                  value={formatAverage(global.averagePlayers)}
                  label="En la mesa"
                  hint="De media"
                />
                <Stat
                  value={formatAverage(global.averageTotal)}
                  label={`Media de ${game.scoreLabelShort}`}
                />
                <Stat
                  value={global.bestTotal === null ? '—' : String(global.bestTotal)}
                  label="Récord"
                />
              </div>
              {global.lastPlayedAt && (
                <p className="text-center text-xs text-[var(--color-muted)]">
                  La última, el {formatDate(global.lastPlayedAt)}.
                </p>
              )}
            </>
          ))}
      </section>

      {played.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base">Vuestras últimas partidas</h2>
          {played.slice(0, 5).map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {played.length > 5 && (
            <Link to="/partidas" className="btn btn-ghost">
              Ver todas las partidas
            </Link>
          )}
        </section>
      )}

      <div className="flex flex-col gap-2">
        <Link to={`/reglas/${game.slug}`} className="btn btn-ghost">
          📖 Chuleta de reglas
        </Link>
        {game.groupId && (
          <Link to={`/juegos/${game.slug}/editar`} className="btn btn-ghost">
            Editar este juego
          </Link>
        )}
      </div>
    </div>
  )
}
