/**
 * Los iconos de la barra de secciones.
 *
 * Antes eran emojis (🎲 📋 👥 ✨) y traían dos problemas que no se arreglan
 * con CSS: cada sistema los dibuja a su manera —en Windows salen planos y en
 * el móvil de al lado a todo color— y, al ser una imagen, no seguían el color
 * de la sección activa: la etiqueta se ponía azul y el dibujo de encima se
 * quedaba igual.
 *
 * Estos son trazo de 2 px sobre una rejilla de 24 en `currentColor`, del
 * mismo grosor que el borde de las tarjetas, así que la barra habla el idioma
 * del resto de la aplicación. Decorativos siempre: el nombre de la sección va
 * escrito debajo, así que aquí `aria-hidden`.
 */

import type { ReactNode } from 'react'

export type IconName = 'dado' | 'lista' | 'jugadores' | 'chispa'

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
