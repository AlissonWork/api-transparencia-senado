import Fastify from 'fastify'
import { rotasDespesas } from './routes/despesas.js'
import { rotasSenadores } from './routes/senadores.js'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.register(rotasDespesas)
  app.register(rotasSenadores)

  return app
}
