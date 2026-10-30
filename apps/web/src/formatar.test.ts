import { describe, expect, it } from 'vitest'
import { formatarPorcentagem, formatarReais, semAcento } from './formatar'

describe('formatarReais', () => {
  it('escreve milhar com ponto e centavos com vírgula', () => {
    expect(formatarReais(1234.5)).toBe('R$\u00A01.234,50')
  })

  it('mostra zero reais, e não um texto vazio', () => {
    expect(formatarReais(0)).toBe('R$\u00A00,00')
  })
})

describe('semAcento', () => {
  it('tira acentos e passa para minúsculas', () => {
    expect(semAcento('JOÃO')).toBe('joao')
  })

  it('não muda um texto que já está sem acento', () => {
    // Lacuna: escolha uma entrada sem acento, em minúsculas, e o resultado esperado
    expect(semAcento('meu nome e gabriel')).toBe('meu nome e gabriel')
  })
})

describe('formatarPorcentagem', () => {
  it('arredonda para porcentagem sem casas decimais', () => {
    expect(formatarPorcentagem(0.384)).toBe('38%')
  })
})
