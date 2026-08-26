import type { GameDefinition } from '../types'

export const mageKnight: GameDefinition = {
  slug: 'mage-knight',
  name: 'Mage Knight',
  icon: '🌌',
  tagline: 'Aventura de mazo y exploración a la conquista de un imperio mágico',
  theme: { primary: '#3a2f6b' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 90, max: 240 },
  difficulty: 'hard',
  scoreLabel: 'Fama',
  scoreLabelShort: 'Fama',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'fame', label: 'Fama en la vía', short: 'Fama', icon: '⭐', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'La Fama acumulada en la vía durante la partida (marca también tu nivel)' },
    { key: 'knowledge', label: 'Mayor Conocimiento', short: 'Conoc.', icon: '📖', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Título por hechizos y acciones avanzadas aprendidos: el líder gana Fama, el último la pierde' },
    { key: 'loot', label: 'Mayor Botín', short: 'Botín', icon: '💎', type: 'number', points: 1, min: 0, hint: 'Título por artefactos y cristales conseguidos' },
    { key: 'leader', label: 'Mayor Liderazgo', short: 'Líder', icon: '🛡️', type: 'number', points: 1, min: 0, hint: 'Título por unidades reclutadas y activas al final' },
    { key: 'conqueror', label: 'Mayor Conquista', short: 'Conq.', icon: '🏰', type: 'number', points: 1, min: 0, hint: 'Título por fortalezas, ciudades y lugares conquistados' },
    { key: 'adventurer', label: 'Mayor Aventurero', short: 'Avent.', icon: '🗺️', type: 'number', points: 1, min: 0, hint: 'Título por mazmorras, tumbas y aventuras completadas' },
  ],

  rules: {
    players: '1–4 jugadores (también en solitario)',
    duration: '90–240 min',
    setup: [
      'Elegid un escenario: define el objetivo, el número de rondas Día/Noche y qué losetas de mapa usar.',
      'Cada jugador coge un Mage Knight con su mazo de acción inicial (16 cartas), sus 3 gemas de maná de reserva y su figura.',
      'Montad la loseta de inicio, el mazo de losetas de campo y de núcleo, y las ofertas comunes: hechizos, acciones avanzadas, unidades y artefactos.',
      'Colocad la Fuente de maná (dados) y los marcadores de Fama y Reputación de cada jugador en su casilla inicial.',
    ],
    turn: [
      { name: '1. Nueva mano', detail: 'Empiezas el turno con tu mano de cartas; el orden de turno lo marca la carta de Táctica elegida al inicio de la ronda.' },
      { name: '2. Mover y explorar', detail: 'Juegas cartas por su valor de movimiento para recorrer el mapa, revelando losetas nuevas y gastando maná para potenciar cartas.' },
      { name: '3. Acción o combate', detail: 'Interactúas con un lugar: recluta unidades, saquea, o lanza un combate resolviendo fases de ataque a distancia, bloqueo y ataque; derrotar enemigos da Fama.' },
      { name: '4. Fin de turno', detail: 'Aprendes cartas nuevas al subir de nivel, descartas o recuperas, y pasas el turno; la ronda avanza hasta que alguien vacía su mazo o se agota el Día/Noche.' },
    ],
    scoring: [
      { what: 'Fama acumulada en la vía', points: 'se anota tal cual' },
      { what: 'Título de Mayor Conocimiento / Botín / Liderazgo / Conquista / Aventurero', points: 'el líder de cada categoría gana Fama; el último la pierde' },
      { what: 'Objetivo del escenario (p. ej. conquistar ciudades)', points: 'Fama extra según el escenario' },
      { what: 'Cartas de herida en mano y mazo al final', points: 'restan puntos' },
    ],
    endCondition:
      'La partida acaba cuando se cumple la condición del escenario (a menudo tras un número de rondas Día/Noche o al conquistar las ciudades objetivo). Se suman los títulos y bonos a la Fama; gana quien tenga más Fama total.',
    reminders: [
      'La curva de aprendizaje es alta: la primera partida hazla con el escenario introductorio y en solitario o a dos.',
      'El maná (gemas y dados de la Fuente) potencia tus cartas jugándolas «de lado» para su efecto fuerte: gestiónalo cada turno.',
      'Las heridas llenan tu mano y tu mazo: no fuerces combates que no puedes bloquear o acabarás ahogado en heridas.',
      'Subir de nivel te da nuevas acciones avanzadas y aumenta tu límite de mano y de unidades: planifica cuándo ganar Fama.',
      'La Reputación afecta al reclutamiento y al precio; saquear pueblos la baja, ayudar la sube.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/96848/mage-knight-board-game',
    },
  },
}
