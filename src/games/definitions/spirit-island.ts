import type { GameDefinition } from '../types'

export const spiritIsland: GameDefinition = {
  slug: 'spirit-island',
  name: 'Spirit Island',
  icon: '🏝️',
  tagline: 'Espíritus cooperando para echar a los colonos antes de que arrasen la isla',
  theme: { primary: '#8a4a1f' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 90, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'won',
      label: 'Partida ganada',
      short: 'Ganada',
      icon: '🤝',
      type: 'toggle',
      points: 1,
      showInSummary: true,
      hint: 'Marcadlo todos: es cooperativo, se gana o se pierde en equipo',
    },
    {
      key: 'terror_level',
      label: 'Nivel de Terror alcanzado',
      short: 'Terror',
      icon: '😱',
      type: 'number',
      min: 1,
      max: 4,
      hint: 'Informativo: cada nivel de Miedo conseguido rebaja la condición de victoria (1=echar a todos, 4=victoria automática)',
    },
    {
      key: 'adversary_level',
      label: 'Nivel del Adversario',
      short: 'Nivel',
      icon: '⚔️',
      type: 'number',
      min: 0,
      max: 6,
      hint: 'Informativo: la dificultad de los Invasores elegida para esta partida',
    },
  ],

  rules: {
    players: '1–4 jugadores (hasta 6 con expansiones)',
    duration: '90–120 min',
    setup: [
      'Cada jugador elige un tablero de Espíritu (poderes únicos y asimétricos) y coloca su Presencia inicial sobre la isla.',
      'Se elige una nación Invasora y un Adversario con su nivel de dificultad, que determina el ritmo y la agresividad de la colonización.',
      'Se monta el tablero de la isla con sus territorios, se colocan los Dahan (nativos) y los Invasores iniciales según el escenario.',
      'Se prepara el mazo de Invasores (Explorar/Construir/Arrasar), el tablero de Miedo con sus cartas boca abajo y el suministro de Plaga.',
    ],
    turn: [
      {
        name: '1. Fase de Espíritu',
        detail: 'Cada jugador hace crecer su Espíritu (gana Presencia, cartas o elementos) y elige en secreto qué Poderes Rápidos y Lentos jugar esta ronda.',
      },
      {
        name: '2. Fase de Miedo y Poderes Rápidos',
        detail: 'Se genera Miedo según lo acumulado y se resuelven los Poderes Rápidos de todos los jugadores, normalmente antes de que actúen los Invasores.',
      },
      {
        name: '3. Fase de Invasores',
        detail: 'Los Invasores Exploran (aparecen en nuevos territorios), Construyen (suben de Fase) y Arrasan (atacan Dahan y Presencia, generando Plaga) según el mazo de Invasores.',
      },
      {
        name: '4. Fase de Poderes Lentos y Tiempo',
        detail: 'Se resuelven los Poderes Lentos, se descartan las cartas usadas, se recuperan las de Poder y comprueba si sube el Nivel de Terror.',
      },
    ],
    scoring: [
      { what: 'No quedan Invasores en la isla (Nivel de Terror 1)', points: 'victoria' },
      { what: 'No quedan Pueblos ni Ciudades (Nivel de Terror 2)', points: 'victoria' },
      { what: 'No quedan Ciudades (Nivel de Terror 3)', points: 'victoria' },
      { what: 'Se completan todas las cartas de Miedo (Nivel de Terror 4)', points: 'victoria automática' },
      { what: 'La Plaga se agota, un Espíritu pierde toda su Presencia, o se acaba el mazo de Invasores', points: 'derrota' },
    ],
    endCondition:
      'La partida termina en cuanto se cumple la condición de victoria correspondiente al Nivel de Terror alcanzado, o en cuanto se cumple alguna condición de derrota (Plaga agotada, un Espíritu sin Presencia en el tablero, o mazo de Invasores agotado).',
    reminders: [
      'Generar Miedo no es opcional secundario: cada carta de Miedo completada baja el listón para ganar, así que a veces conviene priorizarlo sobre defender territorio.',
      'Los Dahan pegan fuerte si se les da Ataque suficiente: protegerlos y potenciarlos es tan válido como usar el poder directo de los Espíritus.',
      'Cada Espíritu tiene su propia curva de poder: algunos son lentos al principio y explosivos después, no juzguéis la potencia por las primeras rondas.',
      'El Adversario y su nivel marcan la dificultad real de la partida: subirlo un punto cambia mucho el reto sin cambiar las reglas base.',
    ],
    officialLink: {
      label: 'Web oficial (Greater Than Games)',
      url: 'https://greaterthangames.com/product/spirit-island/',
    },
  },
}
