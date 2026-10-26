// Criado uma vez só e reaproveitado
const reais = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

// 312450.18 vira "R$ 312.450,18"
export function formatarReais(valor: number) {
  return reais.format(valor)
}

// "João" vira "joao": para a busca achar o nome com ou sem acento
export function semAcento(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

// 0.38 vira "38%"
const porcentagem = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
})

export function formatarPorcentagem(parte: number) {
  return porcentagem.format(parte)
}
