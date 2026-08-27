import type { GameDefinition } from '../types'

export const caverna: GameDefinition = {
  slug: 'caverna',
  name: 'Caverna: The Cave Farmers',
  icon: '⛏️',
  tagline: 'Enanos que excavan su cueva, cultivan el bosque y salen de expedición',
  theme: { primary: '#6a4a3a' },
  minPlayers: 1,
  maxPlayers: 7,
  playTime: { min: 60, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma de animales, cereal/hortaliza, rubíes, estancias, enanos y bonos, menos penalizaciones por espacios sin usar' },
    { key: 'animals', label: 'Animales (4 tipos)', short: 'Animales', icon: '🐑', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: 1 PV por cada oveja, jabalí, vaca y burro; penaliza tener menos de un tipo' },
    { key: 'rooms', label: 'Estancias y pastos', short: 'Estancias', icon: '🏠', type: 'number', min: 0, hint: 'Informativo: PV de las estancias excavadas/amuebladas y de pastos y minas' },
    { key: 'dwarves', label: 'Enanos y rubíes', short: 'Enanos', icon: '💎', type: 'number', min: 0, hint: 'Informativo: PV por enanos, rubíes sobrantes y oro' },
    { key: 'penalties', label: 'Penalizaciones', short: 'Restan', icon: '➖', type: 'number', min: 0, hint: 'Informativo: −1 PV por cada espacio de cueva/bosque sin usar y por carecer de algún tipo de animal (réstalo del total)' },
  ],

  rules: {
    players: '1–7 jugadores',
    duration: '60–150 min',
    setup: [
      'Cada jugador coge un tablero de hogar (cueva a la izquierda, bosque a la derecha) con dos enanos y sus recursos iniciales.',
      'Montad el tablero central de acciones y las losetas de estancia/mobiliario ordenadas.',
      'Colocad la reserva de recursos (madera, piedra, mineral, rubíes, oro) y los animales.',
      'Preparad las losetas de acción que se van añadiendo ronda a ronda.',
    ],
    turn: [
      { name: '1. Fase de acumulación', detail: 'Algunos espacios de acción acumulan recursos ronda a ronda; se rellenan al empezar.' },
      { name: '2. Colocar enanos', detail: 'Por turnos, cada jugador coloca uno de sus enanos en un espacio de acción libre y ejecuta esa acción: excavar cueva, talar bosque, coger recursos, construir estancias o ir de expedición.' },
      { name: '3. Expediciones', detail: 'Los enanos armados pueden ir a las minas de expedición y traer botín (animales, recursos, mejoras) según su fuerza.' },
      { name: '4. Fase de cosecha', detail: 'Al final de la ronda: cosechas cereal/hortaliza, alimentas a tus enanos y tus animales se reproducen si tienes al menos dos.' },
    ],
    scoring: [
      { what: 'Cada animal (oveja, jabalí, vaca, burro)', points: '1 PV' },
      { what: 'Cereal y hortalizas', points: 'PV según cantidad' },
      { what: 'Estancias, pastos, minas y mobiliario', points: 'PV impresos' },
      { what: 'Enanos, rubíes y oro', points: 'PV' },
      { what: 'Espacios sin usar y falta de un tipo de animal', points: '−1 PV cada uno' },
    ],
    endCondition:
      'La partida dura 12 rondas. Tras la última cosecha se hace el recuento: se suman animales, cosechas, estancias, enanos y bonos, y se restan las penalizaciones. Gana quien tenga más PV.',
    reminders: [
      'A diferencia de Agricola no hay cartas de ocupación/mejora en mano: toda la variedad está en las estancias del tablero, así que planifica cuáles construir.',
      'No dejes espacios de cueva o bosque sin usar: cada hueco vacío resta 1 PV al final.',
      'Ten al menos un animal de cada tipo: carecer de uno penaliza, aunque tengas montones del resto.',
      'Alimentar a tus enanos cada cosecha es obligatorio: mendigar por falta de comida cuesta caro.',
      'Las expediciones son un motor flexible de recursos y animales: arma a tus enanos para aprovecharlas.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/102794/caverna-the-cave-farmers',
    },
  },
}
