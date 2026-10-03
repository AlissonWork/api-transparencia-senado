import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { criarPrisma } from '@ts/db'
import { buildApp } from '../app.js'

// Banco SÓ de teste: os dados daqui são apagados a cada execução
const URL_TESTE =
  'postgresql://senado:senado@localhost:5432/transparencia_teste'
process.env.DATABASE_URL = URL_TESTE

const prisma = criarPrisma(URL_TESTE)
const app = buildApp()

// ARRANGE: roda uma vez, antes de todos os testes do arquivo
beforeAll(async () => {
  // Despesas primeiro, porque elas apontam para senador e categoria (FK)
  await prisma.despesa.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.senador.deleteMany()

  await prisma.senador.create({ data: { codigo: 1, nome: 'SENADOR TESTE' } })

  const passagens = await prisma.categoria.create({
    data: {
      nomeOficial: 'Passagens aéreas',
      nomeCurto: 'Passagens',
      slug: 'passagens',
    },
  })

  const divulgacao = await prisma.categoria.create({
    data: {
      nomeOficial: 'Divulgação',
      nomeCurto: 'Divulgação',
      slug: 'divulgacao',
    },
  })

  // 2026: passagens 300,75 + divulgação 50,00 = 350,75
  // 2025: 999,99, que NÃO pode entrar na conta de 2026
  const base = {
    senadorCodigo: 1,
    mes: 1,
    fornecedor: 'FORNECEDOR TESTE',
    cpfCnpj: '00.000.000/0001-00',
  }

  await prisma.despesa.createMany({
    data: [
      { ...base, id: 1, ano: 2026, categoriaId: passagens.id, valor: '100.50' },
      { ...base, id: 2, ano: 2026, categoriaId: passagens.id, valor: '200.25' },
      { ...base, id: 3, ano: 2026, categoriaId: divulgacao.id, valor: '50.00' },
      { ...base, id: 4, ano: 2025, categoriaId: passagens.id, valor: '999.99' },
    ],
  })
})

afterAll(async () => {
  await app.close()
  await prisma.$disconnect()
})

describe('GET /senadores/:codigo/gastos', () => {
  it('soma os gastos do ano por categoria, do maior para o menor', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores/1/gastos?ano=2026',
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({
      senador: { codigo: 1, nome: 'SENADOR TESTE' },
      ano: 2026,
      total: 350.75,
      porCategoria: [
        {
          categoria: 'Passagens',
          slug: 'passagens',
          quantidade: 2,
          total: 300.75,
        },
        {
          categoria: 'Divulgação',
          slug: 'divulgacao',
          quantidade: 1,
          total: 50,
        },
      ],
    })
  })

  it('responde 404 para senador que não existe', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores/999/gastos?ano=2026',
    })
    expect(res.statusCode).toBe(404)
  })

  it('responde 400 para código inválido', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores/abc/gastos?ano=2026',
    })
    expect(res.statusCode).toBe(400)
  })

  it('responde 400 quando falta o ano', async () => {
    const res = await app.inject({ method: 'GET', url: '/senadores/1/gastos' })
    expect(res.statusCode).toBe(400)
  })
})
