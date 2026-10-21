# Diário de bordo — modelo

Copie este arquivo para o repositório da equipe e mantenha-o lá. É o registro que:

- **comprova as 28 horas** de execução autônoma por integrante (as horas de extensão que acontecem
  fora dos encontros de sexta);
- alimenta a dimensão **D4 da rubrica** (registro do processo);
- é conferido contra a **autoavaliação** de cada um em 04/12;
- vira matéria-prima dos indicadores de **condições de desenvolvimento** e **impacto na formação**.

## Como preencher

- **Uma entrada por semana**, mesmo nas semanas em que nada andou — principalmente nessas.
- **Cinco linhas bastam.** Diário longo não é lido nem pela própria equipe.
- **Escreva no dia.** Diário reconstruído em novembro é ficção, e se percebe.
- Quando um papel mudar de mão, registre aqui.
- Obstáculo é informação, não desculpa: anote o que travou e por quanto tempo.

---

## Entradas

### Semana de 18/09

**Quem trabalhou e quanto:** Alisson — 1:30h

**O que foi feito:**

- Leitura das diretrizes da disciplina e organização da estrutura inicial do repositório.
- Escolha da Trilha A e definição do problema focado na transparência dos gastos do Senado Federal para o cidadão comum.

**Obstáculo:** Atraso na definição da equipa e do escopo. Resolvido com a decisão de assumir o projeto de forma individual.

**Contato com o público:** Nenhum ainda.

**Evidência coletada:** Nenhuma.

**Próxima semana:** Finalizar o rascunho do plano de ação e registar a entrada do diário referente ao dia 25/09.

---

### Semana de 25/09

**Quem trabalhou e quanto:** Alisson — 6h (3h em 25/09, 3h em 27/09)

**O que foi feito:**

- 25/09: documentos da disciplina movidos para `disciplina/` e README do projeto criado na raiz.
- 25/09: plano de ação preenchido: problema, público, fontes (CEAPS em domínio público, base
  atualizada em 23/09/2026), cronograma e indicadores.
- 25/09: público definido: vizinhos do bairro e clientes, adultos que não programam. Duas pessoas
  identificadas (um vizinho e um cliente).
- 27/09: ambiente preparado (Node 24 LTS, pnpm, Docker) e banco de produção criado no Supabase.
- 27/09: monorepo criado (pnpm workspaces, TypeScript) com a API Fastify respondendo `GET /health`
  e o primeiro teste automatizado (Vitest). Entrou na `main` pelo PR #3 (issue #2).
- 27/09: Postgres local com Docker Compose e pacote `packages/db` com Prisma.
- 27/09: modelagem do banco a partir dos dados reais do Senado (14.455 despesas de 88 senadores em
  2026), documentada em `docs/banco-de-dados.md`. Remuneração dos senadores incluída no escopo do
  Marco 2.

**Obstáculo:**

- A primeira escolha de público ("cidadãos") era genérica demais. Resolvido trocando por um grupo
  concreto do convívio direto, mais fácil de alcançar.
- A versão "latest" do Prisma era uma release candidate (8.0.0-rc) que trazia 319 pacotes
  estranhos ao projeto. Resolvido fixando a versão estável 7.10.0 (~30 min).
- A porta do Postgres no Docker não ficou acessível no Windows. Resolvido recriando o container.

**Contato com o público:** nenhum ainda. Duas pessoas identificadas para a primeira conversa.

**Evidência coletada:** nenhuma.

**Próxima semana:** implementar o schema no Prisma, a sincronização com o Senado e a rota de gastos
de um senador por ano; publicar a API (Marco 1, 02/10) e preparar a primeira conversa, marcada para
08/10, com uma das duas pessoas.

---

### Semana de 02/10

**Quem trabalhou e quanto:** Alisson — 6h30 (1h30 em 29/09, 2h em 01/10, 3h em 02/10)

**O que foi feito:**

- 29/09: schema do banco implementado no Prisma (senadores, categorias, despesas, sincronizações e
  remunerações), migration inicial e cliente do banco com o adapter do Postgres. Entrou na `main`
  pelo PR #14 (issue #4).
- 29/09: VS Code configurado (autosave, Prettier, formatador do Prisma) e `.prettierrc` no projeto.
- 01/10: segunda migration (tipo do documento da despesa) e início do sync: busca e validação das
  despesas da CEAPS com Zod, descartando o campo `detalhamento` (dado pessoal de assessores).
- 02/10: sync gravando senadores, categorias e despesas numa transação: 14.563 despesas de 89
  senadores, com soma (R$ 23.191.729,08) idêntica à da fonte.
