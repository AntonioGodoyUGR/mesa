/**
 * El muñeco de cada jugador: qué piezas lo forman y cómo viaja a la base de datos.
 *
 * No hay imágenes ni columnas nuevas. Un avatar es una lista corta de opciones que se
 * guarda como texto en `avatar_url` con el esquema propio `mesa:` —una URI tan válida
 * como cualquier otra—, así que un jugador de siempre, un invitado sin cuenta y uno
 * recién creado se tratan igual. Quien no tenga ninguno guardado recibe uno derivado
 * de su nombre: el mismo criterio que usaban las iniciales de colores.
 *
 * Aquí solo está la decisión; el dibujo es cosa de `components/Avatar.tsx`.
 */

export type HairStyle = 'calvo' | 'corto' | 'melena' | 'mono' | 'rizos' | 'cresta'
export type HatId = 'ninguno' | 'gorra' | 'corona' | 'chistera' | 'gorro' | 'cuernos'
export type AccessoryId =
  | 'ninguno'
  | 'gafas'
  | 'sol'
  | 'parche'
  | 'bigote'
  | 'mascarilla'

export interface AvatarLook {
  /** Índices en las paletas de abajo, no colores: así el avatar ocupa cuatro letras. */
  background: number
  skin: number
  shirt: number
  hair: HairStyle
  hairColor: number
  hat: HatId
  accessory: AccessoryId
}

/** Fondos del círculo. Tienen que aguantar el muñeco encima en claro y en oscuro. */
export const BACKGROUNDS = [
  '#f2c14e',
  '#e8825a',
  '#d95f7a',
  '#9a6cd1',
  '#4f8fd6',
  '#3fb59a',
  '#7fb548',
  '#8b98a8',
] as const

export const SKIN_TONES = [
  '#f8d7c0',
  '#f0bf9a',
  '#d99b6c',
  '#b9764a',
  '#8d5433',
  '#5c3520',
] as const

export const SHIRT_COLORS = [
  '#2f4f7f',
  '#a52233',
  '#1a7f4d',
  '#7028c3',
  '#c96a1f',
  '#1a757f',
  '#c2185b',
  '#2b2f38',
  '#eceff4',
] as const

export const HAIR_COLORS = [
  '#2b2118',
  '#5b3a21',
  '#a5682a',
  '#d9a441',
  '#b03a2e',
  '#8e9aaf',
  '#f0f0f0',
  '#3f8f6f',
  '#c8407f',
] as const

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'calvo', label: 'Sin pelo' },
  { id: 'corto', label: 'Corto' },
  { id: 'melena', label: 'Melena' },
  { id: 'mono', label: 'Moño' },
  { id: 'rizos', label: 'Rizos' },
  { id: 'cresta', label: 'Cresta' },
]

export const HATS: { id: HatId; label: string }[] = [
  { id: 'ninguno', label: 'Nada' },
  { id: 'gorra', label: 'Gorra' },
  { id: 'corona', label: 'Corona' },
  { id: 'chistera', label: 'Chistera' },
  { id: 'gorro', label: 'Gorro de lana' },
  { id: 'cuernos', label: 'Cuernos' },
]

export const ACCESSORIES: { id: AccessoryId; label: string }[] = [
  { id: 'ninguno', label: 'Nada' },
  { id: 'gafas', label: 'Gafas' },
  { id: 'sol', label: 'Gafas de sol' },
  { id: 'parche', label: 'Parche' },
  { id: 'bigote', label: 'Bigote' },
  { id: 'mascarilla', label: 'Mascarilla' },
]

/** Esquema propio: distingue un avatar compuesto aquí de una foto subida a un bucket. */
const PREFIX = 'mesa:1?'

/** Cada rasgo, con su clave corta en la URI y sus valores posibles. */
const HAIR_IDS = HAIR_STYLES.map((style) => style.id)
const HAT_IDS = HATS.map((hat) => hat.id)
const ACCESSORY_IDS = ACCESSORIES.map((accessory) => accessory.id)

