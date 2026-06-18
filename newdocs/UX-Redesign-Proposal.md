# Intensity — Proposta Completa de Redesign

> Documento de **proposta de design** (não implementação).
> Fonte de verdade visual/emocional: `Intensity-Design-System-Style-Guide.md`.
> Estado atual oficial: `UX-Audit.md` (não reavaliado aqui — tomado como verdade).
> Objetivo: descrever como a aplicação inteira deve passar a parecer e se
> comportar para encarnar o Intensity desde o primeiro pixel: descoberta,
> conexão humana, espontaneidade, expectativa positiva, diversão e aventura social.

---

## 0. Como ler este documento

A proposta segue o processo do agente de refatoração:

1. **Princípios** — a régua de toda decisão.
2. **Fundação (Design Tokens)** — a refundação que destrava tudo.
3. **Biblioteca de componentes** — peças redesenhadas.
4. **Sistema de movimento** — animações lúdicas.
5. **Arquitetura de informação & navegação** — como o produto se organiza.
6. **Redesign tela a tela** — diagnóstico → nova estrutura → identidade → assets.
7. **Microcopy & tom de voz** — linguagem de descoberta.
8. **Assets manifest** — catálogo com prompts de geração.
9. **Roadmap de adoção** — ordem recomendada (efeito cascata).
10. **Critérios de aprovação** — quando uma tela está "pronta".

Severidades herdadas do Audit: 🔴 crítico · 🟠 alto · 🟡 médio.

---

## 1. Princípios de redesign

Toda tela deve responder "sim" a três perguntas:

1. **Parece uma caixa de surpresas?** (não uma ferramenta)
2. **Transmite descoberta e expectativa positiva?**
3. **Poderia coexistir com Duolingo / Headspace / Finch / um jogo casual?**

E "não" a: parece Jira/Trello/Notion/Monday/Asana? parece dashboard, banco, SaaS B2B?

Heurísticas de decisão:

- **Cor sólida > linha.** Categorizar com blocos de cor, não com bordas de 1–3px.
- **Espaço e agrupamento > separadores.** Respiro generoso.
- **Ícone/ilustração > texto cru.** Toda categoria tem um símbolo.
- **Celebração > confirmação seca.** Feedback com personalidade.
- **Uma ação principal óbvia por tela.** Resto é secundário.

---

## 2. Fundação — Design Tokens (refundação)

> Resolve os itens 🔴 1, 2, 3 e 🟠 8, 9, 🟡 13 do Audit. É a mudança de maior alcance.

### 2.1 Cor — modo claro, quente, vibrante

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#FFF7ED` | fundo do app (creme quente) |
| `--surface` | `#FFFFFF` | cards, painéis, sheets |
| `--surface-sunken` | `#FFF1DF` | áreas internas / inputs |
| `--text` | `#1F1F1F` | texto principal |
| `--text-muted` | `#5A5A5A` | texto secundário |
| `--coral` | `#FF6B3D` | **cor principal** / CTA primário |
| `--coral-strong` | `#E85626` | hover/pressed do coral |
| `--yellow` | `#FFC94D` | descoberta / destaques |
| `--purple` | `#7B5CF6` | criatividade |
| `--teal` | `#2DBD9A` | aventura |
| `--ink-soft` | `rgba(31,31,31,.06)` | sombra base |

Substitui o tema escuro (`#0a1018`) e a paleta teal/azul/marrom do Audit.
**Remover** `color-scheme: dark` e todos os `radial-gradient` noturnos das páginas.

### 2.2 Cores de categoria (caixinhas)

Cada `BoxType` ganha **cor sólida de marca** (não `border-top 3px`). Mapeamento proposto, agrupado por família afetiva:

| Família | BoxTypes | Cor |
|---|---|---|
| Amigos | `SAIDAS_COM_AMIGOS`, `VIAGENS_COM_AMIGOS`, `EXPERIENCIAS_COM_AMIGOS` | `--teal` |
| Casal | `SAIDAS_EM_CASAL`, `VIAGENS_EM_CASAL`, `INTIMO_EM_CASAL` | `--coral` |
| Crescimento | `SAIR_DA_ROTINA`, `PRIMEIRAS_VEZES`, `DESCONFORTO_LEVE` | `--purple` |
| Conexão | `MOMENTOS_DE_CONEXAO`, `EXPERIENCIAS_DIFERENTES` | `--yellow` |

