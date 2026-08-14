/**
 * Genera los iconos PNG de la PWA sin depender de ninguna librería de imagen.
 *
 * Dibuja la diana de «Mesa» a pelo (círculos con antialiasing) y la codifica
 * como PNG con `zlib`. Fondo a sangre para que valga como icono `maskable`:
 * la diana ocupa solo el 60 % central, dentro de la zona segura.
 *
 *   node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// Los mismos dos colores que el favicon: azul de marca y el cian del fondo claro.
const BG = [0x14, 0x61, 0xd1]
const FG = [0xd5, 0xf2, 0xff]

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/** Cobertura del pixel (0–1) para un borde a distancia `d` del radio `r`. */
function coverage(d, r) {
  return Math.min(1, Math.max(0, r + 0.5 - d))
}

/** Cobertura de un anillo de radio `r` y grosor `w`. */
function ring(d, r, w) {
  return Math.min(coverage(d, r + w / 2), 1 - coverage(d, r - w / 2))
}

function drawIcon(size) {
  const center = size / 2
  const outer = size * 0.3
  const inner = size * 0.165
  const stroke = size * 0.078
  const dot = size * 0.055

  // Cada scanline lleva delante su byte de filtro (0 = sin filtro).
  const raw = Buffer.alloc(size * (size * 4 + 1))
  let offset = 0

  for (let y = 0; y < size; y += 1) {
    raw[offset] = 0
    offset += 1

    for (let x = 0; x < size; x += 1) {
      const d = Math.hypot(x + 0.5 - center, y + 0.5 - center)
      const alpha = Math.min(
        1,
        ring(d, outer, stroke) + ring(d, inner, stroke) + coverage(d, dot),
      )

      for (let channel = 0; channel < 3; channel += 1) {
        raw[offset + channel] = Math.round(BG[channel] + (FG[channel] - BG[channel]) * alpha)
      }
      raw[offset + 3] = 255
      offset += 4
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bits por canal
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(OUT_DIR, { recursive: true })

for (const [name, size] of [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  const png = drawIcon(size)
  writeFileSync(join(OUT_DIR, name), png)
  console.log(`${name.padEnd(22)} ${size}×${size}  ${(png.length / 1024).toFixed(1)} kB`)
}
