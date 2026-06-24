# Backlog

Mapa de referências do repositório: @ref:refs (`docs/refs.yaml`).

Executar na ordem das seções abaixo — dentro de cada seção, na ordem listada.

---

## Refatorações

Ajustes de design system e tokens que impactam várias telas; estabilizar paleta antes de refinar fluxos que dependem dela.

## Aplanar roxo do design system

### Descrição

O token `--purple` (`#7B5CF6`) aparece em chips, pills, destaques de modo Experiences, gradientes com `--teal` e misturas `color-mix` que produzem um **fade azulado** em vez de roxo sólido flat. A spec (@ref:pt-br-design-system) já pede cores sólidas e evita gradientes decorativos nas páginas, mas a implementação ainda mistura roxo com teal/branco de formas que desviam do tom canônico.

Esta tarefa alinha o roxo à cor **flat** do design system em toda a aplicação e atualiza a documentação para deixar explícito que `--purple` não deve ser usado em gradientes com teal nem em `color-mix` que altere o matiz percebido.

### Prompt IA

**Objetivo:** Garantir que `--purple` seja aplicado como cor sólida flat, sem aparência azulada por gradientes ou misturas.

**Estado atual (confirmar):**
- `client/src/presentation/styles/global.css` — `--purple: #7b5cf6`
- Gradientes `linear-gradient(145deg, var(--teal), var(--purple))` em `SessionModeChrome`, `AuthPage`, `AuthModeIntro`
- `color-mix(in srgb, var(--purple) X%, white)` em vários `.module.css` (pills, banners, suggestion explorer)
- `BoxSelectionPage` success banner: `color: var(--purple)` sobre fundo teal-mix
- Docs: @ref:pt-br-design-system, @ref:en-design-system — token `--purple` sem proibição explícita de gradiente roxo+teal

**Comportamento esperado:**
1. Substituir gradientes teal→roxo por **uma cor sólida** por contexto (ex.: roxo flat para Experiences, teal para Experience Box — seguir matriz existente em @ref:pt-br-experience-and-identity).
2. Revisar usos de `color-mix` com `--purple`: preferir roxo sólido para texto/ícone; fundos com opacidade ou mix **neutro** (branco/surface) que não desloquem o matiz para azul.
3. Manter contraste e legibilidade (WCAG) em chips e pills.
4. Atualizar @ref:pt-br-design-system e equivalentes en/it: roxo é **flat**; não usar gradiente teal+roxo em chrome de sessão; exemplos de uso correto.

**Arquivos prováveis:** `global.css`, `SessionModeChrome.module.css`, `AuthPage.module.css`, `AuthModeIntro.module.css`, `GroupMemberPills.module.css`, `SuggestionExplorer.module.css`, `CreateBoxForm.module.css`, `BoxSelectionPage.module.css`, docs de design system.

**Critérios de aceitação:**
- Roxo percebido como `#7B5CF6` flat nos principais consumidores (login, chrome de modo, pills de grupo, explorer de sugestões).
- Sem gradientes teal→roxo em componentes de sessão/auth.
- Docs atualizadas.
- Build client OK; revisão visual em telas com roxo.

**Restrições:**
- Não alterar outros tokens (`--coral`, `--teal`, `--yellow`) além de ajustes colaterais inevitáveis.
- Não redesenhar layouts inteiros — só cor/mistura.

---

## Melhorias

Refinamentos visuais e de UX em fluxos já existentes.

## Melhorar checkboxes na criação de caixinha

### Descrição

Em `CreateBoxForm` (Experiences e Experience Box), a opção **Preencher com ideias padrão** usa checkbox nativo sem tratamento visual alinhado ao design system (@ref:pt-br-design-system). Quando ativa, `SuggestionPickerList` exibe dezenas de checkboxes por intensidade — também genéricos, pouco legíveis e visualmente pesados.

O objetivo é deixar o toggle principal e os itens de sugestão com aparência consistente: alvos de toque ≥ 48px, estados checked/focus visíveis, hierarquia clara entre flag principal e lista de seleção.

### Prompt IA

**Objetivo:** Redesenhar checkboxes do fluxo de criação de caixinha (flag + lista de sugestões).

**Estado atual (confirmar):**
- `client/src/presentation/boxes/CreateBoxForm.tsx` — `<input type="checkbox">` em `.flag`
- `client/src/presentation/suggestions/SuggestionPickerList.tsx` — checkboxes por sugestão agrupadas por intensidade
- `CreateBoxForm.module.css`, `SuggestionPickerList.module.css`

**Comportamento esperado:**
1. Checkbox da flag **Preencher com ideias padrão**: estilo customizado (ou componente compartilhado `Checkbox` se fizer sentido) — borda arredondada, check visível, cor de acento do design system.
2. Itens em `SuggestionPickerList`: cards/linhas selecionáveis com checkbox integrado; resumo da ideia legível; grupo por intensidade mantido.
3. Estados hover, focus-visible e disabled coerentes com `Button`/`NavButton`.
4. Sem mudança de lógica (mesmos IDs selecionados, mesmo submit).