> Mantém os 11 tipos de domínio intactos (sem mexer em regra de negócio); muda só a apresentação.

### 2.3 Intensidade (1–5) — sair do semáforo

O Audit aponta o uso de verde→vermelho (sensação de risco/erro). Proposta: escala
de **calor afetivo** dentro da marca, do suave ao energético — sem vermelho de "perigo":

| Nível | Nome (existente) | Cor proposta |
|---|---|---|
| 1 | Leve | `--teal` |
| 2 | Desconfortável | `#5BC8B0` |
| 3 | Coragem | `--yellow` |
| 4 | Ousado | `#FF9A4D` |
| 5 | Adrenalina | `--coral` |

### 2.4 Tipografia

- Família: **Nunito** (títulos) + **Nunito Sans/Quicksand** (texto). Arredondada e humana.
- Títulos: peso **800**, grandes e impactantes.
- Texto: peso **400–500**, alta legibilidade.
- **Eliminar monospace** do código de convite e do Selo (Audit 🟠): usar a fonte arredondada com `letter-spacing` para o código.

### 2.5 Raios de borda

| Token | Valor | Uso |
|---|---|---|
| `--radius-button` | `24px` | botões |
| `--radius-card` | `20px` | cards / painéis / sheets |
| `--radius-chip` | `999px` | chips, badges, avatares |
| `--radius-input` | `16px` | inputs / textareas |

### 2.6 Sombra (única e suave)

```css
--shadow-soft: 0 4px 12px rgba(0,0,0,.06);
```

Apenas para separar camadas. **Banir** sombras pesadas (`0 12px 30/40px`) do Audit.

### 2.7 Espaçamento & alvo de toque

- Escala 4px: `4 / 8 / 12 / 16 / 24 / 32 / 48`.
- Padding de página generoso (`24px`), respiro entre blocos ≥ `16px`.
- Alvo de toque mínimo **48px** (componentes grandes e acessíveis).

### 2.8 Ícones

- Adotar **Lucide** (outline, cantos arredondados, espessura consistente).
- Aposentar glifos de texto `?`, `⋯`, `I` (Audit 🔴 4).

---

## 3. Biblioteca de componentes (redesenho)

### 3.1 Button — 🔴
- **Primário:** coral sólido (`--coral`), texto branco, raio 24px, peso 700, sem gradiente.
- **Secundário:** superfície branca, texto coral, borda coral suave.
- **Ghost:** sem caixa, texto `--text-muted`.
- **Estados:** `:active` com `scale(.96)` + leve bounce; foco visível.
- Altura mínima 48px, padding horizontal confortável.

### 3.2 BoxCard ("caixinha colecionável") — 🔴
Reescrita para o modelo do guia:

```
┌───────────────┐
│  ☕  (ícone    │  ← ícone grande, área superior em cor sólida da categoria
│      grande)  │
│               │
│ Saídas com    │  ← título curto, peso 800
│ amigos        │
│               │
│ 31 ideias  ›  │  ← contador em destaque + chevron
└───────────────┘
```

- Fundo da caixa = **cor sólida da categoria** (não borda).
- Ícone grande no topo (Lucide/ilustração), em "selo" arredondado.
- Contador de ideias proeminente (não teal minúsculo).
- Menu de ações (`⋯`→ícone) discreto no canto, só quando aplicável.
- Micro-animação: `scale`/lift no toque.

### 3.3 ExperienceCard — 🟠
- Cartão branco arredondado (20px), **sem `border-left`**; categoria/intensidade indicada por **chip de cor** no topo.
- `IntensityBadge` como **chip arredondado** colorido com rótulo ("Coragem"), não só texto.
- Ações (Editar/Excluir/Prévia) recolhidas em menu, para não parecer CRUD.
- Estado "resumo até revelação" apresentado como **carta lacrada** (selo visual), não texto cinza.

### 3.4 BrandMark — 🟠
- Logo arredondado e lúdico em **coral**, formato de "caixinha/etiqueta" com cantos muito arredondados; opcionalmente uma ilustração-mascote. Substitui a letra "I" em gradiente teal.

