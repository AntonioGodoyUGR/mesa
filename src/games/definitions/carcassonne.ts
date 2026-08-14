import type { GameDefinition } from '../types'

export const carcassonne: GameDefinition = {
  slug: 'carcassonne',
  name: 'Carcassonne',
  icon: '🏰',
  tagline: 'Coloca losetas, reclama ciudades y caminos',
  theme: {
    primary: '#4a6fa5',
    accent: '#7fa650',
    surface: '#eef2f9',
  },
  minPlayers: 2,
  maxPlayers: 5,
  playTime: { min: 30, max: 45 },
  difficulty: 'medium',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'points',
      label: 'Puntos',
      icon: '🎯',
      type: 'number',
      isTotal: true,
      min: 0,
      max: 400,
      showInSummary: true,
      hint: 'Marcador final del jugador',
    },
    {
      key: 'cities',
      label: 'Ciudades',
      icon: '🏰',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 400,
    },
    {
      key: 'roads',
      label: 'Caminos',
      icon: '🛣️',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 400,
    },
    {
      key: 'monasteries',
      label: 'Monasterios',
      icon: '⛪',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 400,
    },
    {
      key: 'farms',
      label: 'Campos',
      icon: '🌾',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 400,
    },
  ],

  rules: {
    players: '2–5 jugadores',
    duration: '30–45 min',
    setup: [
      'Coloca la loseta inicial (la del dorso más oscuro) en el centro de la mesa.',
      'Baraja el resto de losetas y déjalas boca abajo en montones.',
      'Cada jugador coge sus 8 seguidores: 7 en la reserva y 1 en el marcador de puntos, en la casilla 0.',
    ],
    turn: [
      {
        name: '1. Robar y colocar loseta',
        detail:
          'Roba una loseta y colócala junto a otra ya jugada. Todos los lados en contacto deben encajar: campo con campo, camino con camino, ciudad con ciudad.',
      },
      {
        name: '2. Colocar seguidor (opcional)',
        detail:
          'Pon un seguidor de tu reserva sobre la loseta que acabas de colocar: en la ciudad (caballero), el camino (ladrón), el monasterio (monje) o el campo (granjero). Solo si ese elemento no tiene ya un seguidor de nadie.',
      },
      {
        name: '3. Puntuar lo completado',
        detail:
          'Todo elemento que quede terminado con esa loseta puntúa de inmediato y sus seguidores vuelven a la reserva de sus dueños.',
      },
    ],
    scoring: [
      { what: 'Camino terminado (cerrado por ambos extremos)', points: '1 por loseta' },
      { what: 'Ciudad terminada (muralla cerrada)', points: '2 por loseta + 2 por escudo' },
      { what: 'Monasterio rodeado por las 8 losetas', points: '9' },
      { what: 'Final · camino sin terminar', points: '1 por loseta' },
      { what: 'Final · ciudad sin terminar', points: '1 por loseta + 1 por escudo' },
      { what: 'Final · monasterio sin rodear', points: '1 por su loseta + 1 por vecina' },
      { what: 'Final · campo (granjero)', points: '3 por ciudad terminada que toque' },
    ],
    endCondition:
      'La partida acaba cuando se coloca la última loseta. Entonces se puntúan todos los elementos sin terminar y los campos. Gana quien tenga más puntos.',
    reminders: [
      'No puedes poner un seguidor en un elemento ya ocupado, pero sí crear uno propio y unirlo después: si al unirse hay empate de seguidores, puntúan todos los empatados.',
      'Los granjeros no vuelven nunca a la reserva: se quedan en el campo hasta el final.',
      'Se puntúa en el mismo momento en que el elemento se completa, no al final.',
      'Si una loseta no encaja en ningún hueco del tablero, se descarta y robas otra.',
      'Un elemento incompleto puntúa mucho menos: cerrar ciudades grandes es lo que decide la partida.',
    ],
    officialLink: {
      label: 'Reglamento oficial (Hans im Glück)',
      url: 'https://www.hans-im-glueck.de/carcassonne',
    },
  },
}
