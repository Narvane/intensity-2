# Backlog

Mapa de referências do repositório: @ref:refs (`docs/refs.yaml`).

Executar na ordem das seções abaixo — dentro de cada seção, na ordem listada.

---

## Correções de Fluxo Crítico

Correções que desbloqueiam jornadas principais sem dependências de redesign.

## Corrigir fluxo de aceite de convite pós-autenticação

### Descrição

O fluxo de convite hoje permite que um usuário não autenticado insira um código na tela de autenticação, visualize a prévia do grupo em `/join` e seja orientado a entrar ou cadastrar para aceitar. Na prática, após o login o usuário volta à autenticação ou permanece na prévia sem conseguir concluir a entrada no grupo — o convite não se materializa em membresia.

A spec em @ref:pt-br-functional-components (Fluxo D — Entrar via convite) define que, após aceitar, o convidado deve chegar à seleção de grupo no modo Experiences. O client já possui `InvitePreviewPage`, `ValidateInviteUseCase`, `AcceptInviteUseCase` e passagem de `returnTo` via `location.state` em `AuthPage`, mas a continuidade pós-login está quebrada ou frágil (possível perda de contexto, sessão ainda não hidratada ao retornar, ou ausência de aceite automático quando o usuário já se autenticou para esse fim).

Esta tarefa corrige ponta a ponta o caminho: código ou deep link → prévia → autenticação (se necessário) → aceite → destino correto no app. É pré-requisito para confiar em convites vindos do modo Experiences quando a criação de caixinhas for expandida.

### Prompt IA

Analise e corrija o fluxo completo de convite no client, alinhado ao Fluxo D em `docs/pt-br/solution-specification/functional-components.md` e às regras de convite em `docs/pt-br/solution-specification/experience-and-identity.md`.

**Arquivos e módulos prováveis:**
- `client/src/presentation/invite/InvitePreviewPage.tsx`
- `client/src/presentation/auth/AuthPage.tsx`
- `client/src/app/routes.tsx`, `client/src/app/routeGuards.tsx`
- `client/src/app/useInviteDeepLink.ts`, `client/src/app/useBootstrapFlow.ts`
- `client/src/domain/invite/` (use cases, presentation, errors)
- `client/src/app/SessionProvider.tsx`
- Chaves i18n em `client/src/i18n/locales/` (`invite.*`, `auth.*`)

**Comportamento esperado:**
1. Usuário sem sessão insere código válido na aba de convite da autenticação ou abre deep link → vê prévia com membros e validade.
2. Ao tocar em "Entrar para aceitar" ou "Cadastrar para aceitar", vai à autenticação com contexto preservado (código/convite pendente).
3. Após login ou cadastro no modo **Experiences** (`accessMode: EXPERIENCES`), o app retoma o fluxo sem exigir redigitar o código: ou retorna à prévia já apta a aceitar, ou aceita automaticamente se for seguro e idempotente.
4. Após aceite bem-sucedido, navega para o grupo convidado (ex.: `/groups/{groupId}/boxes` conforme implementação atual) e o usuário passa a ver o grupo na seleção.
5. Casos já membro (`ALREADY_GROUP_MEMBER`) redirecionam ao grupo sem erro bloqueante.
6. Deep links nativos (`useInviteDeepLink`, `useBootstrapFlow`) seguem o mesmo comportamento pós-auth.

**Investigar e corrigir causas prováveis:**
- `returnTo` perdido ao navegar entre `/join` e `/auth` (React Router `state`).
- `RequireGuestRoute` redirecionando usuário com sessão ativa para `/groups` ou `/box-home` antes de concluir aceite quando `returnTo` aponta para `/join`.
- Race entre `refresh()` da sessão e re-render de `InvitePreviewPage` que ainda mostra CTAs de login.
- Login no painel errado (Experience Box) quando o convite exige sessão Experiences.
- Registro (`submitRegister`) vs login (`submitExperiences`) — ambos devem honrar `returnTo`.

**Regras arquiteturais:**
- Seguir Clean Architecture no client (DT-13): lógica de pendência de convite pode viver em domínio ou adapter de preferências, não espalhada em componentes.
- Aceitar convite exige token de sessão Experiences; não alterar contrato REST sem necessidade (`openapi/openapi.yaml`).
- Manter tratamento de erros via `resolveInviteError` e copy acionável em i18n.
- Não implementar nesta tarefa mudanças de identidade visual dos modos nem criação de caixinhas no modo Experiences.

**Critérios de aceitação:**
- Fluxo manual: código na auth → prévia → login → grupo acessível sem passos mortos.
- Fluxo manual: deep link com `?code=` ou `?t=` → mesmo resultado após auth.
- Fluxo de cadastro a partir da prévia também conclui aceite.
- Usuário já logado em Experiences na prévia aceita com um toque.
- Testes unitários cobrindo persistência/recuperação do convite pendente e/ou navegação pós-auth (estender `invitePresentation.test.ts` ou testes de auth conforme padrão do repo).
- Sem regressão nos fluxos de login Experience Box e registro sem convite.

**Restrições:**
- Escopo limitado ao fluxo de convite; não redesenhar telas de autenticação além do necessário para o bugfix.

---

## Fundações e Componentes Compartilhados

Marca, identidade dos modos e componentes reutilizáveis antes de expandir fluxos que os consomem.

## Integrar logos oficiais no aplicativo

### Descrição

A identidade visual do Intensity já está definida na spec (@ref:pt-br-experience-and-identity, @ref:pt-br-design-system): wordmark arredondado em coral para splash, onboarding e cabeçalhos de autenticação, e ícone do app para assets de loja. Na implementação atual, `BrandMark` é apenas um placeholder — um quadrado coral com ícone genérico do Lucide — usado na tela de bootstrap (splash) e na autenticação.

Os arquivos finais de logo serão produzidos e posicionados manualmente pelo time de produto em uma pasta `assets/` na raiz do repositório: uma **logo ícone** (quadrada) e uma **logo texto** (retangular, wordmark). Esta tarefa não inclui criação de artwork; o agente de implementação deve consumir esses arquivos quando existirem ou usar placeholders fiéis ao design system até que sejam disponibilizados.

O valor entregue é substituir o placeholder por marca real em todos os pontos de contato in-app previstos na spec, com fallback previsível para desenvolvimento paralelo enquanto os assets ainda não foram enviados.

### Prompt IA

Integre as logos oficiais do Intensity no client, substituindo o placeholder atual de `BrandMark`.

**Contexto de produto:**
- `docs/pt-br/solution-specification/experience-and-identity.md` — logo/wordmark em splash, onboarding e auth; ícone para loja.
- `docs/pt-br/solution-specification/design-system.md` — componente Brand mark (coral, formato caixinha/etiqueta, cantos arredondados).

**Assets fornecidos pelo time (não gerar artwork):**

Pasta canônica na **raiz do repositório**: `assets/`

| Arquivo esperado | Formato | Uso |
|------------------|---------|-----|
| `assets/logo-icon.*` | Quadrado (PNG ou SVG) | Ícone de marca compacto — bootstrap/splash, favicon, base para ícone nativo |
| `assets/logo-wordmark.*` | Retangular (PNG ou SVG) | Wordmark — cabeçalho da autenticação e contextos horizontais |

Aceitar extensão `.png` ou `.svg`; preferir SVG quando disponível. Se o time usar nomes ligeiramente diferentes, documentar no PR o mapeamento adotado — mas priorizar os nomes acima.

**Regra de placeholders:**
- **Se os arquivos existirem em `assets/`** no momento da implementação → importar e exibir as logos reais.
- **Se não existirem** → manter placeholders visuais alinhados ao design system (equivalente funcional ao `BrandMark` atual: bloco coral + ícone neutro ou silhueta genérica), claramente substituíveis quando os arquivos forem adicionados — sem gerar logos com IA nem buscar assets externos.

**Arquivos prováveis:**
- `client/src/presentation/components/BrandMark.tsx` e `BrandMark.module.css` — refatorar para suportar variantes `icon` e `wordmark` (e tamanhos `md` / `lg` já existentes).
- `client/src/presentation/bootstrap/BootstrapPage.tsx` — splash: preferir logo ícone grande ou wordmark centralizado (escolher o que melhor respeitar a spec e proporções dos assets).
- `client/src/presentation/auth/AuthPage.tsx` — cabeçalho: preferir wordmark retangular.
- `client/index.html` — favicon a partir da logo ícone, se o asset existir.
- Configuração Vite/build — tornar `assets/` na raiz acessível ao client (alias, cópia para `client/public/`, ou import estático documentado).

