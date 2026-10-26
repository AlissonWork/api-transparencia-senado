# Marco 2 — Transparência Senado

> **Rascunho de 26/10/2026.** A entrega é em 13/11/2026. Antes de entregar: refazer os testes do
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
   de gasto com o gráfico de quadradinhos e os colegas do mesmo estado. O link "Conferir estes números no
   site do Senado" abre a página oficial do mesmo senador para comparar.
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
    página "Sobre os dados" em linguagem simples.
  - CI no GitHub Actions (instalação limpa, migrations, build e testes a cada PR) e licença MIT.
  - Primeiro retorno escrito de uma pessoa de fora (vizinho do bairro, 14/10).
- **Foi cortado, e por quê:**
  - Remuneração dos senadores: ficou fora do Marco 2 para priorizar o portal, que é o que o público
    vai usar. A tabela continua no banco, vazia, e pode voltar no Marco 3.
  - Comparação com a cota disponível por estado: **(pendente — decidir se entra até 13/11 ou vai
    para o Marco 3)**.

## Campo 3 — Alcance

| Indicador                                             | Planejado | Obtido até hoje                                                | Onde está a evidência                        |
| :---------------------------------------------------- | :-------- | :------------------------------------------------------------- | :------------------------------------------- |
| Visitantes únicos no endereço público (02/10 a 27/11) | 20        | 0 — o produto ainda não está publicado (Marco 3)               | —                                            |
| Retornos escritos de pessoas de fora                  | 2         | 1 — vizinho do bairro, 14/10 (prova dos nove, antes do portal) | `evidencias/2026-10-14-resposta-vizinho.png` |

**O que o público externo disse.** "Fica mais fácil de acompanhar os políticos em quem eu penso em
votar." (vizinho do bairro, por email, 14/10). A pergunta dele, "qual maior gasto deles", virou a
frase de destaque do perfil do senador. **(pendente: retorno do vizinho e do cliente depois de
usarem o portal, #20.)**

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

## Campo 5 — Autopontuação

**(pendente — rascunho, revisar em 13/11)**

| Dimensão                            | n.a.? | Pts (0–2) | Por quê, em uma linha                                                                                                           |
| :---------------------------------- | :---- | :-------- | :------------------------------------------------------------------------------------------------------------------------------ |
| D1 Qualidade técnica                |       | 2         | Funciona de ponta a ponta (sync → banco → API → portal), com validação de entrada, erros 400/404, 24 testes automatizados e CI. |
| D2 Alcance e adequação ao público   |       |           | Depende do retorno do público ao usar o portal (#20).                                                                           |
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
