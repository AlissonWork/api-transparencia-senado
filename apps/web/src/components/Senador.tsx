// Pedaços de tela do senador usados na lista e no perfil

type PropsFoto = {
  url: string | null
  nome: string
  grande?: boolean
}

export function FotoSenador({ url, nome, grande = false }: PropsFoto) {
  const tamanho = grande ? 'size-24 text-3xl' : 'size-12'

  // Sem foto: um quadrado com a inicial do nome
  if (!url) {
    return (
      <span
        aria-hidden="true"
        className={`grid ${tamanho} shrink-0 place-items-center border border-linha bg-faixa font-bold text-suave`}
      >
        {nome[0]}
      </span>
    )
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      className={`${tamanho} shrink-0 border border-linha object-cover`}
    />
  )
}

export function SeloSituacao({ emExercicio }: { emExercicio: boolean }) {
  return emExercicio ? (
    <span className="inline-block border border-ok bg-ok-clara px-1.5 text-xs font-bold text-ok">
      No cargo hoje
    </span>
  ) : (
    <span className="inline-block border border-linha bg-faixa px-1.5 text-xs font-bold text-suave">
      Fora do cargo
    </span>
  )
}
