import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { criarPrisma } from '@ts/db'
import { criarRepositorioSenadores } from '../repositories/senadores.js'

// O que a URL pode trazer. Tudo na query string chega como TEXTO.
const listaQuerySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
  uf: z
    .string()
    .length(2)
    .transform((v) => v.toUpperCase())
    .optional(),
  partido: z
    .string()
    .min(1)
    .transform((v) => v.toUpperCase())
    .optional(),
  // NÃO use z.coerce.boolean(): Boolean('false') é true!
  emExercicio: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

export async function rotasSenadores(app: FastifyInstance) {
  const prisma = criarPrisma()
  app.addHook('onClose', () => prisma.$disconnect())
  const repositorio = criarRepositorioSenadores(prisma)

  app.get('/senadores', async (request, reply) => {
    // 1. Valida a query string
    const query = listaQuerySchema.safeParse(request.query)
    if (!query.success) {
      return reply.status(400).send({
        error: {
          code: 'PARAMETROS_INVALIDOS',
          message:
            'Use /senadores?ano=2026 (opcionais: uf, partido, emExercicio=true|false)',
        },
      })
    }

    // 2. Pede os dados ao repository (a rota não sabe como ele consulta)
    const senadores = await repositorio.listarComTotal(query.data)

    // 3. Monta a resposta
    return { ano: query.data.ano, quantidade: senadores.length, senadores }
  })
}
