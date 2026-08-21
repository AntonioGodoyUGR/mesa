import type { GameDefinition } from '../types'

export const brassBirmingham: GameDefinition = {
  slug: 'brass-birmingham',
  name: 'Brass: Birmingham',
  icon: '🏭',
  tagline: 'Revolución industrial: canales, ferrocarril y una cadena de suministro que encajar',
  theme: { primary: '#3d4f5c' },
  minPlayers: 2,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    {
      key: 'points',
      label: 'Puntos finales',
      icon: '🎯',
      type: 'number',
      isTotal: true,
      min: 0,
      max: 400,
      showInSummary: true,
      hint: 'Suma de lo puntuado al final de la Era del Canal más lo puntuado al final de la Era del Ferrocarril',
    },
    {
      key: 'canal_era_points',
      label: 'Puntos al final de la Era del Canal',
      icon: '🚤',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 200,
      hint: 'Enlaces + losetas de industria volteadas, contados solo en ese momento',
    },
    {
      key: 'rail_era_points',
      label: 'Puntos al final de la Era del Ferrocarril',
      icon: '🚂',
      type: 'number',
      group: 'Desglose (opcional)',
      min: 0,
      max: 200,
    },
    {
      key: 'income_level',
      label: 'Nivel de ingresos final (desempate)',
      icon: '💷',
      type: 'number',
      group: 'Desglose (opcional)',
      min: -10,
      max: 30,
      hint: 'En caso de empate a puntos gana quien tenga más ingresos, y si persiste, quien tenga más dinero',
    },
  ],

  rules: {
    players: '2–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Cada jugador recibe su tablero personal, 17 libras, un marcador de PV a 0 y un marcador de ingresos en el nivel 10.',
      'Se apilan las losetas de industria de cada jugador (nivel 1 arriba) según su tablero, y se reparten 8 cartas de mano más 1 de descarte inicial.',
      'Se preparan el mercado de carbón (1 cubo por casilla) y el de hierro, y se coloca 1 loseta de comerciante visible por hueco según el número de jugadores, con su barril de cerveza.',
      'Se baraja el resto de cartas y se colocan cartas comodín de localización e industria bocarriba aparte.',
      'La partida tiene dos eras seguidas: la Era del Canal y la Era del Ferrocarril, cada una con 8, 9 ó 10 rondas según sean 4, 3 ó 2 jugadores.',
    ],
    turn: [
      {
        name: 'Dos acciones por turno',
        detail: 'Descartando una carta por cada una (en el primer turno de la partida solo se hace una acción), cada jugador puede: Construir, Conectar red (canal o vía), Desarrollar, Vender, Pedir préstamo o Explorar (Scout).',
      },
      {
        name: 'Construir',
        detail: 'Con una carta de localización o de industria que encaje, coloca la loseta de industria de menor nivel disponible en tu tablero, paga su coste y consume el hierro/carbón necesario. Si tu mina de carbón conecta con un comerciante, o construyes una fábrica de hierro, se venden recursos automáticamente y puede voltearse la loseta.',
      },
      {
        name: 'Conectar red',
        detail: 'Era del Canal: 1 enlace de canal por acción, cuesta 3£. Era del Ferrocarril: 1 enlace de vía por 5£ (consumiendo 1 carbón), o 2 enlaces por 15£ consumiendo además 1 cerveza.',
      },
      {
        name: 'Desarrollar',
        detail: 'Retira 1 ó 2 losetas de industria de tu tablero (no del tablero de juego) consumiendo 1 hierro por loseta, para poder construir niveles más altos después.',
      },
      {
        name: 'Vender',
        detail: 'Voltea una loseta de algodón, manufactura o cerámica sin voltear que esté conectada a un comerciante que la acepte, consumiendo la cerveza que pida. Avanza tu marcador de ingresos según lo indicado en la loseta.',
      },
      {
        name: 'Préstamo y Explorar',
        detail: 'Préstamo: recibes 30£ pero bajas 3 niveles en la pista de ingresos (mínimo −10). Explorar: descartas 3 cartas y recibes una carta comodín de localización y otra de industria.',
      },
    ],
    scoring: [
      { what: 'Cada enlace (canal o vía) en el tablero', points: '1 PV por cada icono de localización que muestren las dos localizaciones que conecta' },
      { what: 'Cada loseta de industria volteada', points: 'los PV impresos en su esquina inferior izquierda (las losetas sin voltear no dan nada)' },
      { what: 'Se puntúa dos veces en la partida', points: 'una vez al terminar la Era del Canal (y se retiran enlaces y losetas de nivel 1) y otra vez al terminar la Era del Ferrocarril' },
    ],
    endCondition:
      'La partida acaba al terminar la Era del Ferrocarril. Gana quien más puntos de victoria tenga sumando las dos eras; en empate decide primero el nivel de ingresos más alto y, si sigue el empate, quien tenga más dinero.',
    reminders: [
      'Cada acción exige descartar una carta, incluso si decides pasar.',
      'Solo Construir necesita que la carta encaje con la localización o industria: el resto de acciones valen con cualquier carta de la mano.',
      'Si tu nivel de ingresos baja de 0, pagas esa cantidad al final de la ronda; si no puedes, retiras tus propias losetas de industria (nunca enlaces) y recibes la mitad de su coste, perdiendo 1 PV por cada libra que sigas debiendo.',
      'Las losetas de industria de nivel 1 se retiran del tablero al terminar la Era del Canal (menos las cerámicas, que pueden construirse también en la del Ferrocarril).',
      'La cerveza para vender puede salir de tu propia cervecería sin voltear (sin necesitar conexión) o de la de un rival, pero en ese caso sí hace falta estar conectado a ella.',
    ],
    officialLink: {
      label: 'Web oficial (Roxley Games)',
      url: 'https://roxley.com/products/brass-birmingham-deluxe-edition',
    },
  },
}
