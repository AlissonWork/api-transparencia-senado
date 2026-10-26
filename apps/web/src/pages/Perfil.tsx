import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'
import {
  buscarGastos,
  buscarPerfil,
  buscarSenadores,
  type GastosDoAno,
  type PerfilSenador,
  type SenadorDaLista,
} from '../api'
import { NOME_PORTAL } from '../config'
import { formatarReais } from '../formatar'
import { FotoSenador, SeloSituacao } from '../components/Senador'
import { Quadradinhos } from '../components/Quadradinhos'
import { AvisoCarregando, AvisoErro } from '../components/Aviso'

// ===== 1. Lê o código do endereço =====

export function PaginaPerfil() {
  // O :codigo chega como TEXTO. Number('abc') é NaN, que não é inteiro.
  const codigo = Number(useParams().codigo)

  if (!Number.isInteger(codigo) || codigo <= 0) {
    return <SenadorNaoEncontrado />
  }

  // key={codigo}: trocar de senador cria um CarregarPerfil novo, com estado zerado
  return <CarregarPerfil key={codigo} codigo={codigo} />
}

// ===== 2. Busca o perfil =====

type EstadoPerfil =
  | { tipo: 'carregando' }
  | { tipo: 'erro' }
  | { tipo: 'naoEncontrado' }
  | { tipo: 'pronto'; perfil: PerfilSenador }

function CarregarPerfil({ codigo }: { codigo: number }) {
  const [estado, setEstado] = useState<EstadoPerfil>({ tipo: 'carregando' })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false

    buscarPerfil(codigo)
      .then((perfil) => {
        if (cancelado) return
        setEstado(
          perfil ? { tipo: 'pronto', perfil } : { tipo: 'naoEncontrado' },
        )
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: 'erro' })
      })

    return () => {
      cancelado = true
    }
  }, [codigo, tentativa])

  // O nome do senador no título da aba do navegador
  useEffect(() => {
    if (estado.tipo !== 'pronto') return
    document.title = `${estado.perfil.nome} · ${NOME_PORTAL}`
    return () => {
      document.title = NOME_PORTAL
    }
  }, [estado])

  if (estado.tipo === 'naoEncontrado') return <SenadorNaoEncontrado />

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 pt-3 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-suave">
          <Link to="/" className="text-pri underline">
            Início › Senadores
          </Link>
          {estado.tipo === 'pronto' && ` › ${estado.perfil.nome}`}
        </p>
        <BotaoVoltar />
      </div>

      {estado.tipo === 'carregando' && (
        <AvisoCarregando texto="Carregando o senador..." />
      )}

      {estado.tipo === 'erro' && (
        <AvisoErro
          onTentarDeNovo={() => {
            setEstado({ tipo: 'carregando' })
            setTentativa((t) => t + 1)
          }}
        />
      )}

      {estado.tipo === 'pronto' && (
        <>
          <CabecalhoPerfil perfil={estado.perfil} />
          {estado.perfil.anosComDespesa.length === 0 ? (
            <p className="border border-linha bg-faixa p-4">
              Este senador não tem gastos com a cota registrados.
            </p>
          ) : (
            <GastosDoSenador perfil={estado.perfil} />
          )}
        </>
      )}
    </div>
  )
}

function SenadorNaoEncontrado() {
  return (
    <div className="mx-auto grid max-w-6xl gap-3 px-4 pt-6 pb-10">
      <h1 className="text-3xl font-bold text-pri-escura">
        Senador não encontrado
      </h1>
      <p>Não existe um senador com esse código no portal.</p>
      <p>
        <Link to="/" className="font-bold text-pri underline">
          Ver a lista de senadores
        </Link>
      </p>
    </div>
  )
}

function BotaoVoltar() {
  const navigate = useNavigate()
  const location = useLocation()

  // key "default" = a pessoa abriu o portal direto nesta página
  // (um link compartilhado). Aí não há "página anterior" do portal.
  const temAnterior = location.key !== 'default'

  return (
    <button
      type="button"
      onClick={() => (temAnterior ? navigate(-1) : navigate('/'))}
      className="border border-pri px-3 py-1 font-bold text-pri hover:bg-pri-clara"
    >
      ← Voltar
    </button>
  )
}

