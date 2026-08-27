import type { GameDefinition } from '../types'

export const theWhiteCastle: GameDefinition = {
  slug: 'the-white-castle',
  name: 'The White Castle',
  icon: '🏯',
  tagline: 'Tres puentes, dados de colores y una hora larga de decisiones',
  theme: { primary: '#8a8a9a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 45, max: 80 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de prestigio',
  scoreLabelShort: 'Prestigio',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'prestige_total', label: 'Puntos de prestigio (total)', short: 'Prestigio', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma cartas de personaje jugadas, secciones del jardín, favor del emperador y bonos de arroz/sake' },
    { key: 'garden', label: 'Secciones de jardín completadas', short: 'Jardín', icon: '🌸', type: 'number', min: 0, showInSummary: true },
    { key: 'characters', label: 'Cartas de personaje usadas', short: 'Personajes', icon: '🎴', type: 'number', min: 0 },
    { key: 'emperor_favor', label: 'Favor del emperador', short: 'Favor', icon: '👑', type: 'number', min: 0 },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '45–80 min',
    setup: [
      'Cada jugador coge su tablero personal de jardín y su reserva inicial de arroz y sake.',
      'Coloca el tablero central con los tres puentes (poeta, guerrero y político) y el marcador del emperador en el centro.',
      'Reparte las cartas de personaje según el número de jugadores y prepara el suministro de dados de colores.',
      'Determina el orden de turno inicial.',
    ],
    turn: [
      { name: '1. Elegir dado', detail: 'Cada jugador coge un dado disponible del suministro y avanza al emperador hacia el puente correspondiente a su color.' },
      { name: '2. Jugar una carta', detail: 'Usa el valor del dado para activar una carta de personaje de tu mano, obteniendo recursos, avanzando en el jardín o ganando favor.' },
      { name: '3. Mover al emperador', detail: 'El emperador cruza el puente que reciba más apoyo acumulado ese turno, otorgando bonos a quienes apostaron por ese lado.' },
      { name: '4. Reposición', detail: 'Se repone el suministro de dados y cartas para el siguiente turno.' },
    ],
    scoring: [
      { what: 'Cada sección de jardín completada', points: 'Prestigio según la sección' },
      { what: 'Cartas de personaje jugadas con éxito', points: 'Prestigio indicado en cada carta' },
      { what: 'Favor final con el emperador', points: 'Bono según la posición alcanzada' },
      { what: 'Arroz y sake acumulados', points: 'Convertibles en prestigio al final según su tabla' },
    ],
    endCondition:
      'La partida termina cuando el emperador ha cruzado los tres puentes o se agota el mazo de cartas, según el modo de juego. Se suma el prestigio de jardín, personajes y favor; gana quien tenga más puntos.',
    reminders: [
      'El color del dado que elijas determina a qué puente empuja al emperador: coordina tu mano de cartas con los dados que puedas necesitar.',
      'El emperador avanza en base al apoyo acumulado, no al de un único jugador: vigila lo que hacen los demás antes de comprometerte.',
      'Guardar arroz y sake sin gastar puede convertirse en prestigio al final, pero gastarlos pronto puede activar mejores cartas.',
      'Hay una vía en solitario contra un temporizador de emperador automático.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/366013/the-white-castle',
    },
  },
}
