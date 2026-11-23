import type { FastifyInstance } from 'fastify'
import { criarPrisma } from '@ts/db'

export async function rotasSincronizacao(app: FastifyInstance) {
  const prisma = criarPrisma()
  app.addHook('onClose', () => prisma.$disconnect())

  app.get('/sincronizacao', async () => {
    const ultima = await prisma.sincronizacao.findFirst({
      where: { status: 'ok', finalizadaEm: { not: null } },
      orderBy: { finalizadaEm: 'desc' },
      select: { finalizadaEm: true },
    })

    return { atualizadoEm: ultima?.finalizadaEm ?? null }
  })
}