### 3.5 IntegritySeal — 🟠
- Reposicionar como **selo de cera/etiqueta** (ícone de selo + rótulo curto), em chip; remover monospace e o tom "forense".
- Microcopy mais leve (ver §7).

### 3.6 IntensityBadge / RatingScale / ParameterRow
- **IntensityBadge:** chip arredondado com cor do nível + nome.
- **RatingScale:** 5 "pílulas" grandes e arredondadas (não inputs retangulares); a selecionada cresce com bounce; cores dentro da paleta (teal/yellow/coral), não lima/rosa.
- **ParameterRow:** transformar "Esforço 3 · Abertura 3 · Novidade 3" (leitura de telemetria) em **três mini-medidores** lúdicos (dots preenchidos / barras arredondadas) com ícone por parâmetro.

### 3.7 OnboardingIllustration — 🔴
- Substituir os círculos abstratos por **ilustrações flat cartoon** (ver assets §8), uma por passo, em moldura arredondada com fundo claro.

### 3.8 QuickGuideOverlay / Dialogs / Toast / OfflineBanner — 🟡
- Bottom sheets com superfície branca, raio 20px, sombra suave, alça (grabber) arredondada.
- Toast com personalidade (ícone + cor de marca); evitar "alerta de sistema".
- Diálogos destrutivos: manter clareza, tom mais gentil, cor de aviso suave (não vermelho agressivo).

### 3.9 DrawResultCard — ver §6.8 (Sorteio).

---

## 4. Sistema de movimento

Sensação de **jogo casual**, micro-animações, nunca dramáticas/lentas.

| Padrão | Onde | Descrição |
|---|---|---|
| `bounce` | botões, seleção em RatingScale, abrir caixinha | leve sobressalto ao tocar |
| `scale` | cards (hover/press) | 0.96–1.04 |
| `reveal` | sorteio | virada de carta/abertura de envelope |
| `confetti` | revelação do sorteio, salvar 1ª experiência | celebração curta |
| `pop-in` | entrada de listas/cards | stagger suave |

Durações curtas (120–280ms), `ease-out`. Respeitar `prefers-reduced-motion`.

---

## 5. Arquitetura de informação & navegação

Mantém as 11 rotas e os 2 modos (sem mudar regra de negócio), mas re-enquadra a percepção:

- **Linguagem de coleção, não de sistema:** "grupos" → "turmas/aventuras"; "Box home" → algo humano (ex.: "Suas caixinhas"); "Modo Experiences/Experience Box" deixa de ser rótulo uppercase e vira contexto natural.
- **Uma ação principal por tela** sempre visível (CTA coral).
- **Hierarquia visual:** título grande (800) → conteúdo colecionável → ação. Remover labels uppercase/letter-spacing de "modo".
- **Estados vazios** sempre com ilustração + convite à ação (nunca só texto cinza).

---

## 6. Redesign tela a tela

Formato por tela: **Objetivo · Emoção · Diagnóstico (do Audit) · Nova estrutura (hierarquia) · Identidade aplicada · Assets**.

### 6.1 Bootstrap (`/`) — splash
- **Objetivo/Emoção:** primeira impressão; expectativa.
- **Diagnóstico:** splash escuro técnico (Audit 4.1).
- **Nova estrutura:** fundo creme → logo arredondado coral animado (bounce/pulso) → microcopy calorosa de carregamento.
- **Identidade:** sem gradiente noturno; sombra suave; sem spinner técnico.
- **Assets:** `IMG_BRAND_LOGO`.

### 6.2 Onboarding (`/onboarding`) — 4 passos 🔴
- **Objetivo/Emoção:** vender a descoberta; conexão.
- **Diagnóstico:** ilustrações abstratas escuras (Audit 4.2).
- **Nova estrutura:** ilustração flat cartoon (topo) → título 800 → corpo → progresso em pílulas coral → CTA coral "Próximo"/"Começar".
- **Identidade:** fundo claro; barra de progresso coral (não gradiente teal→laranja); manter a ótima cópia pt-BR.
- **Assets:** `IMG_ONBOARDING_1..4`.

