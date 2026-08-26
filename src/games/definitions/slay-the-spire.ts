import type { GameDefinition } from '../types'

export const slayTheSpire: GameDefinition = {
  slug: 'slay-the-spire',
  name: 'Slay the Spire: The Board Game',
  icon: '🗼',
  tagline: 'Escalad la Torre en equipo, carta a carta, hasta el jefe final',
  theme: { primary: '#8b1e3f' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 180 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'won', label: 'Torre superada', short: 'Superada', icon: '🤝', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo todos: se gana o se pierde en equipo' },
    { key: 'act', label: 'Acto alcanzado', short: 'Acto', icon: '🧭', type: 'counter', min: 0, max: 4, showInSummary: true, hint: 'Hasta dónde llegasteis (1–3, o 4 con el Corazón)' },
    { key: 'ascension', label: 'Nivel de Ascensión', short: 'Ascensión', icon: '📈', type: 'number', min: 0, hint: 'Informativo: dificultad extra elegida' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–180 min por expedición',
    setup: [
      'Cada jugador elige un personaje (Ironclad, Silent, Defect o Watcher) con su mazo inicial, su reliquia de salida y su tablero de vida/energía.',
      'Montad el mapa del Acto correspondiente con sus rutas de combates, elites, tiendas, hogueras y el jefe.',
      'Preparad los mazos de enemigos, de cartas de recompensa, de reliquias y de pociones.',
      'Colocad los marcadores de vida de cada personaje a su máximo.',
    ],
    turn: [
      { name: '1. Elegir ruta', detail: 'Entre combates avanzáis por el mapa eligiendo la siguiente sala: combate, elite, tienda, hoguera, evento o jefe.' },
      { name: '2. Combate por rondas', detail: 'Cada ronda: los enemigos muestran su intención, jugáis cartas gastando energía (ataques, bloqueos, poderes) y luego los enemigos ejecutan su intención.' },
      { name: '3. Recompensa', detail: 'Al ganar un combate elegís recompensas: una carta nueva para el mazo, oro, reliquias o pociones.' },
      { name: '4. Hoguera', detail: 'En las hogueras el grupo decide entre descansar (curarse) o mejorar una carta antes de seguir subiendo.' },
    ],
    scoring: [
      { what: 'Derrotar al jefe de cada Acto', points: 'avanzáis al siguiente Acto de la Torre' },
      { what: 'Superar el Acto 3 (o el Corazón en el Acto 4)', points: 'victoria de la expedición' },
      { what: 'Cualquier personaje llega a 0 de vida', points: 'la expedición se pierde para todo el equipo' },
    ],
    endCondition:
      'Ganáis todos juntos si derrotáis al jefe final de la Torre. Perdéis en cuanto un personaje cae a 0 de vida y no puede recuperarse.',
    reminders: [
      'Las intenciones de los enemigos se ven antes de actuar: bloquead pensando en lo que van a hacer, no en lo que ya hicieron.',
      'El bloqueo se pierde al empezar vuestro turno: no acumuléis bloqueo «para más tarde».',
      'Mejorar cartas y adelgazar el mazo suele valer más que añadir cartas nuevas: no infléis el mazo sin criterio.',
      'Las pociones son de un solo uso pero no cuestan energía: gastadlas en los momentos críticos en vez de guardarlas hasta el final.',
    ],
    officialLink: {
      label: 'Web oficial (Contention Games)',
      url: 'https://www.slaythespireboardgame.com/',
    },
  },
}
