# Backlog

Mapa de referências do repositório: @ref:refs (`docs/refs.yaml`).

Executar na ordem das seções abaixo — dentro de cada seção, na ordem listada.

---

## Funcionalidades Principais

Jornada de grupo no modo Experiences: criar turma com um toque, garantir grupo inicial para quem entra sem nenhum, e contextualizar quem está no grupo ao abrir as caixinhas.

## Criar grupo na sessão Experiences

### Descrição

No modo Experiences, um participante pode pertencer a vários grupos (@ref:pt-br-data-model), mas hoje **não existe forma de criar um grupo pela sessão individual**. Grupos só surgem por login conjunto na Caixa de Experiências ou por aceitar convite. Quem registra e entra só no Experiences chega em `GroupSelectionPage` com lista vazia e copy de convite — sem caminho direto para começar uma turma própria.

O produto passa a oferecer **Criar grupo** na listagem: um toque cria um grupo com **apenas o participante autenticado**, o card aparece na lista na hora (sem tela dedicada de criação) e, ao abrir o grupo, o fluxo é o mesmo de hoje (`BoxSelectionPage` com convidar, sair, criar caixinha). Opcionalmente, um diálogo de confirmação antes da criação explica que o grupo começa só com a pessoa e que convites são feitos **dentro** do grupo.

Além disso, participantes que **não pertencem a nenhum grupo** ao entrar no Experiences devem receber **automaticamente um grupo padrão** só com eles — eliminando o estado vazio como experiência inicial. Quem já tem um ou mais grupos não ganha grupo extra.

### Prompt IA

**Objetivo:** Permitir criar grupo na sessão Experiences com um toque; provisionar grupo padrão solo para quem entra sem nenhum grupo; manter convite e demais ações dentro de `BoxSelectionPage`.

**Estado atual (confirmar):**
- `GET /v1/groups` lista grupos do participante (`GroupQueryService`); **não há** `POST /v1/groups`.
- Grupos são criados em `GroupService.createGroupWithMembers` (login Experience Box) e ao aceitar convite.
- `GroupSelectionPage` — lista cards coloridos; empty state quando `groups.length === 0`; sem ação de criar.
- `BoxSelectionPage` — convite, sair, criar caixinha (já implementados).
- Login Experiences (`POST /v1/auth/login`) não cria grupo.

**Comportamento esperado — criar grupo:**
1. Botão/ação **Criar grupo** visível em `GroupSelectionPage` (toolbar ou CTA persistente, inclusive quando já há grupos).
2. Toque dispara criação imediata **ou** abre diálogo de confirmação curto (título + mensagem explicando grupo solo + convite dentro do grupo) com confirmar/cancelar; ao confirmar, cria.
3. API cria grupo com o `participantId` da sessão como único membro; retorna `GroupResponse` enriquecido (id, memberCount, members com displayName).
4. Client atualiza a lista local com o novo card; toast opcional de sucesso.
5. **Não** navegar automaticamente para dentro do grupo — usuário escolhe quando abrir (como nos cards existentes).
6. Não criar tela/rota nova de “criar grupo”.

**Comportamento esperado — grupo padrão:**
1. Após login/registro Experiences, se `GET /v1/groups` retornar lista vazia, criar automaticamente um grupo solo (mesma regra de um membro).
2. Implementar no **backend** (preferível: idempotente no primeiro `GET /v1/groups` ou no login Experiences) ou no client na primeira carga de `GroupSelectionPage` — documentar escolha; evitar duplicar grupos em refresh.
3. Usuário com 1+ grupos nunca recebe grupo extra.

**API e domínio:**
- `POST /v1/groups` (ou nome alinhado ao OpenAPI) — autenticado, modo Experiences; corpo vazio ou mínimo; resposta `GroupResponse`.
- Extrair lógica de criação de grupo reutilizável (`GroupService` ou serviço dedicado) sem quebrar login Experience Box.
- Atualizar `openapi/openapi.yaml` e testes de integração (criar grupo solo, listagem inclui novo grupo, provisionamento padrão quando vazio).

