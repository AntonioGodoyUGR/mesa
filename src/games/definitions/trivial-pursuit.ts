import type { GameDefinition } from '../types'

export const trivialPursuit: GameDefinition = {
  slug: 'trivial-pursuit',
  name: 'Trivial Pursuit',
  icon: '🧀',
  tagline: 'Seis quesitos y la pregunta final',
  theme: {
    primary: '#7a3fb3',
    accent: '#e8a33d',
    surface: '#f4eefb',
  },
  minPlayers: 2,
  maxPlayers: 6,
  playTime: { min: 60, max: 90 },
  difficulty: 'easy',
  scoreLabel: 'Quesitos',
  scoreLabelShort: 'Q',
  totalMode: 'computed',
  winnerRule: 'highest',
  targetScore: 7,

  fields: [
    {
      key: 'wedges',
      label: 'Quesitos conseguidos',
      short: 'Quesitos',
      icon: '🧀',
      type: 'counter',
      points: 1,
      min: 0,
      max: 6,
      showInSummary: true,
      hint: 'Uno por cada categoría',
    },
    {
      key: 'center',
      label: 'Acertó la pregunta final',
      short: 'Final',
      icon: '🎯',
      type: 'toggle',
      points: 1,
      uniquePerMatch: true,
      showInSummary: true,
      hint: 'Solo lo consigue quien gana la partida',
    },
    {
      key: 'right_answers',
      label: 'Respuestas acertadas',
      short: 'Aciertos',
      icon: '✅',
      type: 'counter',
      group: 'Registro',
      min: 0,
      max: 99,
      hint: 'No suma: se guarda como estadística',
    },
  ],

  rules: {
    players: '2–6 jugadores o equipos',
    duration: '60–90 min',
    setup: [
      'Cada jugador coge un queso vacío y lo pone en la casilla central.',
      'Coloca las cajas de cartas al alcance de todos, con las respuestas tapadas.',
      'Repartid quién lee cada carta: siempre la lee el jugador de la izquierda.',
      'Decidid antes de empezar si jugáis por parejas o cada uno por su cuenta.',
      'Empieza quien saque el número más alto con el dado.',
    ],
    turn: [
      {
        name: '1. Tirar y elegir camino',
        detail:
          'Avanza las casillas del dado en la dirección que quieras, pero sin cambiar de sentido a mitad de movimiento.',
      },
      {
        name: '2. Responder',
        detail:
          'Te preguntan de la categoría del color de tu casilla. Si aciertas, vuelves a tirar; si fallas, pasa el turno al siguiente.',
      },
      {
        name: '3. Casillas de quesito',
        detail:
          'Si caes en una de las seis casillas grandes y aciertas, te llevas el quesito de ese color. Si ya lo tenías, simplemente repites tirada.',
      },
    ],
    scoring: [
      { what: 'Acertar en una casilla normal', points: 'Repites tirada' },
      { what: 'Acertar en casilla de quesito', points: '1 quesito' },
      { what: 'Caer en «Tira otra vez»', points: 'Turno extra' },
      { what: 'Los seis quesitos', points: 'Puedes ir al centro' },
      { what: 'Pregunta final acertada', points: 'Ganas la partida' },
    ],
    endCondition:
      'Cuando tienes los seis quesitos vas al centro con la tirada exacta. Allí los demás eligen la categoría de la pregunta final: si aciertas ganas, y si fallas te sales del centro y esperas a tu siguiente turno para volver a intentarlo.',
    reminders: [
      'La respuesta se da antes de que se lea la solución: no vale rectificar después de oírla.',
      'Para entrar en el centro hay que sacar el número exacto.',
      'No puedes cambiar de dirección a mitad de un movimiento, aunque sí de una tirada a otra.',
      'Si juegas por parejas, solo responde quien tiene el turno; el compañero no puede soplar.',
    ],
    officialLink: {
      label: 'Web oficial (Hasbro)',
      url: 'https://www.hasbro.com/en-us/brands/trivialpursuit',
    },
  },
}
