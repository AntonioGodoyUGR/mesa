/**
 * El motor del catálogo amplio: las cinco hojas de puntuación genéricas y las paletas.
 *
 * Los juegos de `definitions/` están escritos a mano uno a uno: traen su hoja de
 * puntuación con los conceptos del juego («pueblos», «ciudades», «camino más largo»)
 * y su chuleta de reglas. Eso no escala a decenas de miles de títulos, y tampoco haría
 * falta: para la mayoría, lo que se quiere apuntar es quién ganó y con cuántos puntos.
 *
 * Así que un juego del catálogo se describe con muy poco —nombre, jugadores, duración,
 * dificultad y cuál de las cinco hojas usa— y este fichero lo convierte en una
 * `GameDefinition` completa. Un juego del catálogo se comporta igual que uno escrito
 * a mano en todo lo demás: sale en el buscador, en la biblioteca y en las estadísticas.
 *
 * Esto es código, no datos: pesa lo mismo con 400 juegos que con 40.000, y por eso es
 * lo único que viaja en el bundle. Las filas están en Postgres y llegan por
 * `search_catalog`; su semilla se escribe en `scripts/catalog.data.ts`.
 *
 * Si un juego del catálogo se merece su hoja detallada, se le escribe su fichero en
 * `definitions/` y se borra su fila de la semilla: el registro da prioridad a la
 * definición escrita a mano.
 */
// La extensión no es un descuido: este fichero lo importa también la función
// `resolve-game`, que corre en Deno, y allí los módulos se piden con su nombre
// completo. A Vite y a TypeScript les da igual (`allowImportingTsExtensions`).
import type { GameDefinition, GameDifficulty, GameTheme, ScoreField } from './types.ts'

/** Cuál de las cinco hojas de aquí abajo usa un juego del catálogo. */
export type SheetId = 'points' | 'lowest' | 'coop' | 'teams' | 'win'

/**
 * Una fila de la semilla (`scripts/catalog.data.ts`), en tupla para que quepa en una
 * línea. El tipo vive aquí, con la función que la expande, y no con los datos: es el
 * formato que entiende el motor, y los datos son solo un fichero que lo cumple.
 */
export type CatalogRow = readonly [
  slug: string,
  name: string,
  icon: string,
  tagline: string,
  minPlayers: number,
  maxPlayers: number,
  minTime: number,
  maxTime: number,
  difficulty: GameDifficulty,
  sheet: SheetId,
]

/**
 * Las cuatro formas de apuntar el resultado de una partida.
 *
 * No son «tipos de juego», son «qué se escribe en la libreta cuando acaba»:
 * hay juegos de contar puntos, juegos en los que gana quien menos suma, juegos
 * de todos contra el tablero y juegos que solo tienen ganador.
 */
interface Sheet {
  scoreLabel: string
  scoreLabelShort: string
  totalMode: GameDefinition['totalMode']
  winnerRule: GameDefinition['winnerRule']
  fields: ScoreField[]
}

