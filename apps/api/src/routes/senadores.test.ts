import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { criarPrisma } from '@ts/db'
import { buildApp } from '../app.js'

const URL_TESTE =
  'postgresql://senado:senado@localhost:5432/transparencia_teste'
process.env.DATABASE_URL = URL_TESTE

const prisma = criarPrisma(URL_TESTE)
const app = buildApp()

beforeAll(async () => {
  await prisma.despesa.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.senador.deleteMany()

  // 4 senadores pensados para testar cada filtro:
  // - 1 e 2 são do CE (filtro uf)
  // - 1 e 3 são do PT (filtro partido)
  // - 3 está fora de exercício (filtro emExercicio)
  // - 4 não tem nenhuma despesa (total precisa ser 0, não sumir da lista)
  await prisma.senador.createMany({
    data: [
      { codigo: 1, nome: 'ANA', partido: 'PT', uf: 'CE', emExercicio: true },
      { codigo: 2, nome: 'BRUNO', partido: 'PL', uf: 'CE', emExercicio: true },
      { codigo: 3, nome: 'CARLA', partido: 'PT', uf: 'SP', emExercicio: false },
      { codigo: 4, nome: 'DIEGO', partido: 'PSD', uf: 'RJ', emExercicio: true },
    ],
  })

  const categoria = await prisma.categoria.create({
    data: { nomeOficial: 'Passagens aéreas', slug: 'passagens' },
  })

  const base = {
    mes: 1,
    fornecedor: 'FORNECEDOR TESTE',
    cpfCnpj: '00.000.000/0001-00',
    categoriaId: categoria.id,
  }

  // 2026: BRUNO 300, ANA 100, CARLA 50, DIEGO 0
  // 2025: ANA 1000, que NÃO pode entrar no total de 2026
  await prisma.despesa.createMany({
    data: [
      { ...base, id: 1, senadorCodigo: 1, ano: 2026, valor: '100.00' },
      { ...base, id: 2, senadorCodigo: 2, ano: 2026, valor: '300.00' },
      { ...base, id: 3, senadorCodigo: 3, ano: 2026, valor: '50.00' },
      { ...base, id: 4, senadorCodigo: 1, ano: 2025, valor: '1000.00' },
    ],
  })
})

afterAll(async () => {
  await app.close()
  await prisma.$disconnect()
})

// Atalho: chama a rota e devolve só a lista de códigos, na ordem
// Fazer uma requisição fake para a sua API e extrair uma lista com os códigos de todos os senadores retornados
async function codigos(url: string) {
  const res = await app.inject({ method: 'GET', url })
  return res.json().senadores.map((s: { codigo: number }) => s.codigo)
}

describe('GET /senadores', () => {
  it('lista todos com o total do ano, do maior para o menor', async () => {
    const res = await app.inject({ method: 'GET', url: '/senadores?ano=2026' })

    expect(res.statusCode).toBe(200)
    const corpo = res.json()
    expect(corpo.ano).toBe(2026)
    expect(corpo.quantidade).toBe(4)
    expect(corpo.senadores[0]).toEqual({
      codigo: 2,
      nome: 'BRUNO',
      partido: 'PL',
      uf: 'CE',
      urlFoto: null,
      emExercicio: true,
      total: 300,
    })
    expect(corpo.senadores.map((s: { total: number }) => s.total)).toEqual([
      300, 100, 50, 0,
    ])
  })

  it('filtra por UF, aceitando minúscula', async () => {
    expect(await codigos('/senadores?ano=2026&uf=ce')).toEqual([2, 1])
  })

  it('filtra por partido', async () => {
    expect(await codigos('/senadores?ano=2026&partido=pt')).toEqual([1, 3])
  })

  it('filtra só quem está em exercício', async () => {
    expect(await codigos('/senadores?ano=2026&emExercicio=true')).toEqual([
      2, 1, 4,
    ])
  })

  it('responde 400 quando falta o ano', async () => {
    const res = await app.inject({ method: 'GET', url: '/senadores' })
    expect(res.statusCode).toBe(400)
  })

  it('responde 400 para emExercicio que não é true nem false', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/senadores?ano=2026&emExercicio=talvez',
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /senadores/:codigo', () => {
  it('devolve o perfil com os anos que têm despesa, do mais recente', async () => {
    const res = await app.inject({ method: 'GET', url: '/senadores/1' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({
      codigo: 1,
      nome: 'ANA',
      nomeCompleto: null,
      partido: 'PT',
      uf: 'CE',
      urlFoto: null,
      emExercicio: true,
      anosComDespesa: [2026, 2025],
    })
  })

  it('devolve lista de anos vazia para quem não tem despesa', async () => {
    const res = await app.inject({ method: 'GET', url: '/senadores/4' })
    expect(res.statusCode).toBe(200)
    expect(res.json().anosComDespesa).toEqual([])
  })

  it('responde 404 para senador que não existe', async () => {
    const res = await app.inject({ method: 'GET', url: '/senadores/999' })
    expect(res.statusCode).toBe(404)
    expect(res.json().error.code).toBe('SENADOR_NAO_ENCONTRADO')
  })

  it('responde 400 para código inválido', async () => {
    const res = await app.inject({ method: 'GET', url: '/senadores/abc' })
    expect(res.statusCode).toBe(400)
  })
})
