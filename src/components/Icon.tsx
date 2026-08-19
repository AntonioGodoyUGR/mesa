/**
 * Los iconos dibujados de la interfaz: la barra de secciones y el mando de
 * tamaño de la rejilla.
 *
 * Los de la barra eran emojis (🎲 📋 👥 ✨) y traían dos problemas que no se
 * arreglan con CSS: cada sistema los dibuja a su manera —en Windows salen
 * planos y en el móvil de al lado a todo color— y, al ser una imagen, no
 * seguían el color de la sección activa: la etiqueta se ponía azul y el dibujo
 * de encima se quedaba igual.
 *
 * Estos son trazo de 2 px sobre una rejilla de 24 en `currentColor`, del
 * mismo grosor que el borde de las tarjetas, así que hablan el idioma del
 * resto de la aplicación. Las tres rejillas son la excepción: a 18 px un
 * contorno de 2 px sobre una barra de 3 px de ancho se cierra sobre sí mismo,
 * así que van macizas, como los puntos del dado.
 *
 * Decorativos siempre: quien los usa pone el nombre debajo o un `aria-label`
 * al lado, así que aquí `aria-hidden`.
 */

import type { ReactNode } from 'react'

export type IconName =
  | 'dado'
  | 'lista'
  | 'jugadores'
  | 'chispa'
  | 'rejilla-2'
  | 'rejilla-3'
  | 'rejilla-4'

const PATHS: Record<IconName, ReactNode> = {
  dado: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="8.75" cy="15.25" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="15.25" cy="8.75" r="1.35" fill="currentColor" stroke="none" />
    </>
  ),
  lista: (
    <>
      <rect x="3.5" y="4.5" width="17" height="16" rx="4" />
      <path d="M8.5 2.75v3.5M15.5 2.75v3.5M7.75 11.5h8.5M7.75 15.5h5.5" />
    </>
  ),
  jugadores: (
    <>
      <circle cx="9.25" cy="8.5" r="3.5" />
      <path d="M3.25 19.5c0-3.1 2.7-5 6-5s6 1.9 6 5" />
      <path d="M16.25 5.6a3.5 3.5 0 0 1 0 6.8M17.5 14.9c2.15.5 3.75 2.15 3.75 4.6" />
    </>
  ),
  chispa: (
    <>
      <path d="M12 3.25c0 3.9 2.6 6.5 6.5 6.5-3.9 0-6.5 2.6-6.5 6.5 0-3.9-2.6-6.5-6.5-6.5 3.9 0 6.5-2.6 6.5-6.5Z" />
      <path d="M6.5 16.75c0 1.9 1.15 3 3 3-1.85 0-3 1.15-3 3 0-1.85-1.15-3-3-3 1.85 0 3-1.1 3-3Z" />
    </>
  ),
  // Tantas barras como columnas tendrá la rejilla: es lo único que cambia de
  // verdad al mover el mando, y a este tamaño se cuenta de un vistazo.
  'rejilla-2': (
    <>
      <rect x="3.5" y="3.5" width="7.5" height="17" rx="2" fill="currentColor" stroke="none" />
      <rect x="13" y="3.5" width="7.5" height="17" rx="2" fill="currentColor" stroke="none" />
    </>
  ),
  'rejilla-3': (
    <>
      <rect x="3.5" y="3.5" width="4.7" height="17" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="9.65" y="3.5" width="4.7" height="17" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="15.8" y="3.5" width="4.7" height="17" rx="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  'rejilla-4': (
    <>
      <rect x="3.5" y="3.5" width="3.1" height="17" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="8.2" y="3.5" width="3.1" height="17" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="12.9" y="3.5" width="3.1" height="17" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="17.6" y="3.5" width="3.1" height="17" rx="1.2" fill="currentColor" stroke="none" />
    </>
  ),
}

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
