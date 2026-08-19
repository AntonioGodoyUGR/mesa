/**
 * Borrado de las cachés del service worker que ya no usa nadie.
 *
 * Las portadas se guardan con `CacheFirst`, así que una portada que cambia de
 * contenido sin cambiar de nombre se quedaba en el móvil durante meses. El arreglo
 * es versionar el nombre de la caché en `vite.config.ts` (`portadas` → `portadas-v2`),
 * pero la vieja sigue ocupando sitio: workbox solo limpia lo que él mismo precarga.
 * Aquí se borran a mano, una vez, al arrancar la app.
 */

/** Nombres de caché que dejó alguna versión anterior y ya no se consultan. */
const STALE_CACHES = ['portadas']

export function dropStaleCaches(): void {
  if (typeof globalThis.caches === 'undefined') return
  for (const name of STALE_CACHES) {
    void globalThis.caches.delete(name).catch(() => {})
  }
}
