import type { GameDefinition } from '../types'

export const orleans: GameDefinition = {
  slug: 'orleans',
  name: 'Orléans',
  icon: '⚜️',
  tagline: 'Construcción de bolsa medieval: saca seguidores y ponlos a trabajar',
  theme: { primary: '#7a5a2f' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 90, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Suma desarrollo, mercancías, monedas, ciudadanos y rutas comerciales según la tabla final' },
    { key: 'development', label: 'Puntos de desarrollo', short: 'Desarrollo', icon: '📈', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: tu posición en la vía de desarrollo, que además multiplica en el recuento' },
    { key: 'goods', label: 'Valor de mercancías', short: 'Mercancías', icon: '📦', type: 'number', min: 0, hint: 'Informativo: suma del valor de tus losetas de mercancía (grano, queso, vino, lana, brocado)' },
    { key: 'citizens', label: 'Ciudadanos y rutas', short: 'Ciudadanos', icon: '🧑‍🤝‍🧑', type: 'number', min: 0, hint: 'Informativo: fichas de ciudadano conseguidas y estaciones comerciales en el mapa' },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '90–120 min',
    setup: [
      'Coloca el tablero principal, el mapa de rutas comerciales de Orléans y la vía de desarrollo.',
      'Cada jugador recibe su tablero de acciones, su bolsa con 4 seguidores iniciales (granjero, boyero, artesano y comerciante), sus discos y dinero inicial.',
      'Prepara la reserva de mercancías, las losetas de lugar/edificio, las fichas de ciudadano y la tabla de turnos con sus eventos.',
      'Reparte los marcadores en las vías de desarrollo y de dinero en su posición de inicio.',
    ],
    turn: [
      { name: '1. Evento', detail: 'Se revela y aplica la loseta de evento de la ronda (mercado, impuestos, plaga...).' },
      { name: '2. Sacar seguidores', detail: 'Cada jugador saca a ciegas de su bolsa tantos seguidores como indique la ronda y los reserva tras su pantalla.' },
      { name: '3. Planificar', detail: 'Coloca tus seguidores en las casillas de acción de tu tablero (universidad, aldea, monasterio, castillo, gremio, barco, carreta...).' },
      { name: '4. Ejecutar acciones', detail: 'En orden, activa las acciones cuyas casillas hayas completado: viajar por el mapa, coger mercancías, subir en las vías, reclutar nuevos seguidores o cumplir lugares.' },
    ],
    scoring: [
      { what: 'Vía de desarrollo', points: 'puntos por tu posición, y multiplica otras categorías' },
      { what: 'Mercancías conseguidas', points: 'el valor de cada loseta' },
      { what: 'Fichas de ciudadano', points: 'sus puntos y mayorías' },
      { what: 'Estaciones comerciales en el mapa', points: 'puntos por rutas cubiertas' },
      { what: 'Dinero sobrante', points: 'según la tabla de conversión final' },
    ],
    endCondition:
      'La partida dura 18 rondas (marcadas por la tabla de turnos). Al acabar la última, se suman todas las categorías aplicando el multiplicador de la vía de desarrollo; gana quien reúna más puntos de victoria.',
    reminders: [
      'Es construcción de bolsa: reclutar demasiados seguidores «diluye» la bolsa y hace más difícil sacar justo lo que necesitas.',
      'Subir en la vía de desarrollo no da acción inmediata, pero pesa mucho en el recuento final: no la descuides.',
      'Los seguidores puestos en ciertas casillas de «lugar» se retiran de la bolsa para siempre a cambio de bonos: úsalo para adelgazar la bolsa.',
      'El evento de la ronda condiciona la planificación: mira la tabla antes de decidir dónde colocas.',
      'Las plagas y los impuestos castigan tener demasiado dinero o seguidores: no acumules por acumular.',
    ],
    officialLink: {
      label: 'Web oficial (dlp games)',
      url: 'https://dlp-games.de/en/spiele/orleans/',
    },
  },
}
