import { describe, expect, it } from 'vitest'
import {
  formatarPorcentagem,
  formatarReais,
  semAcento,
  formatarDiaMes,
} from './formatar'

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

describe('formatarDiaMes', () => {
  it('mostra dia e mês com dois dígitos', () => {
    expect(formatarDiaMes('2026-03-05T15:00:00.000Z')).toBe('05/03')
  })

  it('usa o dia de Brasília, e não o de UTC', () => {
    // 01h30 UTC do dia 11 = 22h30 do dia 10 em Brasília (UTC-3)
    expect(formatarDiaMes('2026-11-11T01:30:00.000Z')).toBe('10/11')
  })
})
