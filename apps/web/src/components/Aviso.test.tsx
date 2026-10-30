import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AvisoCarregando, AvisoErro } from './Aviso'

describe('AvisoCarregando', () => {
  it('mostra o texto que recebeu', () => {
    render(<AvisoCarregando texto="Carregando os senadores..." />)

    screen.getByText('Carregando os senadores...')
  })
})

describe('AvisoErro', () => {
  it('mostra o botão Tentar de novo', () => {
    render(<AvisoErro onTentarDeNovo={() => {}} />)

    screen.getByRole('button', { name: 'Tentar de novo' })
  })

  it('chama onTentarDeNovo uma vez ao clicar', () => {
    // A função falsa: só anota que foi chamada
    const tentarDeNovo = vi.fn()
    render(<AvisoErro onTentarDeNovo={tentarDeNovo} />)

    // Lacuna: ache o botão e clique nele com fireEvent.click(...)
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    // Lacuna: confira que a função falsa foi chamada exatamente 1 vez
    expect(tentarDeNovo).toHaveBeenCalledTimes(1)
  })

  it('não chama onTentarDeNovo só por desenhar ', () => {
    const tentarDeNovo = vi.fn()
    render(<AvisoErro onTentarDeNovo={tentarDeNovo} />)

    // Lacuna: confira que a função falsa NÃO foi chamada
    expect(tentarDeNovo).not.toHaveBeenCalled()
  })
})
