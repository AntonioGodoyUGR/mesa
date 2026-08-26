import type { GameDefinition } from '../types'

export const concordia: GameDefinition = {
  slug: 'concordia',
  name: 'Concordia',
  icon: '🏛️',
  tagline: 'Comercio romano sin azar: tus cartas son tus acciones',
  theme: { primary: '#8a2f2f' },
  minPlayers: 2,
  maxPlayers: 5,
  playTime: { min: 90, max: 100 },
  difficulty: 'medium',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'vesta', label: 'Vesta (dinero y mercancías)', short: 'Vesta', icon: '🔥', type: 'number', points: 1, min: 0, showInSummary: true, hint: '1 PV por cada 10 sestercios (vendiendo tus mercancías al valor de venta)' },
    { key: 'jupiter', label: 'Júpiter (casas)', short: 'Júpiter', icon: '⚡', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Por cada carta de Júpiter, 1 PV por cada casa tuya en ciudades que NO produzcan ladrillo' },
    { key: 'saturnus', label: 'Saturno (provincias)', short: 'Saturno', icon: '🪐', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Por cada carta de Saturno, 1 PV por cada provincia donde tengas al menos una casa' },
    { key: 'mercurius', label: 'Mercurio (tipos de mercancía)', short: 'Mercurio', icon: '☿️', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Por cada carta de Mercurio, 2 PV por cada tipo de mercancía que produzcas' },
    { key: 'mars', label: 'Marte (colonos)', short: 'Marte', icon: '⚔️', type: 'number', points: 1, min: 0, showInSummary: true, hint: 'Por cada carta de Marte, 2 PV por cada uno de tus colonos (barcos + soldados) en el mapa' },
    { key: 'minerva', label: 'Minerva (mercancía concreta)', short: 'Minerva', icon: '🦉', type: 'number', points: 1, min: 0, hint: 'Cada carta de Minerva puntúa una mercancía concreta según las casas en ciudades que la producen' },
    { key: 'concordia_card', label: 'Carta Concordia', short: 'Concordia', icon: '🕊️', type: 'number', points: 1, min: 0, hint: '7 PV para quien compró la carta Concordia y terminó la partida' },
  ],

  rules: {
    players: '2–5 jugadores',
    duration: '90–100 min',
    setup: [
      'Despliega el mapa (Imperia o Italia), con las ciudades y su mercancía, y coloca la reserva de mercancías junto a la tabla de precios.',
      'Cada jugador recibe su mazo inicial idéntico de cartas de personaje, sus casas, dos colonos (un barco y un soldado) en Roma y 5 sestercios.',
      'Coloca las cartas comprables en la fila del foro con sus precios y la carta Concordia al final.',
      'Da a cada jugador sus mercancías iniciales según las reglas del mapa.',
    ],
    turn: [
      { name: 'Jugar una carta', detail: 'Juega una carta de tu mano y ejecuta su acción: Arquitecto (mover colonos y construir casas), Prefecto (producir en una región y cobrar bonus), Mercader (comprar y vender mercancías), Diplomático (copiar la última carta de un rival), Colono, Tribuno o especialistas.' },
      { name: 'Comprar cartas nuevas', detail: 'Con el Senador o el Tribuno adquieres cartas del foro pagando sestercios y mercancías; cada carta nueva es acción futura y además puntúa por su dios al final.' },
      { name: 'Recuperar la mano', detail: 'El Tribuno recoge todas las cartas jugadas a tu mano (y da bonos según cuántas recojas), reiniciando tu ciclo de acciones.' },
    ],
    scoring: [
      { what: 'Vesta', points: '1 PV por cada 10 sestercios tras vender mercancías' },
      { what: 'Júpiter', points: '1 PV por casa en ciudad no-ladrillo, por carta de Júpiter' },
      { what: 'Saturno', points: '1 PV por provincia con casa, por carta de Saturno' },
      { what: 'Mercurio', points: '2 PV por tipo de mercancía producida, por carta de Mercurio' },
      { what: 'Marte', points: '2 PV por colono en el mapa, por carta de Marte' },
      { what: 'Minerva y Concordia', points: 'según la mercancía de cada Minerva; +7 la carta Concordia' },
    ],
    endCondition:
      'La partida termina cuando un jugador construye su última casa o cuando se compra la última carta del foro (la Concordia). Se completa la ronda y se puntúa por dioses; gana quien más PV sume.',
    reminders: [
      'No hay azar ni dados: todo se decide por qué cartas compras y cuándo recoges la mano con el Tribuno.',
      'Comprar una carta la mete en tu descarte, no en tu mano: no la usarás hasta el próximo Tribuno.',
      'Los dioses puntúan multiplicando: acumular muchas cartas de un dios sin la infraestructura que multiplican no da nada.',
      'Quedarte sin cartas en la mano te obliga a usar el Tribuno: planifica para no malgastar turnos recogiendo pronto.',
      'Comprar la carta Concordia acelera el final de la partida además de darte 7 PV: úsalo para cerrar cuando vas por delante.',
    ],
    officialLink: {
      label: 'Web oficial (PD-Verlag / Rio Grande)',
      url: 'https://www.pd-verlag.de/',
    },
  },
}
