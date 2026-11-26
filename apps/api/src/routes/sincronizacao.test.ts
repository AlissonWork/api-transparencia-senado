import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { criarPrisma } from '@ts/db'
import { buildApp } from '../build-app.js'

const URL_TESTE =
  'postgresql://senado:senado@localhost:5432/transparencia_teste'
process.env.DATABASE_URL = URL_TESTE

const prisma = criarPrisma(URL_TESTE)
const app = buildApp()

// Antes de CADA teste: tabela vazia. Cada caso monta só o que precisa.
beforeEach(async () => {
  await prisma.sincronizacao.deleteMany()
})

afterAll(async () => {
  await app.close()
  await prisma.$disconnect()
})

describe('GET /sincronizacao', () => {
  it('devolve null quando o sync nunca rodou', async () => {
    // a tabela já está vazia (beforeEach), não precisa criar nada
    const res = await app.inject({ method: 'GET', url: '/sincronizacao' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ atualizadoEm: null })
  })

  it('devolve a data da sincronizacao ok mais recente', async () => {
    await prisma.sincronizacao.createMany({
      data: [
        {
          fonte: 'despesas',
          status: 'ok',
          finalizadaEm: new Date('2026-11-01T20:00:00Z'),
        },
        {
          fonte: 'despesas',
          status: 'ok',
          finalizadaEm: new Date('2026-11-10T20:00:00Z'),
        },
      ],
    })
    const res = await app.inject({ method: 'GET', url: '/sincronizacao' })

    expect(res.json()).toEqual({ atualizadoEm: '2026-11-10T20:00:00.000Z' })
  })

  it('ignora a sincronizacao que deu erro', async () => {
    await prisma.sincronizacao.createMany({
      data: [
        {
          fonte: 'despesas',
          status: 'ok',
          finalizadaEm: new Date('2026-11-01T20:00:00Z'),
        },
        {
          fonte: 'despesas',
          status: 'erro',
          finalizadaEm: new Date('2026-11-10T20:00:00Z'),
        },
      ],
    })
    const res = await app.inject({ method: 'GET', url: '/sincronizacao' })

    expect(res.json()).toEqual({ atualizadoEm: '2026-11-01T20:00:00.000Z' })
  })

  it('não quebra com uma sincronização ainda executando', async () => {
    await prisma.sincronizacao.create({
      data: {
        fonte: 'despesas',
        status: 'executando',
        finalizadaEm: null,
      },
    })
    const res = await app.inject({ method: 'GET', url: '/sincronizacao' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({
      atualizadoEm: null,
    })
  })
})
