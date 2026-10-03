# Transparência Senado

API pública e portal web que transformam os dados abertos do Senado Federal em respostas simples:
**quanto cada senador gastou da cota parlamentar, em quê, e como isso se compara com a cota
disponível e com os colegas do mesmo estado.**

> **Status:** em desenvolvimento. Já funciona localmente: o sync traz as despesas reais do Senado
> e a rota `GET /senadores/{codigo}/gastos?ano=` devolve o total por categoria. Ainda não há
> endereço público (previsto para 27/11/2026).

---

## Por que existe

O Senado publica cada nota fiscal reembolsada pela Cota para o Exercício da Atividade Parlamentar
(CEAPS). O dado é aberto, mas vem bruto: milhares de lançamentos por ano, de todos os senadores
juntos. Para responder a uma pergunta simples, como "em que o senador do meu estado mais gastou
este ano?", é preciso baixar, filtrar e somar tudo isso por conta própria.

Este projeto faz essa soma e entrega a resposta pronta, por uma API aberta (sem cadastro nem chave)
e por um portal que qualquer pessoa consegue usar.

## Fonte dos dados

Todos os dados vêm das APIs oficiais de dados abertos do Senado Federal:

| API | O que usamos | Endereço |
| :-- | :-- | :-- |
| Dados abertos administrativos | gastos da CEAPS, auxílio-moradia | https://adm.senado.gov.br/adm-dadosabertos/swagger-ui |
| Dados abertos legislativos | senadores em exercício, partido, estado, comissões | https://legis.senado.leg.br/dadosabertos |

Portal de dados abertos do Senado: https://www12.senado.leg.br/dados-abertos

Os valores são exibidos como publicados pelo Senado. O projeto não altera os dados, apenas os
organiza e agrega. CPFs de fornecedores pessoa física são mascarados.

## Arquitetura

```
API administrativa do Senado ─┐
                              ├─► sync ─► PostgreSQL ─► API ─► JSON ─► portal (React)
API legislativa do Senado ────┘                               └─► curl, jornalistas, outros sistemas
```

- **sync**: job agendado que busca os dados do Senado, valida, transforma e grava no banco (ETL).
- **API**: lê apenas o banco próprio. Continua respondendo mesmo se o Senado estiver fora do ar.
- **portal**: consome a API por HTTP, como qualquer outro cliente (frontend e backend desacoplados).

Dentro da API, o código segue arquitetura em camadas por módulo:
`routes` (HTTP) → `service` (regras) → `repository` (banco), com `schemas` (Zod) definindo o
formato de entrada e saída.

A estrutura do banco (diagrama, tabelas por marco e decisões) está em
[`docs/banco-de-dados.md`](docs/banco-de-dados.md).

## Tecnologias

| Parte | Tecnologia |
| :-- | :-- |
| Linguagem | TypeScript |
| API | Fastify + Zod |
| Banco | PostgreSQL + Prisma |
| Portal | React + Vite |
| Testes | Vitest |
| Ambiente local | Docker Compose |
| Monorepo | pnpm workspaces |
| CI | GitHub Actions |

## Estrutura do repositório

```
apps/
  api/          # API REST (Fastify)
  sync/         # sincronização com as APIs do Senado
  web/          # portal (React)
packages/
  db/           # schema do banco, migrations e seed (Prisma)
  shared/       # tipos e schemas compartilhados
docs/           # arquitetura e decisões
disciplina/     # documentos da disciplina CC0464 (plano, diário, marcos)
```

> A estrutura acima é a planejada. As pastas são criadas conforme o desenvolvimento avança.

## Como rodar localmente

### Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js 24](https://nodejs.org/) (a versão está em `.node-version`)
- [Docker](https://www.docker.com/) com o Docker Compose, **aberto e rodando** (no Windows e no
  macOS, o Docker Desktop)

