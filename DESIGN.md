# Design System — Prompt Lab ("O Arquivo")

Decisão de 2026-08-05: o app migrou do tema claro estilo Dribbble (histórico
na seção anterior deste documento, ver git log) para uma identidade própria
inspirada no gabinete de arquivo do marketing — pastas manila, fichas
datilografadas, carimbos. O visual anterior era funcional mas genérico;
esta identidade nasce da própria natureza do produto: uma biblioteca de
prompts (fórmulas) que qualquer colega deve conseguir encontrar, abrir e
copiar. Este documento é a fonte de verdade do design system atual.

## 1. Conceito

O Prompt Lab é o **gabinete de arquivo do marketing GCO**. Cada prompt é uma
**pasta manila** com a foto espiando para fora; clicar abre um **dossiê** de
duas páginas com a ficha datilografada da fórmula. Copiar o prompt é
**carimbar** a ficha — a ação nº 1 do produto ganha um momento visual
próprio (sweep de marca-texto + carimbo "COPIADO").

- **Papel, não app**: fundos em tom de papel/mesa, nunca branco puro; grão
  sutil (SVG noise) sobre a página inteira.
- **Datilografado**: todo texto de prompt, código de catálogo, metadados e
  botões de ação usam fonte mono — o texto tem peso de documento.
- **Sombra dura, não difusa**: elevação vem de sombras curtas e deslocadas
  (`shadow-hard`) ou blocos de papel sobrepostos, não de blur suave.
- **Geometria de documento**: radius pequeno (4–7px), nunca pills — abas de
  pasta e de fichário são a única forma "recortada" do sistema.
- **Vermelho de carimbo como marca**: `#BE3A2B` é o accent — usado em CTAs,
  favoritos e no carimbo "COPIADO". O vermelho GCO original não é mais a
  marca do produto (o GCO aparece só discretamente, na etiqueta do header).

## 2. Tokens (`src/index.css` / `tailwind.config.ts`)

Os tokens são definidos como **triplets RGB** (`R G B`, sem `#`) em
`:root`, para que os modificadores de opacidade do Tailwind funcionem
(`bg-surface/50` etc. exigem `rgb(var(--x) / <alpha-value>)` — um hex direto
na variável faz o Tailwind descartar a classe silenciosamente). O helper
`withOpacity()` em `tailwind.config.ts` gera esse formato para cada cor.

| Token | Hex equivalente | Uso |
|---|---|---|
| `--bg` | `#ede5d4` | Fundo geral (mesa/papel) |
| `--surface` | `#f8f3e6` | Fichas, modais, header interno |
| `--surface-2` | `#efe8d4` | Inputs, hover em papel |
| `--surface-3` | `#e7dec7` | Pressed |
| `--border` | `#cfc5ac` | Bordas em tom de papel |
| `--paper-line` | `#c9d4dc` | Pauta azul de ficha (linhas horizontais) |
| `--text` | `#2a2620` | Tinta de máquina — títulos e corpo forte |
| `--text-2` | `#6e6553` | Corpo secundário |
| `--text-muted` | `#9b9077` | **Só** placeholders/ícones decorativos |
| `--accent` / `--accent-hover` / `--accent-deep` | `#be3a2b` / `#a93225` / `#8e2a1f` | Vermelho de carimbo — CTAs, favoritos, "COPIADO" |
| `--accent-soft` | `#f6e3de` | Fundo tintado para estados suaves |
| `--accent-2` | `#35597e` | Azul-tinteiro — links/etiquetas secundárias discretas |
| `--cabinet` / `--cabinet-dark` | `#3b372f` / `#2a2721` | Header (gaveteiro), avatares |
| `--manila` / `--manila-dark` / `--manila-deep` | `#e9cd8f` / `#dbb96e` / `#c6a254` | Pastas (cards), abas |
| `--secret` / `--secret-dark` / `--secret-text` / `--secret-red` | `#38332b` / `#2b2721` / `#efe7d2` / `#c13425` | Pasta confidencial do destaque da semana |
| `--success` / `--success-soft` | `#15803d` / `#e8efdf` | Estado "copiado" funcional |
| `--danger` / `--danger-soft` | `#b12a1c` / `#f5e1db` | Erros |
| `--shadow-sm/md/lg` | ver `index.css` | sm: hairline; md: pastas/dropdowns; lg: dossiê |
| `--shadow-hard` | `4px 4px 0 rgba(...)` | Toasts, etiquetas — sombra dura deslocada |
| `--overlay` | `rgba(32,27,18,.62)` | Backdrop de modal |

