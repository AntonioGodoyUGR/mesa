import type { GameDefinition } from '../types'

export const sevenWonders: GameDefinition = {
  slug: '7-wonders',
  name: '7 Wonders',
  icon: '🏛️',
  tagline: 'Tres eras de cartas y siete montones de puntos',
  theme: {
    primary: '#a8792c',
    accent: '#2f6f6f',
    surface: '#f8f2e6',
  },
  minPlayers: 3,
  maxPlayers: 7,
  playTime: { min: 30, max: 45 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'military',
      label: 'Conflictos militares',
      short: 'Militar',
      icon: '⚔️',
      type: 'number',
      points: 1,
      // Sin `min`: las derrotas dejan el marcador militar en negativo.
      showInSummary: true,
      hint: 'Victorias menos derrotas: puede quedar en negativo',
    },
    {
      key: 'coin_points',
      label: 'Monedas',
      short: 'Monedas',
      icon: '🪙',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Divide tus monedas entre 3 y redondea hacia abajo',
    },
    {
      key: 'wonder',
      label: 'Etapas de la maravilla',
      short: 'Maravilla',
      icon: '🗿',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'civilian',
      label: 'Edificios civiles (azules)',
      short: 'Civiles',
      icon: '🏛️',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'commercial',
      label: 'Edificios comerciales (amarillos)',
      short: 'Comercio',
      icon: '⚖️',
      type: 'number',
      points: 1,
      min: 0,
    },
    {
      key: 'guilds',
      label: 'Gremios (morados)',
      short: 'Gremios',
      icon: '🟣',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'science',
      label: 'Ciencia (verdes)',
      short: 'Ciencia',
      icon: '🔬',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Cada símbolo repetido al cuadrado, más 7 por cada set de los tres',
    },
  ],

  rules: {
    players: '3–7 jugadores',
    duration: '30–45 min',
    setup: [
      'Reparte a cada jugador un tablero de maravilla al azar y elegid cara A o B.',
      'Cada jugador empieza con 3 monedas.',
      'Prepara los tres mazos de era según el número de jugadores.',
      'Con la era III, mezcla los gremios: se meten tantos como jugadores más dos.',
      'Coloca las fichas de conflicto al alcance de todos.',
    ],
    turn: [
      {
        name: '1. Elegir carta',
        detail:
          'Todos a la vez, cada uno coge una carta de su mano en secreto y pasa el resto al vecino (izquierda en I y III, derecha en II).',
      },
      {
        name: '2. Jugarla',
        detail:
          'Puedes construir el edificio pagando su coste, usarla para levantar una etapa de tu maravilla, o venderla al banco por 3 monedas.',
      },
      {
        name: '3. Fin de era',
        detail:
          'Cuando se agotan las manos, se resuelven los conflictos militares con los dos vecinos comparando escudos.',
      },
    ],
    scoring: [
      { what: 'Conflictos ganados', points: '+1 / +3 / +5 según la era' },
      { what: 'Conflictos perdidos', points: '−1 cada uno' },
      { what: 'Monedas', points: '1 punto por cada 3 monedas' },
      { what: 'Maravilla', points: 'Lo que indique cada etapa' },
      { what: 'Edificios azules', points: 'Sus puntos impresos' },
      { what: 'Amarillos y morados', points: 'Según el texto de la carta' },
      { what: 'Ciencia', points: 'n² por símbolo + 7 por cada set de tres distintos' },
    ],
    endCondition:
      'La partida termina al resolver los conflictos de la tercera era. Se suman las siete categorías; en caso de empate gana quien tenga más monedas.',
    reminders: [
      'Puedes comprar recursos a tus vecinos pagándoles 2 monedas por unidad (1 si tienes el descuento comercial), pero solo a los de al lado.',
      'Si una carta lleva encadenamiento y ya construiste el edificio previo, la levantas gratis.',
      'No puedes construir dos edificios con el mismo nombre en toda la partida.',
      'La última carta de cada era se descarta sin jugar, salvo que tu maravilla diga lo contrario.',
      'La ciencia se puntúa al cuadrado: tres compases valen 9 puntos, no 3.',
    ],
    officialLink: {
      label: 'Web oficial (Repos Production)',
      url: 'https://www.rprod.com/',
    },
  },
}
