import { describe, it, expect } from 'vitest'
import { buildApp } from './app.js'

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
