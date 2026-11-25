import { formatarReais } from '../formatar'

export type LinhaComparar = {
  rotulo: string
  a: number | null // null = sem dado (mostra um traço)
  b: number | null
}

type Props = {
  titulo: string
  nomeA: string
  nomeB: string
  linhas: LinhaComparar[]
}

export function TabelaComparar({ titulo, nomeA, nomeB, linhas }: Props) {
  const celula = 'px-2 py-2 sm:px-3'

  return (
    <table className="w-full border border-linha text-sm sm:text-base">
      <caption className="mb-1 text-left text-lg font-bold text-pri-escura">
        {titulo}
      </caption>
      <thead className="bg-pri-clara text-left">
        <tr>
          <th scope="col" className={celula}>
            <span className="sr-only">Item</span>
          </th>
          <th scope="col" className={`${celula} text-right`}>
            {nomeA}
          </th>
          <th scope="col" className={`${celula} text-right`}>
            {nomeB}
          </th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((l) => (
          <tr key={l.rotulo} className="border-t border-linha">
            <th scope="row" className={`${celula} text-left font-normal`}>
              {l.rotulo}
            </th>
            <Valor valor={l.a} outro={l.b} classe={celula} />
            <Valor valor={l.b} outro={l.a} classe={celula} />
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Uma célula de valor. Quem gastou mais na linha fica em azul e negrito.
function Valor({
  valor,
  outro,
  classe,
}: {
  valor: number | null
  outro: number | null
  classe: string
}) {
  const maior = valor !== null && valor > (outro ?? 0)

  return (
    <td
      data-maior={maior}
      className={`${classe} text-right font-mono whitespace-nowrap ${maior ? 'font-bold text-dest' : ''}`}
    >
      {valor === null ? '—' : formatarReais(valor)}
      {maior && <span className="sr-only"> (maior)</span>}
    </td>
  )
}