const SHEETS: Record<SheetId, Sheet> = {
  /** Se cuentan puntos y gana el que más tiene. El caso normal. */
  points: {
    scoreLabel: 'Puntos',
    scoreLabelShort: 'Pts',
    totalMode: 'explicit',
    winnerRule: 'highest',
    fields: [
      {
        key: 'points',
        label: 'Puntos finales',
        short: 'Puntos',
        icon: '🏆',
        type: 'number',
        isTotal: true,
        showInSummary: true,
        hint: 'Lo que sume la hoja de puntuación del juego',
      },
    ],
  },

  /** Se cuentan puntos, pero son penalizaciones: gana quien menos tiene. */
  lowest: {
    scoreLabel: 'Puntos',
    scoreLabelShort: 'Pts',
    totalMode: 'explicit',
    winnerRule: 'lowest',
    fields: [
      {
        key: 'points',
        label: 'Puntos finales',
        short: 'Puntos',
        icon: '🎯',
        type: 'number',
        isTotal: true,
        showInSummary: true,
        hint: 'En este juego gana quien menos suma',
      },
    ],
  },

  /**
   * Cooperativo: se juega contra el tablero. Todo el equipo gana o pierde a la vez,
   * así que el «total» es 1 si la partida se ganó, y quedan todos empatados en primero.
   * La puntuación del equipo, si el juego la tiene, se apunta al lado sin sumar.
   */
  coop: {
    scoreLabel: 'Resultado',
    scoreLabelShort: 'Res.',
    totalMode: 'computed',
    winnerRule: 'highest',
    fields: [
      {
        key: 'won',
        label: 'Partida ganada',
        short: 'Ganada',
        icon: '🤝',
        type: 'toggle',
        points: 1,
        showInSummary: true,
        hint: 'Marcadlo todos: en cooperativo se gana en equipo',
      },
      {
        key: 'team_score',
        label: 'Puntuación del equipo',
        short: 'Equipo',
        icon: '🧮',
        type: 'number',
        showInSummary: true,
        hint: 'Si el juego puntúa la victoria. Es informativa: no decide quién gana',
      },
    ],
  },

  /**
   * Por equipos o con varios supervivientes: gana más de uno, pero no todos.
   * Se marca a cada jugador del bando ganador.
   */
  teams: {
    scoreLabel: 'Resultado',
    scoreLabelShort: 'Res.',
    totalMode: 'computed',
    winnerRule: 'highest',
    fields: [
      {
        key: 'won',
        label: 'Está en el bando ganador',
        short: 'Gana',
        icon: '🚩',
        type: 'toggle',
        points: 1,
        showInSummary: true,
      },
    ],
  },

  /**
   * Sin puntos: solo hay ganador (ajedrez, la mayoría de duelos y de campañas).
   * `uniquePerMatch` hace que marcar a uno se lo quite a los demás.
   */
  win: {
    scoreLabel: 'Victoria',
    scoreLabelShort: 'Vic.',
    totalMode: 'computed',
    winnerRule: 'highest',
    fields: [
      {
        key: 'won',
        label: 'Ha ganado',
        short: 'Gana',
        icon: '👑',
        type: 'toggle',
        points: 1,
        uniquePerMatch: true,
        showInSummary: true,
      },
    ],
  },
}

/**
 * Paletas para los juegos del catálogo.
 *
 * Los juegos escritos a mano llevan los colores de su caja; aquí hay demasiados para
 * mirarlos uno a uno, así que se reparten estas paletas de forma estable (mismo slug,
 * mismo color siempre) para que la rejilla no sea una pared gris.
 *
 * Los 16 tonos están verificados a la vez contra los tres usos del color: como texto
 * sobre el papel claro, con texto blanco encima, y aclarado sobre el fondo oscuro.
 * Todos pasan de 4.5:1 en los tres, así que ninguno se cae en modo oscuro.
 */
const PALETTES: GameTheme[] = [
  { primary: '#0f5499' },
  { primary: '#a52233' },
  { primary: '#1a7f4d' },
  { primary: '#7028c3' },
  { primary: '#90390e' },
  { primary: '#1a757f' },
  { primary: '#981f84' },
  { primary: '#a12921' },
  { primary: '#2847c3' },
  { primary: '#427f1a' },
  { primary: '#7f571a' },
  { primary: '#5630d5' },
  { primary: '#1a7f72' },
  { primary: '#9d205e' },
  { primary: '#657307' },
  { primary: '#1a7f1a' },
]

/** Hash estable del slug: el mismo juego se pinta siempre del mismo color. */
function paletteFor(slug: string): GameTheme {
  let hash = 0
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0
  }
  return PALETTES[hash % PALETTES.length]
}

/**
 * Una fila del catálogo tal y como la sirve `search_catalog` en Postgres.
 *
 * Es la misma información que una línea de `catalog.data.ts`, solo que llegada por red
 * y en `snake_case`, como todo lo que viene de la base de datos. No trae la hoja de
 * puntuación ni la chuleta: trae `sheet_id`, que es el nombre de una de las cinco
 * hojas de aquí arriba. Con eso basta para reconstruir el juego entero sin bajárselo,
 * y por eso una fila son ~150 B en vez de ~1,2 kB.
 */
