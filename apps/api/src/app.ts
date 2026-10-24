import Fastify from 'fastify'
import cors from '@fastify/cors'
import { rotasDespesas } from './routes/despesas.js'
import { rotasSenadores } from './routes/senadores.js'

export function buildApp() {
  // Em teste, o Vitest define NODE_ENV=test: desliga o log de cada requisição
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' })

  // Quem pode ler as respostas da API pelo navegador.
  // Lista (e não texto): o plugin compara com a origem de quem pediu
  // e só manda o cabeçalho se ela estiver aqui.
  // Em produção, CORS_ORIGIN pode ter vários endereços separados por vírgula.
  app.register(cors, {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','),
  })

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  app.register(rotasDespesas)
  app.register(rotasSenadores)

  return app
}
