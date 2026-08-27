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
import { pandemicLegacySeason1 } from './definitions/pandemic-legacy-season-1'
import { gloomhaven } from './definitions/gloomhaven'
import { twilightImperiumFourthEdition } from './definitions/twilight-imperium-fourth-edition'
import { warOfTheRing } from './definitions/war-of-the-ring'
import { starWarsRebellion } from './definitions/star-wars-rebellion'
import { spiritIsland } from './definitions/spirit-island'
import { gloomhavenJawsOfTheLion } from './definitions/gloomhaven-jaws-of-the-lion'
import { gaiaProject } from './definitions/gaia-project'
import { throughTheAges } from './definitions/through-the-ages'
import { lordOfTheRingsDuelForMiddleEarth } from './definitions/lord-of-the-rings-duel-for-middle-earth'
import { frosthaven } from './definitions/frosthaven'
import { greatWesternTrail } from './definitions/great-western-trail'
import { brassLancashire } from './definitions/brass-lancashire'
// Top-100 BGG (oleada Gustavo)
import { duneImperiumUprising } from './definitions/dune-imperium-uprising'
import { seti } from './definitions/seti'
import { slayTheSpire } from './definitions/slay-the-spire'
import { eclipseSecondDawn } from './definitions/eclipse-second-dawn'
import { nemesis } from './definitions/nemesis'
import { scythe } from './definitions/scythe'
import { aFeastForOdin } from './definitions/a-feast-for-odin'
import { clankLegacy } from './definitions/clank-legacy'
import { concordia } from './definitions/concordia'
import { greatWesternTrailSecondEdition } from './definitions/great-western-trail-second-edition'
import { skyTeam } from './definitions/sky-team'
import { arkhamHorrorLcg } from './definitions/arkham-horror-lcg'
import { root } from './definitions/root'
import { orleans } from './definitions/orleans'
import { terraMystica } from './definitions/terra-mystica'
import { tooManyBones } from './definitions/too-many-bones'
import { mageKnight } from './definitions/mage-knight'
import { barrage } from './definitions/barrage'
import { hegemony } from './definitions/hegemony'
import { kanbanEv } from './definitions/kanban-ev'
import { theCrewMissionDeepSea } from './definitions/the-crew-mission-deep-sea'
import { heatPedalToTheMetal } from './definitions/heat-pedal-to-the-metal'
import { clankCatacombs } from './definitions/clank-catacombs'
import { marvelChampions } from './definitions/marvel-champions'
import { ticketToRideLegacyLegendsWest } from './definitions/ticket-to-ride-legacy-legends-west'
import { foodChainMagnate } from './definitions/food-chain-magnate'
import { underwaterCities } from './definitions/underwater-cities'
import { harmonies } from './definitions/harmonies'
import { cthulhuDeathMayDie } from './definitions/cthulhu-death-may-die'
import { paxPamir } from './definitions/pax-pamir'
import { ageOfInnovation } from './definitions/age-of-innovation'
import { puertoRico } from './definitions/puerto-rico'
import { onMars } from './definitions/on-mars'
import { pandemicLegacySeason0 } from './definitions/pandemic-legacy-0'
import { anachrony } from './definitions/anachrony'
import { caverna } from './definitions/caverna'
import { oathsworn } from './definitions/oathsworn'
import { sleepingGods } from './definitions/sleeping-gods'
import { agricola } from './definitions/agricola'
import { bloodOnTheClocktower } from './definitions/blood-on-the-clocktower'
import { bloodRage } from './definitions/blood-rage'
import { obsession } from './definitions/obsession'
import { grandAustriaHotel } from './definitions/grand-austria-hotel'
import { lisboa } from './definitions/lisboa'
import { endeavorDeepSea } from './definitions/endeavor-deep-sea'
import { theWhiteCastle } from './definitions/the-white-castle'

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
  pandemicLegacySeason1,
  gloomhaven,
  twilightImperiumFourthEdition,
  warOfTheRing,
  starWarsRebellion,
  spiritIsland,
  gloomhavenJawsOfTheLion,
  gaiaProject,
  throughTheAges,
  lordOfTheRingsDuelForMiddleEarth,
  frosthaven,
  greatWesternTrail,
  brassLancashire,
  // Top-100 BGG (oleada Gustavo)
  duneImperiumUprising,
  seti,
  slayTheSpire,
  eclipseSecondDawn,
  nemesis,
  scythe,
  aFeastForOdin,
  clankLegacy,
  concordia,
  greatWesternTrailSecondEdition,
  skyTeam,
  arkhamHorrorLcg,
  root,
  orleans,
  terraMystica,
  tooManyBones,
  mageKnight,
  barrage,
  hegemony,
  kanbanEv,
  theCrewMissionDeepSea,
  heatPedalToTheMetal,
  clankCatacombs,
  marvelChampions,
  ticketToRideLegacyLegendsWest,
  foodChainMagnate,
  underwaterCities,
  harmonies,
  cthulhuDeathMayDie,
  paxPamir,
  ageOfInnovation,
  puertoRico,
  onMars,
  pandemicLegacySeason0,
  anachrony,
  caverna,
  oathsworn,
  agricola,
  bloodOnTheClocktower,
  bloodRage,
  obsession,
  grandAustriaHotel,
  lisboa,
  endeavorDeepSea,
  theWhiteCastle,
  sleepingGods,
]
