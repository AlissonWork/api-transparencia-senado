import { Link, useParams } from 'react-router'

export function PaginaPerfil() {
  // Lê o :codigo do endereço (/senador/5672 → "5672")
  const { codigo } = useParams()

  return (
    <div className="mx-auto grid max-w-6xl gap-3 px-4 pt-3 pb-10">
      <p className="text-sm text-suave">
        <Link to="/" className="text-pri underline">
          Início › Senadores
        </Link>{' '}
        › Senador {codigo}
      </p>
      <p className="border border-linha bg-faixa p-4">
        Em construção: o perfil do senador {codigo} entra no passo 3.
      </p>
    </div>
  )
}
