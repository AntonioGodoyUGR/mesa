/**
 * Catálogo amplio: los cientos de juegos que se pueden apuntar sin chuleta propia.
 *
 * Los juegos de `definitions/` están escritos a mano uno a uno: traen su hoja de
 * puntuación con los conceptos del juego («pueblos», «ciudades», «camino más largo»)
 * y su chuleta de reglas. Eso no escala a cuatrocientos títulos, y tampoco haría
 * falta: para la mayoría, lo que se quiere apuntar es quién ganó y con cuántos puntos.
 *
 * Así que aquí cada juego se declara en una línea —nombre, jugadores, duración,
 * dificultad y qué se apunta al acabar— y este fichero la convierte en una
 * `GameDefinition` completa. Un juego del catálogo se comporta igual que uno escrito
 * a mano en todo lo demás: sale en el buscador, en la biblioteca y en las estadísticas.
 *
 * Si un juego de aquí se merece su hoja detallada, se le escribe su fichero en
 * `definitions/` y se borra su fila de `catalog.data.ts`: el registro da prioridad a
 * la definición escrita a mano.
 */
import { CATALOG_ROWS, type CatalogRow, type SheetId } from './catalog.data'
import { CATALOG_RULES } from './catalog.rules'
import type { GameDefinition, GameTheme, ScoreField } from './types'

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

function expand(row: CatalogRow): GameDefinition {
  const [slug, name, icon, tagline, minPlayers, maxPlayers, minTime, maxTime, difficulty, sheetId] =
    row
  const sheet = SHEETS[sheetId]

  return {
    slug,
    name,
    icon,
    tagline,
    theme: paletteFor(slug),
    minPlayers,
    maxPlayers,
    playTime: { min: minTime, max: maxTime },
    difficulty,
    scoreLabel: sheet.scoreLabel,
    scoreLabelShort: sheet.scoreLabelShort,
    totalMode: sheet.totalMode,
    winnerRule: sheet.winnerRule,
    // Las hojas se comparten entre juegos: se copian los campos para que nadie pueda
    // mutar la de todo el catálogo sin querer.
    fields: sheet.fields.map((field) => ({ ...field })),
    // Chuleta de reglas, si el juego la tiene escrita en `catalog.rules.ts`. Los que no
    // están en el mapa quedan con `rules: undefined` y enseñan «Sin chuleta de reglas».
    rules: CATALOG_RULES[slug],
  }
}

/**
 * El catálogo entero, ya expandido.
 *
 * Los juegos más jugados llevan su chuleta de reglas, escrita aparte en
 * `catalog.rules.ts` y enganchada por `slug` al expandir. El resto se queda sin ella y
 * la pantalla lo dice («Sin chuleta de reglas») en vez de inventarse un resumen.
 */
export const CATALOG_GAMES: GameDefinition[] = CATALOG_ROWS.map(expand)
