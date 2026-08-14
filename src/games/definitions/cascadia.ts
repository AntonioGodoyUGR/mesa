import type { GameDefinition } from '../types'

export const cascadia: GameDefinition = {
  slug: 'cascadia',
  name: 'Cascadia',
  icon: '🐻',
  tagline: 'Hexágonos de hábitat y fauna colocada con criterio',
  theme: { primary: '#2f7d6b' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 30, max: 45 },
  difficulty: 'easy',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'wildlife',
      label: 'Fauna',
      short: 'Fauna',
      icon: '🦌',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Suma las cinco cartas de puntuación de fauna',
    },
    {
      key: 'habitats',
      label: 'Corredores de hábitat',
      short: 'Hábitats',
      icon: '🏞️',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Un punto por cada hexágono de tu corredor más grande de cada tipo',
    },
    {
      key: 'habitat_bonus',
      label: 'Bonos de mayor hábitat',
      short: 'Bonos',
      icon: '🎖️',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: '2 puntos por cada tipo en el que mandes (1 si empatáis)',
    },
    {
      key: 'nature_tokens',
      label: 'Fichas de naturaleza sobrantes',
      short: 'Naturaleza',
      icon: '🌲',
      type: 'counter',
      points: 1,
      min: 0,
      max: 20,
      showInSummary: true,
    },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '30–45 min',
    setup: [
      'Cada jugador empieza con tres hexágonos iniciales unidos.',
      'Mete las fichas de fauna en la bolsa y saca cuatro.',
      'Pon cuatro hexágonos de terreno boca arriba, cada uno emparejado con una ficha de fauna.',
      'Elegid una carta de puntuación por cada animal: familiar para la primera partida.',
      'Deja las fichas de naturaleza (bellotas) en la reserva.',
    ],
    turn: [
      {
        name: '1. Elegir pareja',
        detail:
          'Coge uno de los cuatro hexágonos disponibles junto con la ficha de fauna que tiene al lado.',
      },
      {
        name: '2. Colocar el terreno',
        detail:
          'Añade el hexágono a tu zona pegándolo a los que ya tienes, en la orientación que prefieras.',
      },
      {
        name: '3. Colocar la fauna',
        detail:
          'Pon la ficha en cualquier hexágono libre cuyo dibujo la admita. Si no puedes, se descarta.',
      },
    ],
    scoring: [
      { what: 'Cada tipo de fauna', points: 'Según su carta de puntuación' },
      { what: 'Corredor de hábitat', points: '1 por hexágono del mayor de cada tipo' },
      { what: 'Mayor corredor de un tipo', points: '+2 puntos (+1 si hay empate)' },
      { what: 'Ficha de naturaleza sin gastar', points: '1 punto' },
    ],
    endCondition:
      'La partida acaba cuando se agotan los hexágonos y todos han jugado veinte turnos. Se puntúan los cinco animales, los cinco corredores de hábitat con sus bonos y las bellotas sobrantes. En caso de empate gana quien tenga más bonos de hábitat.',
    reminders: [
      'Gastando una ficha de naturaleza puedes coger cualquier hexágono con cualquier ficha de fauna, sin respetar la pareja.',
      'También puedes gastar una ficha para descartar las fichas de fauna que quieras y sacar otras de la bolsa.',
      'Si salen tres o cuatro fichas de fauna iguales, se pueden limpiar según las reglas de sobrepoblación.',
      'Los hexágonos siempre se colocan pegados a tu zona: no se pueden dejar huecos ni islas.',
      'Los corredores de hábitat solo cuentan los hexágonos conectados por los lados del mismo terreno.',
    ],
    officialLink: {
      label: 'Web oficial (Flatout Games)',
      url: 'https://flatoutgames.com/cascadia/',
    },
  },
}
