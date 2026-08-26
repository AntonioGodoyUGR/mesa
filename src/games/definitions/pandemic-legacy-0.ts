import type { GameDefinition } from '../types'

export const pandemicLegacySeason0: GameDefinition = {
  slug: 'pandemic-legacy-0',
  name: 'Pandemic Legacy: Season 0',
  icon: '🕵️',
  tagline: 'Precuela de espionaje en la Guerra Fría: agentes de la CIA en misión encubierta',
  theme: { primary: '#3a5a7a' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 45, max: 60 },
  difficulty: 'hard',
  scoreLabel: '¿Misión superada?',
  scoreLabelShort: 'Misión',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'mission_won', label: 'Misión superada', short: 'Ganada', icon: '🏆', type: 'toggle', points: 1, showInSummary: true, hint: 'Marca si el equipo completó el objetivo de la partida de campaña de este mes' },
    { key: 'objectives', label: 'Objetivos completados', short: 'Objetivos', icon: '✅', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: cuántos objetivos de la misión lograsteis (algunos son obligatorios y otros opcionales)' },
    { key: 'incidents', label: 'Incidentes', short: 'Incidentes', icon: '💥', type: 'number', min: 0, max: 8, hint: 'Informativo: brotes/incidentes acumulados; a 8 la partida se pierde' },
    { key: 'targets', label: 'Objetivos enemigos neutralizados', short: 'Blancos', icon: '🎯', type: 'number', min: 0, hint: 'Informativo: agentes/blancos enemigos que identificasteis o neutralizasteis' },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '45–60 min por partida',
    setup: [
      'Es una campaña legacy: se juega en orden, mes a mes, y las cartas, el tablero y los personajes cambian de forma permanente entre partidas.',
      'Cada agente elige un personaje con su rol y habilidad; repartid las cartas de agente y las de ciudad según indique el dossier del mes.',
      'Colocad los cubos de «tensión», los marcadores de red enemiga y las cartas de objetivo de la misión actual.',
      'Seguid las instrucciones del expediente/legacy deck: abrid solo lo que el juego os indique cuando toque.',
    ],
    turn: [
      { name: '1. Acciones (4)', detail: 'En tu turno haces hasta 4 acciones: moverte, establecer contactos/redes, recoger inteligencia, intercambiar cartas o cumplir objetivos de la misión.' },
      { name: '2. Robar cartas', detail: 'Robas 2 cartas; si sale una carta de «alerta»/incidente, resuelves su efecto (equivalente a la epidemia clásica).' },
      { name: '3. Fase enemiga', detail: 'Se roban cartas de la red enemiga que activan ciudades y aumentan la tensión/presencia enemiga en el mapa.' },
      { name: '4. Progreso legacy', detail: 'Al acabar, se aplican las consecuencias permanentes (pegatinas, rasgar cartas, cicatrices de personaje) según el resultado.' },
    ],
    scoring: [
      { what: 'Completar el objetivo de la misión del mes', points: 'victoria del equipo' },
      { what: 'Acumular demasiados incidentes o quedarse sin cartas', points: 'derrota (la campaña continúa igualmente)' },
    ],
    endCondition:
      'Es un juego cooperativo: se gana o se pierde en equipo cada partida. Ganáis si cumplís el objetivo del mes antes de que la tensión llegue al máximo o se agote el mazo. El resultado modifica de forma permanente la campaña siguiente.',
    reminders: [
      'Es cooperativo: no hay ganador individual, ganáis o perdéis todos juntos según la misión del mes.',
      'Legacy significa cambios permanentes: pensad bien antes de rasgar cartas o pegar pegatinas, no hay vuelta atrás.',
      'Coordinad las 4 acciones de cada agente: repartir tareas evita malgastar turnos.',
      'Vigilad el marcador de incidentes/tensión: subir demasiado rápido os cuesta la partida.',
      'Como precuela de espionaje, la gestión de identidades y contactos sustituye a curar enfermedades: leed bien el objetivo del mes.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/314040/pandemic-legacy-season-0',
    },
  },
}
