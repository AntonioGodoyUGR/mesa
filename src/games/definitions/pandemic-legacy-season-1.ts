import type { GameDefinition } from '../types'

export const pandemicLegacySeason1: GameDefinition = {
  slug: 'pandemic-legacy-1',
  name: 'Pandemic Legacy: Season 1',
  icon: '🧬',
  tagline: 'Campaña cooperativa de 12-24 partidas: cada mes deja huella en el tablero',
  theme: { primary: '#1f6b7a' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 60, max: 60 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Partida (mes) ganada',
      short: 'Ganada',
      icon: '🤝',
      type: 'toggle',
      points: 1,
      showInSummary: true,
      hint: 'Marcadlo todos: es cooperativo, se gana o se pierde en equipo',
    },
    {
      key: 'month_number',
      label: 'Mes de la campaña jugado',
      short: 'Mes',
      icon: '📅',
      type: 'number',
      min: 1,
      max: 24,
      hint: 'Para llevar la cuenta de por dónde vais en la campaña (1-12, más las partidas extra de rejugadas)',
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '60 min por partida, unas 12-24 partidas en total',
    setup: [
      'Esta chuleta cubre solo la estructura base (idéntica a la del Pandemic clásico): la campaña añade sobres, pegatinas y reglas nuevas mes a mes que no se detallan aquí para no destriparla.',
      'Cada jugador elige un rol con una habilidad especial y coloca su peón en la ciudad de inicio (Atlanta en la caja base).',
      'Se reparten cartas de Jugador (incluida alguna carta de Epidemia mezclada dentro del mazo) y se colocan cubos de infección en las ciudades iniciales según el mazo de Infecciones.',
      'Se preparan los 4 marcadores de curación (uno por color de enfermedad) y el marcador de brotes en 0.',
    ],
    turn: [
      {
        name: '1. Hacer hasta 4 acciones',
        detail: 'Moverte, tratar una enfermedad (quitar cubos), construir un centro de investigación, compartir conocimiento con otro jugador en tu misma ciudad, curar una enfermedad (si tienes 5 cartas del mismo color en un centro de investigación) o usar tu habilidad especial de rol.',
      },
      {
        name: '2. Robar 2 cartas de Jugador',
        detail: 'Si sale una carta de Epidemia, se infecta una nueva ciudad al máximo, se remezcla el mazo de descarte de infecciones encima del mazo, y sube la tasa de infección.',
      },
      {
        name: '3. Infectar ciudades',
        detail: 'Se revelan tantas cartas del mazo de Infecciones como indique el marcador de tasa de infección, y se añaden cubos a esas ciudades. Si una ciudad ya tiene 3 cubos de un color, se produce un brote (afecta a las ciudades vecinas y sube el contador de brotes).',
      },
    ],
    scoring: [
      { what: 'Curar las 4 enfermedades antes de agotar el mazo, llegar a 8 brotes o quedaros sin cubos de un color', points: 'la partida (mes) se gana' },
      { what: 'Cada mes de la campaña', points: 'trae su propio objetivo y sus propias condiciones especiales, que no se repiten aquí a propósito' },
    ],
    endCondition:
      'Cada partida termina al cumplir (o fallar) el objetivo de ese mes concreto de la campaña; ganar o perder decide qué pegatinas, cartas y cambios permanentes se aplican antes del mes siguiente. La campaña completa dura unos 12-24 meses/partidas.',
    reminders: [
      'No se puede "reiniciar" limpio: las decisiones y derrotas dejan marcas permanentes (pegatinas, cartas rotas o descartadas) que afectan a todas las partidas siguientes.',
      'Algunos sobres y cajas solo se abren cuando la propia campaña lo indica: abrirlos antes de tiempo arruina sorpresas.',
      'Aunque la partida se pierda, normalmente se sigue jugando el mes siguiente con las consecuencias aplicadas, salvo que el propio juego diga lo contrario.',
      'Guardad la caja del juego (con sus compartimentos) tal cual entre partidas: el estado del tablero y de las cartas es parte de la partida guardada.',
    ],
    officialLink: {
      label: 'Web oficial (Z-Man Games)',
      url: 'https://zmangames.com/en/products/pandemic-legacy-season-1/',
    },
  },
}
