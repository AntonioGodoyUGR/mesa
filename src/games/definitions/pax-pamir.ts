import type { GameDefinition } from '../types'

export const paxPamir: GameDefinition = {
  slug: 'pax-pamir',
  name: 'Pax Pamir: Second Edition',
  icon: '🐎',
  tagline: 'Jefes afganos que cambian de bando en el Gran Juego del siglo XIX',
  theme: { primary: '#8a5a2f' },
  minPlayers: 2,
  maxPlayers: 5,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de éxito',
  scoreLabelShort: 'Éxito',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'success_total', label: 'Puntos de éxito (total)', short: 'Éxito', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Suma los puntos ganados en los recuentos de dominación más los premios finales. Gana quien más tenga' },
    { key: 'coalition', label: 'Coalición leal', short: 'Coalición', icon: '🚩', type: 'toggle', showInSummary: true, hint: 'Informativo: si al recuento final tu lealtad coincide con la coalición dominante (Afganos, Rusos o Británicos)' },
    { key: 'influence', label: 'Influencia (cilindros)', short: 'Influencia', icon: '🎯', type: 'number', min: 0, hint: 'Informativo: tus cilindros en juego (mano de tu corte y piezas en el mapa) que definen tu rango en el recuento' },
    { key: 'gifts', label: 'Regalos (rupias guardadas)', short: 'Regalos', icon: '💰', type: 'number', min: 0, hint: 'Informativo: rupias gastadas en «regalos» que dan puntos permanentes de prestigio' },
  ],

  rules: {
    players: '2–5 jugadores',
    duration: '60–120 min',
    setup: [
      'Colocad el mapa de Afganistán con sus regiones, las fichas de ejército/carretera y el mercado de cartas.',
      'Cada jugador recibe sus cilindros de un color, sus rupias iniciales y una lealtad de partida a una de las tres coaliciones (Afgana, Rusa o Británica).',
      'Rellenad la fila de mercado con cartas de corte y colocad la pila de fichas de dominación.',
      'Barajad las cartas de dominación (los recuentos) en el mazo según indique el número de jugadores.',
    ],
    turn: [
      { name: '1. Dos acciones', detail: 'En tu turno realizas hasta 2 acciones: comprar una carta del mercado, jugarla en tu corte, o usar acciones de las cartas ya en juego.' },
      { name: '2. Cartas de corte', detail: 'Las cartas jugadas forman tu corte y dan acciones: sobornar, tramar, construir ejércitos/carreteras, mover tropas o espiar.' },
      { name: '3. Lealtad y bandos', detail: 'Puedes cambiar de lealtad a otra coalición; hacerlo tiene coste pero puede colocarte del lado ganador antes de un recuento.' },
      { name: '4. Recuento de dominación', detail: 'Cuando se revela una carta de dominación, se comprueba qué coalición domina el mapa; los jugadores leales a ella puntúan según su rango de influencia.' },
    ],
    scoring: [
      { what: 'Recuento de dominación con una coalición clara', points: 'los leales a ella puntúan por su rango (más influencia, más puntos)' },
      { what: 'Recuento sin coalición dominante', points: 'puntúa cada jugador según su propia influencia' },
      { what: 'Regalos (rupias en la vía de prestigio)', points: 'puntos permanentes' },
      { what: 'Premios de fin de partida', points: 'puntos extra al último recuento' },
    ],
    endCondition:
      'La partida acaba cuando se revela la última carta de dominación (normalmente la 4.ª). Se hace el recuento final; gana quien tenga más puntos de éxito. Una victoria dominante puede terminar la partida antes.',
    reminders: [
      'Cambiar de bando en el momento justo es la esencia del juego: estar del lado de la coalición dominante cuando salta un recuento lo es todo.',
      'No te enamores de tu lealtad: a veces conviene traicionar y realinearte antes del siguiente recuento.',
      'La influencia (tus cilindros en corte y mapa) decide tu rango dentro de la coalición: no basta con ser leal, hay que ser el más fuerte.',
      'Los regalos dan puntos seguros que no dependen de quién domine: son un colchón contra los vaivenes.',
      'Vigila cuántas cartas quedan para el próximo recuento: cronometra tus jugadas para llegar bien colocado.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/256960/pax-pamir-second-edition',
    },
  },
}
