/**
 * Las tres decisiones de la descarga de originales que no necesitan red.
 *
 * Los tres fallos que cubren son los que solo se ven cuando ya llevas diez mil ficheros
 * en disco: guardar una página de error como si fuera un JPEG, dejar una portada vieja
 * porque el manifiesto dice que está, y volver a bajarse las 17.944 porque el nombre del
 * fichero se calculó de otra manera.
 */
import { describe, expect, it } from 'vitest'
import { emptyManifest, extensionFor, looksLikeImage, pendingOf, type Manifest } from './originals'

const BGG_JPG =
  'https://cf.geekdo-images.com/SoU8p28Sk1s8MSvoM4N8pQ__original/img/g4S18szTdrXCdIwVKzMKrZrYAcM=/0x0/filters:format(jpeg)/pic6293412.jpg'
const BGG_PNG =
  'https://cf.geekdo-images.com/aPSHJO0d0XOpQR5X-wJonw__original/img/AkbtYVc6xXJF3c9EUrakklcclKw=/0x0/filters:format(png)/pic6973671.png'

describe('extensionFor', () => {
  it('saca la extensión de las URLs de BGG', () => {
    expect(extensionFor(BGG_JPG, 'image/jpeg')).toBe('jpg')
    expect(extensionFor(BGG_PNG, 'image/png')).toBe('png')
  })

  it('normaliza jpeg a jpg para que un juego no acabe con dos ficheros', () => {
    expect(extensionFor('https://x/pic.jpeg', null)).toBe('jpg')
    expect(extensionFor('https://x/pic.JPG', null)).toBe('jpg')
  })

  it('cae al tipo de la respuesta cuando la URL no dice nada', () => {
    expect(extensionFor('https://x/imagen', 'image/webp')).toBe('webp')
    expect(extensionFor('https://x/imagen', 'image/jpeg; charset=binary')).toBe('jpg')
  })

  it('no pierde la descarga aunque no sepa qué es', () => {
    expect(extensionFor('https://x/imagen', null)).toBe('bin')
    expect(extensionFor('https://x/imagen', 'text/html')).toBe('bin')
  })

  it('ignora la cadena de consulta y el ancla', () => {
    expect(extensionFor('https://x/pic.png?v=2', null)).toBe('png')
    expect(extensionFor('https://x/pic.png#top', null)).toBe('png')
  })
})

describe('looksLikeImage', () => {
  it('reconoce las firmas que sirve BGG', () => {
    expect(looksLikeImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe(true)
    expect(looksLikeImage(Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex'))).toBe(true)
    expect(looksLikeImage(Buffer.from('GIF89a......', 'ascii'))).toBe(true)
    expect(looksLikeImage(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]))).toBe(true)
  })

  it('rechaza lo que llega con 200 y no es una imagen', () => {
    expect(looksLikeImage(Buffer.from('<!DOCTYPE html><html>Rate limit'))).toBe(false)
    expect(looksLikeImage(Buffer.from('{"error":"nope"}'))).toBe(false)
  })

  it('rechaza una respuesta vacía o truncada', () => {
    expect(looksLikeImage(Buffer.alloc(0))).toBe(false)
    expect(looksLikeImage(Buffer.from([0xff, 0xd8, 0xff]))).toBe(false)
  })
})

describe('pendingOf', () => {
  const rows = [
    { slug: 'azul', cover_url: BGG_PNG },
    { slug: 'ark-nova', cover_url: BGG_JPG },
  ]

  /** Un fichero que de verdad existe, para el caso «ya está bajada». */
  const dir = 'scripts'
  const done = (url: string): Manifest => ({
    updatedAt: '',
    covers: { azul: { url, file: 'fetch-originals.ts', bytes: 1, sha256: '', at: '' } },
  })

  it('con el manifiesto vacío, todas', () => {
    expect(pendingOf(rows, emptyManifest(), false, dir)).toHaveLength(2)
  })

  it('salta la que ya está bajada', () => {
    const pending = pendingOf(rows, done(BGG_PNG), false, dir)
    expect(pending.map((row) => row.slug)).toEqual(['ark-nova'])
  })

  it('vuelve a bajarla si BGG le cambió la imagen', () => {
    const pending = pendingOf(rows, done('https://cf.geekdo-images.com/otra.png'), false, dir)
    expect(pending.map((row) => row.slug)).toEqual(['azul', 'ark-nova'])
  })

  it('vuelve a bajarla si el fichero ya no está en disco', () => {
    const manifest = done(BGG_PNG)
    manifest.covers.azul.file = 'no-existe.png'
    expect(pendingOf(rows, manifest, false, dir)).toHaveLength(2)
  })

  it('con --force, todas aunque estén', () => {
    expect(pendingOf(rows, done(BGG_PNG), true, dir)).toHaveLength(2)
  })
})
