import type { FastifyInstance } from 'fastify'
import { criarPrisma } from '@ts/db'

export async function rotasSincronizacao(app: FastifyInstance) {
  const prisma = criarPrisma()
  app.addHook('onClose', () => prisma.$disconnect())

  const doc = {
    tags: ['Sistema'],
    summary: 'Data da última atualização dos dados',
    description: 'Fim do último sync que deu certo; null antes do primeiro sync.',
  }

  app.get('/sincronizacao', { schema: doc }, async () => {
    const ultima = await prisma.sincronizacao.findFirst({
      where: { status: 'ok', finalizadaEm: { not: null } },
      orderBy: { finalizadaEm: 'desc' },
      select: { finalizadaEm: true },
    })

    return { atualizadoEm: ultima?.finalizadaEm ?? null }
  })
}
