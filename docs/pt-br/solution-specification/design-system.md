# Design System

Este documento define o **design system visual** do Intensity — personalidade, direção flat cartoon, tokens de cor, tipografia, espaçamento, componentes, movimento e estética do ritual de sorteio. É escrito para designers, desenvolvedores frontend e agentes que implementam a interface.

**Relacionados:** UX comportamental, terminologia e tom de voz estão em [`experience-and-identity.md`](experience-and-identity.md). Comportamentos de tela estão em [`functional-components.md`](functional-components.md). A apresentação visual das telas deve seguir este documento.

**Nota de integração:** Este documento absorveu o antigo Style Guide standalone e tokens declarativos da proposta de redesign visual (jun/2026). Artefatos de diagnóstico e prompts de agente foram removidos do repositório.

---

## Curta

O Intensity usa uma **UI flat cartoon de aventura social**: fundo creme quente (`#FFF7ED`), cores sólidas vibrantes (coral principal), tipografia arredondada, raios generosos, sombras suaves e microanimações lúdicas. O produto deve parecer abrir uma **caixa de surpresas**, não usar software de produtividade. Evitar estética corporativa, bancária, SaaS B2B, dashboard ou feed social. Referências: Duolingo, Headspace, Finch — nunca Jira, Trello, Notion, Monday ou Asana.

---

## Média

### Sensação da marca

O produto deve transmitir:

- diversão
- descoberta
- espontaneidade
- amizade
- conexão humana
- expectativa positiva

### Personalidade

| Fazer | Evitar |
|-------|--------|
| Amigável, leve, otimista, acolhedor, energético, casual | Corporativo, bancário, SaaS B2B, dashboard, rede social |

### Direção de design — Flat Cartoon UI

| Característica | Anti-padrão |
|--------------|-------------|
| Formas simples, cores sólidas, poucos detalhes | Realismo, glassmorphism, skeuomorfismo |
| Ilustrações mínimas, clima lúdico | Gradientes pesados, sombras pesadas |
| Componentes grandes e acessíveis | Bordas finas de 1–3px como identidade principal |

### Heurísticas de design

1. **Cor sólida > linha** — categorizar com blocos de cor, não bordas finas.
2. **Espaço e agrupamento > separadores** — respiro generoso.
3. **Ícone ou ilustração > texto cru** — toda categoria tem um símbolo.
4. **Celebração > confirmação seca** — feedback com personalidade.
5. **Uma ação principal óbvia por tela** — secundárias discretas.

### Tokens de cor principais

| Token | Hex / valor | Papel |
|-------|-------------|-------|
| `--bg` | `#FFF7ED` | Fundo do app (creme quente) |
| `--surface` | `#FFFFFF` | Cards, painéis, sheets |
| `--surface-sunken` | `#FFF1DF` | Inputs, áreas internas |
| `--text` | `#1F1F1F` | Texto principal |
| `--text-muted` | `#5A5A5A` | Texto secundário |
| `--coral` | `#FF6B3D` | Marca principal, CTA primário |
| `--coral-strong` | `#E85626` | Coral hover / pressed |
| `--yellow` | `#FFC94D` | Descoberta, destaques |
| `--purple` | `#7B5CF6` | Criatividade, modo Experiências |
| `--purple-soft` | `rgba(123,92,246,.14)` | Fundos suaves com roxo (chips, banners, painéis auxiliares) |
| `--teal` | `#2DBD9A` | Aventura |
| `--ink-soft` | `rgba(31,31,31,.06)` | Base de sombra suave |

**Tema:** apenas modo claro. Não usar `color-scheme: dark` nem gradientes radiais noturnos nas páginas.

### Escala de intensidade (1–5)

Usar **calor afetivo**, não escala semafórica de risco. Sem semântica vermelha de "perigo" no nível 5.

| Nível | Rótulo | Cor |
|-------|--------|-----|
| 1 | Leve | `--teal` (`#2DBD9A`) |
| 2 | Desconfortável | `#5BC8B0` |
| 3 | Coragem | `--yellow` (`#FFC94D`) |
| 4 | Ousadia | `#FF9A4D` |
| 5 | Adrenalina | `--coral` (`#FF6B3D`) |

### Cores por categoria de caixinha

