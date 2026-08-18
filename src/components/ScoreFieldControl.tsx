import { clampField } from '../games/registry'
import type { ScoreField } from '../games/types'

/**
 * El control con el que se rellena UN campo de puntuación, según su `type`.
 *
 * Solo el mando: ni etiqueta, ni icono, ni ayuda. La hoja agrupa por concepto
 * —«Pueblos» una vez, y debajo un control por jugador—, así que el nombre del
 * campo lo pone ella una sola vez y aquí solo queda el widget. De ahí `owner`:
 * el campo ya no basta para nombrar el control, hace falta decir de quién es.
 *
 * Añadir un tipo nuevo de campo se hace aquí y en `ScoreFieldType`; ninguna
 * pantalla necesita enterarse.
 */
export function ScoreFieldControl({
  field,
  value,
  onChange,
  owner,
  disabled = false,
}: {
  field: ScoreField
  value: number | boolean
  onChange: (next: number | boolean) => void
  /** De quién es este control, para poder nombrarlo: «Ciudades de Ana». */
  owner?: string
  disabled?: boolean
}) {
  const numeric = typeof value === 'number' ? value : 0
  const what = owner ? `${field.label} de ${owner}` : field.label

  if (field.type === 'toggle') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        aria-label={what}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`hard-sm relative h-8 w-14 shrink-0 rounded-full border-2 border-[var(--color-border)] transition-colors disabled:opacity-40 ${
          value ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-surface-2)]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] transition-transform ${
            value ? 'translate-x-[1.65rem]' : 'translate-x-0.5'
          }`}
        />
      </button>
    )
  }

  if (field.type === 'counter') {
    return (
      <span className="stepper shrink-0">
        <button
          type="button"
          disabled={disabled || numeric <= (field.min ?? 0)}
          onClick={() => onChange(clampField(field, numeric - 1))}
          className="stepper-btn"
          aria-label={`Quitar 1 a ${what}`}
        >
          −
        </button>
        <span className="stepper-value">{numeric}</span>
        <button
          type="button"
          disabled={disabled || (field.max !== undefined && numeric >= field.max)}
          onClick={() => onChange(clampField(field, numeric + 1))}
          className="stepper-btn"
          aria-label={`Añadir 1 a ${what}`}
        >
          +
        </button>
      </span>
    )
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      disabled={disabled}
      value={Number.isFinite(numeric) ? numeric : 0}
      min={field.min}
      max={field.max}
      aria-label={what}
      onChange={(event) => {
        const parsed = Number(event.target.value)
        onChange(Number.isFinite(parsed) ? clampField(field, parsed) : 0)
      }}
      className="input tnum h-11 w-24 shrink-0 text-center text-base font-bold"
    />
  )
}
