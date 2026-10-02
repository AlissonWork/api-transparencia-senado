import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { criarPrisma } from '@ts/db'

const paramsSchema = z.object({ codigo: z.coerce.number().int().positive() })
const querySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
})

export async function rotasDespesas(app: FastifyInstance) {
  // criado aqui dentro (e não no topo) para o .env já estar carregado
  const prisma = criarPrisma()
  app.addHook('onClose', () => prisma.$disconnect())

  app.get('/senadores/:codigo/gastos', async (request, reply) => {
    // 1. Valida a entrada: código numérico e ano obrigatório
    const params = paramsSchema.safeParse(request.params)
    const query = querySchema.safeParse(request.query)
    if (!params.success || !query.success) {
      return reply.status(400).send({
        error: {
          code: 'PARAMETROS_INVALIDOS',
          message: 'Use /senadores/{codigo}/gastos?ano=2026',
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

    // 3. O banco agrupa e soma (GROUP BY categoria_id + SUM(valor))
    const grupos = await prisma.despesa.groupBy({
      by: ['categoriaId'],
      where: { senadorCodigo: codigo, ano },
      _sum: { valor: true },
      _count: { _all: true },
    })

    // 4. Busca os nomes das categorias e monta a resposta
    const categorias = await prisma.categoria.findMany({
      where: { id: { in: grupos.map((g) => g.categoriaId) } },
    })
    const porId = new Map(categorias.map((c) => [c.id, c]))

    const porCategoria = grupos
      .map((g) => {
        const c = porId.get(g.categoriaId)!
        return {
          categoria: c.nomeCurto ?? c.nomeOficial, // nome curto quando o seed existir
          slug: c.slug,
          quantidade: g._count._all,
          total: Number(g._sum.valor ?? 0),
        }
      })
      .sort((a, b) => b.total - a.total) // maior gasto primeiro

    const total = porCategoria.reduce((soma, c) => soma + c.total, 0)

    return { senador, ano, total: Number(total.toFixed(2)), porCategoria }
  })
}
