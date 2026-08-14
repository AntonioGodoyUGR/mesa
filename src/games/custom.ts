/**
 * Juegos creados por los usuarios.
 *
 * Un juego propio es exactamente lo mismo que uno integrado —un `GameDefinition`—, solo
 * que en vez de escribirse en un fichero de `definitions/` se compone en pantalla y se
 * guarda en la base de datos. Aquí vive todo lo que necesita ese camino y que no depende
 * ni de React ni de la red: generar el slug, validar lo que ha compuesto el usuario y
 * traducir entre el formulario y la definición.
 */
import { normalizeTools, validateTools } from './tools'
import type { GameDefinition, RuleSheet, ScoreField, ScoreFieldType } from './types'

/**
 * Prefijo reservado a los juegos de grupo.
 *
 * Separa los dos catálogos en la misma tabla: ningún juego integrado puede llamarse
 * `c-…`, así que `npm run seed:games` nunca pisará el juego de nadie. La base de datos
 * comprueba la misma invariante (`games_custom_slug_prefix`).
 */
export const CUSTOM_SLUG_PREFIX = 'c-'

export const MAX_CUSTOM_FIELDS = 12

/** Texto libre → trozo de URL: «Mi Juego Ñoño» → `mi-juego-nono`. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    // Tras NFD las tildes quedan sueltas: fuera todo lo que no sea ASCII imprimible.
    .replace(/[^\x20-\x7E]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

/**
 * Slug de un juego de grupo: `c-<nombre>-<4 al azar>`.
 * El sufijo evita que dos grupos que inventen el mismo nombre choquen; la unicidad
 * definitiva la garantiza la clave primaria en el servidor.
 */
export function customSlug(name: string, random: () => number = Math.random): string {
  const base = slugify(name) || 'juego'
  const suffix = Math.floor(random() * 0x10000)
    .toString(36)
    .padStart(4, '0')
    .slice(-4)
  return `${CUSTOM_SLUG_PREFIX}${base}-${suffix}`
}

export function isCustomSlug(slug: string): boolean {
  return slug.startsWith(CUSTOM_SLUG_PREFIX)
}

/** Clave estable de un campo a partir de su etiqueta, evitando las ya usadas. */
export function fieldKeyFor(label: string, taken: string[]): string {
  const base = slugify(label).replace(/-/g, '_') || 'campo'
  if (!taken.includes(base)) return base

  let index = 2
  while (taken.includes(`${base}_${index}`)) index += 1
  return `${base}_${index}`
}

/**
 * Paleta de colores del creador: la elige el usuario, no la escribe.
 *
 * Mismos criterios que las del catálogo: cada tono aguanta como texto sobre el fondo
 * claro, como fondo con texto blanco y aclarado sobre el oscuro. Por eso son más
 * profundos de lo que parecería a simple vista.
 */
export const CUSTOM_PALETTE = [
  '#0f5499',
  '#a52233',
  '#1a7f4d',
  '#7028c3',
  '#90390e',
  '#1a757f',
  '#981f84',
  '#7f571a',
  '#3f4a56',
] as const

/** El tema de un juego del grupo es solo su color: el resto lo pone la hoja de estilos. */
export function themeFrom(primary: string) {
  return { primary }
}

/** Definición de partida del formulario: lo más simple que puede ser un juego. */
export function blankCustomGame(): GameDefinition {
  return {
    slug: '',
    name: '',
    icon: '🎲',
    tagline: '',
    theme: themeFrom(CUSTOM_PALETTE[0]),
    minPlayers: 2,
    maxPlayers: 6,
    scoreLabel: 'Puntos',
    scoreLabelShort: 'Pts',
    totalMode: 'explicit',
    winnerRule: 'highest',
    fields: [
      {
        key: 'points',
        label: 'Puntos',
        icon: '⭐',
        type: 'number',
        points: 1,
        isTotal: true,
      },
    ],
  }
}

