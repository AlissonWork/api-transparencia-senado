# Identidade visual do De Olho na Cota

Escolhida em 12/11/2026 (Marco 2). A ideia é um visual patriótico, com as cores e a estrela da
bandeira, mas de portal público neutro: mostra os dados sem julgar.

![Logo com o nome](logo-com-nome.png)

## A logo

Uma lupa (quem fiscaliza) cuja lente é o céu azul da bandeira, com uma estrela branca. O aro é
amarelo e o cabo é verde.

| Arquivo | Para quê |
| :-- | :-- |
| `logo.svg` | logo sozinha, vetorial (a mesma de `apps/web/public/favicon.svg`) |
| `logo-512.png` | logo sozinha em imagem, fundo transparente (redes sociais, slides) |
| `logo-com-nome.svg` | logo com nome e subtítulo, vetorial |
| `logo-com-nome.png` | logo com nome em imagem, fundo transparente (README, apresentação) |

No portal, a logo é o componente `Logo` em `apps/web/src/components/Layout.tsx`.

## Cores

Definidas como tokens do Tailwind no `@theme` de `apps/web/src/index.css`.

| Cor | Hex | Token | Onde usa |
| :-- | :-- | :-- | :-- |
| Verde | `#0a6b35` | `pri` | menu, títulos, links, botões |
| Verde escuro | `#064d26` | `pri-escura` | rodapé, menu ativo |
| Verde claro | `#e3f2e8` | `pri-clara` | cabeçalho das tabelas |
| Amarelo | `#f5c400` | `amarelo` | filete sob o menu, faixa do aviso de maior gasto |
| Azul | `#12357a` | `dest` | quadradinho do maior gasto, contorno do foco do teclado |
| Amarelo claro | `#fff8d9` | `dest-clara` | fundo dos avisos |

## Regras de uso

- **Amarelo nunca em texto** nem em traço fino sobre o branco: o contraste é baixo e quase não se
  lê. Só em faixas e bordas grossas.
- **Sem vermelho para o maior gasto.** Ser o maior gasto não é irregularidade; vermelho fica
  reservado para um alerta com critério objetivo (ex.: passou de 90% do limite da cota, Marco 3).
- **Não parecer site oficial.** O rodapé diz que o portal é independente, sem ligação com o Senado
  ou com o governo. Não usar brasão nem o desenho da bandeira inteira.

## Tipografia

- **Atkinson Hyperlegible:** textos e títulos (fonte feita para leitura fácil, inclusive baixa visão).
- **Roboto Mono:** valores em dinheiro, para os algarismos ficarem alinhados nas tabelas.
