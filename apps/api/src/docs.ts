import type { FastifyInstance } from 'fastify'
import swagger from '@fastify/swagger'
import { z } from 'zod'

// Converte um schema do Zod para JSON Schema, o formato que o Swagger entende.
// io: 'input' descreve o que a pessoa DIGITA na URL (antes do transform),
// e o $schema sai porque o OpenAPI não aceita esse campo dentro das rotas.
export function paraDoc(schema: z.ZodType) {
  const { $schema, ...jsonSchema } = z.toJSONSchema(schema, { io: 'input' })
  return jsonSchema
}

// Formato de erro que todas as rotas devolvem (400 e 404)
export const respostaErro = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'SENADOR_NAO_ENCONTRADO' },
        message: { type: 'string', example: 'Senador 999999 não encontrado' },
      },
    },
  },
} as const

// Página do Swagger UI. Os arquivos da interface vêm de uma CDN, e não do
// node_modules: assim a função da Vercel não precisa levar arquivos estáticos.
const paginaDocs = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API De Olho na Cota — documentação</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: '/docs/json', dom_id: '#swagger-ui' })
    </script>
  </body>
</html>`

// Registra a documentação. É uma função comum (e não um plugin com
// app.register) porque o swagger precisa ficar na raiz do app para enxergar
// as rotas registradas depois dele.
export function registrarDocs(app: FastifyInstance) {
  // As rotas validam com Zod dentro do handler (e devolvem o nosso formato de
  // erro). O schema de cada rota serve só para a documentação, então o
  // validador do Fastify fica desligado: deixa passar tudo para o Zod decidir.
  app.setValidatorCompiler(() => (data) => ({ value: data }))

  // Lê o schema de cada rota e monta o documento OpenAPI
  app.register(swagger, {
    openapi: {
      info: {
        title: 'API De Olho na Cota',
        description:
          'Gastos da cota parlamentar (CEAPS) e salário dos senadores, a partir dos dados abertos do Senado Federal. Sem cadastro e sem chave.',
        version: '1.0.0',
      },
      tags: [
        { name: 'Senadores', description: 'Lista e perfil' },
        { name: 'Gastos', description: 'Cota parlamentar e salário' },
        { name: 'Sistema', description: 'Saúde da API e atualização dos dados' },
      ],
    },
  })

  // O documento em JSON (para Bruno, Postman e outros sistemas) e a página
  app.get('/docs/json', { schema: { hide: true } }, async () => app.swagger())
  app.get('/docs', { schema: { hide: true } }, async (_request, reply) => {
    return reply.type('text/html').send(paginaDocs)
  })
}
