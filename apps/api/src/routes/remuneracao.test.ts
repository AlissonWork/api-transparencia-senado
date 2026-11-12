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
  // Filhos antes do pai: despesa e remuneração apontam para senador (FK)
  await prisma.despesa.deleteMany()
  await prisma.remuneracao.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.senador.deleteMany()

  // Senador 1 tem folha; senador 2 existe, mas não aparece na folha
  await prisma.senador.createMany({
    data: [
      { codigo: 1, nome: 'SENADOR COM FOLHA' },
      { codigo: 2, nome: 'SENADOR SEM FOLHA' },
    ],
  })

  // Setembro: só a folha Normal          → líquido 31.000,00
  // Outubro: Normal 31.000,00 + Suplementar 500,50 → líquido 31.500,50
  // 2025: não pode entrar na conta de 2026
  const base = { senadorCodigo: 1, ano: 2026 }
  await prisma.remuneracao.createMany({
    data: [
      { ...base, mes: 9, tipoFolha: 'Normal', remuneracaoBasica: '46366.19', remuneracaoLiquida: '31000.00' },
      { ...base, mes: 10, tipoFolha: 'Normal', remuneracaoBasica: '46366.19', remuneracaoLiquida: '31000.00' },
      { ...base, mes: 10, tipoFolha: 'Suplementar', remuneracaoBasica: '0.00', remuneracaoLiquida: '500.50' },
      { senadorCodigo: 1, ano: 2025, mes: 12, tipoFolha: 'Normal', remuneracaoBasica: '46366.19', remuneracaoLiquida: '99999.99' },
    ],
  })
})

afterAll(async () => {
  await app.close()
  await prisma.$disconnect()
})

describe('GET /senadores/:codigo/remuneracao', () => {
  it('soma a folha Normal e a Suplementar do mesmo mês', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores/1/remuneracao?ano=2026',
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({
      senador: { codigo: 1, nome: 'SENADOR COM FOLHA' },
      ano: 2026,
      meses: [
        { mes: 9, subsidio: 46366.19, liquido: 31000 },
        { mes: 10, subsidio: 46366.19, liquido: 31500.5 },
      ],
      totalLiquido: 62500.5, // sem os 99.999,99 de 2025
    })
  })

  it('devolve lista vazia (200) para senador que não está na folha', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores/2/remuneracao?ano=2026',
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().meses).toEqual([])
    expect(res.json().totalLiquido).toBe(0)
  })

  it('responde 404 para senador que não existe', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores/999/remuneracao?ano=2026',
    })
    expect(res.statusCode).toBe(404)
  })

  it('responde 400 quando falta o ano', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores/1/remuneracao',
    })
    expect(res.statusCode).toBe(400)
  })
})