**Escopo opcional (somente se `assets/logo-icon.*` existir):**
- Atualizar ícones nativos Capacitor (Android `ic_launcher`, iOS App Icon) e splash nativo para refletir a logo ícone, seguindo convenções do Capacitor 7 e `client/STORE_RELEASE.md`. Se os assets não existirem, pular esta etapa e deixar nota no PR.

**Regras arquiteturais:**
- **Não** gerar, desenhar nem solicitar geração de logos — apenas integrar arquivos em `assets/` ou placeholders.
- Preservar acessibilidade: `alt` descritivo ou `aria-label` com nome do produto onde a logo for informativa; manter `srOnly` com nome do app onde já existir.
- Respeitar tokens do design system; não aplicar filtros ou cores que distorçam artwork fornecido (exceto dimensionamento responsivo).
- Não alterar copy i18n além do necessário para acessibilidade da marca.
- Componente reutilizável — outros pontos futuros (ex.: onboarding) devem poder importar `BrandMark` sem duplicar paths de asset.

**Critérios de aceitação:**
- Bootstrap e autenticação exibem logos reais quando os arquivos estão em `assets/`.
- Com `assets/` vazio ou incompleto, o app compila e exibe placeholders aceitáveis — sem links quebrados nem imports falhando.
- Variante ícone (quadrada) e wordmark (retangular) usadas nos contextos adequados.
- `BrandMark` expõe API clara (`variant`, `size`) documentada brevemente no código ou PR.
- Build do client (`npm run build`) passa nos dois cenários (com e sem assets — testar localmente removendo/renomeando temporariamente).
- README ou comentário em `assets/` (`.gitkeep` + README curto) documenta nomes e formatos esperados para quem for subir os arquivos.

**Restrições:**
- Não modificar artwork em `assets/` além de referenciar no código.
- Não redesenhar telas de autenticação ou bootstrap além do necessário para acomodar as logos.
- Não incluir logos em telas autenticadas (grupos, caixinhas, sorteio) nesta tarefa — apenas pontos previstos na spec de identidade (splash/bootstrap, auth; onboarding opcional se trivial).

---

## Centralizar wordmark no topo da tela de autenticação

### Descrição

A tela de autenticação (`AuthPage`) hoje exibe `BrandMark` no header em layout flex com o botão de ajuda à direita — ícone quadrado à esquerda, sem hierarquia de marca no topo. A spec prevê wordmark em cabeçalhos de autenticação (@ref:pt-br-experience-and-identity), e a tarefa “Integrar logos oficiais no aplicativo” introduz a variante retangular `logo-wordmark` via `BrandMark`.

Após os assets (ou placeholder de wordmark) estarem disponíveis, a autenticação deve apresentar a **logo em texto centralizada e ancorada no topo** da tela, acima das abas e dos campos de login — hierarquia visual:

```
        [wordmark Intensity]

      (abas: Experiences / …)

        (painel com campos)
```

O objetivo é reforçar a marca na primeira impressão sem competir com os formulários, mantendo o botão de guia rápido acessível sem deslocar o wordmark do centro.

### Prompt IA

**Pré-requisito:** tarefa “Integrar logos oficiais no aplicativo” concluída ou `BrandMark` com variante `wordmark` funcional (asset real ou placeholder).

Reestruture o layout de `AuthPage` para exibir o wordmark retangular **centralizado no topo**, ancorado abaixo da safe area.

**Arquivos prováveis:**
- `client/src/presentation/auth/AuthPage.tsx`
- `client/src/presentation/auth/AuthPage.module.css`
- `client/src/presentation/components/BrandMark.tsx` — usar `variant="wordmark"` e tamanho adequado (ex.: `lg` ou prop dedicada `auth`).

**Layout esperado:**
- **Topo da tela:** faixa de marca com wordmark **horizontalmente centralizado** (`logo-wordmark` de `assets/` quando existir).
- **Abaixo:** navegação por abas (Experiences, Experience Box, Cadastro, Código convite) — inalterada em comportamento.
- **Abaixo:** painel ativo com títulos de modo, campos e botões de submit.
- Respeitar `safe-area-inset-top` em dispositivos com notch.

**Botão de ajuda (guia rápido):**
- Reposicionar para **não quebrar a centralização** do wordmark — padrão sugerido: canto superior direito em posição absoluta/fixa na faixa do topo, ou ícone flutuante discreto; o wordmark permanece no eixo central da tela.
- Manter `aria-label` e comportamento de abrir `QuickGuideOverlay`.

**Regras visuais (@ref:pt-br-design-system):**
- Wordmark com largura máxima responsiva (ex.: `min(70vw, 240px)`) para não estourar em mobile estreito; altura automática preservando proporção do asset.
- Espaçamento generoso entre wordmark → abas → painel (respiro do design system).
- Não duplicar título “Intensity” em texto se o wordmark já for legível; títulos `h1` dentro de cada painel continuam sendo os rótulos de modo (Experiences, etc.), não o logotipo.
- Se apenas placeholder existir, layout idêntico — pronto para substituir pelo asset final sem novo refactor.

**Regras arquiteturais:**
- Escopo limitado à autenticação; bootstrap/splash seguem a tarefa de logos (ícone ou wordmark conforme definido lá).
- Não alterar fluxos de login, registro, convite nem `returnTo`.
- Não redesenhar abas ou painéis de modo além do necessário para acomodar o novo topo.

**Critérios de aceitação:**
- Wordmark visível, centralizado no topo, em todos os quatro painéis da auth.
- Abas e formulários aparecem abaixo da marca, com hierarquia clara.
- Botão de ajuda permanece utilizável e não empurra o wordmark para o lado.
- Layout correto em viewport mobile (320px+) e com safe area.
- Com asset em `assets/logo-wordmark.*`, exibe a imagem; com placeholder, mantém estrutura equivalente.
- Build do client passa; sem regressão de acessibilidade (foco, contraste, leitor de tela no botão de ajuda).

**Restrições:**
- Não criar nem editar arquivos de logo — consumir `BrandMark` / assets da tarefa de integração.
- Não implementar nesta tarefa a diferenciação visual Experiences vs Experience Box (tarefa separada no backlog).

---

## Diferenciar sessão individual e sessão em grupo na interface

### Descrição

Hoje os modos **Experiences** e **Experience Box** são funcionalmente distintos, mas a interface não comunica com clareza a metáfora que o usuário naturalmente espera: Experiences como a sessão pessoal (equivalente a "estar logado na sua conta") e Experience Box como a sessão conjunta para jogar/sortear (equivalente a "estar na sala com outras pessoas"). As abas de autenticação mostram nomes técnicos em inglês sem hierarquia título/subtítulo, e as telas autenticadas exibem apenas um rótulo genérico (`session.experiencesMode` / `session.experienceBoxMode`).

A spec em @ref:pt-br-experience-and-identity já prevê acentos visuais distintos por modo (turquesa/roxo vs coral) e clareza de modo como princípio de UX. Esta tarefa traduz isso em linguagem visual predominante — pouco texto, hierarquia clara — reforçando onde o usuário está sem renomear entidades de domínio no código.

A sessão Experiences deve parecer um espaço de perfil individual: contribuição na conta, registro de experiências. A sessão Experience Box deve parecer uma sala compartilhada: presença das pessoas logadas, clima de ritual em grupo. As duas telas de login na autenticação também devem ficar visualmente mais distantes entre si.

### Prompt IA

Redesenhe a comunicação visual dos dois modos de sessão no client, seguindo `docs/pt-br/solution-specification/design-system.md` (acentos por modo) e `docs/pt-br/solution-specification/experience-and-identity.md` (painéis de autenticação, terminologia canônica).

**Escopo de telas:**
- Autenticação: painéis Experiences e Experience Box em `client/src/presentation/auth/AuthPage.tsx` (+ CSS module).
- Sessão Experiences: `GroupSelectionPage`, `BoxSelectionPage`, `ExperienceListPage` — chrome de cabeçalho/contexto.
- Sessão Experience Box: `BoxHomePage`, `SharedMomentPage` — chrome de cabeçalho/contexto com ênfase em quem está na sala.

**Direção de copy (i18n en, pt-BR, it) — título + subtítulo curto, sem poluição:**

