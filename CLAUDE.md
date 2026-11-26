# CLAUDE.md

Instruções para o Claude trabalhar neste repositório.

## O projeto

API pública e portal web com os gastos da cota parlamentar (CEAPS) dos senadores, a partir dos
dados abertos do Senado Federal. Visão geral, fontes e roadmap no `README.md`; escopo, público e
cronograma no `disciplina/plano-de-acao.md`.

É a ação de extensão da disciplina CC0464 (UFC, 2026.2), feita individualmente pelo Alisson.
Publicado em 26/11/2026: portal em https://de-olho-na-cota.vercel.app e API em
https://api-transparencia-senado.vercel.app. Socialização em 04/12/2026.

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
| Hospedagem | Vercel (portal na CDN e API serverless) + Supabase; sync manual do PC |

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
