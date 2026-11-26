import { describe, it, expect } from 'vitest'
import { buildApp } from './build-app.js'

process.env.DATABASE_URL ??=
  'postgresql://senado:senado@localhost:5432/transparencia'

describe('GET /health', () => {
  it('responde status ok', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/health' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok' })
  })
})

describe('CORS', () => {
  it('libera o portal local a ler as respostas', async () => {
    const app = buildApp()
    // O navegador manda o cabeçalho Origin dizendo de que site veio a chamada
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://localhost:5173' },
    })

    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    )
  })

  it('não libera um site qualquer', async () => {
    const app = buildApp()
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://site-estranho.com' },
    })

    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})

describe('Documentação (/docs)', () => {
  it('entrega a página do Swagger UI', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/docs' })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toContain('text/html')
    expect(res.body).toContain('swagger-ui')
  })

  it('descreve todas as rotas no documento OpenAPI', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/docs/json' })
    const doc = res.json()

    expect(res.statusCode).toBe(200)
    expect(doc.openapi).toMatch(/^3\./)
    expect(Object.keys(doc.paths).sort()).toEqual([
      '/health',
      '/senadores',
      '/senadores/{codigo}',
      '/senadores/{codigo}/gastos',
      '/senadores/{codigo}/remuneracao',
      '/sincronizacao',
    ])
  })

  it('documenta o ano como obrigatório na lista de senadores', async () => {
    const app = buildApp()
    const doc = (await app.inject({ method: 'GET', url: '/docs/json' })).json()
    const ano = doc.paths['/senadores'].get.parameters.find(
      (p: { name: string }) => p.name === 'ano',
    )

    expect(ano).toMatchObject({ in: 'query', required: true })
  })
})
