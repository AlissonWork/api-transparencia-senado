import Fastify from 'fastify'
import { rotasDespesas } from './routes/despesas.js'
import { rotasSenadores } from './routes/senadores.js'

export function buildApp() {
  // Em teste, o Vitest define NODE_ENV=test: desliga o log de cada requisição
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.register(rotasDespesas)
  app.register(rotasSenadores)

  return app
}
