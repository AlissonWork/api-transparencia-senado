import type { PrismaClient } from '@ts/db'

// Os filtros que a rota já validou. O "?" quer dizer opcional:
// quando o usuário não manda, o valor é undefined.
export type FiltrosSenadores = {
  ano: number
  uf?: string
  partido?: string
  emExercicio?: boolean
}

// Recebe o prisma por parâmetro em vez de criar o próprio
export function criarRepositorioSenadores(prisma: PrismaClient) {
  return {
    async listarComTotal({ ano, uf, partido, emExercicio }: FiltrosSenadores) {
      // 1. Os senadores que passam nos filtros.
      //    No Prisma, um campo undefined no where é IGNORADO:
      //    { uf: undefined } = "não filtre por UF".
      const senadores = await prisma.senador.findMany({
        where: { uf, partido, emExercicio },
        select: {
          codigo: true,
          nome: true,
          partido: true,
          uf: true,
          urlFoto: true,
          emExercicio: true,
        },
      })

      // 2. O total do ano de cada um, em UMA consulta só:
      //    SELECT senador_codigo, SUM(valor) FROM despesas
      //    WHERE ano = $1 AND senador_codigo IN (...) GROUP BY senador_codigo
      const totais = await prisma.despesa.groupBy({
        by: ['senadorCodigo'],
        where: { ano, senadorCodigo: { in: senadores.map((s) => s.codigo) } },
        _sum: { valor: true },
      })

      // 3. Junta as duas listas pelo código
      const totalPorCodigo = new Map(
        totais.map((t) => [t.senadorCodigo, Number(t._sum.valor ?? 0)]),
      )

      return senadores
        .map((s) => ({ ...s, total: totalPorCodigo.get(s.codigo) ?? 0 }))
        .sort((a, b) => b.total - a.total) // maior gasto primeiro
    },

    async buscarPerfil(codigo: number) {
      // findUnique: busca pela chave primária. Devolve o registro ou null.
      const senador = await prisma.senador.findUnique({
        where: { codigo },
        select: {
          codigo: true,
          nome: true,
          nomeCompleto: true,
          partido: true,
          uf: true,
          urlFoto: true,
          emExercicio: true,
        },
      })
      // Não achou: devolve null. Quem decide que isso vira 404 é a rota.
      if (!senador) return null

      // SELECT DISTINCT ano FROM despesas WHERE senador_codigo = $1 ORDER BY ano DESC
      const anos = await prisma.despesa.findMany({
        where: { senadorCodigo: codigo },
        distinct: ['ano'],
        select: { ano: true },
        orderBy: { ano: 'desc' },
      })

      // [{ ano: 2026 }, { ano: 2025 }] vira [2026, 2025]
      return { ...senador, anosComDespesa: anos.map((a) => a.ano) }
    },
  }
}
