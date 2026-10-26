import { formatarPorcentagem } from '../formatar'

type Props = {
  parte: number // de 0 a 1: 0.38 = 38% do total
  destaque?: boolean
}

// 10 quadrados: cada um vale cerca de 10% do total
export function Quadradinhos({ parte, destaque = false }: Props) {
  const cheios = Math.round(parte * 10)
  const cor = destaque ? 'border-dest bg-dest' : 'border-pri bg-pri'

  return (
    <span
      role="img"
      aria-label={`${formatarPorcentagem(parte)} do total`}
      title={formatarPorcentagem(parte)}
      className="inline-flex gap-0.5"
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`size-3 border ${i < cheios ? cor : 'border-linha bg-white'}`}
        />
      ))}
    </span>
  )
}
