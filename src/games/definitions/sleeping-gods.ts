import type { GameDefinition } from '../types'

export const sleepingGods: GameDefinition = {
  slug: 'sleeping-gods',
  name: 'Sleeping Gods',
  icon: '⛵',
  tagline: 'Un barco perdido en un atlas ilustrado, capítulo a capítulo',
  theme: { primary: '#3a5a6a' },
  minPlayers: 1,
  maxPlayers: 4,
  playTime: { min: 60, max: 120 },
  difficulty: 'hard',
  scoreLabel: 'Resultado',
  scoreLabelShort: 'Resultado',
  totalMode: 'computed',
  winnerRule: 'highest',

  fields: [
    { key: 'ending', label: 'Final de campaña alcanzado', short: 'Final', icon: '🏆', type: 'toggle', points: 10, showInSummary: true, hint: 'Marca si la tripulación llegó a un final de la historia' },
    { key: 'totems', label: 'Tótems encontrados', short: 'Tótems', icon: '🗿', type: 'number', min: 0, points: 4, showInSummary: true, hint: 'Cartas de aventura marcadas con símbolo de tótem; su número decide el final' },
    { key: 'adventure_cards', label: 'Cartas de aventura conservadas', short: 'Aventura', icon: '📜', type: 'number', min: 0, points: 2 },
    { key: 'quests', label: 'Misiones completadas', short: 'Misiones', icon: '🧭', type: 'number', min: 0, points: 1 },
    { key: 'level_cards', label: 'Cartas de nivel', short: 'Nivel', icon: '📈', type: 'number', min: 0, points: 2 },
    { key: 'defeats', label: 'Derrotas sufridas', short: 'Derrotas', icon: '💀', type: 'number', min: 0, points: -10 },
  ],

  rules: {
    players: '1–4 jugadores',
    duration: '60–120 min por sesión',
    setup: [
      'Coloca el atlas sobre la mesa y sitúa el barco en la región de mar indicada por el capítulo o la partida de introducción.',
      'Un jugador coge el tablero de la capitana Sofi Odessa; el resto de tableros de tripulación se reparten entre los demás.',
      'Cada jugador recibe una carta de habilidad y una ficha de mando; se coloca la reserva de comida y monedas del barco.',
      'Prepara los mazos de habilidad, mercado y eventos (6 leves, 6 peligrosos, 6 mortales) junto al libro de aventuras abierto por su inicio.',
    ],
    turn: [
      { name: '1. Acción de barco', detail: 'Mueve la miniatura de acción a una sala del barco (puente, cocina, cubierta, camarotes o enfermería) y aplica su efecto: cartas de habilidad, fichas de mando o curación.' },
      { name: '2. Carta de evento', detail: 'Se roba y resuelve la carta superior del mazo de eventos, que puede suponer un reto, un encuentro o una consecuencia automática.' },
      { name: '3. Dos acciones', detail: 'El jugador activo realiza dos acciones entre: Viajar (reto de Destreza para mover el barco a una región adyacente), Explorar (visitar una localización, leer el libro de aventuras y resolver retos o combates), Mercado (comprar cartas con monedas) o Puerto (posada, astillero o sanador).' },
      { name: '4. Fin de turno', detail: 'La ficha de capitán pasa al jugador de la izquierda, que inicia el siguiente turno.' },
    ],
    scoring: [
      { what: 'Alcanzar un final de la historia', points: '10 PV' },
      { what: 'Cada tótem encontrado', points: '4 PV' },
      { what: 'Cada carta de aventura conservada', points: '2 PV' },
      { what: 'Cada misión completada', points: '1 PV' },
      { what: 'Cada carta de nivel obtenida', points: '2 PV' },
      { what: 'Cada derrota sufrida durante la campaña', points: '−10 PV' },
    ],
    endCondition:
      'La campaña se juega en sesiones abiertas: al terminar de jugar se anota el progreso en la hoja de bitácora para continuar más tarde en el mismo punto. La partida concluye al llegar a uno de los finales del libro de aventuras (según los tótems encontrados) o si la tripulación es derrotada (toda la tripulación a 0 de salud o el barco acumula 11 puntos de daño), lo que en modo normal permite recuperarse y seguir.',
    reminders: [
      'El combate es sin dados: cada ataque se resuelve robando una carta de destino y sumando la precisión del arma frente a la defensa del enemigo.',
      'Cada miembro de la tripulación acumula heridas y fatiga; con 2 fichas de fatiga no puede participar en retos (aunque sí en combate), y con la salud a 0 queda incapacitado hasta curarse.',
      'Los tótems son la clave del final de campaña: cuantos más se encuentren, a mejores finales se puede optar.',
      'Anota siempre el progreso en la hoja de bitácora al terminar la sesión: la campaña está pensada para jugarse en varias sentadas.',
    ],
    officialLink: {
      label: 'Ficha en BoardGameGeek',
      url: 'https://boardgamegeek.com/boardgame/255984/sleeping-gods',
    },
  },
}