**Client:**
- `CreateGroupUseCase` em `boxUseCases.ts` (ou módulo de grupo).
- `GroupSelectionPage` + CSS — botão criar; diálogo opcional (`DestructiveConfirmDialog` ou confirmação não destrutiva).
- i18n `groups.create`, `groups.createDialog.*`, `groups.createSuccess` em pt-BR, en, it.
- Garantir que empty state deixe de ser o único caminho para novos usuários (pode manter hint de convite como secundário).

**Regras arquiteturais:**
- Clean Architecture no client (use case + adapter API).
- Convite continua **por grupo** em `BoxSelectionPage` — não na listagem.
- Não alterar fluxo Experience Box nem regras de conflito de membresia no login conjunto.

**Documentação:**
- Atualizar @ref:pt-br-data-model e @ref:pt-br-functional-components: grupo pode ser criado no modo Experiences; participante sem grupo recebe um grupo solo por padrão.

**Critérios de aceitação:**
- Novo usuário Experiences vê pelo menos um grupo (provisionado) sem passar por empty state obrigatório.
- “Criar grupo” adiciona card na lista; abrir o grupo leva à mesma `BoxSelectionPage` de sempre.
- Diálogo de confirmação (se implementado) explica grupo solo + convite interno.
- Testes API passam; build client passa; três locales com paridade.

**Restrições:**
- Sem tela dedicada de criação de grupo.
- Sem nomear/editar grupo (fora de escopo).
- Não mudar ritual Experience Box.

---

## Exibir membros do grupo na seleção de caixinhas

### Descrição

Depois de escolher um grupo, `BoxSelectionPage` lista caixinhas mas **não mostra quem está na turma**. A API já devolve `members` em `GET /v1/groups` (participantId + displayName), e os cards da listagem de grupos usam preview de nomes — porém, dentro do grupo, falta reforço visual de “com quem estou”.

Esta tarefa adiciona uma faixa de **pills** com o `displayName` de cada membro: scroll horizontal quando não couber, tipografia compacta, sem e-mail. Ajuda a distinguir grupos sem nome formal e prepara o contexto antes de criar caixinha ou convidar.

### Prompt IA

**Objetivo:** Exibir todos os membros do grupo ativo em `BoxSelectionPage` como pills horizontais com scroll.

**Estado atual (confirmar):**
- `BoxSelectionPage` carrega caixinhas e `groupMemberCount` via `ListGroupsUseCase`; não renderiza lista de membros.
- `Group.members` já tipado em `boxTypes.ts`.
- Padrões visuais: chips em `SessionModeChrome` (Experience Box), pills em `NavButton`/design system (`--radius-chip`).

**Comportamento esperado:**
1. Abaixo do header (ou entre header e toolbar), faixa com pills: uma por membro, só `displayName`.
2. Container com `overflow-x: auto`, scroll suave em mobile; sem quebrar layout da toolbar (criar, convidar, sair).
3. Ordem dos nomes: mesma da API (alfabética por displayName) ou estável por `participantId`.
4. Destaque opcional e discreto para o participante da sessão atual (ex. borda ou peso) — não obrigatório se complicar i18n.
5. Estado de carregamento: omitir faixa ou skeleton curto; erro não bloqueia listagem de caixinhas.

**Implementação sugerida:**
- Componente `GroupMemberPills` em `presentation/components/` (reutilizável).
- `BoxSelectionPage` resolve `members` do grupo ativo a partir de `ListGroupsUseCase` (já chamado) ou cache local.
- CSS module: flex row, `gap`, `flex-shrink: 0` nas pills, `-webkit-overflow-scrolling: touch`.
- i18n: `groups.membersLabel` ou `aria-label` acessível (“Membros do grupo”) em pt-BR, en, it.

**Regras arquiteturais:**
- Somente leitura; sem ações nas pills.
- Não duplicar lógica de preview abreviado da listagem de grupos — aqui mostrar **todos** os nomes em pills individuais.
- Não alterar `GroupSelectionPage` além do que for necessário para consistência visual.

