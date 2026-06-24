# Plano de desenvolvimento — backlog UI/UX

Plano derivado de `backlog.md` (6 tarefas), ordenado conforme `agents/order-backlog.md`: fundações de design → componentes de formulário → jornadas principais → polimento.

**Premissa:** nenhuma tarefa exige mudança de API ou contrato OpenAPI. Tudo é client + documentação de design system.

---

## Visão geral

| Etapa | Tarefa | Tipo | PR sugerido |
|-------|--------|------|-------------|
| 1 | Aplanar roxo do design system | Refatoração / tokens | `refactor/purple-flat` |
| 2 | Checkboxes na criação de caixinha | Melhoria visual | `ui/create-box-checkboxes` |
| 3 | Wizard de criação de experiências | Feature UX | `feat/creation-wizard-ux` |
| 4 | Virar card na listagem | Feature UX | `feat/experience-card-flip` |
| 5 | Ícone de grupo nos cards | Polimento | `ui/group-card-icon` |
| 6 | Ritual do sorteio blank slate | Polimento | `ui/draw-ritual-states` |

**Ordem de dependência:** etapa 1 antes de 3 (explorer de sugestões usa roxo). Etapas 2, 4, 5 e 6 são independentes entre si após a 1.

---

## Etapa 1 — Aplanar roxo do design system

**Objetivo:** eliminar fade azulado do roxo; documentar uso flat.

**Escopo**
- Auditar `grep` por `--purple`, `color-mix.*purple`, `gradient.*purple` no client.
- Substituir gradientes teal→roxo em chrome de sessão/auth por cor sólida por modo.
- Ajustar fundos `color-mix(purple, white)` para não deslocar matiz.
- Atualizar `docs/*/solution-specification/design-system.md`.

**Gate de saída**
- [ ] Login Experiences, `SessionModeChrome` mode EXPERIENCES, pills de grupo e suggestion explorer com roxo flat perceptível.
- [ ] Sem gradientes teal+roxo em auth/chrome.
- [ ] Docs pt-BR, en, it alinhadas.
- [ ] `npm run build` no client OK.

**Risco:** regressão visual em Experience Box (teal) — testar ambos os modos.

---

## Etapa 2 — Checkboxes na criação de caixinha

**Objetivo:** polish do toggle “Preencher com ideias padrão” e da lista `SuggestionPickerList`.

**Escopo**
- Estilizar checkbox da flag em `CreateBoxForm.module.css` (ou extrair `Checkbox` mínimo em `components/`).
- Redesenhar linhas em `SuggestionPickerList` — checkbox custom, hierarquia por intensidade.
- Manter lógica de `selectedSuggestionIds` e submit inalterada.

**Gate de saída**
- [ ] Flag e itens com estados checked/focus/hover claros.
- [ ] Fluxo criar caixinha + preencher sugestões manualmente testado.
- [ ] Build client OK.

**Pode rodar em paralelo com etapa 1** se não houver conflito de CSS; merge após etapa 1 é mais limpo.

---

## Etapa 3 — Wizard de criação de experiências

**Objetivo:** maior mudança de UX do ciclo — descrição única sticky, sugestões auxiliares compactas, passos 3–4 refinados.

**Subentregas (ordem interna sugerida)**

1. **Descrição sticky**
   - Remover `descriptionCard` somente leitura duplicado.
   - Textarea “Descrição” fixa abaixo do progress, visível em steps 1–5.
   - `canAdvance` step 1: descrição não vazia (sem mudança de regra).

2. **SuggestionExplorer compacto**
   - Novo layout: filtros pequenos, card de texto só com descrição, ações discretas.
   - Remover `RatingScale` grande / metadados de intensidade e parâmetros do step 1.
   - `onAccept` continua chamando `applySuggestion` (pré-preenche reflexão, parâmetros, intensidade).

3. **Step 3 compacto**
   - Variante `listCompact` ou `wizard` em `ParameterStarField`, ou reduzir gap em `CreationAssistant.module.css`.

4. **Step 4 copy**
   - i18n explicando que intensidade sugerida = média arredondada dos parâmetros (`suggestIntensity`).

