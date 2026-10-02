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
