import type { GameDefinition } from '../types'

export const rummikub: GameDefinition = {
  slug: 'rummikub',
  name: 'Rummikub',
  icon: '🎴',
  tagline: 'Grupos, escaleras y fichas que cambian de sitio',
  theme: {
    primary: '#1d6fa5',
    accent: '#e07a3f',
    surface: '#eaf3f9',
  },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 45, max: 60 },
  difficulty: 'easy',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',

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
      // Sin `min`: quien pierde una ronda se va a negativo, que es lo normal aquí.
      hint: 'Suele quedar en negativo salvo para quien gana rondas',
    },
    {
      key: 'rounds_won',
      label: 'Rondas ganadas',
      short: 'Rondas',
      icon: '🥇',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 30,
      showInSummary: true,
    },
    {
      key: 'jokers_left',
      label: 'Comodines que se le quedaron',
      short: 'Comodines',
      icon: '🃏',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 4,
      hint: 'Cada uno son 30 puntos en contra',
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '45–60 min',
    setup: [
      'Pon las 106 fichas boca abajo sobre la mesa y mézclalas.',
      'Cada jugador coge 14 fichas y las coloca en su atril sin enseñarlas.',
      'El resto de fichas se queda en el centro como reserva.',
      'Empieza quien saque la ficha más alta en el sorteo inicial.',
    ],
    turn: [
      {
        name: '1. Salir',
        detail:
          'Tu primera jugada tiene que sumar al menos 30 puntos usando solo fichas de tu atril. Hasta que sales no puedes tocar lo que hay en la mesa.',
      },
      {
        name: '2. Jugar y reorganizar',
        detail:
          'Una vez has salido puedes añadir fichas a cualquier combinación y descomponer y rehacer lo que hay en la mesa, siempre que al acabar tu turno todo sean grupos o escaleras válidos.',
      },
      {
        name: '3. Robar',
        detail:
          'Si no colocas ninguna ficha, coges una de la reserva y pasa el turno. Tienes un minuto para pensar si jugáis con reloj.',
      },
    ],
    scoring: [
      { what: 'Cada ficha', points: 'Su número' },
      { what: 'Comodín en la mesa', points: 'El valor de la ficha que sustituye' },
      { what: 'Salida mínima', points: '30 puntos en una sola jugada' },
      { what: 'Fichas que te sobran', points: '−su valor' },
      { what: 'Comodín sin usar', points: '−30 puntos' },
      { what: 'Ganador de la ronda', points: '+ la suma de lo que pierden los demás' },
    ],
    endCondition:
      'La ronda acaba cuando alguien se queda sin fichas (o cuando nadie puede jugar y la reserva está vacía: gana quien menos puntos tenga en el atril). Cada jugador resta el valor de sus fichas y el ganador suma en positivo todo lo que restan los demás. La partida son varias rondas: gana quien acabe con más puntos.',
    reminders: [
      'Un grupo son 3 o 4 fichas del mismo número y distinto color; una escalera son 3 o más números seguidos del mismo color.',
      'El 1 va siempre por debajo del 2: no enlaza con el 13 para hacer 12-13-1.',
      'La salida de 30 puntos se cuenta solo con tus fichas; no vale apoyarse en la mesa.',
      'Si al acabar tu turno queda una combinación inválida, deshaces la jugada y robas tres fichas de penalización.',
      'Un comodín que ya está en la mesa solo se puede recuperar sustituyéndolo por la ficha exacta que representa, y hay que usarlo en ese mismo turno.',
    ],
    officialLink: {
      label: 'Web oficial (Rummikub)',
      url: 'https://www.rummikub.com/',
    },
  },
}
