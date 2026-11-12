import type { PrismaClient } from '@ts/db'
import { z } from 'zod'

// "46.366,19" → 46366.19. Se já vier número, devolve como está.
export function paraNumero(valor: string | number): number {
  if (typeof valor === 'number') return valor
  return Number(valor.replace(/\./g, '').replace(',', '.'))
}

// Partículas que um cadastro escreve e outro não ("Alves de Sousa" x "Alves Sousa")
const PARTICULAS = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E'])

// Deixa dois nomes comparáveis: sem acento, maiúsculo, sem partículas e espaços extras
export function normalizar(nome: string): string {
  return nome
    .normalize('NFD') // "é" vira "e" + acento separado
    .replace(/[̀-ͯ]/g, '') // apaga os acentos soltos
    .toUpperCase()
    .split(/\s+/) // quebra em palavras
    .filter((palavra) => palavra !== '' && !PARTICULAS.has(palavra))
    .join(' ')
}

// Campo de dinheiro: texto (ou número) que sai do Zod já convertido em number
const dinheiro = z
  .union([z.string(), z.number(), z.null()])
  .transform((v) => (v === null ? 0 : paraNumero(v)))

export const linhaFolhaSchema = z.object({
  nome: z.string(),
  ano: z.number(),
  mes: z.number(),
  tipo_folha: z.string(),
  remuneracao_basica: dinheiro,
  vantagens_pessoais: dinheiro,
  gratificacao_natalina: dinheiro,
  diarias: dinheiro,
  auxilios: dinheiro,
  vantagens_indenizatorias: dinheiro,
  outras_eventuais: dinheiro,
  abono_permanencia: dinheiro,
  horas_extras: dinheiro,
  previdencia: dinheiro,
  imposto_renda: dinheiro,
  reversao_teto_constitucional: dinheiro,
  faltas: dinheiro,
  remuneracao_liquida: dinheiro,
})

export type LinhaFolha = z.infer<typeof linhaFolhaSchema>

// ---------- Internet: buscar a folha de um mês ----------

const BASE_ADM = 'https://adm.senado.gov.br/adm-dadosabertos/api/v1'

// Devolve as linhas SEM validar: são ~11 mil servidores, e só vamos validar
// as dos senadores. Um servidor com campo estranho não pode derrubar o sync.
export async function buscarFolha(
  ano: number,
  mes: number,
): Promise<unknown[]> {
  const resposta = await fetch(
    `${BASE_ADM}/servidores/remuneracoes/${ano}/${mes}`,
    {
      headers: { Accept: 'application/json' },
    },
  )
  if (resposta.status === 404) return [] // mês ainda não publicado
  if (!resposta.ok) {
    throw new Error(
      `Senado respondeu ${resposta.status} ao buscar a folha de ${mes}/${ano}`,
    )
  }
  return z.array(z.unknown()).parse(await resposta.json())
}

// ---------- Conversão pura: linha da folha → linha da tabela remuneracoes ----------

export function converterRemuneracao(l: LinhaFolha, senadorCodigo: number) {
  const dec = (v: number) => v.toFixed(2) // texto "46366.19": Decimal sem erro de arredondamento
  return {
    senadorCodigo,
    ano: l.ano,
    mes: l.mes,
    tipoFolha: l.tipo_folha,
    remuneracaoBasica: dec(l.remuneracao_basica),
    vantagensPessoais: dec(l.vantagens_pessoais),
    gratificacaoNatalina: dec(l.gratificacao_natalina),
    diarias: dec(l.diarias),
    auxilios: dec(l.auxilios),
    vantagensIndenizatorias: dec(l.vantagens_indenizatorias),
    outrasEventuais: dec(l.outras_eventuais),
    abonoPermanencia: dec(l.abono_permanencia),
    horasExtras: dec(l.horas_extras),
    previdencia: dec(l.previdencia),
    impostoRenda: dec(l.imposto_renda),
    reversaoTeto: dec(l.reversao_teto_constitucional),
    faltas: dec(l.faltas),
    remuneracaoLiquida: dec(l.remuneracao_liquida),
  }
}

// ---------- Banco: sincronizar o ano inteiro ----------

// Recebe o prisma por parâmetro (injeção de dependência), como o semearCategorias
export async function sincronizarRemuneracoes(
  prisma: PrismaClient,
  ano: number,
) {
  const senadores = await prisma.senador.findMany({
    where: { emExercicio: true },
    select: { codigo: true, nome: true, nomeCompleto: true },
  })
  // Map "nome normalizado → código": a ponte entre a folha (só nome) e o nosso banco
  const codigoPorNome = new Map(
    senadores.map((s) => [normalizar(s.nomeCompleto ?? s.nome), s.codigo]),
  )

  const encontrados = new Set<number>()
  let gravadas = 0

  for (let mes = 1; mes <= 12; mes++) {
    for (const bruta of await buscarFolha(ano, mes)) {
      const nome = (bruta as { nome?: unknown }).nome
      if (typeof nome !== 'string') continue
      const codigo = codigoPorNome.get(normalizar(nome))
      if (codigo === undefined) continue // é servidor, não senador

      const dados = converterRemuneracao(linhaFolhaSchema.parse(bruta), codigo)
      await prisma.remuneracao.upsert({
        where: {
          senadorCodigo_ano_mes_tipoFolha: {
            senadorCodigo: codigo,
            ano: dados.ano,
            mes: dados.mes,
            tipoFolha: dados.tipoFolha,
          },
        },
        update: dados,
        create: dados,
      })
      encontrados.add(codigo)
      gravadas++
    }
  }

  const semFolha = senadores.filter((s) => !encontrados.has(s.codigo))
  if (semFolha.length > 0) {
    console.warn(
      'Sem folha:',
      semFolha.map((s) => s.nomeCompleto ?? s.nome).join(', '),
    )
  }
  return gravadas
}
