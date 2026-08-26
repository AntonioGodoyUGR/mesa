import type { GameDefinition } from '../types'

export const ageOfInnovation: GameDefinition = {
  slug: 'age-of-innovation',
  name: 'Age of Innovation',
  icon: '⚗️',
  tagline: 'Facciones que transforman el terreno y compiten por avances tecnológicos',
  theme: { primary: '#5a4a8a' },
  minPlayers: 1,
  maxPlayers: 5,
  playTime: { min: 60, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'track', label: 'Marcador de PV al final', short: 'Track', icon: '📊', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'La posición del marcador de PV justo antes del recuento final (acciones y losetas de ronda ya cuentan aquí)' },
    { key: 'network', label: 'Área conectada mayor', short: 'Red', icon: '🗺️', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV para 1.º/2.º/3.º en el grupo de edificios conectados más grande (se reparte si hay empate)' },
    { key: 'innovations', label: 'Avances e innovaciones', short: 'Avances', icon: '💡', type: 'number', points: 1, min: 0, hint: 'PV finales por tus losetas de innovación/avance tecnológico y posiciones en sus vías' },
    { key: 'resources', label: 'Recursos sobrantes', short: 'Recursos', icon: '💰', type: 'number', points: 1, min: 0, hint: 'PV por recursos que te sobren al final, según la tabla de conversión' },
  ],

  rules: {
    players: '1–5 jugadores',
    duration: '60–150 min',
    setup: [
      'Cada jugador construye su facción combinando losetas de habilidad (no son fijas: cada partida las facciones son distintas) y coloca sus estructuras iniciales.',
      'Montad el tablero modular, las vías de innovación, el mercado de losetas y el suministro de recursos de cada facción.',
      'Repartid las 6 losetas de puntuación de ronda, las losetas de favor/innovación y las de bonificación.',
      'Colocad los marcadores de PV en su casilla inicial y dad a cada facción sus trabajadores, monedas y recursos de arranque.',
    ],
    turn: [
      { name: '1. Fase de ingresos', detail: 'Cada jugador cobra los recursos que producen sus edificios y losetas.' },
      { name: '2. Fase de acciones', detail: 'Por turnos, cada jugador hace una acción y pasa: transformar terreno y construir, mejorar edificios, invertir en innovaciones, avanzar en vías o usar acciones de poder, hasta que todos pasan.' },
      { name: '3. Puntuación de ronda', detail: 'Se aplica la loseta de puntuación de la ronda (PV por la acción indicada) y los bonos correspondientes.' },
      { name: '4. Limpieza', detail: 'Se reponen fichas de bonificación y empieza la siguiente ronda; tras la 6.ª se hace el recuento final.' },
    ],
    scoring: [
      { what: 'Marcador de PV acumulado durante la partida', points: 'se anota tal cual' },
      { what: 'Grupo de edificios conectados más grande', points: 'PV para 1.º / 2.º / 3.º' },
      { what: 'Vías de innovación y avances', points: 'PV por posición y losetas' },
      { what: 'Recursos sobrantes', points: 'PV según la tabla de conversión' },
    ],
    endCondition:
      'La partida dura 6 rondas. Tras la última se hace el recuento final sumando el área conectada mayor, las innovaciones y los recursos sobrantes al marcador acumulado. Gana quien tenga más PV.',
    reminders: [
      'Es el sucesor de Terra Mystica: transformar terreno y construir cuesta recursos; elige bien dónde expandirte.',
      'Cada partida las facciones se montan con losetas variables, así que no hay una estrategia «de facción» fija: adáptate a lo que te toque.',
      'Fundar zonas conectadas grandes y ciudades es un motor clave de PV: prioriza conectar tus estructuras.',
      'Las losetas de puntuación de ronda marcan qué conviene hacer cada ronda: planifica tus construcciones para pillar esos PV.',
      'Las vías de innovación premian invertir pronto: entrar tarde deja poco margen para subir.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/383179/age-of-innovation',
    },
  },
}