Radius: `card` 7px (pastas, modais) · `input` 4px (inputs, botões,
etiquetas) · `tab` `7px 7px 0 0` (abas de pasta/fichário). Não há mais token
de pill — geometria de documento, não de app social.

Motion: `--ease-out` (`cubic-bezier(0.22,1,0.36,1)`). Animações herdadas
`fade-in`/`scale-in`/`slide-up` (200ms) e `shimmer` (1.6s). Nova:
`stamp-in` (380ms, overshoot) para o carimbo "COPIADO".
`prefers-reduced-motion: reduce` zera todas as durações globalmente.

## 3. Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display (`font-display`) | Fraunces 500/700 | Títulos de página, hero, modal |
| Corpo/UI (`font-sans`) | Archivo 400/500/600 | Texto de interface, labels de formulário |
| Datilografado (`font-mono`) | Courier Prime 400/700 | Prompt text, códigos de catálogo, botões, badges, metadados |

Regra: **qualquer texto que representa dado do arquivo** (prompt, código
`PL-XXXX`, modelo, contadores, labels de campo) vai em mono. Títulos e
prosa (hero, nomes de prompt) vão em display/sans.

## 4. Anatomia dos componentes-chave

- **Card-pasta** (`PromptCard.tsx`): aba manila com o código de catálogo
  (posição alterna a cada 3 cards), foto "dentro" da pasta que desliza para
  fora no hover, frente da pasta com título em serif, trecho do prompt em
  mono (2 linhas), autor e contadores. Variante `secret`: pasta confidencial
  em carvão para o prompt mais copiado da semana, com faixa "TOP SECRET" e
  carimbo "DESTAQUE DA SEMANA".
- **Header**: barra grafite (gaveteiro) com a "etiqueta de gaveta" (logo),
  busca translúcida centralizada e botão manila "Arquivar prompt".
- **Seções** (`CategoryPills.tsx`): abas de fichário — a ativa "sobe" e
  ganha fundo de papel, como se estivesse à frente das outras.
- **Dossiê** (`PromptDetailModal.tsx`): modal de duas páginas com divisor
  vertical tracejado — foto com clipe de papel + "ficha de tiragem"
  (cópias/favoritos) à esquerda; ficha datilografada com a FÓRMULA em
  destaque à direita.
- **Carimbo "COPIADO"**: ao copiar o prompt no dossiê, um sweep de
  marca-texto amarelo varre a fórmula e um carimbo vermelho estampa com
  rotação (GSAP, guard de `prefersReducedMotion`).
- **Toast**: ficha de papel com borda esquerda vermelha e sombra dura.
- **Badges**: etiquetas mono, uppercase, com borda — carimbo de categoria
  e modelo, não pills coloridas.

## 5. Acessibilidade

- `--text-2` sobre `--bg`/`--surface` mantém contraste ≥ 4.5:1.
- `--text-muted` é reservado a placeholders e ícones decorativos.
- `--accent` sobre `--surface` é usado em botões (texto ≥13px bold) e nunca
  como corpo de texto pequeno regular.
- Foco visível: `outline: 2px solid rgb(var(--accent))` em todo elemento
  interativo (`:focus-visible` em `src/index.css`).
- Animações (incluindo o carimbo) respeitam `prefers-reduced-motion: reduce`.
