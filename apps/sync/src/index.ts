import { buscarDespesas } from './senado.js'

const despesas = await buscarDespesas(2026)

// Quantos senadores DIFERENTES aparecem?
// .map pega só o código de cada despesa: [5012, 5012, 4981, ...]
// O Set guarda cada valor uma vez só, então repetidos somem.
const senadores = new Set(despesas.map((d) => d.codSenador))

// Contador por categoria, no formato { "nome da categoria": quantidade }.
// Record<string, number> diz ao TypeScript: chaves são texto, valores são número
const categorias: Record<string, number> = {}

for (const d of despesas) {
  const nome = d.tipoDespesa ?? 'Não Imformado'

  // Soma 1 no contador dessa categoria.
  // Na primeira vez a chave ainda não existe (undefined), então começa do 0.
  categorias[nome] = (categorias[nome] ?? 0) + 1
}

console.log(`${despesas.length} despesas de ${senadores.size} senadores`)
console.log(categorias)
