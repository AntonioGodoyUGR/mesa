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
  /**
   * Anima la entrada: las piezas de cada palabra convergen hacia el centro y el
   * dado cae encima. Solo la portada de login lo usa; la cabecera va quieta.
   * Los `@keyframes` viven en `index.css` y respetan `prefers-reduced-motion`.
   */
  animated?: boolean
  className?: string
}

/**
 * El meeple que hace de «A». Un pelo más alto que la mayúscula, como un asta.
 *
 * El contorno es el truco: el mismo trazo del relleno, con las esquinas en
 * `round`, redondea de una vez los catorce vértices de la ficha y de paso le
 * engorda los brazos y las piernas. Así el dibujo casa con la letra —que es
 * redonda y de palo grueso— sin volver a trazar la silueta. Por eso el
 * `viewBox` se abre 4 unidades por lado: el trazo sobresale y si no, se corta.
 */
function Meeple({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="-4 -4 72 72"
      className={`h-[0.80em] w-[0.88em] shrink-0 text-[var(--color-accent)] ${className}`}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="32" cy="12" r="9" />
      <path d="M21 23H43L47 30H63V45L47 42L57 64H39L32 52L25 64H7L17 42L1 45V30H17Z" />
    </svg>
  )
}

/**
 * El dado que separa las dos palabras, escorado como si acabara de caer. Las
 * esquinas van casi de píldora (`rx` 19 de 52) para acompañar a la letra, y los
 * puntos crecen a la vez: en un cuadrado más redondo, tres puntos pequeños se
 * quedaban perdidos en el centro.
 */
function Die({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`mx-[0.14em] h-[0.72em] w-[0.72em] shrink-0 -rotate-6 ${className}`}
      aria-hidden="true"
    >
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
      />
      <g fill="var(--color-accent)">
        <circle cx="19.5" cy="44.5" r="7" />
        <circle cx="32" cy="32" r="7" />
        <circle cx="44.5" cy="19.5" r="7" />
      </g>
    </svg>
  )
}

export function Logo({ stacked = false, animated = false, className = '' }: LogoProps) {
  // Cada palabra se compone convergiendo: su mitad izquierda entra por la
  // izquierda y la derecha por la derecha. Sin animar, las clases quedan vacías
  // y no pintan nada. El detalle del movimiento vive en `index.css`.
  const left = animated ? 'logo-part-l' : ''
  const right = animated ? 'logo-part-r' : ''
  const die = animated ? 'logo-die' : ''

  // Las letras se parten en trozos para colar los iconos donde iría su letra.
  // Fuera del `aria-label` no hay texto que leer: suelto, «T BLE» no dice nada.
  const table = (
    <>
      <span aria-hidden="true" className={left}>
        T
      </span>
      <Meeple className={left} />
      <span aria-hidden="true" className={right}>
        BLE
      </span>
    </>
  )
  const tracker = (
    <>
      <span aria-hidden="true" className={left}>
        TR
      </span>
      <Meeple className={left} />
      <span aria-hidden="true" className={right}>
        CKER
      </span>
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
          <Die className={die} />
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
      <Die className={die} />
      {tracker}
    </span>
  )
}
