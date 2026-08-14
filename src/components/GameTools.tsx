import { useEffect, useRef, useState } from 'react'
import {
  describeTool,
  dieFace,
  diceTotal,
  formatSeconds,
  rollDice,
} from '../games/tools'
import type { DiceTool, GameDefinition, TimerTool } from '../games/types'

/**
 * Los accesorios que declara un juego, listos para usar en la mesa.
 *
 * No sabe de ningún juego: pinta lo que haya en `game.tools`, y si no hay nada no
 * pinta nada. El azar y el formato del reloj están en `games/tools.ts`; aquí solo
 * queda el estado de la pantalla —qué salió en la última tirada y cuánto queda—,
 * que a propósito no se guarda: al salir de la partida no hay nada que conservar.
 */
export function GameTools({ game }: { game: GameDefinition }) {
  const tools = game.tools ?? []
  if (tools.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="display text-base">En la mesa</h2>
      {tools.map((tool, index) => (
        <div key={`${tool.kind}-${index}`}>
          {tool.kind === 'dice' ? <Dice tool={tool} /> : <Timer tool={tool} />}
        </div>
      ))}
    </section>
  )
}

function Dice({ tool }: { tool: DiceTool }) {
  const [values, setValues] = useState<number[]>([])

  return (
    <article className="card flex items-center gap-3 p-3">
      <div className="min-w-0 flex-1">
        <p className="overline text-[0.6875rem] text-[var(--color-muted)]">
          {describeTool(tool)}
        </p>

        <p
          className="tnum mt-1 flex flex-wrap items-center gap-x-2 gap-y-1"
          role="status"
          aria-live="polite"
        >
          {values.length === 0 ? (
            <span className="text-sm text-[var(--color-muted)]">Sin tirar</span>
          ) : (
            <>
              {values.map((value, index) => (
                <span
                  key={index}
                  className="text-3xl font-black leading-none"
                  // Un dado de seis se pinta con su glifo, que no se lee solo.
                  aria-label={`${value}`}
                >
                  {dieFace(value, tool.faces)}
                </span>
              ))}
              {values.length > 1 && (
                <span className="text-sm text-[var(--color-muted)]">
                  = <strong className="text-[var(--color-text)]">{diceTotal(values)}</strong>
                </span>
              )}
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary shrink-0 px-3 py-2 text-sm"
        onClick={() => setValues(rollDice(tool))}
      >
        🎲 Tirar
      </button>
    </article>
  )
}

function Timer({ tool }: { tool: TimerTool }) {
  const [remaining, setRemaining] = useState(tool.seconds)
  // Cuándo se acaba, en tiempo del reloj: contar «un segundo menos» cada tick
  // se desfasa en cuanto el navegador va justo o la pestaña pasa a segundo plano.
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const buzzed = useRef(false)

  useEffect(() => {
    if (endsAt === null) return

    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) {
        setEndsAt(null)
        if (!buzzed.current) {
          buzzed.current = true
          // En el móvil el aviso se nota sin mirar; donde no haya vibración, no pasa nada.
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
        }
      }
    }

    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [endsAt])

  const running = endsAt !== null
  const finished = remaining === 0
  const untouched = !running && remaining === tool.seconds
  const left = Math.round((remaining / tool.seconds) * 100)

  function start() {
    buzzed.current = false
    setEndsAt(Date.now() + remaining * 1000)
  }

  function pause() {
    setEndsAt(null)
  }

  function reset() {
    buzzed.current = false
    setEndsAt(null)
    setRemaining(tool.seconds)
  }

  return (
    <article className="card flex flex-col gap-2 p-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="overline text-[0.6875rem] text-[var(--color-muted)]">
            {describeTool(tool)}
          </p>
          <p
            className={`tnum display text-3xl leading-none ${
              finished ? 'text-[var(--color-danger)]' : ''
            }`}
            role="timer"
            aria-live="off"
          >
            {formatSeconds(remaining)}
          </p>
        </div>

        {!finished && (
          <button
            type="button"
            className="btn btn-primary shrink-0 px-3 py-2 text-sm"
            onClick={running ? pause : start}
          >
            {running ? '⏸ Pausa' : untouched ? '▶ Empezar' : '▶ Seguir'}
          </button>
        )}

        <button
          type="button"
          className="btn btn-ghost shrink-0 px-3 py-2 text-sm"
          disabled={untouched}
          onClick={reset}
        >
          ↺
          <span className="sr-only">Reiniciar el temporizador</span>
        </button>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <div
          className="h-full bg-[var(--color-brand)] transition-[width] duration-300"
          style={{ width: `${left}%` }}
        />
      </div>

      {finished && (
        <p className="note note-warn" role="alert">
          ¡Tiempo!
        </p>
      )}
    </article>
  )
}