| Contexto | Título sugerido | Subtítulo sugerido |
|----------|-----------------|-------------------|
| Login Experiences | Login / Experiences | Crie experiências individualmente |
| Login Experience Box | Jogar / Experience Box | Sorteie caixas de experiências |

Adapte equivalentes naturais em inglês e italiano; mantenha "Intensity", "Experiences" e "Experience Box" como nomes de produto onde já usados.

**Direção visual (implementação a seu critério, boa UX):**
- **Experiences:** paleta turquesa/roxo, ícones de perfil/conta, sensação de espaço pessoal; mostrar nome de exibição do participante logado de forma proeminente.
- **Experience Box:** paleta coral, ícones de grupo/pessoas; listar nomes dos membros da sessão conjunta (`session.members` quando disponível).
- Autenticação: os dois painéis de login devem ser imediatamente distinguíveis (cor de painel, ilustração mínima ou ícone grande, não só texto).
- Evitar parágrafos longos; preferir hierarquia tipográfica e cor.

**Regras arquiteturais:**
- Alterar apenas apresentação e strings i18n; não mudar `accessMode`, rotas, guards nem contratos de API.
- Extrair componente compartilhado de "session chrome" ou "mode header" se reduzir duplicação entre as telas listadas — sem over-engineering.
- Respeitar tokens do design system (`--teal`, `--purple`, `--coral`, etc.).
- Manter acessibilidade: contraste AA, rótulos para leitores de tela nos cabeçalhos de modo.

**Critérios de aceitação:**
- Usuário distingue Experiences vs Experience Box na auth sem ler texto longo.
- Telas autenticadas de cada modo têm identidade visual coerente e consistente entre si.
- Modo Experiences exibe contexto de usuário individual; modo Experience Box exibe quem está na sessão conjunta.
- Três locales atualizados com paridade estrutural.
- Nenhuma mudança de comportamento de negócio (login, logout, navegação).

**Restrições:**
- Não adicionar criação de caixinhas no modo Experiences nesta tarefa.
- Não refazer a tela de criação de caixinhas nesta tarefa.

---

## Representar parâmetros com estrelas na criação e na carta de sorteio

### Descrição

Esforço, abertura e novidade são registrados em escala 1–5 no assistente de criação e exibidos na capa da carta antes da revelação no momento compartilhado (@ref:pt-br-data-model, @ref:pt-br-functional-components). A spec funcional já descreve a etapa de parâmetros como avaliação em estrelas (1–5 cada), mas a implementação atual usa botões numerados (`RatingScale`) na criação e chips com bolinha colorida + número (`ParameterRow`) na carta de sorteio — pouco legível em grupo e distante da metáfora de “tempero” da experiência.

Esta tarefa substitui essa apresentação por **estrelas clicáveis** na criação (etapa 3 do assistente) e **estrelas preenchidas centralizadas** na capa do sorteio, mantendo as cores canônicas de cada parâmetro (esforço teal, abertura amarelo, novidade roxo) e acrescentando um **ícone distinto por parâmetro** para reforço visual além da cor — alinhado à heurística do design system de categorizar com símbolo, não só texto (@ref:pt-br-design-system). Ao selecionar estrelas na criação, um texto auxiliar aparece abaixo explicando o que significa aquele nível para o parâmetro — copy gerada pelo agente com base nos princípios do produto (prontidão, consentimento, calor afetivo), não apenas números.

O valor entregue é alinhar UI à intenção de produto: o grupo identifica cada dimensão (esforço, abertura, novidade) por cor **e** ícone, lê as estrelas de relance na carta antes de revelar, e quem contribui entende o que está classificando sem decifrar números ou bolinhas.

### Prompt IA

Substitua a UI de parâmetros (esforço, abertura, novidade) por estrelas na criação de experiências e na capa da carta de sorteio.

**Contexto de domínio:**
- Três parâmetros, cada um com valor inteiro 1–5: `effort`, `openness`, `novelty` (`client/src/domain/experience/experienceTypes.ts`, `intensityTokens.ts`).
- Cores: `--param-effort`, `--param-openness`, `--param-novelty` em `global.css`; `PARAMETER_COLORS` no domínio.
- **Ícones:** cada parâmetro tem um ícone fixo e semântico, centralizado num módulo de apresentação (ex.: `parameterVisuals.ts`, espelhando `boxVisuals.ts`) com `LucideIcon` por `ParameterKey` (`effort`, `openness`, `novelty`). Escolher ícones que comuniquem o significado do modelo de dados (@ref:pt-br-data-model): esforço = exigência física/prática; abertura = exposição/sinceridade gentil; novidade = distância do hábito do grupo. Exemplos plausíveis (ajustar na implementação): `Flame` ou `Dumbbell` para esforço, `Heart` ou `MessageCircleHeart` para abertura, `Sparkles` ou `Compass` para novidade — manter estilo flat cartoon e traço consistente com o restante do app.
- Intensidade geral (etapa 4) permanece separada — **não** converter intensidade para estrelas nesta tarefa; só os três parâmetros.
- `suggestIntensity(parameters)` e validação existentes devem continuar funcionando (valores 1–5).

**Arquivos prováveis:**
- `client/src/presentation/experiences/CreationAssistant.tsx` — etapa 3 (parâmetros).
- `client/src/presentation/components/RatingScale.tsx` — refatorar ou extrair componente de estrelas reutilizável (`StarRating` / `ParameterStarPicker`).
- Novo módulo de ícones de parâmetro (ex.: `parameterVisuals.ts`) — mapa `ParameterKey` → `LucideIcon` + cor.
- `client/src/presentation/components/ParameterRow.tsx` — substituir layout de chips por coluna centralizada na carta.
- `client/src/presentation/components/ExperienceSummaryMeta.tsx` — capa do sorteio (`DrawResultCard`).
- `client/src/presentation/experiences/ExperienceListPage.tsx` — cartas de lista (autor vê parâmetros; outros veem prévia) — alinhar exibição compacta a estrelas se `ParameterRow` for reutilizado.
- i18n: `client/src/i18n/locales/{en,pt-BR,it}.json` — rótulos e **textos auxiliares por parâmetro e nível**.

**Comportamento na criação (etapa Parâmetros):**
- Para cada parâmetro: **ícone** na cor do parâmetro + título centralizado (Esforço / Abertura / Novidade), fileira de **5 estrelas clicáveis** abaixo.
- Hierarquia sugerida: ícone → título → estrelas → texto auxiliar. Ícone decorativo com `aria-hidden="true"`; significado carregado pelo rótulo textual e hint.
- Estrelas preenchidas até o valor selecionado, na **cor do parâmetro**; vazias com contorno ou opacidade reduzida.
- Ao clicar na estrela N, valor do parâmetro = N; atualizar intensidade sugerida como hoje (`applySuggestedIntensity`).
- **Texto auxiliar** abaixo da fileira, visível após seleção (ou atualizado ao mudar): explica em linguagem calorosa o que significa aquele nível.
  - Exemplo pt-BR esforço 1 estrela: *"Dá para fazer no dia a dia, sem planejamento especial."*
  - Cobrir **15 combinações** (3 parâmetros × 5 níveis) por locale; tom alinhado a @ref:pt-br-principles-why-it-works-this-way e perguntas do modelo de dados (@ref:pt-br-data-model — esforço exigente, exposição/sinceridade, novidade vs hábito do grupo).
- Layout vertical claro entre os três parâmetros; evitar poluição — hierarquia ícone → título → estrelas → hint.

**Comportamento na carta de sorteio (capa, antes da revelação):**
- Substituir chips horizontais por blocos **centralizados** empilhados:

```
      [ícone esforço]
        Esforço
      ★★★★★
     [ícone abertura]
       Abertura
        ★★★★
     [ícone novidade]
       Novidade
          ★★
```

- Ícone do parâmetro acima do título (ou ícone + título na mesma linha, centralizados), na **cor canônica** do parâmetro; título centralizado; fileira de estrelas centralizada abaixo; quantidade = valor armazenado (1–5).
- Estrelas na **cor do parâmetro** (preenchidas); sem números adjacentes.
- Manter `IntensityBadge` e selo na capa como hoje (`ExperienceSummaryMeta`); só mudar a área de parâmetros.
- Modo `compact` da meta deve continuar legível em mobile (cartas pequenas).

**Acessibilidade:**
- Grupo de estrelas com `role="group"` e rótulo acessível (ex.: "Esforço, 3 de 5 estrelas").
- Ícones decorativos: `aria-hidden="true"`; não depender só de cor/ícone para transmitir significado — rótulo textual sempre presente.
- Estrelas interativas: foco visível, `aria-pressed` ou equivalente por estrela clicável.
- Exibição somente leitura na carta de sorteio: `aria-label` descrevendo valor sem depender só de cor ou ícone.

