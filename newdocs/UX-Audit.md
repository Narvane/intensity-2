# Intensity — UX Audit Completo

> Auditoria de toda a aplicação cliente (`client/src`) confrontada com o
> `Intensity-Design-System-Style-Guide.md`.
> Escopo: mapeamento de páginas, componentes, fluxos, navegação, entidades,
> componentes compartilhados, padrões visuais e tokens — e identificação de
> tudo que **conflita** com a identidade do produto.
> Este documento é **diagnóstico**. Nenhuma regra de negócio, API ou modelo de
> domínio é alterada. Refatoração de código não está incluída aqui.

---

## 1. Veredito executivo

A aplicação está **estruturalmente saudável e funcionalmente completa**, porém
**visual e emocionalmente oposta** ao que o Style Guide define.

O Style Guide pede um produto:

- claro, quente (`#FFF7ED`), colorido, "caixa de surpresas"
- flat cartoon, lúdico, casual
- fontes arredondadas (Nunito/Quicksand)
- bordas muito arredondadas (botões 24px, cards 20px, chips 999px)
- sensação de jogo casual / Duolingo / Finch

A aplicação atual entrega:

- **tema escuro** corporativo (`#0a1018`, `color-scheme: dark`)
- fonte de sistema **Segoe UI** (corporativa, não arredondada)
- bordas **pequenas** (12–16px), cards retangulares com linha de 3px no topo
- estética de **dashboard / SaaS B2B** — exatamente o que o guia manda evitar

> **Aplicando a "Regra Principal" do guia:** quase todas as telas hoje
> poderiam existir no Notion, Trello ou em um painel admin. Pela própria régua
> do produto, **estão erradas** e pedem refatoração.

**Severidade global: CRÍTICA (fundação).** A maior parte dos problemas nasce
de 1 arquivo de tokens (`global.css`) e se propaga para todas as telas.

---

## 2. Mapa da aplicação

### 2.1 Arquitetura

Projeto React + Vite + TypeScript com arquitetura limpa em camadas:

- `domain/` — regras de negócio, tipos, use cases (auth, box, experience, sorteio, convite, bootstrap)
- `adapters/` — API, preferências, sessão, share, navegação
- `app/` — providers (Session, Navigation, Toast, I18n), rotas, guards
- `presentation/` — páginas + componentes + CSS Modules + tokens globais
- `i18n/` — 3 locales: `en`, `pt-BR`, `it`

Estado/UI: CSS Modules + variáveis CSS globais. Sem biblioteca de UI externa.

### 2.2 Rotas e navegação (`app/routes.tsx`)

| Rota | Tela | Acesso |
|------|------|--------|
| `/` | `BootstrapPage` | público (splash/roteador) |
| `/onboarding` | `OnboardingPage` | público |
| `/join` | `InvitePreviewPage` | público (deep link de convite) |
| `/auth` | `AuthPage` | apenas visitante |
| `/unknown-session` | `UnknownSessionPage` | público (recuperação) |
| `/groups` | `GroupSelectionPage` | sessão `EXPERIENCES` |
| `/groups/:groupId/boxes` | `BoxSelectionPage` | sessão `EXPERIENCES` |
| `/groups/:groupId/boxes/:boxId/experiences` | `ExperienceListPage` | sessão `EXPERIENCES` |
| `/box-home` | `BoxHomePage` | sessão `EXPERIENCE_BOX` |
| `/box-home/create` | `CreateBoxPage` | sessão `EXPERIENCE_BOX` |
| `/box-home/:boxId/moment` | `SharedMomentPage` (sorteio) | sessão `EXPERIENCE_BOX` |

Dois modos de produto:

- **Experiences** (celular pessoal): registra ideias → `/groups` → caixinhas → experiências.
- **Experience Box** (celular compartilhado): cria caixinhas, convida, e faz o **sorteio** juntos.

### 2.3 Entidades de domínio

- **Group** — `{ id, memberCount, createdAt }`
- **Box** (caixinha) — `{ id, groupId, name, type, createdAt, experienceCount }`, 11 `BoxType` (Saídas com amigos, Em casal, Viagens, Íntimo, Sair da rotina, Primeiras vezes, etc.)
- **Experience** — `{ description, reflection, intensity 1–5, parameters{effort,openness,novelty}, seal, summaryOnly, author... }`
- **Invite** — `{ code, linkToken, expiresAt, status }` + `InvitePreview`
- **Intensity** — níveis 1–5: Leve / Desconfortável / Coragem / Ousado / Adrenalina

