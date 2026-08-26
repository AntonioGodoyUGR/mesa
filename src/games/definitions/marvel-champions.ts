import type { GameDefinition } from '../types'

export const marvelChampions: GameDefinition = {
  slug: 'marvel-champions',
  name: 'Marvel Champions: El Juego de Cartas',
  icon: '🦸',
  tagline: 'Cooperativo de héroes contra villanos que amenazan con su plan',
  theme: { primary: '#b02a2a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 45, max: 90 },
  difficulty: 'medium',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Res.',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'villain_defeated', label: '¿Derrotasteis al villano?', short: 'Villano', icon: '🏆', type: 'toggle', points: 1, showInSummary: true, hint: 'Marcadlo todos: es cooperativo, ganáis en equipo si agotáis la vida del villano en su última fase' },
    { key: 'hero_alive', label: 'Héroes en pie', short: 'En pie', icon: '❤️', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: cuántos héroes seguían vivos al final (si todos caen, perdéis)' },
    { key: 'scheme_threat', label: 'Amenaza del plan', short: 'Amenaza', icon: '💣', type: 'number', min: 0, hint: 'Informativo: cuánta amenaza había en el plan principal (si se completa, perdéis)' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '45–90 min',
    setup: [
      'Cada jugador elige un héroe (Spider-Man, Ms. Marvel, Iron Man...) con su mazo, su carta de identidad a dos caras y su aspecto (Agresión, Justicia, Liderazgo o Protección).',
      'Elegid un villano y su set de encuentro; montad su mazo, su plan principal y la dificultad (estándar o experto).',
      'Colocad la vida del villano, los esbirros y las cartas de plan secundario según indique el escenario.',
      'Cada héroe roba su mano y coloca sus recursos; decidid quién empieza.',
    ],
    turn: [
      { name: '1. Fase de jugador', detail: 'En tu turno juegas cartas gastando recursos: mejoras, apoyos, eventos; y decides estar en forma de Héroe (atacar/defender) o de Alter Ego (recuperar vida y robar más).' },
      { name: '2. Atacar o frustrar', detail: 'En forma de Héroe, atacas al villano para bajar su vida o frustras su plan para retirar amenaza; en Alter Ego te recuperas pero no puedes atacar.' },
      { name: '3. Fase de villano', detail: 'El villano añade amenaza a su plan, activa a sus esbirros y te ataca a ti o a tu plan; se roba una carta de encuentro que suele complicar las cosas.' },
      { name: '4. Preparar', detail: 'Se enderezan cartas, se ajusta la mano y empieza la siguiente ronda.' },
    ],
    scoring: [
      { what: 'Reducir a 0 la vida del villano en su fase final', points: 'victoria del equipo' },
      { what: 'Que el plan principal complete su amenaza', points: 'derrota' },
      { what: 'Que todos los héroes sean derrotados (vida a 0 en forma de Héroe)', points: 'derrota' },
    ],
    endCondition:
      'Ganáis si derrotáis al villano en su última fase antes de que su plan se complete o de que caigan todos los héroes. No hay puntos: se supera el escenario o no. Cada villano y dificultad plantea un reto distinto.',
    reminders: [
      'Alterna entre Héroe y Alter Ego: no puedes atacar y recuperarte a la vez; leer cuándo cambiar es la clave del juego.',
      'Cada aspecto aporta un estilo (daño, control de amenaza, aliados, defensa): en grupo repartid roles.',
      'No ignoréis el plan principal: si se llena de amenaza perdéis aunque el villano tenga vida.',
      'Los esbirros pican cada ronda; decidid si limpiarlos o centraros en el villano según la amenaza acumulada.',
      'Empezad en dificultad estándar; el modo experto añade una fase de villano mucho más dura.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/285774/marvel-champions-the-card-game',
    },
  },
}