**Arquivos centrais:** `CreationAssistant.tsx`, `CreationAssistant.module.css`, `SuggestionExplorer.tsx`, `SuggestionExplorer.module.css`, `pt-BR.json` / `en.json` / `it.json`.

**Gate de saída**
- [ ] Descrição editável sticky em todos os passos.
- [ ] Sugestão opcional; avançar sem pick se descrição preenchida manualmente.
- [ ] Explorer com cara de componente auxiliar, não de tela.
- [ ] Step 3 com menos scroll em viewport ~390px.
- [ ] Step 4 com texto explícito sobre média dos parâmetros.
- [ ] Edição de experiência existente OK.
- [ ] Testes client existentes + build OK.

**Risco:** sticky + footer fixo do wizard pode competir por altura — testar mobile com teclado virtual.

---

## Etapa 4 — Virar card na listagem de experiências

**Objetivo:** flip 3D no lugar do olho; botão virar todos na toolbar.

**Escopo**
- Refatorar `ExperienceCard` para estrutura frente/verso (`preserve-3d`, `backface-visibility`) — espelhar padrão de `DrawResultCard`.
- Estado `flipped` por card; toolbar em `ExperienceListPage` com estado `allFlipped` e botão ícone à direita.
- i18n: `flipCard`, `unflipCard`, `flipAll`, `unflipAll`.

**Gate de saída**
- [ ] Flip individual só para autor com descrição/reflexão.
- [ ] Virar todos alterna todos os viráveis.
- [ ] `aria-pressed` / labels corretos.
- [ ] Editar e excluir inalterados.
- [ ] Build OK.

**Dependência:** nenhuma com etapa 3; pode ser PR separado após etapa 1.

---

## Etapa 5 — Ícone de grupo nos cards

**Objetivo:** reforço visual na `GroupSelectionPage`.

**Escopo**
- Ícone `Users` ou `UsersRound` (lucide) no `.row`.
- Ajuste mínimo de CSS para grid/flex com ícone + textos.

**Gate de saída**
- [ ] Ícone visível em cards coral/teal/purple/yellow.
- [ ] Layout OK em mobile.
- [ ] Navegação para caixinhas inalterada.

**Esforço:** baixo — candidato a cherry-pick ou PR rápido após etapa 1.

---

## Etapa 6 — Ritual do sorteio blank slate

**Objetivo:** envelope + ritualHint só pré-sorteio; `alignmentHint` com tipografia editorial.

**Escopo**
- Condicionar render de `.ritual` a `drawSession.phase === 'idle'` (ou ausência de carta sorteada).
- Refinar `.alignmentHint` em `SharedMomentPage.module.css` (fonte, peso, cor, espaçamento).
- Opcional: leve polish no envelope no blank slate.

**Gate de saída**
- [ ] Após sortear, sem quadrado coral nem texto “Toquem juntos…”.
- [ ] Antes do sorteio, blank slate presente.
- [ ] Dica “Respirem juntos…” mais refinada tipograficamente.
- [ ] Fluxo sortear → alinhar → revelar inalterado.
- [ ] Build OK.

---

## Estratégia de PRs

| Opção | Quando usar |
|-------|-------------|
| **6 PRs** (1 por etapa) | Revisão fina, deploy incremental |
| **3 PRs** | `1+2` design/forms · `3` wizard · `4+5+6` listagem/grupo/sorteio |
| **2 PRs** | `1–3` contribuição · `4–6` leitura/ritual |

Recomendação: **3 PRs** — wizard é o diff maior e merece isolamento.

---

## Validação final do ciclo

Após merge de todas as etapas:

1. `npm run build` e `npm test` no client.
2. Smoke manual:
   - Login Experiences → grupos (ícone) → caixinha → criar com checkboxes.
   - Wizard: descrição manual, pick de sugestão, passos 3–5.
   - Lista: flip um card, virar todos.
   - Experience Box → sorteio: blank slate → sortear → sem ritual → alinhamento tipográfico → revelar.
3. Revisar roxo flat em telas Experiences vs teal em Experience Box.

---

## Fora de escopo deste backlog

- Mudanças de API, OpenAPI ou domínio de intensidade.
- Redesign completo de `DrawResultCard` ou filtros do sorteio.
- Novos testes E2E (só manter unitários existentes verdes).
