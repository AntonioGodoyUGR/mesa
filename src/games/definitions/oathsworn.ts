import type { GameDefinition } from '../types'

export const oathsworn: GameDefinition = {
  slug: 'oathsworn',
  name: 'Oathsworn: Into the Deepwood',
  icon: '🐺',
  tagline: 'Campaña narrativa con combates de mazo y libro ilustrado',
  theme: { primary: '#4a5d3a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 90, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Resultado',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'victory', label: 'Encuentro superado', short: 'Victoria', icon: '🏆', type: 'toggle', points: 1, showInSummary: true, hint: 'Marca si el grupo ha completado el encuentro o capítulo de campaña' },
    { key: 'renown', label: 'Renombre ganado', short: 'Renombre', icon: '⭐', type: 'number', min: 0, showInSummary: true, hint: 'Se reparte entre los héroes al final del encuentro para mejorar cartas' },
    { key: 'wounds', label: 'Heridas / fatiga sufridas', short: 'Heridas', icon: '💔', type: 'number', min: 0 },
    { key: 'loot', label: 'Botín obtenido', short: 'Botín', icon: '🎒', type: 'number', min: 0 },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '90–150 min por encuentro',
    setup: [
      'Elige el capítulo del libro de campaña y prepara el tablero de encuentro que indique.',
      'Cada jugador elige o continúa con un héroe, con su mazo de cartas y su hoja de personaje.',
      'Coloca las miniaturas o marcadores de enemigos y el terreno según el diagrama del encuentro.',
      'Baraja el mazo de amenaza/eventos que marca el ritmo del combate.',
    ],
    turn: [
      { name: '1. Fase de héroes', detail: 'Cada jugador juega cartas de su mano para moverse, atacar o activar habilidades, gestionando su energía disponible.' },
      { name: '2. Fase de amenaza', detail: 'Se revela una carta de amenaza que activa a los enemigos según su comportamiento (mueven, atacan o invocan refuerzos).' },
      { name: '3. Resolución', detail: 'Se aplican daños, curaciones y efectos de estado; los héroes derrotados caen inconscientes hasta ser reanimados.' },
      { name: '4. Fin de ronda', detail: 'Se recicla el mazo de amenaza si se ha agotado y se comprueban condiciones especiales del encuentro.' },
    ],
    scoring: [
      { what: 'Completar el objetivo del encuentro', points: 'Victoria de campaña' },
      { what: 'Renombre repartido', points: 'Mejora cartas de héroe entre encuentros' },
      { what: 'Botín y recursos recogidos', points: 'Se guardan para la partida entre capítulos' },
    ],
    endCondition:
      'El encuentro termina al cumplir su objetivo (derrotar al jefe, sobrevivir X rondas, escapar) o al caer todos los héroes. El resultado se registra en el libro de campaña y determina el siguiente capítulo.',
    reminders: [
      'Gestiona bien la energía: jugar demasiadas cartas fuertes seguidas deja al héroe sin recursos el turno siguiente.',
      'Las decisiones del libro de campaña son permanentes: leed en voz alta y decidid en grupo antes de abrir sobres o pegatinas.',
      'Un héroe inconsciente no está eliminado: puede reanimarse durante el encuentro salvo que la ficha de reglas del capítulo diga lo contrario.',
      'Guardad el renombre y equipo obtenidos en la hoja de campaña: se arrastran de un encuentro a otro.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/338714/oathsworn-into-the-deepwood',
    },
  },
}
