import type { GameDefinition } from '../types'

export const kingOfTokyo: GameDefinition = {
  slug: 'king-of-tokyo',
  name: 'King of Tokyo',
  icon: '👹',
  tagline: 'Monstruos, dados y una ciudad que aguanta lo que puede',
  theme: {
    primary: '#e04b2a',
    accent: '#2f3e63',
    surface: '#fdeee9',
  },
  minPlayers: 2,
  maxPlayers: 6,
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',
  targetScore: 20,

  fields: [
    {
      key: 'victory_points',
      label: 'Puntos de victoria',
      short: 'PV',
      icon: '⭐',
      type: 'number',
      points: 1,
      isTotal: true,
      min: 0,
      max: 30,
      showInSummary: true,
      hint: 'Se gana con 20, o siendo el último monstruo en pie',
    },
    {
      key: 'health',
      label: 'Vida al acabar',
      short: 'Vida',
      icon: '❤️',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 12,
      showInSummary: true,
      hint: '0 significa que quedó eliminado',
    },
    {
      key: 'energy',
      label: 'Energía sin gastar',
      short: 'Energía',
      icon: '⚡',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 40,
    },
    {
      key: 'survived',
      label: 'Sobrevivió hasta el final',
      short: 'Vivo',
      icon: '🛡️',
      type: 'toggle',
      group: 'Registro',
    },
  ],

  rules: {
    players: '2–6 jugadores',
    duration: '30 min',
    setup: [
      'Cada jugador elige un monstruo y coge su tablero de vida y puntos: empieza con 10 de vida y 0 puntos.',
      'Coloca el tablero de Tokio en el centro (con 5 o 6 jugadores se usa también la Bahía).',
      'Baraja las cartas de poder y pon tres boca arriba.',
      'Deja los seis dados negros al alcance de todos.',
      'Al principio Tokio está vacío.',
    ],
    turn: [
      {
        name: '1. Tirar los dados',
        detail:
          'Tiras los seis dados y puedes relanzar los que quieras hasta dos veces más.',
      },
      {
        name: '2. Resolver',
        detail:
          'Tres iguales de un número dan esos puntos (y uno más por cada dado extra); los rayos dan energía, los corazones curan y las garras hacen daño.',
      },
      {
        name: '3. Comprar poderes',
        detail:
          'Con la energía puedes comprar cartas de la oferta, o pagar 2 para renovar las tres cartas visibles.',
      },
    ],
    scoring: [
      { what: 'Tres unos / doses / treses', points: '1 / 2 / 3 puntos' },
      { what: 'Cada dado igual de más', points: '+1 punto' },
      { what: 'Entrar en Tokio', points: '+1 punto' },
      { what: 'Empezar tu turno en Tokio', points: '+2 puntos' },
      { what: 'Cartas de poder', points: 'Lo que indiquen' },
      { what: 'Meta de la partida', points: '20 puntos' },
    ],
    endCondition:
      'Gana quien llegue a 20 puntos de victoria o el último monstruo que quede con vida. Un monstruo con 0 de vida queda eliminado y, si estaba en Tokio, lo deja libre.',
    reminders: [
      'Estando en Tokio no puedes curarte con los corazones.',
      'El monstruo de Tokio hace daño a todos los de fuera; los de fuera solo se lo hacen al de Tokio.',
      'Cuando te hacen daño en Tokio puedes ceder el sitio, y entonces entra quien te atacó.',
      'Si Tokio está vacío al final de un ataque, el siguiente monstruo que saque garras entra obligatoriamente.',
      'La vida nunca sube por encima de 10, salvo que una carta diga lo contrario.',
    ],
    officialLink: {
      label: 'Web oficial (IELLO)',
      url: 'https://www.iello.fr/',
    },
  },
}
