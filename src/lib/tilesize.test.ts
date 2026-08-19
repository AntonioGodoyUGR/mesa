/**
 * El tamaño de la rejilla se guarda en el navegador, así que lo que hay que defender
 * es la lectura: que un valor viejo, ajeno o inventado en `localStorage` no deje la
 * pantalla sin rejilla, y que las clases que salen de aquí sean las que existen en
 * `index.css`.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  TILE_SIZES,
  getStoredTileSize,
  setStoredTileSize,
  tileGridClass,
  type TileSize,
} from './tilesize'

describe('tilesize', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('empieza en mediana cuando no hay nada guardado', () => {
    expect(getStoredTileSize()).toBe('medium')
  })

  it('cae en mediana si lo guardado no es un tamaño', () => {
    localStorage.setItem('mesa.tilesize', 'gigante')
    expect(getStoredTileSize()).toBe('medium')
  })

  it('recupera lo que se eligió', () => {
    for (const size of TILE_SIZES) {
      setStoredTileSize(size.id)
      expect(getStoredTileSize()).toBe(size.id)
    }
  })

  it('da una clase de rejilla por tamaño, y la grande no lleva sufijo', () => {
    expect(tileGridClass('large')).toBe('game-grid')
    expect(tileGridClass('medium')).toBe('game-grid game-grid-md')
    expect(tileGridClass('small')).toBe('game-grid game-grid-sm')
  })

  it('los tres tamaños suben de columnas y no se repiten', () => {
    const columns = TILE_SIZES.map((size) => size.columns)
    expect(columns).toEqual([2, 3, 4])

    const ids = TILE_SIZES.map((size) => size.id)
    expect(new Set<TileSize>(ids).size).toBe(ids.length)
  })
})
