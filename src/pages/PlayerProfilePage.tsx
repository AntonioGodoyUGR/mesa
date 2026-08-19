import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  computeHeadToHead,
  computePlayerStats,
  formatAverage,
  formatPercent,
  matchesOf,
} from '../lib/stats'
import { MatchCard } from '../components/MatchCard'
import { Avatar } from '../components/Avatar'
import { AvatarEditor } from '../components/AvatarEditor'
import { LibraryShelf } from '../components/LibraryShelf'
import { EmptyState, ErrorNote, Spinner, Stat } from '../components/ui'
import { useGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { useLibrary } from '../context/LibraryContext'
import { api, queryKeys } from '../lib/api'
import { hasAvatar, parseAvatar, serializeAvatar, type AvatarLook } from '../lib/avatar'

export function PlayerProfilePage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { group, players, me } = useGroup()
  const { games, getGame } = useGames()
  const { entries } = useLibrary()

  // Mientras se compone, el muñeco vive aquí; al guardar se convierte en la cadena
  // que va a `avatar_url` y el borrador desaparece.
  const [draft, setDraft] = useState<AvatarLook | null>(null)

  const matchesQuery = useQuery({
    queryKey: queryKeys.matches(group?.id ?? ''),
    queryFn: () => api.listMatches(group!.id),
    enabled: !!group,
  })

  const player = players.find((candidate) => candidate.id === id)

  const saveAvatar = useMutation({
    mutationFn: (value: string | null) => api.setPlayerAvatar(player!.id, value),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.players(group!.id) })
      setDraft(null)
    },
  })

  if (!player) {
    return (
      <EmptyState
        icon="🔍"
        title="Jugador no encontrado"
        action={
          <Link to="/jugadores" className="btn btn-primary">
            Ver jugadores
          </Link>
        }
      />
    )
  }

  const matches = matchesQuery.data ?? []
  const stats = computePlayerStats(matches, player.id, getGame)
  const own = matchesOf(matches, player.id)
  const head = computeHeadToHead(matches, player.id, me?.id ?? null)
  // La biblioteca es de la cuenta y solo la ve su dueño: en el perfil de otro
  // jugador —o en el de un invitado sin cuenta— no hay nada que enseñar.
  const isMe = !!me && me.id === player.id

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-4">
        <Avatar
          name={player.display_name}
          avatar={player.avatar_url}
          size={56}
          registered={!!player.user_id}
        />
        <div className="min-w-0 flex-1">
          <h1 className="nombre truncate text-xl">
            {player.display_name}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {player.user_id ? 'Con cuenta' : 'Invitado sin cuenta'}
            {stats.currentStreak > 1 && ` · 🔥 ${stats.currentStreak} seguidas`}
          </p>
        </div>
        {/* El avatar de cualquiera del grupo lo puede cambiar cualquiera del grupo,
            igual que el nombre: los invitados no tienen cuenta con la que hacerlo. */}
        <button
          type="button"
          className="btn btn-ghost shrink-0 px-3 py-1.5 text-sm"
          onClick={() =>
            setDraft(
              draft ? null : parseAvatar(player.avatar_url, player.display_name),
            )
          }
        >
          {draft ? 'Cerrar' : '🎨 Avatar'}
        </button>
      </header>

      {draft && (
        <section className="card flex flex-col gap-4 p-4">
          <AvatarEditor look={draft} onChange={setDraft} />

          <ErrorNote error={saveAvatar.error} />

          <button
            type="button"
            className="btn btn-primary"
            disabled={saveAvatar.isPending}
            onClick={() => saveAvatar.mutate(serializeAvatar(draft))}
          >
            {saveAvatar.isPending ? 'Guardando…' : 'Guardar avatar'}
          </button>

          {hasAvatar(player.avatar_url) && (
            <button
              type="button"
              className="btn btn-ghost text-[var(--color-danger)]"
              disabled={saveAvatar.isPending}
              onClick={() => saveAvatar.mutate(null)}
            >
              Volver al de siempre
            </button>
          )}
        </section>
      )}

      {matchesQuery.isLoading && <Spinner />}

      <section className="grid grid-cols-3 gap-2">
        <Stat value={String(stats.played)} label="Partidas" />
        <Stat value={String(stats.wins)} label="Victorias" />
        <Stat value={formatPercent(stats.winRate)} label="Ratio" />
      </section>

      {head.together > 0 && (
        <section className="card p-4">
          <h2 className="display text-base">Partidas contigo</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Habéis coincidido en {head.together} partidas.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="tnum text-2xl font-extrabold">{head.yourWins}</span>
            <span className="text-xs text-[var(--color-muted)]">tú</span>
            <span
              className="flex h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]"
              aria-hidden="true"
            >
              <span
                className="bg-[var(--color-brand)]"
                style={{ width: `${(head.yourWins / head.together) * 100}%` }}
              />
              <span
                className="ml-auto bg-[var(--color-accent)]"
                style={{ width: `${(head.theirWins / head.together) * 100}%` }}
              />
            </span>
            <span className="text-xs text-[var(--color-muted)]">
              {player.display_name}
            </span>
            <span className="tnum text-2xl font-extrabold">{head.theirWins}</span>
          </div>
          {head.otherWins > 0 && (
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Otras {head.otherWins} las ganó un tercero.
            </p>
          )}
        </section>
      )}

      {isMe && <LibraryShelf games={games} entries={entries} />}

      {stats.byGame.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base">Por juego</h2>
          <ul className="card divide-y divide-[var(--color-border)]">
            {stats.byGame.map((record) => {
              const game = getGame(record.gameSlug)
              return (
                <li key={record.gameSlug} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl" aria-hidden="true">
                    {game?.icon ?? '🎲'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {game?.name ?? record.gameSlug}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {record.played} partidas · {record.wins} victorias
                    </span>
                  </span>
                  <span className="text-right text-xs text-[var(--color-muted)]">
                    <span className="tnum block">
                      Mejor: <strong>{record.bestTotal ?? '—'}</strong>
                    </span>
                    <span className="tnum block">
                      Media: {formatAverage(record.averageTotal)}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="display text-base">Sus partidas</h2>
        {own.length === 0 ? (
          <p className="card px-4 py-6 text-center text-sm text-[var(--color-muted)]">
            Todavía no ha jugado ninguna.
          </p>
        ) : (
          own.map((match) => (
            <MatchCard key={match.id} match={match} highlightPlayerId={player.id} />
          ))
        )}
      </section>
    </div>
  )
}
