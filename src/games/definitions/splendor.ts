import type { GameDefinition } from '../types'

export const splendor: GameDefinition = {
  slug: 'splendor',
  name: 'Splendor',
  icon: '💎',
  tagline: 'Gemas, cartas de descuento y carrera a 15',
  theme: {
    primary: '#4a5aa8',
    accent: '#d4af37',
    surface: '#eef0fa',
  },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 30, max: 30 },
  difficulty: 'easy',
  scoreLabel: 'Prestigio',
  scoreLabelShort: 'PP',
  totalMode: 'explicit',
  winnerRule: 'highest',
  targetScore: 15,

  fields: [
    {
      key: 'prestige',
      label: 'Puntos de prestigio',
      short: 'Prestigio',
      icon: '💎',
      type: 'number',
      points: 1,
      isTotal: true,
      min: 0,
      showInSummary: true,
      hint: 'Cartas + nobles. Se gana al llegar a 15',
    },
    {
      key: 'nobles',
      label: 'Nobles conseguidos',
      short: 'Nobles',
      icon: '👑',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 5,
      showInSummary: true,
      hint: 'Cada uno vale 3 puntos, ya incluidos arriba',
    },
    {
      key: 'cards',
      label: 'Cartas de desarrollo',
      short: 'Cartas',
      icon: '🃏',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 40,
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '30 min',
    setup: [
      'Ordena las cartas por nivel y pon cuatro descubiertas de cada uno.',
      'Coloca los nobles: uno más que jugadores.',
      'Pon las fichas de gema según el número de jugadores: 4 de cada color con dos, 5 con tres y 7 con cuatro.',
      'Los 5 comodines de oro siempre están disponibles.',
      'Empieza quien haya visitado la joyería más recientemente, o sortead.',
    ],
    turn: [
      {
        name: 'Opción A — Coger gemas',
        detail:
          'Tres fichas de colores distintos, o dos del mismo color si en esa pila quedan al menos cuatro.',
      },
      {
        name: 'Opción B — Comprar una carta',
        detail:
          'Paga su coste con gemas y con los descuentos de las cartas que ya tengas; el oro vale por cualquier color.',
      },
      {
        name: 'Opción C — Reservar',
        detail:
          'Coges una carta visible (o la de arriba del mazo) y te la guardas boca abajo, más una ficha de oro. Máximo tres reservas.',
      },
    ],
    scoring: [
      { what: 'Carta de nivel 1', points: '0–1 puntos' },
      { what: 'Carta de nivel 2', points: '1–3 puntos' },
      { what: 'Carta de nivel 3', points: '3–5 puntos' },
      { what: 'Noble', points: '3 puntos' },
      { what: 'Meta de la partida', points: '15 puntos de prestigio' },
    ],
    endCondition:
      'Cuando alguien llega a 15 puntos se termina la ronda para que todos hayan jugado los mismos turnos. Gana quien más prestigio tenga; si hay empate, gana quien haya comprado menos cartas de desarrollo.',
    reminders: [
      'No puedes acabar tu turno con más de 10 fichas: devuelve las que sobren.',
      'Las cartas compradas dan un descuento permanente de su color, no se gastan.',
      'Los nobles llegan solos y son gratis: en cuanto cumples sus requisitos, se van contigo (solo uno por turno).',
      'El oro solo se consigue reservando cartas.',
      'Si en una pila no quedan cuatro fichas, no puedes coger dos del mismo color.',
    ],
    officialLink: {
      label: 'Web oficial (Space Cowboys)',
      url: 'https://www.spacecowboys.fr/',
    },
  },
}