- 02/10: rota `GET /senadores/{codigo}/gastos?ano=`; o total do senador 5926 (R$ 362.234,49) confere
  com o resumo oficial do Senado. Testes de integração com banco de teste separado (5 testes).
- 02/10: README com o passo a passo para rodar localmente, ficha do Marco 1 e plano ajustado.
- 04/10: README seguido do zero num clone novo do repositório: instalação, banco, sync (14.563
  despesas), rota de gastos e os 5 testes funcionaram. Entrega do Marco 1 marcada com a tag `v0.1.0`.

**Obstáculo:**

- 28/09 sem avanço no projeto; o atraso foi compensado em 29/09 e 01/10.
- O banco respondia "Authentication failed" porque outro container Postgres, de outro projeto,
  ocupava a porta 5432. Resolvido parando o outro container (~20 min).
- Um colega seguiu o README num clone limpo, em outra máquina, e o `corepack enable pnpm` falhou com
  "operação não permitida" (Node em pasta protegida do Windows). README corrigido com a causa e duas
  saídas: terminal como administrador ou `npm install -g pnpm@12.6.0`.
- A publicação na internet saiu do Marco 1 por orientação do professor e passou para o Marco 3;
  plano e ficha do marco ajustados.

**Contato com o público:** nenhum ainda. Primeira conversa marcada para 08/10.

**Evidência coletada:** nenhuma.

**Próxima semana:** sync dos senadores pela API legislativa (partido, UF, quem está em exercício),
primeira conversa com o público em 08/10 e as rotas que o portal vai usar (Marco 2).

---

### Semana de 09/10

**Quem trabalhou e quanto:** Alisson — 3h (2h em 07/10, 1h em 08/10)

**O que foi feito:**

