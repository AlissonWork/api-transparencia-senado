# Marco 1 — Transparência Senado

> Entrega remota (exceção de 2026.2): esta ficha está commitada em `disciplina/marco-1.md`, com prazo
> até 04/10/2026. Os documentos da disciplina deste repositório ficam todos na pasta `disciplina/`:
> `plano-de-acao.md`, `diario-de-bordo.md`, `evidencias.csv`, `marco-1.md`. O `README.md` está na raiz.

---

## Identificação

- **Equipe:** Alisson dos Santos Nascimento — matrícula 555501 (projeto individual)
- **Marco e data:** Marco 1 — 02/10/2026 (entrega remota até 04/10/2026)
- **Trilha:** (A) API pública de dados abertos
- **Endereço público do produto:** n.a. neste marco — a publicação na internet é exigência do Marco 3,
  conforme orientação do professor. O produto roda localmente seguindo o `README.md`.
  Repositório: https://github.com/AlissonWork/api-transparencia-senado
- **Commit ou tag desta entrega:** `<PREENCHER: hash do commit na main depois do merge>`

## Campo 1 — O que funciona hoje

Pré-requisito: seguir a seção "Como rodar localmente" do `README.md` (Node 24, pnpm e Docker).

1. Rodar `pnpm --filter @ts/sync sync` e ver no terminal
   `14563 despesas, 89 senadores e 8 categorias gravados`: o sync baixa as despesas da cota parlamentar
   (CEAPS) de 2026 da API do Senado, valida o formato e grava no banco local em cerca de 8 segundos.
   Os números crescem conforme o Senado lança novas despesas.
2. Rodar `curl "http://localhost:3333/senadores/5926/gastos?ano=2026"` e receber em JSON o total gasto
   pelo senador no ano (R$ 362.234,49) e a divisão por categoria, do maior para o menor gasto. O total
   e cada categoria conferem com o resumo oficial do Senado em
   `https://adm.senado.gov.br/adm-dadosabertos/api/v1/senadores/5926/recursos-utilizados`.
   Senador inexistente responde 404; código ou ano inválido responde 400.
3. Rodar `pnpm test` e ver `Tests 5 passed`: um teste do `/health` e quatro da rota de gastos (soma por
   categoria com filtro de ano, 404 e dois casos de 400), executados contra um banco de teste separado.

## Campo 2 — O que mudou desde o marco anterior

n.a.

## Campo 3 — Alcance

| Indicador | Planejado | Obtido até hoje | Onde está a evidência |
| :-- | :-- | :-- | :-- |
| Visitantes únicos no endereço público (02/10 a 27/11) | 20 | 0 — o produto ainda não está publicado (Marco 3) | — |
| Retornos escritos de pessoas de fora | 2 | 0 — primeira conversa marcada para 08/10 | — |

**O que o público externo disse.** Ninguém de fora se manifestou ainda. A primeira conversa, com um
vizinho do bairro ou um cliente para quem o autor presta serviço, está marcada para 08/10, mostrando a
rota de gastos com os senadores do Ceará; o convite e o retorno serão registrados no `evidencias.csv`.

## Campo 4 — Obstáculo e replanejamento

- **Publicação movida para o Marco 3.** O plano previa a rota publicada em endereço público já no
  Marco 1. Com a orientação do professor de que a publicação é exigência do Marco 3, o deploy saiu
  deste marco e a prioridade passou a ser o produto rodar em qualquer máquina pelo `README.md`.
- **Versão instável do Prisma (27/09, ~30 min).** A versão "latest" do Prisma era uma release candidate
  (8.0.0-rc) que trazia 319 pacotes sem relação com o projeto. Resolvido fixando a versão estável 7.10.0
  em todos os pacotes do Prisma.
- **Conflito de porta do Postgres (29/09, ~20 min).** O banco respondia "Authentication failed" porque
  outro container Postgres, de outro projeto, ocupava a porta 5432. Resolvido parando o outro container;
  se voltar a acontecer, o banco deste projeto passa para outra porta.
- **Dia sem avanço (28/09).** O cronograma interno atrasou um dia; compensado em 29/09 e 01/10.
- **Escopo ampliado no Marco 2.** A remuneração dos senadores (folha de pagamento do Senado) entrou
  no planejamento do Marco 2; a tabela já existe no banco, vazia.

## Campo 5 — Autopontuação

| Dimensão | n.a.? | Pts (0–2) | Por quê, em uma linha |
| :-- | :-- | :-- | :-- |
| D1 Qualidade técnica | | 2 | A rota responde com dados reais e o total confere com o resumo oficial do Senado; validação de entrada, erros 400/404 e 5 testes automatizados. |
| D2 Alcance e adequação ao público | n.a. | — | Produto ainda não publicado; primeira conversa com o público marcada para 08/10. |
| D3 Documentação e reprodutibilidade | | 1 | README, plano e estrutura do banco documentados, mas o passo a passo de execução ainda não foi testado numa máquina limpa. |
| D4 Registro do processo | | 2 | Diário semanal, issues, PRs com descrição e commits padronizados registram cada decisão e obstáculo. |
| D5 Autoavaliação e reflexão | n.a. | — | Prevista para 04/12. |

Nota calculada: `10 × 5 / 6 = 8,3`.

## Antes de entregar

- [ ] O endereço do produto abre numa máquina que não é a nossa. (n.a. no Marco 1; o equivalente é o
      `README.md` funcionar num clone limpo.)
- [ ] O que o Campo 1 promete foi testado hoje, não na semana passada.
- [ ] O `README.md` corresponde ao que o produto faz agora.
- [ ] O diário tem entrada de todas as semanas desde o último marco.
- [x] Toda evidência do Campo 3 tem data e está em `evidencias/`. (Nenhuma evidência ainda.)
- [ ] O commit informado está publicado.
