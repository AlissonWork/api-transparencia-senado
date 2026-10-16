import { z } from 'zod'

// Endereço base da API administrativa do Senado (onde fica a CEAPS)
const BASE_ADM = 'https://adm.senado.gov.br/adm-dadosabertos/api/v1'

// Endereço base da API legislativa (senadores, partidos, mandatos)
const BASE_LEGIS = 'https://legis.senado.leg.br/dadosabertos'

// "Molde" de UMA despesa como o Senado manda.
// O Zod confere cada item contra esse molde.
const despesaSchema = z.object({
  id: z.number(),
  ano: z.number(),
  mes: z.number(),
  codSenador: z.number(),
  nomeSenador: z.string(),
  tipoDespesa: z.string().nullable(),
  fornecedor: z.string(),
  cpfCnpj: z.string(),
  documento: z.string().nullable(),
  data: z.string().nullable(),
  valorReembolsado: z.number(),
  tipoDocumento: z.string().nullable(),
})

// Molde de UM senador da lista "em exercício". Só os campos que usamos;
// o Zod descarta o resto (telefones, bloco, suplentes...).
export const parlamentarSchema = z.object({
  IdentificacaoParlamentar: z.object({
    CodigoParlamentar: z.coerce.number(), // vem como texto ("5672"); vira número
    NomeParlamentar: z.string(),
    NomeCompletoParlamentar: z.string(),
    UrlFotoParlamentar: z.string().optional(),
    SiglaPartidoParlamentar: z.string().optional(),
    UfParlamentar: z.string().length(2),
  }),
})

// A resposta inteira: a lista fica 3 níveis para dentro
const listaSchema = z.object({
  ListaParlamentarEmExercicio: z.object({
    Parlamentares: z.object({ Parlamentar: z.array(parlamentarSchema) }),
  }),
})

// Gera o TIPO TypeScript a partir do molde.
// Assim o editor sabe quais campos existem, sem escrever tudo duas vezes.
export type DespesaSenado = z.infer<typeof despesaSchema>

// Busca todas as despesas de um ano e devolve já validadas
export async function buscarDespesas(ano: number): Promise<DespesaSenado[]> {
  const resposta = await fetch(`${BASE_ADM}/senadores/despesas_ceaps/${ano}`)
  if (!resposta.ok) {
    throw new Error(
      `Senado respondeu ${resposta.status} ao buscar despesas de ${ano}`,
    )
  }

  // Valida a lista inteira. Se alguma despesa vier num formato diferente
  // (ex.: valor como texto), lança um erro dizendo qual campo falhou,
  // e nada chega ao banco.
  return z.array(despesaSchema).parse(await resposta.json())
}

export type ParlamentarSenado = z.infer<typeof parlamentarSchema>

// Converte do formato do Senado para o formato da nossa tabela.
// Função pura: fácil de testar sem internet nem banco.
export function converterParlamentar(p: ParlamentarSenado) {
  const id = p.IdentificacaoParlamentar
  return {
    codigo: id.CodigoParlamentar,
    nome: id.NomeParlamentar,
    nomeCompleto: id.NomeCompletoParlamentar,
    partido: id.SiglaPartidoParlamentar ?? null,
    uf: id.UfParlamentar,
    // http → https, senão o navegador bloqueia a foto no portal (conteúdo misto)
    urlFoto: id.UrlFotoParlamentar?.replace(/^http:\/\//, 'https://') ?? null,
  }
}

// Busca os 81 senadores em exercício, já validados e convertidos
export async function buscarSenadoresEmExercicio() {
  const resposta = await fetch(`${BASE_LEGIS}/senador/lista/atual`, {
    headers: { Accept: 'application/json' }, // sem isso o Senado responde em XML
  })
  if (!resposta.ok) {
    throw new Error(`Senado respondeu ${resposta.status} ao buscar senadores`)
  }
  const json = listaSchema.parse(await resposta.json())
  return json.ListaParlamentarEmExercicio.Parlamentares.Parlamentar.map(
    converterParlamentar,
  )
}
