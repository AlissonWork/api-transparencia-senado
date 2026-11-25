import { useEffect, useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  buscarParaComparar,
  buscarSenadores,
  type DadosComparacao,
  type SenadorDaLista,
} from '../api'
import { ANO } from '../config'
import {
  juntarCategorias,
  juntarMeses,
  lerCodigo,
  ordenarPorNome,
} from '../comparar'
import { MESES } from '../formatar'
import { AvisoCarregando, AvisoErro } from '../components/Aviso'
import { FotoSenador } from '../components/Senador'
import {
  TabelaComparar,
  type LinhaComparar,
} from '../components/TabelaComparar'

// ===== A página =====

type EstadoLista =
  | { tipo: 'carregando' }
  | { tipo: 'erro' }
  | { tipo: 'pronto'; senadores: SenadorDaLista[] }

export function PaginaComparar() {
  const [params, setParams] = useSearchParams()
  const a = lerCodigo(params.get('a'))
  const b = lerCodigo(params.get('b'))

  const [lista, setLista] = useState<EstadoLista>({ tipo: 'carregando' })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false
    buscarSenadores(ANO)
      .then((senadores) => {
        if (!cancelado) {
          setLista({ tipo: 'pronto', senadores: ordenarPorNome(senadores) })
        }
      })
      .catch(() => {
        if (!cancelado) setLista({ tipo: 'erro' })
      })
    return () => {
      cancelado = true
    }
  }, [tentativa])

  // Escolher = reescrever um pedaço do endereço, mantendo o outro lado
  function escolher(lado: 'a' | 'b', codigo: string) {
    setParams((atual) => {
      const novo = new URLSearchParams(atual)
      if (codigo) novo.set(lado, codigo)
      else novo.delete(lado)
      return novo
    })
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 pt-3 pb-10">
      <h1 className="text-3xl font-bold text-pri-escura">Comparar senadores</h1>

      {lista.tipo === 'carregando' && (
        <AvisoCarregando texto="Carregando os senadores..." />
      )}

      {lista.tipo === 'erro' && (
        <AvisoErro
          onTentarDeNovo={() => {
            setLista({ tipo: 'carregando' })
            setTentativa((t) => t + 1)
          }}
        />
      )}

      {lista.tipo === 'pronto' && (
        <div className="grid gap-3 border border-linha bg-faixa p-3 sm:grid-cols-2">
          <SeletorSenador
            rotulo="Senador A"
            senadores={lista.senadores}
            valor={a}
            outro={b}
            onEscolher={(c) => escolher('a', c)}
          />
          <SeletorSenador
            rotulo="Senador B"
            senadores={lista.senadores}
            valor={b}
            outro={a}
            onEscolher={(c) => escolher('b', c)}
          />
        </div>
      )}

      {a && b ? (
        <CarregarComparacao key={`${a}-${b}`} a={a} b={b} />
      ) : (
        <p className="text-suave">Escolha dois senadores para comparar.</p>
      )}
    </div>
  )
}

// ===== Busca os dois senadores =====

type EstadoComparacao =
  | { tipo: 'carregando' }
  | { tipo: 'erro' }
  | { tipo: 'naoEncontrado' }
  | { tipo: 'pronto'; dadosA: DadosComparacao; dadosB: DadosComparacao }

