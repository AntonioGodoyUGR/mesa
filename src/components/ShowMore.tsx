import { useState } from 'react'

/**
 * Listas largas que se van enseñando por tandas.
 *
 * El catálogo pasó de veintitantos juegos a varios cientos: pintarlos todos de golpe
 * deja al móvil con cuatrocientas filas y cuatrocientas portadas que descargar para
 * ver las seis primeras. Se enseña una tanda y un botón para pedir la siguiente.
 *
 * El tope NO se reinicia al cambiar el filtro a propósito: quien ha pedido ver más
 * juegos sigue viéndolos mientras busca, y al filtrar la lista es más corta de todas
 * formas. Quien no toca nada ve siempre la primera tanda.
 */
const BATCH = 24

export function usePaged<T>(items: T[], batch: number = BATCH) {
  const [limit, setLimit] = useState(batch)

  return {
    shown: items.slice(0, limit),
    /** Cuántos quedan por enseñar. */
    hidden: Math.max(0, items.length - limit),
    showMore: () => setLimit((current) => current + batch),
  }
}

/**
 * Botón de «ver más». No pinta nada cuando ya está la lista entera.
 *
 * Sirve para las dos formas de paginar que hay ahora. Una lista que ya está en memoria
 * sabe cuántos quedan y lo dice (`hidden`); el catálogo, que llega por tandas desde el
 * servidor, solo sabe si queda algo más (`more`) — y contar el total sería una consulta
 * aparte sobre decenas de miles de filas para poner un número entre paréntesis.
 */
export function ShowMore({
  hidden,
  more,
  loading = false,
  onClick,
}: {
  hidden?: number
  more?: boolean
  loading?: boolean
  onClick: () => void
}) {
  const pending = more ?? (hidden ?? 0) > 0
  if (!pending) return null

  return (
    <button
      type="button"
      className="btn btn-ghost w-full"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? 'Cargando…' : 'Ver más juegos'}
      {!loading && !!hidden && <span className="tnum text-[var(--color-muted)]">({hidden})</span>}
    </button>
  )
}
