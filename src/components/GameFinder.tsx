import { useId, useState, type ReactNode } from 'react'
import {
  DIFFICULTY_OPTIONS,
  DURATION_OPTIONS,
  NO_FILTERS,
  PLAYER_OPTIONS,
  activeFilterCount,
  toggleFilter,
  type FilterOption,
  type GameFilters,
} from '../games/filters'

/**
 * Buscador de juegos: caja de texto + filtros de duración, dificultad y jugadores.
 *
 * No filtra nada por su cuenta —de eso se encarga `filterGames`— ni guarda el estado:
 * lo sube al padre para que la pantalla decida qué pinta con el resultado. Los filtros
 * empiezan plegados porque en el móvil la rejilla de juegos es lo importante.
 */
export function GameFinder({
  filters,
  onChange,
  placeholder = 'Buscar juego…',
  results,
  total,
}: {
  filters: GameFilters
  onChange: (next: GameFilters) => void
  placeholder?: string
  /** Cuántos juegos han pasado el filtro. */
  results: number
  /** Cuántos había antes de filtrar. */
  total: number
}) {
  const panelId = useId()
  const active = activeFilterCount(filters)
  const [open, setOpen] = useState(active > 0)

  function set(patch: Partial<GameFilters>) {
    onChange({ ...filters, ...patch })
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          className="input"
          type="search"
          placeholder={placeholder}
          value={filters.query}
          onChange={(event) => set({ query: event.target.value })}
        />
        <button
          type="button"
          className="btn btn-ghost shrink-0 px-3 py-1.5 text-sm"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true">⚙️</span>
          Filtros
          {active > 0 && (
            <span className="tnum rounded-full bg-[var(--color-brand)] px-1.5 text-xs font-bold text-[var(--color-brand-ink)]">
              {active}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div id={panelId} className="card flex flex-col gap-3 p-3">
          <Group label="Duración de la partida">
            {DURATION_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                option={option}
                active={filters.durations.includes(option.id)}
                onClick={() =>
                  set({ durations: toggleFilter(filters.durations, option.id) })
                }
              />
            ))}
          </Group>

          <Group label="Dificultad">
            {DIFFICULTY_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                option={option}
                active={filters.difficulties.includes(option.id)}
                onClick={() =>
                  set({ difficulties: toggleFilter(filters.difficulties, option.id) })
                }
              />
            ))}
          </Group>

          <Group label="Cuántos vais a jugar">
            {PLAYER_OPTIONS.map((count) => (
              <Chip
                key={count}
                option={{
                  id: count,
                  label: String(count),
                  hint: `${count} jugadores`,
                  icon: '',
                }}
                active={filters.players === count}
                // Volver a tocar el número puesto quita el filtro.
                onClick={() => set({ players: filters.players === count ? null : count })}
              />
            ))}
          </Group>
        </div>
      )}

      {(active > 0 || filters.query.trim().length > 0) && (
        <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span className="tnum">
            {results} de {total} juegos
          </span>
          <button
            type="button"
            className="font-semibold text-[var(--color-brand)] underline"
            onClick={() => onChange(NO_FILTERS)}
          >
            Quitar filtros
          </button>
        </p>
      )}
    </section>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1.5">
      <span className="label mb-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip<T>({
  option,
  active,
  onClick,
}: {
  option: FilterOption<T>
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={option.hint}
      onClick={onClick}
      className={`chip ${active ? 'chip-on' : ''}`}
    >
      {option.icon && <span aria-hidden="true">{option.icon}</span>}
      {option.label}
    </button>
  )
}
