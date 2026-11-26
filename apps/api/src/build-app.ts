import Fastify from 'fastify'
import cors from '@fastify/cors'
import { registrarDocs } from './docs.js'
import { rotasDespesas } from './routes/despesas.js'
import { rotasSenadores } from './routes/senadores.js'
import { rotasRemuneracao } from './routes/remuneracao.js'
import { rotasSincronizacao } from './routes/sincronizacao.js'

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

  // Documentação em /docs. Vem antes das rotas para o swagger ler o schema delas.
  registrarDocs(app)

  // Dentro de um register, como as outras rotas: o swagger também é um
  // register, e só enxerga as rotas que entram na fila depois dele.
  app.register(async (app) => {
    const doc = { tags: ['Sistema'], summary: 'Confere se a API está no ar' }
    app.get('/health', { schema: doc }, async () => {
      return { status: 'ok' }
    })
  })

  app.register(rotasDespesas)
  app.register(rotasSenadores)
  app.register(rotasRemuneracao)
  app.register(rotasSincronizacao)

  return app
}
