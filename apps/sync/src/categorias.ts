import type { PrismaClient } from '@ts/db'

// Nome usado quando a despesa vem sem tipo
export const SEM_CATEGORIA = 'Não Informado'

// "Passagens aéreas, aquáticas..." → "passagens-aereas-aquaticas..."
export function gerarSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira acentos
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // tudo que não é letra/número vira "-"
    .replace(/^-|-$/g, '') // tira "-" das pontas
}

// Nome oficial (EXATAMENTE como está no banco) → nome curto para o portal
export const NOMES_CURTOS: Record<string, string> = {
  'Aluguel de imóveis para escritório político, compreendendo despesas concernentes a eles.':
    'Aluguel de escritório',
  'Aquisição de material de consumo para uso no escritório político, inclusive aquisição ou locação de software, despesas postais, aquisição de publicações, locação de móveis e de equipamentos.':
    'Material de escritório',
  'Contratação de consultorias, assessorias, pesquisas, trabalhos técnicos e outros serviços de apoio ao exercício do mandato parlamentar':
    'Consultorias e assessorias',
  'Divulgação da atividade parlamentar': 'Divulgação do mandato',
  'Locomoção, hospedagem, alimentação, combustíveis e lubrificantes':
    'Transporte, hospedagem e alimentação',
  'Passagens aéreas, aquáticas e terrestres nacionais': 'Passagens',
  'Serviços de Segurança Privada': 'Segurança privada',
  [SEM_CATEGORIA]: 'Não informado',
}

// Grava as 8 categorias com o nome curto. Pode rodar quantas vezes quiser.
// Recebe o prisma por parâmetro: no teste, entra um prisma falso.
export async function semearCategorias(prisma: PrismaClient) {
  for (const [nomeOficial, nomeCurto] of Object.entries(NOMES_CURTOS)) {
    await prisma.categoria.upsert({
      where: { nomeOficial },
      update: { nomeCurto },
      create: { nomeOficial, nomeCurto, slug: gerarSlug(nomeOficial) },
    })
  }
  return Object.keys(NOMES_CURTOS).length
}
