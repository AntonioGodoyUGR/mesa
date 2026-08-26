import type { GameDefinition } from '../types'

export const terraMystica: GameDefinition = {
  slug: 'terra-mystica',
  name: 'Terra Mystica',
  icon: '🧝',
  tagline: 'Catorce pueblos fantásticos que transforman el terreno a su gusto',
  theme: { primary: '#5a7a3f' },
  minPlayers: 2,
  maxPlayers: 5,
  playTime: { min: 60, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'track', label: 'Marcador de PV al final', short: 'Track', icon: '📊', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'La posición del marcador de puntuación justo antes del recuento final (empieza en 20)' },
    { key: 'network', label: 'Área conectada mayor', short: 'Red', icon: '🗺️', type: 'number', points: 1, min: 0, showInSummary: true, hint: '18/12/6 puntos para 1.º/2.º/3.º en el grupo de edificios conectados más grande (repartido si empate)' },
    { key: 'cults', label: 'Órdenes de culto', short: 'Cultos', icon: '🔥', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'En cada una de las 4 vías de culto: 8/4/2 puntos para 1.º/2.º/3.º puesto' },
    { key: 'resources', label: 'Recursos sobrantes', short: 'Recursos', icon: '💰', type: 'number', points: 1, min: 0, hint: '1 punto por cada 3 monedas; trabajadores y sacerdotes se convierten antes a monedas' },
  ],

  rules: {
    players: '2–5 jugadores',
    duration: '60–150 min',
    setup: [
      'Cada jugador elige una de las 14 facciones, cada una con su terreno natal y habilidades, y coloca sus 2 viviendas iniciales en casillas de su color.',
      'Monta el tablero, las 4 vías de culto, el mercado de bonificaciones y el suministro de poder de cada facción en sus 3 cuencos.',
      'Reparte las losetas de puntuación de ronda (una por cada una de las 6 rondas) y las losetas de favor y de ciudad.',
      'Coloca los marcadores de PV en 20 y da a cada facción sus trabajadores, monedas y sacerdotes iniciales.',
    ],
    turn: [
      { name: '1. Fase de ingresos', detail: 'Cada jugador cobra los recursos (trabajadores, monedas, poder, sacerdotes) de sus edificios y losetas.' },
      { name: '2. Fase de acciones', detail: 'Por turnos, cada jugador hace una acción y pasa: transformar terreno y construir, mejorar edificios, avanzar en cultos, mandar sacerdotes, acciones de poder o de puente, hasta que todos pasan.' },
      { name: '3. Puntuación de ronda', detail: 'Se aplica la loseta de puntuación de la ronda (PV por la acción indicada) y las bonificaciones de culto correspondientes.' },
      { name: '4. Limpieza', detail: 'Se devuelven fichas de bonificación, se ajusta el poder y empieza la siguiente ronda; tras la 6.ª se hace el recuento final.' },
    ],
    scoring: [
      { what: 'Marcador de PV acumulado durante la partida', points: 'se anota tal cual' },
      { what: 'Grupo de edificios conectados más grande', points: '18 / 12 / 6 para 1.º / 2.º / 3.º' },
      { what: 'Cada vía de culto', points: '8 / 4 / 2 para 1.º / 2.º / 3.º puesto' },
      { what: 'Recursos sobrantes', points: '1 punto por cada 3 monedas equivalentes' },
    ],
    endCondition:
      'La partida dura 6 rondas fijas. Tras la última se hace el recuento final sumando el área conectada mayor, las 4 vías de culto y los recursos sobrantes al marcador acumulado. Gana quien tenga más puntos.',
    reminders: [
      'Transformar terreno y construir cuesta trabajadores y palas: elige facción según lo cerca que quede tu terreno natal del centro.',
      'Fundar ciudades (grupo conectado de 4+ estructuras con 7+ de potencia) da PV, poder y una loseta de ciudad: es el motor de la partida.',
      'El poder circula por 3 cuencos: gastarlo lo devuelve al primero, y quemar poder cuesta la mitad de fichas. Gestiónalo con cuidado.',
      'Aceptar poder cuando un rival construye al lado te cuesta 1 PV por ficha extra: no siempre compensa cogerlo.',
      'Las losetas de puntuación de ronda marcan qué conviene hacer cada ronda: planifica tus construcciones para pillar esos PV.',
    ],
    officialLink: {
      label: 'Web oficial (Feuerland Spiele)',
      url: 'https://feuerland-spiele.de/terra-mystica/',
    },
  },
}
