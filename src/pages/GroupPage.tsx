import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useGames } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { useLibrary } from '../context/LibraryContext'
import { api, isDemoMode, queryKeys } from '../lib/api'
import { Avatar, ErrorNote, PageHeader } from '../components/ui'

export function GroupPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, signOut } = useAuth()
  const { group, groups, setGroupId, players } = useGroup()
  const { custom } = useGames()
  const { counts } = useLibrary()
  const [copied, setCopied] = useState(false)
  const [guestName, setGuestName] = useState('')

  const membersQuery = useQuery({
    queryKey: queryKeys.members(group?.id ?? ''),
    queryFn: () => api.listMembers(group!.id),
    enabled: !!group,
  })

  const addGuest = useMutation({
    mutationFn: (name: string) => api.addPlayer(group!.id, name),
    onSuccess: async () => {
      setGuestName('')
      await queryClient.invalidateQueries({ queryKey: queryKeys.players(group!.id) })
    },
  })

  if (!group) return null

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(group!.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Sin permiso de portapapeles: el código está a la vista, se copia a mano.
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={group.name} subtitle="Grupo privado" />

      <section className="card flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="label">Código de invitación</p>
          <p className="mt-1 text-2xl font-black tracking-[0.25em]">{group.join_code}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Quien tenga este código puede unirse al grupo.
          </p>
        </div>
        <button type="button" className="btn btn-ghost shrink-0" onClick={() => void copyCode()}>
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="display text-base">Tu biblioteca</h2>
        <Link to="/biblioteca" className="card flex items-center gap-4 p-4">
          <span className="text-2xl leading-none" aria-hidden="true">
            📚
          </span>
          <span className="min-w-0 flex-1">
            <span className="tnum block text-sm font-medium">
              {counts.owned} en casa · {counts.wishlist} en la lista de deseos
            </span>
            <span className="block text-xs text-[var(--color-muted)]">
              Marca qué juegos has comprado y cuáles quieres. Solo los ves tú.
            </span>
          </span>
          <span className="text-[var(--color-muted)]" aria-hidden="true">
            ›
          </span>
        </Link>
      </section>

      {groups.length > 1 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base">Cambiar de grupo</h2>
          <div className="flex flex-wrap gap-2">
            {groups.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => setGroupId(candidate.id)}
                className={`chip ${candidate.id === group.id ? 'chip-on' : ''}`}
              >
                {candidate.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="display text-base">
          Miembros con cuenta{' '}
          <span className="text-sm font-normal text-[var(--color-muted)]">
            ({membersQuery.data?.length ?? 0})
          </span>
        </h2>
        <ul className="card divide-y divide-[var(--color-border)]">
          {(membersQuery.data ?? []).map((member) => (
            <li key={member.user_id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={member.profile?.display_name ?? '?'} size={32} registered />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {member.profile?.display_name ?? 'Sin nombre'}
                {member.user_id === user?.id && (
                  <span className="text-[var(--color-muted)]"> · tú</span>
                )}
              </span>
              {member.role === 'admin' && (
                <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]">
                  admin
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="display text-base">
          Jugadores{' '}
          <span className="text-sm font-normal text-[var(--color-muted)]">
            ({players.length})
          </span>
        </h2>
        <ul className="card divide-y divide-[var(--color-border)]">
          {players.map((player) => (
            <li key={player.id}>
              <Link
                to={`/jugadores/${player.id}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Avatar
                  name={player.display_name}
                  size={32}
                  registered={!!player.user_id}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {player.display_name}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {player.user_id ? 'con cuenta' : 'invitado'}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Nuevo invitado sin cuenta…"
            value={guestName}
            maxLength={40}
            onChange={(event) => setGuestName(event.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!guestName.trim() || addGuest.isPending}
            onClick={() => addGuest.mutate(guestName)}
          >
            Añadir
          </button>
        </div>
        <ErrorNote error={addGuest.error} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="display text-base">
          Juegos del grupo{' '}
          <span className="text-sm font-normal text-[var(--color-muted)]">
            ({custom.length})
          </span>
        </h2>

        {custom.length > 0 && (
          <ul className="card divide-y divide-[var(--color-border)]">
            {custom.map((game) => (
              <li key={game.slug}>
                <Link
                  to={`/juegos/${game.slug}/editar`}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="text-xl leading-none" aria-hidden="true">
                    {game.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{game.name}</span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {game.fields.length} campos · {game.scoreLabel}
                    </span>
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">editar</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link to="/juegos/nuevo" className="btn btn-ghost">
          ＋ Crear un juego vuestro
        </Link>
        <p className="text-xs text-[var(--color-muted)]">
          Los juegos que creéis aquí solo los ve este grupo.
        </p>
      </section>

      {isDemoMode && (
        <section className="card flex flex-col gap-2 p-4 text-sm">
          <h2 className="display text-base">Modo demostración</h2>
          <p className="text-[var(--color-muted)]">
            No hay ninguna base de datos conectada: los datos viven en este navegador. Para
            usarlo de verdad, crea un proyecto en Supabase, ejecuta{' '}
            <code className="rounded bg-[var(--color-surface-2)] px-1">supabase/schema.sql</code>{' '}
            y{' '}
            <code className="rounded bg-[var(--color-surface-2)] px-1">
              supabase/seed_games.sql
            </code>
            , y rellena <code className="rounded bg-[var(--color-surface-2)] px-1">.env</code>.
          </p>
        </section>
      )}

      <div className="flex flex-col gap-2">
        <Link to="/grupo/nuevo" className="btn btn-ghost">
          Crear o unirme a otro grupo
        </Link>
        <button
          type="button"
          className="btn btn-ghost text-[var(--color-danger)]"
          onClick={async () => {
            await signOut()
            navigate('/login', { replace: true })
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
