/**
 * Lector de CSV mínimo para los volcados de BoardGameGeek.
 *
 * Los ficheros de `scripts/data/` pesan decenas de MB, así que se leen línea a línea
 * en vez de cargarlos enteros en memoria. Se admiten campos entrecomillados con comas,
 * comillas dobladas (`""`) y saltos de línea dentro del campo.
 */
import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

/** Parte una línea de CSV en campos. Devuelve `null` si la línea queda a medias. */
function splitLine(line: string): string[] | null {
  const fields: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (quoted) {
      if (char !== '"') {
        current += char
      } else if (line[index + 1] === '"') {
        current += '"'
        index += 1
      } else {
        quoted = false
      }
      continue
    }
    if (char === '"') quoted = true
    else if (char === ',') {
      fields.push(current)
      current = ''
    } else current += char
  }

  // Comilla sin cerrar: el campo sigue en la línea siguiente.
  if (quoted) return null
  fields.push(current)
  return fields
}

/**
 * Recorre un CSV con cabecera y llama a `onRow` con cada fila como objeto.
 * Devuelve cuántas filas se han leído.
 */
export async function readCsv(
  path: string,
  onRow: (row: Record<string, string>) => void,
): Promise<number> {
  const input = createInterface({
    input: createReadStream(path, 'utf8'),
    crlfDelay: Infinity,
  })

  let header: string[] | null = null
  let pending = ''
  let count = 0

  for await (const rawLine of input) {
    const line = pending ? `${pending}\n${rawLine}` : rawLine.replace(/^﻿/, '')
    const fields = splitLine(line)
    if (fields === null) {
      pending = line
      continue
    }
    pending = ''

    if (!header) {
      header = fields.map((field) => field.trim())
      continue
    }

    const row: Record<string, string> = {}
    header.forEach((key, index) => {
      row[key] = fields[index] ?? ''
    })
    onRow(row)
    count += 1
  }

  return count
}

/** Primera columna de la cabecera que encaje con alguno de los nombres dados. */
export function pickColumn(header: string[], candidates: string[]): string | undefined {
  const lower = new Map(header.map((name) => [name.toLowerCase(), name]))
  for (const candidate of candidates) {
    const hit = lower.get(candidate.toLowerCase())
    if (hit) return hit
  }
  return undefined
}
