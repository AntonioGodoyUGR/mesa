import type { GameDefinition } from '../types'

export const aFeastForOdin: GameDefinition = {
  slug: 'a-feast-for-odin',
  name: 'A Feast for Odin',
  icon: '🛡️',
  tagline: 'Vikingos: rellenar el tablero sin dejar un hueco es media partida',
  theme: { primary: '#3f5b74' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos',
  scoreLabelShort: 'Pts',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'points_total', label: 'Puntos finales (total)', short: 'Puntos', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma positivos (tableros cubiertos, barcos, animales, plata, emigrados, tesoros) y resta 1 por cada casilla descubierta con penalización' },
    { key: 'boards_penalty', label: 'Casillas descubiertas (−1 c/u)', short: 'Huecos', icon: '⬜', type: 'number', min: 0, hint: 'Informativo: cada celda de penalización sin tapar en tus tableros resta 1 punto' },
    { key: 'emigration', label: 'Vikingos emigrados y exploración', short: 'Emigrar', icon: '⛵', type: 'number', min: 0, hint: 'Informativo: casillas de emigración e islas ocupadas' },
    { key: 'silver', label: 'Plata', short: 'Plata', icon: '🪙', type: 'number', min: 0, hint: 'Informativo: cada moneda de plata vale 1 punto' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–120 min (30 por jugador)',
    setup: [
      'Cada jugador recibe su tablero personal (con la zona de penalización a la izquierda), sus vikingos, su casa larga y sus tableros de barco.',
      'Monta el gran tablero de acciones central y ordena las cartas/losetas de mercancía, animales, barcos y ocupaciones.',
      'Reparte a cada jugador su mano de cartas de arma/ocupación inicial y algo de plata.',
      'Coloca la ficha del banquete y prepara la reserva de bienes, casas y fichas de exploración.',
    ],
    turn: [
      { name: '1. Colocar vikingos', detail: 'En tu turno pones un grupo de vikingos en una acción libre del tablero (cuanto mayor la acción, más vikingos exige) y la ejecutas.' },
      { name: '2. Producir y cazar', detail: 'Muchas acciones dan mercancías, animales, barcos o permiten cazar/pescar tirando dados, o comerciar en el mercado.' },
      { name: '3. Colocar mercancías en tableros', detail: 'Coloca tus mercancías (rectángulos) en tu tablero personal, en los barcos o en la casa, cubriendo casillas para evitar penalizaciones y desbloquear bonos.' },
      { name: '4. Banquete', detail: 'Al final de cada ronda debes alimentar a tus vikingos: coloca comida en la fila del banquete o sufre penalización de plata.' },
    ],
    scoring: [
      { what: 'Casillas cubiertas en tableros y barcos', points: 'los bonos impresos que quedan destapados al taparlas' },
      { what: 'Animales, casas, barcos y tesoros conservados', points: 'sus puntos indicados' },
      { what: 'Vikingos emigrados e islas exploradas', points: 'los puntos de cada destino' },
      { what: 'Plata acumulada', points: '1 punto por moneda' },
      { what: 'Casillas de penalización sin cubrir', points: '−1 punto cada una' },
    ],
    endCondition:
      'La partida dura 7 rondas (con 6 fases de banquete). Al terminar se hace el recuento de cada tablero, barcos, animales, emigración, plata y penalizaciones. Gana quien más puntos sume.',
    reminders: [
      'Las mercancías se colocan como en un puzle: solo puedes poner una nueva pieza adyacente a otra ya colocada del mismo tablero, sin solaparse.',
      'La columna de la izquierda de cada tablero penaliza si queda descubierta: taparla es prioritario aunque no dé bono directo.',
      'Las mercancías se mejoran girándolas en el mercado (verde → azul → naranja...): una mercancía de mayor valor cubre casillas más caras.',
      'No olvides el banquete al final de la ronda: quedarte sin comida cuesta plata y esa plata son puntos.',
      'Las cartas de ocupación tienen efectos permanentes: léelas al jugarlas porque muchas cambian el valor de tus acciones.',
    ],
    officialLink: {
      label: 'Web oficial (Feuerland / Z-Man Games)',
      url: 'https://www.feuerland-spiele.de/spiele/a-feast-for-odin.php',
    },
  },
}
