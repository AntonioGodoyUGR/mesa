import type { GameDefinition } from '../types'

export const azul: GameDefinition = {
  slug: 'azul',
  name: 'Azul',
  icon: '🔷',
  tagline: 'Azulejos, filas completas y suelo lleno de penalizaciones',
  theme: {
    primary: '#1f5f8b',
    accent: '#e0a458',
    surface: '#eaf2f8',
  },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 30, max: 45 },
  difficulty: 'medium',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'board',
      label: 'Puntos del marcador',
      short: 'Marcador',
      icon: '🧮',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Lo que llevabas apuntado al acabar la última ronda, ya con las penalizaciones',
    },
    {
      key: 'full_rows',
      label: 'Filas horizontales completas',
      short: 'Filas',
      icon: '➡️',
      type: 'counter',
      points: 2,
      min: 0,
      max: 5,
      showInSummary: true,
    },
    {
      key: 'full_columns',
      label: 'Columnas completas',
      short: 'Columnas',
      icon: '⬇️',
      type: 'counter',
      points: 7,
      min: 0,
      max: 5,
      showInSummary: true,
    },
    {
      key: 'full_colours',
      label: 'Colores con los cinco azulejos',
      short: 'Colores',
      icon: '🎨',
      type: 'counter',
      points: 10,
      min: 0,
      max: 5,
      showInSummary: true,
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '30–45 min',
    setup: [
      'Cada jugador coge un tablero personal y pone su marcador en el 0.',
      'Mete los 100 azulejos en la bolsa.',
      'Coloca los expositores según el número de jugadores: 5 con dos, 7 con tres y 9 con cuatro.',
      'Llena cada expositor con cuatro azulejos sacados de la bolsa.',
      'Pon la ficha de jugador inicial en el centro de la mesa.',
    ],
    turn: [
      {
        name: '1. Coger azulejos',
        detail:
          'Elige un color de un expositor y llévate TODOS los de ese color; los que sobran caen al centro de la mesa. O coge todos los de un color que ya estén en el centro.',
      },
      {
        name: '2. Colocar en una línea',
        detail:
          'Pon los azulejos en una de tus cinco líneas de preparación, siempre de derecha a izquierda. Lo que no quepa cae al suelo.',
      },
      {
        name: '3. Alicatar (fin de ronda)',
        detail:
          'Cuando expositores y centro se vacían, cada línea completa mueve un azulejo a la pared y puntúa; el resto de esa línea se descarta.',
      },
    ],
    scoring: [
      { what: 'Azulejo aislado', points: '1 punto' },
      { what: 'Azulejo en una serie', points: '1 por cada azulejo de su fila y columna contiguas' },
      { what: 'Suelo (penalización)', points: '−1, −1, −2, −2, −2, −3, −3' },
      { what: 'Fila horizontal completa', points: '+2 puntos' },
      { what: 'Columna completa', points: '+7 puntos' },
      { what: 'Los 5 azulejos de un color', points: '+10 puntos' },
    ],
    endCondition:
      'La partida acaba al terminar la ronda en la que alguien completa una fila horizontal entera de su pared. Se aplican los bonus finales de filas, columnas y colores. Si hay empate, gana quien tenga más filas horizontales completas.',
    reminders: [
      'Quien coge primero del centro se lleva la ficha de jugador inicial y una penalización de −1.',
      'Las líneas de preparación solo admiten un color, y no puedes empezar una línea con un color que ya esté en esa fila de la pared.',
      'Si coges azulejos que no te caben en ninguna línea válida, van todos al suelo.',
      'El marcador nunca baja de cero por muchas penalizaciones que acumules.',
      'Al puntuar un azulejo se cuentan las series horizontal y vertical de las que forme parte, pero solo si tiene vecinos en esa dirección.',
    ],
    officialLink: {
      label: 'Web oficial (Next Move Games)',
      url: 'https://www.nextmovegames.com/',
    },
  },
}
