/**
 * El logotipo de «Table Tracker»: la marca escrita, no una imagen.
 *
 * Va dibujada en línea a propósito. La «A» de cada palabra es un meeple —la
 * cabeza hace de vértice y los brazos de travesaño— y el hueco entre las dos
 * palabras lo ocupa un dado, así que el nombre y los iconos son la misma pieza y
 * no hay un PNG que se quede desalineado. Solo usa `currentColor` y
 * `--color-accent`, de modo que hereda el color de donde se ponga y funciona
 * igual en claro y en oscuro; el tamaño sale del tipo de letra del contenedor,
 * que es lo único que hay que decidir al colocarlo.
 */

interface LogoProps {
  /** Apilado en dos líneas para las portadas; en una sola para la cabecera. */
  stacked?: boolean
  className?: string
}

/** El meeple que hace de «A». Un pelo más alto que la mayúscula, como un asta. */
function Meeple() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-[0.84em] w-[0.86em] shrink-0 text-[var(--color-accent)]"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="32" cy="12" r="11.5" />
      <path d="M21 23H43L47 30H63V45L47 42L57 64H39L32 52L25 64H7L17 42L1 45V30H17Z" />
    </svg>
  )
}

/** El dado que separa las dos palabras, escorado como si acabara de caer. */
function Die() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="mx-[0.16em] h-[0.74em] w-[0.74em] shrink-0 -rotate-6"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="5"
        width="54"
        height="54"
        rx="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
      />
      <g fill="var(--color-accent)">
        <circle cx="19" cy="45" r="6.5" />
        <circle cx="32" cy="32" r="6.5" />
        <circle cx="45" cy="19" r="6.5" />
      </g>
    </svg>
  )
}

export function Logo({ stacked = false, className = '' }: LogoProps) {
  // Las letras se parten en trozos para colar los iconos donde iría su letra.
  // Fuera del `aria-label` no hay texto que leer: suelto, «T BLE» no dice nada.
  const table = (
    <>
      <span aria-hidden="true">T</span>
      <Meeple />
      <span aria-hidden="true">BLE</span>
    </>
  )
  const tracker = (
    <>
      <span aria-hidden="true">TR</span>
      <Meeple />
      <span aria-hidden="true">CKER</span>
    </>
  )

  if (stacked) {
    return (
      <span
        role="img"
        aria-label="Table Tracker"
        className={`display inline-flex flex-col items-center leading-[0.92] ${className}`}
      >
        <span className="flex items-baseline">
          {table}
          <Die />
        </span>
        <span className="flex items-baseline">{tracker}</span>
      </span>
    )
  }

  return (
    <span
      role="img"
      aria-label="Table Tracker"
      className={`display inline-flex items-baseline leading-none ${className}`}
    >
      {table}
      <Die />
      {tracker}
    </span>
  )
}
