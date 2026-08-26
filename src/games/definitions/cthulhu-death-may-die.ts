import type { GameDefinition } from '../types'

export const cthulhuDeathMayDie: GameDefinition = {
  slug: 'cthulhu-death-may-die',
  name: 'Cthulhu: Death May Die',
  icon: '🐙',
  tagline: 'Investigadores que se enfrentan a un Primigenio para matarlo',
  theme: { primary: '#2f5a3f' },
  minPlayers: 1,
  maxPlayers: 5,
  playTime: { min: 90, max: 120 },
  difficulty: 'medium',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'elder_one_defeated', label: '¿Matasteis al Primigenio?', short: 'Primigenio', icon: '🏆', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo todos: es cooperativo, ganáis en equipo si herís al Primigenio despierto tras romper los Signos Arcanos' },
    { key: 'investigators_alive', label: 'Investigadores vivos', short: 'Vivos', icon: '🕵️', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: cuántos investigadores seguían en pie al final (si mueren todos, perdéis)' },
    { key: 'sanity_lost', label: 'Cordura perdida', short: 'Cordura', icon: '🌀', type: 'number', min: 0, hint: 'Informativo: perder cordura te acerca a la locura, pero también desbloquea habilidades de Éxtasis' },
  ],

  rules: {
    players: '1–5 jugadores',
    duration: '90–120 min',
    setup: [
      'Elegid un episodio: define el mapa de losetas, el Primigenio y los dos Signos Arcanos que hay que resolver.',
      'Cada jugador elige un investigador con su miniatura, su tablero de cordura/salud y sus habilidades iniciales.',
      'Colocad la figura del Primigenio (dormido), los Signos Arcanos, los monstruos iniciales y el mazo de misterio.',
      'Repartid las cartas de objeto y hechizo iniciales y colocad el marcador de amenaza.',
    ],
    turn: [
      { name: '1. Turno de investigador', detail: 'En tu turno tienes acciones para moverte, atacar, buscar objetos e interactuar con los Signos Arcanos.' },
      { name: '2. Tirar dados', detail: 'Los combates y pruebas se resuelven con dados de colores; los símbolos de tentáculo pueden dispararte la locura, pero la locura da poderes.' },
      { name: '3. Resolver los Signos', detail: 'Cumplir los objetivos de los dos Signos Arcanos «despierta» al Primigenio, que entonces se vuelve vulnerable.' },
      { name: '4. Fase de mitos', detail: 'Se roba una carta de mitos: aparecen más monstruos, sube la amenaza y el Primigenio o sus secuaces actúan contra vosotros.' },
    ],
    scoring: [
      { what: 'Resolver los dos Signos Arcanos y luego herir al Primigenio despierto', points: 'victoria del equipo' },
      { what: 'Que mueran todos los investigadores', points: 'derrota' },
      { what: 'Superar el límite de locura sin control / fallar el episodio', points: 'derrota' },
    ],
    endCondition:
      'Ganáis si, tras romper los dos Signos Arcanos, conseguís hacer el daño necesario a la cabeza del Primigenio ya despierto. Perdéis si caen todos los investigadores antes. No hay puntos: se supera el episodio o no.',
    reminders: [
      'La locura es un arma de doble filo: perder cordura te acerca al final, pero al enloquecer ganas habilidades de Éxtasis muy potentes.',
      'No vayáis a por el Primigenio antes de tiempo: mientras duerme es casi invulnerable; primero romped los dos Signos Arcanos.',
      'Repartid roles: alguien tanquea monstruos mientras otros resuelven los Signos.',
      'Los objetos y hechizos marcan la diferencia en la pelea final: guardad recursos para el asalto al Primigenio.',
      'Cada episodio y Primigenio cambian las reglas: leed bien la carta de misión antes de empezar.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/253344/cthulhu-death-may-die',
    },
  },
}
