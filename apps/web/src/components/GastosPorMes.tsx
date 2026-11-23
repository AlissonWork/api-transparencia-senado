import { MESES, formatarReais } from '../formatar'

type Mes = { mes: number; total: number }

export function GastosPorMes({ meses }: { meses: Mes[] }) {
  const maior = Math.max(0, ...meses.map((m) => m.total))
  const celula = 'px-2 py-2 sm:px-3'

  return (
    <table className="w-full border border-linha">
      <caption className="sr-only">Gastos da cota mês a mês</caption>
      <thead className="bg-pri-clara text-left text-sm">
        <tr>
          <th scope="col" className={celula}>
            Mês
          </th>
          <th scope="col" className={`${celula} text-right`}>
            Gasto
          </th>
        </tr>
      </thead>
      <tbody>
        {meses.map((m) => {
          const eMaior = m.total === maior
          return (
            <tr
              key={m.mes}
              data-maior={eMaior}
              className="border-t border-linha"
            >
              <th
                scope="row"
                className={`${celula} text-left font-normal capitalize`}
              >
                {MESES[m.mes - 1]}
                {/* barra proporcional ao maior mês; só visual */}
                <span
                  aria-hidden="true"
                  className={`mt-1 block h-2 ${eMaior ? 'bg-dest' : 'bg-pri'}`}
                  style={{ width: `${maior ? (m.total / maior) * 100 : 0}%` }}
                />
              </th>
              <td
                className={`${celula} text-right align-top font-mono whitespace-nowrap`}
              >
                {formatarReais(m.total)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
