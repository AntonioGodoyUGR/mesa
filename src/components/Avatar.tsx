import {
  BACKGROUNDS,
  HAIR_COLORS,
  SHIRT_COLORS,
  SKIN_TONES,
  parseAvatar,
  type AvatarLook,
} from '../lib/avatar'

/**
 * El muñeco de un jugador: busto dentro de un círculo, dibujado con SVG.
 *
 * Nada de imágenes ni de red: el avatar es la cadena que viene en `avatar_url`
 * (`lib/avatar.ts` decide qué significa) y aquí solo se pinta. Quien no tenga
 * ninguno guardado recibe el que le toca por su nombre, así que ningún jugador
 * antiguo se queda sin cara.
 *
 * Todo se dibuja sobre un lienzo de 100×100 y se escala con `size`: en la lista de
 * jugadores mide 40 y en el editor 160, con el mismo trazo relativo.
 */
export function Avatar({
  name,
  avatar,
  size = 36,
  registered = false,
}: {
  name: string
  /** Lo guardado en `players.avatar_url`; si falta, se deriva del nombre. */
  avatar?: string | null
  size?: number
  registered?: boolean
}) {
  const look = parseAvatar(avatar, name)

  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <AvatarFace
        look={look}
        className="h-full w-full rounded-full border-2 border-[var(--color-border)]"
      />
      {!registered && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] text-[8px] text-[var(--color-muted)]"
          title="Invitado sin cuenta"
        >
          ·
        </span>
      )}
    </span>
  )
}

/** El dibujo pelado, sin el marco ni la marca de invitado: lo que usa el editor. */
export function AvatarFace({
  look,
  className,
}: {
  look: AvatarLook
  className?: string
}) {
  const skin = SKIN_TONES[look.skin]
  const shirt = SHIRT_COLORS[look.shirt]
  const hair = HAIR_COLORS[look.hairColor]

  return (
    <svg viewBox="0 0 100 100" className={className} role="presentation">
      <rect width="100" height="100" fill={BACKGROUNDS[look.background]} />

      {/* Cuello y torso primero: la cabeza se apoya encima. */}
      <rect x="43" y="54" width="14" height="16" rx="6" fill={skin} />
      <path
        d="M16 100 v-6 c0-16 15-28 34-28 s34 12 34 28 v6 z"
        fill={shirt}
      />

      <HairBack look={look} color={hair} />

      <circle cx="28" cy="42" r="4.5" fill={skin} />
      <circle cx="72" cy="42" r="4.5" fill={skin} />
      <ellipse cx="50" cy="40" rx="21" ry="23" fill={skin} />

      <HairFront look={look} color={hair} />

      <circle cx="42" cy="38" r="3" fill="#2b2118" />
      <circle cx="58" cy="38" r="3" fill="#2b2118" />
      <path
        d="M43 49 q7 6 14 0"
        fill="none"
        stroke="#2b2118"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <Accessory look={look} color={hair} />
      <Hat look={look} shirt={shirt} />
    </svg>
  )
}

/** Lo que va DETRÁS de la cabeza: la melena que cae y el volumen de los rizos. */
function HairBack({ look, color }: { look: AvatarLook; color: string }) {
  if (look.hair === 'melena') {
    return (
      <path
        d="M26 40 a24 24 0 0 1 48 0 v22 q-6 5 -11 2 v-24 a13 13 0 0 0 -26 0 v24 q-5 3 -11 -2 z"
        fill={color}
      />
    )
  }

  if (look.hair === 'rizos') {
    return (
      <g fill={color}>
        <circle cx="33" cy="26" r="11" />
        <circle cx="50" cy="19" r="12" />
        <circle cx="67" cy="26" r="11" />
      </g>
    )
  }

  if (look.hair === 'mono') {
    return <circle cx="50" cy="13" r="9" fill={color} />
  }

  return null
}

