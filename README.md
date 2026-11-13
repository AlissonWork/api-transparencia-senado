<p align="center">
  <img src="docs/identidade/logo-com-nome.png" alt="De Olho na Cota" width="460">
</p>

<p align="center">
  <strong>Quanto cada senador gastou da cota parlamentar, em quê, e quanto recebe de salário.</strong><br>
  API pública e portal web a partir dos dados abertos do Senado Federal.
</p>

<p align="center">
  <a href="https://github.com/AlissonWork/api-transparencia-senado/actions/workflows/ci.yml"><img src="https://github.com/AlissonWork/api-transparencia-senado/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/vers%C3%A3o-v0.2.0-0a6b35" alt="versão v0.2.0">
  <img src="https://img.shields.io/badge/testes-60-0a6b35" alt="60 testes">
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
  <a href="#-por-que-existe">Por que existe</a> ·
  <a href="#-arquitetura">Arquitetura</a> ·
  <a href="#-rotas-da-api">Rotas da API</a> ·
  <a href="#-como-rodar-localmente">Como rodar</a> ·
  <a href="#-roadmap">Roadmap</a>
</p>

> [!NOTE]
> **Status: v0.2.0 (Marco 2).** Funciona de ponta a ponta na sua máquina: o sync traz as despesas, os
> senadores e a folha de pagamento do Senado, a API entrega tudo em JSON e o portal mostra a lista,
> o perfil e o salário de cada senador, também no celular. O endereço público chega no Marco 3
> (27/11/2026).

---

## 💡 Por que existe

O Senado publica cada nota fiscal reembolsada pela Cota para o Exercício da Atividade Parlamentar
(CEAPS). O dado é aberto, mas vem **bruto**: milhares de lançamentos por ano, de todos os senadores
juntos. Para responder a uma pergunta simples, como _"em que o senador do meu estado mais gastou
este ano?"_, é preciso baixar, filtrar e somar tudo isso por conta própria.

Este projeto faz essa soma e entrega a resposta pronta: por uma **API aberta** (sem cadastro nem
chave) e por um **portal** que qualquer pessoa consegue usar.

### Em números (dados de 2026, sync de 11 e 12/11)

| 🧾 Notas fiscais |       👤 Senadores       | 💰 Linhas de salário | 🔌 Rotas | ✅ Testes |
| :--------------: | :----------------------: | :------------------: | :------: | :-------: |
|    **16.505**    | **92** (81 em exercício) |       **902**        |  **5**   |  **60**   |

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

## 🔌 Rotas da API

Base local: `http://localhost:3333`. Sem cadastro, sem chave, só `GET`.

