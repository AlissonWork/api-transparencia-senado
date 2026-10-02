import { existsSync } from 'node:fs'
import { criarPrisma } from '@ts/db'
import { buscarDespesas, type DespesaSenado } from './senado.js'

// Carrega o .env da raiz (DATABASE_URL), igual ao prisma.config.ts
const env = new URL('../../../.env', import.meta.url)
if (existsSync(env)) process.loadEnvFile(env)

const prisma = criarPrisma()
const ANO = 2026
const SEM_CATEGORIA = 'Não Informado'

// "Passagens aéreas, aquáticas..." → "passagens-aereas-aquaticas..."
function gerarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira acentos
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // tudo que não é letra/número vira "-"
    .replace(/^-|-$/g, '') // tira "-" das pontas
}

// A data da fonte tem valores absurdos: só aceitamos se o ano fizer sentido
function lerData(texto: string | null) {
  if (!texto) return null
  const data = new Date(texto)
  const ano = data.getUTCFullYear()
  return ano >= 2000 && ano <= 2100 ? data : null
}

// 1. SENADORES: um upsert por senador que aparece nas despesas
async function gravarSenadores(despesas: DespesaSenado[]) {
  const nomes = new Map(despesas.map((d) => [d.codSenador, d.nomeSenador]))
  for (const [codigo, nome] of nomes) {
    await prisma.senador.upsert({
      where: { codigo },
      update: { nome },
      create: { codigo, nome },
    })
  }
  return nomes.size
}

// 2. CATEGORIAS: acha ou cria cada uma e devolve o mapa "nome oficial → id"
async function gravarCategorias(despesas: DespesaSenado[]) {
  const nomes = new Set(
    despesas.map((d) => d.tipoDespesa?.trim() || SEM_CATEGORIA),
  )
  const ids = new Map<string, number>()
  for (const nomeOficial of nomes) {
    const categoria = await prisma.categoria.upsert({
      where: { nomeOficial },
      update: {}, // já existe: não mexe
      create: { nomeOficial, slug: gerarSlug(nomeOficial) },
    })
    ids.set(nomeOficial, categoria.id)
  }
  return ids
}

// 3. DESPESAS: apaga o ano e insere tudo de novo, numa transação
async function gravarDespesas(
  despesas: DespesaSenado[],
  categorias: Map<string, number>,
) {
  const linhas = despesas.map((d) => ({
    id: d.id,
    senadorCodigo: d.codSenador,
    categoriaId: categorias.get(d.tipoDespesa?.trim() || SEM_CATEGORIA)!,
    ano: d.ano,
    mes: d.mes,
    tipoDocumento: d.tipoDocumento,
    fornecedor: d.fornecedor,
    cpfCnpj: d.cpfCnpj,
    documento: d.documento,
    data: lerData(d.data),
    valor: d.valorReembolsado.toFixed(2), // texto "1850.40": Decimal sem erro de arredondamento
  }))

  await prisma.$transaction(
    async (tx) => {
      await tx.despesa.deleteMany({ where: { ano: ANO } })
      // em blocos de 1000, para não estourar o limite de parâmetros do Postgres
      for (let i = 0; i < linhas.length; i += 1000) {
        await tx.despesa.createMany({ data: linhas.slice(i, i + 1000) })
      }
    },
    { timeout: 120_000 }, // 2 minutos: o padrão (5 s) é pouco para 14 mil linhas
  )
  return linhas.length
}

// Execução: registra o início, faz as 3 etapas e registra o fim (ok ou erro)
const execucao = await prisma.sincronizacao.create({
  data: { fonte: 'despesas', ano: ANO, status: 'executando' },
})

try {
  const despesas = await buscarDespesas(ANO)
  const totalSenadores = await gravarSenadores(despesas)
  const categorias = await gravarCategorias(despesas)
  const total = await gravarDespesas(despesas, categorias)

  await prisma.sincronizacao.update({
    where: { id: execucao.id },
    data: { status: 'ok', registros: total, finalizadaEm: new Date() },
  })
  console.log(
    `${total} despesas, ${totalSenadores} senadores e ${categorias.size} categorias gravados`,
  )
} catch (erro) {
  await prisma.sincronizacao.update({
    where: { id: execucao.id },
    data: { status: 'erro', erro: String(erro), finalizadaEm: new Date() },
  })
  throw erro
} finally {
  await prisma.$disconnect()
}
