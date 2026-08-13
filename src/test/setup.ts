import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// jsdom no implementa matchMedia y el selector de tema lo usa al montar.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia

// El layout hace scroll arriba al cambiar de pantalla; jsdom no lo implementa.
window.scrollTo = () => {}

beforeEach(() => {
  // Cada test arranca con la demo recién sembrada.
  localStorage.clear()
})

afterEach(cleanup)