### 2.4 Componentes compartilhados

`Button`, `BoxCard`, `ExperienceCard`, `IntensityBadge`, `ParameterRow`,
`RatingScale`, `IntegritySeal`, `ExperienceContentBlock`, `ExperienceSummaryMeta`,
`BrandMark`, `OnboardingIllustration`, `QuickGuideOverlay`, `ShareInviteSheet`,
`OfflineBanner`, `DestructiveConfirmDialog` (+ diálogos derivados),
`CreationAssistant`, `DrawResultCard`, `ToastProvider`.

### 2.5 Fluxos principais

1. **Onboarding** → 4 passos → Auth
2. **Auth** → 4 abas (Experiences / Experience Box / Cadastro / Convite)
3. **Coletar ideias** (Experiences) → grupo → caixinha → lista → `CreationAssistant` (5 passos)
4. **Sorteio** (Experience Box) → filtro de intensidade → sortear → alinhar → revelar (card flip)
5. **Convite** → preview do grupo → aceitar/entrar

---

## 3. Conflitos de fundação (tokens) — afetam TODAS as telas

Origem: `client/src/presentation/styles/global.css`.

### 3.1 Tema escuro vs. fundo claro e quente — 🔴 CRÍTICO

```5:36:client/src/presentation/styles/global.css
:root {
  color-scheme: dark;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  ...
  --color-bg: #0a1018;
  --color-bg-elevated: #121b28;
  --color-text: #f4f7fb;
  --color-text-muted: #94a3b8;
  ...
```

| Token Style Guide | Esperado | Atual | Conflito |
|---|---|---|---|
| Fundo | `#FFF7ED` (creme quente) | `#0a1018` (navy quase preto) | invertido |
| Branco/superfície | `#FFFFFF` | `#121b28` | invertido |
| Texto | `#1F1F1F` | `#f4f7fb` | invertido |
| Texto secundário | `#5A5A5A` | `#94a3b8` (azul-cinza) | tom frio |
| `color-scheme` | light | `dark` | oposto |

Todas as páginas reforçam isso com um gradiente de "dashboard noturno":
`radial-gradient(circle at top, #1b2a41 0%, var(--color-bg) 60%)`
(em Onboarding, Auth, Boxes, BoxHome, SharedMoment). O guia pede **evitar
excesso de gradientes** e busca clima claro/festivo.

### 3.2 Paleta de cores fora da marca — 🔴 CRÍTICO

O guia define 4 cores de marca: **Coral `#FF6B3D`** (principal), Amarelo
`#FFC94D`, Roxo `#7B5CF6`, Turquesa `#2DBD9A`. **Nenhuma** aparece no app.

Cores usadas hoje:

- Marrom `#b45309`, Azul `#2563eb`, Teal `#14b8a6`, Lima `#84cc16`, Rosa `#ec4899`
- Primária de botão = gradiente teal (`#14b8a6 → #0d9488`), não coral
- Acentos de intensidade/semáforo verde→vermelho (`#22c55e … #ef4444`)

> A cor **principal** do produto deveria ser Coral; hoje é Teal. O Coral não existe na base.

### 3.3 Tipografia não arredondada — 🔴 CRÍTICO

- Atual: `'Segoe UI', system-ui` — fonte de SO, neutra/corporativa.
- Guia: fontes **arredondadas e humanas** (Nunito, Quicksand, Rubik, Plus Jakarta Sans).
- Títulos pedem peso **700–800**; hoje os `h1` usam ~1.5rem sem peso forte definido.
- Uso recorrente de **monospace** (`Consolas`, `ui-monospace`) no código de convite e no Selo — reforça aparência técnica.

### 3.4 Bordas pouco arredondadas — 🟠 ALTO

| Elemento | Guia | Atual |
|---|---|---|
| Botões | `24px` | `--radius-md` = `0.75rem` (12px) |
| Cards | `20px` | `--radius-lg` = `1rem` (16px) |
| Chips | `999px` | OK (chips/scale já usam 999px) |

Os tokens `--radius-lg/md` são genéricos e baixos; faltam raios dedicados para botão (24px) e card (20px).

### 3.5 Linhas e separadores em excesso — 🟠 ALTO

O guia pede **mínimo de linhas**, preferindo espaço/agrupamento/contraste.
O app abusa de `border: 1px solid var(--color-border)` e bordas tracejadas
(`1px dashed`) em quase todo container (cards, painéis, empty states, hints),
além do "border-top 3px" como recurso de categorização (BoxCard, AuthPanel, DrawResultCard).

