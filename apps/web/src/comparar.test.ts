import { describe, expect, it } from 'vitest'
import {
  juntarCategorias,
  juntarMeses,
  lerCodigo,
  ordenarPorNome,
} from './comparar'
import type { GastoPorCategoria, SenadorDaLista } from './api'

describe('lerCodigo', () => {
  it('transforma o texto do endereço em número', () => {
    expect(lerCodigo('5672')).toBe(5672)
  })

  // it.each roda o mesmo teste uma vez para cada valor da lista.
  // O %j põe o valor no nome do teste, então o relatório mostra qual falhou.
  it.each([null, '', 'abc', '0', '-3', '1.5'])(
    'devolve null para %j',
    (valor) => {
      expect(lerCodigo(valor)).toBeNull()
    },
  )

  // Os dois "falsos positivos": o Number() é tolerante demais.
  // Este teste DOCUMENTA o comportamento atual, de propósito.
  it('aceita espaços em volta e notação científica', () => {
    expect(lerCodigo(' 12 ')).toBe(12)
    expect(lerCodigo('1e3')).toBe(1000)
  })
})

// Fábrica de senador falso: só o nome importa, o resto é preenchimento
function senador(nome: string): SenadorDaLista {
  return {
    codigo: 1,
    nome,
    partido: null,
    uf: null,
    urlFoto: null,
    emExercicio: true,
    total: 0,
  }
}

describe('ordenarPorNome', () => {
  it('ordena respeitando acentos', () => {
    const lista = [senador('Zé'), senador('Beto'), senador('Álvaro')]
    const nomes = ordenarPorNome(lista).map((s) => s.nome)
    expect(nomes).toEqual(['Álvaro', 'Beto', 'Zé'])
  })

  it('não altera a lista original', () => {
    const lista = [senador('Beto'), senador('Álvaro')]
    ordenarPorNome(lista)
    // o primeiro continua sendo o Beto: a função ordenou uma CÓPIA
    expect(lista[0].nome).toBe('Beto')
  })

  it('lista vazia devolve lista vazia', () => {
    expect(ordenarPorNome([])).toEqual([])
  })
})

function cat(slug: string, total: number): GastoPorCategoria {
  return { slug, categoria: slug, quantidade: 1, total }
}

describe('juntarCategorias', () => {
  it('põe os dois valores na mesma linha quando os dois gastaram', () => {
    const linhas = juntarCategorias(
      [cat('correios', 100)],
      [cat('correios', 40)],
    )
    expect(linhas).toEqual([
      { slug: 'correios', categoria: 'correios', a: 100, b: 40 },
    ])
  })

  it('preenche com 0 o lado que não gastou', () => {
    const linhas = juntarCategorias([cat('correios', 100)], [cat('passagens', 30)])
    expect(linhas).toEqual([
      { slug: 'correios', categoria: 'correios', a: 100, b: 0 },
      { slug: 'passagens', categoria: 'passagens', a: 0, b: 30 },
    ])
  })

  it('ordena pela soma dos dois, maior primeiro', () => {
    // No A sozinho, correios (50) vem antes de passagens (10).
    // Somando o B, passagens vai a 510 e passa na frente.
    const linhas = juntarCategorias(
      [cat('correios', 50), cat('passagens', 10)],
      [cat('passagens', 500)],
    )
    expect(linhas.map((l) => l.slug)).toEqual(['passagens', 'correios'])
  })

  it('dois senadores sem gastos dão lista vazia', () => {
    expect(juntarCategorias([], [])).toEqual([])
  })
})

describe('juntarMeses', () => {
  it('põe os dois valores do mesmo mês na mesma linha', () => {
    const linhas = juntarMeses([{ mes: 1, total: 100 }], [{ mes: 1, total: 40 }])
    expect(linhas).toEqual([{ mes: 1, a: 100, b: 40 }])
  })

  it('preenche com 0 o lado que não gastou no mês', () => {
    const linhas = juntarMeses([{ mes: 2, total: 100 }], [{ mes: 5, total: 30 }])
    expect(linhas).toEqual([
      { mes: 2, a: 100, b: 0 },
      { mes: 5, a: 0, b: 30 },
    ])
  })

  it('deixa de fora o mês em que nenhum dos dois gastou', () => {
    const linhas = juntarMeses([{ mes: 1, total: 0 }], [{ mes: 1, total: 0 }])
    expect(linhas).toEqual([])
  })

  it('sai na ordem do calendário mesmo se a API mandar fora de ordem', () => {
    const linhas = juntarMeses(
      [
        { mes: 3, total: 10 },
        { mes: 1, total: 20 },
      ],
      [],
    )
    expect(linhas.map((l) => l.mes)).toEqual([1, 3])
  })
})
