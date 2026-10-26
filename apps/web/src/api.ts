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

export async function buscarSenadores(ano: number): Promise<SenadorDaLista[]> {
  const res = await fetch(`${API_URL}/senadores?ano=${ano}`)

  // fetch só falha sozinho quando a rede cai. Um 400 ou 500 "dá certo"
  // para ele, então somos nós que conferimos o status.
  if (!res.ok) {
    throw new Error(`A API respondeu ${res.status}`)
  }

  const dados: RespostaLista = await res.json()
  return dados.senadores
}
