# Flui — Charge Map Cup (Etapa 2)

App mobile para motoristas de veículos elétricos encontrarem pontos de recarga.
Feito em React Native com Expo Router e TypeScript.

## Como rodar

```bash
npm install
npx expo start
```

### Chave do Google Maps

O mapa usa o `react-native-maps` com o provider do Google. Em `app.json` há dois
espaços marcados com `COLE_AQUI_SUA_CHAVE_DO_GOOGLE_MAPS` (um em `ios.config` e
outro em `android.config`). No Expo Go o mapa já abre sem chave; ela só é
necessária para gerar um build próprio.

> Se o repositório for público, o ideal é mover a chave para um `app.config.js`
> lendo de variável de ambiente, em vez de deixá-la versionada.

## O que existe nesta etapa

| Requisito | Onde está |
| --- | --- |
| Mapa interativo com marcadores diferenciados | `app/(tabs)/search.tsx` + `components/StationMarker.tsx` |
| Ficha detalhada do ponto | `app/ponto-recarga.tsx` |
| Filtros de busca funcionando | `components/FilterSheet.tsx`, `hooks/use-station-filters.ts`, `constants/filters.ts` |
| Motion design | `constants/theme.ts` (tokens `Motion`) + animações nas telas |
| Identidade visual | `constants/theme.ts`, `constants/map-style.ts` |
| Dados simulados | `mocks/station.ts` |
| Regras de negócio | `utils/station.ts` |

## Decisões de projeto

**Um modelo de dados só.** Cada ponto guarda a lista real de carregadores
(conector, potência, AC/DC e status), o horário de funcionamento por dia da
semana e o movimento estimado hora a hora. Filtros, marcadores, cards e ficha
leem todos da mesma fonte, então o que aparece no mapa nunca diverge do que
aparece na lista.

**Regra separada da tela.** `utils/station.ts` concentra as funções puras
(está aberto? quantos carregadores livres? qual o período mais tranquilo?) e
`hooks/use-station-filters.ts` concentra o estado da busca. As telas só
desenham — isso deixa a regra testável e evita repetir cálculo em cada arquivo.

**Marcador que não depende só da cor.** Cada marcador comunica o estado de três
formas ao mesmo tempo: cor da bolha (livre, lotado, fechado), ícone (raio para
DC rápido, tomada para AC) e a potência escrita em kW. Quem não distingue as
cores continua conseguindo ler o mapa.

**Filtros com prévia.** A folha de filtros mostra, antes de aplicar, quantos
pontos sobrariam com a seleção atual. O motorista descobre que exagerou nos
filtros sem precisar fechar, olhar e voltar.

**Períodos de menor movimento.** O gráfico da ficha agrupa as horas de baixo
movimento em faixas contínuas e só considera horas dentro do funcionamento do
ponto — não adianta sugerir 3h da manhã se o local fecha às 22h.

**Latência simulada.** A busca finge uma consulta ao servidor por ~650 ms para
que o estado de carregamento (os *skeletons*) exista de verdade e possa ser
avaliado, em vez de aparecer e sumir instantaneamente.

## Motion design

As durações vivem em `Motion`, dentro de `constants/theme.ts`, para que o app
inteiro se mova no mesmo ritmo:

- `fast` (120 ms) — resposta ao toque: chips e cards encolhem levemente.
- `base` (260 ms) — entrada escalonada dos cards, barras do gráfico subindo,
  troca de conteúdo no perfil.
- `slow` (380 ms) — entrada da folha de filtros.
- Transições entre telas: deslizar lateral no geral, subida de baixo para a
  ficha do ponto, *fade* ao entrar nas abas.
- Câmera do mapa animada por 450 ms ao selecionar um ponto.

Todas as animações respeitam `useReducedMotion()`: quando o sistema pede menos
movimento, o estado final é aplicado direto, sem animar.

## Recursos de acessibilidade

- **Alvos de toque de no mínimo 40–44 px** em chips, botões e itens de lista.
- **Rótulos descritivos** (`accessibilityLabel`) em cada card e marcador,
  reunindo nome, status, carregadores livres, potência, distância e nota numa
  frase só — o leitor de tela não precisa varrer a tela em pedaços.
- **Estado anunciado** (`accessibilityState`) em chips de filtro, abas e no
  botão de favoritar.
- **Papéis semânticos** (`accessibilityRole="header"` / `"button"`) nos títulos
  de seção e controles.
- **Gráfico com resumo em texto**: as barras de movimento têm um rótulo que
  descreve o movimento atual e lista os períodos mais tranquilos, já que barras
  não são legíveis por leitor de tela.
- **Informação nunca só na cor**: status aparece como cor + etiqueta escrita +
  ícone.
- **Respeito ao "reduzir movimento"** do sistema operacional.
- **Elementos decorativos escondidos** do leitor de tela
  (`importantForAccessibility="no-hide-descendants"`), como os pontinhos do
  carrossel e os rótulos do eixo do gráfico.
- **Acessibilidade física do ponto** é um dado do app: cada ponto lista o que
  tem de acesso adaptado, e "Acesso adaptado" é um filtro de busca.

## Estrutura

```
app/
  (auth)/        login, cadastro, boas-vindas, em construção
  (tabs)/        home, search (mapa), perfil
  ponto-recarga  ficha detalhada
components/      Chip, FilterSheet, StationMarker, BusyChart, cards, skeleton
constants/       theme (cores, tipografia, motion), filters, map-style
hooks/           use-station-filters, use-color-scheme, use-theme-color
mocks/           station (dados simulados)
utils/           station (regras de horário, potência, movimento, formatação)
```

## Ainda não faz parte desta etapa

Sistema de avaliação funcional, favoritos persistidos e histórico de viagens —
as telas de perfil e avaliação existem como base visual, mas sem back-end.
