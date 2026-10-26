import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { buscarSenadores, type SenadorDaLista } from '../api'
import { ANO } from '../config'
import { formatarReais, semAcento } from '../formatar'
import { FotoSenador, SeloSituacao } from '../components/Senador'

// A posição no ranking geral, calculada uma vez quando os dados chegam
type SenadorComPosicao = SenadorDaLista & { posicao: number }

// A página está sempre em UM destes três estados
type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'erro' }
  | { tipo: 'pronto'; senadores: SenadorComPosicao[] }

export function PaginaSenadores() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' })
  // Mudar este número faz o useEffect rodar de novo ("Tentar de novo")
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    // Se a página sair da tela antes de a resposta chegar, ignoramos a resposta
    let cancelado = false

    buscarSenadores(ANO)
      .then((lista) => {
        if (cancelado) return
        // A API já manda do maior para o menor gasto: a posição é o lugar na lista
        const comPosicao = lista.map((s, i) => ({ ...s, posicao: i + 1 }))
        setEstado({ tipo: 'pronto', senadores: comPosicao })
      })
      .catch(() => {
        if (!cancelado) setEstado({ tipo: 'erro' })
      })

    // "Limpeza": o React chama esta função quando o efeito vai rodar de novo
    // ou quando a página sai da tela
    return () => {
      cancelado = true
    }
  }, [tentativa])

  function tentarDeNovo() {
    setEstado({ tipo: 'carregando' })
    setTentativa((t) => t + 1)
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 pt-3 pb-10">
      <p className="text-sm text-suave">Início › Senadores</p>

      <div>
        <h1 className="text-3xl font-bold text-pri-escura">
          Quanto cada senador gastou da cota parlamentar em {ANO}
        </h1>
        <p className="mt-1 max-w-3xl text-suave">
          A cota é um valor por mês que o Senado devolve ao senador por despesas
          do mandato, como passagens, aluguel de escritório e divulgação.
        </p>
      </div>

      {estado.tipo === 'carregando' && (
        <p className="border border-linha bg-faixa p-4" role="status">
          Carregando os senadores...
        </p>
      )}

      {estado.tipo === 'erro' && (
        <div className="border border-dest bg-dest-clara p-4" role="alert">
          <p className="font-bold">Não foi possível carregar os dados agora.</p>
          <button
            type="button"
            onClick={tentarDeNovo}
            className="mt-2 border border-pri bg-pri px-4 py-1.5 font-bold text-white hover:bg-pri-escura"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {estado.tipo === 'pronto' && (
        <ListaSenadores senadores={estado.senadores} />
      )}
    </div>
  )
}

function ListaSenadores({ senadores }: { senadores: SenadorComPosicao[] }) {
  // Os filtros moram no endereço: /?uf=CE&partido=PT&busca=ana&noCargo=sim
  const [params, setParams] = useSearchParams()
  const busca = params.get('busca') ?? ''
  const uf = params.get('uf') ?? ''
  const partido = params.get('partido') ?? ''
  const soNoCargo = params.get('noCargo') === 'sim'

  // No celular, os filtros ficam escondidos atrás do botão "Filtros"
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  function mudarFiltro(nome: string, valor: string) {
    setParams(
      (atuais) => {
        const novos = new URLSearchParams(atuais)
        // Filtro vazio sai do endereço, em vez de ficar "?uf="
        if (valor) novos.set(nome, valor)
        else novos.delete(nome)
        return novos
      },
      // replace: não cria uma entrada no histórico a cada letra digitada
      { replace: true },
    )
  }

  // As opções dos selects saem da própria lista, sem repetir e em ordem
  const ufs = [
    ...new Set(senadores.map((s) => s.uf).filter((v) => v !== null)),
  ].sort()
  const partidos = [
    ...new Set(senadores.map((s) => s.partido).filter((v) => v !== null)),
  ].sort()

  // Um senador aparece se passar em TODOS os filtros ligados
  const termo = semAcento(busca.trim())
  const filtrados = senadores.filter(
    (s) =>
      (!termo || semAcento(s.nome).includes(termo)) &&
      (!uf || s.uf === uf) &&
      (!partido || s.partido === partido) &&
      (!soNoCargo || s.emExercicio),
  )

  const total = filtrados.reduce((soma, s) => soma + s.total, 0)
  const maior = filtrados[0] // a lista já vem do maior para o menor
  const temFiltro = busca || uf || partido || soNoCargo

  const campo = 'border border-linha bg-white px-2 py-1.5'

  return (
    <>
      {/* Faixa de resumo: muda junto com os filtros */}
      <dl className="grid border border-linha bg-faixa sm:grid-cols-3">
        <ResumoItem titulo="Total gasto" valor={formatarReais(total)} />
        <ResumoItem
          titulo="Senadores na lista"
          valor={String(filtrados.length)}
        />
        <ResumoItem
          titulo="Quem mais gastou"
          valor={maior ? maior.nome : '—'}
        />
      </dl>

      {/* Filtro compacto */}
      <div className="grid gap-2 border border-linha p-3">
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col text-sm font-bold">
            Buscar pelo nome
            <input
              type="search"
              value={busca}
              onChange={(e) => mudarFiltro('busca', e.target.value)}
              placeholder="Ex.: Ana"
              className={`${campo} font-normal`}
            />
          </label>
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            aria-expanded={mostrarFiltros}
            className="self-end border border-pri px-3 py-1.5 font-bold text-pri sm:hidden"
          >
            Filtros
          </button>
        </div>

        <div
          className={`${mostrarFiltros ? 'flex' : 'hidden'} flex-col gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-end`}
        >
          <label className="flex flex-col text-sm font-bold">
            Estado
            <select
              value={uf}
              onChange={(e) => mudarFiltro('uf', e.target.value)}
              className={`${campo} font-normal`}
            >
              <option value="">Todos</option>
              {ufs.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-bold">
            Partido
            <select
              value={partido}
              onChange={(e) => mudarFiltro('partido', e.target.value)}
              className={`${campo} font-normal`}
            >
              <option value="">Todos</option>
              {partidos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 py-1.5">
            <input
              type="checkbox"
              checked={soNoCargo}
              onChange={(e) =>
                mudarFiltro('noCargo', e.target.checked ? 'sim' : '')
              }
              className="size-5 accent-pri"
            />
            Só quem está no cargo
          </label>

          {temFiltro && (
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="border border-linha px-3 py-1.5 font-bold text-pri hover:bg-pri-clara sm:ml-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-suave" aria-live="polite">
        Mostrando {filtrados.length} de {senadores.length} senadores
      </p>

      {filtrados.length === 0 ? (
        <p className="border border-linha bg-faixa p-4">
          Nenhum senador encontrado com esses filtros.
        </p>
      ) : (
        <>
          {/* Computador: tabela */}
          <table className="hidden w-full border border-linha md:table">
            <thead className="bg-pri-clara text-left text-sm">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Senador</th>
                <th className="px-3 py-2">Partido</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Total no ano</th>
                <th className="px-3 py-2">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((s) => (
                <tr
                  key={s.codigo}
                  className="border-t border-linha even:bg-faixa"
                >
                  <td className="px-3 py-2 font-mono text-suave">
                    {s.posicao}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <FotoSenador url={s.urlFoto} nome={s.nome} />
                      <div>
                        <p className="font-bold">{s.nome}</p>
                        <SeloSituacao emExercicio={s.emExercicio} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{s.partido ?? '—'}</td>
                  <td className="px-3 py-2">{s.uf ?? '—'}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold">
                    {formatarReais(s.total)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      to={`/senador/${s.codigo}`}
                      className="inline-block border border-pri px-3 py-1 font-bold text-pri no-underline hover:bg-pri-clara"
                    >
                      Ver gastos
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Celular: um card por senador */}
          <ul className="grid gap-2 md:hidden">
            {filtrados.map((s) => (
              <li key={s.codigo} className="flex gap-3 border border-linha p-3">
                <FotoSenador url={s.urlFoto} nome={s.nome} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-suave">{s.posicao}º lugar</p>
                  <p className="font-bold">{s.nome}</p>
                  <p className="text-sm text-suave">
                    {s.partido ?? 'Sem partido'} · {s.uf ?? '—'}
                  </p>
                  <SeloSituacao emExercicio={s.emExercicio} />
                  <p className="mt-1 font-mono text-lg font-bold">
                    {formatarReais(s.total)}
                  </p>
                  <Link
                    to={`/senador/${s.codigo}`}
                    className="mt-2 block border border-pri py-2 text-center font-bold text-pri no-underline"
                  >
                    Ver gastos
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
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