### 3.6 Sombras — 🟡 MÉDIO

Guia: sombra única e suave `0 4px 12px rgba(0,0,0,.06)` apenas para separar camadas.
Atual: sombras escuras e "pesadas" (`0 12px 30px rgba(2,6,23,.35)`, `0 12px 40px rgba(0,0,0,.25)`),
que no contexto dark criam profundidade dramática — contra a diretriz.

### 3.7 Ícones e ilustrações ausentes — 🔴 CRÍTICO

- **Sem biblioteca de ícones** (Lucide/Heroicons/Phosphor). Ícones são **glifos de texto**: `?` (ajuda), `⋯` (menu), `I` (logo), inicial da categoria como "selo".
- **Sem ilustrações flat cartoon.** O `OnboardingIllustration` é um placeholder abstrato (círculos/órbita em gradiente escuro), sem os temas pedidos (café, viagem, amizade, jogos).
- `BoxCard` deveria ter **ícone grande** por categoria (guia: "☕ + título curto + contador"); hoje mostra só a 1ª letra do rótulo em um círculo cinza.

### 3.8 Animações — 🟡 MÉDIO

- Existe só `transform: scale(0.98)` no `:active` do botão e o flip do card de sorteio.
- Faltam os elementos lúdicos do guia: **bounce, confetti, reveal** festivo.

---

## 4. Auditoria por tela

Severidades: 🔴 crítico · 🟠 alto · 🟡 médio.

### 4.1 BootstrapPage (`/`) — splash
- 🟡 Splash escuro com `BrandMark` "I" em caixinha (radius 12px). Deveria ser a primeira impressão "caixa de surpresas": fundo creme, logo arredondado, micro-animação de carregamento lúdica.
- Emoção desejada: expectativa. Atual: tela de carregamento técnica.

### 4.2 OnboardingPage (`/onboarding`) — 4 passos
- 🔴 Ilustrações abstratas (órbita/círculo) em gradientes escuros, sem temas humanos (amizade/viagem/café). É o momento de "vender a descoberta".
- 🟠 Fundo escuro + barra de progresso com gradiente teal→laranja.
- 🟡 Cópia é boa e emocional (pt-BR), mas o visual não acompanha o tom.
- Assets necessários: `IMG_ONBOARDING_1..4` (flat cartoon).

### 4.3 AuthPage (`/auth`) — 🔴 a tela mais "SaaS"
- 🔴 **4 abas de login** (Experiences / Experience Box / Cadastro / Convite) num painel com borda e `border-top` colorido = cara de formulário corporativo multi-tenant.
- 🔴 Inputs escuros, labels cinzas, código de convite em **monospace**.
- 🟠 Hierarquia confusa: 4 modos competindo no primeiro contato.
- Recomendação (diagnóstico): reduzir carga cognitiva, separar "entrar" de "modos avançados", linguagem mais convidativa, fundo claro, cartões grandes e arredondados.

### 4.4 GroupSelectionPage (`/groups`) — 🔴
- 🔴 Grupos exibidos como **lista de linhas** (`<ul>` com `row`) — padrão lista de sistema.
- 🟠 Título da linha é `"{count} membros"` (dado técnico) em vez de identidade do grupo/aventura.
- 🟠 Rótulo "Modo Experiences" em **uppercase com letter-spacing** (cara de label de dashboard).
- Deveria parecer uma estante de "grupos/aventuras" colecionáveis, com cor e ícone.

### 4.5 BoxSelectionPage (`/groups/:id/boxes`) — 🟠
- 🟠 Grid 2 colunas de `BoxCard` (bom esqueleto), mas cards escuros sem ícone grande nem cor sólida (ver 4.13).
- 🟡 Empty state é texto cinza em caixa tracejada — sem ilustração nem convite à ação.
- Assets: `IMG_EMPTY_BOXES`.

### 4.6 ExperienceListPage (`/.../experiences`) — 🟠
- 🟠 Parágrafo de **transparência** (texto legal/jurídico) logo no topo — tom administrativo.
- 🟠 Lista de `ExperienceCard` com `border-left 3px` (estilo "log/itens").
- 🟡 Ações (`Prévia / Editar / Excluir`) como botões ghost cinza enfileirados — cara de CRUD.
- 🟡 Empty state apenas textual.
- Assets: `IMG_EMPTY_EXPERIENCES`.