function CarregarComparacao({ a, b }: { a: number; b: number }) {
  const [estado, setEstado] = useState<EstadoComparacao>({ tipo: 'carregando' })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false
    Promise.all([buscarParaComparar(a, ANO), buscarParaComparar(b, ANO)])
      .then(([dadosA, dadosB]) => {
        if (cancelado) return
        setEstado(
          dadosA && dadosB
            ? { tipo: 'pronto', dadosA, dadosB }
            : { tipo: 'naoEncontrado' },
        )
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: 'erro' })
      })
    return () => {
      cancelado = true
    }
  }, [a, b, tentativa])

  if (estado.tipo === 'carregando')
    return <AvisoCarregando texto="Carregando a comparação..." />
  if (estado.tipo === 'erro')
    return (
      <AvisoErro
        onTentarDeNovo={() => {
          setEstado({ tipo: 'carregando' })
          setTentativa((t) => t + 1)
        }}
      />
    )
  if (estado.tipo === 'naoEncontrado')
    return (
      <p className="border border-linha bg-faixa p-4">
        Um dos senadores não foi encontrado.
      </p>
    )

  const { dadosA, dadosB } = estado
  const nomeA = dadosA.perfil.nome
  const nomeB = dadosB.perfil.nome
  const gastosA = dadosA.gastos
  const gastosB = dadosB.gastos

  const resumo: LinhaComparar[] = [
    {
      rotulo: 'Total gasto com a cota',
      a: gastosA?.total ?? null,
      b: gastosB?.total ?? null,
    },
    {
      rotulo: 'Salário líquido no ano',
      a: dadosA.remuneracao?.totalLiquido ?? null,
      b: dadosB.remuneracao?.totalLiquido ?? null,
    },
  ]

  const categorias: LinhaComparar[] = juntarCategorias(
    gastosA?.porCategoria ?? [],
    gastosB?.porCategoria ?? [],
  ).map((l) => ({ rotulo: l.categoria, a: l.a, b: l.b }))

  const meses: LinhaComparar[] = juntarMeses(
    gastosA?.porMes ?? [],
    gastosB?.porMes ?? [],
  ).map((l) => ({ rotulo: MESES[l.mes - 1], a: l.a, b: l.b }))

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3">
        <Cartao dados={dadosA} />
        <Cartao dados={dadosB} />
      </div>
      <TabelaComparar
        titulo={`Resumo de ${ANO}`}
        nomeA={nomeA}
        nomeB={nomeB}
        linhas={resumo}
      />
      {categorias.length > 0 && (
        <TabelaComparar
          titulo="Gastos da cota por categoria"
          nomeA={nomeA}
          nomeB={nomeB}
          linhas={categorias}
        />
      )}
      {meses.length > 0 && (
        <TabelaComparar
          titulo="Gastos da cota mês a mês"
          nomeA={nomeA}
          nomeB={nomeB}
          linhas={meses}
        />
      )}
    </div>
  )
}

// Foto, nome (com link para o perfil) e partido-UF de um lado
function Cartao({ dados }: { dados: DadosComparacao }) {
  const p = dados.perfil
  return (
    <div className="flex flex-col items-center gap-2 border border-linha p-3 text-center sm:flex-row sm:text-left">
      <FotoSenador url={p.urlFoto} nome={p.nome} />
      <div>
        <Link
          to={`/senador/${p.codigo}`}
          className="font-bold text-pri underline"
        >
          {p.nome}
        </Link>
        <p className="text-sm text-suave">
          {p.partido ?? 'sem partido'}-{p.uf ?? '?'}
        </p>
      </div>
    </div>
  )
}

// ===== O seletor de um lado =====

type PropsSeletor = {
  rotulo: string
  senadores: SenadorDaLista[]
  valor: number | null
  outro: number | null // o escolhido do outro lado
  onEscolher: (codigo: string) => void
}

function SeletorSenador({
  rotulo,
  senadores,
  valor,
  outro,
  onEscolher,
}: PropsSeletor) {
  const id = useId() // id único, para o <label> apontar para o <select>

  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="font-bold">
        {rotulo}
      </label>
      <select
        id={id}
        value={valor ?? ''}
        onChange={(e) => onEscolher(e.target.value)}
        className="border border-linha bg-white px-2 py-2"
      >
        <option value="">Escolha um senador</option>
        {senadores.map((s) => (
          <option key={s.codigo} value={s.codigo} disabled={s.codigo === outro}>
            {s.nome} ({s.partido ?? 'sem partido'}-{s.uf ?? '?'})
          </option>
        ))}
      </select>
    </div>
  )
}
