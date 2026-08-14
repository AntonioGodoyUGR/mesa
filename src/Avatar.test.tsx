import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { demoApi } from './lib/api.demo'
import { parseAvatar } from './lib/avatar'

/**
 * El taller del avatar, de punta a punta: se abre desde la ficha del jugador, se
 * elige un rasgo y lo que se guarda es la cadena que entiende `lib/avatar.ts`.
 */
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

describe('avatares', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/jugadores/demo-player-1')
  })

  it('se compone desde la ficha del jugador y se guarda como texto', async () => {
    // Sin dejar que escriba: el modo demostración guarda en `localStorage` y la
    // siguiente prueba se encontraría con el avatar ya puesto.
    const save = vi.spyOn(demoApi, 'setPlayerAvatar').mockResolvedValue(undefined)
    renderApp()

    fireEvent.click(await screen.findByRole('button', { name: /Avatar/ }))

    // Un rasgo de cada clase: uno de color y otro con forma.
    fireEvent.click(screen.getByRole('button', { name: 'Camiseta 3' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sombrero: Corona' }))
    fireEvent.click(screen.getByRole('button', { name: /Guardar avatar/ }))

    await waitFor(() => expect(save).toHaveBeenCalledTimes(1))

    const [playerId, value] = save.mock.calls[0]
    expect(playerId).toBe('demo-player-1')
    expect(parseAvatar(value, 'Ana')).toMatchObject({ shirt: 2, hat: 'corona' })
  })

  it('el editor se cierra al terminar y el jugador puede volver al de siempre', async () => {
    renderApp()

    fireEvent.click(await screen.findByRole('button', { name: /Avatar/ }))
    expect(screen.getByRole('button', { name: /Sorpréndeme/ })).toBeVisible()
    // Sin nada guardado no hay a qué volver.
    expect(screen.queryByRole('button', { name: /Volver al de siempre/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Guardar avatar/ }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Sorpréndeme/ })).toBeNull(),
    )

    fireEvent.click(screen.getByRole('button', { name: /Avatar/ }))
    expect(
      await screen.findByRole('button', { name: /Volver al de siempre/ }),
    ).toBeVisible()
  })
})