### 4.7 CreationAssistant (modal, 5 passos) — 🟠
- 🟠 Apesar do nome "assistente", é um **formulário em 5 etapas** (textarea, textarea, 3 escalas, escala, review com `<dl>`). A etapa de Revisão usa lista de definição (`dt/dd`) — bem "tela de configuração".
- 🟠 Progresso em marrom; chips de sugestão discretos.
- 🟡 Bom: tem sugestões por categoria/intensidade. Falta tom de "montando sua ideia divertida" e celebração ao salvar.

### 4.8 SharedMomentPage (`/.../moment`) — sorteio 🔴 (centro emocional)
- 🔴 O guia diz: o sorteio é **o centro emocional**, deve parecer "abrir um envelope / revelar uma carta / descobrir um prêmio" — **nunca** um sorteador técnico.
- 🔴 Atual: painel de **filtros de intensidade** (chips ANY/EXACT/UP_TO + escala) ocupa o topo, antes do ato de sortear. Parece um filtro de tabela.
- 🟠 Botão de sortear é um botão comum (teal). Falta antecipação/animação.
- 🟡 `DrawResultCard` tem flip 3D (bom instinto), mas é escuro, com `coverLabel` "RESULTADO DO SORTEIO" em uppercase técnico, e `border-top 3px`. Sem confetti/reveal festivo.
- Assets: `IMG_DRAW_ENVELOPE`, `IMG_REVEAL_CONFETTI`.

### 4.9 InvitePreviewPage (`/join`) — 🟡
- 🟡 Preview do grupo como **lista de nomes** + data de expiração — informativo, frio.
- 🟡 Poderia ser caloroso: "Fulano te convidou para a aventura X", avatares/ilustração, cor da marca.

### 4.10 CreateBoxPage (`/box-home/create`) — 🟠
- 🟠 Seleção de tipo via **`<fieldset>` + radios** com 11 opções (título/descrição) = formulário clássico.
- 🟠 Deveria ser uma **galeria de caixinhas coloridas** (cartões grandes, ícone, cor por categoria) — escolher uma caixa é parte da diversão.

### 4.11 BoxHomePage (`/box-home`) — 🟠
- 🟠 Header "Box home" (rótulo de sistema, não traduzido para algo humano) + toolbar de botões (Criar / Convidar / Sair).
- 🟠 Grid de `BoxCard` escuros (ver 4.13).

### 4.12 UnknownSessionPage / OfflineBanner / Dialogs — 🟡
- 🟡 `UnknownSessionPage`: tela de erro técnico ("Sessão desconhecida"). Tom e visual de sistema.
- 🟡 `OfflineBanner` e diálogos destrutivos: necessários, mas com visual cinza/vermelho de alerta de sistema. Podem manter clareza com tom mais leve.

---

## 5. Auditoria por componente compartilhado

| Componente | Conflito com o guia | Sev. |
|---|---|---|
| `Button` | Raio 12px (guia: 24px); primário = gradiente teal (guia: coral sólido, evitar excesso de gradiente); texto escuro sobre teal | 🔴 |
| `BoxCard` | Card escuro; "selo" = 1ª letra em círculo cinza (guia: ícone grande); contador em teal minúsculo; categoria via `border-top 3px` em vez de cor sólida da caixa | 🔴 |
| `ExperienceCard` | `border-left 3px`, fundo escuro, ações em fileira (CRUD) | 🟠 |
| `BrandMark` | Logo = letra "I" em caixinha com gradiente teal→laranja; não é ícone de marca arredondado/lúdico | 🟠 |
| `OnboardingIllustration` | Placeholder geométrico abstrato escuro; sem flat cartoon | 🔴 |
| `IntegritySeal` | Texto "SELO" uppercase + valor em **monospace** com fundo teal — muito técnico/forense | 🟠 |
| `IntensityBadge` | Apenas texto colorido com a cor de semáforo da intensidade; sem forma lúdica | 🟡 |
| `RatingScale` | 5 botões numéricos retangulares (12px) — cara de input de formulário; cores teal/lima/rosa fora da paleta | 🟠 |
| `ParameterRow` | Dots + texto "Esforço 3 · Abertura 3" — leitura de métricas/telemetria | 🟡 |
| `DrawResultCard` | Flip ok, mas escuro, uppercase label, `border-top 3px`, sem celebração | 🟠 |
| `QuickGuideOverlay` | Bottom sheet escuro com `h3` teal + listas — parece doc de ajuda de SaaS | 🟡 |
| `ToastProvider` / `OfflineBanner` | Feedback em estilo "sistema" (cinza/alerta) | 🟡 |

---

