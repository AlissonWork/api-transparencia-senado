import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Quadradinhos } from './Quadradinhos'

// Conta os quadradinhos cheios pelo atributo data-cheio
function contarCheios(container: HTMLElement) {
  return container.querySelectorAll('[data-cheio="true"]').length
}

describe('Quadradinhos', () => {
  it('tem um nome acessível com a porcentagem', () => {
    render(<Quadradinhos parte={0.38} />)
    screen.getByRole('img', { name: '38% do total' })
  })

  it('pinta 4 de 10 para 38%', () => {
    const { container } = render(<Quadradinhos parte={0.38} />)

    expect(contarCheios(container)).toBe(4)
  })

  it('não pinta nenhum para 0%', () => {
    const { container } = render(<Quadradinhos parte={0} />)

    expect(contarCheios(container)).toBe(0)
  })

  it('pinta todos para 100%', () => {
    const { container } = render(<Quadradinhos parte={1} />)

    expect(contarCheios(container)).toBe(10)
  })
})
