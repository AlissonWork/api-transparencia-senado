# Plano de ação — Transparência Senado

Versão final para o Marco 1 (02/10/2026). O que está aqui é o que será cobrado nos três marcos.

---

## Identificação

- **Equipe:** Alisson dos Santos Nascimento — matrícula 555501 (projeto individual)
- **Trilha:** (A) API pública de dados abertos
- **Área temática da PREX:** Tecnologia e Produção
- **Por que essa área,** acesso à informação sobre o uso de dinheiro público é
  condição para o controle social, um direito do cidadão.
- **Repositório:** https://github.com/AlissonWork/api-transparencia-senado

## Campo 1 — O problema

Um morador de bairro de Fortaleza que não programa e quer saber em que os senadores do Ceará
gastaram a cota parlamentar este ano precisa baixar milhares de notas fiscais de todos os 81
senadores, filtrar pelo nome e somar por conta própria, e por isso desiste.

## Campo 2 — O público externo

- **Quem é:** adultos que não programam e fazem parte do convívio direto do autor em Fortaleza:
  vizinhos do bairro e clientes para quem o autor presta serviço. São eleitores que acompanham política por
  conversa e WhatsApp, mas nunca abriram o portal de dados do Senado. O grupo de partida são
  2 pessoas já identificadas; a meta é chegar a cerca de 5 por indicação delas até 27/11.
- **Duas ou três pessoas reais desse grupo:** um vizinho do bairro e um cliente para quem o autor presta
  serviço. Os nomes são informados ao professor fora do repositório.
- **Já falamos com alguma? Quando falaremos?** Ainda não. Primeira conversa marcada para 08/10 (prazo 09/10), pessoalmente, mostrando a primeira rota da API e perguntando que
  pergunta a pessoa faria sobre os senadores do Ceará.
- **Como essa pessoa vai descobrir que o produto existe:** apresentação em pessoa, no bairro e
  durante o atendimento aos clientes, e o link enviado por WhatsApp para quem pedir e publicado no LinkedIn; cada pessoa que usar é
  convidada a repassar para mais uma.

## Campo 3 — Trilha e produto

- **O que é, em uma frase que caiba num tuíte, e onde ficará publicado:** Uma API aberta, sem
  cadastro nem chave, que responde quanto cada senador gastou da cota parlamentar, em quê, e como
  isso se compara à cota disponível e aos colegas do mesmo estado, com um portal web simples por
  cima. Publicada em endereço público, com
  documentação em `/docs`.
- **O que NÃO faz parte:** deputados federais, vereadores e outras casas; dados de votação e
  proposições; salários de servidores; série histórica anterior à legislatura atual; análise de
  irregularidade ou "ranking de suspeitos" (o produto mostra o dado, não julga); aplicativo móvel.

## Campo 4 — Fontes de dados

**Fonte 1 — gastos da cota parlamentar**

| | |
| :-- | :-- |
| Nome e órgão | Dados Abertos Administrativos — CEAPS (Cota para o Exercício da Atividade Parlamentar dos Senadores), Senado Federal |
| Endereço | https://adm.senado.gov.br/adm-dadosabertos/swagger-ui |
| Licença — e o que ela permite ao nosso produto | Domínio público. Permite armazenar, agregar e redistribuir sem restrição; o produto cita o Senado como fonte mesmo assim. |
| Atualização — periodicidade declarada e data do dado mais recente | Atualização contínua conforme os reembolsos são processados. Atualização mais recente da base oficial: 23/09/2026. |
| Dado pessoal? — se sim, granularidade e o que será agregado | Sim. Nome do senador (agente público, dado público por natureza) e fornecedor, que pode ser pessoa física com CPF. O CPF de fornecedor pessoa física será mascarado; os totais são agregados por senador, ano e categoria de despesa. |

**Fonte 2 — senadores em exercício**

