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
