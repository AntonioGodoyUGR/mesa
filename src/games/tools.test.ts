/**
 * Los accesorios de mesa: azar acotado, formato del reloj y los límites de lo que un
 * usuario puede declarar en el creador. Todo se decide sin pantalla, así que se prueba
 * sin renderizar nada.
 */
import { describe, expect, it } from 'vitest'
import {
  MAX_DICE,
  MAX_DICE_FACES,
  MAX_TIMER_SECONDS,
  MAX_TOOLS,
  MIN_TIMER_SECONDS,
  blankTool,
  describeTool,
  diceTotal,
  dieFace,
  formatSeconds,
  normalizeTools,
  rollDice,
  validateTools,
} from './tools'
import type { DiceTool, GameTool } from './types'

const d6: DiceTool = { kind: 'dice', count: 2, faces: 6 }

describe('rollDice', () => {
  it('devuelve tantos valores como dados, siempre dentro de las caras', () => {
    const values = rollDice({ kind: 'dice', count: 5, faces: 20 })
    expect(values).toHaveLength(5)
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(20)
    }
  })

  it('con la fuente de azar fijada, la tirada es previsible', () => {
    expect(rollDice(d6, () => 0)).toEqual([1, 1])
    // 0,999… es el valor más alto que puede devolver `Math.random`: la cara máxima.
    expect(rollDice(d6, () => 0.999)).toEqual([6, 6])
    expect(rollDice({ kind: 'dice', count: 1, faces: 6 }, () => 0.5)).toEqual([4])
  })

  it('recorta números imposibles en vez de tirar de menos o de más', () => {
    expect(rollDice({ kind: 'dice', count: 0, faces: 6 }, () => 0)).toHaveLength(1)
    expect(rollDice({ kind: 'dice', count: 99, faces: 6 }, () => 0)).toHaveLength(MAX_DICE)
    expect(rollDice({ kind: 'dice', count: 1, faces: 1 }, () => 0.999)).toEqual([2])
  })
})

describe('diceTotal', () => {
  it('suma la tirada', () => {
    expect(diceTotal([3, 4, 5])).toBe(12)
    expect(diceTotal([])).toBe(0)
  })
})

describe('dieFace', () => {
  it('usa los glifos solo con dados de seis caras', () => {
    expect(dieFace(1, 6)).toBe('⚀')
    expect(dieFace(6, 6)).toBe('⚅')
    expect(dieFace(17, 20)).toBe('17')
    expect(dieFace(3, 3)).toBe('3')
  })
})

describe('formatSeconds', () => {
  it('escribe minutos y segundos, y añade horas solo si hacen falta', () => {
    expect(formatSeconds(0)).toBe('0:00')
    expect(formatSeconds(65)).toBe('1:05')
    expect(formatSeconds(600)).toBe('10:00')
    expect(formatSeconds(3600)).toBe('1:00:00')
    expect(formatSeconds(3725)).toBe('1:02:05')
  })

  it('nunca pinta tiempo negativo', () => {
    expect(formatSeconds(-30)).toBe('0:00')
  })
})

describe('describeTool', () => {
  it('describe los dados en singular y en plural', () => {
    expect(describeTool({ kind: 'dice', count: 1, faces: 6 })).toBe('1 dado de 6 caras')
    expect(describeTool(d6)).toBe('2 dados de 6 caras')
  })

  it('antepone el nombre propio cuando lo hay', () => {
    expect(describeTool({ ...d6, label: 'Dados de producción' })).toBe(
      'Dados de producción · 2 dados de 6 caras',
    )
    expect(describeTool({ kind: 'timer', seconds: 60 })).toBe('Cuenta atrás de 1:00')
    expect(describeTool({ kind: 'timer', seconds: 60, label: 'Reloj de turno' })).toBe(
      'Reloj de turno · 1:00',
    )
  })
})

describe('blankTool', () => {
  it('crea accesorios ya válidos', () => {
    expect(validateTools([blankTool('dice')])).toEqual([])
    expect(validateTools([blankTool('timer')])).toEqual([])
  })
})

describe('validateTools', () => {
  it('no protesta si el juego no declara ninguno', () => {
    expect(validateTools(undefined)).toEqual([])
    expect(validateTools([])).toEqual([])
  })

  it('acepta los accesorios corrientes', () => {
    expect(validateTools([d6, { kind: 'timer', seconds: 120 }])).toEqual([])
  })

  it('pone límite a la cantidad', () => {
    const tools = Array.from({ length: MAX_TOOLS + 1 }, () => d6)
    expect(validateTools(tools)).toContain(`Como mucho ${MAX_TOOLS} accesorios de mesa.`)
  })

  it('rechaza dados imposibles, nombrándolos como se llamen', () => {
    expect(validateTools([{ kind: 'dice', count: 0, faces: 6 }])).toEqual([
      `«Accesorio 1»: de 1 a ${MAX_DICE} dados.`,
    ])
    expect(
      validateTools([{ kind: 'dice', count: 1, faces: 1, label: 'Dado tonto' }]),
    ).toEqual([`«Dado tonto»: de 2 a ${MAX_DICE_FACES} caras por dado.`])
  })

  it('rechaza cuentas atrás fuera de rango', () => {
    expect(validateTools([{ kind: 'timer', seconds: 1 }])).toHaveLength(1)
    expect(validateTools([{ kind: 'timer', seconds: MAX_TIMER_SECONDS + 1 }])).toHaveLength(1)
    expect(validateTools([{ kind: 'timer', seconds: MIN_TIMER_SECONDS }])).toEqual([])
  })

  it('rechaza nombres kilométricos', () => {
    const tools: GameTool[] = [{ ...d6, label: 'x'.repeat(31) }]
    expect(validateTools(tools)).toHaveLength(1)
  })
})

describe('normalizeTools', () => {
  it('sin accesorios devuelve `undefined`, para no guardar una lista vacía', () => {
    expect(normalizeTools(undefined)).toBeUndefined()
    expect(normalizeTools([])).toBeUndefined()
  })

  it('recorta los números al rango y quita los nombres en blanco', () => {
    expect(normalizeTools([{ kind: 'dice', count: 99, faces: 1.4, label: '  ' }])).toEqual([
      { kind: 'dice', count: MAX_DICE, faces: 2 },
    ])
    expect(normalizeTools([{ kind: 'timer', seconds: 0, label: ' Reloj ' }])).toEqual([
      { kind: 'timer', seconds: MIN_TIMER_SECONDS, label: 'Reloj' },
    ])
  })

  it('lo que normaliza es siempre válido', () => {
    const raw: GameTool[] = [
      { kind: 'dice', count: -3, faces: 999 },
      { kind: 'timer', seconds: Number.NaN },
    ]
    expect(validateTools(normalizeTools(raw))).toEqual([])
  })
})