function CabecalhoPerfil({ perfil }: { perfil: PerfilSenador }) {
  return (
    <div className="flex items-center gap-4 border border-linha p-4">
      <FotoSenador url={perfil.urlFoto} nome={perfil.nome} grande />
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold text-pri-escura sm:text-3xl">
          {perfil.nome}
        </h1>
        {perfil.nomeCompleto && perfil.nomeCompleto !== perfil.nome && (
          <p className="text-sm text-suave">{perfil.nomeCompleto}</p>
        )}
        <p>
          {perfil.partido ?? 'Sem partido'} · {perfil.uf ?? '—'}
        </p>
        <div>
          <SeloSituacao emExercicio={perfil.emExercicio} />
        </div>
      </div>
    </div>
  )
}

// ===== 3. Escolhe o ano e busca os gastos =====

type EstadoGastos =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; ano: number }
  | {
      tipo: 'pronto'
      ano: number
      gastos: GastosDoAno
      lista: SenadorDaLista[]
    }

function GastosDoSenador({ perfil }: { perfil: PerfilSenador }) {
  // O ano mora no endereço (?ano=2025). Se não vier, ou vier um ano
  // sem gastos, usamos o mais recente (a API manda do mais novo para o mais velho).
  const [params, setParams] = useSearchParams()
  const anos = perfil.anosComDespesa
  const anoPedido = Number(params.get('ano'))
  const ano = anos.includes(anoPedido) ? anoPedido : anos[0]

  const [estado, setEstado] = useState<EstadoGastos>({ tipo: 'carregando' })
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false

    // As duas chamadas saem juntas; o .then só roda quando AS DUAS chegarem
    Promise.all([buscarGastos(perfil.codigo, ano), buscarSenadores(ano)])
      .then(([gastos, lista]) => {
        if (cancelado) return
        if (!gastos) {
          setEstado({ tipo: 'erro', ano })
          return
        }
        setEstado({ tipo: 'pronto', ano, gastos, lista })
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: 'erro', ano })
      })

    return () => {
      cancelado = true
    }
  }, [perfil.codigo, ano, tentativa])

  // Se o estado guardado é de OUTRO ano (a pessoa acabou de trocar),
  // ele está vencido: tratamos como "carregando".
  const atual =
    estado.tipo !== 'carregando' && estado.ano === ano ? estado : null

  return (
    <>
      <label className="flex items-center gap-2 font-bold">
        Ano
        <select
          value={ano}
          onChange={(e) =>
            setParams({ ano: e.target.value }, { replace: true })
          }
          className="border border-linha bg-white px-2 py-1.5 font-normal"
        >
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      {!atual && (
        <AvisoCarregando texto={`Carregando os gastos de ${ano}...`} />
      )}

      {atual?.tipo === 'erro' && (
        <AvisoErro
          onTentarDeNovo={() => {
            setEstado({ tipo: 'carregando' })
            setTentativa((t) => t + 1)
          }}
        />
      )}

      {atual?.tipo === 'pronto' && (
        <DetalheGastos
          perfil={perfil}
          gastos={atual.gastos}
          lista={atual.lista}
        />
      )}
    </>
  )
}

// ===== 4. Desenha o resumo e as tabelas =====

type PropsDetalhe = {
  perfil: PerfilSenador
  gastos: GastosDoAno
  lista: SenadorDaLista[]
}