## 6. Conflitos de tom / conteúdo (microcopy)

O conteúdo emocional do onboarding é **bom**, mas há vocabulário de sistema espalhado:

- 🟠 "Modo Experiences" / "Modo Experience Box" em uppercase (rótulo de painel).
- 🟠 "Box home" como título de tela (termo de produto cru, não humano).
- 🟠 Parágrafo de **transparência/criptografia** repetido (Auth quick-guide, ExperienceListPage) — tom de termos de uso.
- 🟠 "Selo de integridade", "Sessão desconhecida", "Validação", "Parâmetros" — léxico técnico onde poderia ser lúdico.
- 🟡 Botões neutros ("Entrar", "Criar", "Próximo") sem o entusiasmo do tom "descoberta".

---

## 7. Matriz de severidade priorizada

| # | Problema | Sev. | Alcance | Origem |
|---|---|---|---|---|
| 1 | Tema escuro em vez de claro/quente | 🔴 | App inteiro | `global.css` |
| 2 | Paleta sem Coral/Amarelo/Roxo/Turquesa | 🔴 | App inteiro | `global.css`, `intensityTokens.ts` |
| 3 | Tipografia Segoe UI (não arredondada) | 🔴 | App inteiro | `global.css` |
| 4 | Sem ícones (glifos de texto) | 🔴 | Vários | componentes |
| 5 | Sem ilustrações flat cartoon | 🔴 | Onboarding, empty states, sorteio | assets |
| 6 | Sorteio parece filtro técnico, não "revelação" | 🔴 | SharedMoment | tela + DrawResultCard |
| 7 | Auth com 4 abas (cara de SaaS) | 🔴 | Auth | AuthPage |
| 8 | Bordas pouco arredondadas (12–16px) | 🟠 | App inteiro | tokens |
| 9 | Excesso de linhas/bordas/divisores | 🟠 | App inteiro | todos os módulos |
| 10 | Grupos/experiências como listas de sistema | 🟠 | Groups, Experiences | telas |
| 11 | CreateBox como formulário de radios | 🟠 | CreateBox | tela |
| 12 | Microcopy técnica ("Modo", "Box home", "Selo") | 🟠 | Vários | i18n |
| 13 | Sombras pesadas/dramáticas | 🟡 | Vários | módulos |
| 14 | Animações lúdicas ausentes (bounce/confetti) | 🟡 | App inteiro | — |

---

## 8. Direção de correção (resumo, sem implementação)

Ordem recomendada (efeito cascata, do maior alcance ao detalhe):

1. **Refundar tokens** (`global.css`): tema claro `#FFF7ED`/`#FFFFFF`, texto `#1F1F1F`/`#5A5A5A`, paleta coral/amarelo/roxo/turquesa, fonte arredondada (Nunito/Quicksand), raios dedicados (botão 24px, card 20px, chip 999px), sombra única suave.
2. **Adotar biblioteca de ícones** (Lucide/Phosphor) e substituir glifos `? ⋯ I`.
3. **Redesenhar `Button`, `BoxCard`, cards** como peças "colecionáveis" (cor sólida, ícone grande, título curto, contador).
4. **Reconceber o Sorteio** como "abrir envelope / revelar carta", com antecipação + confetti.
5. **Suavizar Auth e CreateBox** (menos abas/formulário, mais galeria/escolha lúdica).
6. **Planejar assets** flat cartoon (onboarding, empty states, sorteio) — ver `assets-manifest.md` a ser criado pelo agente de refatoração.
7. **Revisar microcopy** para tom de descoberta.

---

## 9. Assets necessários (catálogo inicial)

A serem detalhados com prompts em `assets-manifest.md` (convenção do agente):

- `IMG_ONBOARDING_1..4` — rotina, falta de conexão, momentos que esperam, agir junto (flat cartoon, pessoas/amizade/viagem).
- `IMG_EMPTY_BOXES`, `IMG_EMPTY_EXPERIENCES` — estados vazios acolhedores.
- `IMG_DRAW_ENVELOPE`, `IMG_REVEAL_CONFETTI` — sorteio/revelação.
- `IMG_ICON_*` por categoria de caixinha (☕ viagem, 🎲 amigos, ❤️ casal, etc., em estilo outline arredondado).
- `IMG_BRAND_LOGO` — marca arredondada e lúdica em coral.

---

*Fim da auditoria. Próximo passo sugerido: aprovar a refundação de tokens
(`global.css`) como primeira intervenção, pois destrava a maior parte dos itens 🔴.*
