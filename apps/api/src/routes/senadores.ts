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

// O :codigo da URL (/senadores/5672). Também chega como texto.
const perfilParamsSchema = z.object({
  codigo: z.coerce.number().int().positive(),
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

  app.get('/senadores/:codigo', async (request, reply) => {
    // 1. Valida o parâmetro de rota (o :codigo vem em request.params)
    const params = perfilParamsSchema.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({
        error: {
          code: 'PARAMETROS_INVALIDOS',
          message: 'Use /senadores/{codigo}, com o código numérico do senador',
        },
      })
    }

    const { codigo } = params.data

    // 2. Pede o perfil ao repository
    const perfil = await repositorio.buscarPerfil(codigo)

    // 3. null do repository vira 404 aqui, na camada que sabe de HTTP
    if (!perfil) {
      return reply.status(404).send({
        error: {
          code: 'SENADOR_NAO_ENCONTRADO',
          message: `Senador ${codigo} não encontrado`,
        },
      })
    }

    return perfil
  })
}