export function serializeAvatar(look: AvatarLook): string {
  const params = new URLSearchParams({
    bg: String(look.background),
    sk: String(look.skin),
    sh: String(look.shirt),
    hr: look.hair,
    hc: String(look.hairColor),
    ht: look.hat,
    ac: look.accessory,
  })
  return PREFIX + params.toString()
}

/**
 * Texto guardado → avatar. Todo lo que no encaje se sustituye por el valor derivado
 * del nombre: un avatar a medias siempre es preferible a una pantalla rota.
 */
export function parseAvatar(value: string | null | undefined, name: string): AvatarLook {
  const fallback = lookFromName(name)
  if (!value || !value.startsWith(PREFIX)) return fallback

  const params = new URLSearchParams(value.slice(PREFIX.length))
  const index = (key: string, length: number, previous: number) => {
    // Ojo con el rasgo que no viene: `Number(null)` es 0, un índice perfectamente
    // válido, y el avatar se descolocaría en silencio.
    const raw = params.get(key)
    if (raw === null || raw.trim() === '') return previous
    const parsed = Number(raw)
    return Number.isInteger(parsed) && parsed >= 0 && parsed < length ? parsed : previous
  }
  const option = <T extends string>(key: string, allowed: T[], previous: T): T => {
    const parsed = params.get(key) as T | null
    return parsed && allowed.includes(parsed) ? parsed : previous
  }

  return {
    background: index('bg', BACKGROUNDS.length, fallback.background),
    skin: index('sk', SKIN_TONES.length, fallback.skin),
    shirt: index('sh', SHIRT_COLORS.length, fallback.shirt),
    hair: option('hr', HAIR_IDS, fallback.hair),
    hairColor: index('hc', HAIR_COLORS.length, fallback.hairColor),
    hat: option('ht', HAT_IDS, fallback.hat),
    accessory: option('ac', ACCESSORY_IDS, fallback.accessory),
  }
}

/** ¿Lo ha compuesto alguien, o es el que le ha tocado por su nombre? */
export function hasAvatar(value: string | null | undefined): boolean {
  return !!value && value.startsWith(PREFIX)
}

/**
 * Avatar de quien todavía no ha elegido el suyo.
 *
 * Sale del nombre, así que es estable: el mismo jugador se ve siempre igual en todos
 * los dispositivos sin guardar nada. Ni sombrero ni accesorio: eso se elige.
 */
export function lookFromName(name: string): AvatarLook {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 100003
  }
  // Cada rasgo usa un desplazamiento distinto del mismo número; si no, dos nombres
  // parecidos saldrían casi calcados.
  const pick = (length: number, shift: number) => Math.floor(hash / shift) % length

  return {
    background: pick(BACKGROUNDS.length, 1),
    skin: pick(SKIN_TONES.length, 7),
    shirt: pick(SHIRT_COLORS.length, 31),
    hair: HAIR_IDS[pick(HAIR_IDS.length, 97)],
    hairColor: pick(HAIR_COLORS.length, 211),
    hat: 'ninguno',
    accessory: 'ninguno',
  }
}

/** Un avatar al azar, para el botón «sorpréndeme» del editor. */
export function randomAvatar(random: () => number = Math.random): AvatarLook {
  const pick = <T>(options: readonly T[]): T =>
    options[Math.floor(random() * options.length)]

  return {
    background: Math.floor(random() * BACKGROUNDS.length),
    skin: Math.floor(random() * SKIN_TONES.length),
    shirt: Math.floor(random() * SHIRT_COLORS.length),
    hair: pick(HAIR_IDS),
    hairColor: Math.floor(random() * HAIR_COLORS.length),
    hat: pick(HAT_IDS),
    accessory: pick(ACCESSORY_IDS),
  }
}
