import type { GameDefinition } from '../types'

export const eclipseSecondDawn: GameDefinition = {
  slug: 'eclipse-second-dawn',
  name: 'Eclipse: Second Dawn for the Galaxy',
  icon: '🚀',
  tagline: '4X galáctico: explora, investiga y conquista sectores en una tarde',
  theme: { primary: '#2b3a67' },
  minPlayers: 2,
  maxPlayers: 6,
  playTime: { min: 60, max: 200 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'reputation', label: 'Fichas de reputación y embajadores', short: 'Reputación', icon: '🎖️', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Suma los números impresos de tus fichas de reputación (combate) y de embajador (diplomacia)' },
    { key: 'sectors', label: 'Sectores controlados', short: 'Sectores', icon: '🌌', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Suma el valor en PV de la esquina de cada hexágono que controlas con un disco de influencia' },
    { key: 'discovery', label: 'Fichas de descubrimiento guardadas', short: 'Descubr.', icon: '🛸', type: 'counter', points: 2, min: 0, showInSummary: true, hint: '2 PV cada ficha de descubrimiento que decidiste guardar en vez de usar su efecto' },
    { key: 'monoliths', label: 'Monolitos', short: 'Monolitos', icon: '🗿', type: 'counter', points: 3, min: 0, showInSummary: true, hint: '3 PV por cada monolito construido en un sector que controles' },
    { key: 'traitor', label: 'Carta de traidor', short: 'Traidor', icon: '🏴', type: 'toggle', points: -2, uniquePerMatch: true, hint: '−2 PV: la tiene quien perdió el último combate contra otro jugador' },
  ],

  rules: {
    players: '2–6 jugadores',
    duration: '60–200 min',
    setup: [
      'Coloca el sector galáctico central (Sector 001) y reparte a cada jugador su tablero de especie con sus tracks de tecnología, población y economía.',
      'Cada jugador coge sus discos de influencia, sus cubos de población, sus naves iniciales y su nave insignia.',
      'Prepara las bolsas/pilas de sectores por anillos (I, II, III), las fichas de descubrimiento, las de reputación y las tecnologías del suministro.',
      'Coloca la nave estelar de cada jugador en su sector de inicio y ajusta los marcadores de tracks a su posición inicial.',
    ],
    turn: [
      { name: 'Fase de acción', detail: 'Por turnos, tomáis una acción cada uno (o pasáis): Explorar un sector nuevo, Investigar una tecnología, Mejorar una nave, Construir, Mover naves o Influir para controlar sectores. Cada acción activada mueve un disco de tu track de acciones y cuesta dinero al final de la ronda.' },
      { name: 'Fase de combate', detail: 'En cada sector con naves de varios jugadores (o Ancianos), se resuelve combate por rondas de dados según el tipo de disparo; el vencedor puede quedarse el sector y gana fichas de reputación.' },
      { name: 'Fase de mantenimiento', detail: 'Pagas el coste de tus discos de acción e influencia con dinero; produces recursos (dinero, ciencia, materiales) según tu población en cada franja.' },
      { name: 'Fase de limpieza', detail: 'Recuperas tus discos de acción, repones el suministro y avanzas el marcador de ronda.' },
    ],
    scoring: [
      { what: 'Fichas de reputación y de embajador', points: 'el número impreso de cada una' },
      { what: 'Sectores controlados', points: 'los PV de la esquina del hexágono' },
      { what: 'Fichas de descubrimiento guardadas', points: '2 PV cada una' },
      { what: 'Monolitos', points: '3 PV cada uno' },
      { what: 'Carta de traidor', points: '−2 PV' },
    ],
    endCondition:
      'La partida dura 9 rondas. Al terminar la novena se suman todas las fuentes de PV y gana quien más tenga; en empate, gana quien tenga más recursos y naves.',
    reminders: [
      'Cada disco de acción e influencia que sacas de tu tablero deja un coste de mantenimiento al descubierto: no te expandas más de lo que tu economía puede pagar.',
      'Solo guardas 2–3 fichas de reputación como máximo en tus ranuras: elige las de mayor valor.',
      'Explorar no obliga a colocar el sector: puedes descartarlo si no te conviene, pero solo puedes influir en sectores conectados a los tuyos por wormholes.',
      'La carta de traidor cambia de manos: quien pierde el último combate entre jugadores se la lleva, y resta 2 PV al final.',
      'La diplomacia con vecinos te da fichas de embajador (PV), pero rompe la paz si luego los atacas.',
    ],
    officialLink: {
      label: 'Web oficial (Lautapelit / Asmodee)',
      url: 'https://www.eclipsesecondgalaxy.com/',
    },
  },
}
