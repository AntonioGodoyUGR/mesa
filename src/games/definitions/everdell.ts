import type { GameDefinition } from '../types'

export const everdell: GameDefinition = {
  slug: 'everdell',
  name: 'Everdell',
  icon: '🌰',
  tagline: 'Bichos, ciudad de quince cartas y cuatro estaciones',
  theme: {
    primary: '#4a7c59',
    accent: '#b5651d',
    surface: '#eff5ef',
  },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 40, max: 80 },
  difficulty: 'hard',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'cards',
      label: 'Cartas de la ciudad',
      short: 'Ciudad',
      icon: '🏘️',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'Los puntos impresos en las quince cartas',
    },
    {
      key: 'prosperity',
      label: 'Prosperidad y bonos de cartas',
      short: 'Prosperidad',
      icon: '✨',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'events',
      label: 'Eventos conseguidos',
      short: 'Eventos',
      icon: '🎪',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'journey',
      label: 'Viaje',
      short: 'Viaje',
      icon: '🧭',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
    },
    {
      key: 'tokens',
      label: 'Fichas de punto',
      short: 'Fichas',
      icon: '🔶',
      type: 'number',
      points: 1,
      min: 0,
      hint: 'Las que se acumulan sobre cartas como el Teatro o la Escuela',
    },
    {
      key: 'workers_left',
      label: 'Obreros sin colocar',
      short: 'Obreros',
      icon: '🐿️',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 6,
      hint: 'No suma: se guarda como estadística',
    },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '40–80 min',
    setup: [
      'Monta el árbol y coloca las cartas de la pradera: ocho boca arriba.',
      'Pon los cuatro eventos básicos y sortea cuatro especiales.',
      'Cada jugador coge sus obreros y empieza con dos, más 5 cartas en la mano y 1 ramita.',
      'Coloca los recursos de la reserva al alcance de todos.',
      'Todos empezáis en la estación Primavera.',
    ],
    turn: [
      {
        name: 'Opción A — Colocar un obrero',
        detail:
          'Pon un obrero en un espacio libre del bosque, de la pradera o de una carta de destino y coge lo que ofrezca.',
      },
      {
        name: 'Opción B — Jugar una carta',
        detail:
          'Paga su coste y añádela a tu ciudad, que no puede pasar de quince cartas. Si tienes su construcción asociada, la criatura entra gratis.',
      },
      {
        name: 'Opción C — Preparar la estación',
        detail:
          'Recuperas todos tus obreros, ganas obreros nuevos y el beneficio de la estación. No puedes volver atrás.',
      },
    ],
    scoring: [
      { what: 'Cartas de la ciudad', points: 'Sus puntos impresos' },
      { what: 'Prosperidad (cartas moradas)', points: 'Según su texto' },
      { what: 'Eventos básicos', points: '3 puntos' },
      { what: 'Eventos especiales', points: 'Lo que indiquen' },
      { what: 'Viaje', points: '2 a 5 puntos según la casilla' },
      { what: 'Fichas de punto sobre cartas', points: '1 punto cada una' },
    ],
    endCondition:
      'La partida acaba cuando todos han pasado por el Otoño y ya no les quedan obreros por colocar. Se suman las cartas, la prosperidad, los eventos, el viaje y las fichas. En caso de empate gana quien tenga más recursos y cartas en la mano.',
    reminders: [
      'La ciudad no puede tener más de quince cartas, y no puedes repetir una carta única.',
      'Cada criatura tiene una construcción asociada: si ya la tienes en la ciudad, la criatura te sale gratis.',
      'Preparar la estación es irreversible: si te adelantas, los demás siguen jugando mientras tú esperas.',
      'Los espacios del bosque con un solo hueco los ocupa el primero que llegue.',
      'Solo puedes ir de viaje en el Otoño, y hay que descartar tantas cartas de la mano como diga la casilla.',
    ],
    officialLink: {
      label: 'Web oficial (Starling Games)',
      url: 'https://www.starling.games/everdell',
    },
  },
}
