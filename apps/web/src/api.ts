import { API_URL } from './config'

// O formato de cada senador que GET /senadores devolve.
// Os mesmos campos que o repository da API monta (veja o select dele).
export type SenadorDaLista = {
  codigo: number
  nome: string
  partido: string | null
  uf: string | null
  urlFoto: string | null
  emExercicio: boolean
  suplenteDe: string | null // nome do titular; null = é o titular
  total: number
}

type RespostaLista = {
  ano: number
  quantidade: number
  senadores: SenadorDaLista[]
}

// GET /senadores/:codigo
export type PerfilSenador = {
  codigo: number
  nome: string
  nomeCompleto: string | null
  partido: string | null
  uf: string | null
  urlFoto: string | null
  emExercicio: boolean
  suplenteDe: string | null // nome do titular; null = é o titular
  anosComDespesa: number[]
}

// GET /senadores/:codigo/gastos?ano=
export type GastoPorCategoria = {
  categoria: string
  slug: string
  quantidade: number
  total: number
}

export type GastosDoAno = {
  senador: { codigo: number; nome: string }
  ano: number
  total: number
  porCategoria: GastoPorCategoria[]
  porMes: { mes: number; total: number }[]
}

// Faz o GET e devolve o JSON já com o tipo T.
// 404 vira null ("não existe"); qualquer outro erro vira exceção.
async function pedir<T>(caminho: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${caminho}`)

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`A API respondeu ${res.status}`)
  }

  return res.json()
}

// ===== As funções que as páginas usam =====

export async function buscarSenadores(ano: number): Promise<SenadorDaLista[]> {
  const dados = await pedir<RespostaLista>(`/senadores?ano=${ano}`)
  return dados?.senadores ?? []
}

export function buscarPerfil(codigo: number) {
  return pedir<PerfilSenador>(`/senadores/${codigo}`)
}

export function buscarGastos(codigo: number, ano: number) {
  return pedir<GastosDoAno>(`/senadores/${codigo}/gastos?ano=${ano}`)
}

// GET /senadores/:codigo/remuneracao?ano=
export type RemuneracaoDoAno = {
  senador: { codigo: number; nome: string }
  ano: number
  meses: { mes: number; subsidio: number; liquido: number }[]
  totalLiquido: number
}

export function buscarRemuneracao(codigo: number, ano: number) {
  return pedir<RemuneracaoDoAno>(`/senadores/${codigo}/remuneracao?ano=${ano}`)
}

// GET /sincronizacao
export type Atualizacao = { atualizadoEm: string | null }

export function buscarAtualizacao() {
  return pedir<Atualizacao>('/sincronizacao')
}

// Tudo que a comparação precisa de UM senador
export type DadosComparacao = {
  perfil: PerfilSenador
  gastos: GastosDoAno | null
  remuneracao: RemuneracaoDoAno | null
}

export async function buscarParaComparar(codigo: number, ano: number) {
  // As 3 saem juntas; esperar uma por uma seria 3x mais lento
  const [perfil, gastos, remuneracao] = await Promise.all([
    buscarPerfil(codigo),
    buscarGastos(codigo, ano),
    buscarRemuneracao(codigo, ano),
  ])
  if (!perfil) return null // senador não existe
  return { perfil, gastos, remuneracao }
}
