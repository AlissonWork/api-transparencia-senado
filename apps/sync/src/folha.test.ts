import { describe, expect, it } from 'vitest'
import { linhaFolhaSchema, normalizar, paraNumero } from './folha.js'

describe('paraNumero', () => {
  it('converte valor com milhar', () => {
    expect(paraNumero('46.366,19')).toBe(46366.19)
  })

  it('converte valor negativo (estorno)', () => {
    expect(paraNumero('-4.819,10')).toBe(-4819.1)
  })

  it('converte zero', () => {
    expect(paraNumero('0,00')).toBe(0)
  })

  it('devolve número sem mexer', () => {
    // Com ponto decimal: se a função tratasse como texto, apagaria o ponto e daria 4636619
    expect(paraNumero(46366.19)).toBe(46366.19)
  })
})

describe('normalizar', () => {
  it('ignora as partículas', () => {
    // O caso real que achamos: a folha tem "de", o cadastro legislativo não
    expect(normalizar('ANTONIA JUSSARA GOMES ALVES DE SOUSA LIMA')).toBe(
      normalizar('Antônia Jussara Gomes Alves Sousa Lima'),
    )
  })

  it('ignora acento e maiúscula', () => {
    expect(normalizar('José Falcão')).toBe('JOSE FALCAO')
  })

  it('ignora espaços duplos e nas pontas', () => {
    expect(normalizar('  Maria   Souza ')).toBe('MARIA SOUZA')
  })

  it('não apaga palavra que só contém DE', () => {
    // Falso positivo que um replace(/DE/g, '') causaria: "ANDERSON" viraria "ANRSON"
    expect(normalizar('Anderson Demóstenes')).toBe('ANDERSON DEMOSTENES')
  })
})

describe('linhaFolhaSchema', () => {
  // Uma linha válida da folha; cada teste muda só o que interessa
  function linhaFolha(mudancas: Record<string, unknown> = {}) {
    return {
      nome: 'FULANO DE TAL',
      ano: 2026,
      mes: 10,
      tipo_folha: 'Normal',
      remuneracao_basica: '46.366,19',
      vantagens_pessoais: '0,00',
      gratificacao_natalina: '0,00',
      diarias: '0,00',
      auxilios: '0,00',
      vantagens_indenizatorias: '0,00',
      outras_eventuais: '0,00',
      abono_permanencia: '0,00',
      horas_extras: '0,00',
      previdencia: '-5.100,28',
      imposto_renda: '-10.000,00',
      reversao_teto_constitucional: '0,00',
      faltas: '0,00',
      remuneracao_liquida: '31.265,91',
      ...mudancas, // o spread por último sobrescreve os campos acima
    }
  }
  it('converte o dinheiro e descarta os campos que não usamos', () => {
    const linha = linhaFolhaSchema.parse(linhaFolha({ sequencial: 2109310 }))

    expect(linha.remuneracao_basica).toBe(46366.19)
    expect(linha.previdencia).toBe(-5100.28)
    expect(linha).not.toHaveProperty('sequencial')
  })

  it('recusa linha sem nome', () => {
    expect(() => linhaFolhaSchema.parse({ ano: 2026, mes: 10 })).toThrow()
  })

  it('trata campo de dinheiro vazio (null) como 0', () => {
    const linha = linhaFolhaSchema.parse(
      linhaFolha({ previdencia: null, remuneracao_liquida: null }),
    )

    expect(linha.previdencia).toBe(0)
    expect(linha.remuneracao_liquida).toBe(0)
  })
})
