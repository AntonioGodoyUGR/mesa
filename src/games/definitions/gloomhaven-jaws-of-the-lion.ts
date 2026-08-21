import type { GameDefinition } from '../types'

export const gloomhavenJawsOfTheLion: GameDefinition = {
  slug: 'gloomhaven-jaws',
  name: 'Gloomhaven: Jaws of the Lion',
  icon: '🦁',
  tagline: 'La puerta de entrada a Gloomhaven: escenario a escenario, desde un libro',
  theme: { primary: '#9c6b2f' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 30, max: 120 },
  difficulty: 'medium',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Escenario superado',
      short: 'Ganado',
      icon: '🤝',
      type: 'toggle',
      points: 1,
      showInSummary: true,
      hint: 'Marcadlo todos: es cooperativo, se supera o se falla el escenario en equipo',
    },
    {
      key: 'gold',
      label: 'Oro conseguido',
      short: 'Oro',
      icon: '💰',
      type: 'number',
      min: 0,
      hint: 'Informativo: para repartir y anotar en las hojas de personaje al final',
    },
    {
      key: 'scenario_number',
      label: 'Número de escenario jugado',
      short: 'Escenario',
      icon: '📖',
      type: 'number',
      min: 1,
      max: 17,
      hint: 'Para llevar la cuenta de por dónde vais en el libro de campaña',
    },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '30–60 min por escenario, unos 17 escenarios en total',
    setup: [
      'Esta chuleta cubre solo la estructura de juego (idéntica a la de Gloomhaven): la campaña añade sobres y secciones del libro que no se detallan aquí para no destriparla.',
      'Cada jugador elige uno de los 4 personajes iniciales (Guardia Roja, Guardiana del Vacío, Demoledor, Hachero) y coge su mazo de cartas de Acción y su miniatura.',
      'No hay losetas de mapa: cada escenario se monta directamente abriendo su página del libro de escenarios, que indica enemigos, obstáculos y objetivo.',
      'Se preparan los mazos de Modificador de Ataque y las fichas de Condición de cada personaje.',
    ],
    turn: [
      {
        name: '1. Selección de cartas',
        detail: 'En secreto, cada jugador elige 2 cartas de su mano: la Iniciativa (número) de una de ellas marca el orden de turno de esa ronda.',
      },
      {
        name: '2. Turno de cada personaje y monstruo',
        detail: 'Por orden de Iniciativa, cada personaje activa la acción de arriba de una carta y la de abajo de la otra (moverse, atacar, curar...); los monstruos actúan según su IA.',
      },
      {
        name: '3. Descanso',
        detail: 'Con pocas cartas en la mano, un personaje puede descansar: corto (recupera una carta al azar, pierde una) o largo (recupera toda la mano, pierde una, cura 2).',
      },
      {
        name: '4. Agotamiento',
        detail: 'Si un personaje se queda sin cartas jugables, queda agotado y sale del escenario; si todos quedan agotados antes de cumplir el objetivo, el escenario se pierde.',
      },
    ],
    scoring: [
      { what: 'Cumplir el objetivo del escenario (derrotar enemigos, escoltar, sobrevivir...) antes de que el grupo quede agotado', points: 'el escenario se gana' },
      { what: 'Cada escenario', points: 'da su propio oro, experiencia y desbloqueos, que no se detallan aquí' },
    ],
    endCondition:
      'Cada escenario termina al cumplir (o fallar) su objetivo concreto; superarlo desbloquea la siguiente parte del libro de campaña y reparte oro y experiencia entre los personajes.',
    reminders: [
      'La estructura de turnos es igual que en Gloomhaven clásico: si ya lo jugasteis, esto os sonará idéntico.',
      'Los primeros 5 escenarios funcionan como tutorial y presentan las reglas poco a poco: no os preocupéis si al principio parece simple.',
      'El libro de escenarios sustituye a las losetas de mapa: seguid solo las instrucciones de la página indicada para no adelantar información.',
      'Guardad las hojas de personaje y el progreso del libro tal cual entre sesiones: son la partida guardada de la campaña.',
    ],
    officialLink: {
      label: 'Web oficial (Cephalofair Games)',
      url: 'https://cephalofair.com/pages/jaws-of-the-lion',
    },
  },
}
