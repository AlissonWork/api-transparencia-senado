import type { PrismaClient } from '@ts/db'
import { describe, expect, it, vi } from 'vitest'
import {
  NOMES_CURTOS,
  SEM_CATEGORIA,
  gerarSlug,
  semearCategorias,
} from './categorias.js'

// Um "Prisma" de mentira que só tem o que a função usa: categoria.upsert.
// O "as unknown as PrismaClient" diz ao TypeScript: "confie, serve".
// É o preço de imitar só um pedaço de um objeto grande.
function criarPrismaFalso() {
  const upsert = vi.fn()
  const prisma = { categoria: { upsert } } as unknown as PrismaClient
  return { prisma, upsert }
}

describe('NOMES_CURTOS', () => {
  it('tem as 8 categorias', () => {
    expect(Object.keys(NOMES_CURTOS).length).toBe(8)
  })

  it('inclui a categoria de despesa sem tipo', () => {
    expect(Object.keys(NOMES_CURTOS)).toContain(SEM_CATEGORIA)
  })

  it('não tem espaço nas pontas dos nomes oficiais', () => {
    for (const nomeOficial of Object.keys(NOMES_CURTOS)) {
      expect(nomeOficial).toBe(nomeOficial.trim())
    }
  })

  it('tem nomes curtos de verdade (até 40 caracteres)', () => {
    for (const nomeCurto of Object.values(NOMES_CURTOS)) {
      expect(nomeCurto.length).toBeLessThanOrEqual(40)
    }
  })
})

describe('gerarSlug', () => {
  it('tira acentos, pontuação e passa para minúsculas', () => {
    expect(
      gerarSlug('Passagens aéreas, aquáticas e terrestres nacionais'),
    ).toBe('passagens-aereas-aquaticas-e-terrestres-nacionais')
  })

  it('gera o slug da categoria sem tipo', () => {
    expect(gerarSlug(SEM_CATEGORIA)).toBe('nao-informado')
  })
})

describe('semearCategorias', () => {
  it('faz um upsert para cada categoria e devolve quantas foram', async () => {
    const { prisma, upsert } = criarPrismaFalso()

    const total = await semearCategorias(prisma)

    expect(total).toBe(8)
    expect(upsert).toHaveBeenCalledTimes(8)
  })

  it('procura pelo nome oficial e atualiza só o nome curto', async () => {
    const { prisma, upsert } = criarPrismaFalso()

    await semearCategorias(prisma)

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          nomeOficial: 'Passagens aéreas, aquáticas e terrestres nacionais',
        },
        update: {
          nomeCurto: 'Passagens',
        },
      }),
    )
  })
})
