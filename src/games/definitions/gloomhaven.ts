import type { GameDefinition } from '../types'

export const gloomhaven: GameDefinition = {
  slug: 'gloomhaven',
  name: 'Gloomhaven',
  icon: '⚔️',
  tagline: 'Campaña de mazmorreo táctico: escenario a escenario, personaje a personaje',
  theme: { primary: '#5c4a2f' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Escenario superado',
      short: 'Superado',
      icon: '🤝',
      type: 'toggle',
      points: 1,
      showInSummary: true,
      hint: 'Marcadlo todos: se gana o se pierde el escenario en equipo',
    },
    {
      key: 'gold',
      label: 'Oro conseguido en el escenario',
      short: 'Oro',
      icon: '💰',
      type: 'number',
      min: 0,
      max: 100,
      hint: 'Informativo, se reparte al final de cada escenario y no decide la victoria',
    },
    {
      key: 'checkmarks',
      label: 'Casillas de logro personal marcadas',
      short: 'Logros',
      icon: '✅',
      type: 'counter',
      min: 0,
      max: 10,
      hint: 'Cada personaje tiene su propia hoja de objetivo secreto: no se detalla aquí para no destriparla',
    },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–150 min por escenario',
    setup: [
      'Cada jugador elige un personaje (empezando por los disponibles al inicio de la campaña) y prepara su mazo de cartas de Habilidad según su nivel.',
      'Se monta el mapa de losetas del escenario correspondiente, con sus monstruos, obstáculos y objetivos según indique el libro de escenarios.',
      'Se preparan los mazos de ataque de monstruos y las fichas de cada tipo de enemigo presente, escaladas según el número de jugadores.',
      'Esta chuleta cubre solo la estructura de turno general: la trama, los eventos de ciudad/carretera y los desbloqueos de personaje no se detallan aquí para no hacer spoiler.',
    ],
    turn: [
      {
        name: '1. Elegir 2 cartas de mano en secreto',
        detail: 'Cada jugador escoge 2 cartas de su mano de Habilidad: la de arriba marca su iniciativa (número) y ambas ofrecen una acción de Arriba y otra de Abajo, normalmente combinando una de movimiento/utilidad con una de ataque.',
      },
      {
        name: '2. Resolver por orden de iniciativa',
        detail: 'De menor a mayor iniciativa (personajes y monstruos mezclados), cada figura resuelve sus dos acciones elegidas, una del Arriba de una carta y otra del Abajo de la otra.',
      },
      {
        name: '3. Descansar cuando haga falta',
        detail: 'En vez de jugar 2 cartas, puedes descansar: recuperas todas las cartas jugadas (descanso largo) o descartas una carta al azar del descarte para recuperarlas (descanso corto), pero pierdes tu turno de acción.',
      },
      {
        name: '4. Agotamiento',
        detail: 'Si te quedas sin cartas jugables en tu mano (por debajo de 2, sin contar la de iniciativa ya usada), tu personaje se agota y queda fuera del resto del escenario.',
      },
    ],
    scoring: [
      { what: 'Cumplir el objetivo del escenario (derrotar enemigos, escoltar, sobrevivir X rondas, etc.)', points: 'se supera el escenario y se reparte el oro/experiencia obtenidos' },
      { what: 'Si todos los personajes se agotan antes de cumplir el objetivo, o se cumple una condición de derrota', points: 'el escenario se pierde: se conserva la experiencia ganada, pero no el oro ni los objetivos del escenario' },
    ],
    endCondition:
      'Cada escenario termina al cumplir su objetivo (victoria) o al agotarse todos los personajes / cumplirse su condición de derrota. La campaña entera sigue mientras el grupo quiera avanzar por el árbol de escenarios desbloqueados.',
    reminders: [
      'Las decisiones de la campaña (qué escenarios se desbloquean, qué cartas de ciudad se sacan) son permanentes: no hay forma de deshacerlas.',
      'Cuando un personaje llega a su condición de retiro personal (objetivo secreto de su clase), se retira de la campaña de forma definitiva, aunque siga vivo.',
      'La ficha de iniciativa de cada personaje se coloca boca abajo hasta que le toca actuar, para no revelar el plan al resto del grupo ni a quien lleva a los monstruos.',
      'No leáis en voz alta el contenido de sobres, cajas selladas o secciones del libro de escenarios que aún no os corresponda abrir.',
    ],
    officialLink: {
      label: 'Web oficial (Cephalofair Games)',
      url: 'https://cephalofair.com/pages/gloomhaven',
    },
  },
}
