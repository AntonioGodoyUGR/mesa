import type { GameDefinition } from '../types'

export const anachrony: GameDefinition = {
  slug: 'anachrony',
  name: 'Anachrony',
  icon: '⏳',
  tagline: 'Facciones postapocalípticas que piden recursos prestados a su propio futuro',
  theme: { primary: '#3f7a8a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 90, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'La posición final de tu marcador tras sumar edificios, hitos, capital y penalizaciones por bucles temporales no pagados' },
    { key: 'buildings', label: 'Edificios construidos', short: 'Edificios', icon: '🏗️', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: edificios de tu capital que otorgan PV y capacidades' },
    { key: 'anomaly', label: 'Anomalía / evacuación', short: 'Anomalía', icon: '☄️', type: 'number', min: 0, hint: 'Informativo: PV por evacuar tu capital antes del impacto (Path of the Exiles) o bonos del final' },
    { key: 'paradox', label: 'Bucles no pagados', short: 'Paradoja', icon: '🌀', type: 'number', min: 0, hint: 'Informativo: préstamos temporales no devueltos; cada uno resta PV y añade fichas de paradoja al final' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '90–120 min',
    setup: [
      'Cada jugador elige una de las cuatro facciones (Armonía, Dominio, Salvación, Progreso), con su tablero de capital y sus poderes propios.',
      'Montad el tablero principal con los espacios de acción, los exo-trajes, los recursos y la vía de la anomalía que se acerca.',
      'Repartid las losetas de edificio, las cartas de hito y los marcadores de warp iniciales.',
      'Colocad el marcador de era en la primera y preparad la reserva de recursos y neutronio.',
    ],
    turn: [
      { name: '1. Preparar exo-trajes', detail: 'Cargas tus exo-trajes con energía: solo un trabajador con exo-traje energizado puede ir a los espacios de acción del mapa.' },
      { name: '2. Colocar trabajadores', detail: 'Por turnos, envías trabajadores (con exo-traje) a los espacios de acción para recoger recursos, construir edificios o avanzar.' },
      { name: '3. Saltos temporales', detail: 'Puedes abrir un warp para recibir recursos del futuro por adelantado; contraes una deuda temporal que deberás devolver más tarde o pagar en PV.' },
      { name: '4. Fase de recolección y era', detail: 'Recuperas trabajadores, cobras producción, avanzas la anomalía y, cuando llega, decides si evacuar tu capital.' },
    ],
    scoring: [
      { what: 'Edificios de tu capital', points: 'PV impresos' },
      { what: 'Hitos y objetivos cumplidos', points: 'PV variable' },
      { what: 'Capital superávit (recursos, agua, neutronio)', points: 'PV por conversión' },
      { what: 'Bucles temporales no devueltos', points: '−PV y fichas de paradoja' },
    ],
    endCondition:
      'La partida dura hasta que se resuelve la anomalía (el impacto) y se juega la era final. En el recuento se suman edificios, hitos y capital, y se restan las deudas temporales no pagadas; gana quien tenga más PV.',
    reminders: [
      'Los exo-trajes son el cuello de botella: sin energía para cargarlos, tus trabajadores no salen del búnker.',
      'Pedir recursos al futuro es potentísimo, pero cada préstamo hay que devolverlo o comerte una penalización de PV.',
      'La anomalía llega sí o sí: prepara la evacuación de tu capital con antelación para no perder puntos.',
      'Cada facción juega distinto: aprovecha tus poderes propios en vez de copiar la estrategia del vecino.',
      'El neutronio es escaso y clave para los warps y edificios avanzados: planifica de dónde lo sacarás.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/241717/anachrony',
    },
  },
}
