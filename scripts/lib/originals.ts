/**
 * Lo que se puede comprobar sin red de la descarga de carátulas originales.
 *
 * Vive aparte de `scripts/fetch-originals.ts` por la misma razón que `bgg-games.ts` vive
 * aparte de la ingesta: el guion es media hora de red y disco, y nada de eso se puede
 * probar. Esto sí — decidir qué extensión le toca a un fichero, distinguir una imagen de
 * una página de error que llega con `200 OK`, y saber qué falta por bajar— y es justo
 * donde están los fallos que no se ven hasta las diez mil descargas.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export interface CoverRow {
  slug: string
  cover_url: string
}

export interface CoverFile {
  /** La URL de la que salió. Si cambia, la copia está vieja y se vuelve a bajar. */
  url: string
  /** Nombre del fichero dentro de `scripts/data/covers-original/`. */
  file: string
  bytes: number
  sha256: string
  at: string
}

export interface Manifest {
  updatedAt: string
  covers: Record<string, CoverFile>
}

/**
 * La extensión que le toca al fichero. Manda la URL, que en BGG siempre acaba en `.jpg`
 * o `.png`; el tipo de la respuesta es el plan B, y `bin` el último recurso: más vale un
 * fichero con extensión rara que perder la descarga.
 */
export function extensionFor(url: string, contentType: string | null): string {
  const fromUrl = url.split('?')[0].split('#')[0].match(/\.([a-z0-9]{3,4})$/i)
  if (fromUrl) {
    const found = fromUrl[1].toLowerCase()
    return found === 'jpeg' ? 'jpg' : found
  }

  const type = (contentType ?? '').split(';')[0].trim().toLowerCase()
  if (type === 'image/jpeg') return 'jpg'
  if (type.startsWith('image/')) return type.slice('image/'.length)
  return 'bin'
}

/**
 * ¿Esto que ha llegado es una imagen? Se mira la firma de los primeros bytes y no la
 * cabecera, porque el fallo que importa es el que viene con `200 OK`: una página de error
 * o un aviso de límite alcanzado se guardarían tan contentos como un JPEG, y no se notaría
 * hasta intentar redimensionar las 17.944.
 */
export function looksLikeImage(buffer: Buffer): boolean {
  if (buffer.length < 12) return false
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true
  if (buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return true
  if (buffer.subarray(0, 3).toString('ascii') === 'GIF') return true
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return true
  }
  return false
}

/**
 * Las que quedan por bajar. Una portada está hecha si el manifiesto la conoce, el fichero
 * sigue en disco y la URL no ha cambiado: si BGG le cambia la imagen a un juego, la fila
 * trae otra URL y esa portada vuelve a la cola sola. Que se compruebe el disco y no solo
 * el manifiesto importa: borrar la carpeta y relanzar tiene que volver a bajarlo todo.
 */
export function pendingOf(
  rows: CoverRow[],
  manifest: Manifest,
  force: boolean,
  dir: string,
): CoverRow[] {
  if (force) return rows
  return rows.filter((row) => {
    const done = manifest.covers[row.slug]
    return !done || done.url !== row.cover_url || !existsSync(join(dir, done.file))
  })
}

/** Un manifiesto vacío, para empezar de cero. */
export function emptyManifest(): Manifest {
  return { updatedAt: new Date().toISOString(), covers: {} }
}
