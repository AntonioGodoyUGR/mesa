import type { GameDefinition } from '../types'

export const wingspan: GameDefinition = {
  slug: 'wingspan',
  name: 'Wingspan',
  icon: '🦅',
  tagline: 'Un aviario que se puntúa por partes',
  theme: { primary: '#3f7d5a' },
  minPlayers: 1,
  maxPlayers: 5,
  playTime: { min: 40, max: 70 },
  difficulty: 'medium',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'birds',
      label: 'Aves jugadas',
      short: 'Aves',
      icon: '🐦',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Suma los puntos impresos en la esquina de cada carta',
    },
    {
      key: 'bonus_cards',
      label: 'Cartas de bonificación',
      short: 'Bonus',
      icon: '🎯',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'round_goals',
      label: 'Objetivos de ronda',
      short: 'Objetivos',
      icon: '🏆',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'eggs',
      label: 'Huevos',
      short: 'Huevos',
      icon: '🥚',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: '1 punto cada huevo, esté donde esté',
    },
    {
      key: 'food_on_cards',
      label: 'Comida sobre cartas',
      short: 'Comida',
      icon: '🌾',
      type: 'number',
      points: 1,
      min: 0,
    },
    {
      key: 'tucked_cards',
      label: 'Cartas remetidas',
      short: 'Remetidas',
      icon: '🪶',
      type: 'number',
      points: 1,
      min: 0,
    },
    {
      key: 'nectar',
      label: 'Néctar (Oceanía)',
      short: 'Néctar',
      icon: '🌺',
      type: 'number',
      group: 'Registro',
      min: 0,
      hint: 'Si jugáis con la expansión, suma sus puntos en «Aves»',
    },
  ],

  rules: {
    players: '1–5 jugadores',
    duration: '40–70 min',
    setup: [
      'Cada jugador coge un tablero personal, 8 fichas de acción y una carta de objetivos.',
      'Reparte 5 cartas de ave y 5 fichas de comida a cada uno: hay que descartar una comida por cada carta de ave que te quedes.',
      'Reparte 2 cartas de bonificación y quédate con una.',
      'Pon tres aves boca arriba en la bandeja y el resto en el mazo.',
      'Coloca los objetivos de las cuatro rondas en el tablero central.',
    ],
    turn: [
      {
        name: 'Jugar un ave',
        detail:
          'Paga su coste de comida y los huevos que pida el hábitat, y colócala en la fila que indique la carta.',
      },
      {
        name: 'Buscar comida',
        detail:
          'Pon una ficha en el bosque, tira los dados de la torre y coge comida; activa de derecha a izquierda los poderes marrones de esa fila.',
      },
      {
        name: 'Poner huevos',
        detail:
          'Ficha en la pradera: pones huevos en tus aves respetando el límite de nido de cada una.',
      },
      {
        name: 'Robar cartas',
        detail:
          'Ficha en el humedal: robas cartas de ave de la bandeja o del mazo. Cuantas más aves tengas en la fila, más consigues.',
      },
    ],
    scoring: [
      { what: 'Cada ave del aviario', points: 'Sus puntos impresos' },
      { what: 'Cartas de bonificación', points: 'Lo que indique cada una' },
      { what: 'Objetivos de ronda', points: 'Según el lado verde o azul del tablero' },
      { what: 'Huevo', points: '1 punto' },
      { what: 'Comida guardada sobre una carta', points: '1 punto' },
      { what: 'Carta remetida bajo un ave', points: '1 punto' },
    ],
    endCondition:
      'La partida dura cuatro rondas con 8, 7, 6 y 5 turnos. Al acabar la cuarta se suman las seis categorías. En caso de empate gana quien conserve más comida sin gastar.',
    reminders: [
      'Cada ave solo puede llevar los huevos que quepan en su nido.',
      'Los poderes marrones se activan al buscar comida en esa fila; los rosas saltan en el turno de otro jugador; los blancos solo al jugar el ave.',
      'Las aves se colocan de izquierda a derecha en su hábitat, sin dejar huecos.',
      'Al final de cada ronda se retira una ficha de acción: por eso los turnos van menguando.',
      'Los objetivos de ronda se puntúan con el lado que hayáis elegido al montar la partida, y hay que decidirlo antes de empezar.',
    ],
    officialLink: {
      label: 'Web oficial (Stonemaier Games)',
      url: 'https://stonemaiergames.com/games/wingspan/',
    },
  },
}
