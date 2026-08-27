import type { GameDefinition } from '../types'

export const obsession: GameDefinition = {
  slug: 'obsession',
  name: 'Obsession',
  icon: '🎩',
  tagline: 'Alta sociedad victoriana: reforma tu casa y organiza fiestas',
  theme: { primary: '#5a3a4a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 45, max: 90 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de prestigio',
  scoreLabelShort: 'Prestigio',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'prestige_total', label: 'Puntos de prestigio (total)', short: 'Prestigio', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma habitaciones reformadas, invitados en fiestas, cartas de familia, matrimonios y bonos de reputación' },
    { key: 'rooms', label: 'Habitaciones reformadas', short: 'Habitaciones', icon: '🏠', type: 'number', min: 0, showInSummary: true },
    { key: 'guests', label: 'Invitados atendidos', short: 'Invitados', icon: '🎉', type: 'number', min: 0 },
    { key: 'family', label: 'Cartas de familia y matrimonios', short: 'Familia', icon: '💍', type: 'number', min: 0 },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '45–90 min',
    setup: [
      'Cada jugador coge su tablero de mansión con las habitaciones sin reformar y su reserva de personal.',
      'Reparte las cartas de familia iniciales y coloca el marcador de reputación en la casilla de salida.',
      'Prepara el tablero central con las cartas de invitados, actividades de temporada y el mercado de sirvientes.',
      'Determina el orden de turno con la carta de anfitrión inicial.',
    ],
    turn: [
      { name: '1. Elegir actividad', detail: 'Cada jugador elige una carta de actividad estacional (contratar personal, comprar telas, reformar una habitación...) según el orden de turno.' },
      { name: '2. Reformar y contratar', detail: 'Gasta telas y dinero para reformar habitaciones de tu mansión o contratar sirvientes que dan bonificaciones permanentes.' },
      { name: '3. Organizar una fiesta', detail: 'Si tienes habitaciones listas, invita a personajes de la corte; cada invitado exige ciertas habitaciones reformadas y aporta prestigio y efectos.' },
      { name: '4. Fin de temporada', detail: 'Se resuelven eventos de la temporada y se avanza el marcador hacia la siguiente.' },
    ],
    scoring: [
      { what: 'Cada habitación reformada', points: 'Prestigio impreso en su loseta' },
      { what: 'Cada invitado atendido en una fiesta', points: 'Prestigio de su carta' },
      { what: 'Cartas de familia y matrimonios logrados', points: 'Según lo indicado en cada carta' },
      { what: 'Posición en el marcador de reputación', points: 'Bono final según la escala del tablero' },
    ],
    endCondition:
      'La partida termina tras la última temporada marcada por el mazo de eventos. Se suma el prestigio de habitaciones, invitados, familia y reputación; gana quien acumule más prestigio total.',
    reminders: [
      'Cada invitado exige un conjunto concreto de habitaciones reformadas: revisa su carta antes de organizar la fiesta.',
      'El personal contratado da bonos permanentes durante el resto de la partida: prioriza los que encajen con tu estrategia.',
      'Reformar habitaciones caras pronto suele valer más a largo plazo que ahorrar telas.',
      'La reputación afecta a qué invitados y actividades puedes permitirte según avanza la partida.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/284378/obsession',
    },
  },
}
