# Marco 3 — Transparência Senado

---

## Identificação

- **Equipe:** Alisson dos Santos Nascimento — matrícula 555501 (projeto individual)
- **Marco e data:** Marco 3 — 27/11/2026 (entrega remota, pelo repositório)
- **Trilha:** (A) API pública de dados abertos
- **Endereço público do produto:**
  - Portal: <https://de-olho-na-cota.vercel.app>
  - API: <https://api-transparencia-senado.vercel.app>, com a documentação em
    <https://api-transparencia-senado.vercel.app/docs>
  - Repositório: <https://github.com/AlissonWork/api-transparencia-senado>
- **Commit ou tag desta entrega:** tag `v1.0.0` da `main`, publicada no GitHub em 27/11/2026, já com
  esta ficha, o diário e as evidências.

## Campo 1 — O que funciona hoje

Nada precisa ser instalado: basta um navegador (no computador ou no celular) ou o `curl`.

1. Abrir <https://de-olho-na-cota.vercel.app/?uf=CE> e ver os senadores do Ceará com o total gasto
   da cota em 2026, do maior para o menor. Em "Ver gastos" (por exemplo,
   <https://de-olho-na-cota.vercel.app/senador/5926>) aparecem o total do ano, a posição entre os
   senadores, a frase com o maior gasto, a divisão por tipo de gasto, os gastos mês a mês, o salário
   e os colegas do mesmo estado, com o link para conferir no site do Senado.
2. Abrir <https://de-olho-na-cota.vercel.app/comparar>, escolher o Senador A e o Senador B e ver os
   dois lado a lado (resumo do ano, tipos de gasto e meses), com o maior valor de cada linha
   destacado. O endereço vira `/comparar?a=...&b=...` e pode ser enviado a outra pessoa, que abre a
   mesma comparação.
3. Rodar `curl "https://api-transparencia-senado.vercel.app/senadores?ano=2026&uf=CE"` e receber em
   JSON os senadores do Ceará com o total do ano; `curl
   "https://api-transparencia-senado.vercel.app/senadores/5926/gastos?ano=2026"` devolve o total por
   tipo de gasto e mês a mês. Um código inválido (`/senadores/abc`) responde 400 e um senador
   inexistente, 404. Em <https://api-transparencia-senado.vercel.app/docs> as 6 rotas estão
   documentadas, e o botão "Try it out" roda cada uma no navegador.

## Campo 2 — O que mudou desde o marco anterior

- **Passou a existir:**
  - **Produto publicado na internet** (26/11): portal na CDN da Vercel, API como função _serverless_
    da Vercel e banco no Supabase (17.388 despesas, 92 senadores e 902 linhas de salário). Deploy
    automático a cada merge na `main` (PRs #45 e #46).
  - **Documentação interativa da API** em `/docs` (Swagger/OpenAPI), gerada dos mesmos schemas Zod
    que validam cada requisição, com a versão em JSON em `/docs/json` (PR #47).
  - **Comparar senadores** (`/comparar`): dois senadores lado a lado, com o estado guardado no
    endereço (link compartilhável).
  - **Gastos da cota mês a mês** no perfil, com barras e o maior mês destacado (`porMes` na rota de
    gastos).
  - Rota `GET /sincronizacao` e o rodapé "Atualizado em DD/MM", que mostra ao público de quando é o
    dado; selo de suplente em exercício no perfil.
  - README com os endereços públicos, a seção "Hospedagem e deploy" (diagrama, por que a Vercel, CI e
    CD) e coleção do Bruno com o ambiente de produção.
  - 104 testes automatizados (eram 45 no Marco 2) e a `main` protegida: só entra PR com histórico
    linear e o check "testes" do GitHub Actions passando.
  - O cliente usou o portal publicado, sozinho, e respondeu por escrito (27/11).
- **Foi cortado, e por quê:**
  - **Tabela do salário mês a mês:** descartada em 23/11. O subsídio é fixo (R$ 46.366,19) e o
    líquido quase não muda de um mês para outro, então a tabela não dizia nada novo; foi trocada
    pelos gastos da cota mês a mês, que variam e respondem à pergunta do público.
  - **Cota disponível por estado ("usou X% do limite") e mapa do Brasil:** não entraram. A semana
    de 20/11 ficou parada (Campo 4), e a prioridade foi publicar e levar o portal ao cliente, que é
    a exigência do Marco 3. Ficam no roadmap do README.
  - **Detalhamento dos descontos e comparação salário x gastos:** cortados pelo mesmo motivo.
  - **Para 04/12:** contador de acessos (para medir os visitantes únicos do Campo 3), cache HTTP nas
    respostas da API, sync automático diário sem o ano fixo no código e divulgação do link no
    LinkedIn. Domínio próprio: decidido não comprar agora; o endereço da Vercel atende.

## Campo 3 — Alcance

| Indicador                                                        | Planejado                                         | Obtido até hoje                                                                                                     | Onde está a evidência                                                                                       |
| :--------------------------------------------------------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------- |
| Visitantes únicos no endereço público (02/10 a 27/11)            | 20                                                | Não medido: o portal entrou no ar em 26/11 sem contador de acessos                                                  | —                                                                                                           |
| Pessoas de fora que usaram o portal                              | 2 identificadas no plano (meta de chegar a ~5)    | **2 de 2**: o vizinho do bairro (12/11, chamada de vídeo) e o cliente (27/11, sozinho, no endereço público)         | `evidencias/2026-11-12-call-vizinho-perfil.png`, `evidencias/2026-11-27-cliente-comparar.png`               |
| Retornos escritos de quem usou, dos dois perfis                  | 2, de vizinhos e de clientes                      | **2**: vizinho do bairro (12/11, email) e cliente (27/11, WhatsApp), mais 1 retorno do vizinho antes do portal (14/10) | `evidencias/2026-11-12-resposta-vizinho.png`, `evidencias/2026-11-27-resposta-cliente.png`, `evidencias/2026-10-14-resposta-vizinho.png` |

Os números saem das 8 linhas do `evidencias.csv`: contando as linhas `teste_guiado` por
`quem_de_fora`, são 2 pessoas; contando `resposta_publico` depois do uso, 2 retornos.

**O que o público externo disse.** "Facilidade de usar o site." (cliente, por WhatsApp, 27/11, ao
responder o que mais chamou a atenção). Ele recebeu só o link e 3 tarefas, fez as três no próprio
celular sem ajuda ("Sim"), não achou nenhuma parte confusa ("Não") e usaria de novo ou mostraria
para alguém ("Sim"). Antes dele, o vizinho tinha dito: "Mandaria, principalmente em época de
eleição." (email, 12/11).

**O que mudou por causa do público.** A pergunta do vizinho em 14/10, "qual maior gasto deles",
virou a frase de destaque do perfil do senador, e a página "Sobre os dados" explica a cota em
linguagem simples para quem, como os dois, nunca abriu o portal de dados do Senado. O cliente não
apontou nada que faltou.

**Planejado x obtido.** O indicador qualitativo foi atingido: 2 retornos escritos, um de cada
perfil. O de contagem não: os 20 visitantes únicos não foram medidos, porque a publicação, que é
exigência deste marco, só saiu em 26/11 e foi feita sem registro de acessos; e o alcance ficou nas
2 pessoas do plano, sem chegar às ~5 por indicação, porque o contato foi um a um e o link ainda não
foi divulgado. O que eu faria diferente: publicar logo depois do Marco 2, já com o contador, para
que a contagem corresse durante as duas semanas. Até 04/12, o plano é colocar o contador, divulgar
o link no LinkedIn e pedir ao cliente e ao vizinho que repassem para mais uma pessoa cada.

## Campo 4 — Obstáculo e replanejamento

- **Semana de 20/11 parada (cerca de 8h, a dedicação de uma semana).** Uma demanda grande do
  trabalho ocupou a semana inteira. O tempo foi compensado na semana de 27/11 (16h registradas no
  diário), e o replanejamento foi cortar a cota por estado, o mapa e os descontos (Campo 2) para
  garantir a publicação e o uso pelo cliente.
- **92 senadores "no cargo" contra 81 cadeiras (25/11, ~1h).** Não era erro no código: o banco
  estava desatualizado desde 12/11. Depois de um sync novo, o perfil passou a mostrar o selo de
  suplente em exercício. Reforçou a necessidade do sync automático.
- **Deploy da API (26/11, ~3h).** Erros em sequência: Supabase pausado por falta de uso, senha com
  `#` quebrando a URL, a Vercel sem achar o arquivo de entrada, o cache pulando a geração do Prisma,
  o pacote do banco apontando para `.ts`, o `await` no `listen()` travando a inicialização e a
  `DATABASE_URL` colada com defeito. Cada um foi resolvido lendo o log da Vercel; os ajustes estão
  no README.
- **Senha do banco exposta (26/11).** Ela apareceu numa conversa durante o deploy; foi trocada no
  mesmo dia.
- **Botões A-/A+ no celular (25/11).** Causavam rolagem lateral na tela Comparar; ficaram só no
  computador.
- **Sync só do PC.** A API do Senado recusa (403) parte dos servidores em nuvem testados, então o
  sync de produção ainda roda manualmente do PC. Para 04/12, o plano é um agendamento diário
  (GitHub Actions; plano B: Agendador de Tarefas do Windows), e o rodapé "Atualizado em DD/MM" já
  avisa o público de quando é o dado.
- **Contato com o cliente.** O plano era mostrar o portal pessoalmente. Com o portal publicado, foi
  possível mandar o link com 3 tarefas e 4 perguntas por WhatsApp, e ele respondeu em 5 minutos,
  sem precisar de encontro.

## Campo 5 — Autopontuação

| Dimensão                            | n.a.? | Pts (0–2) | Por quê, em uma linha                                                                                                                                  |
| :---------------------------------- | :---- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 Qualidade técnica                |       | 2         | Publicado e usado por alguém de fora no celular; validação de entrada com erros 400/404, 104 testes, CI obrigatório na `main` e código em camadas.     |
| D2 Alcance e adequação ao público   |       | 1,5       | Chegou às 2 pessoas do plano, dos dois perfis, com retorno escrito e ajuste ao que disseram, mas a contagem de visitantes não foi medida.             |
| D3 Documentação e reprodutibilidade |       | 2         | README com endereços públicos, exemplos que rodam, fonte, licença e limitações; Swagger em `/docs`, coleção do Bruno e passo a passo local.           |
| D4 Registro do processo             |       | 2         | Diário com todas as semanas, datado e com horas, inclusive a semana parada e o motivo; issues, PRs com descrição e Conventional Commits.               |
| D5 Autoavaliação e reflexão         |       | 1,5       | A ficha confronta planejado e obtido e diz o que faria diferente; a autoavaliação individual completa é entregue com a socialização, em 04/12.         |

Nota pela autopontuação: 10 × 9 / 10 = 9,0.

## Antes de entregar

- [x] O endereço do produto abre numa máquina que não é a nossa. (o cliente abriu no celular dele
      em 27/11)
- [x] O que o Campo 1 promete foi testado hoje, não na semana passada.
- [x] O `README.md` corresponde ao que o produto faz agora.
- [x] O diário tem entrada de todas as semanas desde o último marco (20/11 e 27/11).
- [x] Toda evidência do Campo 3 tem data e está em `evidencias/`.
- [x] O commit informado está publicado. (tag `v1.0.0`)
