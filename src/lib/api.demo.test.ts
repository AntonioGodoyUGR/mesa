import { describe, expect, it } from 'vitest'
import { demoApi } from './api.demo'

/**
 * `getGameStats` es la contrapartida en memoria de `game_global_stats`, la
 * función de Postgres que cuenta las partidas de todos los grupos. Aquí solo se
 * puede comprobar la de mentira, pero es la que ven los tests y quien abre la
 * app sin haber configurado Supabase, así que conviene que cuadre.
 */
describe('demoApi.getGameStats', () => {
  it('agrega las partidas sembradas de un juego', async () => {
    // La demostración trae dos partidas de Catán, de tres jugadores cada una,
    // en las que participan cuatro personas distintas.
    const stats = await demoApi.getGameStats('catan')

    expect(stats.gameSlug).toBe('catan')
    expect(stats.matches).toBe(2)
    expect(stats.groups).toBe(1)
    expect(stats.players).toBe(4)
    expect(stats.averagePlayers).toBe(3)
    expect(stats.lastPlayedAt).not.toBeNull()
  })

  it('el récord es el total más alto cuando gana quien más suma', async () => {
    const stats = await demoApi.getGameStats('carcassonne')

    // La única partida sembrada la ganó Ana con 91 frente a 74.
    expect(stats.matches).toBe(1)
    expect(stats.bestTotal).toBe(91)
    expect(stats.averageTotal).toBe(82.5)
  })

  it('un juego que nadie ha jugado no inventa números', async () => {
    const stats = await demoApi.getGameStats('wingspan')

    expect(stats.matches).toBe(0)
    expect(stats.groups).toBe(0)
    expect(stats.players).toBe(0)
    expect(stats.averagePlayers).toBeNull()
    expect(stats.averageTotal).toBeNull()
    expect(stats.bestTotal).toBeNull()
    expect(stats.lastPlayedAt).toBeNull()
  })
})

/**
 * `searchCatalog` y compañía son la contrapartida en memoria de `search_catalog`, la
 * función de Postgres sobre la que busca la app cuando hay Supabase detrás. Aquí solo
 * se puede probar la de mentira; lo que se comprueba es el contrato que las dos
 * cumplen, porque la interfaz no distingue cuál tiene delante.
 */
describe('demoApi.searchCatalog', () => {
  it('sin nada puesto devuelve la primera tanda del catálogo', async () => {
    const games = await demoApi.searchCatalog({})

    // Una tanda son 24, y los escritos a mano van primero.
    expect(games).toHaveLength(24)
    expect(games[0].slug).toBe('monopoly')
  })

  it('busca sin tildes y sin mayúsculas, como hará Postgres', async () => {
    const games = await demoApi.searchCatalog({ query: 'CATAN' })

    expect(games.map((game) => game.slug)).toContain('catan')
  })

  it('los filtros se cruzan igual que en la pantalla', async () => {
    // Camel Up dura 20–30 min y admite de 3 a 8; Patchwork es corto pero solo para dos.
    const games = await demoApi.searchCatalog({ durations: ['short'], players: 3 })
    const slugs = games.map((game) => game.slug)

    expect(slugs).toContain('camel-up')
    expect(slugs).not.toContain('patchwork')
  })

  it('pagina por tandas y no repite juegos entre una y la siguiente', async () => {
    const first = await demoApi.searchCatalog({ limit: 10 })
    const second = await demoApi.searchCatalog({ limit: 10, offset: 10 })

    expect(first).toHaveLength(10)
    expect(second).toHaveLength(10)
    const repetidos = first.filter((game) =>
      second.some((other) => other.slug === game.slug),
    )
    expect(repetidos).toEqual([])
  })

  it('con slugs concretos manda la lista y el resto de criterios sobra', async () => {
    const games = await demoApi.searchCatalog({
      slugs: ['catan', 'wingspan'],
      // Ninguno de los dos es corto: si el filtro contara, no saldría ninguno.
      durations: ['short'],
    })

    expect(games.map((game) => game.slug).sort()).toEqual(['catan', 'wingspan'])
  })
})

describe('demoApi.getGameBySlug', () => {
  it('un juego escrito a mano llega con su chuleta', async () => {
    const game = await demoApi.getGameBySlug('catan')

    expect(game?.name).toBe('Catán')
    expect(game?.rules?.setup?.length).toBeGreaterThan(0)
  })

  // El catálogo amplio ya no viaja en la app: vive en Postgres y llega por
  // `search_catalog`. En modo demostración —que es lo que hay sin credenciales y sin
  // red— solo existen los 24 escritos a mano y los que se invente el grupo, así que un
  // juego de la cola larga no está. Es la contrapartida aceptada de buscar en servidor.
  it('un juego que solo vive en el catálogo remoto no está', async () => {
    expect(await demoApi.getGameBySlug('pandemic')).toBeNull()
  })

  it('un slug que no existe devuelve null, no revienta', async () => {
    expect(await demoApi.getGameBySlug('no-existe')).toBeNull()
  })
})

describe('demoApi.getGamesBySlugs', () => {
  it('resuelve varios de una vez y no pide nada con la lista vacía', async () => {
    const games = await demoApi.getGamesBySlugs(['wingspan', 'azul'])

    expect(games.map((game) => game.slug).sort()).toEqual(['azul', 'wingspan'])
    expect(await demoApi.getGamesBySlugs([])).toEqual([])
  })
})
