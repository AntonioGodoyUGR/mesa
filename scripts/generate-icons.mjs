/**
 * Genera los iconos PNG de la PWA a partir de la misma marca que el logotipo:
 * el meeple que hace de «A» en «Table Tracker».
 *
 * Se dibuja aquí en vez de leer `public/favicon.svg` porque los dos quieren cosas
 * distintas: el favicon lleva su recuadro con borde, y estos van a sangre y con
 * el meeple al 55 % para que Android pueda recortarlos en círculo sin comerse
 * nada (`purpose: maskable`).
 *
 *   npm run icons
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// Los mismos dos colores que el favicon: azul de marca y el cian del fondo claro.
const BG = '#1461d1'
const FG = '#d5f2ff'

/** El meeple del logotipo, centrado y dentro de la zona segura del recorte. */
function markSvg(size) {
  const scale = 0.55

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${BG}" />
  <g fill="${FG}" transform="translate(32 33) scale(${scale}) translate(-32 -32)">
    <circle cx="32" cy="12" r="11.5" />
    <path d="M21 23H43L47 30H63V45L47 42L57 64H39L32 52L25 64H7L17 42L1 45V30H17Z" />
  </g>
</svg>`
}

mkdirSync(OUT_DIR, { recursive: true })

for (const [name, size] of [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const png = await sharp(Buffer.from(markSvg(size))).png({ compressionLevel: 9 }).toBuffer()
  writeFileSync(join(OUT_DIR, name), png)
  console.log(`${name.padEnd(22)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} kB`)
}
