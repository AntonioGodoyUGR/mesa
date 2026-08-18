import { useMemo, useState, type CSSProperties } from 'react'
import { computeTotal } from '../games/registry'
import type { GameDefinition, ScoreField, ScoreValues } from '../games/types'
import { ScoreFieldControl } from './ScoreFieldControl'
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
 * Hoja de puntuación: un bloque por concepto y, dentro, un control por jugador.
 *
 * Está montada como se cuenta en la mesa, no como se guarda la partida. Nadie
 * pregunta «Ana, dime todo lo tuyo»: se pregunta «¿cuántos pueblos tenéis?» y se
 * da la vuelta a la mesa. Apilar una ficha larga por jugador obligaba además a
 * recorrer la pantalla entera para saber cómo iba la cosa; eso lo resuelve ahora
 * el marcador fijo de arriba, que es lo único que hay que mirar mientras se juega.
 *
 * La hoja se viste del juego que se está anotando —banda de portada arriba,
 * filete lateral de su color y su icono en la esquina—, pero sigue sin conocer
 * ninguno: los conceptos, sus grupos y su forma de puntuar salen todos de la
 * `GameDefinition`. Sin portada, `useCover` deja el icono sobre `game-wash`, que
 * es el caso de buena parte del catálogo.
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

  // Los grupos secundarios (desgloses opcionales) arrancan plegados para que la
  // pantalla no abrume: lo normal es apuntar solo el primero.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map(([name], index) => [name, index === 0])),
  )

  // Hay juegos donde no gana quien más puntúa (Monopoly, King of Tokyo: gana el
  // último en pie), así que el ganador se puede marcar a mano siempre, no solo
  // cuando hay empate.
  const [manualWinner, setManualWinner] = useState(false)

  // La portada se resuelve una sola vez para toda la hoja.
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
    // `--game` se declara una vez arriba y lo heredan la banda y todos los bloques.
    <div
      className="flex flex-col gap-3"
      style={{ '--game': game.theme.primary } as CSSProperties}
    >
      <SheetBanner game={game} cover={cover} />

      <Scoreboard
        game={game}
        rows={rows}
        totals={totals}
        best={best}
        picking={picking}
        winnerPlayerId={winnerPlayerId}
        onPickWinner={onPickWinner}
      />

      {groups.map(([groupName, fields]) => (
        <FieldGroup
          key={groupName || 'sin-grupo'}
          game={game}
          groupName={groupName}
          fields={fields}
          rows={rows}
          open={openGroups[groupName] ?? true}
          onToggle={() =>
            setOpenGroups((current) => ({
              ...current,
              [groupName]: !(current[groupName] ?? true),
            }))
          }
          onFieldChange={onFieldChange}
        />
      ))}

      {tied && (
        <p className="note note-warn">
          Hay empate a {best} {game.scoreLabelShort}. Marca a mano quién ganó tocando su
          casilla en el marcador.
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

/**
 * Cómo va la partida, pegado bajo la cabecera de la aplicación. Se ordena solo:
 * la primera casilla es la de quien va ganando, y en un juego al revés
 * (`winnerRule: 'lowest'`) la de quien menos lleva.
 *
 * Cuando toca decidir el ganador a mano —empate, o un juego donde no gana quien
 * más puntúa— las casillas se vuelven botones y se marca aquí mismo, sin tener
 * que bajar a buscar a nadie.
 */
function Scoreboard({
  game,
  rows,
  totals,
  best,
  picking,
  winnerPlayerId,
  onPickWinner,
}: {
  game: GameDefinition
  rows: ScoreRow[]
  totals: number[]
  best: number
  picking: boolean
  winnerPlayerId: string | null
  onPickWinner: (playerId: string) => void
}) {
  const ranked = rows
    .map((row, index) => ({ row, total: totals[index] }))
    .sort((a, b) => (game.winnerRule === 'lowest' ? a.total - b.total : b.total - a.total))

  if (ranked.length === 0) return null

  return (
    <div className="scoreboard scroll-x" aria-label="Cómo va la partida">
      {ranked.map(({ row, total }, position) => {
        const leading = total === best
        const isWinner = winnerPlayerId === row.playerId
        const reachedTarget = game.targetScore !== undefined && total >= game.targetScore

        const inside = (
          <>
            <span className="tnum shrink-0 text-xs font-bold text-[var(--color-muted)]">
              {position + 1}
            </span>

            <Avatar
              name={row.name}
              avatar={row.avatar}
              size={26}
              registered={row.registered}
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-semibold leading-tight">
                {isWinner && (
                  <span className="mr-0.5" aria-hidden="true">
                    🏆
                  </span>
                )}
                {row.name}
              </span>
              <span
                className={`tnum block text-lg font-black leading-none ${leading ? 'game-ink' : ''}`}
              >
                {total}
                <span className="ml-1 text-[10px] font-semibold text-[var(--color-muted)]">
                  {game.scoreLabelShort}
                  {reachedTarget && ' ✓'}
                </span>
              </span>
            </span>
          </>
        )

        const dressing = `scoreboard-pill ${leading ? 'game-tint' : ''} ${
          isWinner ? 'hard-sm' : ''
        }`

        return picking ? (
          <button
            key={row.playerId}
            type="button"
            aria-pressed={isWinner}
            aria-label={`Marcar que ganó ${row.name}`}
            onClick={() => onPickWinner(row.playerId)}
            className={dressing}
          >
            {inside}
          </button>
        ) : (
          <div key={row.playerId} className={dressing}>
            {inside}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Un grupo de conceptos de la definición («Construcciones», «Bonos»…) con sus
 * campos dentro. El grupo sin nombre no lleva cabecera ni se pliega.
 */
function FieldGroup({
  game,
  groupName,
  fields,
  rows,
  open,
  onToggle,
  onFieldChange,
}: {
  game: GameDefinition
  groupName: string
  fields: ScoreField[]
  rows: ScoreRow[]
  open: boolean
  onToggle: () => void
  onFieldChange: (rowIndex: number, fieldKey: string, value: number | boolean) => void
}) {
  return (
    <section className="card game-edge relative overflow-hidden">
      <span className="game-glyph" aria-hidden="true">
        {game.icon}
      </span>

      {groupName && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="relative flex w-full items-center gap-1.5 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
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
        <div className="relative">
          {fields.map((field) => (
            <FieldBlock
              key={field.key}
              field={field}
              rows={rows}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Un concepto y la vuelta a la mesa: su nombre una sola vez y debajo un control
 * por jugador. En pantalla ancha los jugadores se reparten en columnas.
 */
function FieldBlock({
  field,
  rows,
  onFieldChange,
}: {
  field: ScoreField
  rows: ScoreRow[]
  onFieldChange: (rowIndex: number, fieldKey: string, value: number | boolean) => void
}) {
  return (
    <div className="border-t-2 border-[var(--color-border)] px-4 py-3">
      <h3 className="flex items-baseline gap-2">
        <span className="text-base leading-none" aria-hidden="true">
          {field.icon}
        </span>
        <span className="text-sm font-semibold">{field.label}</span>
        {field.hint && (
          <span className="min-w-0 truncate text-[11px] text-[var(--color-muted)]">
            {field.hint}
          </span>
        )}
      </h3>

      <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, index) => (
          <li key={row.playerId} className="flex items-center gap-2">
            <Avatar
              name={row.name}
              avatar={row.avatar}
              size={28}
              registered={row.registered}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{row.name}</span>
            <ScoreFieldControl
              field={field}
              owner={row.name}
              value={row.scores[field.key] ?? (field.type === 'toggle' ? false : 0)}
              onChange={(value) => onFieldChange(index, field.key, value)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