/** Y lo que va DELANTE: el flequillo, que tapa la frente. */
function HairFront({ look, color }: { look: AvatarLook; color: string }) {
  if (look.hair === 'calvo') return null

  if (look.hair === 'cresta') {
    return (
      <g fill={color}>
        {/* Los lados rapados, en tono suave: sin ellos la cresta parece un gorro. */}
        <path d="M29 38 a21 22 0 0 1 42 0 q-5 -6 -21 -6 t-21 6 z" fillOpacity="0.35" />
        <path d="M50 4 c7 11 10 21 10 28 h-20 c0 -7 3 -17 10 -28 z" />
      </g>
    )
  }

  // Casquete común: un arco por encima de la cabeza con el borde inferior curvado.
  return <path d="M27 40 a23 23 0 0 1 46 0 q-4 -13 -23 -13 t-23 13 z" fill={color} />
}

function Accessory({ look, color }: { look: AvatarLook; color: string }) {
  switch (look.accessory) {
    case 'gafas':
      return (
        <g fill="none" stroke="#2b2118" strokeWidth="2.5">
          <circle cx="42" cy="38" r="8" fill="#ffffff" fillOpacity="0.28" />
          <circle cx="58" cy="38" r="8" fill="#ffffff" fillOpacity="0.28" />
          <path d="M50 38 h0.5" strokeLinecap="round" />
          <path d="M34 37 l-6 -2 M66 37 l6 -2" strokeLinecap="round" />
        </g>
      )

    case 'sol':
      return (
        <g fill="#2b2118">
          <rect x="33" y="32" width="16" height="12" rx="5" />
          <rect x="51" y="32" width="16" height="12" rx="5" />
          <path d="M49 36 h2 v2 h-2 z" />
          <path
            d="M33 35 l-6 -2 M67 35 l6 -2"
            stroke="#2b2118"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )

    case 'parche':
      return (
        <g>
          <path d="M30 31 L72 36" stroke="#2b2118" strokeWidth="2" fill="none" />
          <ellipse cx="42" cy="38" rx="8.5" ry="7.5" fill="#2b2118" />
        </g>
      )

    case 'bigote':
      return (
        <path
          d="M37 45 q6 -5 13 -1 q7 -4 13 1 q-6 7 -13 2 q-7 5 -13 -2 z"
          fill={color}
        />
      )

    case 'mascarilla':
      return (
        <g>
          <path
            d="M33 41 h34 v7 c0 9 -8 14 -17 14 s-17 -5 -17 -14 z"
            fill="#eceff4"
            stroke="#9aa7b4"
            strokeWidth="1.5"
          />
          <path
            d="M33 43 l-6 -3 M67 43 l6 -3"
            stroke="#9aa7b4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )

    default:
      return null
  }
}

function Hat({ look, shirt }: { look: AvatarLook; shirt: string }) {
  switch (look.hat) {
    case 'gorra':
      return (
        <g fill={shirt}>
          <path d="M27 34 a23 23 0 0 1 46 0 z" />
          <rect x="46" y="30" width="34" height="7" rx="3.5" />
        </g>
      )

    case 'corona':
      return (
        <path
          d="M30 22 v-14 l8 6 l12 -11 l12 11 l8 -6 v14 z"
          fill="#f2c14e"
          stroke="#a97c1a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )

    case 'chistera':
      return (
        <g>
          <rect x="32" y="2" width="36" height="21" fill="#2b2f38" />
          <rect x="32" y="15" width="36" height="6" fill="#a52233" />
          <rect x="20" y="21" width="60" height="6" rx="3" fill="#2b2f38" />
        </g>
      )

    case 'gorro':
      return (
        <g fill={shirt}>
          <path d="M28 31 a22 21 0 0 1 44 0 z" />
          <rect x="26" y="27" width="48" height="8" rx="4" />
          <circle cx="50" cy="9" r="6" fill="#eceff4" />
        </g>
      )

    case 'cuernos':
      return (
        <g fill="#b8452f">
          <path d="M32 26 c-7 -5 -10 -14 -6 -21 c7 3 12 10 12 17 z" />
          <path d="M68 26 c7 -5 10 -14 6 -21 c-7 3 -12 10 -12 17 z" />
        </g>
      )

    default:
      return null
  }
}
