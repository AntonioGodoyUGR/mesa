import type { GameDefinition } from '../types'

export const gaiaProject: GameDefinition = {
  slug: 'gaia-project',
  name: 'Gaia Project',
  icon: '🛰️',
  tagline: 'Terra Mystica en la galaxia: coloniza planetas y avanza en tecnología',
  theme: { primary: '#3f2f7a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    {
      key: 'track',
      label: 'Marcador de PV al final',
      short: 'Track',
      icon: '📊',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: 'La posición del marcador de puntuación justo antes del recuento final (empieza en 10)',
    },
    {
      key: 'final_tiles',
      label: 'Losetas de puntuación final',
      short: 'Finales',
      icon: '🏆',
      type: 'number',
      points: 1,
      min: 0,
      showInSummary: true,
      hint: '18/12/6 puntos para 1.º/2.º/3.º en cada una de las 2 losetas (repartido si hay empate)',
    },
    {
      key: 'research',
      label: 'Investigación avanzada',
      short: 'Investig.',
      icon: '🔬',
      type: 'counter',
      points: 4,
      min: 0,
      max: 3,
      showInSummary: true,
      hint: '4 puntos por cada nivel 3, 4 o 5 alcanzado en el tablero de investigación',
    },
    {
      key: 'resources',
      label: 'Recursos sobrantes',
      short: 'Recursos',
      icon: '💎',
      type: 'number',
      points: 1,
      min: 0,
      hint: '1 punto por cada 3 créditos, conocimiento u ore sobrantes (sumados)',
    },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–150 min',
    setup: [
      'Cada jugador elige (o reparte al azar) una de las 14 facciones, cada una con habilidad y planeta natal únicos, y coloca sus edificios iniciales.',
      'Se colocan al azar 6 losetas de Ronda (bonificaciones por ronda) y se eligen 2 losetas de Puntuación Final para toda la partida.',
      'Se prepara el tablero de Investigación, la pila de Losetas de Tecnología y el suministro de Poder/Qic de cada jugador.',
      'Se monta el mapa de sectores hexagonales según el número de jugadores.',
    ],
    turn: [
      {
        name: '1. Fase de Ingresos',
        detail: 'Cada jugador cobra los recursos (créditos, ore, conocimiento, poder) que dé su tablero de facción, loseta de ronda, tecnologías e investigación activas.',
      },
      {
        name: '2. Fase de Gaia',
        detail: 'Se resuelven los proyectos Gaia iniciados la ronda anterior: los planetas Gaia reservados pasan a estar colonizados.',
      },
      {
        name: '3. Fase de Acciones',
        detail: 'Por turnos, cada jugador hace una acción principal (minar, mejorar edificio, investigar, formar federación, Gaiaformar, acción de Poder/Qic) o pasa cogiendo una loseta de ronda nueva.',
      },
      {
        name: '4. Fase de Limpieza',
        detail: 'Se resetean las acciones de ronda disponibles y empieza la siguiente ronda; tras la ronda 6 se hace el recuento final.',
      },
    ],
    scoring: [
      { what: 'Marcador de PV acumulado durante la partida', points: 'directo, se anota tal cual' },
      { what: 'Loseta de Puntuación Final (por cada una)', points: '18 / 12 / 6 para 1.º / 2.º / 3.º puesto' },
      { what: 'Nivel de Investigación (3, 4 o 5)', points: '4 puntos por nivel alcanzado' },
      { what: 'Recursos sobrantes al final (créditos + conocimiento + ore)', points: '1 punto por cada 3' },
    ],
    endCondition:
      'La partida dura 6 rondas fijas; tras la Fase de Acciones de la sexta ronda se hace el recuento final sumando losetas de puntuación final, investigación y recursos sobrantes al marcador acumulado. Gana quien tenga más puntos.',
    reminders: [
      'Pasar pronto no es malo: elegís antes la loseta de ronda que queda y podéis anotaros de las primeras la Puntuación Final de esa ronda si aplica.',
      'Formar federaciones da puntos inmediatos y acceso a Poder/Qic: no dejéis pasar la oportunidad si tenéis edificios conectables.',
      'El nivel de Investigación no baja nunca: cada avance es una inversión permanente de cara al recuento final.',
      'Guardad algo de Poder y Qic para el final: convertirlos en acciones de última hora puede dar puntos que de otro modo se pierden.',
    ],
    officialLink: {
      label: 'Web oficial (Feuerland Spiele)',
      url: 'https://feuerland-spiele.de/gaia-project/',
    },
  },
}
