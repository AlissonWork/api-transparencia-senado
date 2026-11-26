<p align="center">
  <img src="docs/identidade/logo-com-nome.png" alt="De Olho na Cota" width="460">
</p>

<p align="center">
  <strong>Quanto cada senador gastou da cota parlamentar, em quê, e quanto recebe de salário.</strong><br>
  API pública e portal web a partir dos dados abertos do Senado Federal.
</p>

<p align="center">
  <a href="https://github.com/AlissonWork/api-transparencia-senado/actions/workflows/ci.yml"><img src="https://github.com/AlissonWork/api-transparencia-senado/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/vers%C3%A3o-v1.0.0-0a6b35" alt="versão v1.0.0">
  <img src="https://img.shields.io/badge/testes-104-0a6b35" alt="104 testes">
  <img src="https://img.shields.io/badge/licen%C3%A7a-MIT-12357a" alt="Licença MIT">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Fastify-000000?logo=fastify&logoColor=white" alt="Fastify">
  <img src="https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=white" alt="Zod">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white" alt="Vitest">
</p>

<p align="center">
  <a href="https://de-olho-na-cota.vercel.app"><strong>🌐 Abrir o portal</strong></a> ·
  <a href="https://api-transparencia-senado.vercel.app/docs"><strong>📖 Documentação da API</strong></a>
</p>

<p align="center">
  <a href="#-por-que-existe">Por que existe</a> ·
  <a href="#-arquitetura">Arquitetura</a> ·
  <a href="#-hospedagem-e-deploy">Hospedagem</a> ·
  <a href="#-rotas-da-api">Rotas da API</a> ·
  <a href="#-documentação-da-api-swagger">Swagger</a> ·
  <a href="#-como-rodar-localmente">Como rodar</a> ·
  <a href="#-roadmap">Roadmap</a>
</p>

