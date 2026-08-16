/**
 * Chuletas de reglas para los juegos del catálogo amplio.
 *
 * Los juegos de `catalog.data.ts` se declaran en una línea y no traen hoja de reglas:
 * hasta ahora la pantalla enseñaba «Sin chuleta de reglas» para todos. Pero los más
 * jugados sí merecen su resumen, y no compensa promocionarlos a `definitions/` solo por
 * eso —seguirían siendo juegos de una hoja genérica—. Así que las reglas viven aquí,
 * separadas de la fila del catálogo: un mapa `slug` → `RuleSheet` que `catalog.ts`
 * engancha al expandir. Si un slug no está en el mapa, el juego se queda sin chuleta y
 * se comporta como antes.
 *
 * Se rellena por oleadas, empezando por los títulos más jugados. Precisión ante todo:
 * son las reglas de la caja base (sin expansiones), y donde no hay certeza se deja el
 * apartado fuera antes que inventarlo. El PDF oficial no se empaqueta —es material con
 * copyright—: por eso cada juego enlaza a la web del editor en `officialLink`.
 */
import type { RuleSheet } from './types'

export const CATALOG_RULES: Record<string, RuleSheet> = {
  // ---------------------------------------------------------------------------
  // Cooperativos
  // ---------------------------------------------------------------------------
  pandemic: {
    players: '2–4 jugadores',
    duration: '45 min',
    setup: [
      'Poned el peón de investigación y una estación en Atlanta; todos empezáis ahí.',
      'Infectad: sacad 9 cartas de infección y poned 3 cubos a las tres primeras ciudades, 2 a las tres siguientes y 1 a las tres últimas.',
      'Repartid un rol al azar a cada jugador y su mano de cartas de ciudad.',
      'Marcad el ritmo de infección en 2 y preparad los 4 marcadores de cura sin descubrir.',
      'Barajad las cartas de epidemia en el mazo de jugador según la dificultad (4, 5 o 6).',
    ],
    turn: [
      { name: '1. Cuatro acciones', detail: 'Mover, tratar (quitar un cubo), construir estación, compartir carta o descubrir una cura, en cualquier combinación.' },
      { name: '2. Robar dos cartas', detail: 'Del mazo de jugador. Si sale una epidemia, sube el ritmo, infecta la ciudad del fondo con 3 cubos y rebaraja los descartes encima.' },
      { name: '3. Infectar', detail: 'Voltea tantas cartas de infección como marque el ritmo y pon un cubo en cada ciudad.' },
    ],
    endCondition:
      'Ganáis todos juntos si descubrís las cuatro curas. Perdéis si se producen 8 brotes, si se agota el mazo de jugador o si os quedáis sin cubos de un color al tener que ponerlos.',
    reminders: [
      'Para curar hace falta entregar 5 cartas del mismo color en una estación (al científico le bastan 4).',
      'Si una ciudad con 3 cubos recibe otro de su color, hay brote: se propaga a las vecinas, y los brotes encadenados cuentan por separado.',
      'Compartir una carta solo se hace en la ciudad que nombra la carta, y ambos jugadores deben estar allí.',
      'El médico quita todos los cubos de un color de golpe; muchos roles rompen una regla concreta: leedlos antes de empezar.',
    ],
    officialLink: { label: 'Web oficial (Z-Man Games)', url: 'https://www.zmangames.com/' },
  },

  'forbidden-island': {
    players: '2–4 jugadores',
    duration: '30 min',
    setup: [
      'Montad la isla con las 24 losetas en forma de rombo, todas por el lado seco.',
      'Repartid roles y dos cartas de tesoro a cada uno; si sale «Sube las aguas», descártala y roba otra.',
      'Colocad cada peón en la loseta de su color y los cuatro tesoros junto al tablero.',
      'Ajustad el marcador de agua a la dificultad elegida (novato a leyenda).',
      'Inundad seis losetas: voltéalas al lado azul.',
    ],
    turn: [
      { name: '1. Hasta tres acciones', detail: 'Mover, drenar una loseta inundada adyacente, dar una carta de tesoro o reclamar un tesoro entregando 4 cartas iguales en su isla.' },
      { name: '2. Robar dos cartas de tesoro', detail: 'Si sale «Sube las aguas», el marcador de agua sube y las inundaciones descartadas vuelven encima del mazo.' },
      { name: '3. Inundar', detail: 'Voltea tantas cartas de inundación como marque el nivel del agua; una loseta ya inundada que vuelve a salir se hunde para siempre.' },
    ],
    endCondition:
      'Ganáis si recogéis los cuatro tesoros, llegáis todos al Helipuerto de los Locos y jugáis «Despega». Perdéis si se hunde una isla de tesoro sin haberlo recogido, si se hunde el helipuerto, si alguien se ahoga o si el agua llega a la calavera.',
    reminders: [
      'Reclamar un tesoro cuesta 4 cartas de ese tesoro y estar en una de sus dos islas.',
      'Se puede drenar cualquier loseta inundada adyacente (u ocupada), no solo la propia.',
      'Las cartas de helicóptero y saco de arena se juegan en cualquier momento, incluso en el turno de otro.',
      'Si tu peón está en una loseta que se hunde, debes nadar a una adyacente en el acto o pierdes.',
    ],
    officialLink: { label: 'Web oficial (Gamewright)', url: 'https://gamewright.com/' },
  },

  'forbidden-desert': {
    players: '2–5 jugadores',
    duration: '45 min',
    setup: [
      'Formad la cuadrícula de 5×5 con las losetas boca abajo y un hueco central para la tormenta.',
      'Repartid roles; cada peón empieza en el hueco de la tormenta.',
      'Poned dos fichas de arena sobre las losetas que marca el reglamento.',
      'Dad a cada jugador su reserva de agua y ajustad el medidor de tormenta a la dificultad.',
    ],
    turn: [
      { name: '1. Hasta cuatro acciones', detail: 'Mover, quitar arena de una loseta adyacente, excavar (voltear la loseta donde estás si no tiene arena) o dar agua.' },
      { name: '2. Robar cartas de tormenta', detail: 'Tantas como marque el medidor: mueven la tormenta y apilan arena; «El sol pega fuerte» hace que todos beban salvo bajo túnel.' },
    ],
    endCondition:
      'Ganáis si montáis las cuatro partes de la nave y despegáis todos desde el pozo de aterrizaje. Perdéis si alguien se queda sin agua, si la arena se acaba (sepultura) o si la tormenta llega al final del medidor.',
    reminders: [
      'Cada parte de la nave se localiza cruzando las pistas de dos losetas de pozo (fila y columna).',
      'No puedes cruzar ni excavar una loseta con arena encima: primero hay que despejarla.',
      'Los túneles protegen del sol y conectan entre sí; el oasis rellena agua y el espejismo, nada.',
      'La arena se apila: una loseta puede acumular varias fichas y cuesta una acción por ficha quitarla.',
    ],
    officialLink: { label: 'Web oficial (Gamewright)', url: 'https://gamewright.com/' },
  },

  'spirit-island': {
    players: '1–4 jugadores',
    duration: '90–120 min',
    setup: [
      'Cada jugador elige un espíritu y coge su tablero, sus cartas de poder únicas y sus fichas de presencia.',
      'Montad el tablero por número de jugadores y colocad la presencia inicial de cada espíritu.',
      'Repartid las cartas de invasor por fases (Explorar, Construir, Asolar) y elegid un adversario o miedo si queréis dificultad.',
      'Poblad las tierras con los dahan y el terreno según indica cada espíritu.',
    ],
    turn: [
      { name: '1. Fase de espíritus', detail: 'Ganáis energía, jugáis cartas de poder pagándolas y crecéis (reclamando cartas, presencia o energía).' },
      { name: '2. Poderes rápidos', detail: 'Se resuelven los poderes marcados como rápidos, antes de que actúen los invasores.' },
      { name: '3. Fase de invasores', detail: 'Se Asuela, se Construye y se Explora según las cartas reveladas; luego los poderes lentos.' },
    ],
    endCondition:
      'Ganáis cuando la isla acumula suficiente miedo (victoria por terror) o cuando no queda ningún invasor en el tablero. Perdéis si se agota el mazo de invasores, si muere un espíritu (sin presencia) o si el blight se acaba.',
    reminders: [
      'Explorar → Construir → Asolar: los invasores siempre avanzan en ese ciclo, tierra por tierra.',
      'El miedo generado se convierte en cartas de terror que cambian las condiciones de victoria a mejor.',
      'El blight se propaga: si una tierra recibe blight teniéndolo ya, salpica a las vecinas.',
      'Los dahan son los nativos: pueden defenderse y contraatacar, no son tuyos pero pelean contigo.',
    ],
    officialLink: { label: 'Web oficial (Greater Than Games)', url: 'https://greaterthangames.com/' },
  },

  'the-crew-planet-nine': {
    players: '2–5 jugadores',
    duration: '20 min',
    setup: [
      'Barajad las 40 cartas: cuatro colores del 1 al 9 más los cuatro cohetes (triunfos).',
      'Repartidlas todas; quien tenga el cohete 4 es el comandante y empieza.',
      'Sacad tantas cartas de tarea como diga la misión y repartidlas entre los jugadores.',
      'Cada jugador tiene una ficha de comunicación para toda la misión.',
    ],
    turn: [
      { name: '1. Salida', detail: 'El jugador de mano juega una carta; los demás deben servir del mismo color si pueden.' },
      { name: '2. Baza', detail: 'Gana la carta más alta del color de salida, o el cohete más alto si alguien no pudo servir.' },
      { name: '3. Reparto', detail: 'Quien gana la baza recoge las cartas y sale en la siguiente.' },
    ],
    endCondition:
      'Ganáis la misión si cada tarea la gana en una baza el jugador que la tenía asignada, respetando su orden. Perdéis en el acto si alguien gana una carta de tarea que no le corresponde o incumple el orden exigido.',
    reminders: [
      'Es obligatorio servir al color de salida: solo si no tienes puedes tirar cohete u otro color.',
      'La comunicación es una sola vez por jugador y misión: pones una carta de un color (nunca cohete) con la ficha arriba, en medio o abajo según sea tu única, la más alta o la más baja de ese color.',
      'Prohibido hablar de las cartas o hacer señas fuera de esa ficha.',
      'Las misiones se juegan en orden y suben de dificultad: se guarda el progreso entre partidas.',
    ],
    officialLink: { label: 'Web oficial (KOSMOS)', url: 'https://www.kosmos.de/' },
  },

  'the-mind': {
    players: '2–4 jugadores',
    duration: '15 min',
    setup: [
      'Barajad las 100 cartas numeradas y dejad un montón central boca arriba.',
      'Coged vidas iguales al número de jugadores y una estrella ninja.',
      'En cada nivel, repartid a cada jugador tantas cartas como el número del nivel (nivel 1 = una carta cada uno).',
    ],
    turn: [
      { name: 'Bajar en orden', detail: 'Sin hablar ni gesticular, id jugando las cartas de todas las manos en orden ascendente al montón central.' },
      { name: 'Ritmo compartido', detail: 'Cada uno decide cuándo baja su carta más baja; el desafío es leer los silencios.' },
    ],
    endCondition:
      'Ganáis si superáis todos los niveles (12 con 2 jugadores, 10 con 3, 8 con 4). Cada vez que alguien baja una carta habiendo otra menor sin jugar, perdéis una vida.',
    reminders: [
      'Prohibido hablar, contar, tocar la mesa o hacer cualquier señal sobre las cartas.',
      'Al perder una vida, descartad boca arriba todas las cartas menores que la jugada y seguid.',
      'La estrella ninja se lanza por acuerdo de todos: cada jugador descarta su carta más baja.',
      'En ciertos niveles ganáis una vida o una estrella extra: consultad la escala impresa.',
    ],
    officialLink: { label: 'Web oficial (Pandasaurus Games)', url: 'https://pandasaurusgames.com/' },
  },

  hanabi: {
    players: '2–5 jugadores',
    duration: '25 min',
    setup: [
      'Mazo de 50 cartas: cinco colores con valores 1-1-1-2-2-3-3-4-4-5.',
      'Repartid 5 cartas a cada jugador (4 si sois cuatro o cinco), sujetas mirando hacia fuera: cada uno ve las de los demás menos las suyas.',
      'Poned las 8 fichas de pista disponibles y las 3 fichas de tormenta (rayos).',
    ],
    turn: [
      { name: 'Una sola acción', detail: 'Dar una pista (gasta ficha), descartar una carta (recupera ficha) o jugar una carta a los fuegos.' },
      { name: 'Fuegos artificiales', detail: 'Cada color se construye del 1 al 5 en orden; una carta que no continúa se descarta y quema un rayo.' },
    ],
    endCondition:
      'Con 3 rayos quemados, se acaba de golpe. Si no, la partida termina al agotarse el mazo (una última ronda) o al completar los cinco 5. La puntuación es la suma de la carta más alta de cada color.',
    reminders: [
      'No puedes mirar tus cartas ni pedir información sobre ellas.',
      'Al dar una pista señalas TODAS las cartas de un color o de un valor en la mano de un compañero, y debe ser cierta y completa.',
      'Solo puedes dar pista si queda alguna ficha; descartar o jugar un 5 la recupera.',
      'Jugar una carta equivocada la descarta y gasta un rayo: la información vale más que las prisas.',
    ],
    officialLink: { label: 'Web oficial (R&R Games)', url: 'https://www.rnrgames.com/' },
  },

  'just-one': {
    players: '3–7 jugadores',
    duration: '20 min',
    setup: [
      'Cada jugador coge una pizarra y un rotulador.',
      'Formad un mazo de 13 cartas para la partida y dejadlo en un atril.',
      'Por turnos, uno será el adivinador y el resto, pistadores.',
    ],
    turn: [
      { name: '1. La palabra', detail: 'El adivinador elige un número; se saca la carta y todos menos él ven la palabra correspondiente.' },
      { name: '2. Pistas', detail: 'Cada pistador escribe en secreto UNA sola palabra que ayude a adivinarla.' },
      { name: '3. Tachar repetidas', detail: 'Antes de enseñarlas, comparan pistas: las idénticas (o inválidas) se anulan y no se muestran.' },
      { name: '4. Adivinar', detail: 'El adivinador ve las pistas válidas e intenta acertar con un único intento.' },
    ],
    scoring: [
      { what: 'Acierto', points: '+1 carta ganada' },
      { what: 'Fallo', points: 'se descartan 2 cartas del mazo' },
      { what: 'Pasar', points: 'se descarta 1 carta' },
    ],
    endCondition:
      'Cooperativo: jugáis las 13 cartas y sumáis las acertadas. 13 es la puntuación perfecta; por debajo, a mejorarlo la próxima.',
    reminders: [
      'La gracia está en tachar: dos pistas iguales se anulan, así que conviene arriesgar con algo original.',
      'No valen inventadas, ni la propia palabra secreta, ni traducciones o derivadas evidentes.',
      'Una sola palabra por pista; los signos y números también cuentan como pista.',
      'El adivinador tiene un único intento: si duda, mejor pasar que fallar (fallar cuesta dos cartas).',
    ],
    officialLink: { label: 'Web oficial (Repos Production)', url: 'https://www.rprod.com/' },
  },

  cartographers: {
    players: '1–100 jugadores',
    duration: '30–45 min',
    setup: [
      'Cada jugador coge una hoja de mapa y un lápiz.',
      'Barajad las cartas de exploración y las cuatro cartas de puntuación (una por tipo: A, B, C, D).',
      'Repartid una carta de puntuación a cada borde de la estación del año.',
      'Barajad las cartas de emboscada dentro del mazo de exploración.',
    ],
    turn: [
      { name: '1. Revelar exploración', detail: 'Se voltea una carta que muestra un terreno y una o varias formas.' },
      { name: '2. Dibujar', detail: 'Todos a la vez trazan esa forma con ese terreno en una zona vacía de su mapa.' },
      { name: '3. Fin de estación', detail: 'Cuando el tiempo acumulado supera el límite de la estación, se puntúan las dos cartas de objetivo que tocan.' },
    ],
    endCondition:
      'Se juegan las cuatro estaciones (primavera a invierno). Gana quien más reputación sume: objetivos, monedas y −1 por cada casilla vacía junto a una montaña.',
    reminders: [
      'Cada estación puntúa DOS de los cuatro objetivos; consulta el diagrama para saber cuáles.',
      'Rodear una montaña por completo da una moneda; las formas con moneda también la dan.',
      'Si una forma no cabe, dibuja solo una casilla del terreno donde puedas.',
      'Las emboscadas las dibuja el rival de tu izquierda (o según el modo en solitario): ocupan casillas y estorban.',
    ],
    officialLink: { label: 'Web oficial (Thunderworks Games)', url: 'https://www.thunderworksgames.com/' },
  },

  // ---------------------------------------------------------------------------
  // Eurogames medios y familiares
  // ---------------------------------------------------------------------------
  'dune-imperium': {
    players: '1–4 jugadores',
    duration: '60–120 min',
    setup: [
      'Cada jugador elige un líder y coge su mazo inicial de 10 cartas, sus agentes y su ficha de control.',
      'Montad el tablero de Arrakis con sus espacios de acción y las cuatro facciones a favor 0.',
      'Preparad los mercados: reserva imperial, Arrakis y las cartas de intriga y conflicto.',
      'Revelad el primer conflicto de la ronda.',
    ],
    turn: [
      { name: '1. Turnos de agente', detail: 'Por orden, cada jugador coloca un agente en un espacio jugando una carta que dé acceso a él, y resuelve su efecto.' },
      { name: '2. Revelar', detail: 'Cuando te quedas sin agentes, revelas el resto de tu mano: sumas su Persuasión (para comprar) y su Espada (para el conflicto).' },
      { name: '3. Conflicto', detail: 'Quien más fuerza militar tenga en el planeta gana la recompensa de la carta de conflicto de la ronda.' },
    ],
    scoring: [
      { what: 'Ganar conflictos, alianzas y objetivos', points: 'Puntos de victoria' },
      { what: 'Meta', points: '10 puntos de victoria' },
    ],
    endCondition:
      'Gana quien llegue a 10 puntos de victoria (se comprueba al final de la ronda). Si nadie llega tras agotarse el mazo de conflictos, gana quien más puntos tenga, con el desempate por especia y solari.',
    reminders: [
      'Necesitas la influencia con una facción para acceder a algunos espacios; llegar a 2 con una facción da su alianza y un punto.',
      'La Persuasión no se acumula entre rondas: se gasta o se pierde al reciclar el mazo.',
      'Las cartas de intriga se juegan en momentos concretos; guárdalas para el conflicto.',
      'Mandar tropas al conflicto es un compromiso: las que dejas en la guarnición no puntúan esta ronda.',
    ],
    officialLink: { label: 'Web oficial (Dire Wolf)', url: 'https://www.direwolfdigital.com/dune-imperium/' },
  },

  'lost-ruins-arnak': {
    players: '1–4 jugadores',
    duration: '30–120 min',
    setup: [
      'Montad el tablero de la isla, la pista de investigación y los mercados de cartas.',
      'Cada jugador coge su mazo inicial de 5 cartas de objeto y 5 de miedo, sus dos arqueólogos y sus marcadores.',
      'Colocad los guardianes, las losetas de yacimiento y los cofres iniciales.',
      'Poned los dos peones de investigación (lupa y cuaderno) al principio de la pista.',
    ],
    turn: [
      { name: 'Una acción principal', detail: 'Explorar un yacimiento con un arqueólogo, comprar una carta o loseta, avanzar en la investigación o jugar el efecto de una carta.' },
      { name: 'Acciones libres', detail: 'Jugar cartas de mano por sus recursos e iconos siempre que puedas, entre acciones.' },
    ],
    scoring: [
      { what: 'Ídolos, cartas de objeto, losetas y templo', points: 'Puntos de victoria' },
      { what: 'Posición en la pista de investigación', points: 'Puntos según el nivel alcanzado' },
    ],
    endCondition:
      'La partida dura cinco rondas. Gana quien más puntos sume entre cartas, ídolos, guardianes derrotados y avance en la investigación.',
    reminders: [
      'Enviar un arqueólogo a un yacimiento nuevo cuesta brújulas; a uno ya descubierto, solo llegar.',
      'Descubrir una loseta despierta a un guardián: hay que pacificarlo o pagará penalización al final.',
      'La pista de investigación tiene dos peones; el rezagado gana un beneficio al adelantarse.',
      'Las cartas de miedo estorban en la mano: descártalas en la investigación para no reciclarlas.',
    ],
    officialLink: { label: 'Web oficial (Czech Games Edition)', url: 'https://czechgames.com/' },
  },

  clank: {
    players: '2–4 jugadores',
    duration: '30–60 min',
    setup: [
      'Montad el tablero de la mazmorra y coloca el dragón en su marca de furia inicial.',
      'Cada jugador coge su mazo inicial de 10 cartas y sus 30 cubos de ruido (clank) del color propio.',
      'Formad la reserva del Dungeon Row con seis cartas del mazo de mazmorra.',
      'Poned los artefactos, monstruos y mercado en sus sitios.',
    ],
    turn: [
      { name: '1. Jugar la mano', detail: 'Juegas tus cinco cartas y sumas sus habilidades, espadas y botas.' },
      { name: '2. Comprar y moverte', detail: 'Adquieres cartas del Dungeon Row, luchas contra monstruos y te desplazas por las salas.' },
      { name: '3. Ruido', detail: 'Ciertas cartas y pasillos te hacen meter cubos de clank en la bolsa: cuanto más ruido, más peligro.' },
    ],
    scoring: [
      { what: 'Artefacto que sacas de la mazmorra', points: 'Puntos según su profundidad' },
      { what: 'Cartas, gemas, monedas y bonos', points: 'Puntos de victoria' },
    ],
    endCondition:
      'Debes coger al menos un artefacto y subir a la superficie. Cuando alguien escapa (o cae), empieza la cuenta atrás del dragón; los que no salgan a tiempo y mueran no puntúan. Gana quien más puntos saque vivo.',
    reminders: [
      'Solo puedes escapar por la superficie si llevas un artefacto; sin él no puntúas nada.',
      'Cada ataque del dragón saca cubos de la bolsa: si salen los tuyos, recibes daño.',
      'La profundidad manda: los artefactos más hondos valen más pero cuesta más volver.',
      'Al desmayarte (10 de daño) dejas de jugar; si estás en zona profunda, mueres y pierdes lo llevado.',
    ],
    officialLink: { label: 'Web oficial (Renegade Game Studios)', url: 'https://renegadegamestudios.com/' },
  },

  'quacks-quedlinburg': {
    players: '2–4 jugadores',
    duration: '45 min',
    setup: [
      'Cada jugador coge su marmita, su bolsa y las mismas 9 fichas iniciales dentro (varias calabazas blancas y unas pocas de otro tipo).',
      'Colocad el dado de bonificación y las fichas de rubí, gotas y sellos.',
      'Preparad los libros de ingredientes en la variante que uséis (recomendado el primero).',
      'El marcador va a la ronda 1 de nueve.',
    ],
    turn: [
      { name: '1. Cocer', detail: 'Sacas fichas de tu bolsa una a una y las colocas en la marmita avanzando según su valor, mientras te atrevas.' },
      { name: '2. ¿Explota?', detail: 'Si las calabazas blancas acumuladas suman más de 7, tu marmita revienta y pierdes parte del turno.' },
      { name: '3. Cobrar', detail: 'Según dónde acabe tu ficha de gota: ganas monedas para comprar ingredientes y puntos de victoria.' },
    ],
    scoring: [
      { what: 'Casilla final de la gota', points: 'Puntos de victoria + monedas' },
      { what: 'Rubíes y posición', points: 'Bonos según la casilla' },
    ],
    endCondition:
      'Se juegan nueve rondas. Si tu marmita explotó, eliges puntos O monedas, no ambos. Gana quien más puntos de victoria acumule al final.',
    reminders: [
      'Todos sacan fichas a la vez y en secreto: cada uno decide cuándo plantarse.',
      'Explota solo si las blancas SUMAN más de 7 (no basta con contar fichas).',
      'Puedes plantarte antes de reventar y cobrar seguro; arriesgar da más pero puede costarte la ronda.',
      'Los ingredientes comprados van a la bolsa para las rondas siguientes: piensa en el largo plazo.',
    ],
    officialLink: { label: 'Web oficial (North Star Games)', url: 'https://www.northstargames.com/' },
  },

  jaipur: {
    players: '2 jugadores',
    duration: '30 min',
    setup: [
      'Poned los tres camellos boca arriba en el mercado y completadlo hasta cinco cartas con el mazo.',
      'Repartid 5 cartas a cada mercader; los camellos que os toquen van a vuestra manada, aparte.',
      'Apilad las fichas de mercancía en orden decreciente y las de bonos de 3, 4 y 5 cartas.',
    ],
    turn: [
      { name: 'Coger o vender', detail: 'En tu turno, o COGES cartas del mercado (una, varias camello, o intercambias), o VENDES un tipo de mercancía.' },
      { name: 'Vender en lote', detail: 'Al vender, coges las fichas del valor más alto de esa mercancía; cuantas más de golpe, más bono.' },
    ],
    scoring: [
      { what: 'Fichas de mercancía vendida', points: 'Su valor impreso (bajan según se agotan)' },
      { what: 'Bonos por vender 3, 4 o 5 a la vez', points: 'Ficha de bono extra' },
      { what: 'Tener más camellos al final', points: '5 puntos (premio del camello)' },
    ],
    endCondition:
      'La ronda acaba cuando se vacían tres montones de fichas o el mazo. Quien más rupias sume gana un sello de excelencia; a las dos rondas ganadas, gana la partida.',
    reminders: [
      'Diamantes, oro y plata (los caros) solo se pueden vender de dos en adelante, nunca una suelta.',
      'Los camellos no cuentan como carta de mano: se cogen todos de golpe y van a tu manada.',
      'Al coger varias cartas debes reponer el mercado y no puedes acabar con más de 7 cartas en mano.',
      'Vender pronto asegura las fichas altas; esperar a tener muchas da mejor bono pero las fichas bajan.',
    ],
    officialLink: { label: 'Web oficial (Space Cowboys)', url: 'https://www.spacecowboys.fr/' },
  },

  kingdomino: {
    players: '2–4 jugadores',
    duration: '15–20 min',
    setup: [
      'Cada jugador coge un castillo y su color de reyes; a dos jugadores, cada uno lleva dos reyes.',
      'Barajad las losetas de dominó y formad la primera columna de tantas como reyes haya, ordenadas por número.',
      'Colocad un rey en cada loseta de la columna, de menor a mayor.',
    ],
    turn: [
      { name: '1. Colocar tu loseta', detail: 'Encajas la loseta que tenías reservada en tu reino, junto al castillo o a un terreno del mismo tipo.' },
      { name: '2. Elegir la siguiente', detail: 'Pones tu rey sobre una loseta de la nueva columna; quien eligió la más baja antes, elige primero ahora.' },
    ],
    scoring: [
      { what: 'Cada región de terreno', points: 'Número de casillas × número de coronas de esa región' },
      { what: 'Región sin coronas', points: '0 puntos' },
    ],
    endCondition:
      'Acaba cuando se colocan todas las losetas. Gana quien más puntos sume; el reino debe caber en 5×5 o esas losetas se descartan.',
    reminders: [
      'Una loseta debe tocar un terreno igual (o el castillo) por al menos un lado para poder colocarse.',
      'Una región sin ninguna corona vale 0, por grande que sea: las coronas son el multiplicador.',
      'Elegir loseta baja te da mejor turno luego; elegir alta te da mejor terreno ahora.',
      'Si una loseta no cabe en la cuadrícula de 5×5, se descarta sin puntuar.',
    ],
    officialLink: { label: 'Web oficial (Blue Orange)', url: 'https://blueorangegames.eu/' },
  },

  sagrada: {
    players: '1–4 jugadores',
    duration: '30–45 min',
    setup: [
      'Cada jugador coge una vidriera (tablero) y elige su carta de patrón, que fija restricciones de color y tono.',
      'Repartid dos cartas de objetivo privado (una por jugador) y sacad tres públicos y tres herramientas.',
      'Poned los 90 dados en la bolsa y las fichas de favor según la dificultad del patrón.',
    ],
    turn: [
      { name: '1. Sortear dados', detail: 'El primer jugador saca dados de la bolsa (dos por jugador más uno) y los tira a la reserva.' },
      { name: '2. Colocar', detail: 'En orden de ida y vuelta, cada uno coloca un dado en su vidriera respetando bordes, patrón y vecindad.' },
    ],
    scoring: [
      { what: 'Objetivos públicos', points: 'Según cada carta, para todos' },
      { what: 'Objetivo privado', points: 'Suma de tu color secreto' },
      { what: 'Casillas vacías', points: '−1 cada una' },
    ],
    endCondition:
      'Se juegan diez rondas. Gana quien más puntos sume entre objetivos públicos, privado y fichas de favor sobrantes, restando los huecos.',
    reminders: [
      'El primer dado va pegado a un borde o esquina; el resto, ortogonal o diagonalmente junto a otro dado.',
      'Dos dados del mismo color o del mismo valor no pueden tocarse por lado (sí en diagonal).',
      'Las casillas con símbolo obligan a ese color o a ese número exacto.',
      'Las herramientas cuestan fichas de favor y dejan saltarte una regla de colocación una vez.',
    ],
    officialLink: { label: 'Web oficial (Floodgate Games)', url: 'https://floodgategames.com/' },
  },

  'machi-koro': {
    players: '2–4 jugadores',
    duration: '30 min',
    setup: [
      'Cada jugador empieza con un campo de trigo y una panadería, más 3 monedas.',
      'Formad el suministro con todos los tipos de establecimiento a la vista.',
      'Cada jugador tiene sus cuatro obras (grandes) por construir, boca abajo hasta pagarlas.',
    ],
    turn: [
      { name: '1. Tirar dados', detail: 'Lanzas uno o dos dados (dos si tienes la estación).' },
      { name: '2. Cobrar', detail: 'Se activan los establecimientos cuyo número salió, para todos según su color.' },
      { name: '3. Construir', detail: 'Compras un establecimiento del suministro o pagas una de tus obras.' },
    ],
    scoring: [
      { what: 'Establecimientos', points: 'Generan monedas al salir su número' },
      { what: 'Cuatro obras completadas', points: 'Victoria' },
    ],
    endCondition:
      'Gana el primero que construye sus cuatro obras (estación, centro comercial, torre y parque de atracciones).',
    reminders: [
      'Los azules cobran en el turno de cualquiera; los verdes solo en el tuyo; los rojos te roban en el turno de otros; los morados son especiales y solo en tu turno.',
      'Empezar tirando un solo dado da números bajos (más seguros); dos dados abren los altos, pero solo si tienes la estación.',
      'Puedes construir un establecimiento repetido para duplicar su efecto.',
      'Si te quedas sin monedas, no pagas rojos: nadie puede dejarte por debajo de cero.',
    ],
    officialLink: { label: 'Web oficial (Pandasaurus Games)', url: 'https://pandasaurusgames.com/' },
  },

  'welcome-to': {
    players: '1–100 jugadores',
    duration: '25–45 min',
    setup: [
      'Cada jugador coge una hoja de urbanización idéntica y un lápiz.',
      'Formad tres mazos de cartas de construcción y voltead la primera de cada uno.',
      'Sacad las tres cartas de objetivo comunes de la partida.',
    ],
    turn: [
      { name: '1. Revelar', detail: 'Se combinan las cartas: cada montón aporta un número (arriba) y una acción (abajo).' },
      { name: '2. Elegir pareja', detail: 'Todos a la vez eligen una de las tres combinaciones de número + acción.' },
      { name: '3. Escribir', detail: 'Escribes ese número en una casa de una calle (en orden creciente) y aplicas la acción.' },
    ],
    scoring: [
      { what: 'Urbanizaciones cerradas, parques y piscinas', points: 'Puntos según su tamaño' },
      { what: 'Cartas de objetivo', points: 'Bono al primero que las cumple' },
      { what: 'Casas mal numeradas (bis) y planos rotos', points: 'Penalizaciones' },
    ],
    endCondition:
      'Acaba cuando alguien completa las tres cartas de objetivo, llena sus tres calles o acumula tres errores urbanísticos. Gana quien más puntos sume.',
    reminders: [
      'Los números de cada calle van SIEMPRE en orden creciente de izquierda a derecha, sin repetir.',
      'La acción «bis» repite un número vecino, pero cada casa duplicada resta al final.',
      'Los objetivos comunes premian al primero que los cumple: quien va después gana menos.',
      'Un número que no cabe en ninguna calle te obliga a marcar un error de plano.',
    ],
    officialLink: { label: 'Web oficial (Blue Cocker)', url: 'https://blue-cocker.com/' },
  },

  'heat-pedal-to-the-metal': {
    players: '1–6 jugadores',
    duration: '30–60 min',
    setup: [
      'Elegid un circuito y colocad los coches en la parrilla según el sorteo.',
      'Cada piloto coge su mazo idéntico de cartas de velocidad, sus cartas de calor y su tablero de marchas.',
      'Barajad tu mazo y roba tu mano inicial de siete cartas; el motor arranca en 1ª.',
    ],
    turn: [
      { name: '1. Cambiar de marcha', detail: 'Subes o bajas una marcha (o más pagando calor); la marcha fija cuántas cartas juegas.' },
      { name: '2. Jugar velocidad', detail: 'Juegas cartas de tu mano; su suma es lo que avanzas esta vuelta.' },
      { name: '3. Curvas y calor', detail: 'Si pasas una curva por encima de su límite, pagas calor por cada exceso; sin calor, derrapas.' },
    ],
    scoring: [
      { what: 'Orden de llegada', points: 'Posición en la carrera' },
    ],
    endCondition:
      'Gana quien cruce primero la meta tras completar las vueltas pactadas; en campeonato se suman puntos por posición a lo largo de varias carreras.',
    reminders: [
      'La marcha limita cuántas cartas juegas: más marcha, más velocidad, pero menos control en las curvas.',
      'Pasarte del límite de una curva cuesta una carta de calor por cada punto de exceso; sin calor en la reserva, giras (spinout).',
      'El rebufo te deja avanzar dos casillas gratis si acabas justo detrás de otro coche.',
      'El calor entra en tu mazo como carta muerta: gestionar el motor es medio juego.',
    ],
    officialLink: { label: 'Web oficial (Days of Wonder)', url: 'https://www.daysofwonder.com/' },
  },

  root: {
    players: '2–4 jugadores',
    duration: '60–90 min',
    setup: [
      'Montad el tablero del bosque con sus claros y caminos; repartid las losetas de bosque.',
      'Cada jugador elige una facción (Marquesa, Águilas, Alianza, Vagabundo) con su tablero y reglas propias.',
      'Colocad las piezas iniciales de cada facción según su hoja de preparación.',
      'Formad el mazo compartido y las cartas de objetivo si jugáis con ellas.',
    ],
    turn: [
      { name: 'Amanecer, día, ocaso', detail: 'Cada facción tiene sus tres fases y acciones únicas: no juegan igual dos jugadores.' },
      { name: 'Acciones propias', detail: 'Reclutar, marchar, construir, batir o cartas, según lo que permita tu facción.' },
    ],
    scoring: [
      { what: 'Construcciones y acciones de facción', points: 'Puntos de victoria' },
      { what: 'Meta', points: '30 puntos de victoria' },
    ],
    endCondition:
      'Gana quien llegue a 30 puntos de victoria. Algunas facciones y las cartas dominante ofrecen victorias alternativas si controlas suficiente bosque.',
    reminders: [
      'Cada facción puntúa a su manera: la Marquesa por construir, las Águilas por su decreto, la Alianza por revueltas, el Vagabundo por misiones y amistades.',
      'La carta de batalla la resuelve el atacante, pero el defensor también hace bajas: pelear cuesta a los dos.',
      'Las cartas se juegan por su color de claro; los pájaros son comodines.',
      'Ignorar a un jugador que suma en silencio es la forma más común de perder.',
    ],
    officialLink: { label: 'Web oficial (Leder Games)', url: 'https://ledergames.com/' },
  },

  // ---------------------------------------------------------------------------
  // Cartas y filler
  // ---------------------------------------------------------------------------
  'love-letter': {
    players: '2–6 jugadores',
    duration: '20 min',
    setup: [
      'Barajad el mazo de 16 cartas (o 21 en la edición ampliada) y apartad una boca abajo.',
      'A dos jugadores, dejad además tres cartas visibles apartadas.',
      'Repartid una carta a cada jugador y las fichas de favor para llevar la cuenta.',
    ],
    turn: [
      { name: '1. Robar', detail: 'Coges una carta, así que tienes dos en la mano.' },
      { name: '2. Jugar una', detail: 'Descartas una de las dos y aplicas su efecto: espiar, comparar, eliminar o protegerte.' },
    ],
    scoring: [
      { what: 'Ganar una ronda', points: '1 ficha de favor' },
    ],
    endCondition:
      'La ronda la gana quien quede en pie o quien tenga la carta más alta al agotarse el mazo. Se juega hasta que alguien acumula las fichas necesarias (según el número de jugadores).',
    reminders: [
      'Si descartas o te obligan a descartar la Princesa (8), quedas eliminado de la ronda.',
      'La Condesa (7) debes jugarla obligatoriamente si tienes también el Rey o el Príncipe.',
      'Mientras tienes la Doncella (4) activa, nadie puede elegirte como objetivo hasta tu próximo turno.',
      'El Guardia (1) elimina a quien aciertes su carta, pero no vale adivinar «Guardia».',
    ],
    officialLink: { label: 'Web oficial (Z-Man Games)', url: 'https://www.zmangames.com/' },
  },

  'sushi-go': {
    players: '2–5 jugadores',
    duration: '15–20 min',
    setup: [
      'Barajad las cartas de sushi y repartid la mano inicial según el número de jugadores (10 con dos, 9 con tres…).',
      'Dejad el mazo a mano para reponer entre rondas.',
    ],
    turn: [
      { name: '1. Elegir a la vez', detail: 'Todos escogen en secreto una carta de su mano y la revelan simultáneamente.' },
      { name: '2. Pasar la mano', detail: 'Cada uno pasa el resto de sus cartas al vecino y repite hasta agotarlas (drafting).' },
    ],
    scoring: [
      { what: 'Tempura, sashimi, gyoza', points: 'Puntos por sets completos' },
      { what: 'Nigiri (+ wasabi ×3)', points: '1/2/3 puntos, el wasabi triplica el siguiente nigiri' },
      { what: 'Maki', points: 'Puntos al que más rollos tenga de la ronda' },
      { what: 'Pudin', points: 'Bono al final a quien más tenga, penaliza a quien menos' },
    ],
    endCondition:
      'Se juegan tres rondas. Se puntúa cada ronda; al final se reparten los puntos de pudin acumulados. Gana quien más sume.',
    reminders: [
      'El sashimi solo puntúa de tres en tres: uno o dos sueltos valen 0.',
      'El wasabi triplica el VALOR del próximo nigiri que juegues, no cualquier carta.',
      'Los palillos te dejan coger dos cartas en un turno posterior, devolviéndolos a la mano.',
      'El pudin se guarda entre rondas y se cuenta al final: quien menos tenga pierde puntos.',
    ],
    officialLink: { label: 'Web oficial (Gamewright)', url: 'https://gamewright.com/' },
  },

  'six-nimmt': {
    players: '2–10 jugadores',
    duration: '45 min',
    setup: [
      'Barajad las 104 cartas y repartid 10 a cada jugador.',
      'Poned cuatro cartas boca arriba en columna: son el inicio de las cuatro filas.',
    ],
    turn: [
      { name: '1. Elegir en secreto', detail: 'Todos escogen una carta de su mano y la ponen boca abajo.' },
      { name: '2. Revelar y colocar', detail: 'De menor a mayor, cada carta se añade a la fila que acabe en el número más alto sin pasarse.' },
      { name: '3. La sexta', detail: 'Si tu carta es la sexta de una fila, te llevas las cinco anteriores y tu carta inicia la fila.' },
    ],
    scoring: [
      { what: 'Cabezas de buey de las cartas recogidas', points: 'Puntos negativos (gana quien menos suma)' },
    ],
    endCondition:
      'Se juegan las diez cartas de la mano (y varias rondas). La partida acaba cuando alguien llega a 66 puntos; gana quien menos cabezas de buey haya acumulado.',
    reminders: [
      'Tu carta va SIEMPRE a la fila cuya última carta sea la mayor que no supere a la tuya.',
      'Si tu carta es más baja que todas las filas, TÚ eliges qué fila te llevas y la reemplazas.',
      'Las cartas se resuelven de la más baja a la más alta: elegir un número no garantiza dónde cae.',
      'Los múltiplos de 10 valen 3 bueyes; el 55, cinco: cuidado con qué cartas recoges.',
    ],
    officialLink: { label: 'Web oficial (Amigo Spiele)', url: 'https://www.amigo-spiele.de/' },
  },

  'no-thanks': {
    players: '3–7 jugadores',
    duration: '20 min',
    setup: [
      'Barajad las cartas del 3 al 35 y retirad nueve al azar sin mirarlas.',
      'Repartid 11 fichas a cada jugador (menos si sois muchos), en secreto.',
      'Voltead la primera carta.',
    ],
    turn: [
      { name: 'Pagar o cargar', detail: 'En tu turno, o pones una ficha sobre la carta para pasártela al siguiente, o te la llevas con todas las fichas acumuladas encima.' },
    ],
    scoring: [
      { what: 'Cartas que te quedas', points: 'Suman su número (menos las que encadenas)' },
      { what: 'Fichas sobrantes', points: '−1 punto cada una (rebajan tu total)' },
    ],
    endCondition:
      'La partida acaba cuando se acaban las cartas. Gana quien MENOS puntos sume; las fichas restan de tu total.',
    reminders: [
      'En una escalera de cartas consecutivas solo cuenta la MÁS BAJA: junta seguidillas.',
      'Al coger una carta te llevas también todas las fichas apiladas encima, que valen −1 cada una.',
      'Si te quedas sin fichas, estás obligado a coger la carta que te toque.',
      'Nueve cartas se retiran sin mirar: nunca sabes qué números faltan para tus escaleras.',
    ],
    officialLink: { label: 'Web oficial (Amigo Spiele)', url: 'https://www.amigo-spiele.de/' },
  },

  'for-sale': {
    players: '3–6 jugadores',
    duration: '20–30 min',
    setup: [
      'Repartid las monedas de salida a cada jugador según el número de participantes.',
      'Separad las 30 cartas de propiedad (1–30) y las 30 de cheque para las dos fases.',
      'Barajad cada mazo por separado.',
    ],
    turn: [
      { name: 'Fase 1: comprar casas', detail: 'Se sacan tantas propiedades como jugadores; por turnos, subes la puja o te retiras cobrando media puja y llevándote la casa más baja que quede.' },
      { name: 'Fase 2: vender casas', detail: 'Se sacan cheques; todos revelan a la vez una propiedad y quien enseñe la más alta se lleva el cheque mayor.' },
    ],
    scoring: [
      { what: 'Cheques cobrados en la fase 2', points: 'Su valor en dinero' },
      { what: 'Monedas que te quedan al final', points: 'Se suman al total' },
    ],
    endCondition:
      'Tras las dos fases, gana quien más dinero total tenga (cheques + monedas sobrantes).',
    reminders: [
      'Al retirarte en la subasta recuperas la MITAD de tu puja (redondeada abajo) y te llevas la casa más barata disponible.',
      'Quien puja más alto paga entero, pero se queda la casa más cara del lote.',
      'En la venta, en caso de empate de propiedad se reparten cheques por orden: el segundo cheque más alto va al segundo.',
      'No malgastes las casas altas con cheques bajos: guárdalas para las rondas caras.',
    ],
    officialLink: { label: 'Web oficial (Eagle-Gryphon Games)', url: 'https://eaglegryphon.com/' },
  },

  dobble: {
    players: '2–8 jugadores',
    duration: '15 min',
    setup: [
      'Cada carta comparte exactamente un símbolo con cualquier otra.',
      'Elegid uno de los cinco minijuegos; el reparto de cartas depende del que juguéis.',
    ],
    turn: [
      { name: 'Ver y cantar', detail: 'Todos juegan a la vez: hay que encontrar el símbolo común entre dos cartas y nombrarlo el primero.' },
      { name: 'Ganar cartas', detail: 'Según el modo, quien acierta se lleva la carta, se deshace de una o roba del centro.' },
    ],
    endCondition:
      'Depende del minijuego: gana quien acumule más cartas (Torre Infernal), quien se quede antes sin cartas (Pozo Envenenado) o quien recoja más del centro. No hay puntos, solo cartas.',
    reminders: [
      'Siempre hay UN único símbolo en común entre dos cartas cualesquiera; a veces es de distinto tamaño.',
      'Hay que decir el símbolo en voz alta, no solo señalarlo.',
      'Elegid el modo antes de empezar: cambian por completo cómo se ganan o pierden las cartas.',
      'No hay turnos: la velocidad de ojo lo es todo.',
    ],
    officialLink: { label: 'Web oficial (Zygomatic)', url: 'https://www.zygomatic-games.com/' },
  },

  'exploding-kittens': {
    players: '2–5 jugadores',
    duration: '15 min',
    setup: [
      'Retirad los gatos explosivos y los desactivadores del mazo.',
      'Repartid 7 cartas a cada jugador más un desactivador (ocho en total); cada uno empieza con un desactivador garantizado.',
      'Volved a meter tantos gatos explosivos como jugadores menos uno, barajad y dejad el mazo boca abajo.',
    ],
    turn: [
      { name: '1. Jugar cartas', detail: 'Juegas las cartas de acción que quieras (o ninguna): saltar, robar al vecino, barajar, mirar el futuro…' },
      { name: '2. Robar', detail: 'Terminas tu turno robando una carta del mazo, salvo que hayas jugado un «salto».' },
    ],
    endCondition:
      'Si robas un gato explosivo y no puedes desactivarlo, quedas eliminado. El último que quede vivo gana.',
    reminders: [
      'Al robar un gato explosivo, un desactivador te salva: lo colocas en el mazo DONDE TÚ QUIERAS, en secreto.',
      'Las cartas «no, gracias» anulan la acción de otro jugador (y pueden encadenarse).',
      '«Salta» y «ataca» acaban tu turno sin robar; «ataca» además fuerza al siguiente a jugar dos turnos.',
      'Guarda un desactivador: sin él, el próximo gato te elimina.',
    ],
    officialLink: { label: 'Web oficial (Exploding Kittens)', url: 'https://www.explodingkittens.com/' },
  },

  // ---------------------------------------------------------------------------
  // Faroles, apuestas y ocultación
  // ---------------------------------------------------------------------------
  coup: {
    players: '2–6 jugadores',
    duration: '15 min',
    setup: [
      'Barajad el mazo de personajes (Duque, Asesino, Capitán, Embajador, Condesa) y repartid dos cartas a cada jugador, ocultas.',
      'Cada jugador coge 2 monedas del banco.',
    ],
    turn: [
      { name: 'Una acción', detail: 'Declaras una acción general (ingreso, ayuda exterior, golpe) o una de personaje, tengas la carta o no.' },
      { name: 'Dudar o bloquear', detail: 'Cualquiera puede dudar de tu personaje o bloquear con el suyo; el pillado mintiendo pierde una carta.' },
    ],
    endCondition:
      'Cada jugador pierde una influencia (carta) por cada golpe recibido o mentira descubierta. El último con al menos una carta en pie gana.',
    reminders: [
      'Puedes farolear cualquier acción de personaje sin tener la carta: el riesgo es que te duden.',
      'Con 10 monedas o más, estás OBLIGADO a dar un golpe (coup) ese turno.',
      'Si dudas y el otro sí tenía la carta, la enseña, la rebaraja, roba una nueva y TÚ pierdes una influencia.',
      'La Condesa solo bloquea al Asesino; el bloqueo de ayuda exterior lo hace el Duque.',
    ],
    officialLink: { label: 'Web oficial (Indie Boards & Cards)', url: 'https://www.indieboardsandcards.com/' },
  },

  skull: {
    players: '3–6 jugadores',
    duration: '15–45 min',
    setup: [
      'Cada jugador coge un tapete y cuatro discos: tres rosas y una calavera.',
      'Todos empiezan poniendo una carta boca abajo sobre su tapete.',
    ],
    turn: [
      { name: '1. Poner o apostar', detail: 'En tu turno o añades otra carta boca abajo, o abres la puja diciendo cuántas rosas te ves capaz de levantar.' },
      { name: '2. Subastar', detail: 'La puja sube por turnos hasta que todos pasan; quien más apostó debe cumplir.' },
      { name: '3. Levantar', detail: 'Empiezas por tus propias cartas y sigues por las de otros; si sacas una calavera, fracasas y pierdes un disco al azar.' },
    ],
    endCondition:
      'Ganas si consigues dos apuestas cumplidas, o si quedas como único jugador con discos. No hay puntos: se cuentan rondas ganadas.',
    reminders: [
      'Al pujar te comprometes a levantar ESE número de rosas seguidas, sin destapar una sola calavera.',
      'Debes empezar levantando tus propias cartas antes de tocar las de nadie.',
      'Si fallas (sale calavera), pierdes un disco al azar; quedarte sin discos te elimina.',
      'La tensión está en tirarse un farol poniendo la calavera y rezar para que otro puje alto.',
    ],
    officialLink: { label: 'Web oficial (Space Cowboys)', url: 'https://www.spacecowboys.fr/' },
  },

  'secret-hitler': {
    players: '5–10 jugadores',
    duration: '45 min',
    setup: [
      'Repartid roles en secreto: liberales mayoría, fascistas minoría y uno de ellos es Hitler.',
      'Con 5–6 jugadores, los fascistas se conocen y Hitler los ve; con 7+, Hitler no conoce a los suyos.',
      'Montad los dos tableros y barajad el mazo de leyes (11 fascistas, 6 liberales).',
    ],
    turn: [
      { name: '1. Elegir gobierno', detail: 'El presidente de turno nomina a un canciller; todos votan sí o no.' },
      { name: '2. Legislar', detail: 'Si sale el gobierno, el presidente roba tres leyes, descarta una y pasa dos al canciller, que promulga una.' },
      { name: '3. Poderes', detail: 'Algunas leyes fascistas dan al presidente poderes: investigar, ejecutar, elegir al siguiente presidente…' },
    ],
    endCondition:
      'Los liberales ganan con 5 leyes liberales o ejecutando a Hitler. Los fascistas ganan con 6 leyes fascistas o eligiendo a Hitler canciller una vez hay 3 leyes fascistas en la mesa.',
    reminders: [
      'A partir de tres leyes fascistas, nombrar a Hitler canciller da la victoria al Eje: preguntad siempre.',
      'Solo el presidente y el canciller ven las leyes: el resto deduce por lo que promulgan y lo que dicen.',
      'Tres votos «no» seguidos (caos) promulgan la ley de arriba a ciegas y reinician los límites de mandato.',
      'Mentir sobre las cartas robadas es parte del juego: nadie puede probar qué descartaste.',
    ],
    officialLink: { label: 'Web oficial (Secret Hitler)', url: 'https://www.secrethitler.com/' },
  },

  'the-resistance': {
    players: '5–10 jugadores',
    duration: '30 min',
    setup: [
      'Repartid roles en secreto: la mayoría son la Resistencia; el resto, espías del Imperio.',
      'Los espías abren los ojos y se reconocen entre sí; la Resistencia no sabe quién es quién.',
      'Preparad la tabla de misiones según el número de jugadores.',
    ],
    turn: [
      { name: '1. Proponer equipo', detail: 'El líder de turno elige quién va a la misión; todos votan a mano alzada si aprueban el equipo.' },
      { name: '2. La misión', detail: 'Si se aprueba, los elegidos juegan en secreto una carta de éxito o sabotaje.' },
      { name: '3. Resultado', detail: 'Una sola carta de sabotaje (dos en algunas misiones grandes) hace fracasar la misión.' },
    ],
    endCondition:
      'La Resistencia gana si tres misiones tienen éxito; los espías ganan con tres sabotajes o si se rechazan cinco equipos seguidos en una misma ronda.',
    reminders: [
      'Los miembros de la Resistencia SIEMPRE juegan éxito: solo los espías pueden sabotear.',
      'Basta una carta de sabotaje para hundir la misión (salvo la 4.ª a 7+ jugadores, que pide dos).',
      'Rechazar cinco equipos seguidos en la misma misión da la victoria a los espías: no bloqueéis sin fin.',
      'Toda la información está en quién propone a quién y quién vota qué: hablad y desconfiad.',
    ],
    officialLink: { label: 'Web oficial (Indie Boards & Cards)', url: 'https://www.indieboardsandcards.com/' },
  },

  'resistance-avalon': {
    players: '5–10 jugadores',
    duration: '30 min',
    setup: [
      'Repartid lealtades: los siervos de Arturo (buenos) y los esbirros de Mordred (malos), con Merlín y Asesino siempre presentes.',
      'Con los ojos cerrados, Merlín ve a los malos (salvo Mordred) y los malos se reconocen entre sí (según los personajes usados).',
      'Preparad las cartas de misión y el marcador de intentos.',
    ],
    turn: [
      { name: '1. Proponer equipo', detail: 'El líder elige a los que irán a la misión y todos votan el equipo.' },
      { name: '2. Misión', detail: 'Los elegidos juegan éxito o fracaso en secreto; una carta de fracaso suele hundir la misión.' },
      { name: '3. Y al final…', detail: 'Si los buenos ganan tres misiones, el Asesino tiene una última baza: señalar a Merlín.' },
    ],
    endCondition:
      'El bien gana con tres misiones exitosas SIEMPRE que el Asesino no acierte quién es Merlín al final; si lo señala, gana el mal. El mal también gana con tres fracasos o cinco rechazos seguidos.',
    reminders: [
      'Merlín conoce a los malos pero debe disimularlo: si se hace notar, el Asesino lo mata al final.',
      'Percival ve a Merlín y a Morgana sin distinguirlos: su trabajo es protegerlo sin delatarlo.',
      'Mordred permanece oculto incluso para Merlín: hay un mal que él no ve.',
      'Ganar las tres misiones no basta: cuidad lo que Merlín deja entrever.',
    ],
    officialLink: { label: 'Web oficial (Indie Boards & Cards)', url: 'https://www.indieboardsandcards.com/' },
  },

  'one-night-ultimate-werewolf': {
    players: '3–10 jugadores',
    duration: '10 min',
    setup: [
      'Elegid roles para el número de jugadores más tres: esas tres cartas sobrantes van al centro, ocultas.',
      'Repartid una carta a cada jugador; miradla y dejadla boca abajo delante.',
      'Descargad la app o preparad el guion narrado que despierta a cada rol en orden.',
    ],
    turn: [
      { name: '1. La noche', detail: 'La narración despierta a cada rol por orden: los lobos se ven, el vidente mira, el trasgo cambia cartas… todo en una sola noche.' },
      { name: '2. El día', detail: 'Todos abren los ojos y debaten: nadie sabe con certeza su rol final si se lo cambiaron.' },
      { name: '3. La votación', detail: 'A la de tres, todos señalan a alguien a la vez; el más votado muere.' },
    ],
    endCondition:
      'El pueblo gana si muere al menos un hombre lobo. Los lobos ganan si sobreviven todos. Si no hay lobos en juego (todos al centro), el pueblo gana solo si no linchan a nadie.',
    reminders: [
      'No hay eliminación durante la partida: solo hay una noche y una votación final.',
      'Tu rol puede haber CAMBIADO por la noche (trasgo, alborotador…): puedes ser lobo sin saberlo.',
      'Las tres cartas del centro despistan: un rol que ves acusar puede estar apartado.',
      'El objetivo de los lobos es sembrar dudas y desviar la única votación que hay.',
    ],
    officialLink: { label: 'Web oficial (Bézier Games)', url: 'https://www.beziergames.com/' },
  },

  // ---------------------------------------------------------------------------
  // Palabras, equipos y deducción por pistas
  // ---------------------------------------------------------------------------
  decrypto: {
    players: '3–8 jugadores',
    duration: '15–45 min',
    setup: [
      'Formad dos equipos; cada uno coge un atril con cuatro palabras clave numeradas 1-2-3-4, visibles solo para su equipo.',
      'Preparad las cartas de código (combinaciones de tres cifras del 1 al 4) para cada equipo.',
    ],
    turn: [
      { name: '1. Dar pistas', detail: 'El encriptador de turno saca un código de tres cifras y da una pista para cada una, relacionada con la palabra de esa posición.' },
      { name: '2. Descifrar', detail: 'Su propio equipo intenta reconstruir el código (3-1-4…); el equipo rival también apunta para descifrarlo desde fuera.' },
    ],
    scoring: [
      { what: 'Interceptar el código rival', points: '+1 ficha de intercepción (2 = victoria)' },
      { what: 'Fallar tu propio código', points: '+1 ficha de error (2 = derrota)' },
    ],
    endCondition:
      'Un equipo gana al conseguir dos fichas de intercepción del rival; pierde si acumula dos errores propios. Si nadie lo logra, se resuelve por fichas tras ocho rondas.',
    reminders: [
      'Las pistas describen TU palabra secreta, pero el rival las oye todas ronda tras ronda para adivinar el código.',
      'No puedes usar la propia palabra clave ni derivadas evidentes como pista.',
      'La tensión sube con las rondas: cuanto más obvia sea tu pista, antes te interceptan.',
      'Interceptar dos veces gana; fallar dos veces tu propio código pierde: cuidado con las pistas rebuscadas.',
    ],
    officialLink: { label: 'Web oficial (Le Scorpion Masqué)', url: 'https://www.scorpionmasque.com/' },
  },

  wavelength: {
    players: '2–12 jugadores',
    duration: '30–45 min',
    setup: [
      'Montad el disco con la aguja y la pantalla que la tapa.',
      'Formad dos equipos y coged las cartas de conceptos con dos extremos opuestos.',
    ],
    turn: [
      { name: '1. Fijar la diana', detail: 'El «psíquico» de turno gira el disco en secreto y ve dónde ha caído la zona de puntos.' },
      { name: '2. Dar la pista', detail: 'Lee una carta con dos extremos (p. ej. «frío ↔ caliente») y dice algo que sitúe la diana en ese espectro.' },
      { name: '3. Colocar la aguja', detail: 'Su equipo debate y gira la aguja donde crea; se destapa y se puntúa según lo cerca que quedó.' },
    ],
    scoring: [
      { what: 'Zona central de la diana', points: '4 puntos' },
      { what: 'Zonas contiguas', points: '3 o 2 puntos según se aleja' },
      { what: 'Meta', points: '10 puntos' },
    ],
    endCondition:
      'Gana el primer equipo en llegar a 10 puntos. El equipo rival puede ganar puntos adivinando a qué lado de la aguja cayó la diana.',
    reminders: [
      'La pista tiene que ser un punto EN el espectro, no un sí/no: piensa en grados.',
      'El psíquico no puede señalar ni dar pistas numéricas de la posición.',
      'El equipo contrario apuesta a izquierda o derecha de vuestra aguja: un fallo vuestro les da un punto.',
      'La diana tiene zonas de 4, 3 y 2: acercarse ya suma, no hace falta clavarla.',
    ],
    officialLink: { label: 'Web oficial (CMYK)', url: 'https://www.cmyk.games/' },
  },

  telestrations: {
    players: '4–8 jugadores',
    duration: '30 min',
    setup: [
      'Cada jugador coge una libreta, un rotulador borrable y una carta con palabras.',
      'Todos tiran el dado para saber qué palabra les toca y la escriben en su primera página.',
    ],
    turn: [
      { name: '1. Dibujar', detail: 'Todos a la vez dibujan su palabra en la siguiente página, contrarreloj.' },
      { name: '2. Pasar y adivinar', detail: 'Pasas tu libreta al vecino, que ve solo el dibujo y escribe qué cree que es.' },
      { name: '3. Alternar', detail: 'Se repite dibujo-palabra-dibujo hasta que cada libreta vuelve a su dueño.' },
    ],
    endCondition:
      'No hay ganador «serio»: cada uno enseña cómo su palabra se deformó por el camino. Si queréis puntuar, se dan fichas por adivinar bien o por hacer reír al grupo.',
    reminders: [
      'Es el teléfono escacharrado, pero dibujando: la gracia es ver la palabra transformarse.',
      'Solo puedes ver la página inmediatamente anterior, nunca hojear atrás.',
      'Nada de letras ni símbolos en los dibujos: solo se dibuja.',
      'Cuenta el tiempo: prisas y trazos torpes son parte de la diversión.',
    ],
    officialLink: { label: 'Web oficial (The Op)', url: 'https://theop.games/' },
  },

  taboo: {
    players: '4–10 jugadores',
    duration: '20–60 min',
    setup: [
      'Dividíos en dos equipos y sentaos alternando.',
      'Preparad las cartas en el pasador, el temporizador y el zumbador para el equipo rival.',
    ],
    turn: [
      { name: '1. Describir', detail: 'Un jugador hace que su equipo diga la palabra de la tarjeta sin usar ninguna de las cinco prohibidas.' },
      { name: '2. Vigilar', detail: 'Un miembro del equipo rival mira la carta y aprieta el zumbador si se dice una palabra tabú.' },
    ],
    scoring: [
      { what: 'Cada palabra adivinada', points: '+1 punto' },
      { what: 'Palabra tabú o gesto prohibido', points: '−1 punto y siguiente carta' },
    ],
    endCondition:
      'Se juega por tiempo y rondas hasta una puntuación pactada. Gana el equipo que más palabras acierte en total.',
    reminders: [
      'No vale decir ninguna de las cinco palabras prohibidas, ni derivadas, ni «rima con…».',
      'Nada de gestos, sonidos ni deletrear: solo describir con otras palabras.',
      'Puedes saltar una carta difícil, pero saltar cuesta punto según acordéis.',
      'El vigilante rival es implacable: cualquier tabú corta la carta al instante.',
    ],
    officialLink: { label: 'Web oficial (Hasbro)', url: 'https://shop.hasbro.com/' },
  },

  pictionary: {
    players: '3–16 jugadores',
    duration: '40–90 min',
    setup: [
      'Dividíos en equipos y colocad el tablero, los peones y el reloj de arena.',
      'Preparad las tarjetas de palabras por categorías y algo para dibujar.',
    ],
    turn: [
      { name: '1. Dibujar contrarreloj', detail: 'El dibujante de turno saca una palabra y la dibuja para que su equipo la adivine antes de que caiga la arena.' },
      { name: '2. Casillas «todos»', detail: 'En ciertas casillas dibujan a la vez todos los equipos y el primero que acierta avanza.' },
    ],
    scoring: [
      { what: 'Adivinar a tiempo', points: 'Avanzas por el tablero y sigues tirando' },
    ],
    endCondition:
      'Gana el primer equipo que recorre el tablero hasta la casilla final acertando su última palabra.',
    reminders: [
      'Nada de letras, números, símbolos ni hablar mientras dibujas: solo trazos.',
      'La categoría de la palabra marca de qué va (objeto, acción, difícil…): úsala como pista de estilo.',
      'El reloj manda: mejor un garabato rápido y reconocible que una obra de arte a medias.',
      'En las casillas comunes dibujan todos a la vez: gana la velocidad.',
    ],
    officialLink: { label: 'Web oficial (Mattel)', url: 'https://www.mattel.com/' },
  },

  'times-up': {
    players: '4–12 jugadores',
    duration: '30–90 min',
    setup: [
      'Formad dos equipos y elegid un montón de cartas de personajes famosos (40 suele bastar).',
      'Preparad el temporizador para los turnos de 30 segundos.',
    ],
    turn: [
      { name: 'Ronda 1: libre', detail: 'Describe el personaje con todas las palabras que quieras (menos el nombre) para que tu equipo lo acierte.' },
      { name: 'Ronda 2: una palabra', detail: 'Los MISMOS personajes, pero solo puedes decir UNA palabra por carta.' },
      { name: 'Ronda 3: mímica', detail: 'Otra vez los mismos, ahora solo con gestos, sin hablar.' },
    ],
    scoring: [
      { what: 'Cada personaje adivinado', points: '+1 punto por ronda' },
    ],
    endCondition:
      'Se juegan las tres rondas con el mismo mazo. Gana el equipo con más puntos sumados entre las tres.',
    reminders: [
      'Son SIEMPRE los mismos personajes las tres rondas: memorizarlos en la primera es media victoria.',
      'En la ronda 1 no puedes decir el nombre ni partes de él; en la 2, una sola palabra; en la 3, cero palabras.',
      'Puedes pasar un personaje difícil, pero vuelve al montón para ese mismo turno.',
      'La segunda y tercera ronda son un chollo si en la primera describisteis bien.',
    ],
    officialLink: { label: 'Web oficial (Repos Production)', url: 'https://www.rprod.com/' },
  },

  'cards-against-humanity': {
    players: '4–20 jugadores',
    duration: '30–90 min',
    setup: [
      'Repartid 10 cartas blancas (respuestas) a cada jugador.',
      'Elegid un primer «zar de las cartas»; el resto responderá.',
    ],
    turn: [
      { name: '1. Leer la negra', detail: 'El zar saca una carta negra con una pregunta o hueco por rellenar.' },
      { name: '2. Responder', detail: 'Los demás juegan boca abajo la carta blanca más gamberra que encaje.' },
      { name: '3. Juzgar', detail: 'El zar baraja las respuestas, las lee en voz alta y elige la que más le hace reír.' },
    ],
    scoring: [
      { what: 'Respuesta elegida por el zar', points: '1 punto (carta negra ganada)' },
    ],
    endCondition:
      'No hay final fijo: se juega hasta una puntuación pactada o hasta que os aburráis. Gana quien más cartas negras acumule.',
    reminders: [
      'El zar rota cada ronda: todos juzgan y todos responden por turnos.',
      'Repón tu mano hasta 10 cartas al final de cada ronda.',
      'Es humor negro y ofensivo por diseño: acordad el tono con el grupo antes de empezar.',
      'Las cartas negras con «robar 2 y jugar 3» piden dos cartas blancas en orden.',
    ],
    officialLink: { label: 'Web oficial (Cards Against Humanity)', url: 'https://www.cardsagainsthumanity.com/' },
  },

  // ---------------------------------------------------------------------------
  // Abstractos y duelos a dos
  // ---------------------------------------------------------------------------
  chess: {
    players: '2 jugadores',
    duration: '30–60 min',
    setup: [
      'Colocad el tablero con una casilla blanca en la esquina derecha de cada jugador.',
      'Fila de atrás: torre, caballo, alfil, dama, rey, alfil, caballo, torre; la dama va en su propio color.',
      'Los ocho peones, delante. Empiezan las blancas.',
    ],
    turn: [
      { name: 'Mover una pieza', detail: 'Cada bando mueve una pieza por turno según su patrón; capturar es ocupar la casilla del rival.' },
    ],
    endCondition:
      'Ganas dando jaque mate: el rey rival está amenazado y no puede evitarlo. Hay tablas por rey ahogado, material insuficiente, triple repetición, regla de los 50 movimientos o acuerdo mutuo.',
    reminders: [
      'No puedes hacer una jugada que deje (o mantenga) a tu propio rey en jaque.',
      'El enroque mueve rey y torre a la vez, si ninguno se ha movido y no hay jaque por medio.',
      'La captura «al paso» solo puede hacerse justo después de que un peón avance dos casillas.',
      'Un peón que llega a la última fila corona, normalmente a dama.',
    ],
    officialLink: { label: 'Leyes del ajedrez (FIDE)', url: 'https://www.fide.com/' },
  },

  go: {
    players: '2 jugadores',
    duration: '30–180 min',
    setup: [
      'Tablero de 19×19 vacío (9×9 o 13×13 para aprender).',
      'Un jugador coge las piedras negras y el otro las blancas; empiezan las negras.',
      'Acordad el komi: puntos de compensación para las blancas por jugar segundas (unos 6,5).',
    ],
    turn: [
      { name: 'Poner o pasar', detail: 'En tu turno colocas una piedra en una intersección vacía, o pasas.' },
      { name: 'Capturar', detail: 'Un grupo enemigo sin ninguna libertad (intersección vacía adyacente) se retira del tablero.' },
    ],
    endCondition:
      'La partida acaba con dos pasos seguidos. Se cuenta el territorio rodeado más las piezas capturadas (más el komi para blancas). Gana quien más sume.',
    reminders: [
      'Prohibido el suicidio: no puedes poner una piedra sin libertades, salvo que con ello captures.',
      'Regla del ko: no puedes recrear de inmediato la posición anterior del tablero.',
      'Un grupo con dos «ojos» verdaderos es inmatable: ahí está la vida y la muerte del go.',
      'El komi compensa la ventaja de salir primero: sin él, las negras ganan casi siempre.',
    ],
    officialLink: { label: 'Reglas del Go (British Go Association)', url: 'https://www.britgo.org/' },
  },

  backgammon: {
    players: '2 jugadores',
    duration: '15–30 min',
    setup: [
      'Colocad las 15 fichas de cada color en la posición de salida: 2 en el punto 24, 5 en el 13, 3 en el 8 y 5 en el 6 (en espejo para cada jugador).',
      'Preparad los dos dados, el cubilete y el cubo de doblar en el centro.',
    ],
    turn: [
      { name: '1. Tirar', detail: 'Lanzas dos dados y mueves fichas según cada valor; los dobles se juegan cuatro veces.' },
      { name: '2. Avanzar a casa', detail: 'Todas tus fichas van hacia tu cuadrante final; una vez todas dentro, empiezas a retirarlas.' },
    ],
    endCondition:
      'Gana quien retira (bear off) sus 15 fichas primero. Vale doble si el rival no retiró ninguna (gammon) y triple si además le quedan fichas en tu casa o en la barra (backgammon).',
    reminders: [
      'No puedes caer en un punto ocupado por dos o más fichas rivales.',
      'Una ficha sola (blot) golpeada va a la barra y debe reentrar antes de mover ninguna otra.',
      'Debes usar ambos dados si es legalmente posible; con dobles, los cuatro movimientos.',
      'El cubo de doblar sube la apuesta: quien lo rechaza, abandona la partida en el acto.',
    ],
    officialLink: { label: 'Reglas del backgammon (USBGF)', url: 'https://usbgf.org/' },
  },

  hive: {
    players: '2 jugadores',
    duration: '20 min',
    setup: [
      'No hay tablero: se juega sobre la mesa con las fichas hexagonales.',
      'Cada jugador coge sus once fichas (reina, arañas, escarabajos, saltamontes y hormigas).',
      'Se empieza con la mesa vacía; el primer jugador coloca una ficha y el segundo la pega al lado.',
    ],
    turn: [
      { name: '1. Colocar o mover', detail: 'O introduces una ficha nueva de tu reserva, o mueves una ya colocada según su patrón.' },
      { name: '2. La regla de oro', detail: 'La colmena nunca puede partirse: cada movimiento debe dejar todas las fichas conectadas.' },
    ],
    endCondition:
      'Ganas si rodeas por completo la reina rival con seis fichas (de cualquier color). Si ambas quedan rodeadas a la vez, son tablas.',
    reminders: [
      'Tu reina debe estar en la mesa como muy tarde en tu cuarto turno.',
      'No puedes mover ninguna otra ficha hasta haber colocado tu reina.',
      'Al introducir una ficha nueva, no puede tocar a ninguna del color rival.',
      'El escarabajo puede treparse encima de otras fichas y bloquearlas; el saltamontes salta en línea recta.',
    ],
    officialLink: { label: 'Web oficial (Gen42 Games)', url: 'https://www.gen42.com/' },
  },

  onitama: {
    players: '2 jugadores',
    duration: '15–20 min',
    setup: [
      'Montad el tablero de 5×5; cada jugador coloca su maestro en el centro de su fila y cuatro discípulos a los lados.',
      'Barajad las 16 cartas de movimiento; repartid dos a cada jugador y dejad una quinta al lado del tablero.',
    ],
    turn: [
      { name: '1. Mover con una carta', detail: 'Eliges una de tus dos cartas y mueves un peón según el patrón que dibuja.' },
      { name: '2. Rotar la carta', detail: 'La carta usada pasa al rival y coges la que estaba al lado: las cartas circulan entre los dos.' },
    ],
    endCondition:
      'Ganas de dos formas: capturando al maestro rival (Camino de la Piedra) o llevando tu maestro a la casilla central de salida del rival (Camino de la Corriente).',
    reminders: [
      'Solo tienes dos cartas disponibles cada turno: la que juegas se la pasas al rival.',
      'Los patrones se leen desde tu lado del tablero; por eso una carta hace cosas distintas para cada jugador.',
      'Capturar un discípulo es opcional pero no gana: solo el maestro o llegar al trono deciden.',
      'Piensa un turno por delante: la carta que sueltas es la que tu rival tendrá a continuación.',
    ],
    officialLink: { label: 'Web oficial (Arcane Wonders)', url: 'https://www.arcanewonders.com/' },
  },

  santorini: {
    players: '2–4 jugadores',
    duration: '20 min',
    setup: [
      'Montad el tablero de 5×5 y la reserva de bloques de construcción y cúpulas.',
      'Cada jugador coloca sus dos constructores en casillas del tablero.',
      'Opcional pero recomendado: cada jugador coge un poder de dios que rompe una regla.',
    ],
    turn: [
      { name: '1. Mover', detail: 'Mueve uno de tus dos constructores a una casilla adyacente, subiendo como mucho un nivel.' },
      { name: '2. Construir', detail: 'Con ese mismo constructor, añade un bloque (o cúpula en el tercer piso) en una casilla adyacente.' },
    ],
    endCondition:
      'Ganas si mueves un constructor hasta el TERCER piso de un edificio. También ganas si el rival no puede mover ni construir en su turno.',
    reminders: [
      'Puedes subir un solo nivel por movimiento, pero bajar los que quieras.',
      'Una cúpula sobre el tercer piso lo cierra: nadie puede subirse a él.',
      'Debes mover y construir cada turno; si no puedes hacer ambas cosas, pierdes.',
      'Los poderes de dios cambian mucho el juego: acordad si jugáis con ellos antes de empezar.',
    ],
    officialLink: { label: 'Web oficial (Roxley Games)', url: 'https://roxley.com/' },
  },

  quoridor: {
    players: '2–4 jugadores',
    duration: '15 min',
    setup: [
      'Cada jugador coloca su peón en el centro de su fila de salida, en lados opuestos del tablero.',
      'Repartid las vallas por igual (10 a dos jugadores, 5 a cuatro).',
    ],
    turn: [
      { name: 'Mover o vallar', detail: 'En tu turno, o avanzas tu peón una casilla ortogonal, o colocas una valla que estorbe al rival.' },
    ],
    endCondition:
      'Ganas al llevar tu peón a cualquier casilla de la fila de salida del rival (el lado opuesto al tuyo).',
    reminders: [
      'Una valla NUNCA puede encerrar del todo a un jugador: siempre debe quedarle un camino a su meta.',
      'Si dos peones quedan enfrentados, puedes saltar por encima del rival.',
      'Las vallas se agotan: gástalas para ralentizar, no para intentar bloquear (es ilegal).',
      'El juego es una carrera con estorbos: a veces vale más avanzar que vallar.',
    ],
    officialLink: { label: 'Web oficial (Gigamic)', url: 'https://www.gigamic.com/' },
  },

  'star-realms': {
    players: '2 jugadores',
    duration: '20 min',
    setup: [
      'Cada jugador empieza con 50 de autoridad y un mazo idéntico de 10 cartas (exploradores y batidores).',
      'Formad la fila comercial con cinco cartas del mazo central y dejad los exploradores aparte, siempre comprables.',
    ],
    turn: [
      { name: '1. Jugar la mano', detail: 'Juegas tus cartas y sumas su comercio (para comprar) y su combate (para atacar).' },
      { name: '2. Comprar y atacar', detail: 'Adquieres cartas de la fila comercial con tu comercio y golpeas la autoridad rival con tu combate.' },
      { name: '3. Reciclar', detail: 'Descartas lo jugado y robas cinco cartas nuevas para el siguiente turno.' },
    ],
    scoring: [
      { what: 'Autoridad del rival', points: 'Reducirla a 0 gana' },
    ],
    endCondition:
      'Ganas cuando dejas la autoridad del rival en cero a base de combate.',
    reminders: [
      'Las cartas de la misma facción se potencian entre sí: jugar dos activa sus efectos «aliados».',
      'Las bases se quedan en la mesa turno tras turno; las bases guardián hay que destruirlas antes de tocar la autoridad.',
      'El combate no gastado se pierde al final del turno: no se acumula.',
      'Comprar cartas potentes adelgaza tu mazo relativo: piensa en el motor, no solo en el golpe de hoy.',
    ],
    officialLink: { label: 'Web oficial (Wise Wizard Games)', url: 'https://wisewizardgames.com/' },
  },

  'dominion-intrigue': {
    players: '2–4 jugadores',
    duration: '30 min',
    setup: [
      'Elegid 10 tipos de carta de acción para el suministro (Intriga trae sus propias cartas).',
      'Formad las pilas de tesoro (cobre, plata, oro) y de victoria (finca, ducado, provincia) más las maldiciones.',
      'Cada jugador empieza con un mazo de 7 cobres y 3 fincas; baraja y roba cinco.',
    ],
    turn: [
      { name: '1. Acción', detail: 'Juegas una carta de acción (más si alguna te da acciones extra).' },
      { name: '2. Comprar', detail: 'Juegas tus tesoros y compras una carta con el dinero disponible.' },
      { name: '3. Reciclar', detail: 'Descartas lo jugado y la mano, y robas cinco cartas nuevas.' },
    ],
    scoring: [
      { what: 'Cartas de victoria en tu mazo', points: 'Finca 1, ducado 3, provincia 6' },
      { what: 'Maldiciones', points: '−1 punto cada una' },
    ],
    endCondition:
      'La partida acaba al agotarse la pila de provincias o tres pilas cualesquiera del suministro. Se cuentan todas las cartas de victoria del mazo; gana quien más puntos tenga.',
    reminders: [
      'Por defecto tienes UNA acción y UNA compra por turno: las cartas que dan «+acción» o «+compra» son las que encadenan.',
      'Las cartas de victoria no hacen nada mientras juegas: ensucian tu mano, así que cómpralas al final.',
      'En Intriga muchas cartas son a la vez acción y victoria: cuidado con lo que descartas.',
      'Adelgazar el mazo (eliminar cobres y fincas) hace que salgan antes tus cartas buenas.',
    ],
    officialLink: { label: 'Web oficial (Rio Grande Games)', url: 'https://www.riograndegames.com/' },
  },

  'splendor-duel': {
    players: '2 jugadores',
    duration: '30 min',
    setup: [
      'Montad el tablero de fichas de 5×5 y rellenadlo con las gemas de la bolsa.',
      'Formad las tres filas de cartas (niveles 1, 2 y 3) y las cartas de nobles.',
      'Preparad los marcadores de puntos, corona y privilegios.',
    ],
    turn: [
      { name: 'Elige una acción', detail: 'O coges tres fichas en línea del tablero, o compras una carta, o rellenas y coges una ficha perla, o reservas una carta.' },
      { name: 'Comprar cartas', detail: 'Pagas con tus fichas y bonos; algunas cartas dan puntos, coronas o gemas permanentes.' },
    ],
    scoring: [
      { what: 'Puntos de prestigio', points: 'Ganar con 20 en total' },
      { what: 'Una carta con 10 puntos', points: 'Victoria inmediata' },
      { what: 'Coronas (10 en total)', points: 'Victoria inmediata' },
    ],
    endCondition:
      'Ganas al cumplir una de las tres metas al final de tu turno: 20 puntos totales, 10 puntos de una sola color de carta, o 10 coronas.',
    reminders: [
      'Coger fichas es en línea recta (fila, columna o diagonal) de hasta tres del tablero.',
      'Las perlas y el comodín (oro) valen para pagar cualquier gema, pero reservar una carta te da un privilegio.',
      'Hay tres formas distintas de ganar a la vez: vigila las tres en tu rival, no solo los puntos.',
      'Los privilegios dejan coger una ficha extra fuera de turno: guárdalos para el momento clave.',
    ],
    officialLink: { label: 'Web oficial (Space Cowboys)', url: 'https://www.spacecowboys.fr/' },
  },
}