**Critérios de aceitação:**
- Grupo com 2+ membros: todos os nomes visíveis via scroll horizontal em ~320px.
- Grupo solo: uma pill com o nome do usuário.
- Toolbar e lista de caixinhas sem regressão.
- Build e testes existentes passam.

**Restrições:**
- Escopo limitado a `BoxSelectionPage` (não Experience Box `BoxHomePage` nesta tarefa, salvo reuso trivial do componente).
- Sem avatar/foto de perfil (não modelado).

---

## Melhorias

Ajustes visuais na listagem de experiências do modo Experiences, sem mudar comportamento de revelação, edição ou exclusão.

## Compactar meta do card de experiência

### Descrição

Na `ExperienceListPage`, cada `ExperienceCard` usa `ExperienceSummaryMeta` com layout `list` para esforço, abertura e novidade. O layout atual aplica **fundo** (`--surface-sunken`) em cada bloco de parâmetro, ocupa altura vertical excessiva e o selo de integridade ainda compete com intensidade e parâmetros. O resultado parece pesado para uma listagem densa.

A tarefa refina só o **card de lista** (não a capa do sorteio nem o layout `drawCover`): remover fundo dos parâmetros; empilhar ícone, label e estrelas de forma **verticalmente compacta**; reduzir o selo ao mínimo legível (tamanho e peso visual), mantendo `aria-label` e `title` com o código completo.

### Prompt IA

**Objetivo:** Deixar o bloco de meta do `ExperienceCard` mais compacto e limpo — parâmetros sem caixa de fundo, selo bem pequeno.

**Estado atual (confirmar):**
- `ExperienceCard` → `ExperienceSummaryMeta` (`compact=false`) → `ParameterStarsGroup layout="list"`.
- `ParameterStarField.module.css` — `.list` e `.listGroup` com `background: var(--surface-sunken)` e padding.
- `IntegritySeal` — variantes `default`, `compact`, `minimal` (esta última usada na capa do sorteio).
- Capa do sorteio (`DrawCardCover`) e layout `drawCover` **não** devem regredir.

**Comportamento esperado:**
1. Novo layout de parâmetro para lista de experiências — ex. `layout="listCompact"` ou variante `ExperienceSummaryMeta variant="listCard"` — com:
   - Ícone + label + estrelas em coluna apertada por parâmetro.
   - **Sem** background no bloco do parâmetro (transparente sobre o card).
   - Gaps e fontes menores que o `list` atual; estrelas `sm` ou `xs`.
2. Três parâmetros em coluna ou grid que não colida em cards estreitos (~320px) — reutilizar lições da Etapa 2 (sem colisão Esforço/Abertura).
3. Selo no card de lista: menor que hoje — inspirar em `variant="minimal"` mas pode manter label curto se couber; opacidade/tamanho reduzidos; código completo em `title`/`aria-label`.
4. `IntensityBadge` no card pode permanecer como está, salvo ajuste de margem herdado.

**Implementação sugerida:**
- Estender `ParameterStarField` / `ParameterStarsGroup` com layout dedicado **ou** props em `ExperienceSummaryMeta` que não afetem `compact` da capa antiga.
- Ajustar `ExperienceSummaryMeta.module.css` e/ou novo módulo para variante de lista.
- `ExperienceCard.module.css` — espaçamento do `metaRow` se necessário.
- Validar `ExperienceListPage` em mobile estreito.

**Regras arquiteturais:**
- Alteração visual apenas; mesmas regras de visibilidade (`experienceVisibility`), olho de revelação, editar/excluir.
- Não alterar API nem campos de experiência.
- `DrawCardCover`, `drawCover`, `list` em outros contextos: sem regressão.

**Critérios de aceitação:**
- Cards na lista sem fundo cinza atrás de cada parâmetro.
- Bloco de parâmetros visivelmente mais baixo que o layout `list` atual.
- Selo claramente menor/discreto; acessível via leitor de tela.
- Capa do sorteio e lista de grupos/caixinhas sem regressão visual.
- Build client passa.

**Restrições:**
- Escopo: `ExperienceCard` / `ExperienceSummaryMeta` na listagem Experiences.
- Não redesenhar assistente de criação nem explorer de sugestões nesta tarefa.