**Regras:** reutilizar tokens `--radius-*`, `--coral`/`--teal` conforme `data-variant` do form; i18n inalterada salvo labels de acessibilidade.

**Critérios de aceitação:** flag e lista visualmente polidas; seleção múltipla funciona; build e fluxo de criar caixinha com preenchimento OK.

**Restrições:** escopo limitado a `CreateBoxForm` + `SuggestionPickerList` (+ componente compartilhado opcional).

---

## Funcionalidades Principais

Jornadas centrais de contribuição e ritual compartilhado.

## Refinar wizard de criação de experiências

### Descrição

O `CreationAssistant` (cinco etapas) hoje mostra **Sua ideia** como card somente leitura no topo e um campo **Descrição** separado no passo 1, além do `SuggestionExplorer` ocupando muito espaço com aparência de tela inteira (filtro de intensidade grande, metadados da sugestão, cores e espaçamentos pesados). Avançar no passo 1 exige `description.trim().length > 0`, mas a UX sugere dependência de aceitar sugestão — o fluxo correto é: **um único campo de descrição** editável sempre; sugestões são atalhos que preenchem esse campo.

Também é preciso compactar o passo 3 (parâmetros), deixar explícito no passo 4 que a intensidade sugerida vem da **média dos parâmetros**, e redesenhar sugestões como componente auxiliar compacto (navegar sugestões → pick → continuar wizard).

### Prompt IA

**Objetivo:** Reestruturar o assistente de criação para descrição única sticky, sugestões auxiliares compactas e passos 3–4 mais claros/compactos.

**Estado atual (confirmar):**
- `CreationAssistant.tsx` — `descriptionCard` + `SuggestionExplorer` + textarea `assistant.fields.description` no step 1; `canAdvance` step 1 = descrição não vazia
- `SuggestionExplorer.tsx` / `.module.css` — `RatingScale` filtro, card grande, intensidade e parâmetros visíveis
- Step 3: três `ParameterStarField` layout `picker` com `showHint` — alto verticalmente
- Step 4: hint `assistant.suggestedIntensity` só quando `!intensityTouched`
- i18n: `assistant.descriptionCard` = "Sua ideia"; `assistant.fields.description` = "Descrição"

**Comportamento esperado — descrição:**
1. **Remover** duplicidade Sua ideia vs Descrição: um único campo **Descrição** (label i18n unificada), textarea editável.
2. Campo fixo **sticky no topo** do painel do wizard em **todas** as etapas (abaixo do header/progress), sempre visível ao rolar.
3. Usuário pode digitar livremente ou preencher via sugestão; avançar step 1 com descrição não vazia (sem obrigar aceitar sugestão).

**Comportamento esperado — sugestões (step 1):**
1. Redesenhar `SuggestionExplorer` (ou `SuggestionPicker` auxiliar): **compacto**, visual de componente auxiliar, não de tela.
2. Filtro de intensidade **pequeno** (chips ou escala compacta); botões **Outra sugestão** e **Usar esta ideia** discretos.
3. **Não** exibir intensidade nem parâmetros da sugestão no step 1 — ao aceitar, pré-preencher parâmetros/intensidade/reflexão nas etapas seguintes (comportamento já existente em `applySuggestion`).
4. Metáfora: next → next pelo wizard; no step 1, folhear sugestões e dar **pick** quando quiser.

**Comportamento esperado — passos 3 e 4:**
1. Step 3: reduzir gaps/padding dos cards de parâmetro (`picker` ou variante `wizard` compacta); menos scroll em mobile.
2. Step 4: copy explícita de que a classificação sugerida é baseada na **média arredondada** dos três parâmetros (i18n pt-BR, en, it); manter `suggestIntensity` do domínio.

**Arquivos:** `CreationAssistant.tsx`, `.module.css`, `SuggestionExplorer.tsx`, `.module.css`, i18n `assistant.*` / `suggestions.explorer.*`, opcional extrair `StickyDescriptionField`.

**Critérios de aceitação:**
- Descrição única sticky em 5 passos; sugestão opcional preenche descrição + demais campos.
- Explorer compacto sem metadados de intensidade/parâmetros no step 1.
- Step 3 visivelmente mais baixo; step 4 explica origem da sugestão de intensidade.
- Edição de experiência existente sem regressão.
- Build + testes client OK.

**Restrições:** sem mudança de API; manter cinco passos e validações de domínio.

---

## Virar card na listagem de experiências

### Descrição

Na `ExperienceListPage`, o autor revela descrição/reflexão com ícone de **olho**, expandindo conteúdo abaixo do card (`ExperienceCard`). O produto passa a usar metáfora de **virar carta**: ícone de flip no card; face traseira com texto; animação similar à capa do sorteio (`DrawResultCard`).

