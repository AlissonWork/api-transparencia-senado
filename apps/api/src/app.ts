import Fastify from 'fastify'
import { rotasDespesas } from './routes/despesas.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.register(rotasDespesas)

  return app
}