Cada um dos onze tipos usa **cor sólida de marca** no card (não faixa no topo). Tipos de domínio inalterados; muda só a apresentação.

| Família | Tipos de caixinha | Token |
|---------|-------------------|-------|
| Amigos | Saídas com amigos, Viagens com amigos, Experiências com amigos | `--teal` |
| Casal | Saídas em casal, Viagens em casal, Íntimo em casal | `--coral` |
| Crescimento | Sair da rotina, Primeiras vezes, Desconforto leve | `--purple` |
| Conexão | Momentos de conexão, Experiências diferentes | `--yellow` |

### Tipografia

- **Famílias:** Nunito (títulos) + Nunito Sans ou Quicksand (corpo). Arredondada e humana. Alternativas: Rubik, Plus Jakarta Sans.
- **Títulos:** peso 700–800, grandes e impactantes.
- **Corpo:** peso 400–500, alta legibilidade.
- **Códigos de convite e Selo:** fonte arredondada da UI com `letter-spacing` — não monoespaçado.

### Raios, sombra, espaçamento

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-button` | `24px` | Botões |
| `--radius-card` | `20px` | Cards, painéis, sheets |
| `--radius-chip` | `999px` | Chips, badges, avatares |
| `--radius-input` | `16px` | Inputs, textareas |
| `--shadow-soft` | `0 4px 12px rgba(0,0,0,.06)` | Apenas separação de camadas |

- **Escala de espaçamento (base 4px):** `4 / 8 / 12 / 16 / 24 / 32 / 48`
- **Padding de página:** mínimo `24px`; gap entre blocos ≥ `16px`
- **Alvo de toque:** altura mínima **48px** (baseline WCAG 44pt ainda vale; preferir 48px neste sistema)

### Ícones e ilustrações

- **Ícones:** Lucide preferido (outline simples, cantos arredondados, traço consistente). Alternativas: Heroicons, Phosphor.
- **Ilustrações:** flat cartoon — traço simples, poucos detalhes, expressões felizes, formas arredondadas. Temas: conversa, viagem, café, praia, jogos, aventura, amizade. Sem realismo, fotografia ou 3D.
- **Evitar glifos de texto** como ícones (`?`, `⋯`, `I` para logo).

### Regra principal

Se uma tela pudesse existir no Jira, Trello, Notion, Monday ou Asana — está errada. Se pudesse coexistir com Duolingo, Headspace, Finch ou um jogo mobile casual — provavelmente está certa.

---

## Detalhada

### Filosofia de cor

Cada caixinha deve parecer uma **categoria divertida**. A cor ajuda no reconhecimento imediato. Preferir preenchimentos sólidos a contornos.

**Roxo (`--purple`):** usar sempre como cor **flat** (`#7B5CF6`). Não misturar roxo com `--teal` em gradientes (ex.: `linear-gradient(teal → purple)`), pois o resultado parece azulado e foge do token. Fundos suaves usam `--purple-soft` (tint neutro sobre branco), não `color-mix` com teal. Badges e ícones do modo Experiências: `background: var(--purple)` sólido.

**Teal (`--teal`):** reservado a família Amigos (tipos de caixinha), convites e escala de intensidade baixa — não como acento principal do fluxo Experiências.

### Linhas e separadores

Usar linhas no mínimo. Preferir espaço em branco, agrupamento e contraste.

### Componente — Botão

| Variante | Tratamento |
|----------|------------|
| **Primário** | `--coral` sólido, texto branco, raio 24px, peso 700, sem gradiente |
| **Secundário** | Superfície branca, texto coral, borda coral suave |
| **Ghost** | Sem caixa, texto `--text-muted` |
| **Estados** | `:active` → `scale(0.96)` com leve bounce; foco visível |
| **Tamanho** | Altura mín. 48px, padding horizontal confortável |

Ações destrutivas de confirmação podem usar coral-strong ou tratamento de aviso dedicado — não vermelho enterprise genérico, exceto para perda irreversível (ver `experience-and-identity.md`).

### Componente — Card de caixinha (colecionável)

Cards devem parecer **caixinhas colecionáveis**:

```
┌───────────────┐
│  ☕  (ícone     │  ← ícone grande sobre cor sólida da categoria
│      grande)  │
│               │
│ Saídas com    │  ← título curto, peso 800
│ amigos        │
│               │
│ 31 ideias  ›  │  ← contador em destaque + chevron
└───────────────┘
```

