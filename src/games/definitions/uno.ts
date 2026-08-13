import type { GameDefinition } from '../types'

export const uno: GameDefinition = {
  slug: 'uno',
  name: 'UNO',
  icon: '🃏',
  tagline: 'Quédate sin cartas y grita a tiempo',
  theme: {
    primary: '#d62828',
    accent: '#f2b705',
    surface: '#fdeeee',
  },
  minPlayers: 2,
  maxPlayers: 10,
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',
  targetScore: 500,

  fields: [
    {
      key: 'points',
      label: 'Puntos acumulados',
      short: 'Puntos',
      icon: '🏆',
      type: 'number',
      points: 1,
      isTotal: true,
      showInSummary: true,
      hint: 'Se juega hasta que alguien llega a 500',
    },
    {
      key: 'rounds_won',
      label: 'Rondas ganadas',
      short: 'Rondas',
      icon: '✋',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 50,
      showInSummary: true,
    },
    {
      key: 'forgot_uno',
      label: 'Se le olvidó decir UNO',
      short: '¡UNO!',
      icon: '🤫',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 50,
      hint: 'Cada despiste son 2 cartas de penalización',
    },
  ],

  rules: {
    players: '2–10 jugadores',
    duration: '30–45 min',
    setup: [
      'Baraja las 108 cartas y reparte siete a cada jugador.',
      'El resto forma el mazo de robo, boca abajo.',
      'Dale la vuelta a la primera carta: empieza el descarte.',
      'Si la carta de salida es un +4, devuélvela al mazo y saca otra.',
      'Empieza el jugador de la izquierda de quien reparte.',
    ],
    turn: [
      {
        name: '1. Tirar o robar',
        detail:
          'Juega una carta que coincida con el color, el número o el símbolo de la de arriba, o cualquier comodín. Si no puedes o no quieres, robas una carta.',
      },
      {
        name: '2. La carta robada',
        detail:
          'Si la carta que acabas de robar se puede jugar, puedes echarla en ese mismo turno; si no, pasas.',
      },
      {
        name: '3. Cantar UNO',
        detail:
          'Al quedarte con una sola carta tienes que decir «¡UNO!» antes de que te pillen. Si otro jugador te caza, robas dos cartas.',
      },
    ],
    scoring: [
      { what: 'Cartas numeradas (0–9)', points: 'Su número' },
      { what: '+2, Cambio de sentido, Salta', points: '20 puntos' },
      { what: 'Comodín y comodín +4', points: '50 puntos' },
      { what: 'Ganador de la ronda', points: 'Suma lo que quede en las manos ajenas' },
      { what: 'Meta de la partida', points: '500 puntos' },
    ],
    endCondition:
      'La ronda acaba cuando alguien se queda sin cartas: suma el valor de todas las cartas que les quedan a los demás. Gana la partida quien llegue primero a 500 puntos.',
    reminders: [
      'Solo se acumulan +2 sobre +2 si lo habéis acordado antes: no está en el reglamento oficial.',
      'El comodín +4 solo se puede jugar si no tienes ninguna carta del color en curso; el siguiente jugador puede desafiarte y mirar tu mano.',
      'Con dos jugadores, el Cambio de sentido funciona igual que un Salta.',
      'Si se acaba el mazo de robo, se baraja el descarte —menos la carta de arriba— y se sigue.',
      'Solo puedes cantar UNO cuando de verdad te queda una carta; hacerlo antes no vale.',
    ],
    officialLink: {
      label: 'Web oficial (Mattel)',
      url: 'https://www.mattelgames.com/en-us/cards/uno',
    },
  },
}
