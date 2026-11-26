import { existsSync } from 'node:fs'
import { buildApp } from './build-app.js'
// A Vercel só aceita como entrada um arquivo que importe o fastify diretamente
import 'fastify'

const env = new URL('../../../.env', import.meta.url)
if (existsSync(env)) process.loadEnvFile(env)

const port = Number(process.env.PORT ?? 3333)

const app = buildApp()

try {
  await app.listen({ port, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
