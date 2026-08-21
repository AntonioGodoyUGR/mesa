/**
 * Los juegos escritos a mano, uno por fichero en `definitions/`.
 *
 * Son los que traen hoja de puntuación con los conceptos del juego («pueblos»,
 * «ciudades», «camino más largo») y chuleta de reglas. El resto del catálogo
 * —cientos de títulos con hoja genérica— sale de `catalog.ts`.
 *
 * Para añadir uno: crea su fichero en `definitions/`, impórtalo aquí, añádelo a la
 * lista y borra su fila de `catalog.data.ts` si la tenía. Después ejecuta
 * `npm run seed:games` para reflejarlo en la base de datos.
 *
 * Vive aparte de `registry.ts` para que `scripts/fetch-covers.ts` pueda mirar qué
 * portadas están ya cogidas sin arrastrar `covers.generated.ts`, que es justo el
 * fichero que ese script escribe.
 */
import type { GameDefinition } from './types'
// Clásicos
import { monopoly } from './definitions/monopoly'
import { trivialPursuit } from './definitions/trivial-pursuit'
import { scrabble } from './definitions/scrabble'
import { uno } from './definitions/uno'
import { rummikub } from './definitions/rummikub'
import { domino } from './definitions/domino'
import { parchis } from './definitions/parchis'
// Modernos
import { catan } from './definitions/catan'
import { carcassonne } from './definitions/carcassonne'
import { camelUp } from './definitions/camel-up'
import { aventurerosAlTren } from './definitions/aventureros-al-tren'
import { azul } from './definitions/azul'
import { splendor } from './definitions/splendor'
import { kingOfTokyo } from './definitions/king-of-tokyo'
import { dixit } from './definitions/dixit'
import { codigoSecreto } from './definitions/codigo-secreto'
import { patchwork } from './definitions/patchwork'
import { sevenWonders } from './definitions/7-wonders'
import { sevenWondersDuel } from './definitions/7-wonders-duel'
import { wingspan } from './definitions/wingspan'
import { cascadia } from './definitions/cascadia'
import { everdell } from './definitions/everdell'
import { dominion } from './definitions/dominion'
import { terraformingMars } from './definitions/terraforming-mars'
import { tzolkin } from './definitions/tzolkin'
import { resistanceAvalon } from './definitions/resistance-avalon'
import { castlesOfBurgundy } from './definitions/castles-of-burgundy'
import { viticulture } from './definitions/viticulture'
import { lostRuinsArnak } from './definitions/lost-ruins-arnak'
import { crokinole } from './definitions/crokinole'
import { brassBirmingham } from './definitions/brass-birmingham'
import { arkNova } from './definitions/ark-nova'
import { duneImperium } from './definitions/dune-imperium'
import { twilightStruggle } from './definitions/twilight-struggle'

export const CURATED_GAMES: GameDefinition[] = [
  // Clásicos
  monopoly,
  trivialPursuit,
  scrabble,
  uno,
  rummikub,
  domino,
  parchis,
  // Modernos
  catan,
  carcassonne,
  camelUp,
  aventurerosAlTren,
  azul,
  splendor,
  kingOfTokyo,
  dixit,
  codigoSecreto,
  patchwork,
  sevenWonders,
  sevenWondersDuel,
  wingspan,
  cascadia,
  everdell,
  dominion,
  terraformingMars,
  tzolkin,
  resistanceAvalon,
  castlesOfBurgundy,
  viticulture,
  lostRuinsArnak,
  crokinole,
  brassBirmingham,
  arkNova,
  duneImperium,
  twilightStruggle,
]