**Regras arquiteturais:**
- Não alterar contrato de API nem schema de experiência — continua 1–5 inteiros por parâmetro.
- Reutilizar tokens de cor existentes; ícones herdam a cor do parâmetro via CSS (`currentColor` ou token `--param-*`).
- Mapa ícone + cor por `ParameterKey` em um único módulo reutilizado na criação, carta de sorteio e lista compacta — não duplicar escolha de ícone por tela.
- Usar `lucide-react`, como em `boxVisuals.ts` e demais componentes.
- Componente de estrelas compartilhado entre criação (interativo) e carta (somente leitura) via prop `readOnly` / `value`.
- Intensidade na etapa 4 e filtros do sorteio (`SharedMomentPage`) podem manter `RatingScale` numérico — fora do escopo salvo ajuste mínimo de consistência visual.
- Três locales com paridade estrutural nas chaves de hint.

**Sugestão de chaves i18n (ajustar se necessário):**
- `parameters.effort.hints.1` … `parameters.effort.hints.5`
- `parameters.openness.hints.1` … `parameters.openness.hints.5`
- `parameters.novelty.hints.1` … `parameters.novelty.hints.5`

**Critérios de aceitação:**
- Etapa 3 do assistente usa ícone + estrelas coloridas para os três parâmetros, com texto auxiliar ao selecionar.
- Capa da carta no momento compartilhado mostra parâmetros em coluna centralizada com ícone, título e estrelas coloridas (sem bolinha+número).
- Os três parâmetros são distinguíveis por cor **e** ícone em criação, sorteio e lista compacta.
- Valores salvos e sorteio/filtros continuam corretos; testes de `validateExperienceParameters` e `suggestIntensity` passam.
- Lista de experiências (modo Experiences) reflete estrelas nos metadados visíveis ao autor/prévia.
- Copy auxiliar existe e faz sentido em pt-BR, en e it para todos os níveis.
- Layout legível em viewport mobile estreita (celular compartilhado no Experience Box).

**Restrições:**
- Não redesenhar a carta completa, animação de flip ou ritual de revelação.
- Não alterar classificação de intensidade geral (etapa 4) para estrelas.
- Não mudar regras de negócio de filtros de sorteio.

---

## Refazer tela de criação de caixinhas

### Descrição

A sub-tela de criação de caixinhas (`CreateBoxPage`, rota `/box-home/create`) está funcionalmente mínima e visualmente deficiente: grade de tipos com scroll truncado, seleção por radio escondido, hierarquia fraca entre nome e catálogo de tipos, e desalinhamento com o design system (cartões colecionáveis, badges de categoria, grade de duas colunas descrita em @ref:pt-br-functional-components e @ref:pt-br-design-system).

Esta tarefa entrega um remake completo da experiência de criação, tratando-a como componente reutilizável que servirá tanto ao modo Experience Box quanto, numa tarefa posterior, ao modo Experiences. O foco é UX/UI e clareza do ritual de escolha do tipo temático — não expandir ainda para convite de participantes específicos.

### Prompt IA

Refaça completamente a tela de criação de caixinhas no client.

**Arquivos prováveis:**
- `client/src/presentation/box-home/CreateBoxPage.tsx`
- `client/src/presentation/box-home/CreateBoxPage.module.css`
- `client/src/presentation/components/boxVisuals.ts` (ou equivalente)
- `client/src/domain/box/boxTypes.ts`, `CreateBoxUseCase`
- i18n: `createBox.*`, `boxTypes.*`

**Referências de produto:**
- `docs/pt-br/solution-specification/functional-components.md` — tela 12, apresentação de tipos em grade 2 colunas com badge, título e dica.
- `docs/pt-br/solution-specification/design-system.md` — cartões colecionáveis, cores por categoria de caixinha, heurísticas flat cartoon.

**Requisitos funcionais (preservar):**
- Campos: nome da caixinha (máx. 80 caracteres) e tipo (`BOX_TYPES` / `DEFAULT_BOX_TYPE`).
- Submissão via `CreateBoxUseCase` com `groupId` e token da sessão atual.
- Navegação de volta e redirecionamento pós-sucesso conforme contexto de chamada (ver props/callback abaixo).

**Requisitos de UX/UI:**
- Layout que não dependa de scroll apertado para ver os 11 tipos; considerar seções visuais ou progressão nome → tipo sem sensação de formulário quebrado.
- Cartões de tipo selecionáveis com feedback claro (cor sólida, ícone, título, subtítulo) alinhados ao design system.
- Estados de carregamento, erro e botão desabilitado quando nome vazio.
- Preparar o componente para reuso: aceitar props como `onSuccess`, `cancelPath` ou `variant: 'experienceBox' | 'experiences'` para estilização leve futura, sem implementar ainda o fluxo Experiences.

**Regras arquiteturais:**
- Manter rota atual `/box-home/create` funcionando para o modo Experience Box.
- Lógica de API permanece em `CreateBoxUseCase`; página só orquestra.
- Seguir padrões de `Button`, tokens CSS e tipografia do projeto.

**Critérios de aceitação:**
- Tela utilizável em viewport mobile sem elementos cortados ou ilegíveis.
- Todos os 11 tipos visíveis e selecionáveis com boa affordance.
- Criação bem-sucedida no modo Experience Box inalterada do ponto de vista da API.
- Componente/documentação mínima no código permitindo reutilizar a mesma UI em outra rota na tarefa seguinte.
- Strings i18n revisadas se necessário; três idiomas em paridade.

**Restrições:**
- Não adicionar rota de criação no modo Experiences nesta tarefa.
- Não implementar seleção de convidados nesta tarefa.

---

## Funcionalidades Principais

Expansão de criação de caixinhas, sugestões, ritual de sorteio e segurança da sessão em grupo.

## Permitir criar caixinhas no modo Experiences

### Descrição

Hoje só é possível criar caixinhas após login conjunto no **Experience Box** (`/box-home/create`). No modo **Experiences**, a seleção de caixinhas (`BoxSelectionPage`) exibe estado vazio orientando o usuário a criar no outro modo — o que impede quem está na sessão individual de montar uma caixinha e convidar pessoas seletivamente.

O comportamento desejado diferencia os dois contextos: em **Experiences**, o usuário cria a caixinha na sua sessão pessoal e adiciona/convida as pessoas que quiser; em **Experience Box**, a caixinha é criada para todas as pessoas já logadas na sessão conjunta. A API de criação (`CreateBoxUseCase`, `POST` com `groupId`) já existe; o gap é de produto e fluxo no client — rota, empty states, convite pós-criação e copy alinhada à identidade visual definida nas tarefas anteriores.

Esta tarefa depende da tela de criação refeita (componente compartilhado) e da diferenciação visual dos modos para não confundir o usuário sobre em qual sessão ele está agindo.

### Prompt IA

**Pré-requisitos:** tarefas "Refazer tela de criação de caixinhas" e "Diferenciar sessão individual e sessão em grupo na interface" concluídas (ou PRs mergeados com componente reutilizável e chrome de modo Experiences).

Habilite criação de caixinhas no fluxo Experiences com convite seletivo de participantes, contrastando com o fluxo Experience Box existente.

**Arquivos e módulos prováveis:**
- `client/src/presentation/boxes/BoxSelectionPage.tsx`
- `client/src/app/routes.tsx` (nova rota sob `RequireExperiencesSessionRoute`, ex. `/groups/:groupId/boxes/create`)
- Componente de criação refatorado (de `CreateBoxPage`)
- `client/src/presentation/invite/ShareInviteSheet.tsx`, `CreateInviteUseCase`
- `client/src/domain/box/boxUseCases.ts`
- i18n: `boxes.empty`, textos de CTA e pós-criação

**Comportamento Experiences (novo):**
1. Na seleção de caixinhas de um grupo, usuário autenticado em Experiences vê ação para criar caixinha (não apenas empty state passivo).
2. Fluxo de criação reutiliza a UI refeita; `groupId` vem do parâmetro de rota/navegação do grupo ativo.
3. Após criar, oferecer convidar pessoas ao grupo (folha de compartilhamento existente ou fluxo equivalente) — o usuário escolhe com quem compartilhar o convite; não assume todos os membros automaticamente.
4. Retorno natural à listagem de caixinhas do grupo com a nova caixinha visível.

