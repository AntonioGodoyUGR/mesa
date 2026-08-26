import type { GameDefinition } from '../types'

export const underwaterCities: GameDefinition = {
  slug: 'underwater-cities',
  name: 'Underwater Cities',
  icon: '🌐',
  tagline: 'Coloca cartas y trabajadores para colonizar el fondo del océano',
  theme: { primary: '#1f6b7a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 80, max: 150 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'track', label: 'Marcador de PV al final', short: 'Track', icon: '📊', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'La posición del marcador de PV justo antes del recuento final (cartas y acciones ya cuentan aquí)' },
    { key: 'metropolis', label: 'Metrópolis (redes completas)', short: 'Metró.', icon: '🏙️', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'PV finales por cada red de cúpula+túnel+planta completada y convertida en metrópolis' },
    { key: 'resources', label: 'Recursos sobrantes', short: 'Recursos', icon: '🔋', type: 'number', points: 1, min: 0, hint: 'PV finales por acero, alga (biomasa) y crédito que te sobren, según la tabla de conversión' },
    { key: 'card_bonus', label: 'Bonos de cartas', short: 'Cartas', icon: '🃏', type: 'number', points: 1, min: 0, hint: 'PV finales impresos en tus cartas especiales de tipo puntuación al terminar la partida' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '80–150 min',
    setup: [
      'Cada jugador recibe su tablero personal con la red inicial de cúpulas, túneles y plantas de producción, más sus recursos de inicio.',
      'Montad el tablero central de acciones con sus columnas de cartas (una carta asociada a cada espacio de acción).',
      'Barajad los 3 mazos de cartas (época A, B y C) y colocad la fila de cartas disponibles junto a las acciones.',
      'Colocad los marcadores de PV en 0 y repartid las losetas de acción especial y los recursos iniciales.',
    ],
    turn: [
      { name: '1. Colocar trabajador con carta', detail: 'En tu turno colocas uno de tus 3 peones en un espacio de acción libre; si tu carta en mano coincide de color con ese espacio, ejecutas también el efecto de la carta.' },
      { name: '2. Ejecutar la acción', detail: 'Haces la acción del espacio: construir cúpulas, túneles o plantas en tu red, producir recursos, coger cartas o ganar PV.' },
      { name: '3. Construir tu red', detail: 'Vas conectando cúpulas mediante túneles y añadiendo plantas; una cúpula con túnel y planta conectados forma una metrópolis que puntúa fuerte.' },
      { name: '4. Fase de producción', detail: 'Al final de cada era se produce según tus plantas conectadas (biomasa, acero, crédito, PV) y se descartan cartas sobrantes; luego empieza la siguiente era.' },
    ],
    scoring: [
      { what: 'PV ganados por acciones y cartas durante la partida', points: 'se acumulan en la vía' },
      { what: 'Cada red completa convertida en metrópolis', points: 'PV finales según su tamaño y mejoras' },
      { what: 'Cartas de puntuación en tu poder', points: 'sus PV impresos' },
      { what: 'Recursos sobrantes (acero, biomasa, crédito)', points: 'PV según la tabla de conversión' },
    ],
    endCondition:
      'La partida dura 3 eras (10 rondas en total). Tras la última producción se hace el recuento final sumando metrópolis, cartas y recursos al marcador; gana quien tenga más PV.',
    reminders: [
      'La sinergia carta+espacio es el corazón del juego: jugar una acción con su carta del mismo color multiplica el efecto. Planifica la mano.',
      'Completar redes (cúpula + túnel + planta conectados) y ascenderlas a metrópolis es la mayor fuente de PV: prioriza conectar, no dispersar.',
      'Guarda biomasa para no morir de hambre en la producción: si no tienes alga suficiente, pierdes PV.',
      'Las cartas mejoran cúpulas, túneles y plantas: úsalas para potenciar la producción de tus redes ya montadas.',
      'El orden de colocación importa: los mejores espacios (con buena carta asociada) vuelan pronto cada ronda.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/247763/underwater-cities',
    },
  },
}
