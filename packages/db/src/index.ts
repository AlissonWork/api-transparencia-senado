import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

export * from '../generated/prisma/client.js'

export function criarPrisma(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error('DATABASE_URL não definida')
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}
