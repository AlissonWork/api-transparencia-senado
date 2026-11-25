import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TabelaComparar, type LinhaComparar } from './TabelaComparar'

// Desenha a tabela com nomes fixos: cada teste só fala das linhas
function desenhar(linhas: LinhaComparar[]) {
  return render(
    <TabelaComparar titulo="Teste" nomeA="Ana" nomeB="Beto" linhas={linhas} />,
  )
}

// As células marcadas como maior da linha
function destacados(container: HTMLElement) {
  return container.querySelectorAll('[data-maior="true"]')
}

describe('TabelaComparar', () => {
  it('mostra os dois nomes no cabeçalho e uma linha por item', () => {
    desenhar([
      { rotulo: 'Correios', a: 100, b: 40 },
      { rotulo: 'Passagens', a: 0, b: 30 },
    ])
    screen.getByRole('columnheader', { name: 'Ana' })
    screen.getByRole('columnheader', { name: 'Beto' })
    expect(screen.getAllByRole('row')).toHaveLength(3) // cabeçalho + 2
  })

  it('mostra um traço quando não há dado', () => {
    desenhar([{ rotulo: 'Salário', a: null, b: 5000 }])
    screen.getByText('—')
  })

  it('destaca só o maior valor da linha', () => {
    const { container } = desenhar([{ rotulo: 'Correios', a: 100, b: 40 }])
    expect(destacados(container)).toHaveLength(1)
    expect(destacados(container)[0].textContent).toContain('100,00')
  })

  it('no empate não destaca ninguém', () => {
    const { container } = desenhar([{ rotulo: 'Correios', a: 100, b: 100 }])
    expect(destacados(container)).toHaveLength(0)
  })

  it('contra um traço, quem tem valor é o maior', () => {
    const { container } = desenhar([{ rotulo: 'Salário', a: null, b: 5000 }])
    expect(destacados(container)).toHaveLength(1)
    expect(destacados(container)[0].textContent).toContain('5.000,00')
  })
})
