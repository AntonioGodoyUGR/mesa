import type { GameDefinition } from '../types'

export const greatWesternTrail: GameDefinition = {
  slug: 'great-western-trail',
  name: 'Great Western Trail',
  icon: '🐄',
  tagline: 'Lleva el ganado por el camino hasta Kansas City y vuelve a empezar',
  theme: { primary: '#8a5a2f' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 75, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'buildings', label: 'Edificios propios', short: 'Edificios', icon: '🏚️', type: 'counter', points: 1, min: 0, showInSummary: true, hint: 'Suma los puntos impresos en tus edificios privados construidos por el camino' },
    { key: 'railroad', label: 'Estaciones y escudos de ciudad', short: 'Vía', icon: '🚂', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV de tus discos en estaciones de tren y en los escudos de las ciudades del ferrocarril (resta 6 si tienes un disco en Kansas City)' },
    { key: 'objectives', label: 'Cartas de objetivo', short: 'Objetivos', icon: '🎯', type: 'number', points: 1, showInSummary: true, hint: 'Suma neta de tus cartas de objetivo cumplidas, restando las incompletas' },
    { key: 'bonuses', label: 'Bonos varios', short: 'Bonos', icon: '⭐', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Fichas de peligro, trabajadores en la 5.ª/6.ª casilla (4 c/u), casilla de disco despejada (3) y ficha del mercado laboral (2), todo sumado' },
    { key: 'money', label: 'Dinero final', short: 'Dinero', icon: '💵', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Anota ya convertido: 1 PV por cada 5 dólares que te sobren' },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '75–150 min',
    setup: [
      'Cada jugador recibe su mazo inicial de cartas de ganado, su peón de vaquero en el inicio del camino y sus discos de personal.',
      'Se monta el tablero con el camino de Kansas City al oeste, el mercado laboral, el mercado de edificios y las pilas de fichas de peligro y objetivo.',
      'Se reparten las cartas de objetivo iniciales y se prepara la fila de trabajadores disponible en el mercado laboral.',
      'Cada jugador coloca su marcador de dinero y su disco de tren en la posición inicial.',
    ],
    turn: [
      {
        name: 'A. Mover el vaquero',
        detail: 'Avanza tu peón 1 o más pasos por el camino, dentro del límite de pasos que te permitan tus cartas jugadas.',
      },
      {
        name: 'B. Usar la casilla',
        detail: 'Ejecuta la acción de la casilla donde acabas (comprar ganado, construir edificio, contratar personal...) o realiza una acción auxiliar en vez de moverte.',
      },
      {
        name: 'C. Robar cartas',
        detail: 'Roba cartas de tu mazo hasta tu límite de mano para el siguiente turno.',
      },
    ],
    scoring: [
      { what: 'Edificios privados construidos', points: 'los PV impresos en cada tesela' },
      { what: 'Discos en estaciones de tren y escudos de ciudad', points: 'los PV que desbloqueen' },
      { what: 'Cartas de objetivo cumplidas', points: 'las indicadas, restando las que no se completaron' },
      { what: 'Fichas de peligro, trabajadores avanzados, casilla de disco y ficha de mercado laboral', points: 'varios bonos menores' },
      { what: 'Dinero sobrante', points: '1 PV por cada 5 dólares' },
    ],
    endCondition:
      'La partida termina en cuanto un jugador coloca un trabajador en la última casilla del mercado laboral, lo que le da la ficha de mercado laboral. Se completa esa ronda y se cuentan los puntos de todas las categorías; gana quien tenga más.',
    reminders: [
      'Kansas City resta puntos si tienes disco allí sin haber avanzado en el ferrocarril: no lo dejéis solo por llegar antes.',
      'Las cartas de objetivo incompletas restan puntos, así que no acumuléis más de las que podáis cumplir.',
      'El mercado laboral es limitado: contratar tarde cuesta más y activa antes el final de la partida.',
      'El ganado de mayor valor exige edificios de mayor nivel en el camino: no basta con comprar las vacas más caras si no podéis entregarlas.',
    ],
    officialLink: {
      label: 'Web oficial (Eggertspiele / Stronghold Games)',
      url: 'https://strongholdgames.com/our-games/great-western-trail/',
    },
  },
}
