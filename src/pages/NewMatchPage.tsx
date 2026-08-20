import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applyUniqueField, emptyScores, validateScores } from '../games/registry'
import type { ScoreValues } from '../games/types'
import { GameCover } from '../components/GameCover'
import { GameTools } from '../components/GameTools'
import { PlayerPicker } from '../components/PlayerPicker'
import { ScoreSheet, type ScoreRow } from '../components/ScoreSheet'
import { ErrorNote, Spinner } from '../components/ui'
import { useGame } from '../context/GamesContext'
import { useGroup } from '../context/GroupContext'
import { api, queryKeys } from '../lib/api'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Alta de una partida en dos pasos: quién jugó y cuánto hizo cada uno.
 * Todo lo específico del juego sale de su definición.
 */
export function NewMatchPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { group, players } = useGroup()
  // Se puede llegar aquí por enlace directo a un juego que no viaja dentro de la app.
  const { game, loading } = useGame(slug)

  const [step, setStep] = useState<1 | 2>(1)
  const [selected, setSelected] = useState<string[]>([])
  const [scoresById, setScoresById] = useState<Record<string, ScoreValues>>({})
  const [playedAt, setPlayedAt] = useState(today)
  const [notes, setNotes] = useState('')
  const [winnerPlayerId, setWinnerPlayerId] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: (input: Parameters<typeof api.saveMatch>[0]) => api.saveMatch(input),
    onSuccess: async (matchId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.matches(group!.id) })
      navigate(`/partidas/${matchId}`, { replace: true })
    },
  })

  const rows: ScoreRow[] = useMemo(
    () =>
      selected.map((playerId) => {
        const player = players.find((candidate) => candidate.id === playerId)
        return {
          playerId,
          name: player?.display_name ?? 'Jugador',
          registered: !!player?.user_id,
          avatar: player?.avatar_url,
          scores: scoresById[playerId] ?? {},
        }
      }),
    [selected, players, scoresById],
  )

  const issues = useMemo(
    () => (game ? validateScores(game, rows) : []),
    [game, rows],
  )

  // Los juegos del grupo llegan por red: hasta que no están no se sabe si el slug existe.
  if (loading) return <Spinner />
  if (!game) return <Navigate to="/" replace />
  if (!group) return null

  const hasRegistered = rows.some((row) => row.registered)
  const countOk =
    selected.length >= game.minPlayers && selected.length <= game.maxPlayers

  function togglePlayer(playerId: string) {
    if (selected.includes(playerId)) {
      setSelected(selected.filter((id) => id !== playerId))
    } else {
      if (selected.length >= game!.maxPlayers) return
      setSelected([...selected, playerId])
      if (!scoresById[playerId]) {
        setScoresById({ ...scoresById, [playerId]: emptyScores(game!) })
      }
    }
    setWinnerPlayerId(null)
  }

  function changeField(rowIndex: number, fieldKey: string, value: number | boolean) {
    const field = game!.fields.find((candidate) => candidate.key === fieldKey)

    // Las cartas únicas (Camino más largo…) se le quitan al resto al asignarlas.
    if (field?.uniquePerMatch) {
      const updated = applyUniqueField(
        game!,
        selected.map((id) => scoresById[id] ?? {}),
        fieldKey,
        rowIndex,
        !!value,
      )
      setScoresById((current) => {
        const next = { ...current }
        selected.forEach((id, index) => {
          next[id] = updated[index]
        })
        return next
      })
      return
    }

    const playerId = selected[rowIndex]
    setScoresById((current) => ({
      ...current,
      [playerId]: { ...current[playerId], [fieldKey]: value },
    }))
  }

  function submit() {
    save.mutate({
      groupId: group!.id,
      gameSlug: game!.slug,
      playedAt,
      notes: notes.trim() || null,
      players: selected.map((playerId, seat) => ({
        playerId,
        seat,
        scores: scoresById[playerId] ?? {},
      })),
      winnerPlayerId,
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* En el paso 2 la hoja se encabeza sola con la banda de portada, así que
          aquí no se repiten ni la carátula ni el nombre del juego. */}
      <header className="flex items-center gap-3">
        {step === 1 && <GameCover game={game} size={52} />}
        <div className="min-w-0">
          <h1 className="nombre truncate text-xl">
            {step === 1 ? game.name : 'Puntuaciones'}
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {step === 1 ? 'Paso 1 · ¿Quién jugó?' : 'Paso 2 de 2'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost ml-auto shrink-0 px-3 py-1.5 text-sm"
          onClick={() => (step === 1 ? navigate('/') : setStep(1))}
        >
          {step === 1 ? 'Cancelar' : 'Atrás'}
        </button>
      </header>

      {step === 1 && (
        <>
          <PlayerPicker
            players={players}
            selected={selected}
            onToggle={togglePlayer}
            maxPlayers={game.maxPlayers}
            onAddGuest={async (name) => {
              const player = await api.addPlayer(group.id, name)
              await queryClient.invalidateQueries({
                queryKey: queryKeys.players(group.id),
              })
              return player
            }}
          />

          <p className="text-sm text-[var(--color-muted)]">
            {game.name} se juega de {game.minPlayers} a {game.maxPlayers} jugadores. Has
            elegido {selected.length}.
          </p>

          {selected.length > 0 && !hasRegistered && (
            <p className="note note-warn">
              Al menos uno de los jugadores tiene que tener cuenta. Los demás pueden ser
              invitados.
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary"
            disabled={!countOk || !hasRegistered}
            onClick={() => setStep(2)}
          >
            Apuntar puntuaciones
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Los dados y el reloj, antes que la hoja: se usan mientras se juega,
              y las puntuaciones se apuntan al final. */}
          <GameTools game={game} />

          <ScoreSheet
            game={game}
            rows={rows}
            onFieldChange={changeField}
            winnerPlayerId={winnerPlayerId}
            onPickWinner={(playerId) =>
              setWinnerPlayerId((current) => (current === playerId ? null : playerId))
            }
          />

          <section className="card flex flex-col gap-3 p-4">
            <label className="flex flex-col gap-1">
              <span className="label">Fecha</span>
              <input
                className="input"
                type="date"
                value={playedAt}
                max={today()}
                onChange={(event) => setPlayedAt(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label">Notas (opcional)</span>
              <input
                className="input"
                placeholder="La partida del puerto…"
                value={notes}
                maxLength={200}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </section>

          {issues.map((issue) => (
            <p
              key={`${issue.playerIndex}-${issue.fieldKey}-${issue.message}`}
              className="note note-danger"
            >
              {issue.message}
            </p>
          ))}

          <ErrorNote error={save.error} />

          <button
            type="button"
            className="btn btn-primary"
            disabled={issues.length > 0 || save.isPending}
            onClick={submit}
          >
            {save.isPending ? 'Guardando…' : 'Guardar partida'}
          </button>
        </>
      )}
    </div>
  )
}
