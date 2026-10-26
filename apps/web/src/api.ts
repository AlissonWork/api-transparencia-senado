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
