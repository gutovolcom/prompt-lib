# Design System — Prompt Lab (tema claro estilo Dribbble)

Decisão de 2026-08-03: o app migrou do tema escuro inicial (seção 7 de
`SPEC_prompt_lab.md`) para um tema claro inspirado no Dribbble — limpo,
arejado, com sombra reservada para elevação e geometria em pills. Este
documento é a fonte de verdade do design system atual.

## 1. Princípios

- **Claro e arejado**: fundo branco, superfícies quase brancas, hierarquia
  construída por espaçamento e peso tipográfico, não por escurecimento.
- **Sombra só em elevação**: cards e imagens em repouso não têm sombra nem
  borda. Sombra aparece apenas em dropdowns, toasts e modais (algo "sobe"
  da página).
- **Geometria em pills**: busca, botões, filtros e tabs são `rounded-pill`
  (999px). Cards, modais e dropzone usam radius generoso (16px).
- **Accent vermelho GCO como marca**: `#DD303E` assume o papel do rosa
  `#EA4C89` do Dribbble — usado com moderação em CTAs, estado ativo e
  coração favoritado.
- **Metadados fora da imagem**: autor, modelo e contadores ficam abaixo do
  card, não sobre a imagem — a imagem em si fica limpa.

## 2. Tokens (`src/index.css` / `tailwind.config.ts`)

| Token | Hex/valor | Uso |
|---|---|---|
| `--bg` | `#ffffff` | Fundo geral da página |
| `--surface` | `#ffffff` | Header, cards, modais |
| `--surface-2` | `#f4f5f7` | Pill de busca, inputs, tab ativa, hover |
| `--surface-3` | `#eceef1` | Hover de surface-2, pressed |
| `--border` | `#e7e7e9` | Bordas hairline |
| `--text` | `#0d0c22` | Títulos e corpo forte |
| `--text-2` | `#6e6d7a` | Corpo secundário (contraste 4.9:1 no branco) |
| `--text-muted` | `#9e9ea7` | **Só** placeholders e ícones decorativos — nunca texto essencial (2.9:1) |
| `--accent` | `#dd303e` | CTAs, pills ativas, coração favoritado |
| `--accent-hover` | `#c62835` | Hover do accent |
| `--accent-soft` | `#fdeaec` | Fundo tintado para estados suaves |
| `--accent-2` | `#0d134c` | Navy GCO, detalhes secundários |
| `--success` / `--success-soft` | `#15803d` / `#ecfdf3` | Estado "copiado!" |
| `--danger` / `--danger-soft` | `#b91c1c` / `#fef2f2` | Erros, ações destrutivas |
| `--shadow-sm/md/lg` | ver `index.css` | sm: hairline; md: dropdowns/toast; lg: modais |
| `--overlay` | `rgba(13,12,34,.55)` | Backdrop de modal |

Radius: `card` 16px (cards, modais, dropzone) · `input` 12px (inputs
retangulares, textareas) · `pill` 9999px (busca, botões, filtros, tabs).

Motion: `--ease-out` (`cubic-bezier(0.16,1,0.3,1)`), animações `fade-in`/
`scale-in`/`slide-up` em 200ms, `shimmer` em 1.6s linear infinite.
`prefers-reduced-motion: reduce` zera todas as durações globalmente.

## 3. Tipografia

Fonte: Inter (pesos 400–800 via `@fontsource/inter`).

| Papel | Classes |
|---|---|
| Display (título da galeria) | `text-5xl sm:text-6xl font-extrabold tracking-tight` |
| Subtítulo de página | `text-base sm:text-lg text-text-2` |
| Título de modal | `text-2xl font-bold tracking-tight` |
| Heading pequeno | `text-sm font-semibold text-text` |
| Corpo | `text-sm text-text-2` (forte: `text-text`) |
| Label de form | `text-sm font-medium text-text` |
| Micro/meta | `text-xs font-medium text-text-2` |
| Nome no card | `text-[13px] font-semibold text-text` |

## 4. Anatomia dos componentes-chave

- **Card de prompt**: imagem pura (radius 16px, sem borda/sombra em
  repouso) com overlay de hover sutil (gradiente + título + "Copiar
  prompt"). Abaixo da imagem: avatar 24px + nome + badge escura do modelo
  à esquerda; coração + contador de cópias à direita.
- **Header**: busca central em pill cinza com botão circular vermelho à
  direita (ícone de lupa). CTA "Novo prompt" em pill vermelha.
- **Filtros**: ordenação como dropdown à esquerda; tabs de categoria
  centralizadas (ativa = fundo cinza + negrito; categoria tem um dot de
  8px com a cor cadastrada); dropdowns Modelo/Autor à direita.
- **Modais**: backdrop com `fade-in`, painel com `scale-in`, `shadow-lg`,
  radius 16px. `<details>` nativos ganham `summary` estilizado com chevron
  giratório em vez de marcador padrão do navegador.
- **Toast**: pill escura (`bg-text`) sobre página clara, `slide-up`.

## 5. Acessibilidade

- `--text-2` tem contraste 4.9:1 no branco — seguro para corpo de texto.
- `--text-muted` (2.9:1) é reservado a placeholders e ícones decorativos;
  nunca usar em texto informativo essencial.
- `--accent` sobre branco tem contraste ~4.6:1 — adequado para botões e
  texto ≥14px semibold; evitar para corpo pequeno regular.
- Foco visível: `outline: 2px solid var(--accent)` em todo elemento
  interativo (`:focus-visible` em `src/index.css`).
- Animações respeitam `prefers-reduced-motion: reduce`.
