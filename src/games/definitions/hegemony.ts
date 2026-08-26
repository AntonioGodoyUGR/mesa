import type { GameDefinition } from '../types'

export const hegemony: GameDefinition = {
  slug: 'hegemony',
  name: 'Hegemony: Lead Your Class to Victory',
  icon: '🏛️',
  tagline: 'Cuatro clases sociales pujan por dirigir la economía de una nación',
  theme: { primary: '#7a2f3f' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 90, max: 180 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'track', label: 'Marcador de PV al final', short: 'Track', icon: '📊', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'La posición del marcador de PV justo antes del recuento final (VP ganados durante las 5 rondas)' },
    { key: 'prosperity', label: 'Prosperidad final', short: 'Prosper.', icon: '📈', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV de tu clase por prosperidad al final (dinero/población para la Clase Trabajadora, capital para el Capitalista, etc.)' },
    { key: 'policies', label: 'Políticas afines', short: 'Políticas', icon: '📜', type: 'number', points: 1, min: 0, hint: 'PV por las políticas aprobadas que coinciden con la agenda ideológica de tu clase' },
    { key: 'objectives', label: 'Objetivos y bonos', short: 'Objetiv.', icon: '🎯', type: 'number', points: 1, min: 0, hint: 'PV por objetivos de clase cumplidos y bonos de fin de partida específicos de tu facción' },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '90–180 min',
    setup: [
      'Cada jugador toma una de las 4 clases (Trabajadora, Media, Capitalista o Estado), cada una con su tablero, mazo y forma de puntuar totalmente distinta.',
      'Montad el tablero central con el mercado laboral, los sectores de la economía (agricultura, industria, salud, educación, lujo...), la mesa de políticas y la vía de PV.',
      'Colocad los trabajadores, empresas, dinero y cartas iniciales de cada clase según su hoja de referencia.',
      'Preparad las 3 losetas de política de cada categoría en su nivel de partida y los marcadores de PV en 0.',
    ],
    turn: [
      { name: '1. Acciones de clase', detail: 'Por turnos, cada jugador gasta sus acciones haciendo lo propio de su clase: los trabajadores buscan empleo y compran bienes; los capitalistas construyen empresas y contratan; la clase media abre negocios; el Estado gestiona lo público.' },
      { name: '2. Interacción económica', detail: 'Las decisiones se cruzan: salarios, precios, huelgas, impuestos y compras afectan a todos; el flujo de dinero y trabajadores mueve la economía común.' },
      { name: '3. Voto de políticas', detail: 'Cuando se convoca elección, las clases votan (con su influencia) políticas de impuestos, salario mínimo, sanidad o educación que cambian las reglas hasta la siguiente votación.' },
      { name: '4. Producción y fin de ronda', detail: 'Se produce en los sectores, se pagan salarios e impuestos, se puntúan objetivos de la ronda y avanza el marcador de la partida.' },
    ],
    scoring: [
      { what: 'PV ganados por acciones y objetivos durante las rondas', points: 'se acumulan en la vía' },
      { what: 'Prosperidad de tu clase al final', points: 'según la tabla propia de cada clase' },
      { what: 'Políticas aprobadas afines a tu ideología', points: 'PV por cada una que coincide' },
      { what: 'Objetivos de clase y bonos finales', points: 'PV variables' },
    ],
    endCondition:
      'La partida dura 5 rondas. Tras la última se hace el recuento final sumando prosperidad, políticas afines y objetivos de cada clase; gana quien tenga más PV. Es un juego asimétrico: cada clase persigue metas diferentes.',
    reminders: [
      'Cada clase juega de forma radicalmente distinta: leed bien vuestra hoja de puntuación antes de empezar.',
      'La economía es un sistema conectado: subir salarios ayuda a la Clase Trabajadora pero encarece al Capitalista; todo lo que haces repercute en los demás.',
      'Las políticas cambian las reglas del juego: votar en bloque con otra clase puede beneficiaros a ambos... o traicionar a un aliado.',
      'No os obsesionéis solo con vuestros PV: bloquear la estrategia rival (huelgas, impuestos, precios) suele valer tanto como puntuar.',
      'El Estado gana con estabilidad y servicios públicos; las otras clases con su propia prosperidad. Entended la meta ajena para anticiparos.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/321608/hegemony-lead-your-class-to-victory',
    },
  },
}
