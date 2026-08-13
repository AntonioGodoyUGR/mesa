import { clampField } from '../games/registry'
import type { ScoreField } from '../games/types'

/**
 * Renderiza UN campo de puntuación según su `type`.
 * Añadir un tipo nuevo de campo se hace aquí y en `ScoreFieldType`; ninguna
 * pantalla necesita enterarse.
 */
export function ScoreFieldInput({
  field,
  value,
  onChange,
  disabled = false,
}: {
  field: ScoreField
  value: number | boolean
  onChange: (next: number | boolean) => void
  disabled?: boolean
}) {
  const numeric = typeof value === 'number' ? value : 0

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-lg leading-none" aria-hidden="true">
        {field.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-tight">{field.label}</span>
        {field.hint && (
          <span className="mt-0.5 block text-[11px] leading-tight text-[var(--color-muted)]">
            {field.hint}
          </span>
        )}
      </span>

      {field.type === 'toggle' && (
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          aria-label={field.label}
          disabled={disabled}
          onClick={() => onChange(!value)}
          className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-40 ${
            value
              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              value ? 'translate-x-[1.4rem]' : 'translate-x-0.5'
            }`}
          />
        </button>
      )}

      {field.type === 'counter' && (
        <span className="flex shrink-0 items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-0.5">
          <button
            type="button"
            disabled={disabled || numeric <= (field.min ?? 0)}
            onClick={() => onChange(clampField(field, numeric - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[var(--color-muted)] disabled:opacity-30"
            aria-label={`Quitar 1 a ${field.label}`}
          >
            −
          </button>
          <span className="tnum w-7 text-center text-base font-bold">{numeric}</span>
          <button
            type="button"
            disabled={disabled || (field.max !== undefined && numeric >= field.max)}
            onClick={() => onChange(clampField(field, numeric + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-[var(--color-muted)] disabled:opacity-30"
            aria-label={`Añadir 1 a ${field.label}`}
          >
            +
          </button>
        </span>
      )}

      {field.type === 'number' && (
        <input
          type="number"
          inputMode="numeric"
          disabled={disabled}
          value={Number.isFinite(numeric) ? numeric : 0}
          min={field.min}
          max={field.max}
          aria-label={field.label}
          onChange={(event) => {
            const parsed = Number(event.target.value)
            onChange(Number.isFinite(parsed) ? clampField(field, parsed) : 0)
          }}
          className="input tnum h-10 w-20 shrink-0 text-center text-base font-bold"
        />
      )}
    </div>
  )
}
