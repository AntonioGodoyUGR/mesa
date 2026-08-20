/**
 * Lee variables de entorno del proceso o del `.env` del proyecto, sin dependencias.
 *
 * Los scripts no pasan por Vite, así que no heredan su carga de `.env`: sin esto habría
 * que exportar las variables a mano antes de cada `npm run`. Y son variables que NO
 * llevan el prefijo `VITE_` a propósito —el token de BGG, la clave de servicio de
 * Supabase—, porque son credenciales de servidor y no pueden acabar en el bundle: el
 * prefijo es justo lo que decide si una variable viaja al navegador.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '..', '..', '.env')

export function readEnv(name: string): string | undefined {
  const fromProcess = process.env[name]
  if (fromProcess) return fromProcess.trim()

  if (!existsSync(envPath)) return undefined
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const [key, ...rest] = line.split('=')
    // El valor puede llevar `=` dentro (una clave en base64), así que se vuelve a unir.
    if (key.trim() === name) return rest.join('=').trim().replace(/^["']|["']$/g, '')
  }
  return undefined
}

/** Como `readEnv`, pero se planta: para lo que no tiene alternativa posible. */
export function requireEnv(name: string): string {
  const value = readEnv(name)
  if (!value) {
    throw new Error(`Falta ${name} en el entorno o en el fichero .env (ver .env.example)`)
  }
  return value
}
