import { z } from 'zod'

// Endereço base da API administrativa do Senado (onde fica a CEAPS)
const BASE_ADM = 'https://adm.senado.gov.br/adm-dadosabertos/api/v1'

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