/** Campo nuevo al pulsar «añadir campo», con una clave que no choque. */
export function blankField(taken: string[]): ScoreField {
  return {
    key: fieldKeyFor('campo', taken),
    label: '',
    icon: '⭐',
    type: 'counter',
    points: 1,
    min: 0,
  }
}

export const FIELD_TYPE_LABELS: Record<ScoreFieldType, string> = {
  counter: 'Contador − / +',
  number: 'Número tecleado',
  toggle: 'Sí o no',
}

/**
 * Comprueba que la definición compuesta por el usuario es coherente.
 * Son las mismas invariantes que `registry.test.ts` exige a los juegos integrados,
 * porque a partir de aquí el motor las trata exactamente igual.
 */
export function validateDefinition(game: GameDefinition): string[] {
  const problems: string[] = []

  if (!game.name.trim()) problems.push('El juego necesita un nombre.')
  if (game.name.trim().length > 60) problems.push('El nombre no puede pasar de 60 caracteres.')
  if (!game.scoreLabel.trim()) problems.push('Dile cómo se llaman los puntos en tu juego.')
  if (!game.scoreLabelShort.trim()) {
    problems.push('Falta la forma corta de los puntos, para las columnas estrechas.')
  }

  if (game.minPlayers < 1) problems.push('El mínimo de jugadores es 1.')
  if (game.maxPlayers > 20) problems.push('El máximo de jugadores es 20.')
  if (game.minPlayers > game.maxPlayers) {
    problems.push('El mínimo de jugadores no puede ser mayor que el máximo.')
  }

  // La duración es opcional (sin ella el juego no sale al filtrar por duración),
  // pero si se declara tiene que ser un intervalo con sentido.
  if (game.playTime) {
    if (game.playTime.min < 1) {
      problems.push('La partida tiene que durar al menos un minuto.')
    }
    if (game.playTime.max < game.playTime.min) {
      problems.push('La duración mínima no puede ser mayor que la máxima.')
    }
    if (game.playTime.max > 1440) {
      problems.push('La duración no puede pasar de un día (1440 min).')
    }
  }

  if (game.fields.length === 0) {
    problems.push('Añade al menos un campo de puntuación.')
  }
  if (game.fields.length > MAX_CUSTOM_FIELDS) {
    problems.push(`Como mucho ${MAX_CUSTOM_FIELDS} campos de puntuación.`)
  }

  const keys = game.fields.map((field) => field.key)
  if (new Set(keys).size !== keys.length) {
    problems.push('Hay dos campos con la misma clave interna.')
  }
  if (keys.some((key) => !key.trim())) {
    problems.push('Todos los campos necesitan una clave interna.')
  }

  game.fields.forEach((field, index) => {
    if (!field.label.trim()) problems.push(`El campo ${index + 1} no tiene nombre.`)
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
      problems.push(`«${field.label || `Campo ${index + 1}`}»: el mínimo supera al máximo.`)
    }
  })

  problems.push(...validateTools(game.tools))

  const totals = game.fields.filter((field) => field.isTotal)
  if (game.totalMode === 'explicit' && totals.length !== 1) {
    problems.push(
      'Si apuntas solo el total, marca exactamente un campo como «este es el total».',
    )
  }
  if (game.totalMode === 'computed') {
    if (totals.length > 0) {
      problems.push('Si el total se suma, ningún campo puede ser «el total».')
    }
    if (!game.fields.some((field) => field.points !== undefined)) {
      problems.push('Al menos un campo tiene que dar puntos para poder sumar el total.')
    }
  }

  return problems
}

// ---------------------------------------------------------------------------
// Reglas: una línea = un elemento
// ---------------------------------------------------------------------------

/** Texto de un `<textarea>` → lista, ignorando líneas en blanco. */
export function parseRuleLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function formatRuleLines(lines: string[] | undefined): string {
  return (lines ?? []).join('\n')
}

/** Parte una línea «izquierda · derecha» por el primer punto medio. */
function splitPair(line: string): [string, string] {
  const separator = line.indexOf('·')
  if (separator === -1) return [line.trim(), '']
  return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
}