**Comportamento Experience Box (preservar):**
- Criação em `/box-home/create` continua valendo para o grupo da sessão conjunta; caixinha disponível para todos os membros já autenticados na sala, sem etapa extra de convite obrigatório na criação.

**Regras arquiteturais:**
- Reutilizar `CreateBoxUseCase` e endpoints existentes; só introduzir API nova se a spec ou OpenAPI exigir convite por caixinha (hoje convite é por grupo — confirmar em `openapi/openapi.yaml` e `functional-components.md`).
- Guards: rota de criação Experiences apenas com `accessMode === 'EXPERIENCES'` e `groupId` válido.
- Alinhar empty state de `BoxSelectionPage` ao novo comportamento (remover mensagem que manda ir ao Experience Box).
- Manter coerência com fluxo de convite corrigido na tarefa de aceite pós-autenticação.

**Critérios de aceitação:**
- Usuário em Experiences cria caixinha dentro de um grupo escolhido.
- Após criar, pode gerar/compartilhar convite do grupo sem passar pelo modo Experience Box.
- Usuário em Experience Box cria caixinha como hoje, para o grupo da sessão conjunta.
- Empty states e CTAs refletem a diferença entre os modos.
- Testes ou cobertura manual documentada nos critérios do PR para ambos os caminhos.
- Sem regressão em listagem, exclusão e momento compartilhado no Experience Box.

**Restrições:**
- Não refazer novamente o layout da tela de criação — consumir o componente da tarefa anterior.
- Não alterar identidade visual global dos modos além de ajustes pontuais de CTA nesta tela.

---

## Implementar banco centralizado de sugestões de experiências

### Descrição

As sugestões são parte central do produto: funcionam como tutorial implícito sobre o tipo de ideia que o grupo deve criar (@ref:pt-br-functional-components, @ref:pt-br-data-model). Cada uma dos **11 tipos temáticos de caixinha** (Saídas com amigos, Saídas em casal, Viagens em casal, Íntimo em casal, Viagens com amigos, Experiências com amigos, Sair da rotina, Primeiras vezes, Desconforto leve, Momentos de conexão, Experiências diferentes — ver `BOX_TYPES` em `boxTypes.ts`) possui o seu **pacote de sugestões**: o banco é organizado **primeiro por tipo de caixinha**, depois por intensidade. A spec prevê **165 exemplos embutidos no client** (11 tipos × 5 níveis × 3 cada), com texto canônico em português e variantes localizadas. Hoje existe apenas um esqueleto em `client/src/content/suggestion-packs/` que já recebe `boxType` mas gera placeholders genéricos do tipo “Saídas com amigos — ideia 7”, sem descrição real, reflexão, parâmetros nem intensidade.

Esta tarefa implementa a **infraestrutura e os fluxos de uso** do banco — não a redação final das 165 ideias, que o time de produto preencherá depois. O repositório deve sair com estrutura de dados completa classificada por `BoxType`, conteúdo seed mínimo (placeholders estruturados por tipo) e dois pontos de consumo — **ambos filtrados pelo tipo de caixinha relevante**: (1) **assistente de criação** (etapa Sugestão), usando o tipo da caixinha ativa em que o usuário está contribuindo; (2) **criação de caixinha**, usando o tipo que o usuário está escolhendo no formulário (a lista de sugestões reage quando o tipo muda).

Isso estende o comportamento descrito na spec para o caminho explícito de “preencher caixinha com ideias padrão” — experiências só entram na caixinha quando o usuário as seleciona e confirma a criação, não por cópia silenciosa.

### Prompt IA

Implemente o banco centralizado de sugestões de experiências no client e integre-o na criação de experiências e na criação de caixinhas.

**Contexto de produto e arquitetura:**
- Sugestões são **conteúdo embutido no client** — sem CMS nem API de sugestões (@ref:pt-br-artifacts).
- **Classificação por tipo de caixinha é obrigatória:** toda sugestão pertence a exatamente um `BoxType`. Não existe pool global de sugestões misturando tipos — Saídas em casal só mostra ideias do pacote de casal, Sair da rotina só do pacote correspondente, etc.
- Cada sugestão deve carregar os mesmos campos de uma experiência: `description`, `reflection`, `intensity` (1–5), `parameters` (`effort`, `openness`, `novelty`).
- Cardinalidade alvo: **165 entradas** (11 tipos × 5 intensidades × 3 sugestões por nível), **15 sugestões por tipo**. Enquanto o produto não fornecer o copy final, usar placeholders estruturados identificáveis por tipo (ex.: “[placeholder] Saídas em casal — nível 3 — ideia 2”) substituíveis em massa depois sem mudar código de consumo.
- Texto canônico em **português**; suportar **en** e **it** via i18n ou arquivos paralelos, seguindo padrão do projeto.

**1. Banco centralizado**

Substituir/expandir `client/src/content/suggestion-packs/` com modelo explícito, por exemplo:

```ts
interface ExperienceSuggestion {
  id: string;           // estável, ex.: "SAIDAS_COM_AMIGOS-3-02"
  boxType: BoxType;
  intensity: 1 | 2 | 3 | 4 | 5;
  description: string;
  reflection: string;
  parameters: ExperienceParameters;
}
```

Expor funções de consulta no domínio ou camada de conteúdo, por exemplo:
- `listSuggestions(locale, boxType, intensity?)` — **obrigatório** receber `boxType`; retorna apenas sugestões daquele pacote, opcionalmente filtradas por intensidade.
- `getSuggestionById(locale, id)`.
- `pickRandomSuggestion(locale, boxType, intensity)` — pool restrito ao `boxType` informado.
- `countSuggestions(boxType?)` — total geral (165) ou por tipo (15 cada); testes de regressão.

Organização sugerida: **um arquivo ou módulo por `boxType`** (ex.: `suggestion-packs/saidas-com-amigos.ts`) ou pasta `by-type/{BOX_TYPE}/` — facilita o produto preencher e revisar pacotes temáticos separadamente. O `id` estável deve codificar o tipo (ex.: `SAIDAS_EM_CASAL-3-02`).

**2. Assistente de criação — etapa Sugestão**

Arquivos: `CreationAssistant.tsx`, novo componente de UI (ex.: `SuggestionExplorer`).

Substituir a grade de chips atuais por um **explorador de sugestão única**:
- **Fonte do `boxType`:** tipo da caixinha ativa no contexto de navegação (`navigation.boxType` / caixinha aberta na lista de experiências). Se ausente, usar `DEFAULT_BOX_TYPE` ou bloquear explorador com mensagem clara — documentar escolha no PR.
- Exibir **indicador visual do tipo** (título do `boxTypes.*` ou ícone de `boxVisuals`) para o usuário entender qual pacote está vendo.
- Exibe **uma** sugestão por vez (descrição legível; pode mostrar intensidade/parâmetros de forma compacta).
- Controle de **filtro de intensidade** (1–5 estrelas ou equivalente) — **padrão: nível 1**, para não assustar iniciantes com ideias muito ousadas ao sortear inspiração.
- Ação principal de **“outra sugestão”** (um toque troca por outra aleatória **somente** do pacote do `boxType` ativo + intensidade selecionada).
- Ação **“usar esta ideia”** preenche o assistente:
  - Mínimo: campo **descrição** (comportamento atual).
  - Recomendado: também pré-preencher **reflexão**, **parâmetros** e **intensidade** da sugestão nas etapas seguintes, permitindo edição — o usuário ajusta antes de salvar.
- O usuário ainda pode digitar descrição manualmente sem usar sugestão.

**3. Criação de caixinha — preenchimento opcional**

Integrar nos fluxos de criação de caixinha:
- `client/src/presentation/box-home/CreateBoxPage.tsx` (Experience Box).
- Rota de criação no modo Experiences, quando existir (tarefa “Permitir criar caixinhas no modo Experiences”) — se ainda não mergeada, deixar hook/props prontos no componente compartilhado de criação.

