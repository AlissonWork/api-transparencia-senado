// Os dados da página separados do visual: para mudar um texto,
// você mexe só na lista, sem tocar no JSX
const PERGUNTAS = [
  {
    pergunta: 'O que é a cota parlamentar?',
    resposta:
      'É um valor por mês que cada senador pode usar em despesas do mandato, como passagens, aluguel de escritório no estado, combustível e divulgação. O senador paga e depois o Senado devolve o dinheiro, mediante nota fiscal. O nome oficial é CEAPS (Cota para o Exercício da Atividade Parlamentar dos Senadores).',
  },
  {
    pergunta: 'De onde vêm os números?',
    resposta:
      'Todos os valores vêm dos dados abertos do Senado Federal, que qualquer pessoa pode consultar. O portal só organiza e soma esses dados para ficar fácil de entender.',
  },
  {
    pergunta: 'Gastar muito quer dizer que o senador fez algo errado?',
    resposta:
      'Não necessariamente. O portal mostra o dado como o Senado publica e não julga ninguém. Um gasto alto pode ter explicação, como a distância entre o estado e Brasília.',
  },
  {
    pergunta: 'Por que aparece "fora do cargo"?',
    resposta:
      'Alguns senadores usaram a cota durante uma parte do ano e depois saíram, por exemplo um suplente que substituiu o titular por alguns meses. O gasto deles continua aparecendo, porque também foi dinheiro público.',
  },
  {
    pergunta: 'Meus dados pessoais aparecem aqui?',
    resposta:
      'Não. Quando quem recebeu o pagamento é uma pessoa física, o CPF aparece escondido em parte (***.456.789-**), como pede a Lei Geral de Proteção de Dados.',
  },
]

export function PaginaSobre() {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-3 pb-10">
      <p className="text-sm text-suave">Início › Sobre os dados</p>

      <div>
        <h1 className="text-3xl font-bold text-pri-escura">Sobre os dados</h1>
        <p className="mt-1 text-suave">
          Perguntas frequentes. Clique em uma pergunta para ver a resposta.
        </p>
      </div>

      <div className="max-w-3xl border border-linha">
        {PERGUNTAS.map((item, i) => (
          <details
            key={item.pergunta}
            open={i === 0}
            className="border-b border-linha last:border-b-0"
          >
            <summary className="cursor-pointer bg-faixa px-5 py-3 text-lg font-bold text-pri-escura">
              {item.pergunta}
            </summary>
            <p className="px-5 pt-3 pb-4">{item.resposta}</p>
          </details>
        ))}

        <details className="border-t border-linha">
          <summary className="cursor-pointer bg-faixa px-5 py-3 text-lg font-bold text-pri-escura">
            Sou programador. Posso usar esses dados?
          </summary>
          <p className="px-5 pt-3 pb-4">
            Sim. O portal usa uma API aberta, sem cadastro nem chave, e o código
            está no GitHub:{' '}
            <a
              className="font-bold text-pri underline"
              href="https://github.com/AlissonWork/api-transparencia-senado"
              target="_blank"
              rel="noopener noreferrer"
            >
              AlissonWork/api-transparencia-senado
            </a>
            .
          </p>
        </details>
      </div>
    </div>
  )
}
