/**
 * Los accesorios en pantalla. El azar y el formato ya se prueban en `games/tools.test.ts`;
 * aquí solo se comprueba lo que no se puede saber sin renderizar: que un juego sin
 * accesorios no pinta nada, que el botón tira y que la cuenta atrás arranca.
 */
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { GameTools } from './GameTools'
import { blankCustomGame } from '../games/custom'
import type { GameDefinition, GameTool } from '../games/types'

function gameWith(tools?: GameTool[]): GameDefinition {
  return { ...blankCustomGame(), name: 'Prueba', tools }
}

describe('GameTools', () => {
  it('no ocupa sitio en un juego que no declara accesorios', () => {
    const { container } = render(<GameTools game={gameWith()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('tira los dados y enseña el resultado con su suma', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    render(<GameTools game={gameWith([{ kind: 'dice', count: 2, faces: 6 }])} />)

    expect(screen.getByText('2 dados de 6 caras')).toBeInTheDocument()
    expect(screen.getByText('Sin tirar')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Tirar/ }))

    expect(screen.getAllByLabelText('6')).toHaveLength(2)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('el temporizador empieza parado y se puede reiniciar', () => {
    render(<GameTools game={gameWith([{ kind: 'timer', seconds: 90, label: 'Turno' }])} />)

    expect(screen.getByText('Turno · 1:30')).toBeInTheDocument()
    expect(screen.getByRole('timer')).toHaveTextContent('1:30')
    // Nada que reiniciar mientras no se haya tocado.
    expect(screen.getByRole('button', { name: /Reiniciar/ })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /Empezar/ }))

    expect(screen.getByRole('button', { name: /Pausa/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reiniciar/ })).toBeEnabled()
  })
})
