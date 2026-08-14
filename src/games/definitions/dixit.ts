import type { GameDefinition } from '../types'

export const dixit: GameDefinition = {
  slug: 'dixit',
  name: 'Dixit',
  icon: '🐰',
  tagline: 'Una frase, seis ilustraciones y mucha mala idea',
  theme: { primary: '#6a4c93' },
  minPlayers: 3,
  maxPlayers: 6,
  playTime: { min: 30, max: 30 },
  difficulty: 'easy',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',
  targetScore: 30,

  fields: [
    {
      key: 'points',
      label: 'Puntos finales',
      short: 'Puntos',
      icon: '🐰',
      type: 'number',
      points: 1,
      isTotal: true,
      min: 0,
      showInSummary: true,
      hint: 'La casilla donde acabó tu conejo',
    },
    {
      key: 'rounds_as_storyteller',
      label: 'Rondas como narrador',
      short: 'Narró',
      icon: '🗣️',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 30,
    },
    {
      key: 'perfect_clues',
      label: 'Pistas redondas',
      short: 'Redondas',
      icon: '🎯',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 30,
      hint: 'Cuando te votaron algunos pero no todos: 3 puntos',
    },
  ],

  rules: {
    players: '3–6 jugadores',
    duration: '30 min',
    setup: [
      'Cada jugador coge un conejo de un color y lo pone en la casilla de salida del marcador.',
      'Reparte seis cartas a cada jugador; se juegan en secreto.',
      'Cada jugador coge las fichas de voto numeradas del 1 al número de jugadores.',
      'Deja el mazo a mano para reponer cartas cada ronda.',
      'Empieza quien tenga la imaginación más despierta, o sortead.',
    ],
    turn: [
      {
        name: '1. El narrador da la pista',
        detail:
          'Elige una carta de su mano sin enseñarla y dice una frase, una palabra, un sonido o un gesto que la describa.',
      },
      {
        name: '2. Los demás aportan',
        detail:
          'Cada jugador elige de su mano la carta que mejor pegue con esa pista y se la pasa al narrador, que las mezcla y las pone boca arriba.',
      },
      {
        name: '3. Votación',
        detail:
          'Todos menos el narrador votan en secreto cuál creen que es la suya. Después se desvela y se reparten los puntos.',
      },
    ],
    scoring: [
      { what: 'Aciertan todos o no acierta nadie', points: 'Narrador 0, los demás 2' },
      { what: 'Aciertan algunos', points: 'Narrador 3, quien acertó 3' },
      { what: 'Votos a tu carta (no narrador)', points: '+1 por cada voto' },
      { what: 'Meta de la partida', points: '30 puntos' },
    ],
    endCondition:
      'La partida acaba cuando se agota el mazo o cuando alguien llega a 30 puntos, y se termina la ronda en curso. Gana quien más lejos haya llevado su conejo.',
    reminders: [
      'Si la pista es tan obvia que la aciertan todos, el narrador se queda a cero: el objetivo es que acierten algunos, no todos.',
      'Nadie puede votar su propia carta.',
      'La pista puede ser cualquier cosa —una palabra, una canción, un gesto—, pero tiene que ser siempre del mismo estilo que acordéis.',
      'Al acabar la ronda todos reponen su mano hasta seis cartas y el papel de narrador pasa al siguiente.',
      'Con tres jugadores cada uno aporta dos cartas en vez de una.',
    ],
    officialLink: {
      label: 'Web oficial (Libellud)',
      url: 'https://www.libellud.com/',
    },
  },
}
