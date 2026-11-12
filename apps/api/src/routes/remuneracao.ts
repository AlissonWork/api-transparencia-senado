import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { criarPrisma } from '@ts/db'

const paramsSchema = z.object({ codigo: z.coerce.number().int().positive() })
const querySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
})

export async function rotasRemuneracao(app: FastifyInstance) {
  const prisma = criarPrisma()
  app.addHook('onClose', () => prisma.$disconnect())

  app.get('/senadores/:codigo/remuneracao', async (request, reply) => {
    // 1. Valida a entrada
    const params = paramsSchema.safeParse(request.params)
    const query = querySchema.safeParse(request.query)
    if (!params.success || !query.success) {
      return reply.status(400).send({
        error: {
          code: 'PARAMETROS_INVALIDOS',
          message: 'Use /senadores/{codigo}/remuneracao?ano=2026',
        },
      })
    }
    const { codigo } = params.data
    const { ano } = query.data

    // 2. O senador existe?
    const senador = await prisma.senador.findUnique({
      where: { codigo },
      select: { codigo: true, nome: true },
    })
    if (!senador) {
      return reply.status(404).send({
        error: {
          code: 'SENADOR_NAO_ENCONTRADO',
          message: `Senador ${codigo} não encontrado`,
        },
      })
    }
    // 3. Soma por mês: junta a folha Normal e a Suplementar do mesmo mês
    const grupos = await prisma.remuneracao.groupBy({
      by: ['mes'],
      where: { senadorCodigo: codigo, ano },
      _sum: { remuneracaoBasica: true, remuneracaoLiquida: true },
      orderBy: { mes: 'asc' },
    })

    const meses = grupos.map((g) => ({
      mes: g.mes,
      subsidio: Number(g._sum.remuneracaoBasica ?? 0), // o "salário" antes dos descontos
      liquido: Number(g._sum.remuneracaoLiquida ?? 0), // o que cai na conta
    }))
    const totalLiquido = meses.reduce((soma, m) => soma + m.liquido, 0)

    // Lista vazia é resposta válida (200): o senador existe, só não está na folha
    return {
      senador,
      ano,
      meses,
      totalLiquido: Number(totalLiquido.toFixed(2)),
    }
  })
}
