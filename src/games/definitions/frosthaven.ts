import type { GameDefinition } from '../types'

export const frosthaven: GameDefinition = {
  slug: 'frosthaven',
  name: 'Frosthaven',
  icon: '❄️',
  tagline: 'La secuela de Gloomhaven: sobrevive al invierno y levanta tu asentamiento',
  theme: { primary: '#2f5a6b' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'won', label: 'Escenario superado', short: 'Ganado', icon: '🤝', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo todos: es cooperativo, se supera o se falla el escenario en equipo' },
    { key: 'gold', label: 'Oro conseguido', short: 'Oro', icon: '💰', type: 'number', min: 0, hint: 'Informativo: para repartir y anotar en las hojas de personaje al final' },
    { key: 'scenario_number', label: 'Número de escenario jugado', short: 'Escenario', icon: '📖', type: 'number', min: 1, hint: 'Para llevar la cuenta de por dónde vais en la campaña' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–120 min por escenario',
    setup: [
      'Esta chuleta cubre solo la estructura de juego: la campaña añade sobres, mapas y secciones que no se detallan aquí para no destriparla.',
      'Cada jugador elige uno de los personajes iniciales disponibles y coge su mazo de cartas de Habilidad y su miniatura.',
      'Se monta el escenario usando los libros de superficie de juego (play surface books), que sustituyen a la mayoría de losetas y fichas de superposición.',
      'Se preparan los mazos de Modificador de Ataque y las fichas de Condición de cada personaje.',
    ],
    turn: [
      {
        name: '1. Selección de cartas',
        detail: 'En secreto, cada jugador elige 2 cartas de su mano (o declara descanso largo): la Iniciativa de una de ellas marca su orden de turno.',
      },
      {
        name: '2. Turno de cada personaje y monstruo',
        detail: 'Por orden de Iniciativa, cada personaje activa la acción de arriba de una carta y la de abajo de la otra; los monstruos actúan según su IA.',
      },
      {
        name: '3. Fin de ronda',
        detail: 'Se resuelven efectos de fin de ronda y los elementos activos pierden intensidad un escalón.',
      },
      {
        name: '4. Agotamiento',
        detail: 'Un personaje sin cartas jugables en mano y descarte queda agotado y sale del escenario; si todos quedan agotados antes del objetivo, se pierde.',
      },
    ],
    scoring: [
      { what: 'Cumplir el objetivo del escenario antes de que el grupo quede agotado', points: 'el escenario se gana' },
      { what: 'Objetivos de batalla cumplidos por cada personaje', points: 'marcas hacia perks de personaje (3 marcas = 1 perk)' },
      { what: 'Cada escenario superado', points: 'da oro, recursos y desbloqueos para el asentamiento, que no se detallan aquí' },
    ],
    endCondition:
      'Cada escenario termina al cumplir (o fallar) su objetivo concreto. Superarlo reparte oro y recursos entre los personajes y desbloquea la siguiente parte de la campaña; fallarlo no da recompensas y se puede repetir.',
    reminders: [
      'La estructura de turnos es la misma que en Gloomhaven: selección de cartas, iniciativa, turnos y descansos.',
      'Entre escenarios hay una fase de asentamiento (Frosthaven) donde se gestionan recursos, construcciones y bajadas de nivel: llevad aparte el tiempo de mesa que le dediquéis si os importa el ritmo de sesión.',
      'Los recursos de construcción (madera, metal, piel, hierbas) son distintos del oro: no los mezcléis al anotar.',
      'Guardad las hojas de personaje y el progreso de la campaña tal cual entre sesiones: son la partida guardada.',
    ],
    officialLink: {
      label: 'Web oficial (Cephalofair Games)',
      url: 'https://cephalofair.com/pages/frosthaven',
    },
  },
}
