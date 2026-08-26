import type { GameDefinition } from '../types'

export const seti: GameDefinition = {
  slug: 'seti',
  name: 'SETI: Search for Extraterrestrial Intelligence',
  icon: '🛰️',
  tagline: 'Explora el sistema solar, escucha señales y busca vida ahí fuera',
  theme: { primary: '#1a5fb4' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 40, max: 160 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'points', label: 'Puntos de victoria (marcador)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, min: 0, showInSummary: true, hint: 'Lee la posición final de tu marcador de PV, ya con los objetivos y la especie sumados' },
    { key: 'species', label: 'Progreso en la especie alienígena', short: 'Especie', icon: '👽', type: 'counter', min: 0, hint: 'Informativo: contribución a descifrar la especie revelada' },
    { key: 'missions', label: 'Objetivos / misiones cumplidos', short: 'Misiones', icon: '🎯', type: 'counter', min: 0, hint: 'Informativo: cartas de objetivo completadas' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '40–160 min',
    setup: [
      'Monta el tablero central con el sistema solar, los planetas y sus lunas, y el track de puntos de victoria alrededor.',
      'Cada jugador coge su tablero de agencia, sus probes/sondas, sus discos y sus recursos iniciales de energía y crédito.',
      'Prepara la fila de cartas de tecnología y los mazos de datos/señal según el número de jugadores.',
      'Deja apartados los tableros de las especies alienígenas: se revelan boca abajo y se destapan cuando la investigación colectiva avanza.',
      'Reparte a cada jugador su mano inicial de cartas y su carta de objetivo secreto.',
    ],
    turn: [
      { name: '1. Acción principal', detail: 'Elige una: mover/lanzar una sonda por el sistema solar gastando energía, orbitar o aterrizar en un planeta o luna, escanear un sector para captar señales, o jugar una carta de tu mano.' },
      { name: '2. Recoger datos', detail: 'Al escanear o aterrizar ganas fichas de datos/señal; al acumular datos del mismo tipo avanzas en la investigación de las especies y desbloqueas su tablero.' },
      { name: '3. Ingresos y cartas', detail: 'Gestiona tus recursos (energía, crédito), roba o compra nuevas cartas de tecnología y prepara tu motor para el turno siguiente.' },
    ],
    scoring: [
      { what: 'Explorar planetas y lunas (órbitas y aterrizajes)', points: 'PV según la localización' },
      { what: 'Descifrar señales y contribuir a una especie alienígena', points: 'PV y bonos de la especie' },
      { what: 'Cartas de objetivo y misiones cumplidas', points: 'los PV indicados' },
      { what: 'Tecnologías y logros de fin de partida', points: 'según su texto' },
    ],
    endCondition:
      'La partida termina cuando se agota el track de rondas o se alcanza el disparador de final indicado en la partida; se resuelve la puntuación final y gana quien más PV tenga.',
    reminders: [
      'Las sondas gastan energía al moverse: planifica la trayectoria antes de lanzarlas, porque quedarse sin energía a medio viaje desperdicia el turno.',
      'La investigación de las especies es colectiva: cualquiera puede empujarla, pero los bonos van a quien más contribuye.',
      'Escanear un sector solo capta las señales que casan con lo que hay allí; no todos los sectores dan lo mismo.',
      'No acapares datos sin descifrarlos: puntúan al convertirlos, no al guardarlos.',
    ],
    officialLink: {
      label: 'Web oficial (Czech Games Edition)',
      url: 'https://czechgames.com/games/seti/',
    },
  },
}