export interface CatalogGameRow {
  slug: string
  name: string
  icon: string
  tagline: string | null
  theme: GameTheme | null
  min_players: number
  max_players: number
  min_time: number | null
  max_time: number | null
  difficulty: GameDifficulty | null
  sheet_id: SheetId | null
  image_url: string | null
  cover_thumb_url: string | null
  group_id: string | null
  /** Solo los juegos de grupo la traen: no tienen hoja genérica que los reconstruya. */
  definition: GameDefinition | null
}

/**
 * Monta la `GameDefinition` a partir de los datos sueltos de un juego de catálogo.
 *
 * Lo comparten las dos puertas de entrada del catálogo amplio —la línea de
 * `catalog.data.ts` y la fila de Postgres—, que traen exactamente lo mismo por
 * caminos distintos. La regla de qué hoja y qué color le tocan a un juego vive aquí,
 * en un solo sitio, y así los dos caminos no pueden divergir.
 */
function build(
  slug: string,
  name: string,
  icon: string,
  tagline: string,
  theme: GameTheme,
  minPlayers: number,
  maxPlayers: number,
  playTime: GameDefinition['playTime'],
  difficulty: GameDifficulty | undefined,
  sheetId: SheetId,
): GameDefinition {
  const sheet = SHEETS[sheetId]

  return {
    slug,
    name,
    icon,
    tagline,
    theme,
    minPlayers,
    maxPlayers,
    playTime,
    difficulty,
    scoreLabel: sheet.scoreLabel,
    scoreLabelShort: sheet.scoreLabelShort,
    totalMode: sheet.totalMode,
    winnerRule: sheet.winnerRule,
    // Las hojas se comparten entre juegos: se copian los campos para que nadie pueda
    // mutar la de todo el catálogo sin querer.
    fields: sheet.fields.map((field) => ({ ...field })),
  }
}

/**
 * Una fila de la semilla, expandida a juego completo.
 *
 * Solo la usan los scripts —el seed y la ingesta de BGG—, que son los que meten esas
 * filas en Postgres. La app nunca ve una `CatalogRow`: recibe filas de la base de datos
 * y las expande con `expandCatalogRow`, aquí al lado. Las dos puertas comparten `build`
 * a propósito: si divergieran, un mismo juego se comportaría distinto según por dónde
 * hubiera entrado.
 */
export function expandCatalogSeedRow(row: CatalogRow): GameDefinition {
  const [slug, name, icon, tagline, minPlayers, maxPlayers, minTime, maxTime, difficulty, sheetId] =
    row
  return build(
    slug,
    name,
    icon,
    tagline,
    paletteFor(slug),
    minPlayers,
    maxPlayers,
    { min: minTime, max: maxTime },
    difficulty,
    sheetId,
  )
}

/**
 * Lo mismo, pero desde una fila de la base de datos.
 *
 * Un juego de grupo llega con su definición entera y se devuelve tal cual: no usa
 * ninguna de las cinco hojas, así que no hay nada que reconstruir. Un juego que
 * llegue sin hoja y sin definición —una fila a medio sembrar— cae en `points`, que
 * es «apunta los puntos y gana el que más tenga»: lo peor que puede pasar es que la
 * hoja sea más sosa de lo que le tocaba, no que la ficha se rompa.
 */
export function expandCatalogRow(row: CatalogGameRow): GameDefinition {
  if (row.definition) {
    return {
      ...row.definition,
      slug: row.slug,
      groupId: row.group_id ?? undefined,
      imageUrl: row.image_url ?? row.definition.imageUrl,
    }
  }

  return {
    ...build(
      row.slug,
      row.name,
      row.icon,
      row.tagline ?? '',
      row.theme ?? paletteFor(row.slug),
      row.min_players,
      row.max_players,
      row.min_time !== null && row.max_time !== null
        ? { min: row.min_time, max: row.max_time }
        : undefined,
      row.difficulty ?? undefined,
      row.sheet_id ?? 'points',
    ),
    imageUrl: row.image_url ?? row.cover_thumb_url ?? undefined,
  }
}
