import { useMemo, useState, type CSSProperties } from 'react'
import { computeTotal } from '../games/registry'
import type { GameDefinition, ScoreValues } from '../games/types'
import { ScoreFieldInput } from './ScoreFieldInput'
import { useCover } from './GameCover'
import { Avatar } from './Avatar'

export interface ScoreRow {
  playerId: string
  name: string
  registered: boolean
  /** Lo guardado en `players.avatar_url`; sin él, el muñeco sale del nombre. */
  avatar?: string | null
  scores: ScoreValues
}

/**
 * Hoja de puntuación: una ficha por jugador con los campos del juego agrupados.
 *
 * En el móvil una tabla de jugadores × campos no cabe, así que se apila por
 * jugador. Los grupos (`field.group`) salen de la definición del juego.
 *
 * La hoja se viste del juego que se está anotando —banda de portada arriba, esa
 * misma portada muy tenue por detrás de cada ficha, su icono en la esquina y el
 * filete lateral de su color—, pero sigue sin conocer ninguno: todo sale de la
 * `GameDefinition`. Sin portada, `useCover` deja el icono sobre `game-wash` y el
 * resto se mantiene, que es el caso de la mayoría del catálogo.
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

  // La portada se resuelve una sola vez para toda la hoja: si falla, se caen a
  // la vez la banda y el velo de las fichas, en lugar de quedar a medias.
  const cover = useCover(game)

  const totals = rows.map((row) => computeTotal(game, row.scores))
  const best = rows.length
    ? game.winnerRule === 'lowest'
      ? Math.min(...totals)
      : Math.max(...totals)
    : 0
  const tied = totals.filter((total) => total === best).length > 1
  const picking = tied || manualWinner || winnerPlayerId !== null

  return (
    // `--game` se declara una vez arriba y lo heredan la banda y todas las fichas.
    <div
      className="flex flex-col gap-3"
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      <SheetBanner game={game} cover={cover} />

      {rows.map((row, index) => (
        <PlayerCard
          key={row.playerId}
          game={game}
          row={row}
          groups={groups}
          coverSrc={cover.src}
          total={totals[index]}
          leading={totals[index] === best}
          isWinner={winnerPlayerId === row.playerId}
          showWinnerPicker={picking}
          onPickWinner={() => onPickWinner(row.playerId)}
          onFieldChange={(fieldKey, value) => onFieldChange(index, fieldKey, value)}
        />
      ))}

      {tied && (
        <p className="note note-warn">
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

/**
 * La banda que encabeza la hoja: portada del juego a sangre con el nombre encima.
 * Sin portada queda el icono sobre `game-wash`, igual que en `GameCover`.
 */
function SheetBanner({
  game,
  cover,
}: {
  game: GameDefinition
  cover: ReturnType<typeof useCover>
}) {
  return (
    <div className="sheet-banner">
      {cover.src ? (
        // Las cajas se recortan cuadradas y el título suele ir arriba, así que el
        // encuadre sube un poco: centrado, la banda pilla el borde de la caja.
        <img
          src={cover.src}
          alt=""
          onError={cover.onError}
          className="absolute inset-0 h-full w-full object-cover object-[center_38%]"
        />
      ) : (
        <span
          className="game-wash absolute inset-0 flex items-center justify-center text-5xl leading-none"
          aria-hidden="true"
        >
          {game.icon}
        </span>
      )}

      <span className="sheet-banner-veil" aria-hidden="true" />

      <span className="relative min-w-0 px-3.5 pb-2.5">
        <span className="display block truncate text-xl leading-tight">{game.name}</span>
        <span className="overline block text-[0.625rem] text-[var(--color-muted)]">
          {game.scoreLabel} · {game.minPlayers}–{game.maxPlayers} jugadores
        </span>
      </span>
    </div>
  )
}

function PlayerCard({
  game,
  row,
  groups,
  coverSrc,
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
  /** Ya resuelta por la hoja; `undefined` si el juego no tiene o si falló. */
  coverSrc: string | undefined
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
    // Quien va ganando se levanta de la pila: sombra más larga y cabecera teñida
    // del color del juego.
    <section
      className={`card game-edge relative overflow-hidden ${leading ? 'hard-lift' : ''}`}
    >
      {coverSrc && (
        <span
          className="game-photo"
          style={{ backgroundImage: `url(${coverSrc})` }}
          aria-hidden="true"
        />
      )}

      <div className="relative">
        <header
          className={`flex items-center gap-3 px-4 py-3 ${leading ? 'game-tint' : ''}`}
        >
          <span className="game-glyph" aria-hidden="true">
            {game.icon}
          </span>

          <Avatar
            name={row.name}
            avatar={row.avatar}
            size={34}
            registered={row.registered}
          />

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
              className={`chip shrink-0 text-xs ${
                isWinner
                  ? 'hard-sm bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
                  : ''
              }`}
            >
              🏆 Ganó
            </button>
          )}

          <span className="text-right">
            <span
              className={`tnum block text-2xl font-black leading-none ${leading ? 'game-ink' : ''}`}
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
      </div>
    </section>
  )
}