### 6.3 Auth (`/auth`) — 🔴 (a mais "SaaS")
- **Objetivo/Emoção:** entrar com leveza; pertencimento.
- **Diagnóstico:** 4 abas + inputs escuros + código monospace (Audit 4.3).
- **Nova estrutura:**
  1. Ilustração/marca acolhedora + saudação.
  2. **Ação principal única:** "Entrar" (Experiences).
  3. Caminhos secundários como **cartões grandes** (não abas): "Estamos juntos num celular" (Experience Box), "Tenho um código de convite", "Criar conta".
- **Identidade:** painel branco, raio 20px, inputs claros (16px), código de convite em fonte arredondada com espaçamento; CTA coral.
- **Assets:** `IMG_WELCOME`.

### 6.4 GroupSelection (`/groups`) — 🔴
- **Objetivo/Emoção:** escolher onde viver aventuras.
- **Diagnóstico:** lista de linhas; título "{count} membros"; label "Modo" uppercase (Audit 4.4).
- **Nova estrutura:** **galeria de cartões de turma** (cor + ícone + nome humano + nº de pessoas como detalhe, não título) → CTA "Convidar". Sair do grupo via menu do cartão.
- **Identidade:** cards coloridos arredondados; sem `<ul>` de sistema.
- **Assets:** `IMG_EMPTY_GROUPS`, ícones de turma.

### 6.5 BoxSelection (`/groups/:id/boxes`) — 🟠
- **Objetivo/Emoção:** abrir uma categoria divertida.
- **Diagnóstico:** grid de cards escuros sem ícone; empty textual (Audit 4.5).
- **Nova estrutura:** grid 2-col de **BoxCard colecionável** (§3.2) → empty com ilustração + CTA.
- **Assets:** `IMG_EMPTY_BOXES`, `IMG_ICON_*` por categoria.

### 6.6 ExperienceList (`/.../experiences`) — 🟠
- **Objetivo/Emoção:** ver/colecionar ideias da caixinha.
- **Diagnóstico:** parágrafo de transparência no topo; lista estilo log; ações CRUD (Audit 4.6).
- **Nova estrutura:** header da caixinha (cor/ícone) → CTA coral "Adicionar experiência" → grade de `ExperienceCard` como cartas → nota de transparência **recolhida** (link "como funciona?"), fora do topo.
- **Identidade:** cartões brancos, chips de intensidade, sem `border-left`.
- **Assets:** `IMG_EMPTY_EXPERIENCES`.

### 6.7 CreationAssistant (modal 5 passos) — 🟠
- **Objetivo/Emoção:** montar uma ideia incrível; criatividade.
- **Diagnóstico:** formulário de 5 etapas; review em `dl`; tom de configuração (Audit 4.7).
- **Nova estrutura:** sheet branco, progresso em pílulas coral; cada passo com 1 foco e ilustração/ícone; passos:
  1. **A ideia** (textarea + chips de sugestão como "cartinhas").
  2. **Por que vale a pena** (reflexão).
  3. **O tempero** (RatingScale lúdico p/ esforço/abertura/novidade).
  4. **Quão intenso?** (escala de calor).
  5. **Revisão = pré-visualização da carta** (não `dt/dd`), com selo.
- **Final:** salvar dispara **confetti** + microcopy de celebração.
- **Assets:** `IMG_ICON_IDEA`, `IMG_SAVE_CELEBRATION`.

### 6.8 SharedMoment / Sorteio (`/.../moment`) — 🔴 (centro emocional)
- **Objetivo/Emoção:** descobrir um prêmio; expectativa máxima.
- **Diagnóstico:** topo dominado por filtros (ANY/EXACT/UP_TO); botão comum; card escuro; label uppercase; sem celebração (Audit 4.8).
- **Nova estrutura (re-hierarquizada):**
  1. **Protagonista: a caixinha/envelope fechado** no centro, convidando ao toque.
  2. **CTA gigante "Sortear"** (coral), com antecipação (tremor/brilho).
  3. Filtros de intensidade **recolhidos** atrás de "Ajustar" (opcional, secundário) — deixam de competir com o ato.
  4. **Reveal:** abertura de envelope → carta vira (`reveal`) → **confetti** → conteúdo.
  5. "Alinhem-se antes de revelar" como momento ritual, com calma e ilustração.
