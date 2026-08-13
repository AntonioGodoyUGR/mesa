/**
 * Modelo de datos que parametriza un juego de mesa.
 *
 * Toda la aplicación (UI, base de datos y estadísticas) se construye a partir de estas
 * estructuras: añadir un juego nuevo consiste en crear un fichero en `definitions/`
 * y registrarlo. No debe haber ni un solo `if (slug === 'catan')` fuera de este directorio.
 */

/** Cómo se introduce un campo de puntuación en la hoja. */
export type ScoreFieldType =
  /** Contador con botones −/+ (pueblos, ciudades…). */
  | 'counter'
  /** Número tecleado directamente (puntuaciones altas: Carcassonne, monedas). */
  | 'number'
  /** Sí/no (camino más largo, ejército más grande). */
  | 'toggle'

export interface ScoreField {
  /** Clave estable. Es la que se guarda en el `jsonb` de puntuaciones: nunca renombrar. */
  key: string
  /** El nombre TAL CUAL se llama en el juego: «Pueblos», «Ciudades», «Monedas». */
  label: string
  /** Nombre corto para cabeceras de tabla estrechas. */
  short?: string
  /** Glifo característico del concepto. */
  icon: string
  type: ScoreFieldType
  /**
   * Puntos que aporta cada unidad (pueblo = 1, ciudad = 2, camino más largo = 2).
   * Si es `undefined`, el campo es informativo y no suma.
   */
  points?: number
  /** Este campo ES el total de la partida (solo en `totalMode: 'explicit'`). */
  isTotal?: boolean
  /** Agrupación visual dentro de la hoja: «Construcciones», «Bonos»… */
  group?: string
  min?: number
  max?: number
  /** Valor inicial. Por defecto 0 / false. */
  defaultValue?: number | boolean
  /** Solo un jugador de la partida puede tenerlo activo (cartas especiales). */
  uniquePerMatch?: boolean
  /** Se muestra en la tarjeta resumen del historial. */
  showInSummary?: boolean
  /** Ayuda breve mostrada bajo el campo. */
  hint?: string
}

/**
 * Chuleta de reglas: datos estructurados, no prosa, para que quepa en dos pantallas.
 *
 * Todos los apartados son opcionales porque los juegos que crea un usuario pueden no
 * traer reglas, o traer solo las dos que le interesan. `RuleSheetView` pinta lo que haya.
 * Los juegos integrados sí las llevan completas: lo comprueba `registry.test.ts`.
 */
export interface RuleSheet {
  players?: string
  duration?: string
  /** Preparación, un paso por línea. */
  setup?: string[]
  /** Fases del turno en orden. */
  turn?: { name: string; detail: string }[]
  /** Tabla de puntuación: qué puntúa y cuánto. */
  scoring?: { what: string; points: string }[]
  /** Cuándo acaba la partida y quién gana. */
  endCondition?: string
  /** Reglas que siempre se olvidan o se juegan mal. */
  reminders?: string[]
  /** Enlace a la página oficial del editor (no se empaqueta el PDF: es material con copyright). */
  officialLink?: { label: string; url: string }
}

export interface GameTheme {
  /** Color principal del juego, usado en el icono y los acentos. */
  primary: string
  /** Color secundario para degradados y estados activos. */
  accent: string
  /** Fondo suave de las tarjetas del juego. */
  surface: string
}

export interface GameDefinition {
  /** Identificador en URLs y base de datos. */
  slug: string
  name: string
  /** Icono característico del juego en la pantalla principal. */
  icon: string
  /** Frase de una línea para la tarjeta. */
  tagline: string
  theme: GameTheme
  minPlayers: number
  maxPlayers: number
  /** Cómo se llaman los puntos EN ESTE JUEGO: «Puntos de victoria», «Monedas»… */
  scoreLabel: string
  /** Forma corta para columnas de tabla: «PV», «Pts», «€». */
  scoreLabelShort: string
  /**
   * `computed`: el total se deriva sumando `valor × points` de cada campo.
   * `explicit`: el total es el campo marcado con `isTotal`.
   */
  totalMode: 'computed' | 'explicit'
  /** Gana la puntuación más alta o la más baja. */
  winnerRule: 'highest' | 'lowest'
  /** Puntuación objetivo, si el juego la tiene (Catán = 10). */
  targetScore?: number
  fields: ScoreField[]
  /** Chuleta de reglas. Opcional: un juego creado por un usuario puede no tenerla. */
  rules?: RuleSheet
  /** Portada del juego. Si falta se pinta el `icon` sobre el color del tema. */
  imageUrl?: string
  /**
   * Grupo al que pertenece, solo en los juegos creados por usuarios.
   * Los del catálogo oficial no lo llevan y los ve todo el mundo.
   */
  groupId?: string
  /** Quién lo creó, solo en los juegos de grupo. */
  createdBy?: string
}

/** ¿Lo ha creado un usuario o viene en el catálogo oficial? */
export function isCustomGame(game: GameDefinition): boolean {
  return game.groupId !== undefined
}

/** Puntuaciones de un jugador en una partida, indexadas por `ScoreField.key`. */
export type ScoreValues = Record<string, number | boolean>
