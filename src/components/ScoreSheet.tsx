import { useMemo, useState } from 'react'
import { computeTotal } from '../games/registry'
import type { GameDefinition, ScoreValues } from '../games/types'
import { ScoreFieldInput } from './ScoreFieldInput'
import { Avatar } from './ui'

export interface ScoreRow {
  playerId: string
  name: string
  registered: boolean
  scores: ScoreValues
}

/**
 * Hoja de puntuación: una ficha por jugador con los campos del juego agrupados.
 *
 * En el móvil una tabla de jugadores × campos no cabe, así que se apila por
 * jugador. Los grupos (`field.group`) salen de la definición del juego.
 */
export function ScoreSheet({
  game,
  rows,
  onFieldChange,
  winnerPlayerId,
  onPickWinner,
}: {
  game: GameDefinition
  rows: ScoreRow[]
  onFieldChange: (rowIndex: number, fieldKey: string, value: number | boolean) => void
  winnerPlayerId: string | null
  onPickWinner: (playerId: string) => void
}) {
  const groups = useMemo(() => {
    const map = new Map<string, typeof game.fields>()
    for (const field of game.fields) {
      const key = field.group ?? ''
      map.set(key, [...(map.get(key) ?? []), field])
    }
    return [...map.entries()]
  }, [game])

  // Hay juegos donde no gana quien más puntúa (Monopoly, King of Tokyo: gana el
  // último en pie), así que el ganador se puede marcar a mano siempre, no solo
  // cuando hay empate.
  const [manualWinner, setManualWinner] = useState(false)

  const totals = rows.map((row) => computeTotal(game, row.scores))
  const best = rows.length
    ? game.winnerRule === 'lowest'
      ? Math.min(...totals)
      : Math.max(...totals)
    : 0
  const tied = totals.filter((total) => total === best).length > 1
  const picking = tied || manualWinner || winnerPlayerId !== null

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <PlayerCard
          key={row.playerId}
          game={game}
          row={row}
          groups={groups}
          total={totals[index]}
          leading={totals[index] === best}
          isWinner={winnerPlayerId === row.playerId}
          showWinnerPicker={picking}
          onPickWinner={() => onPickWinner(row.playerId)}
          onFieldChange={(fieldKey, value) => onFieldChange(index, fieldKey, value)}
        />
      ))}

      {tied && (
        <p className="rounded-xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-3 py-2 text-sm">
          Hay empate a {best} {game.scoreLabelShort}. Marca a mano quién ganó.
        </p>
      )}

      {!tied && rows.length > 0 && (
        <button
          type="button"
          className="self-start text-sm font-medium text-[var(--color-brand)]"
          onClick={() => {
            // Al volver al automático hay que soltar el ganador marcado a mano,
            // o el selector se quedaría abierto con él seleccionado.
            if (picking && winnerPlayerId) onPickWinner(winnerPlayerId)
            setManualWinner((current) => !current)
          }}
        >
          {picking ? 'Que gane quien más puntúa' : 'Ganó otro, no el que más puntúa'}
        </button>
      )}
    </div>
  )
}

function PlayerCard({
  game,
  row,
  groups,
  total,
  leading,
  isWinner,
  showWinnerPicker,
  onPickWinner,
  onFieldChange,
}: {
  game: GameDefinition
  row: ScoreRow
  groups: [string, GameDefinition['fields']][]
  total: number
  leading: boolean
  isWinner: boolean
  showWinnerPicker: boolean
  onPickWinner: () => void
  onFieldChange: (fieldKey: string, value: number | boolean) => void
}) {
  // Los grupos secundarios (desgloses opcionales) arrancan plegados para que la
  // pantalla no abrume: lo normal es teclear solo el total.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map(([name], index) => [name, index === 0])),
  )

  const reachedTarget = game.targetScore !== undefined && total >= game.targetScore

  return (
    <section
      className="card overflow-hidden"
      style={leading ? { borderColor: `${game.theme.primary}80` } : undefined}
    >
      <header
        className="flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: leading ? `${game.theme.primary}12` : undefined }}
      >
        <Avatar name={row.name} size={34} registered={row.registered} />

        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{row.name}</span>
          {!row.registered && (
            <span className="text-[11px] text-[var(--color-muted)]">Invitado</span>
          )}
        </span>

        {showWinnerPicker && (
          <button
            type="button"
            onClick={onPickWinner}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
              isWinner
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/25'
                : 'border-[var(--color-border)] text-[var(--color-muted)]'
            }`}
          >
            🏆 Ganó
          </button>
        )}

        <span className="text-right">
          <span
            className="tnum block text-2xl font-black leading-none"
            style={{ color: leading ? game.theme.primary : undefined }}
          >
            {total}
          </span>
          <span className="block text-[11px] text-[var(--color-muted)]">
            {game.scoreLabelShort}
            {reachedTarget && ' ✓'}
          </span>
        </span>
      </header>

      <div className="border-t border-[var(--color-border)] px-4 pb-2">
        {groups.map(([groupName, fields]) => {
          const open = openGroups[groupName] ?? true

          return (
            <div key={groupName || 'sin-grupo'}>
              {groupName && (
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((current) => ({ ...current, [groupName]: !open }))
                  }
                  className="flex w-full items-center gap-1.5 pt-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
                  aria-expanded={open}
                >
                  <span
                    className="inline-block transition-transform"
                    style={{ transform: open ? 'rotate(90deg)' : undefined }}
                    aria-hidden="true"
                  >
                    ›
                  </span>
                  {groupName}
                </button>
              )}

              {open && (
                <div className="divide-y divide-[var(--color-border)]">
                  {fields.map((field) => (
                    <ScoreFieldInput
                      key={field.key}
                      field={field}
                      value={row.scores[field.key] ?? (field.type === 'toggle' ? false : 0)}
                      onChange={(value) => onFieldChange(field.key, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
