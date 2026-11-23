import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GastosPorMes } from './GastosPorMes'

const meses = [
  { mes: 1, total: 1000 },
  { mes: 2, total: 4000 },
  { mes: 3, total: 2500 },
]

describe('GastosPorMes', () => {
  it('tem uma linha por mês, mais o cabeçalho', () => {
    render(<GastosPorMes meses={meses} />)
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('mostra o mês e o valor', () => {
    render(<GastosPorMes meses={meses} />)
    screen.getByText('março')
    screen.getByText('R$ 2.500,00') // espaço comum: a página é normalizada
  })

  it('destaca só o mês de maior gasto', () => {
    const { container } = render(<GastosPorMes meses={meses} />)
    const destacados = container.querySelectorAll('[data-maior="true"]')

    expect(destacados).toHaveLength(1)
    expect(destacados[0].textContent).toContain('fevereiro')
  })
})