Comportamento:
- Flag/checkbox: **“Preencher com ideias padrão”** (copy i18n clara — popular a caixinha com experiências prontas para sorteio).
- **Fonte do `boxType`:** tipo selecionado no seletor de tipo da caixinha (`BOX_TYPES` / rádio do formulário). Quando o usuário **muda o tipo**, a lista de sugestões e as seleções marcadas devem **atualizar** para o pacote do novo tipo (limpar checks de outro tipo para evitar persistir ideias incompatíveis).
- Antes de um tipo estar selecionado: desabilitar flag/lista ou mostrar dica “Escolha um tipo de caixinha”.
- Ao ativar: lista **com scroll e checkboxes** apenas das sugestões do `boxType` atual (agrupar por intensidade opcional; mostrar descrição resumida + intensidade).
- Usuário marca quais quer incluir; nenhuma vem pré-marcada por padrão (ou documentar escolha no PR se marcar todas for melhor UX — preferir **nenhuma** pré-marcada para consentimento explícito).
- No submit: (1) criar caixinha via `CreateBoxUseCase`; (2) para cada sugestão marcada, criar experiência real via `CreateExperienceUseCase` com metadados da sugestão, **autoria do participante logado**.
- Tratar erro parcial (caixinha criada mas alguma experiência falhou) com mensagem recuperável.
- Se a flag estiver desligada, comportamento atual inalterado.

**Regras arquiteturais:**
- Clean Architecture: consultas ao banco em camada de conteúdo/domínio; páginas só orquestram.
- Não criar endpoint REST novo para sugestões.
- Validação de parâmetros/intensidade ao persistir experiências pré-definidas — mesmas regras do assistente.
- Manter `countSuggestionPack` / testes atualizados; adicionar testes para filtro, random pick e mapeamento por `boxType`.
- i18n: chaves para UI do explorador, flag da caixinha e labels da lista; conteúdo das sugestões em estrutura substituível.

**Relação com outras tarefas do backlog:**
- “Refazer tela de criação de caixinhas” — integrar a flag/lista no componente refeito se já existir; senão implementar na `CreateBoxPage` atual e migrar depois.
- “Representar parâmetros com estrelas” — explorador e lista podem usar badges/estrelas se já mergeado; senão exibir intensidade de forma simples sem bloquear esta tarefa.

**Critérios de aceitação:**
- Existe banco versionado com 165 entradas estruturadas (copy placeholder aceitável), **15 por cada um dos 11 `BoxType`**.
- API de consulta retorna sugestões corretas por `boxType` e intensidade; nunca mistura tipos no mesmo resultado.
- Assistente de criação mostra apenas sugestões do tipo da caixinha em que o usuário está contribuindo.
- Criação de caixinha lista e persiste apenas sugestões do tipo selecionado no formulário; troca de tipo atualiza a lista.
- Etapa 1 do assistente usa explorador com filtro de intensidade (default 1), troca aleatória e preenchimento do fluxo ao aceitar sugestão.
- Criação de caixinha permite opt-in por checkbox e persiste experiências selecionadas na caixinha nova.
- Experiências pré-adicionadas participam do sorteio como qualquer outra.
- Testes unitários cobrem contagem, filtro e pick aleatório.
- Três locales com paridade de chaves de UI; conteúdo canônico pt-BR com caminho claro para tradução.

**Restrições:**
- **Não** inventar as 165 redações finais de produto — usar placeholders substituíveis ou amostra mínima documentada.
- **Não** construir CMS, painel admin nem sync servidor para sugestões.
- **Não** alterar regras de visibilidade ou selo além do fluxo normal de `CreateExperienceUseCase`.
- **Não** mudar o ritual de sorteio/revelação nesta tarefa.

---

## Ocultar autoria na revelação do sorteio

### Descrição

No momento compartilhado (sorteio e revelação), após virar a carta o app exibe hoje o nome de quem criou a experiência — via `DrawResultCard` com `showAuthor` em `ExperienceContentBlock` (`sharedMoment.byAuthor`). A documentação funcional descreve o estado revelado como descrição completa, reflexão e nome do autor (@ref:pt-br-functional-components, @ref:pt-br-experience-and-identity).

O produto quer **anonimato no ritual**: o grupo não deve ver quem propôs a ideia sorteada, mesmo que às vezes fique implícito pelo estilo do texto. A autoria continua existindo no backend (edição/exclusão só pelo autor, lista no modo Experiences com regras de visibilidade atuais) — apenas a **face revelada da carta de sorteio** deixa de expor o proponente.

### Prompt IA

Remova a exibição do autor na carta de sorteio após a revelação.

**Arquivos prováveis:**
- `client/src/presentation/shared-moment/DrawResultCard.tsx` — remover `showAuthor` na face revelada.
- `client/src/presentation/components/ExperienceContentBlock.tsx` — remover prop `showAuthor` e bloco de autor se não houver outros usos.
- `client/src/i18n/locales/{en,pt-BR,it}.json` — remover chave `sharedMoment.byAuthor` se ficar órfã.
- `client/src/presentation/components/ExperienceContentBlock.module.css` — remover estilos `.author` não usados.

**Comportamento esperado:**
- Capa da carta (antes da revelação): inalterada — intensidade, parâmetros, selo; sem autor.
- Face revelada (após virar): **descrição** e **reflexão** apenas; sem linha “Por [nome]”.
- Modo Experiences (`ExperienceListPage`, `ExperienceCard`): **não alterar** — autor continua visível onde a spec de lista exige (itens próprios vs resumo de outros).
- API: sem mudança obrigatória; `authorId` permanece para permissões. Opcional: não é necessário ocultar no payload só para esta tarefa.

**Documentação (ajuste mínimo):**
- Atualizar menções ao nome do autor no estado revelado do sorteio em `docs/pt-br/solution-specification/functional-components.md`, `experience-and-identity.md` e equivalentes `en`/`it` — face da carta: descrição + reflexão, sem proponente.

**Critérios de aceitação:**
- Revelar carta no `SharedMomentPage` não mostra nome de exibição do autor.
- Descrição e reflexão continuam visíveis após revelação.
- Lista de experiências no modo Experiences mantém comportamento atual de autoria.
- Nenhuma chave i18n órfã; build e testes do client passam.

**Restrições:**
- Não remover autoria do modelo de dados nem da API.
- Não alterar quem pode editar/excluir experiências.
- Não ocultar reflexão (pode conter pistas indiretas — fora do escopo).

---

## Limitar sessão do Experience Box por tempo e sorteios

### Descrição

No modo **Caixa de Experiências**, o grupo faz login conjunto num celular compartilhado para sortear e revelar experiências. Hoje o token JWT de sessão conjunta usa a mesma validade longa do login individual (**24 horas** em `application.yml`, `JwtService.createExperienceBoxToken`), e a sessão persiste em `Preferences` até logout manual. Não há limite de sorteios por sessão.

Isso permite que, após o ritual, o aparelho do host continue logado — alguém sozinho pode seguir sorteando e lendo experiências de todo o grupo, inclusive fora do contexto “estamos juntos agora”. A spec trata o login conjunto como definir **quem está presente nesta sessão** (@ref:pt-br-data-model), não uma autorização permanente no dispositivo.

Esta tarefa introduz **duas salvaguardas** só para `accessMode: EXPERIENCE_BOX`: (1) **validade curta** do token de sessão em grupo; (2) **contador de sorteios** por sessão — ao atingir o limite (ex.: 5 sorteios bem-sucedidos), logout automático. O login **Experiences** permanece com validade atual. O objetivo é reduzir o risco de sessão órfã no celular do host após a rodada de jogo.

### Prompt IA

Implemente expiração mais curta e limite de sorteios para a sessão conjunta do Experience Box.

**Contexto técnico atual:**
- API: `api/src/main/java/com/intensity/config/JwtService.java` — `createExperienceBoxToken` usa `properties.expirationSeconds()` (86400 por padrão).
- Client: sessão em `SessionPreferencesAdapter`; `LoginExperienceBoxUseCase` em `authUseCases.ts`; rotas protegidas por `RequireExperienceBoxSessionRoute`.
- Sorteio: `SharedMomentPage` → `ExecuteDrawUseCase` / `RevelationOrchestrator` — cada ativação bem-sucedida do sorteio seleciona uma experiência do pool.
- Login Experiences (`createExperiencesToken`) **não** deve encurtar TTL nesta tarefa.

**1. Validade curta do token de sessão em grupo (API)**

- Adicionar configuração separada para Experience Box, ex.: `intensity.jwt.experience-box-expiration-seconds` (valor inicial sugerido: **4 horas / 14400s** — ajustável; documentar no PR; bem menor que 24h).
- `JwtService.createExperienceBoxToken` usa essa propriedade; `createExperiencesToken` mantém `expirationSeconds` atual.
- Atualizar `application.yml`, `application-prod.yml`, `application-test.yml` conforme padrão do projeto.
- Atualizar `openapi/openapi.yaml` ou docs de engenharia **somente** se o contrato documentar TTL (opcional).
- Testes de integração em `AuthIntegrationTest` / `BoxIntegrationTest` se aplicável.

