import { describe, expect, it } from 'vitest'
import { converterParlamentar, parlamentarSchema } from './senado.js'

// Recorte real da resposta do Senado (15/10/2026)
const exemplo = {
  IdentificacaoParlamentar: {
    CodigoParlamentar: '5672',
    NomeParlamentar: 'Alan Rick',
    NomeCompletoParlamentar: 'Alan Rick Miranda',
    UrlFotoParlamentar:
      'http://www.senado.leg.br/senadores/img/fotos-oficiais/senador5672.jpg',
    SiglaPartidoParlamentar: 'REPUBLICANOS',
    UfParlamentar: 'AC',
  },
  Mandato: { DescricaoParticipacao: 'Titular' },
}

// Recorte real de um suplente em exercício (25/11/2026)
const suplente = {
  IdentificacaoParlamentar: {
    ...exemplo.IdentificacaoParlamentar,
    CodigoParlamentar: '5257',
    NomeParlamentar: 'Renzo Braz',
    UfParlamentar: 'MG',
  },
  Mandato: {
    DescricaoParticipacao: '1º Suplente',
    Titular: { NomeParlamentar: 'Rodrigo Pacheco' },
  },
}

describe('converterParlamentar', () => {
  it('converte para o formato da tabela senadores', () => {
    const senador = converterParlamentar(parlamentarSchema.parse(exemplo))
    expect(senador).toEqual({
      codigo: 5672, // número, não texto
      nome: 'Alan Rick',
      nomeCompleto: 'Alan Rick Miranda',
      partido: 'REPUBLICANOS',
      uf: 'AC',
      urlFoto:
        'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5672.jpg',
      suplenteDe: null, // titular
    })
  })

  it('guarda o nome do titular quando é suplente', () => {
    const senador = converterParlamentar(parlamentarSchema.parse(suplente))
    expect(senador.suplenteDe).toBe('Rodrigo Pacheco')
  })

  it('marca como suplente mesmo sem o nome do titular', () => {
    const semTitular = {
      ...suplente,
      Mandato: { DescricaoParticipacao: '2º Suplente' },
    }
    const senador = converterParlamentar(parlamentarSchema.parse(semTitular))
    expect(senador.suplenteDe).toBe('titular')
  })

  it('recusa senador sem o bloco Mandato', () => {
    const { Mandato: _, ...semMandato } = exemplo
    expect(() => parlamentarSchema.parse(semMandato)).toThrow()
  })

  it('recusa senador sem UF', () => {
    const semUf = {
      IdentificacaoParlamentar: {
        ...exemplo.IdentificacaoParlamentar,
        UfParlamentar: undefined,
      },
    }
    expect(() => parlamentarSchema.parse(semUf)).toThrow()
  })
})
