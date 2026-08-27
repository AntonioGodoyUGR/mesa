import type { GameDefinition } from '../types'

export const grandAustriaHotel: GameDefinition = {
  slug: 'grand-austria-hotel',
  name: 'Grand Austria Hotel',
  icon: '☕',
  tagline: 'Un café vienés: sirve al cliente exacto y prepara su habitación',
  theme: { primary: '#8a5a2a' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Lee la posición final de tu peón en el marcador de puntuación tras sumar huéspedes, habitaciones, cartas de emperador y bonos' },
    { key: 'guests', label: 'Huéspedes alojados', short: 'Huéspedes', icon: '🛎️', type: 'number', min: 0, showInSummary: true },
    { key: 'rooms', label: 'Habitaciones construidas', short: 'Habitaciones', icon: '🚪', type: 'number', min: 0 },
    { key: 'emperor_cards', label: 'Cartas del emperador cumplidas', short: 'Emperador', icon: '👑', type: 'number', min: 0 },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Cada jugador coge su tablero de hotel con el café, las habitaciones sin construir y sus peones de personal.',
      'Prepara la cola de huéspedes con las cartas correspondientes y coloca los dados de las cuatro rondas del reloj.',
      'Reparte 2 cartas del emperador a cada jugador; guardan una en secreto para puntuar al final.',
      'Coloca el marcador de puntuación de cada jugador en la casilla 0.',
    ],
    turn: [
      { name: '1. Tirada de dados', detail: 'Se tiran los dados de personal disponibles para esa ronda y se colocan en la rueda de acciones.' },
      { name: '2. Elegir dado', detail: 'Por turnos, cada jugador coge un dado de la rueda: cuanto más tarde lo cojas, más caro (pagas la diferencia con la posición inicial) pero puede convenirte por su valor.' },
      { name: '3. Ejecutar acción', detail: 'Usa el dado para servir bebidas o comida, alojar a un huésped que pida ese perfil, construir una habitación o coger un dado de camarero adicional.' },
      { name: '4. Fin de ronda', detail: 'Cuando se acaban los dados de la rueda, se avanza el reloj; tras la cuarta ronda del día se pasa a la siguiente jornada.' },
    ],
    scoring: [
      { what: 'Cada huésped alojado en la habitación correcta', points: 'PV impresos en su carta' },
      { what: 'Cada habitación construida', points: 'PV según su tipo' },
      { what: 'Carta del emperador cumplida', points: 'PV indicados en la carta' },
      { what: 'Prestigio y bonos de fin de partida', points: 'Según marcador y cartas especiales' },
    ],
    endCondition:
      'La partida dura 4 días con 4 rondas cada uno. Al terminar el último día se cuentan los puntos pendientes de cartas de emperador y bonos; gana quien tenga más PV en el marcador.',
    reminders: [
      'Cada huésped exige un tipo concreto de habitación y a veces comida o bebida: revisa su carta antes de intentar alojarlo.',
      'Coger un dado de la rueda cuesta la diferencia de posición: valorar cuándo merece la pena pagar por adelantarte.',
      'Solo puedes tener un número limitado de habitaciones sin construir a la vez: no acumules cola de huéspedes que no puedas atender.',
      'Guarda una carta del emperador en secreto hasta el final: solo esa cuenta para puntuar.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/198928/grand-austria-hotel',
    },
  },
}
