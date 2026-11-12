import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { NOME_PORTAL, SUBTITULO_PORTAL } from '../config'
import { lerPreferencia, salvarPreferencia } from '../preferencias'

// Tamanhos de letra permitidos pelos botões A- e A+ (em % do padrão do navegador)
const TAMANHOS = [93.75, 106.25, 118.75, 131.25, 143.75] // 15, 17, 19, 21 e 23px

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <BarraAcessibilidade />
      <Cabecalho />
      <Menu />
      {/* id="conteudo" é o alvo do link "Ir para o conteúdo" */}
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <Rodape />
    </div>
  )
}

function BarraAcessibilidade() {
  // Começa com o que a pessoa escolheu da última vez (ou 1 = 17px)
  const [nivel, setNivel] = useState(() => {
    const salvo = Number(lerPreferencia('tamanho-letra', '1'))
    return Number.isInteger(salvo) && salvo >= 0 && salvo < TAMANHOS.length
      ? salvo
      : 1
  })

  useEffect(() => {
    document.documentElement.style.fontSize = `${TAMANHOS[nivel]}%`
    salvarPreferencia('tamanho-letra', String(nivel))
  }, [nivel])

  const botao =
    'border border-linha bg-white px-2 py-0.5 font-bold text-pri hover:bg-pri-clara disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white'

  return (
    <div className="border-b border-linha bg-faixa text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1">
        <a href="#conteudo" className={botao}>
          Ir para o conteúdo
        </a>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={botao}
            aria-label="Diminuir letra"
            disabled={nivel === 0}
            onClick={() => setNivel(nivel - 1)}
          >
            A−
          </button>
          <button
            type="button"
            className={botao}
            aria-label="Aumentar letra"
            disabled={nivel === TAMANHOS.length - 1}
            onClick={() => setNivel(nivel + 1)}
          >
            A+
          </button>
        </div>
      </div>
    </div>
  )
}

function Cabecalho() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
      <Link to="/" className="flex items-center gap-3 text-texto no-underline">
        <Logo />
        <span>
          <strong className="block text-xl leading-tight">{NOME_PORTAL}</strong>
          <span className="block text-sm text-suave">{SUBTITULO_PORTAL}</span>
        </span>
      </Link>
    </header>
  )
}

// A logo: uma lupa em que a lente é o céu azul da bandeira, com uma estrela.
// O mesmo desenho está em public/favicon.svg (o ícone da aba).
function Logo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-11 shrink-0">
      <path d="M30 30 43 43" stroke="#0a6b35" strokeWidth="7" />
      <circle
        cx="20"
        cy="20"
        r="15"
        fill="#12357a"
        stroke="#f5c400"
        strokeWidth="4"
      />
      <path
        d="M20.0 11.5L22.1 17.6L28.6 17.7L23.4 21.6L25.3 27.8L20.0 24.1L14.7 27.8L16.6 21.6L11.4 17.7L17.9 17.6Z"
        fill="#ffffff"
      />
    </svg>
  )
}

function Menu() {
  // NavLink sabe se é a página atual (isActive) e muda o visual
  const estilo = ({ isActive }: { isActive: boolean }) =>
    [
      'flex-1 border-b-4 px-4 pt-3 pb-2 text-center font-bold text-white no-underline sm:flex-none',
      isActive
        ? 'border-white bg-pri-escura'
        : 'border-transparent hover:bg-pri-escura',
    ].join(' ')

  return (
    <nav
      aria-label="Menu principal"
      className="border-b-4 border-amarelo bg-pri"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap">
        {/* end: só fica "ativo" exatamente em /, e não em /sobre também */}
        <NavLink to="/" end className={estilo}>
          Senadores
        </NavLink>
        <NavLink to="/sobre" className={estilo}>
          Sobre os dados
        </NavLink>
      </div>
    </nav>
  )
}

function Rodape() {
  return (
    <footer className="bg-pri-escura text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-5">
        <span>
          Fonte: dados abertos do Senado Federal. Portal independente, sem
          ligação com o Senado ou com o governo.
        </span>
        <span>
          {NOME_PORTAL} · projeto de extensão universitária · código aberto
        </span>
      </div>
    </footer>
  )
}
