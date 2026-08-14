import { LIBRARY_STATUSES, nextLibraryStatus } from '../lib/library'
import type { LibraryStatus } from '../lib/types'

/**
 * Los dos botones de la biblioteca: «La tengo» y «La quiero».
 *
 * Son excluyentes —un juego comprado ya no se desea— y volver a pulsar el que está
 * marcado lo saca de la biblioteca, que es como se corrige una pulsación sin querer
 * sin necesidad de un tercer botón de «quitar».
 */
export function LibraryToggle({
  gameName,
  status,
  onChange,
  disabled = false,
  compact = false,
}: {
  /** Solo para el nombre accesible: en una lista hay muchos pares de botones iguales. */
  gameName: string
  status: LibraryStatus | undefined
  onChange: (next: LibraryStatus | null) => void
  disabled?: boolean
  /** Sin texto, solo el icono: para las filas estrechas de la lista. */
  compact?: boolean
}) {
  return (
    <span className="flex shrink-0 gap-1">
      {LIBRARY_STATUSES.map((info) => {
        const active = status === info.id
        return (
          <button
            key={info.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-label={`${info.label}: ${gameName}`}
            title={info.hint}
            onClick={() => onChange(nextLibraryStatus(status, info.id))}
            className={`chip disabled:opacity-50 ${active ? 'chip-on' : ''}`}
          >
            <span aria-hidden="true">{info.icon}</span>
            {!compact && info.label}
          </button>
        )
      })}
    </span>
  )
}