| | |
| :-- | :-- |
| Nome e órgão | Dados Abertos Legislativos, Senado Federal |
| Endereço | https://legis.senado.leg.br/dadosabertos |
| Licença — e o que ela permite ao nosso produto | Mesmos termos do portal de dados abertos do Senado: reuso livre com citação da fonte. |
| Atualização — periodicidade declarada e data do dado mais recente | Atualizado a cada mudança de mandato, partido ou exercício.|
| Dado pessoal? — se sim, granularidade e o que será agregado | Nome parlamentar, partido, estado e foto oficial de agentes públicos, já publicados pelo Senado. Nada além disso é coletado. |

## Campo 5 — Papéis

Projeto individual: todos os papéis ficam com o mesmo integrante, com dedicação prevista de
8 horas por semana (acima das 28 horas mínimas de execução autônoma no semestre).

| Integrante | Papel | O que fica sob sua responsabilidade |
| :-- | :-- | :-- |
| Alisson | Desenvolvimento e publicação | API, sincronização com o Senado, banco, portal web e o endereço público no ar |
| Alisson | Contato com o público | Conversas com usuários, teste com pessoas de fora, `evidencias.csv` |
| Alisson | Registro | Diário de bordo semanal, entregas dos marcos e documentação |

## Campo 6 — Cronograma

| Data | O que estará pronto |
| :-- | :-- |
| 02/10 (Marco 1) | Rota `GET /senadores/{id}/gastos?ano=` publicada em endereço público, devolvendo o total por categoria de um senador com dados reais do Senado (`v0.1.0`). |
| 13/11 (Marco 2) | Perfil do senador, consulta por estado e por categoria e comparação com a cota; portal web onde alguém de fora consulta o próprio senador sem ajuda (`v0.2.0`). |
| 27/11 (Marco 3) | Documentação completa da API em `/docs`, README atualizado, teste com pelo menos duas pessoas de fora registrado em `evidencias/` (`v1.0.0`). |
| 04/12 (Socialização) | Demonstração ao vivo consultando o senador de alguém da plateia, com plano B gravado. |

**Dependências externas.**

- **APIs do Senado fora do ar ou com formato alterado:** a API lê apenas o banco próprio,
  sincronizado por um job; se o Senado cair, o produto continua respondendo com a última
  sincronização e mostra a data dela.
- **Hospedagem gratuita:** depende de conta em serviço de hospedagem. Se o plano gratuito for
  cortado, o `docker compose` permite migrar para outro serviço em poucas horas. Conta criada
  até 27/09.
- **Primeira conversa com o público:** depende da disponibilidade das duas pessoas identificadas.
  O convite sai nesta semana, em pessoa; se nenhuma das duas puder até 09/10, a conversa acontece com outro
  cliente.

## Campo 7 — Indicadores

| | Medida | Como será coletada | Valor que seria bom |
| :-- | :-- | :-- | :-- |
| Contagem | Visitantes únicos (IPs distintos, excluindo os da equipe) que fizeram ao menos uma consulta à API ou ao portal entre 02/10 e 27/11 | Registro de acessos do servidor, exportado a cada marco para `evidencias/` | 20 |
| Qualitativa | Retorno escrito de pessoas de fora que usaram o produto para consultar os senadores do Ceará | Teste guiado, em pessoa, seguido de uma pergunta por mensagem ou formulário: "o que você descobriu e o que faltou?" | 2 retornos, de vizinhos e de clientes (os dois perfis) |

## Antes de entregar: a prova dos nove

- [x] Riscamos tudo o que não conseguiríamos terminar até 13/11 (deputados, votações, série
  histórica e aplicativo ficaram de fora).
- [x] O que sobrou ainda ajuda alguém: saber em que o próprio senador gastou já responde à
  pergunta do Campo 1.
- [ ] Uma pessoa de fora entende o Campo 1 e o Campo 3 sem explicação oral.
- [x] A data da primeira conversa com o público está marcada (08/10).
- [x] Os indicadores podem ser coletados sem depender de terceiro (registro do próprio servidor
  e mensagens recebidas diretamente).
