/**
 * Preparación de las portadas de los juegos antes de subirlas.
 *
 * Las fotos que salen de un móvil pesan varios megas y no tiene ningún sentido
 * guardarlas así para pintarlas en una casilla de 160 px. Aquí se recortan a un
 * cuadrado centrado, se bajan a 512 px y se pasan a webp, que es lo que acepta el
 * bucket. Todo en el navegador: al servidor solo llega el resultado.
 */

/** Más de esto ni se intenta procesar: es una foto sin recortar o un fichero raro. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export const IMAGE_SIZE = 512

export class ImageError extends Error {}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Devuelve un `Blob` cuadrado de `size` píxeles, en webp si el navegador puede.
 * Lanza `ImageError` con un mensaje que se puede enseñar tal cual en pantalla.
 */
export async function resizeToWebp(file: File | Blob, size = IMAGE_SIZE): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new ImageError('Eso no es una imagen.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageError('La imagen pesa más de 8 MB. Prueba con una más pequeña.')
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new ImageError('No se ha podido leer la imagen.')
  }

  try {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext('2d')
    if (!context) throw new ImageError('Este navegador no puede procesar la imagen.')

    // Recorte cuadrado centrado: se queda con el lado corto de la foto original.
    const side = Math.min(bitmap.width, bitmap.height)
    const sourceX = (bitmap.width - side) / 2
    const sourceY = (bitmap.height - side) / 2

    context.drawImage(bitmap, sourceX, sourceY, side, side, 0, 0, size, size)

    // Safari antiguo no exporta webp: si vuelve otro tipo, se usa JPEG.
    const webp = await toBlob(canvas, 'image/webp', 0.82)
    if (webp && webp.type === 'image/webp') return webp

    const jpeg = await toBlob(canvas, 'image/jpeg', 0.85)
    if (jpeg) return jpeg

    throw new ImageError('No se ha podido convertir la imagen.')
  } finally {
    bitmap.close()
  }
}
