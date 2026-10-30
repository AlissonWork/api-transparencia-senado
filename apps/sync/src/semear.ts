import { existsSync } from 'node:fs'
import { criarPrisma } from '@ts/db'
import { semearCategorias } from './categorias.js'

// Carrega o .env da raiz (DATABASE_URL), igual ao index.ts
const env = new URL('../../../.env', import.meta.url)
if (existsSync(env)) process.loadEnvFile(env)

const prisma = criarPrisma()

try {
  const total = await semearCategorias(prisma)
  console.log(`${total} categorias com nome curto`)
} finally {
  await prisma.$disconnect()
}
