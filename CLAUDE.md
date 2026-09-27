# CLAUDE.md

Instruções para o Claude trabalhar neste repositório.

## O projeto

API pública e portal web com os gastos da cota parlamentar (CEAPS) dos senadores, a partir dos
dados abertos do Senado Federal. Visão geral, fontes e roadmap no `README.md`; escopo, público e
cronograma no `disciplina/plano-de-acao.md`.

É a ação de extensão da disciplina CC0464 (UFC, 2026.2), feita individualmente pelo Alisson.
Próximo prazo: **Marco 1 em 02/10/2026** — rota `GET /senadores/{id}/gastos?ano=` publicada com
dados reais.

## Stack

| Parte | Tecnologia |
| :-- | :-- |
| Linguagem | TypeScript |
| API | Fastify + Zod |
| Banco | PostgreSQL no Supabase (produção) e via Docker Compose (local), com Prisma |
| Portal | React + Vite |
| Testes | Vitest |
| Monorepo | pnpm workspaces |
| CI | GitHub Actions |
| Deploy da API | a definir (Render é a opção atual) |

## Estrutura planejada

```
apps/api       API REST (Fastify): routes → service → repository, schemas com Zod
apps/sync      sincronização com as APIs do Senado (ETL)
apps/web       portal (React)
packages/db    schema Prisma, migrations e seed
packages/shared tipos e schemas compartilhados
disciplina/    documentos da disciplina (plano, diário, marcos, evidências)
```

A API lê só o banco próprio; nunca chama o Senado durante uma requisição.

## Convenções

- **Commits:** Conventional Commits em português (`feat:`, `fix:`, `docs:`, `chore:`), só o
  título. **Sem** linha `Co-Authored-By` ou qualquer menção ao Claude. Junte ajustes pequenos num
  commit só.
- **Branches:** a partir da `main`, com prefixo `feat/`, `fix/` ou `docs/`. Um PR por tarefa.
- **Pacotes:** use `pnpm`, nunca `npm` ou `yarn`.
- **Segredos:** URL do banco e chaves ficam em `.env` (fora do git). Só `.env.example` é versionado.

## Dados pessoais

O repositório é público.

- Pessoas do público externo aparecem só pelo **vínculo** ("vizinho do bairro"), nunca pelo nome.
- CPF de fornecedor pessoa física é sempre mascarado antes de sair pela API.

## Comandos

Ainda não há código. Esta seção será preenchida quando o monorepo for criado
(`pnpm install`, `pnpm dev`, `pnpm test`, `docker compose up`).