**2. Contador de sorteios por sessão (client)**

- Rastrear na sessão local do Experience Box (estender `SessionState` ou metadados em `Preferences` atrelados ao token/`groupId`):
  - `drawCount` — sorteios bem-sucedidos nesta sessão.
  - `sessionStartedAt` — timestamp do login conjunto (útil para UX e testes).
- Constante configurável no client, ex.: `EXPERIENCE_BOX_MAX_DRAWS = 5` (valor do exemplo do produto).
- **O que conta como sorteio:** cada execução bem-sucedida de `ExecuteDrawUseCase` que retorna experiência (toque em Sortear com pool não vazio e filtro satisfeito). **Não** contar: sorteio com caixinha vazia, filtro sem resultados, ou apenas revelar/voltar sem novo sorteio.
- Ao atingir o limite: **logout automático** (`LogoutUseCase` + limpar navegação), redirecionar para `/auth` com mensagem amigável (toast ou query state) explicando que a sessão conjunta encerrou após N sorteios.
- Bloquear novo sorteio se já no limite (defesa antes do logout).
- Novo login Experience Box **zera** o contador.

**3. UX e feedback**

- Indicador discreto no momento compartilhado (ex.: “Sorteios restantes: 2”) — copy i18n em `pt-BR`, `en`, `it`.
- Ao encerrar por limite: mensagem clara (“A sessão em grupo terminou. Entrem juntos de novo para continuar.”) — tom do @ref:pt-br-experience-and-identity.
- Token expirado pelo TTL: fluxo existente (`invalid` / `INVALID_TOKEN` → `/unknown-session` ou auth) deve continuar funcionando; alinhar mensagem se genérica demais.

**4. Onde aplicar checagens**

- Incrementar contador em `SharedMomentPage` (ou use case dedicado `ExperienceBoxSessionPolicy` / `RecordDrawUseCase`) após sorteio bem-sucedido.
- Verificar limite antes de sortear e ao restaurar app (`SessionProvider.refresh`) para sessões Experience Box já no teto.
- Não aplicar contador em modo Experiences nem em listagem/criação de experiências fora do ritual.

**Regras arquiteturais:**
- Defesa em camadas: TTL curto na API **e** contador no client (contador sozinho não basta se alguém reutilizar token via API; TTL ajuda).
- Clean Architecture no client: política de limite em domínio (`domain/session/` ou `domain/draw/`), não lógica espalhada só na página.
- Não persistir contador de sorteios no servidor — escopo de sessão efêmera no dispositivo compartilhado.
- Não alterar persistência de experiências, caixinhas ou resultados de sorteio (continuam só no client, não gravados).

**Critérios de aceitação:**
- Token Experience Box expira antes do token Experiences (configuração separada verificável).
- Após 5 sorteios bem-sucedidos (ou valor da constante), sessão Experience Box encerra automaticamente e usuário volta à autenticação.
- Sorteios falhos (caixinha vazia / filtro vazio) não incrementam contador.
- Novo login conjunto reinicia contador.
- Modo Experiences inalterado em TTL e sem limite de sorteios.
- UI mostra sorteios restantes durante o ritual (ou mensagem equivalente acessível).
- Testes unitários para política de contador; testes API ou client conforme padrão do repo.

**Restrições:**
- Não implementar “encerrar sessão remotamente” nem revogação de token server-side além do JWT expiry (fora do escopo).
- Não limitar criação de experiências ou navegação em box-home pelo contador — apenas o ato de **sortear** no momento compartilhado (salvo logout automático ao atingir limite, que expulsa de toda a sessão).
- Não mudar regras de membresia de grupo persistente.

---

## Melhorias de Interface

Polimento de navegação e chrome após os fluxos principais estarem estáveis.

## Melhorar botões de navegação secundária (Voltar, Sair e afins)

### Descrição

Ações de navegação e saída — **Voltar**, **Sair**, **Fechar** em overlays e ações terciárias similares — hoje usam quase sempre `Button` com variante `ghost`: fundo transparente e texto `--text-muted`, o que na prática parece **texto preto solto**, pouco alinhado ao clima flat cartoon do Intensity (@ref:pt-br-design-system). Além disso, o posicionamento varia entre telas: em algumas o Voltar e o Sair ficam empilhados no canto superior direito ao lado do título; em outras só o Sair aparece no header e o Voltar some; em `CreateBoxPage` o Voltar fica acima do título em coluna.

Isso prejudica escaneabilidade e consistência, especialmente em mobile compartilhado no Experience Box. O design system já define variantes de botão (primário coral, secundário com superfície, ghost discreto) e a heurística “ícone ou ilustração > texto cru”, mas as ações de chrome de tela não recebem tratamento dedicado.

Esta tarefa melhora o **visual** e o **reposicionamento** desses controles em um padrão único, lúdico e acessível — sem alterar fluxos de navegação nem a hierarquia das ações primárias de cada tela.

### Prompt IA

Padronize e redesenhe os botões de navegação secundária (Voltar, Sair, Fechar e equivalentes) no client.

**Problema atual (confirmar na análise):**
- `Button` variante `ghost` em `Button.module.css` — transparente, texto muted, sem affordance tátil.
- Headers inconsistentes entre `GroupSelectionPage`, `BoxSelectionPage`, `ExperienceListPage`, `BoxHomePage`, `SharedMomentPage`, `CreateBoxPage`, `CreationAssistant`, `InvitePreviewPage`, `AuthPage` (ajuda), `QuickGuideOverlay`, `ShareInviteSheet`.

**Direção visual (@ref:pt-br-design-system):**
- Manter flat cartoon: superfícies sólidas suaves, cantos arredondados (`--radius-button`), sombra leve onde fizer sentido.
- Preferir **ícone Lucide + rótulo curto** (ex.: `ArrowLeft` + “Voltar”, `LogOut` + “Sair”, `X` + “Fechar”) em vez de texto nu.
- Nova variante ou componente dedicado (ex.: `NavButton`, `IconButton`, `ScreenToolbar`) — evitar abusar de `ghost` cru; opções plausíveis:
  - Chip/superfície `--surface-sunken` ou `--surface` com padding e ícone.
  - Botão compacto circular ou pill para ícone-only em espaços apertados.
- Cores: neutras para Voltar/Fechar; Sair pode usar muted ou leve acento sem parecer destrutivo (logout ≠ excluir).
- Estados `:hover`, `:active` (scale), foco visível; alvo ≥ 48px.

**Padrão de posicionamento (aplicar de forma consistente):**

| Ação | Posição preferida | Notas |
|------|-------------------|--------|
| **Voltar** | Canto superior **esquerdo** | Leva à rota pai lógica da pilha |
| **Sair (logout)** | Canto superior **direito** | Ou menu de conta se agrupar com outras ações |
| **Fechar** (sheet/overlay) | Superior direito do painel ou X no header do modal | `QuickGuideOverlay`, `ShareInviteSheet`, `CreationAssistant` |
| **Sair do grupo** | Toolbar da tela, não competir com Voltar/Sair no mesmo canto | Ex.: `BoxHomePage` — manter junto a criar/convidar, com estilo terciário claro |

Extrair componente de **header de tela** reutilizável (ex.: `ScreenHeader`) com slots: `back`, `title`/`mode`, `trailing` (logout, ajuda) — reduzir duplicação de flexbox em cada `.module.css`.

**Escopo de telas (mínimo):**
- Modo Experiences: `GroupSelectionPage`, `BoxSelectionPage`, `ExperienceListPage`.
- Modo Experience Box: `BoxHomePage`, `SharedMomentPage`, `CreateBoxPage`.
- Fluxos transversais: `CreationAssistant`, `InvitePreviewPage`, `AuthPage` (botão ajuda), `QuickGuideOverlay`, `ShareInviteSheet`.

**Fora do escopo:**
- Botões primários (Criar, Sortear, Revelar, Salvar, Aceitar convite).
- Ações em cartões de experiência (Editar, Excluir, Prévia) — salvo se reutilizarem o mesmo componente terciário sem redesign específico.
- Redesenho completo de identidade dos modos (tarefa separada no backlog) — apenas não conflitar; pode compor no mesmo header.

