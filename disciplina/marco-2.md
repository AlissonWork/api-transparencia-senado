# Marco 2 — Transparência Senado

> **Rascunho de 11/11/2026.** A entrega é em 13/11/2026. Antes de entregar: refazer os testes do
> Campo 1 no dia, atualizar o Campo 3 com o retorno do público (#20), conferir a autopontuação e
> marcar a tag `v0.2.0`. Os trechos ainda pendentes estão marcados com **(pendente)**.

---

## Identificação

- **Equipe:** Alisson dos Santos Nascimento — matrícula 555501 (projeto individual)
- **Marco e data:** Marco 2 — 13/11/2026
- **Trilha:** (A) API pública de dados abertos
- **Endereço público do produto:** n.a. neste marco — a publicação na internet é exigência do Marco 3,
  conforme orientação do professor. O produto roda a partir do clone seguindo o `README.md`.
  Repositório: https://github.com/AlissonWork/api-transparencia-senado
- **Commit ou tag desta entrega:** tag `v0.2.0` **(pendente)**

## Campo 1 — O que funciona hoje

Pré-requisito: seguir a seção "Como rodar localmente" do `README.md` (Node 24, pnpm e Docker) e
deixar `pnpm dev` rodando, que sobe a API e o portal juntos.

1. Abrir `http://localhost:5173/?uf=CE` no navegador e ver os senadores do Ceará com o total gasto
   da cota em 2026, do maior para o menor, com a faixa de resumo em cima. A busca por nome e os
   filtros de partido e "Só quem está no cargo" mudam a lista na hora, e o endereço guarda o filtro
   para ser enviado a outra pessoa.
2. Clicar em "Ver gastos" de um senador (por exemplo, `http://localhost:5173/senador/5926`) e ver o
   total gasto no ano, a posição entre os senadores, a frase com o maior gasto, a divisão por tipo
   de gasto com nomes curtos ("Passagens", "Aluguel de escritório") e o gráfico de quadradinhos, e
   os colegas do mesmo estado. O link "Conferir estes números no site do Senado" abre a página
   oficial do mesmo senador para comparar.
3. Rodar `curl "http://localhost:3333/senadores?ano=2026&uf=CE&emExercicio=true"` e receber em JSON
   os senadores do Ceará em exercício com o total do ano; `curl "http://localhost:3333/senadores/5926"`
   devolve o perfil (nome, partido, UF, foto e anos com despesa). Código inválido responde 400 e
   senador inexistente, 404.

## Campo 2 — O que mudou desde o marco anterior

- **Passou a existir:**
  - CPF de fornecedor pessoa física mascarado no sync, antes de gravar (`***.456.789-**`).
  - Sync dos senadores pela API legislativa: nome completo, partido, UF, foto e quem está em exercício.
  - Rotas `GET /senadores?ano=` (lista com total e filtros) e `GET /senadores/{codigo}` (perfil).
  - Portal web em `apps/web`: lista de senadores com filtros, perfil com gastos por categoria e
    página "Sobre os dados" em linguagem simples. Barra de acessibilidade que guarda o tamanho de
    letra escolhido, contorno de foco para teclado e testes de componente (Vitest, jsdom e
    Testing Library).
  - Nomes curtos para as 8 categorias de gasto (#11), gravados pelo sync sem duplicar.
  - CI no GitHub Actions (instalação limpa, migrations, build e testes a cada PR) e licença MIT.
  - Salário dos senadores: o sync lê a folha de pagamento do Senado mês a mês e liga cada linha ao
    senador pelo nome completo; rota `GET /senadores/{codigo}/remuneracao?ano=` (soma a folha
    Normal e a Suplementar de cada mês); seção "Salário" no perfil com o subsídio do último mês, o
    líquido do mês e o total líquido do ano.
  - Portal ajustado para celular (sem rolagem lateral de 320 a 1280 px) e identidade visual própria:
    logo da lupa com estrela, paleta verde, amarela e azul e guia em `docs/identidade/`.
  - Dois retornos escritos do vizinho do bairro: antes do portal (14/10) e depois de usá-lo (12/11).
- **Foi cortado, e por quê:**
  - Modo de alto contraste: descartado em 28/10; a barra de acessibilidade ficou só com o tamanho
    de letra.
  - Ficaram para o Marco 3: comparação com a cota disponível por estado ("usou X% do limite"),
    comparação de senadores lado a lado, mapa do Brasil, tabela do salário mês a mês, detalhamento
    dos descontos (previdência e imposto) e comparação salário x gastos da cota. Motivo: a semana de
    06/11 ficou parada, e a prioridade foi fechar o salário de ponta a ponta, com testes, e mostrar
    o portal ao público antes da entrega.

## Campo 3 — Alcance

| Indicador                                             | Planejado | Obtido até hoje                                                | Onde está a evidência                        |
| :---------------------------------------------------- | :-------- | :------------------------------------------------------------- | :------------------------------------------- |
| Visitantes únicos no endereço público (02/10 a 27/11) | 20        | 0 — o produto ainda não está publicado (Marco 3)               | —                                            |
| Retornos escritos de pessoas de fora                  | 2         | 2 — ambos do vizinho do bairro: 14/10 (prova dos nove, antes do portal) e 12/11 (depois de usar o portal) | `evidencias/2026-10-14-resposta-vizinho.png`, `evidencias/2026-11-12-resposta-vizinho.png` |

**O que o público externo disse.** "Fica mais fácil de acompanhar os políticos em quem eu penso em
votar." (vizinho do bairro, por email, 14/10). A pergunta dele, "qual maior gasto deles", virou a
frase de destaque do perfil do senador.

Em 12/11 o vizinho usou o portal numa chamada de vídeo, com a lista, o ranking e o perfil de uma
senadora na tela, e respondeu por email: "Soraya Thronicke gasta muito dinheiro.", "Acredito que o
portal serve seu propósito.", a parte do salário ficou fácil de entender ("Sim.") e "Mandaria,
principalmente em época de eleição." (vizinho do bairro, 12/11; prints em
`evidencias/2026-11-12-*.png`). A pergunta pedia os senadores do Ceará, mas ele foi direto para quem
mais gasta: o ranking chamou mais atenção que o filtro por estado. Ele não apontou nada que faltou.

Os dois retornos são da mesma pessoa; o cliente não usou o portal até 13/11: não houve contato com ele
nesta reta final, e a prioridade foi o vizinho, que já estava combinado. Para o Marco 3, com o portal publicado, a meta é ouvir o
cliente e mais uma pessoa.

## Campo 4 — Obstáculo e replanejamento

- **Resposta do público demorou (08/10 a 14/10).** O email de 08/10 ficou sem resposta; uma conversa
  pessoal em 13/10 retomou o contato, e a resposta chegou no dia seguinte. Para o portal, o plano é
  mostrar pessoalmente, em vez de mandar o link e esperar.
- **Testes disputando o mesmo banco (19/10).** Com dois arquivos de teste no mesmo banco, um apagaria
  os dados do outro. Resolvido rodando um arquivo por vez (`fileParallelism: false`).
- **Falso positivo num teste (21/10).** A rota de perfil lia `request.query` em vez de
  `request.params`; o teste do código inválido passava por acaso, e os testes de sucesso pegaram o erro.
- **CORS liberando qualquer site (24/10, ~15 min).** O teste do caso negativo mostrou que a origem
  passada como texto liberava todos os sites; resolvido com uma lista de origens.
- **Números diferentes do site do Senado (30/10).** O total de uma senadora ficou R$ 15.264,87
  abaixo do site oficial. A diferença vinha de notas lançadas depois do último sync (16/10), não de
  erro no código. O sync passou a ser rodado de novo antes de mostrar o portal, e a atualização
  automática diária entra no Marco 3.
- **Atraso na apresentação ao público (06/11 a 11/11).** A apresentação do portal, prevista para
  07 a 10/11, ficou para a semana da entrega. Resolvido combinando com o vizinho por telefone e
mostrando o portal numa chamada de vídeo em 12/11, com o retorno escrito por email na mesma noite;
as novidades que não cabiam no prazo foram para o Marco 3 (Campo 2).
- **Nomes diferentes entre a folha e o cadastro (11/11).** Para ligar o salário ao senador pelo nome
  completo, 79 dos 81 senadores em exercício bateram de primeira. Uma senadora aparece na folha com
  "DE" no meio do nome e no cadastro sem. Resolvido normalizando os nomes (sem acento, maiúsculas e
  sem as partículas de, da, do, dos, das, e), com testes, inclusive o de não apagar "DE" dentro de
  palavras como "ANDERSON": 81 de 81.
- **Valores nulos na folha (12/11).** O primeiro sync do salário parou com erro de validação porque
  alguns campos de dinheiro vinham nulos. Resolvido tratando nulo como zero, com teste.
- **Diferença de R$ 15.264,87 resolvida (11/11).** Depois de um sync novo, o total da senadora
  conferida em 30/10 bateu com o site do Senado (R$ 486.321,28).

## Campo 5 — Autopontuação

**(pendente — rascunho, revisar em 13/11)**

| Dimensão                            | n.a.? | Pts (0–2) | Por quê, em uma linha                                                                                                           |
| :---------------------------------- | :---- | :-------- | :------------------------------------------------------------------------------------------------------------------------------ |
| D1 Qualidade técnica                |       | 2         | Funciona de ponta a ponta (sync → banco → API → portal), com validação de entrada, erros 400/404, 45 testes automatizados e CI. |
| D2 Alcance e adequação ao público   |       | 1         | Pessoa de fora usou o portal e respondeu por escrito, mas os 2 retornos são da mesma pessoa e o cliente ainda não usou.         |
| D3 Documentação e reprodutibilidade |       |           | Conferir o README num clone limpo antes da entrega.                                                                             |
| D4 Registro do processo             |       | 2         | Diário semanal, issues no milestone "Marco 2", PRs com descrição e Conventional Commits.                                        |
| D5 Autoavaliação e reflexão         | n.a.  | —         | Prevista para 04/12.                                                                                                            |

## Antes de entregar

- [ ] O endereço do produto abre numa máquina que não é a nossa. (n.a. no Marco 2; o equivalente é o
      `README.md` funcionar num clone limpo.)
- [ ] O que o Campo 1 promete foi testado hoje, não na semana passada.
- [ ] O `README.md` corresponde ao que o produto faz agora.
- [ ] O diário tem entrada de todas as semanas desde o último marco.
- [ ] Toda evidência do Campo 3 tem data e está em `evidencias/`.
- [ ] O commit informado está publicado. (tag `v0.2.0`)
