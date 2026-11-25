import type { GastoPorCategoria, SenadorDaLista } from './api'

// "5672" vira 5672. Ausente, vazio, "abc", "0", "-3" ou "1.5" viram null.
export function lerCodigo(valor: string | null): number | null {
  const n = Number(valor)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

// Cópia da lista em ordem alfabética, respeitando acentos ("Álvaro" antes de "Beto")
export function ordenarPorNome(lista: SenadorDaLista[]) {
  return [...lista].sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'))
}

// Uma linha da tabela de categorias: o gasto de A e o de B lado a lado
export type LinhaCategoria = {
  slug: string
  categoria: string
  a: number
  b: number
}

// Junta as categorias dos dois. Quem não gastou na categoria fica com 0.
// Ordem: a maior soma (a + b) primeiro.
export function juntarCategorias(
  a: GastoPorCategoria[],
  b: GastoPorCategoria[],
): LinhaCategoria[] {
  // Map = dicionário. A chave é o slug, que é igual para os dois lados
  const linhas = new Map<string, LinhaCategoria>()

  for (const g of a) {
    linhas.set(g.slug, {
      slug: g.slug,
      categoria: g.categoria,
      a: g.total,
      b: 0,
    })
  }

  for (const g of b) {
    const linha = linhas.get(g.slug)
    if (linha)
      linha.b = g.total // A também gastou: só preenche o lado B
    else
      linhas.set(g.slug, {
        slug: g.slug,
        categoria: g.categoria,
        a: 0,
        b: g.total,
      })
  }

  return [...linhas.values()].sort((x, y) => y.a + y.b - (x.a + x.b))
}

type Mes = { mes: number; total: number }

// Os 12 meses lado a lado. Mês em que nenhum dos dois gastou fica de fora.
export function juntarMeses(a: Mes[], b: Mes[]) {
  const linhas: { mes: number; a: number; b: number }[] = []

  for (let mes = 1; mes <= 12; mes++) {
    const valorA = a.find((m) => m.mes === mes)?.total ?? 0
    const valorB = b.find((m) => m.mes === mes)?.total ?? 0
    if (valorA || valorB) linhas.push({ mes, a: valorA, b: valorB })
  }

  return linhas
}