> [!NOTE]
> **Status: v1.0.0 (Marco 3), no ar.** O portal está em <https://de-olho-na-cota.vercel.app> e a API
> em <https://api-transparencia-senado.vercel.app>, com a documentação interativa em
> [`/docs`](https://api-transparencia-senado.vercel.app/docs). Dá para ver quanto cada senador gastou
> da cota, em quê e mês a mês, quanto recebe de salário, e comparar dois senadores lado a lado,
> também no celular.

---

## 💡 Por que existe

O Senado publica cada nota fiscal reembolsada pela Cota para o Exercício da Atividade Parlamentar
(CEAPS). O dado é aberto, mas vem **bruto**: milhares de lançamentos por ano, de todos os senadores
juntos. Para responder a uma pergunta simples, como _"em que o senador do meu estado mais gastou
este ano?"_, é preciso baixar, filtrar e somar tudo isso por conta própria.

Este projeto faz essa soma e entrega a resposta pronta: por uma **API aberta** (sem cadastro nem
chave) e por um **portal** que qualquer pessoa consegue usar.

### Em números (dados de 2026, sync de 26/11)

| 🧾 Notas fiscais |       👤 Senadores       | 💰 Linhas de salário | 🔌 Rotas | ✅ Testes |
| :--------------: | :----------------------: | :------------------: | :------: | :-------: |
|    **17.388**    | **92** (81 em exercício) |       **902**        |  **6**   |  **104**   |

## 🏗️ Arquitetura

```mermaid
flowchart LR
    subgraph senado["Senado Federal (dados abertos)"]
        ADM["API administrativa<br/>CEAPS + folha de pagamento"]
        LEG["API legislativa<br/>senadores em exercício"]
    end

    subgraph projeto["Este projeto"]
        SYNC["⚙️ sync<br/>ETL: busca, valida com Zod,<br/>mascara CPF e grava"]
        DB[("🐘 PostgreSQL<br/>senadores · despesas<br/>categorias · remuneracoes")]
        API["🔌 API REST<br/>Fastify + Zod"]
        WEB["🖥️ Portal<br/>React + Vite"]
    end

    ADM --> SYNC
    LEG --> SYNC
    SYNC --> DB
    DB --> API
    API -- JSON --> WEB
    API -- JSON --> OUT["curl, Bruno,<br/>jornalistas, outros sistemas"]
```

| Peça                      | O que faz                                                                                                                            | Por que assim                                                                                 |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **sync** (`apps/sync`)    | ETL: busca os dados do Senado, valida cada linha com Zod, mascara CPF de fornecedor e grava com _upsert_ (rodar de novo não duplica) | Separar a coleta da consulta: o Senado é lento e às vezes fica fora do ar                     |
| **banco** (`packages/db`) | PostgreSQL com schema e migrations no Prisma                                                                                         | Somas e filtros viram consultas SQL rápidas, em vez de varrer milhares de notas a cada pedido |
| **API** (`apps/api`)      | Lê **só o banco próprio** e responde em JSON                                                                                         | Continua respondendo mesmo se o Senado cair; nunca chama o Senado durante uma requisição      |
| **portal** (`apps/web`)   | Consome a API por HTTP, como qualquer outro cliente                                                                                  | Frontend e backend desacoplados: a API serve o portal e qualquer outro sistema                |

### O caminho de uma requisição

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente (portal, Bruno, curl)
    participant R as Rota (Fastify)
    participant Z as Validação (Zod)
    participant P as Prisma
    participant B as PostgreSQL

    C->>R: GET /senadores/5926/remuneracao?ano=2026
    R->>Z: confere :codigo e ?ano
    alt parâmetro inválido
        Z-->>C: 400 PARAMETROS_INVALIDOS
    end
    R->>P: o senador existe?
    P->>B: SELECT
    alt não existe
        R-->>C: 404 SENADOR_NAO_ENCONTRADO
    end
    R->>P: groupBy por mês (soma folha Normal + Suplementar)
    P->>B: SELECT ... GROUP BY mes
    R-->>C: 200 JSON
```

Dentro da API, cada rota segue três passos: **valida a entrada** com Zod (tudo que vem na URL chega
como texto), **consulta o banco** pelo Prisma (ou por um _repository_, quando a consulta é maior) e
**monta a resposta**. Erros têm sempre o mesmo formato:

```json
{
  "error": {
    "code": "SENADOR_NAO_ENCONTRADO",
    "message": "Senador 999999 não encontrado"
  }
}
```

O modelo do banco (diagrama, tabelas e decisões) está em
[`docs/banco-de-dados.md`](docs/banco-de-dados.md).

## ☁️ Hospedagem e deploy

O projeto está publicado em três serviços, cada um fazendo o que faz melhor:

```mermaid
flowchart LR
    U["👤 Navegador"] -- "HTML, JS e CSS" --> CDN["🖥️ Portal<br/>Vercel (CDN)<br/>de-olho-na-cota.vercel.app"]
    U -- "fetch (JSON, com CORS)" --> FN["🔌 API<br/>Vercel Function (Fastify)<br/>api-transparencia-senado.vercel.app"]
    FN -- "porta 6543<br/>(pooler, modo transação)" --> POOL["🔀 Supavisor<br/>pooler do Supabase"]
    POOL --> DB[("🐘 PostgreSQL<br/>Supabase · São Paulo")]
    PC["💻 sync<br/>roda no PC do mantenedor"] -- "porta 5432<br/>(modo sessão)" --> DB
    SEN["🏛️ APIs do Senado"] --> PC
```

| Peça       | Onde roda                                   | Como                                                                                                   |
| :--------- | :------------------------------------------ | :----------------------------------------------------------------------------------------------------- |
| **portal** | Vercel, como site estático na CDN           | o `vite build` gera arquivos prontos, servidos do servidor mais perto de quem acessa                   |
| **API**    | Vercel, como função _serverless_            | o mesmo Fastify de sempre; a Vercel liga uma instância quando chega requisição e desliga quando não há |
| **banco**  | Supabase (PostgreSQL gerenciado, sa-east-1) | a API entra pelo _pooler_ (porta 6543), que reaproveita poucas conexões entre muitas funções           |
| **sync**   | PC do mantenedor, por enquanto à mão        | roda fora da Vercel, porque a coleta passa do tempo máximo de uma função; a automação diária é o próximo passo |

### Por que a Vercel

A escolha comparou quatro opções, com três critérios: ficar no ar sem
custo depois da disciplina, parecer profissional e dar pouco trabalho de operação.

| Opção                  | Ponto forte                                                                    | Por que não                                                                                |
| :--------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **Vercel** (escolhida) | portal e API no mesmo lugar, HTTPS, deploy a cada push, prévia por PR, grátis  | a função _serverless_ tem limite de tempo por requisição (não serve para o sync)           |
| Render                 | servidor Node tradicional, simples                                             | no plano grátis o servidor **dorme** após 15 min sem uso: a primeira visita demora ~1 min |
| Fly.io                 | servidor sempre ligado, controle total                                         | pede cartão e exige cuidar de máquina, região e memória                                    |
| Azure (GitHub Student) | nuvem "corporativa", boa para o currículo                                      | o crédito de US$ 100 acaba quando o vínculo de estudante termina                           |

A API foi feita desde o início **desacoplada do servidor**: `buildApp()` (em
`apps/api/src/build-app.ts`) monta o Fastify com as rotas, e só o `server.ts` chama o `listen()`.
Os testes usam o `buildApp()` sem abrir porta, e a mesma API pode ir para outro serviço (um servidor
comum, um container) sem mudar as rotas.

**E a escalabilidade?** O portal é estático, então aguenta muito acesso sem custo extra. A API é só
leitura e escala sozinha, abrindo mais instâncias conforme a demanda. O gargalo seria o número de
conexões com o banco, e é isso que o _pooler_ resolve. Como os dados mudam uma vez por dia, o
próximo passo é guardar as respostas em cache na CDN (veja o [Roadmap](#-roadmap)).

### CI e CD

- **CI (integração contínua), no GitHub Actions:** a cada PR e a cada push na `main`, instala tudo
  do zero, aplica as migrations num Postgres temporário, compila e roda os testes
  ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
- **CD (entrega contínua), na Vercel:** os dois projetos da Vercel estão ligados ao repositório. Cada
  push na `main` publica em produção, e cada PR ganha um endereço de prévia próprio, para conferir
  antes do merge. Como a `main` é protegida e só recebe PR com CI verde, o que chega em produção já
  passou nos testes.
- **Fora do automático:** as migrations de produção (`prisma migrate deploy`) e o sync são rodados
  à mão, do PC do mantenedor, pela porta 5432 do Supabase.

### Variáveis de ambiente em produção

| Projeto na Vercel   | Variável       | Valor                                                                                   |
| :------------------ | :------------- | :-------------------------------------------------------------------------------------- |
| API (`apps/api`)    | `DATABASE_URL` | URL do Supabase na porta **6543**, sem `?pgbouncer=true`                                |
| API (`apps/api`)    | `CORS_ORIGIN`  | `https://de-olho-na-cota.vercel.app`                                                    |
| portal (`apps/web`) | `VITE_API_URL` | `https://api-transparencia-senado.vercel.app` (entra no build: mudar exige novo deploy) |


## 🔌 Rotas da API

Base pública: `https://api-transparencia-senado.vercel.app` (local: `http://localhost:3333`). Sem
cadastro, sem chave, só `GET`.

| Método | Rota                                   | O que responde                                                     |
| :----- | :------------------------------------- | :----------------------------------------------------------------- |
| `GET`  | `/health`                              | se a API está no ar                                                |
| `GET`  | `/senadores?ano=`                      | todos os senadores com o total gasto no ano, do maior para o menor |
| `GET`  | `/senadores/{codigo}`                  | perfil de um senador                                               |
| `GET`  | `/senadores/{codigo}/gastos?ano=`      | total gasto no ano, por tipo de gasto e mês a mês                  |
| `GET`  | `/senadores/{codigo}/remuneracao?ano=` | salário mês a mês e o total líquido do ano                         |
| `GET`  | `/sincronizacao`                       | data e hora da última atualização dos dados                        |

```bash
curl "https://api-transparencia-senado.vercel.app/senadores?ano=2026&uf=CE"
```

## 📖 Documentação da API (Swagger)

**<https://api-transparencia-senado.vercel.app/docs>** (local: `http://localhost:3333/docs`)

A documentação é gerada pelo próprio código da API, então nunca fica desatualizada: cada rota
declara os seus parâmetros, e o [`@fastify/swagger`](https://github.com/fastify/fastify-swagger)
monta a partir disso um documento [OpenAPI](https://www.openapis.org/), que o Swagger UI mostra como
página. Os parâmetros saem dos mesmos schemas Zod que validam cada requisição
([`apps/api/src/docs.ts`](apps/api/src/docs.ts)).

O mesmo conteúdo em JSON, para importar no Bruno, no Postman ou em outro sistema, fica em
[`/docs/json`](https://api-transparencia-senado.vercel.app/docs/json).

## 🖥️ O portal

<https://de-olho-na-cota.vercel.app>

| Página         | Endereço                 | O que mostra                                                                                                                                                |
| :------------- | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lista          | `/?uf=CE`                | senadores com o total gasto no ano, do maior para o menor; busca por nome e filtros de estado, partido e "só quem está no cargo" (o endereço guarda o filtro) |
| Perfil         | `/senador/5926`          | total do ano, posição no ranking, maior gasto, divisão por tipo, gastos mês a mês, salário e colegas do mesmo estado; link para conferir no site do Senado   |
| Comparar       | `/comparar?a=5926&b=...` | dois senadores lado a lado (resumo, tipos de gasto e meses), com o maior valor de cada linha destacado; o link pode ser compartilhado                        |
| Sobre os dados | `/sobre`                 | de onde vêm os dados, o que é a cota e o que o portal não mostra, em linguagem simples                                                                       |

## 🧪 Testar a API

A pasta [`bruno/`](bruno/) tem uma coleção do [Bruno](https://www.usebruno.com/) (cliente de API
gratuito que guarda as requisições como arquivos no repositório) com **todas as rotas e os casos de
erro**, cada uma com uma descrição e um teste automático.

```
bruno/
├── environments/local.bru      baseUrl, ano, codigo, uf (API na sua máquina)
├── environments/producao.bru   as mesmas variáveis, apontando para a API publicada
├── health.bru
├── Senadores/                  lista, lista por estado, perfil, gastos, salário
└── Erros/                      404 senador inexistente · 400 sem ano · 400 código com letras
```

No Bruno: **Open Collection** → pasta `bruno` → ambiente **producao** ou **local** (canto superior
direito). Trocar
a variável `codigo` muda o senador de todas as requisições de uma vez. Pelo terminal também dá:
`curl` com os exemplos acima, ou no PowerShell `curl.exe`.

## 📚 Fonte dos dados

Todos os dados vêm das APIs oficiais de dados abertos do Senado Federal:

| API                           | O que o sync usa                                                                                                 | Documentação                                          |
| :---------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| Dados abertos administrativos | `/senadores/despesas_ceaps/{ano}` (gastos da cota) e `/servidores/remuneracoes/{ano}/{mes}` (folha de pagamento) | https://adm.senado.gov.br/adm-dadosabertos/swagger-ui |
| Dados abertos legislativos    | `/senador/lista/atual` (senadores em exercício, nome completo, partido, estado e foto)                           | https://legis.senado.leg.br/dadosabertos              |

O projeto não altera os valores, só organiza e soma. **Dados pessoais:** CPF de fornecedor pessoa
física é mascarado no sync, antes de gravar (`***.456.789-**`), e o detalhamento das notas não é
guardado.

## 🧰 Tecnologias

| Parte          | Tecnologia                                 | Para quê                                                                           |
| :------------- | :----------------------------------------- | :--------------------------------------------------------------------------------- |
| Linguagem      | TypeScript                                 | tipos do banco até a tela, no projeto inteiro                                      |
| API            | Fastify + Zod                              | servidor HTTP rápido; Zod valida a entrada e devolve 400 com mensagem clara        |
| Banco          | PostgreSQL + Prisma                        | schema versionado em migrations e consultas tipadas                                |
| Portal         | React + Vite + Tailwind CSS + React Router | páginas com endereço próprio e estilo por tokens de cor                            |
| Testes         | Vitest (+ Testing Library no portal)       | unitários no sync, de integração na API (banco de teste) e de componente no portal |
| Ambiente local | Docker Compose                             | Postgres igual para qualquer pessoa, com um comando                                |
| Monorepo       | pnpm workspaces                            | sync, API, portal e banco no mesmo repositório, compartilhando o pacote `@ts/db`   |
| CI             | GitHub Actions                             | a cada PR: instalação limpa, migrations, build e testes                            |
| Hospedagem     | Vercel + Supabase                          | portal na CDN, API como função _serverless_, PostgreSQL gerenciado em São Paulo    |

## 📁 Estrutura do repositório

```
apps/
├── api/        API REST (Fastify): rotas, validação com Zod, repositories
├── sync/       sincronização com as APIs do Senado (ETL)
└── web/        portal (React)
packages/
└── db/         schema do banco, migrations e cliente (Prisma)
bruno/          coleção do Bruno com todas as rotas
docs/           banco de dados e identidade visual
disciplina/     documentos da disciplina CC0464 (plano, diário, marcos, evidências)
```

## 🚀 Como rodar localmente

Resumo para quem já tem Node 24, pnpm e Docker:

```bash
git clone https://github.com/AlissonWork/api-transparencia-senado.git && cd api-transparencia-senado
pnpm install && cp .env.example .env
docker compose up -d && pnpm --filter @ts/db exec prisma migrate deploy
pnpm --filter @ts/sync sync     # traz os dados do Senado
pnpm dev                        # API em :3333 e portal em :5173
```

<details>
<summary><strong>Passo a passo completo</strong> (pré-requisitos, Windows, testes e variáveis de ambiente)</summary>

#### Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js 24](https://nodejs.org/) (a versão está em `.node-version`)
- [Docker](https://www.docker.com/) com o Docker Compose, **aberto e rodando** (no Windows e no
  macOS, o Docker Desktop)

Os comandos abaixo são para Bash (Linux, macOS ou Git Bash no Windows). Diferenças para o PowerShell
estão indicadas.

#### 1. Instalar

```bash
git clone https://github.com/AlissonWork/api-transparencia-senado.git
cd api-transparencia-senado
corepack enable pnpm          # ativa o pnpm na versão definida no projeto
pnpm install                  # instala as dependências e gera o cliente do Prisma
cp .env.example .env          # no PowerShell: Copy-Item .env.example .env
```

Se o `corepack enable pnpm` falhar com `EPERM` ou "operação não permitida", o Node está instalado
numa pasta protegida (comum no Windows, em `C:\Program Files\nodejs`). Rode só esse comando num
terminal aberto como administrador (no Linux e no macOS, com `sudo`), ou instale o pnpm sem o corepack:

```bash
npm install -g pnpm@12.6.0
```

Confira com `pnpm --version`, que deve mostrar `12.6.0`.

O `.env` já vem configurado para o banco local; não é preciso editar nada.

#### 2. Subir o banco e criar as tabelas

```bash
docker compose up -d                              # sobe o PostgreSQL na porta 5432
docker compose ps                                 # espere o STATUS mostrar "healthy"
pnpm --filter @ts/db exec prisma migrate deploy   # cria as tabelas
```

Se a porta 5432 já estiver em uso por outro PostgreSQL na sua máquina, pare-o antes, ou o
`migrate deploy` falha com `Authentication failed`.

#### 3. Trazer os dados do Senado

```bash
pnpm --filter @ts/sync sync
```

Saída esperada (os números crescem conforme o Senado lança novas despesas):

```
81 senadores em exercício atualizados
14563 despesas, 89 senadores e 8 categorias gravados
```

#### 4. Rodar a API e o portal

```bash
pnpm dev
```

Esse comando sobe os dois juntos:

- a **API** em `http://localhost:3333` (no terminal aparece `Server listening at http://127.0.0.1:3333`);
- o **portal** em `http://localhost:5173`.

#### 5. Usar

- Portal: `http://localhost:5173` (lista de senadores, perfil com gastos e salário, e "Sobre os dados").
- API: `http://localhost:3333` (veja [Rotas da API](#-rotas-da-api)) ou a coleção do Bruno
  ([Testar a API](#-testar-a-api)).

Para ver os códigos de senador disponíveis no banco:

```bash
docker compose exec db psql -U senado -d transparencia -c "select codigo, nome from senadores order by nome"
```

#### 6. Rodar os testes

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

#### Variáveis de ambiente

| Variável                     | Onde             | Para quê                                                            | Padrão                                     |
| :--------------------------- | :--------------- | :------------------------------------------------------------------ | :----------------------------------------- |
| `DATABASE_URL`, `DIRECT_URL` | `.env` na raiz   | endereço do banco                                                   | banco local do Docker (ver `.env.example`) |
| `CORS_ORIGIN`                | API              | endereços que podem ler a API pelo navegador, separados por vírgula | `http://localhost:5173`                    |
| `VITE_API_URL`               | portal, no build | endereço da API que o portal chama                                  | `http://localhost:3333`                    |

Em desenvolvimento, nenhuma precisa ser alterada.

</details>

## 🗺️ Roadmap

- [x] **v0.1.0 (02/10/2026)**: gastos de um senador por ano, rodando localmente com dados reais
- [x] **v0.2.0 (13/11/2026)**: perfil do senador, consulta por estado e por categoria, portal web
  - [x] lista de senadores com filtros e perfil do senador na API
  - [x] portal com a lista, o perfil e a página "Sobre os dados"
  - [x] salário dos senadores (sync da folha, rota e seção no perfil)
  - [x] portal no celular e identidade visual
  - [x] uso por uma pessoa de fora, com retorno escrito
- [x] **v1.0.0 (27/11/2026)**: publicado na internet
  - [x] API e portal na Vercel, banco no Supabase, deploy automático a cada push na `main`
  - [x] documentação interativa da API em `/docs`
  - [x] gastos da cota mês a mês no perfil
  - [x] comparação de dois senadores lado a lado
  - [x] data da última atualização no rodapé e selo de suplente em exercício
- [ ] **Próximos passos**
  - [ ] cache HTTP nas respostas da API (os dados mudam uma vez por dia)
  - [ ] erro 500 sem detalhes internos em produção
  - [ ] sync automático diário, sem o ano fixo no código
  - [ ] cota disponível por estado ("usou X% do limite")
  - [ ] mapa do Brasil com o gasto por estado
  - [ ] pacote `@ts/db` compilado para JavaScript

## 🤝 Como contribuir

Contribuições são bem-vindas.

1. Crie uma branch a partir da `main` (`feat/...`, `fix/...`, `docs/...`).
2. Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/) nas mensagens.
3. Abra um Pull Request para a `main`. A CI (GitHub Actions) instala tudo do zero, aplica as
   migrations num Postgres temporário, compila e roda os testes; ela precisa passar.

Um guia detalhado (`CONTRIBUTING.md`) será adicionado junto com o ambiente de desenvolvimento.

## 🎓 Disciplina

Este projeto é a ação de extensão da disciplina **CC0464 – Interfaces de Programação de Aplicação**
(Universidade Federal do Ceará, 2026.2). Plano de ação, diário de bordo, entregas de marco e
evidências estão na pasta [`disciplina/`](disciplina/).

## 📄 Licença

Código sob licença MIT. Os dados pertencem ao Senado Federal e seguem os termos do seu portal de
dados abertos.
