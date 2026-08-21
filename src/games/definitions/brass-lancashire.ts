import type { GameDefinition } from '../types'

export const brassLancashire: GameDefinition = {
  slug: 'brass-lancashire',
  name: 'Brass: Lancashire',
  icon: '⚙️',
  tagline: 'Algodón y deuda en la revolución industrial: canales primero, vías después',
  theme: { primary: '#3f4a5c' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'canal_era', label: 'Puntos de la Era del Canal', short: 'Canal', icon: '🛶', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Suma de industrias volteadas y enlaces de canal conectados al final de la primera mitad' },
    { key: 'rail_era', label: 'Puntos de la Era del Ferrocarril', short: 'Ferrocarril', icon: '🚂', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Suma de industrias volteadas y enlaces de vía conectados al final de la segunda mitad' },
    { key: 'money', label: 'Libras al final', short: 'Libras', icon: '💷', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Anota ya convertido: 1 PV por cada 10 libras que te sobren al final de la partida' },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Cada jugador recibe su reserva de fichas de industria (algodón, carbón, hierro, cervecería, muelle, manufactura) y su marcador de renta e ingresos.',
      'Se monta el tablero de Lancashire con sus ciudades y conexiones, y se prepara el mercado de carbón y hierro.',
      'Se baraja el mazo de cartas (ciudad e industria) y se reparte una mano a cada jugador.',
      'Cada jugador empieza con un préstamo inicial de 30 libras y su marcador de renta en la casilla correspondiente.',
    ],
    turn: [
      {
        name: 'Acciones',
        detail: 'Cada turno se realizan dos acciones (una sola en la primera ronda), eligiendo entre: construir industria, construir canal o vía, desarrollar (retirar tiles para acceder a niveles superiores), vender algodón, o pedir un préstamo.',
      },
      {
        name: 'Robar cartas',
        detail: 'Al final del turno se roba hasta completar la mano.',
      },
      {
        name: 'Fin de ronda',
        detail: 'Cuando todos han jugado su mano de la ronda, cada jugador cobra ingresos según su posición en el marcador de renta.',
      },
    ],
    scoring: [
      { what: 'Industria volteada (se vende toda su producción, se construye el muelle, o se completa la cervecería)', points: 'los PV impresos en la ficha' },
      { what: 'Enlace de canal o vía conectado a al menos una industria', points: 'los PV que indique cada enlace' },
      { what: 'Libras sobrantes al final de cada Era', points: '1 PV por cada 10 libras' },
    ],
    endCondition:
      'La partida se juega en dos mitades: la Era del Canal y la Era del Ferrocarril. Al final de cada una se cuentan puntos por industrias volteadas y enlaces conectados; al pasar a la Era del Ferrocarril se retiran todos los canales del tablero (las industrias se quedan). Se suman los puntos de ambas Eras y gana quien tenga más; en caso de empate, quien tenga más dinero.',
    reminders: [
      'Un canal o vía sin ninguna industria conectada en sus dos extremos no da puntos: construidlos pensando en qué conectan, no solo en llegar lejos.',
      'Desarrollar retira fichas de tu reserva para poder construir industrias de nivel superior; no vende ni voltea nada por sí solo.',
      'Los préstamos dan dinero inmediato pero bajan tu renta (y por tanto tus ingresos futuros): pedidlos con cuidado.',
      'Al pasar a la Era del Ferrocarril se pierden los canales del tablero: no dejéis vuestra puntuación de esa mitad colgando de enlaces que van a desaparecer.',
    ],
    officialLink: {
      label: 'Web oficial (Roxley Games)',
      url: 'https://roxley.com/products/brass-lancashire',
    },
  },
}