**Regras arquiteturais:**
- Alterar apenas apresentação e layout de chrome; mesmas rotas, `useAppLogout`, `navigate(-1)` ou paths explícitos já usados.
- Componentes em `client/src/presentation/components/`; tokens CSS existentes.
- i18n: manter chaves `common.back`, `session.logout`, etc.; adicionar `aria-label` onde ícone-only.
- Safe area: respeitar `env(safe-area-inset-*)` em headers fixos no topo.

**Critérios de aceitação:**
- Voltar e Sair são reconhecíveis como botões (não texto solto) e seguem o tema do app.
- Posição de Voltar (esquerda) e Sair (direita) consistente nas telas autenticadas listadas.
- Fechar em overlays/sheets segue o mesmo vocabulário visual.
- Alvos de toque ≥ 48px; foco visível; rótulos acessíveis.
- Nenhuma regressão de navegação ou logout.
- Build do client passa; revisão visual em viewport mobile estreita.

**Restrições:**
- Não alterar contratos de API nem lógica de sessão.
- Não introduzir menu hamburger complexo ou drawer só para esta tarefa.
- Não mudar copy de produto além de `aria-label` se necessário.

---

## Redesenhar cards de experiência na lista do modo Experiences

### Descrição

Na lista de experiências do modo **Experiences** (`ExperienceListPage`), cada contribuição do autor aparece hoje com descrição e reflexão sempre visíveis, além de um botão **“Prévia como os outros veem”** que simula a carta lacrada do sorteio (`previewAsOthers` em `ExperienceCard`). Esse modo de prévia duplica o ritual da carta de sorteio sem agregar valor na gestão individual — o autor já sabe o que escreveu e só precisa revisar metadados e, quando quiser, ler o texto.

A spec de design system (@ref:pt-br-design-system) já descreve o card de experiência como chip de intensidade, selo visual e ações em menu discreto — não como formulário CRUD com texto exposto. A implementação atual diverge: botões ghost em linha, texto completo aberto e toggle de prévia que polui a tela.

Esta tarefa redesenha o card na listagem individual: **intensidade**, **parâmetros** e **selo** ficam sempre visíveis; a **descrição** fica oculta por padrão e é revelada sob demanda por um controle com ícone de olho. **Editar**, **excluir** e demais ações do autor permanecem. A função de prévia “como os outros veem” é removida. Itens de outros participantes continuam sem descrição (apenas metadados visíveis), conforme regras de visibilidade atuais.

### Prompt IA

Redesenhe os cards de experiência na lista do modo Experiences, substituindo o layout atual de texto exposto + toggle de prévia por um card compacto com revelação opcional da descrição.

**Contexto de produto:**
- `docs/pt-br/solution-specification/functional-components.md` — lista de experiências: itens próprios com editar/excluir; itens de outros só com resumo (intensidade + selo).
- `docs/pt-br/solution-specification/design-system.md` — componente “Card de experiência”: chip de intensidade, selo visual, ações em overflow; evitar estética CRUD.
- `docs/pt-br/solution-specification/experience-and-identity.md` — divulgação progressiva: intensidade antes do texto.

**Estado atual (confirmar na análise):**
- `client/src/presentation/experiences/ExperienceListPage.tsx` — renderiza `ExperienceCard` por experiência.
- `client/src/presentation/experiences/ExperienceCard.tsx` — exibe `ExperienceSummaryMeta` + `ExperienceContentBlock` com descrição/reflexão abertas para o autor; botão `previewAsOthers` alterna simulação de visão alheia; ações Editar/Excluir em linha com `Button variant="ghost"`.
- `client/src/domain/experience/experienceVisibility.ts` — `previewAsOthers` em `ListVisibilityOptions`; testes em `experienceVisibility.test.ts`.
- `client/src/presentation/components/ExperienceSummaryMeta.tsx` — intensidade (`IntensityBadge`), parâmetros (`ParameterRow`), selo (`IntegritySeal`).
- i18n: `experiences.previewToggle`, `experiences.showFull`, `experiences.previewAsOthers`, `experiences.otherSummary`.

**Comportamento desejado — itens do autor:**
1. Card mostra sempre no topo: **intensidade** (chip/badge), **parâmetros** (esforço, abertura, novidade) e **selo de integridade**.
2. **Descrição oculta por padrão** — não exibir `ExperienceContentBlock` completo ao carregar a lista.
3. Controle com **ícone de olho** (Lucide `Eye` / `EyeOff` ou equivalente) revela e oculta a descrição no próprio card (toggle local por item, estado não persistido).
4. **Reflexão:** ocultar junto com a descrição ou exibir apenas quando o olho estiver aberto — preferir revelar descrição + reflexão juntas se ambas existirem, para o autor revisar o conteúdo completo de uma vez.
5. **Remover** o botão e o estado `previewAsOthers` (“Prévia como os outros veem” / “Mostrar texto completo”).
6. **Manter** editar e excluir com o mesmo comportamento (`onEdit`, `onDelete`); reposicionar conforme design system (menu overflow com ícone ou botões compactos com ícone + rótulo curto — evitar fileira de ghost text).

**Comportamento desejado — itens de outros participantes:**
- Sem mudança de regra de negócio: continuar sem descrição/reflexão.
- Exibir intensidade, parâmetros (se já visíveis hoje via `ExperienceSummaryMeta`) e selo; copy de resumo (`experiences.otherSummary`) pode ser simplificada ou removida se redundante com o novo layout visual — avaliar na implementação.
- Sem ícone de olho (não há texto para revelar).

**Direção visual (@ref:pt-br-design-system):**
- Card branco arredondado (`--radius-card`), sombra suave, sem `border-left` por intensidade.
- Hierarquia: metadados no topo → área de descrição revelável abaixo → ações do autor no rodapé ou overflow.
- Ícone de olho com alvo de toque ≥ 48px; `aria-label` e `aria-pressed` quando toggle; estado “fechado” não deve vazar texto (sem `visibility:hidden` que mantém leitura acidental).
- Se a tarefa “Representar parâmetros com estrelas na criação e na carta de sorteio” já estiver mergeada, reutilizar componente de estrelas/`ParameterRow` atualizado; senão, manter `ParameterRow` existente sem bloquear esta tarefa.

**Arquivos prováveis:**
- `client/src/presentation/experiences/ExperienceCard.tsx`
- `client/src/presentation/experiences/ExperienceCard.module.css`
- `client/src/presentation/components/ExperienceSummaryMeta.tsx` (ajustes de layout compacto se necessário)
- `client/src/domain/experience/experienceVisibility.ts` — remover `previewAsOthers` e simplificar funções de listagem
- `client/src/domain/experience/experienceVisibility.test.ts` — atualizar/remover testes de prévia
- `client/src/i18n/locales/{en,pt-BR,it}.json` — novas chaves para olho (ex.: `experiences.revealDescription`, `experiences.hideDescription`); remover chaves órfãs de prévia

**Regras arquiteturais:**
- Alterar apenas apresentação e regras de visibilidade na lista (`EXPERIENCES_LIST`); não mudar sorteio (`DRAW_COVER` / `DRAW_FACE`) nem `SharedMomentPage`.
- Estado de olho aberto/fechado é **local ao componente** (`useState` por card); não persistir em API nem Preferences.
- Lógica de quem pode editar/excluir permanece em `canManageExperience`.
- Seguir tokens CSS e padrão Lucide do projeto.

**Documentação (ajuste mínimo):**
- Atualizar `docs/pt-br/solution-specification/functional-components.md` (e equivalentes en/it se existirem): remover menção a “alternar prévia de revelação”; descrever revelação opcional da descrição pelo autor via ícone de olho.

**Critérios de aceitação:**
- Lista no modo Experiences exibe cards com intensidade, parâmetros e selo sempre visíveis para todos os itens.
- Itens do autor: descrição oculta por padrão; ícone de olho revela/oculta descrição (e reflexão, se aplicável).
- Botão “Prévia como os outros veem” removido; sem estado `previewAsOthers` no código.
- Editar e excluir funcionam como antes.
- Itens de outros participantes continuam sem texto revelável.
- Layout legível em mobile; alvos de toque acessíveis; três locales com paridade de chaves novas.
- Testes de `experienceVisibility` atualizados; build e testes do client passam.

**Restrições:**
- Não alterar assistente de criação (`CreationAssistant`) nem ritual de sorteio.
- Não mudar contrato de API nem campo `summaryOnly` no backend.
- Não implementar edição inline da descrição no card — edição continua via assistente existente.

---