- **Identidade:** envelope/carta flat cartoon, cores de marca, sem uppercase técnico.
- **Assets:** `IMG_DRAW_ENVELOPE`, `IMG_DRAW_CARD_BACK`, `IMG_REVEAL_CONFETTI`.

### 6.9 InvitePreview (`/join`) — 🟡
- **Objetivo/Emoção:** sentir-se convidado para algo bom.
- **Diagnóstico:** lista de nomes + expiração, frio (Audit 4.9).
- **Nova estrutura:** "Você foi convidado!" → ilustração + avatares/iniciais coloridas das pessoas → CTA coral "Aceitar".
- **Assets:** `IMG_INVITE`.

### 6.10 CreateBox (`/box-home/create`) — 🟠
- **Objetivo/Emoção:** escolher uma caixa é parte da diversão.
- **Diagnóstico:** `<fieldset>` + 11 radios = formulário (Audit 4.10).
- **Nova estrutura:** campo de nome amigável → **galeria de cartões de tipo** (cor + ícone, seleção com check/bounce) em vez de radios → CTA "Criar caixinha".
- **Assets:** `IMG_ICON_*` por categoria (reuso de 6.5).

### 6.11 BoxHome (`/box-home`) — 🟠
- **Diagnóstico:** título "Box home" + toolbar de botões (Audit 4.11).
- **Nova estrutura:** título humano ("Suas caixinhas") → CTA coral "Criar caixinha" em destaque → grade de BoxCards → ações secundárias (convidar/sair) discretas.

### 6.12 UnknownSession / Offline / Dialogs — 🟡
- **Diagnóstico:** telas/avisos de erro técnico (Audit 4.12).
- **Nova estrutura:** ilustração amigável + explicação leve + ações claras; tom acolhedor mesmo no erro.
- **Assets:** `IMG_EMPTY_LOST`.

---

## 7. Microcopy & tom de voz

Princípio: linguagem de **descoberta e amizade**, nunca de sistema. (Resolve Audit §6.)

| Antes (sistema) | Depois (descoberta) |
|---|---|
| "Modo Experiences" / "Modo Experience Box" | contexto natural, sem rótulo uppercase |
| "Box home" | "Suas caixinhas" |
| "Selo de integridade" | "Selo da ideia" / "carta lacrada" |
| "Sessão desconhecida" | "Ops, perdemos sua sessão" |
| "Parâmetros" | "O tempero da experiência" |
| "Resultado do sorteio" | "Sua carta saiu!" |
| "Adicionar experiência" | "Guardar uma ideia" |

Diretrizes: frases curtas, calorosas, segunda pessoa do plural quando for momento
coletivo ("sorteiem", "alinhem-se"); celebrar ações; manter a honestidade do tom
de transparência, mas como acordo entre amigos (não termos legais no topo).

---

## 8. Assets Manifest (catálogo com prompts)

Estilo global para **todos** os prompts: `Flat cartoon illustration. Rounded shapes. Warm colors (coral #FF6B3D, yellow #FFC94D, purple #7B5CF6, teal #2DBD9A on cream #FFF7ED background). Friendly happy expressions. Minimal details. No realistic rendering, no 3D, no photo. Matching Intensity Design System.`

