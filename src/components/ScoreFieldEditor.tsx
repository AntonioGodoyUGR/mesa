import { FIELD_TYPE_LABELS } from '../games/custom'
import type { ScoreField, ScoreFieldType } from '../games/types'

/**
 * Edita UN campo de puntuación del creador de juegos.
 *
 * Es el espejo de `ScoreFieldControl`: allí se rellena el campo en una partida, aquí se
 * decide cómo es. La clave interna (`key`) se puede bloquear: si el juego ya tiene
 * partidas apuntadas, cambiarla dejaría huérfanas las puntuaciones guardadas en el jsonb.
 */
export function ScoreFieldEditor({
  field,
  index,
  count,
  keyLocked,
  computed,
  onChange,
  onRemove,
  onMove,
}: {
  field: ScoreField
  index: number
  count: number
  /** El juego ya tiene partidas: la clave interna es intocable. */
  keyLocked: boolean
  /** El total se suma de los campos: aparecen los puntos por unidad. */
  computed: boolean
  onChange: (next: ScoreField) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}) {
  function set<K extends keyof ScoreField>(key: K, value: ScoreField[K]) {
    onChange({ ...field, [key]: value })
  }

  /** Los números opcionales se borran del campo cuando se deja el hueco vacío. */
  function setOptionalNumber(key: 'points' | 'min' | 'max', raw: string) {
    const next = { ...field }
    if (raw.trim() === '') delete next[key]
    else next[key] = Number(raw)
    onChange(next)
  }

  return (
    <section className="card flex flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <input
          className="input w-14 text-center text-lg"
          value={field.icon}
          maxLength={4}
          aria-label={`Emoji del campo ${index + 1}`}
          onChange={(event) => set('icon', event.target.value)}
        />
        <input
          className="input flex-1"
          placeholder="Nombre del campo…"
          value={field.label}
          maxLength={40}
          aria-label={`Nombre del campo ${index + 1}`}
          onChange={(event) => set('label', event.target.value)}
        />
        <button
          type="button"
          className="btn btn-ghost px-2 py-1 text-sm disabled:opacity-30"
          disabled={index === 0}
          aria-label="Subir campo"
          onClick={() => onMove(-1)}
        >
          ↑
        </button>
        <button
          type="button"
          className="btn btn-ghost px-2 py-1 text-sm disabled:opacity-30"
          disabled={index === count - 1}
          aria-label="Bajar campo"
          onClick={() => onMove(1)}
        >
          ↓
        </button>
        <button
          type="button"
          className="btn btn-ghost px-2 py-1 text-sm text-[var(--color-danger)]"
          aria-label="Quitar campo"
          onClick={onRemove}
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="label">Cómo se apunta</span>
          <select
            className="input"
            value={field.type}
            onChange={(event) => set('type', event.target.value as ScoreFieldType)}
          >
            {Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {computed ? (
          <label className="flex flex-col gap-1">
            <span className="label">Puntos por unidad</span>
            <input
              className="input tnum"
              type="number"
              inputMode="numeric"
              placeholder="No suma"
              value={field.points ?? ''}
              onChange={(event) => setOptionalNumber('points', event.target.value)}
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1">
            <span className="label">Papel</span>
            <select
              className="input"
              value={field.isTotal ? 'total' : 'info'}
              onChange={(event) => {
                const isTotal = event.target.value === 'total'
                const next = { ...field }
                if (isTotal) next.isTotal = true
                else delete next.isTotal
                onChange(next)
              }}
            >
              <option value="total">Este es el total</option>
              <option value="info">Solo informativo</option>
            </select>
          </label>
        )}

        {field.type !== 'toggle' && (
          <>
            <label className="flex flex-col gap-1">
              <span className="label">Mínimo</span>
              <input
                className="input tnum"
                type="number"
                inputMode="numeric"
                placeholder="Sin límite"
                value={field.min ?? ''}
                onChange={(event) => setOptionalNumber('min', event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="label">Máximo</span>
              <input
                className="input tnum"
                type="number"
                inputMode="numeric"
                placeholder="Sin límite"
                value={field.max ?? ''}
                onChange={(event) => setOptionalNumber('max', event.target.value)}
              />
            </label>
          </>
        )}

        <label className="col-span-2 flex flex-col gap-1">
          <span className="label">Apartado (opcional)</span>
          <input
            className="input"
            placeholder="Construcciones, Bonos…"
            value={field.group ?? ''}
            maxLength={30}
            onChange={(event) => set('group', event.target.value || undefined)}
          />
        </label>

        <label className="col-span-2 flex flex-col gap-1">
          <span className="label">Clave interna</span>
          <input
            className="input font-mono text-sm disabled:opacity-60"
            value={field.key}
            maxLength={40}
            disabled={keyLocked}
            onChange={(event) => set('key', event.target.value)}
          />
          <span className="text-[11px] text-[var(--color-muted)]">
            {keyLocked
              ? 'No se puede cambiar: hay partidas apuntadas con esta clave.'
              : 'Con lo que se guardan las puntuaciones. Mejor no tocarla.'}
          </span>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={!!field.uniquePerMatch}
          onChange={(event) => {
            const next = { ...field }
            if (event.target.checked) next.uniquePerMatch = true
            else delete next.uniquePerMatch
            onChange(next)
          }}
        />
        Solo lo puede tener un jugador por partida
      </label>
    </section>
  )
}