Os comandos abaixo são para Bash (Linux, macOS ou Git Bash no Windows). Diferenças para o PowerShell
estão indicadas.

### 1. Instalar

```bash
git clone https://github.com/AlissonWork/api-transparencia-senado.git
cd api-transparencia-senado
corepack enable pnpm          # ativa o pnpm na versão definida no projeto
pnpm install                  # instala as dependências e gera o cliente do Prisma
cp .env.example .env          # no PowerShell: Copy-Item .env.example .env
```

O `.env` já vem configurado para o banco local; não é preciso editar nada.

### 2. Subir o banco e criar as tabelas

```bash
docker compose up -d                              # sobe o PostgreSQL na porta 5432
docker compose ps                                 # espere o STATUS mostrar "healthy"
pnpm --filter @ts/db exec prisma migrate deploy   # cria as tabelas
```

Se a porta 5432 já estiver em uso por outro PostgreSQL na sua máquina, pare-o antes, ou o
`migrate deploy` falha com `Authentication failed`.

### 3. Trazer os dados do Senado

```bash
pnpm --filter @ts/sync sync
```

Saída esperada (os números crescem conforme o Senado lança novas despesas):

```
14563 despesas, 89 senadores e 8 categorias gravados
```

### 4. Rodar a API e consultar

```bash
pnpm dev
```

Com a API no ar (`Server listening at http://127.0.0.1:3333`), em outro terminal ou no navegador:

```bash
curl "http://localhost:3333/health"
curl "http://localhost:3333/senadores/5926/gastos?ano=2026"
```

A segunda chamada devolve o total gasto pelo senador em 2026 e a divisão por categoria. O total pode
ser conferido no resumo oficial do Senado:
<https://adm.senado.gov.br/adm-dadosabertos/api/v1/senadores/5926/recursos-utilizados>.
No PowerShell, use `curl.exe` em vez de `curl`, ou abra os endereços no navegador.

Para ver os códigos de senador disponíveis no banco:

```bash
docker compose exec db psql -U senado -d transparencia -c "select codigo, nome from senadores order by nome"
```

### 5. Rodar os testes

Os testes usam um banco separado, `transparencia_teste`, para não apagar os dados do sync. Na primeira
vez, crie-o:

```bash
docker compose exec db createdb -U senado transparencia_teste
DIRECT_URL="postgresql://senado:senado@localhost:5432/transparencia_teste" pnpm --filter @ts/db exec prisma migrate deploy
```

No PowerShell, a segunda linha fica em dois comandos:
`$env:DIRECT_URL="postgresql://senado:senado@localhost:5432/transparencia_teste"` e depois
`pnpm --filter @ts/db exec prisma migrate deploy`.

Depois, sempre que quiser:

```bash
pnpm test
```

## Roadmap

- [x] **v0.1.0 (02/10/2026)**: gastos de um senador por ano, rodando localmente com dados reais
- [ ] **v0.2.0 (13/11/2026)**: perfil do senador, consulta por estado e por categoria, portal web
- [ ] **v1.0.0 (27/11/2026)**: API publicada em endereço público, documentação completa, validação
  com usuários reais

## Como contribuir

Contribuições são bem-vindas.

1. Crie uma branch a partir da `main` (`feat/...`, `fix/...`, `docs/...`).
2. Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/) nas mensagens.
3. Abra um Pull Request para a `main`. O CI precisa passar.

Um guia detalhado (`CONTRIBUTING.md`) será adicionado junto com o ambiente de desenvolvimento.

## Disciplina

Este projeto é a ação de extensão da disciplina **CC0464 – Interfaces de Programação de Aplicação**
(Universidade Federal do Ceará, 2026.2). Plano de ação, diário de bordo, entregas de marco e
evidências estão na pasta [`disciplina/`](disciplina/).

## Licença

Código sob licença MIT. Os dados pertencem ao Senado Federal e seguem os termos do seu portal de
dados abertos.