function DetalheGastos({ perfil, gastos, lista }: PropsDetalhe) {
  const { ano, total, porCategoria } = gastos

  // Tudo derivado: nada disso é estado
  const notas = porCategoria.reduce((soma, c) => soma + c.quantidade, 0)
  const ranking = lista.map((s, i) => ({ ...s, posicao: i + 1 }))
  const posicao = ranking.find((s) => s.codigo === perfil.codigo)?.posicao
  const colegas = perfil.uf ? ranking.filter((s) => s.uf === perfil.uf) : []
  const maior = porCategoria[0] // a API já manda do maior para o menor

  return (
    <>
      <dl className="grid border border-linha bg-faixa sm:grid-cols-3">
        <ResumoItem
          titulo={`Total gasto em ${ano}`}
          valor={formatarReais(total)}
        />
        <ResumoItem
          titulo="Notas fiscais"
          valor={notas.toLocaleString('pt-BR')}
        />
        <ResumoItem
          titulo="Posição entre os senadores"
          valor={posicao ? `${posicao}º de ${lista.length}` : '—'}
        />
      </dl>

      {maior && (
        <p className="border-l-4 border-dest bg-dest-clara p-4 text-lg">
          O maior gasto deste senador em {ano} foi com{' '}
          <strong>{maior.categoria}</strong>: {formatarReais(maior.total)}.
        </p>
      )}

      <section className="grid gap-2">
        <h2 className="text-xl font-bold text-pri-escura">
          Em que o dinheiro foi gasto
        </h2>
        <table className="w-full border border-linha">
          <thead className="bg-pri-clara text-left text-sm">
            <tr>
              <th className="hidden px-3 py-2 sm:table-cell">#</th>
              <th className="px-3 py-2">Tipo de gasto</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2">Parte do total</th>
            </tr>
          </thead>
          <tbody>
            {porCategoria.map((c, i) => (
              <tr key={c.slug} className="border-t border-linha even:bg-faixa">
                <td className="hidden px-3 py-2 font-mono text-suave sm:table-cell">
                  {i + 1}
                </td>
                <td className="px-3 py-2">
                  <p className="font-bold">{c.categoria}</p>
                  <p className="text-sm text-suave">
                    {c.quantidade}{' '}
                    {c.quantidade === 1 ? 'nota fiscal' : 'notas fiscais'}
                  </p>
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold whitespace-nowrap">
                  {formatarReais(c.total)}
                </td>
                <td className="px-3 py-2">
                  <Quadradinhos
                    parte={total > 0 ? c.total / total : 0}
                    destaque={i === 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {colegas.length > 1 && (
        <section className="grid gap-2">
          <h2 className="text-xl font-bold text-pri-escura">
            Colegas do mesmo estado ({perfil.uf})
          </h2>
          <table className="w-full border border-linha">
            <thead className="bg-pri-clara text-left text-sm">
              <tr>
                <th className="px-3 py-2">Posição</th>
                <th className="px-3 py-2">Senador</th>
                <th className="px-3 py-2 text-right">Total em {ano}</th>
              </tr>
            </thead>
            <tbody>
              {colegas.map((s) => {
                const eEste = s.codigo === perfil.codigo
                return (
                  <tr
                    key={s.codigo}
                    className={`border-t border-linha ${eEste ? 'bg-pri-clara font-bold' : ''}`}
                  >
                    <td className="px-3 py-2 font-mono">{s.posicao}º</td>
                    <td className="px-3 py-2">
                      {eEste ? (
                        <>
                          {s.nome}{' '}
                          <span className="text-sm text-suave">
                            (este senador)
                          </span>
                        </>
                      ) : (
                        <Link
                          to={`/senador/${s.codigo}?ano=${ano}`}
                          className="text-pri underline"
                        >
                          {s.nome}
                        </Link>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                      {formatarReais(s.total)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      )}

      <p>
        <a
          href={`https://www6g.senado.leg.br/transparencia/sen/${perfil.codigo}/?ano=${ano}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-pri underline"
        >
          Conferir estes números no site do Senado
        </a>
      </p>
    </>
  )
}

function ResumoItem({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="border-linha px-4 py-2 not-last:border-b sm:not-last:border-r sm:not-last:border-b-0">
      <dt className="text-sm text-suave">{titulo}</dt>
      <dd className="truncate font-mono text-lg font-bold">{valor}</dd>
    </div>
  )
}
