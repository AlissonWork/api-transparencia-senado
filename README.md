# Transparência Senado

API pública e portal web que transformam os dados abertos do Senado Federal em respostas simples:
**quanto cada senador gastou da cota parlamentar, em quê, e como isso se compara com a cota
disponível e com os colegas do mesmo estado.**

> **Status:** em desenvolvimento. Ainda não há versão publicada.
> Primeira versão prevista para 02/10/2026 (`v0.1.0`).

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

Em breve. O objetivo é que baste:

```bash
docker compose up
```

## Roadmap

- [ ] **v0.1.0 (02/10/2026)**: gastos de um senador por ano, via API publicada
- [ ] **v0.2.0 (13/11/2026)**: perfil do senador, consulta por estado e por categoria, portal web
- [ ] **v1.0.0 (27/11/2026)**: documentação completa, validação com usuários reais

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
