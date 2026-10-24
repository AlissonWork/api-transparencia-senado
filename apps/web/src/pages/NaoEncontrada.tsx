import { Link } from 'react-router'

export function PaginaNaoEncontrada() {
  return (
    <div className="mx-auto grid max-w-6xl gap-3 px-4 pt-6 pb-10">
      <h1 className="text-3xl font-bold text-pri-escura">
        Página não encontrada
      </h1>
      <p>O endereço que você abriu não existe neste portal.</p>
      <p>
        <Link to="/" className="font-bold text-pri underline">
          Ver a lista de senadores
        </Link>
      </p>
    </div>
  )
}
