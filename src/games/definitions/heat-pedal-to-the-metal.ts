import type { GameDefinition } from '../types'

export const heatPedalToTheMetal: GameDefinition = {
  slug: 'heat-pedal-to-the-metal',
  name: 'Heat: Pedal to the Metal',
  icon: '🏎️',
  tagline: 'Carreras clásicas con gestión de mano y control del sobrecalentamiento',
  theme: { primary: '#b03030' },
  minPlayers: 1,
  maxPlayers: 6,
  playTime: { min: 30, max: 60 },
  difficulty: 'medium',
  scoreLabel: 'Posición de llegada',
  scoreLabelShort: 'Puesto',
  totalMode: 'explicit',
  winnerRule: 'lowest',
  targetScore: 1,

  fields: [
    { key: 'position', label: 'Puesto de llegada', short: 'Puesto', icon: '🏁', type: 'number', isTotal: true, min: 1, defaultValue: 1, showInSummary: true, hint: 'En qué posición cruzaste la meta: 1.º gana. Gana el puesto más bajo' },
    { key: 'championship_points', label: 'Puntos de campeonato', short: 'Ptos camp.', icon: '🏆', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: si jugáis campeonato, los puntos que da tu puesto (9/6/4/3/2/1 para 1.º–6.º)' },
    { key: 'laps', label: 'Vueltas completadas', short: 'Vueltas', icon: '🔄', type: 'number', min: 0, hint: 'Informativo: vueltas al circuito que llevabas al terminar la carrera' },
  ],

  rules: {
    players: '1–6 jugadores (con módulo en solitario)',
    duration: '30–60 min',
    setup: [
      'Elegid un circuito y colocad los coches en la parrilla de salida (según prueba de clasificación o al azar).',
      'Cada jugador coge su coche, su mazo de velocidad idéntico, sus cartas de Calor en el motor y su marcador de marcha en 1.ª.',
      'Robad vuestra mano inicial de cartas y colocad las cartas de Estrés según las reglas de esa partida.',
      'Definid el número de vueltas (normalmente 2–3) y, si jugáis avanzado, añadid clima, adelantamientos y patrocinadores.',
    ],
    turn: [
      { name: '1. Elegir marcha', detail: 'Cambias tu marcha (subir o bajar como mucho una) y eso fija cuántas cartas de velocidad juegas boca abajo este turno.' },
      { name: '2. Revelar y avanzar', detail: 'Todos revelan a la vez; sumas los valores y mueves tu coche esos espacios por el circuito.' },
      { name: '3. Curvas y Calor', detail: 'Si entras en una curva superando su límite de velocidad, pagas cartas de Calor por cada exceso; quedarte sin Calor te obliga a frenar (girar).' },
      { name: '4. Rebufo y recuperación', detail: 'Puedes coger rebufo si vas pegado a otro coche, adelantar, y al final del turno recuperar Calor si vas en marcha baja y descartar/robar cartas.' },
    ],
    scoring: [
      { what: 'Cruzar la meta el primero tras las vueltas fijadas', points: 'ganas la carrera' },
      { what: 'Orden de llegada del resto', points: 'define 2.º, 3.º...' },
      { what: 'En campeonato: puntos por puesto', points: '9 / 6 / 4 / 3 / 2 / 1 para 1.º–6.º' },
    ],
    endCondition:
      'La carrera acaba cuando los coches completan el número de vueltas pactado. Gana quien cruza la meta primero (el puesto más bajo). En campeonato se suman los puntos de varias carreras.',
    reminders: [
      'El Calor es tu recurso clave: gastarlo te deja correr en curvas rápidas, pero si te quedas sin él frenas en seco.',
      'Ir en marcha alta corre más pero gasta más Calor y es difícil de recuperar; alterna ritmos con cabeza.',
      'El rebufo (ir pegado al coche de delante) te da un empujón gratis: úsalo para adelantar sin gastar cartas.',
      'Las cartas de Estrés se juegan a ciegas y pueden dispararte de más: cuidado al entrar en curva con Estrés en mano.',
      'Prueba primero el modo básico; luego añade clima, patrocinadores y el Circuito de Campeonato para más profundidad.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/366013/heat-pedal-to-the-metal',
    },
  },
}
