import type { GameDefinition } from '../types'

export const agricola: GameDefinition = {
  slug: 'agricola',
  name: 'Agricola',
  icon: '🚜',
  tagline: 'Una granja del siglo XVII y una familia a la que dar de comer',
  theme: { primary: '#7a6a3a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Puntos de victoria',
  scoreLabelShort: 'PV',
  totalMode: 'explicit',
  winnerRule: 'highest',

  fields: [
    { key: 'vp_total', label: 'Puntos de victoria (total)', short: 'PV', icon: '🏆', type: 'number', isTotal: true, showInSummary: true, hint: 'Suma campos, pastos, cereal, hortalizas, animales, estancias, familiares, cartas jugadas y bonos; resta espacios vacíos' },
    { key: 'family', label: 'Familiares y estancias', short: 'Familia', icon: '👪', type: 'number', min: 0, showInSummary: true, hint: 'Informativo: PV por cada familiar y por el tipo de estancia (madera, arcilla, piedra)' },
    { key: 'fields_pastures', label: 'Campos, pastos y cercas', short: 'Terreno', icon: '🌾', type: 'number', min: 0, hint: 'Informativo: PV según cantidad de campos labrados y pastos vallados' },
    { key: 'animals_crops', label: 'Animales, cereal y hortalizas', short: 'Cosecha', icon: '🐄', type: 'number', min: 0, hint: 'Informativo: PV por ovejas, jabalíes, vacas, cereal y hortalizas acumulados' },
    { key: 'cards_bonus', label: 'Cartas jugadas y espacios vacíos', short: 'Cartas', icon: '🃏', type: 'number', min: 0, hint: 'Informativo: PV de ocupaciones/mejoras jugadas menos penalización por campos o pastos sin usar' },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Cada jugador coge su tablero de granja de 3×5 con dos familiares y una choza de madera.',
      'Reparte 7 cartas de ocupación y 7 de mejora menor a cada uno (o juega en modo familiar sin cartas).',
      'Prepara los espacios de acción según el número de jugadores y coloca los recursos iniciales en la reserva.',
      'Baraja las cartas de las 14 rondas (con sus fases de cosecha) y colócalas en el orden correspondiente.',
    ],
    turn: [
      { name: '1. Añadir espacio de acción', detail: 'Al empezar ciertas rondas se revela un nuevo espacio de acción disponible para todos.' },
      { name: '2. Colocar familiares', detail: 'Por turnos, cada jugador coloca un familiar en un espacio de acción libre: labrar, sembrar, construir vallas o estancias, ampliar la familia, coger recursos o jugar cartas.' },
      { name: '3. Regresar familiares', detail: 'Cuando todos han colocado sus familiares, estos vuelven a la mesa lista para la siguiente ronda.' },
      { name: '4. Cosecha', detail: 'Tras ciertas rondas: se cosecha el cereal y las hortalizas sembradas, se alimenta a la familia (2 comida por familiar) y se reproducen los animales si hay pareja y espacio.' },
    ],
    scoring: [
      { what: 'Campos labrados y pastos vallados', points: 'Según tabla de cantidad' },
      { what: 'Cereal, hortalizas y cada tipo de animal', points: 'Según tabla de cantidad' },
      { what: 'Cada familiar', points: '3 PV' },
      { what: 'Tipo de estancia (madera / arcilla / piedra)', points: '1 / 2 / 3 PV por estancia' },
      { what: 'Cartas de ocupación y mejora jugadas', points: 'Según lo impreso en cada carta' },
      { what: 'Cada espacio de campo o pasto vacío', points: '−1 PV' },
    ],
    endCondition:
      'La partida dura 14 rondas repartidas en 6 etapas con cosecha al final de cada una. Tras la última cosecha se cuentan los puntos de todas las categorías; quien mendigó fichas de comida durante la partida resta 3 PV por cada una. Gana quien más puntos totales tenga.',
    reminders: [
      'Alimentar a la familia en cada cosecha es obligatorio: si no llegas, coges fichas de "mendigar" que restan 3 PV cada una al final.',
      'No dejes campos o pastos sin usar: cada casilla vacía de esos tipos resta 1 PV en el recuento final.',
      'Ampliar la familia (nacimiento) requiere una habitación libre y solo puede hacerse un número limitado de veces por ronda según jugadores.',
      'El modo "familiar" (sin cartas de ocupación/mejora) es la forma recomendada para aprender antes de jugar con cartas.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/31260/agricola',
    },
  },
}