| Método | Rota                                                                         | O que responde                                                     |
| :----- | :--------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| `GET`  | [`/health`](#get-health)                                                     | se a API está no ar                                                |
| `GET`  | [`/senadores?ano=`](#get-senadoresano)                                       | todos os senadores com o total gasto no ano, do maior para o menor |
| `GET`  | [`/senadores/{codigo}`](#get-senadorescodigo)                                | perfil de um senador                                               |
| `GET`  | [`/senadores/{codigo}/gastos?ano=`](#get-senadorescodigogastosano)           | total gasto no ano e a divisão por tipo de gasto                   |
| `GET`  | [`/senadores/{codigo}/remuneracao?ano=`](#get-senadorescodigoremuneracaoano) | salário mês a mês e o total líquido do ano                         |

| Status | Quando                                                                         |
| :----: | :----------------------------------------------------------------------------- |
| `200`  | deu certo (lista vazia também é resposta válida)                               |
| `400`  | parâmetro inválido: falta o `ano`, código com letras, UF com mais de 2 letras… |
| `404`  | senador que não existe no banco                                                |

### `GET /health`

Confere se a API está no ar. Responde `200`.

### `GET /senadores?ano=`

Todos os senadores do banco (ou só os que passam nos filtros) com o total gasto no ano, **do maior
para o menor**. Quem não gastou nada aparece com `total: 0`.

| Parâmetro     | Obrigatório | Exemplo | O que faz                                                                        |
| :------------ | :---------: | :------ | :------------------------------------------------------------------------------- |
| `ano`         |     ✅      | `2026`  | ano das despesas                                                                 |
| `uf`          |             | `CE`    | só senadores do estado                                                           |
| `partido`     |             | `PT`    | só senadores do partido                                                          |
| `emExercicio` |             | `true`  | `true` só quem está no cargo hoje; `false` só quem saiu (por exemplo, suplentes) |

```bash
curl "http://localhost:3333/senadores?ano=2026&uf=CE&emExercicio=true"
```

<details>
<summary>Ver o formato da resposta</summary>

```json
{
  "ano": 2026,
  "quantidade": 3,
  "senadores": [
    {
      "codigo": 5926,
      "nome": "Nome do Senador",
      "partido": "PARTIDO",
      "uf": "CE",
      "urlFoto": "https://www.senado.leg.br/.../senador5926.jpg",
      "emExercicio": true,
      "total": 412345.67
    }
  ]
}
```

</details>

### `GET /senadores/{codigo}`

Perfil de um senador: nome parlamentar e completo, partido, estado, foto, se está no cargo e os anos
em que teve despesa (o portal usa essa lista no seletor de ano).

```bash
curl "http://localhost:3333/senadores/5926"
```

<details>
<summary>Ver o formato da resposta</summary>

```json
{
  "codigo": 5926,
  "nome": "Nome do Senador",
  "nomeCompleto": "Nome Completo do Senador",
  "partido": "PARTIDO",
  "uf": "CE",
  "urlFoto": "https://www.senado.leg.br/.../senador5926.jpg",
  "emExercicio": true,
  "anosComDespesa": [2026, 2025]
}
```

</details>

### `GET /senadores/{codigo}/gastos?ano=`

Quanto o senador gastou da cota no ano, dividido por tipo de gasto (com nomes curtos, como
"Passagens"), do maior para o menor. O primeiro item é o **maior gasto**, que o portal destaca.

```bash
curl "http://localhost:3333/senadores/5926/gastos?ano=2026"
```

<details>
<summary>Ver o formato da resposta</summary>

```json
{
  "senador": { "codigo": 5926, "nome": "Nome do Senador" },
  "ano": 2026,
  "total": 486321.28,
  "porCategoria": [
    {
      "categoria": "Transporte, hospedagem e alimentação",
      "slug": "transporte",
      "quantidade": 159,
      "total": 250764.4
    },
    {
      "categoria": "Passagens",
      "slug": "passagens",
      "quantidade": 33,
      "total": 104331.41
    }
  ]
}
```

</details>

### `GET /senadores/{codigo}/remuneracao?ano=`

O salário do senador mês a mês, pela folha de pagamento do Senado. Quando há folha Normal e
Suplementar no mesmo mês, as duas são somadas. Senador que não está na folha recebe `200` com a
lista vazia.

| Campo          | O que é                                                      |
| :------------- | :----------------------------------------------------------- |
| `subsidio`     | o salário bruto, antes dos descontos                         |
| `liquido`      | o que cai na conta, depois de previdência e imposto de renda |
| `totalLiquido` | a soma do líquido no ano                                     |

```bash
curl "http://localhost:3333/senadores/5926/remuneracao?ano=2026"
```

<details>
<summary>Ver o formato da resposta</summary>

```json
{
  "senador": { "codigo": 5926, "nome": "Nome do Senador" },
  "ano": 2026,
  "meses": [
    { "mes": 9, "subsidio": 46366.19, "liquido": 33500.12 },
    { "mes": 10, "subsidio": 46366.19, "liquido": 33500.12 }
  ],
  "totalLiquido": 67000.24
}
```

</details>

> Os valores dos exemplos são ilustrativos. Qualquer total pode ser conferido no resumo oficial do
> Senado, por exemplo:
> <https://adm.senado.gov.br/adm-dadosabertos/api/v1/senadores/5926/recursos-utilizados>.

## 🧪 Testar a API

A pasta [`bruno/`](bruno/) tem uma coleção do [Bruno](https://www.usebruno.com/) (cliente de API
gratuito que guarda as requisições como arquivos no repositório) com **todas as rotas e os casos de
erro**, cada uma com uma descrição e um teste automático.

```
bruno/
├── environments/local.bru      baseUrl, ano, codigo, uf
├── health.bru
├── Senadores/                  lista, lista por estado, perfil, gastos, salário
└── Erros/                      404 senador inexistente · 400 sem ano · 400 código com letras
```

No Bruno: **Open Collection** → pasta `bruno` → ambiente **local** (canto superior direito). Trocar
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
- [ ] **v1.0.0 (27/11/2026)**: API e portal publicados em endereço público, sync automático diário,
      cota disponível por estado ("usou X% do limite"), comparação de senadores e mapa do Brasil

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