Na toolbar, ao lado de **Guardar uma ideia**, botão ícone-only à **direita** (mesmo ícone de virar, cor distinta) para **virar todos** os cards do autor de uma vez.

### Prompt IA

**Objetivo:** Substituir reveal por olho por flip 3D no card; adicionar virar todos.

**Estado atual (confirmar):**
- `ExperienceCard.tsx` — `Eye`/`EyeOff`, `contentRevealed`, bloco `.revealedContent` abaixo
- `ExperienceListPage.tsx` — toolbar só com botão criar
- `DrawResultCard` — referência de flip `rotateY` + `preserve-3d`

**Comportamento esperado:**
1. Trocar ícone olho por ícone de virar carta (ex. `RotateCw`, `FlipHorizontal2` do lucide — escolher o mais legível).
2. Card com frente (meta atual) e verso (descrição + reflexão); flip 3D ao tocar; só para itens do autor com conteúdo revelável.
3. Toolbar: layout `criar | spacer | virar-todos`; botão virar todos ícone-only, `aria-label` i18n; alterna todos os cards viráveis.
4. i18n: substituir `revealDescription`/`hideDescription` por labels de virar; adicionar `flipAll` / `unflipAll` para acessibilidade.

**Critérios de aceitação:** flip individual e em massa; meta na frente intacta; acessibilidade; sem regressão em editar/excluir.

**Restrições:** escopo `ExperienceCard` + `ExperienceListPage` + CSS; não alterar `DrawResultCard`.

---

## Melhorias (polimento)

Ajustes visuais pontuais em seleção de grupo e ritual do sorteio.

## Ícone de grupo nos cards de seleção

### Descrição

Em `GroupSelectionPage`, os cards coloridos mostram preview de nomes e contagem, mas não têm ícone que comunique “grupo/turma”. Adicionar ícone de grupo (ex. `UsersRound` do lucide, alinhado a Experience Box) de forma discreta no card.

### Prompt IA

**Objetivo:** Ícone de grupo em cada card da listagem de grupos.

**Estado atual:** `GroupSelectionPage.tsx` — botão `.row` com `rowTitle` (preview nomes) e `rowMeta`; cores via `data-accent` + `getGroupAccent`.

**Comportamento esperado:**
1. Ícone à esquerda ou no topo do card, tamanho moderado, cor contrastante sobre fundo do card.
2. Não quebrar layout em 320px; preview de nomes continua legível.
3. Decorativo com `aria-hidden`; nome do grupo continua sendo os membros (sem título formal).

**Arquivos:** `GroupSelectionPage.tsx`, `.module.css`; reutilizar padrão de ícones de `sessionModeVisuals` se adequado.

**Critérios de aceitação:** ícone visível em todos os cards; toque navega para caixinhas como hoje.

---

## Ritual do sorteio: blank slate e dica de alinhamento

### Descrição

Em `SharedMomentPage`, a seção `.ritual` (quadrado coral inclinado + `Sparkles` + texto “Toquem juntos…”) aparece **sempre**, inclusive após sortear. Esses elementos devem ser **blank slate** — visíveis só **antes** do primeiro sorteio da sessão na tela (estado idle, sem carta sorteada).

A dica “Respirem juntos antes de abrir a carta completa.” (`alignmentHint`) aparece após sortear; deve ganhar tratamento tipográfico mais editorial (menos chip genérico), mantendo função de pausa antes de revelar.

### Prompt IA

**Objetivo:** Ocultar ritual inicial após sorteio; refinar tipografia da dica de alinhamento.

**Estado atual (confirmar):**
- `SharedMomentPage.tsx` — `.ritual` sempre renderizado; `DrawResultCard` quando `drawSession.phase !== 'idle'`
- `alignmentHint` após carta, antes de revelar — estilo tracejado âmbar em `.module.css`
- `drawSession` via `RevelationOrchestrator` — fases idle / drawn / revealed

**Comportamento esperado:**
1. Mostrar `.ritual` (envelope + `ritualHint`) **somente** quando não há carta sorteada (`drawSession.phase === 'idle'` ou equivalente).
2. Após sortear, esconder envelope e `ritualHint`; manter filtros e carta.
3. `alignmentHint`: tipografia de destaque — ex. itálico leve, tamanho menor, letter-spacing, cor âmbar/marrom; sem aparência de alerta/banner pesado.
4. Opcional: pequeno refinamento visual do envelope no blank slate (sem aumentar tamanho).

**Critérios de aceitação:** blank slate só pré-sorteio; pós-sorteio foco na carta; dica de alinhamento mais “tip”; flip/reveal inalterados.

**Restrições:** escopo `SharedMomentPage` + CSS + i18n se copy mudar.
