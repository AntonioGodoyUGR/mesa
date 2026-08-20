import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { demoApi } from './lib/api.demo'

/**
 * La app sin sesión.
 *
 * El modo demostración trae siempre usuario y grupo —es lo que hace que el resto
 * de pruebas puedan jugar una partida—, así que aquí se le quitan los dos: es la
 * única forma de ver lo que ve quien llega de fuera. `api` y `demoApi` son el
 * mismo objeto cuando no hay Supabase configurado, y `vitest.config.ts` se
 * encarga de que nunca lo haya.
 */
beforeEach(() => {
  // En cada prueba, porque `restoreMocks` los deshace al terminar la anterior.
  vi.spyOn(demoApi, 'getUser').mockResolvedValue(null)
  vi.spyOn(demoApi, 'listGroups').mockResolvedValue([])
  window.history.pushState({}, '', '/')
})

function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

describe('sin sesión', () => {
  it('la portada enseña el catálogo y lleva a la ficha de cada juego', async () => {
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Juegos' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Todos los juegos' })).toBeVisible()

    // Sin grupo no hay marcador que abrir: la rejilla lleva a la ficha. El catálogo
    // ya no viaja en la app: llega del servidor, así que hay que esperarlo.
    const catan = await screen.findByRole('link', { name: /Catán/ })
    expect(catan).toHaveAttribute('href', '/juegos/catan')

    // Y no se ofrece crear un juego, que es cosa de un grupo.
    expect(screen.queryByText('Crear juego')).toBeNull()
  })

  it('la barra de abajo solo ofrece lo que se puede abrir', async () => {
    renderApp()

    expect(await screen.findByRole('link', { name: /Inicio/ })).toBeVisible()
    expect(screen.getByRole('link', { name: /Empezar/ })).toBeVisible()

    // La barra ya no lleva pestaña de Reglas: viven en la ficha de cada juego.
    expect(screen.queryByRole('link', { name: /Reglas/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /Partidas/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /Jugadores/ })).toBeNull()
  })

  it('la ficha de un juego se abre sin cuenta e invita a entrar', async () => {
    window.history.pushState({}, '', '/juegos/carcassonne')
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Carcassonne' })).toBeVisible()

    fireEvent.click(screen.getByRole('tab', { name: 'Estadísticas' }))
    expect(await screen.findByRole('heading', { name: 'En toda la app' })).toBeVisible()
    expect(screen.getByText(/Inicia sesión para ver cómo se te da/)).toBeVisible()

    // Sin sesión, «Crear partida» manda a entrar antes de nada.
    expect(screen.getByRole('link', { name: /Crear partida/ })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('las pantallas del grupo siguen pidiendo sesión', async () => {
    window.history.pushState({}, '', '/partidas')
    renderApp()

    expect(await screen.findByRole('button', { name: 'Crear cuenta' })).toBeVisible()
    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
})
