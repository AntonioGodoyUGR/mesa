import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GameCover } from '../components/GameCover'
import { GameTools } from '../components/GameTools'
import { LibraryToggle } from '../components/LibraryToggle'
import { MatchCard } from '../components/MatchCard'
import { RuleSheetView } from '../components/RuleSheetView'
import { EmptyState, ErrorNote, Spinner, Stat } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useGame, useGames } from '../context/GamesContext'
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

const TABS = [
  { id: 'reglas', label: 'Reglas' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'partidas', label: 'Partidas' },
] as const

type TabId = (typeof TABS)[number]['id']

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value)
}

/**
 * La ficha de un juego: qué es, cómo se os da y cómo se le da al resto de Table Tracker.
 *
 * Maqueta B del comparador (`public/mockups/ficha-juego.html`): un hero fijo arriba con
 * el botón «Crear partida» siempre a la vista, y debajo Reglas / Estadísticas / Partidas
 * en pestañas en vez de un scroll único. Es ruta pública: sin sesión se ven las reglas y
 * las estadísticas globales, y las tuyas invitan a entrar. Las de tu grupo salen de las
 * partidas que ya están en la caché (`computePlayerStats`, `computeLeaderboard`), y las
 * globales de la única llamada que no se puede calcular en el cliente, porque la RLS solo
 * deja ver lo de tu grupo.
 */
export function GamePage() {
  const { slug } = useParams()
  const { getGame } = useGames()
  // Por `useGame` y no por `getGame`: un juego de la cola larga del catálogo no viaja
  // dentro de la app, y esta pantalla se puede abrir por enlace directo.
  const { game, loading } = useGame(slug)
  const { group, players, me } = useGroup()
  const { user } = useAuth()
  const { statusOf, setStatus, saving } = useLibrary()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')
  const [tab, setTab] = useState<TabId>(isTabId(initialTab) ? initialTab : 'reglas')

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

  // Sin grupo no hay a dónde apuntar la partida: primero toca crear uno (o
  // entrar, si ni siquiera hay sesión). La etiqueta del botón no cambia.
  const ctaTo = group ? `/nueva/${game.slug}` : user ? '/grupo/nuevo' : '/login'

  return (
    <div
      className="flex flex-col gap-4"
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <GameCover game={game} size={88} />
          <div className="min-w-0 flex-1">
            <h1 className="game-ink nombre truncate text-xl">{game.name}</h1>
            <p className="truncate text-sm text-[var(--color-muted)]">{game.tagline}</p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {meta.map((entry) => (
            <li key={entry} className="chip">
              {entry}
            </li>
          ))}
        </ul>

        <Link to={ctaTo} className="btn btn-primary w-full text-base">
          ＋ Crear partida
        </Link>
      </header>

      <div role="tablist" aria-label="Secciones del juego" className="tabs">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`tab ${tab === entry.id ? 'tab-on game-wash' : ''}`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'reglas' && (
        <div className="flex flex-col gap-4">
          {/* Sin sesión no hay biblioteca donde guardarlo, igual que antes en la chuleta. */}
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

          {/* Los accesorios del juego son de lo poco que se puede usar sin haber
              jugado nada, así que van junto a las reglas. */}
          <GameTools game={game} />
        </div>
      )}

      {tab === 'estadisticas' && (
        <div className="flex flex-col gap-4">
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
                    <span className="tnum w-5 shrink-0 text-sm font-extrabold text-[var(--color-muted)]">
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
        </div>
      )}

      {tab === 'partidas' && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base">Vuestras últimas partidas</h2>

          {played.length === 0 ? (
            <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
              Todavía no hay ninguna partida de {game.name} apuntada.
            </p>
          ) : (
            <>
              {played.slice(0, 5).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
              {played.length > 5 && (
                <Link to="/partidas" className="btn btn-ghost">
                  Ver todas las partidas
                </Link>
              )}
            </>
          )}
        </section>
      )}

      {game.groupId && (
        <Link to={`/juegos/${game.slug}/editar`} className="btn btn-ghost">
          Editar este juego
        </Link>
      )}
    </div>
  )
}