/** «Nombre · detalle» por línea, para las fases del turno. */
export function parseTurnPhases(text: string): { name: string; detail: string }[] {
  return parseRuleLines(text).map((line) => {
    const [name, detail] = splitPair(line)
    return { name, detail }
  })
}

export function formatTurnPhases(
  phases: { name: string; detail: string }[] | undefined,
): string {
  return (phases ?? []).map((phase) => `${phase.name} · ${phase.detail}`).join('\n')
}

/** «Qué puntúa · cuánto» por línea, para la tabla de puntuación. */
export function parseScoringRows(text: string): { what: string; points: string }[] {
  return parseRuleLines(text).map((line) => {
    const [what, points] = splitPair(line)
    return { what, points }
  })
}

export function formatScoringRows(
  rows: { what: string; points: string }[] | undefined,
): string {
  return (rows ?? []).map((row) => `${row.what} · ${row.points}`).join('\n')
}

/** Quita los apartados vacíos; si no queda ninguno, el juego se guarda sin reglas. */
export function cleanRules(rules: RuleSheet): RuleSheet | undefined {
  const cleaned: RuleSheet = {}

  if (rules.players?.trim()) cleaned.players = rules.players.trim()
  if (rules.duration?.trim()) cleaned.duration = rules.duration.trim()
  if (rules.setup?.length) cleaned.setup = rules.setup
  if (rules.turn?.length) cleaned.turn = rules.turn.filter((phase) => phase.name)
  if (rules.scoring?.length) cleaned.scoring = rules.scoring.filter((row) => row.what)
  if (rules.endCondition?.trim()) cleaned.endCondition = rules.endCondition.trim()
  if (rules.reminders?.length) cleaned.reminders = rules.reminders
  if (rules.officialLink?.url?.trim()) {
    cleaned.officialLink = {
      label: rules.officialLink.label.trim() || 'Más información',
      url: rules.officialLink.url.trim(),
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

/**
 * Deja la definición lista para guardar: recorta textos, quita reglas vacías y
 * descarta los campos a medio escribir.
 */
export function normalizeDefinition(game: GameDefinition): GameDefinition {
  const normalized: GameDefinition = {
    ...game,
    name: game.name.trim(),
    tagline: game.tagline.trim(),
    scoreLabel: game.scoreLabel.trim(),
    scoreLabelShort: game.scoreLabelShort.trim(),
    fields: game.fields.map((field) => ({
      ...field,
      label: field.label.trim(),
      hint: field.hint?.trim() || undefined,
      group: field.group?.trim() || undefined,
      // Un campo «sí o no» siempre vale 0 o 1: los límites no pintan nada.
      min: field.type === 'toggle' ? undefined : field.min,
      max: field.type === 'toggle' ? undefined : field.max,
    })),
    tools: normalizeTools(game.tools),
    rules: game.rules ? cleanRules(game.rules) : undefined,
  }

  if (!normalized.tools) delete normalized.tools
  if (!normalized.rules) delete normalized.rules
  if (!normalized.imageUrl) delete normalized.imageUrl
  if (!normalized.playTime) delete normalized.playTime
  if (!normalized.difficulty) delete normalized.difficulty

  return normalized
}

/**
 * Fila de la tabla `games` → definición.
 * La columna `definition` guarda la definición íntegra, así que basta con volver a
 * pegarle lo que sí vive en columnas propias (la imagen y el grupo se pueden actualizar
 * sin reescribir el jsonb).
 */
export function toDefinition(row: {
  slug: string
  image_url?: string | null
  group_id?: string | null
  created_by?: string | null
  definition: unknown
}): GameDefinition {
  const definition = row.definition as GameDefinition
  return {
    ...definition,
    slug: row.slug,
    imageUrl: row.image_url ?? definition.imageUrl,
    groupId: row.group_id ?? undefined,
    createdBy: row.created_by ?? undefined,
  }
}
