/**
 * Los accesorios de mesa, sin pantalla de por medio.
 *
 * Tirar un dado y contar hacia atrás son las dos cosas que la app hace además de
 * apuntar puntos, y las dos se pueden decidir sin renderizar nada: aquí están el
 * azar (con la fuente inyectable, que si no no hay forma de probarlo), el formato
 * del reloj y los límites de lo que se puede declarar. `GameTools` solo pinta.
 */
import type { DiceTool, GameTool, GameToolKind, TimerTool } from './types'

export const MAX_TOOLS = 4

export const MAX_DICE = 10
export const MAX_DICE_FACES = 100
/** Menos de cinco segundos no da tiempo ni a soltar el móvil. */
export const MIN_TIMER_SECONDS = 5
export const MAX_TIMER_SECONDS = 3600

export const TOOL_KIND_LABELS: Record<GameToolKind, string> = {
  dice: 'Dados',
  timer: 'Temporizador',
}

export const TOOL_KIND_ICONS: Record<GameToolKind, string> = {
  dice: '🎲',
  timer: '⏱️',
}

/** Accesorio recién añadido en el creador, con los valores más corrientes. */
export function blankTool(kind: GameToolKind): GameTool {
  return kind === 'dice'
    ? { kind: 'dice', count: 1, faces: 6 }
    : { kind: 'timer', seconds: 60 }
}

/** «2 dados de 6 caras», «Reloj de turno · 1:00». */
export function describeTool(tool: GameTool): string {
  if (tool.kind === 'dice') {
    const dice =
      tool.count === 1 ? `1 dado de ${tool.faces} caras` : `${tool.count} dados de ${tool.faces} caras`
    return tool.label ? `${tool.label} · ${dice}` : dice
  }

  const time = formatSeconds(tool.seconds)
  return tool.label ? `${tool.label} · ${time}` : `Cuenta atrás de ${time}`
}

/**
 * Una tirada. `random` se pasa por parámetro para poder fijarla en las pruebas:
 * `Math.random` no se puede predecir, que es justo lo que se le pide.
 */
export function rollDice(tool: DiceTool, random: () => number = Math.random): number[] {
  const count = clamp(Math.round(tool.count), 1, MAX_DICE)
  const faces = clamp(Math.round(tool.faces), 2, MAX_DICE_FACES)

  return Array.from({ length: count }, () => Math.floor(random() * faces) + 1)
}

export function diceTotal(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

/**
 * Cara de un dado como carácter, para los de seis caras. El resto se pintan con su
 * número: no existe un glifo de «17» y forzarlo sería peor que leerlo.
 */
const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export function dieFace(value: number, faces: number): string {
  if (faces !== 6) return String(value)
  return DIE_FACES[value - 1] ?? String(value)
}

/** Segundos → «1:05» o «12:05» si pasa de la hora. */
export function formatSeconds(total: number): string {
  const safe = Math.max(0, Math.round(total))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  const pad = (value: number) => String(value).padStart(2, '0')
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}

/** Problemas de los accesorios declarados, en el mismo formato que `validateDefinition`. */
export function validateTools(tools: GameTool[] | undefined): string[] {
  if (!tools || tools.length === 0) return []

  const problems: string[] = []
  if (tools.length > MAX_TOOLS) {
    problems.push(`Como mucho ${MAX_TOOLS} accesorios de mesa.`)
  }

  tools.forEach((tool, index) => {
    const name = tool.label?.trim() || `Accesorio ${index + 1}`

    if (tool.label && tool.label.trim().length > 30) {
      problems.push(`«${name}»: el nombre no puede pasar de 30 caracteres.`)
    }

    if (tool.kind === 'dice') {
      if (!Number.isInteger(tool.count) || tool.count < 1 || tool.count > MAX_DICE) {
        problems.push(`«${name}»: de 1 a ${MAX_DICE} dados.`)
      }
      if (!Number.isInteger(tool.faces) || tool.faces < 2 || tool.faces > MAX_DICE_FACES) {
        problems.push(`«${name}»: de 2 a ${MAX_DICE_FACES} caras por dado.`)
      }
    } else {
      if (
        !Number.isInteger(tool.seconds) ||
        tool.seconds < MIN_TIMER_SECONDS ||
        tool.seconds > MAX_TIMER_SECONDS
      ) {
        problems.push(
          `«${name}»: la cuenta atrás va de ${MIN_TIMER_SECONDS} segundos a ${formatSeconds(
            MAX_TIMER_SECONDS,
          )}.`,
        )
      }
    }
  })

  return problems
}

/** Deja los accesorios listos para guardar: sin nombres vacíos ni números raros. */
export function normalizeTools(tools: GameTool[] | undefined): GameTool[] | undefined {
  if (!tools || tools.length === 0) return undefined

  return tools.map((tool) => {
    const label = tool.label?.trim() || undefined

    if (tool.kind === 'dice') {
      const dice: DiceTool = {
        kind: 'dice',
        count: clamp(Math.round(tool.count), 1, MAX_DICE),
        faces: clamp(Math.round(tool.faces), 2, MAX_DICE_FACES),
      }
      return label ? { ...dice, label } : dice
    }

    const timer: TimerTool = {
      kind: 'timer',
      seconds: clamp(Math.round(tool.seconds), MIN_TIMER_SECONDS, MAX_TIMER_SECONDS),
    }
    return label ? { ...timer, label } : timer
  })
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}