| ID | Uso | Placeholder |
|---|---|---|
| `IMG_BRAND_LOGO` | Splash / BrandMark | `/img/placeholders/IMG_BRAND_LOGO.png` |
| `IMG_WELCOME` | Auth | `/img/placeholders/IMG_WELCOME.png` |
| `IMG_ONBOARDING_1` | Onboarding p1 — rotina confortável | `/img/placeholders/IMG_ONBOARDING_1.png` |
| `IMG_ONBOARDING_2` | Onboarding p2 — saudade de conexão | `/img/placeholders/IMG_ONBOARDING_2.png` |
| `IMG_ONBOARDING_3` | Onboarding p3 — momentos que esperam | `/img/placeholders/IMG_ONBOARDING_3.png` |
| `IMG_ONBOARDING_4` | Onboarding p4 — agir juntos | `/img/placeholders/IMG_ONBOARDING_4.png` |
| `IMG_DRAW_ENVELOPE` | Sorteio — envelope fechado | `/img/placeholders/IMG_DRAW_ENVELOPE.png` |
| `IMG_DRAW_CARD_BACK` | Sorteio — verso da carta | `/img/placeholders/IMG_DRAW_CARD_BACK.png` |
| `IMG_REVEAL_CONFETTI` | Revelação | `/img/placeholders/IMG_REVEAL_CONFETTI.png` |
| `IMG_INVITE` | InvitePreview | `/img/placeholders/IMG_INVITE.png` |
| `IMG_EMPTY_GROUPS` | Empty grupos | `/img/placeholders/IMG_EMPTY_GROUPS.png` |
| `IMG_EMPTY_BOXES` | Empty caixinhas | `/img/placeholders/IMG_EMPTY_BOXES.png` |
| `IMG_EMPTY_EXPERIENCES` | Empty experiências | `/img/placeholders/IMG_EMPTY_EXPERIENCES.png` |
| `IMG_EMPTY_LOST` | Sessão perdida/erro | `/img/placeholders/IMG_EMPTY_LOST.png` |
| `IMG_SAVE_CELEBRATION` | Salvar experiência | `/img/placeholders/IMG_SAVE_CELEBRATION.png` |
| `IMG_ICON_FRIENDS` | Caixas de amigos | `/img/placeholders/IMG_ICON_FRIENDS.png` |
| `IMG_ICON_COUPLE` | Caixas de casal | `/img/placeholders/IMG_ICON_COUPLE.png` |
| `IMG_ICON_TRAVEL` | Viagens | `/img/placeholders/IMG_ICON_TRAVEL.png` |
| `IMG_ICON_GROWTH` | Sair da rotina / primeiras vezes | `/img/placeholders/IMG_ICON_GROWTH.png` |
| `IMG_ICON_CONNECTION` | Momentos de conexão | `/img/placeholders/IMG_ICON_CONNECTION.png` |

**Exemplo de prompt completo (modelo):**

ID: `IMG_DRAW_ENVELOPE`
Uso: tela de Sorteio — estado inicial (envelope fechado, convidativo)
Prompt:
```text
Flat cartoon illustration.
A closed friendly envelope/gift box glowing softly, inviting to be opened.
Rounded shapes, coral and yellow accents on cream background.
Sense of surprise and anticipation. Happy, playful mood.
Minimal details. No realistic rendering, no 3D, no photo.
Matching Intensity Design System.
```

> Cada asset acima deve receber um bloco análogo no `assets-manifest.md` definitivo
> (gerado na fase de implementação). A IA não gera imagens — apenas planeja.

---

## 9. Roadmap de adoção (ordem recomendada)

Do maior alcance ao detalhe — cada etapa destrava as seguintes:

1. **Tokens** (§2) — tema claro, paleta, tipografia, raios, sombra. (Destrava todos os 🔴.)
2. **Ícones** (Lucide) + **Button** + **BrandMark**.
3. **BoxCard colecionável** + **ExperienceCard** + chips de intensidade.
4. **Sorteio** (re-hierarquia + reveal + confetti). Centro emocional.
5. **Auth** e **CreateBox** (galeria no lugar de abas/radios).
6. **Onboarding / empty states / InvitePreview** + ilustrações (assets).
7. **Microcopy** (§7) nos 3 locales.
8. **Movimento** (§4) refinado e `prefers-reduced-motion`.

Restrições mantidas: **nenhuma** alteração em regras de negócio, APIs, modelos de
domínio, permissões ou lógica funcional — apenas apresentação.

---

## 10. Critérios de aprovação (por tela)

Uma tela só está pronta quando:

- **Visual:** parece parte do Intensity (claro, colorido, arredondado, flat cartoon).
- **Estrutural:** hierarquia clara, uma ação principal evidente.
- **Emocional:** transmite descoberta/expectativa; passa nas 3 perguntas do §1.
- **Assets:** todos os necessários catalogados no manifest.
- **Consistência:** poderia coexistir com qualquer outra tela do produto.
- **Régua final:** não lembra Jira/Trello/Notion/Monday/Asana; lembra Duolingo/Headspace/Finch.

---

*Fim da proposta. Próximo passo sugerido: aprovar a §2 (Tokens) como primeira
intervenção de implementação, pois é a base que torna todo o resto possível.*