- 07/10: issues do Marco 2 organizadas no milestone "Marco 2" (13/11): máscara de CPF (#5), CI (#7),
  sync dos senadores (#17), rotas de lista e perfil (#18), portal React (#19), uso pelo público (#20)
  e LICENSE (#21).
- 07/10: máscara de CPF no sync, antes de gravar no banco (LGPD): CPF vira `***.456.789-**` e CNPJ
  só tem a pontuação padronizada. Função pura com 5 testes Vitest, os primeiros do pacote `sync`.
  Entrou na `main` pelo PR #23 (fecha #5).
- 07/10: conferência no banco depois do sync: nenhum CPF de fornecedor nos dados de 2026 e 3
  despesas com documento de 13 dígitos (provável CNPJ digitado sem um zero na origem), mantidas como
  vieram.
- 07/10: licença MIT adicionada ao repositório (PR #24, fecha #21).
- 08/10: workflow de CI no GitHub Actions (instalação limpa, Postgres temporário, migrations, build
  e testes) na branch `chore/ci-github-actions`.
- 08/10: email ao vizinho com os Campos 1 e 3 do plano de ação e três perguntas (prova dos nove).

**Obstáculo:**

- O teste do valor vazio pegou um erro na primeira versão da máscara: tudo que não tinha 11 dígitos
  era formatado como CNPJ, e o vazio virava `../-`. Resolvido tratando só os formatos conhecidos
  (11 e 14 dígitos) e devolvendo o resto sem alteração (~15 min).
- A primeira conversa, planejada para ser pessoalmente, foi feita por email.

**Contato com o público:** email enviado ao vizinho em 08/10, sem resposta até o fim da semana.

**Evidência coletada:** registro do envio em `disciplina/evidencias.csv`.

**Próxima semana:** abrir o PR da CI, cobrar a resposta do email e começar o sync dos senadores pela
API legislativa (#17).

---

### Semana de 16/10

**Quem trabalhou e quanto:** Alisson — 2h30 (30min em 13/10; 2h em 15/10 e 16/10)

**O que foi feito:**

- 13/10: PR #25 aberto com a CI (fecha #7); primeira execução do workflow no GitHub Actions.
- 13/10: conversa pessoal com o vizinho para pedir a resposta do email de 08/10.
- 15/10 e 16/10: sync dos senadores pela API legislativa (fecha #17): nome completo, partido, UF,
  foto (em https) e quem está em exercício, validados com Zod. A API legislativa tem 81 senadores
  em exercício e a CEAPS de 2026 tem 89: os 8 a mais exerceram o mandato em parte do ano (por
  exemplo, suplentes) e ficam com `em_exercicio = false`.

**Obstáculo:** o email de 08/10 ficou sem resposta até 13/10; a conversa pessoal foi a forma de
retomar o contato, e a resposta chegou no dia seguinte.

**Contato com o público:** conversa pessoal com o vizinho em 13/10. Em 14/10 ele respondeu por email
as três perguntas da prova dos nove:

1. Que problema o projeto resolve: "Fica mais fácil de acompanhar os políticos em quem eu penso em
   votar." Explicou com as próprias palavras e não apontou palavra difícil.
2. O que perguntaria sobre os gastos: "Qual maior gasto deles."
3. Se usaria: "Sim, para ficar melhor informado sobre esses assuntos."

Resultado: ele entendeu os Campos 1 e 3 sem explicação oral, e o item da prova dos nove foi marcado
no `plano-de-acao.md`. A pergunta dele ("qual o maior gasto") confirma o que o portal precisa
mostrar primeiro: os gastos por categoria, do maior para o menor.

**Evidência coletada:** print da resposta, sem nome e email, em
`disciplina/evidencias/2026-10-14-resposta-vizinho.png`, e registro em `disciplina/evidencias.csv`.

**Próxima semana:** rotas de lista e perfil de senadores (#18) e início do portal React (#19).

---

### Semana de 23/10

**Quem trabalhou e quanto:** Alisson — 3h (2h em 19/10; 1h em 21/10)

**O que foi feito:**

- 19/10: rota `GET /senadores?ano=` com o total gasto no ano por senador, do maior para o menor,
  e filtros por UF, partido e em exercício. A lista mostra os 89 senadores da CEAPS, inclusive
  quem saiu do cargo, porque esconder o gasto de quem saiu iria contra a transparência (#18).
- 19/10: primeira camada de repository na API: as consultas ao banco saem da rota, que fica só com
  validação e respostas HTTP.
- 21/10: rota `GET /senadores/{codigo}` com o perfil do senador e os anos em que ele tem despesa,
  para o seletor de ano do portal; README atualizado com as rotas novas (#18).

**Aprendizado:** a diferença entre uma API CRUD e uma API de consulta; por que somar no banco
(`groupBy`) em vez de no JavaScript; o problema N+1 (uma consulta por senador); e por que a lista
parte dos senadores e não das despesas: quem não gastou nada precisa aparecer com zero, e não sumir.

**Obstáculo:** com dois arquivos de teste usando o mesmo banco, um apagaria os dados do outro se
rodassem ao mesmo tempo. Resolvido rodando um arquivo de teste por vez (`fileParallelism: false`).
Na rota de perfil, a validação lia `request.query` em vez de `request.params`, e todas as
chamadas davam 400; os testes de sucesso pegaram o erro, e o teste do código inválido passava
por acaso (falso positivo).

**Contato com o público:** nenhum novo nesta semana.

**Evidência coletada:** nenhuma nova.

**Próxima semana:** portal React (#19) com a lista de senadores e a página de perfil; mostrar ao
vizinho e ao cliente (#20).

---

### Semana de DD/MM

**Quem trabalhou e quanto:**

## **O que foi feito:**

**Obstáculo:**

**Contato com o público:**

**Evidência coletada:**

**Próxima semana:**

---

## Exemplo de entrada preenchida

### Semana de 22/09

**Quem trabalhou e quanto:** Ana — 3h; Bruno — 2h; Carla — 2h30

**O que foi feito:**

- Baixamos o censo escolar de 2024 e contamos vazios nas colunas de infraestrutura (Ana).
- Primeira rota da API respondendo com dados fixos (Bruno).
- Escrevemos o e-mail para a coordenadora da escola do bairro (Carla).

**Obstáculo:** o arquivo veio com separador `;` e codificação latin-1; perdemos ~1h até
descobrir. Resolvido.

**Contato com o público:** e-mail enviado à coordenadora em 24/09, sem resposta ainda.

**Evidência coletada:** cópia do e-mail enviado, em `evidencias/2026-09-24-email.pdf`.

**Próxima semana:** trocar dados fixos pelos reais; cobrar resposta do e-mail.

---

## O que conta como evidência

| Serve                                     | Não serve                                       |
| :---------------------------------------- | :---------------------------------------------- |
| Mensagem de alguém de fora que usou       | Captura de tela rodando na sua máquina          |
| Registro de acessos ao endereço público   | "Divulgamos nas redes", sem número              |
| Lista de presença ou inscrição em oficina | Retorno de colega da própria turma              |
| Retorno escrito, mesmo curto              | Número coletado uma vez, no dia da apresentação |

Guarde as evidências numa pasta do repositório, com data no nome do arquivo. Evidência é subproduto
de rotina, não tarefa da última semana.
