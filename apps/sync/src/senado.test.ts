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
    })
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
