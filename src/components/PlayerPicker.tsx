import { useState } from 'react'
import type { Player } from '../lib/types'
import { Avatar } from './Avatar'
import { ErrorNote } from './ui'

/**
 * Selección de los jugadores de la partida: chips con los del grupo y alta
 * rápida de invitados (sin cuenta). El orden de selección es el orden de turno.
 */
export function PlayerPicker({
  players,
  selected,
  onToggle,
  onAddGuest,
  maxPlayers,
}: {
  players: Player[]
  selected: string[]
  onToggle: (playerId: string) => void
  onAddGuest: (displayName: string) => Promise<Player>
  maxPlayers: number
}) {
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const full = selected.length >= maxPlayers

  async function addGuest() {
    const trimmed = name.trim()
    if (!trimmed || adding) return

    setAdding(true)
    setError(null)
    try {
      const player = await onAddGuest(trimmed)
      setName('')
      if (!full) onToggle(player.id)
    } catch (cause) {
      setError(cause)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {players.map((player) => {
          const index = selected.indexOf(player.id)
          const isSelected = index >= 0

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onToggle(player.id)}
              disabled={!isSelected && full}
              aria-pressed={isSelected}
              className={`chip py-1 pl-1 pr-3 disabled:opacity-40 ${isSelected ? 'chip-on' : ''}`}
            >
              <Avatar
                name={player.display_name}
                avatar={player.avatar_url}
                size={26}
                registered={!!player.user_id}
              />
              <span className="max-w-[9rem] truncate">{player.display_name}</span>
              {/* El hueco del número está siempre, aunque no se vea: si apareciera
                  al seleccionar, el chip crecería bajo el dedo y correría a los
                  demás, y el siguiente toque caería en otro jugador. */}
              <span
                aria-hidden={!isSelected}
                className={`tnum ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-[var(--color-brand-ink)] ${
                  isSelected ? '' : 'invisible'
                }`}
              >
                {isSelected ? index + 1 : 0}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Añadir invitado sin cuenta…"
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void addGuest()
            }
          }}
        />
        <button
          type="button"
          className="btn btn-ghost"
          disabled={!name.trim() || adding}
          onClick={() => void addGuest()}
        >
          {adding ? '…' : 'Añadir'}
        </button>
      </div>

      <ErrorNote error={error} />
    </div>
  )
}