- Fundo do card = **cor sólida da categoria** (não borda).
- Ícone grande no topo em área de badge arredondado.
- Contador de ideias proeminente.
- Menu overflow opcional (ícone, não texto `⋯`) quando aplicável.
- Micro-movimento: leve scale/lift ao toque.

### Componente — Card de experiência

- Card branco arredondado (20px); **sem faixa `border-left`**.
- Categoria/intensidade como **chip colorido** no topo.
- `IntensityBadge` como chip arredondado com rótulo (ex.: "Coragem"), não só texto.
- Editar/excluir/prévia em menu overflow — evitar estética de tabela CRUD.
- Resumo pré-revelação como **carta lacrada** (selo visual), não texto cinza placeholder.

### Componente — Marca (Brand mark)

- Logo arredondado e lúdico em **coral**, formato caixinha/etiqueta com cantos muito arredondados; mascote opcional.
- Substitui tratamentos de letra "I" em gradiente teal.

### Componente — Selo de integridade

- Metáfora de cera/adesivo: ícone de selo + rótulo curto em chip.
- Microcopy leve; nunca apresentação forense ou monoespaçada de "hash" na UI.

### Componente — Carta do ritual de sorteio

O momento do sorteio é o **centro emocional** do produto. Deve parecer:

- abrir um envelope
- revelar uma carta
- descobrir um prêmio

Nunca:

- um seletor de lista aleatória
- um modal genérico
- um sorteador técnico

Capa: chip de intensidade, parâmetros, selo. Face após revelar: descrição completa, reflexão, nome do autor. Animação de flip no eixo Y com timing lúdico (ver Movimento).

### Movimento

Clima de jogo casual. Permitido: bounce, scale, confetti, transições de reveal.

Evitar: transições lentas, motion dramático, animação excessiva.

Sugestão para reveal do sorteio: flip curto ease-out; dica de alinhamento pode usar pulso suave em chip amarelo antes do reveal.

### Auth e modos visuais

Clareza de modo permanece obrigatória (`experience-and-identity.md`). Neste sistema:

- **Experiências:** acento **roxo flat** (`--purple`) para chrome de sessão, login, pills e destaques de contribuição individual.
- **Caixa de Experiências:** contexto de ritual com destaque coral.
- **Entrar via convite:** chip amarelo ou teal — distinto dos painéis de login.
- **Registro:** superfície neutra sobre fundo quente.

Não usar paleta corporativa marrom/azul nem gradientes sutis no wordmark.

### Acessibilidade

- Alvos de toque ≥ 44pt (preferir 48px neste sistema).
- Contraste de texto WCAG AA em `--bg` e `--surface`.
- Intensidade e filtros sempre com **rótulos de texto**, não só cor.
- Estados de foco visíveis em todos os componentes interativos.
- Ações de sorteio/reveal anunciam mudança de estado para leitores de tela.

### O que o design system evita deliberadamente

- Badges de gamificação ou sequências (princípio de produto — inalterado)
- Layouts de feed social
- Padrões de UI corporativa enterprise
- Tema escuro de produtividade (`#0a1018`, sombras pesadas)
- Escala semafórica verde→vermelho para intensidade

### Referência de tokens CSS (implementação)

```css
:root {
  --bg: #FFF7ED;
  --surface: #FFFFFF;
  --surface-sunken: #FFF1DF;
  --text: #1F1F1F;
  --text-muted: #5A5A5A;
  --coral: #FF6B3D;
  --coral-strong: #E85626;
  --yellow: #FFC94D;
  --purple: #7B5CF6;
  --purple-soft: rgba(123, 92, 246, 0.14);
  --teal: #2DBD9A;
  --ink-soft: rgba(31, 31, 31, 0.06);
  --radius-button: 24px;
  --radius-card: 20px;
  --radius-chip: 999px;
  --radius-input: 16px;
  --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.06);
}
```

### Resumo executivo

**UI flat cartoon de aventura social: cores sólidas vibrantes, formas arredondadas, ilustrações simples, clima de descoberta, sensação de jogo casual — sem qualquer aparência corporativa ou de ferramenta de produtividade.**
