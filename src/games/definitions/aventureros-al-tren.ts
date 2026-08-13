import type { GameDefinition } from '../types'

export const aventurerosAlTren: GameDefinition = {
  slug: 'aventureros-al-tren',
  name: 'Aventureros al Tren',
  icon: '🚂',
  tagline: 'Rutas de tren y billetes que hay que cumplir',
  theme: {
    primary: '#b23a48',
    accent: '#2f6f8f',
    surface: '#faeef0',
  },
  minPlayers: 2,
  maxPlayers: 5,
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'board',
      label: 'Rutas del mapa',
      short: 'Rutas',
      icon: '🛤️',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Lo que fuiste marcando en el marcador durante la partida',
    },
    {
      key: 'tickets_done',
      label: 'Billetes completados',
      short: 'Billetes',
      icon: '🎟️',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Suma el valor de los billetes que conseguiste unir',
    },
    {
      key: 'tickets_failed',
      label: 'Billetes fallados',
      short: 'Fallados',
      icon: '❌',
      type: 'number',
      points: -1,
      min: 0,
      showInSummary: true,
      hint: 'Suma su valor en positivo: la app ya lo resta',
    },
    {
      key: 'longest_route',
      label: 'Ruta continua más larga',
      short: 'Ruta larga',
      icon: '🏅',
      type: 'toggle',
      points: 10,
      uniquePerMatch: true,
      showInSummary: true,
    },
    {
      key: 'stations',
      label: 'Estaciones sin usar',
      short: 'Estaciones',
      icon: '🚉',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 3,
      hint: 'Solo en la edición Europa: cada una son 4 puntos, súmalos arriba',
    },
  ],

  rules: {
    players: '2–5 jugadores',
    duration: '30–60 min',
    setup: [
      'Cada jugador coge sus 45 vagones y el marcador de su color, que empieza en la casilla 0.',
      'Reparte 4 cartas de tren a cada uno y pon cinco boca arriba junto al mazo.',
      'Reparte 3 billetes de destino a cada jugador: hay que quedarse con dos como mínimo.',
      'Baraja el resto de billetes en un mazo aparte.',
      'Empieza el jugador más viajero, o sortead.',
    ],
    turn: [
      {
        name: 'Opción A — Coger cartas',
        detail:
          'Coges dos cartas de tren, de las visibles o del mazo. Una locomotora visible cuenta por dos: si la coges, es tu única carta del turno.',
      },
      {
        name: 'Opción B — Reclamar una ruta',
        detail:
          'Descarta tantas cartas del color de la ruta como casillas tenga, coloca tus vagones y avanza tu marcador según la tabla.',
      },
      {
        name: 'Opción C — Robar billetes',
        detail:
          'Coges tres billetes nuevos y te quedas al menos uno. Los que no cumplas al final restarán.',
      },
    ],
    scoring: [
      { what: 'Ruta de 1 casilla', points: '1 punto' },
      { what: 'Ruta de 2 casillas', points: '2 puntos' },
      { what: 'Ruta de 3 casillas', points: '4 puntos' },
      { what: 'Ruta de 4 casillas', points: '7 puntos' },
      { what: 'Ruta de 5 casillas', points: '10 puntos' },
      { what: 'Ruta de 6 casillas', points: '15 puntos' },
      { what: 'Billete completado', points: '+ su valor' },
      { what: 'Billete sin completar', points: '− su valor' },
      { what: 'Ruta continua más larga', points: '+10 puntos' },
    ],
    endCondition:
      'Cuando a un jugador le quedan 2 vagones o menos al final de su turno, todos juegan un último turno (incluido él) y la partida termina. Entonces se enseñan los billetes: los cumplidos suman y los fallados restan, y se da el bonus de la ruta continua más larga.',
    reminders: [
      'Las rutas dobles solo se pueden usar las dos con 4 o 5 jugadores; con 2 o 3, en cuanto una está ocupada la otra queda bloqueada.',
      'Los billetes se guardan en secreto hasta el recuento final.',
      'Si en las cartas visibles hay tres locomotoras a la vez, se descartan las cinco y se ponen cinco nuevas.',
      'La ruta continua más larga se mide en casillas encadenadas, y puede pasar dos veces por la misma ciudad pero no repetir ruta.',
      'En caso de empate a puntos gana quien haya completado más billetes de destino.',
    ],
    officialLink: {
      label: 'Web oficial (Days of Wonder)',
      url: 'https://www.daysofwonder.com/tickettoride/en/',
    },
  },
}
