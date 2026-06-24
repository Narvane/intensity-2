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

## Renomear abas de autenticação (Experiences / Experience Box)

### Descrição

Na tela de login (`AuthPage`), as quatro abas de modo de autenticação usam rótulos genéricos em inglês para os dois modos principais — "Experiences" e "Experience Box" — enquanto "Cadastro" e "Código convite" já estão em português no locale `pt-BR`. Isso dificulta a escolha rápida do fluxo: o usuário precisa ler o card introdutório para entender a diferença entre criar experiências no celular individual e sortear em grupo.

A spec de identidade (@ref:pt-br-experience-and-identity) trata "Experiences" e "Experience Box" como nomes de produto/modo que devem permanecer visíveis nos cards introdutórios (`AuthModeIntro`), onde hoje aparecem o kicker (ex.: "Sign in" / "Login"), o nome do produto e o subtítulo descritivo. Apenas os rótulos das abas na navegação superior devem passar a comunicar a ação em linguagem mais direta.

### Prompt IA

Atualize os rótulos das abas de autenticação na tela de login, sem alterar os nomes de produto nos cards introdutórios.

**Arquivos envolvidos:**
- `client/src/presentation/auth/AuthPage.tsx` — renderiza abas via `t('auth.tabs.${tab}')`; alteração provavelmente só em i18n.
- `client/src/presentation/components/AuthModeIntro.tsx` — usa `auth.experiences.product` e `auth.experienceBox.product`; **não alterar**.
- `client/src/i18n/locales/pt-BR.json` — chaves `auth.tabs.experiences` e `auth.tabs.experienceBox`.
- `client/src/i18n/locales/en.json` e `client/src/i18n/locales/it.json` — equivalentes traduzidos para paridade entre locales.

**Comportamento esperado:**
- Aba Experiences → **"Crie experiencias"** (`pt-BR`).
- Aba Experience Box → **"Sorteio"** (`pt-BR`).
- Abas Cadastro e Código convite permanecem inalteradas.
- Nos cards dentro de cada aba (`AuthModeIntro`), manter:
  - Experiences: kicker + **"Experiences"** + subtítulo (ex.: "Create experiences on your own" / "Crie experiências individualmente").
  - Experience Box: kicker + **"Experience Box"** + subtítulo (ex.: "Draw experience boxes together" / "Sorteie caixas de experiências").
- Não renomear chaves internas (`AuthPanel`, rotas, use cases) nem copy em outras telas (`SessionModeChrome`, quick guide, etc.) nesta tarefa.

**Critérios de aceitação:**
- Na `AuthPage`, as abas exibem os novos rótulos; os cards introdutórios continuam mostrando "Experiences" e "Experience Box".
- Três locales (`pt-BR`, `en`, `it`) com paridade nas chaves `auth.tabs.*`.
- Sem regressão visual nas classes de aba ativa (`tabActiveExperiences`, `tabActiveExperienceBox`).

**Restrições:**
- Escopo limitado aos rótulos das abas na autenticação; não propagar renomeação global dos modos.

---

## Refinar seleção multi-grupo no modo Experiences

### Descrição

No modo Experiences, a jornada prevista pela spec (@ref:pt-br-functional-components, Fluxo B) é: autenticação individual → **seleção de grupo** → seleção de caixinha → lista de experiências. O modelo de dados já define que um participante pode pertencer a **vários grupos** (@ref:pt-br-data-model) e a API lista todos via `GET /v1/groups` no modo Experiences (`GroupQueryService.listForPrincipal` filtra por `participantId`). O login individual **não** fixa um único grupo na sessão — `SessionState` só carrega `groupId` após o usuário escolher um grupo na navegação.

Apesar disso, a experiência atual não comunica bem essa hierarquia. A `GroupSelectionPage` mostra cards quase idênticos (todos em `--teal`), exibindo apenas contagem de membros sem nomes; ações de **Convidar** e **Sair do grupo** aparecem já na listagem, embora convite seja conceito de grupo (a `BoxSelectionPage` já oferece convite dentro do grupo). Na autenticação, a aba **Código convite** cobre entrada em grupo por convite sem estar dentro de um grupo — comportamento desejado, mas precisa permanecer claro como caminho global, distinto do convite gerado por um membro já dentro do grupo.

Ao sair de um grupo, a spec atual diz que as experiências do autor **permanecem** nas caixinhas (@ref:pt-br-data-model). O produto passou a exigir o oposto: ao sair, **todas as experiências daquele participante nas caixinhas do grupo** devem ser removidas — mudança de regra de negócio que impacta API, copy de confirmação e testes.

Esta tarefa torna explícita a navegação multi-grupo, reorganiza convite/saída conforme o contexto, enriquece os cards de grupo com nomes dos membros e cor distinta, e alinha o comportamento de saída à nova expectativa de produto.

### Prompt IA

**Objetivo:** Evoluir a jornada Experiences para deixar claro que o usuário pode ter vários grupos, cada um com suas caixinhas; melhorar a listagem de grupos; mover convite/saída para o contexto correto; e, ao sair de um grupo, remover as experiências do participante nas caixinhas desse grupo.

**Estado atual (confirmar na implementação):**
- Rotas: `/groups` → `/groups/:groupId/boxes` → `/groups/:groupId/boxes/:boxId/experiences` — hierarquia já existe.
- `GroupSelectionPage`: lista grupos, convite e sair na listagem; cards sem nomes de membros; cor única (`--teal`).
- `BoxSelectionPage`: convite dentro do grupo (`ShareInviteSheet`); **sem** ação de sair do grupo.
- `AuthPage`: aba `invite` para entrar em grupo por código/deep link — manter como entrada global.
- `GET /v1/groups` retorna `{ id, memberCount, createdAt }` — **sem** nomes de membros.
- OpenAPI documenta `GET /v1/groups/{groupId}/members`, mas o controller atual (`GroupMemberController`) só expõe `DELETE` — implementar listagem ou enriquecer resposta de grupos.
- `GroupMembershipService.leave` remove apenas a membresia; experiências do autor **não** são excluídas hoje — diverge da nova regra.

**Comportamento esperado — navegação e convite:**
1. Após login Experiences, o usuário vê **primeiro** a lista de seus grupos (`GroupSelectionPage`) — título/copy reforçando que são *suas turmas/grupos*.
2. Ao tocar em um grupo, entra na **seleção de caixinhas** daquele grupo (`BoxSelectionPage`).
3. **Convidar** (gerar/compartilhar convite do grupo) fica **apenas dentro do grupo** — toolbar ou ação equivalente em `BoxSelectionPage` (já existe; remover da listagem de grupos em `GroupSelectionPage`).
4. **Entrar em grupo por convite** permanece **fora** do contexto de grupo: aba "Código convite" na autenticação e fluxo `/join` (`InvitePreviewPage`). Empty state da listagem de grupos pode apontar para esse caminho quando não houver grupos.
5. Voltar: caixinhas → grupos (`NavButton` back já aponta para `/groups`).

**Comportamento esperado — listagem de grupos:**
1. Cada card de grupo exibe, de forma discreta (canto ou linha secundária pequena), os **nomes de exibição** dos membros — ex.: "Ana, Bruno e +2" quando houver muitos. Usar `displayName`, nunca e-mail.
2. Manter contagem de membros se útil, mas priorizar legibilidade dos nomes para distinguir grupos sem nome formal (grupos são identificados pelo conjunto de membros — @ref:pt-br-data-model).
3. **Cor de fundo por grupo**, determinística e estável (hash de `groupId` → paleta do design system: `--coral`, `--teal`, `--purple`, `--yellow` — @ref:pt-br-design-system). Evitar N cores iguais consecutivas na lista quando possível.
4. Toque no card navega para as caixinhas; não misturar ações destrutivas no mesmo alvo de toque principal.

**Comportamento esperado — sair do grupo:**
1. Ação **Sair do grupo** disponível **dentro do grupo** (`BoxSelectionPage`), não na listagem de grupos — estilo terciário/ghost, alinhado ao backlog de padronização de headers (@ref:backlog, seção de headers).
2. Reutilizar `LeaveGroupDialog` e `LeaveGroupUseCase`.
3. **Nova regra:** ao confirmar saída, o backend remove a membresia **e exclui todas as experiências** cujo autor seja o participante que saiu (ou os participantes da sessão conjunta, no modo Experience Box) **em caixinhas daquele grupo**.
4. Atualizar copy do diálogo (`groups.leaveDialog.message` e equivalentes) — hoje diz que experiências permanecem; deve refletir remoção.
5. Após sair em Experiences: voltar à listagem de grupos; limpar `NavigationPort` se o grupo ativo era o que saiu.
6. Comportamento de **último membro** permanece: exclusão do grupo, caixinhas, experiências restantes e convites (@ref:pt-br-data-model).

**API e domínio (backend):**
- Estender `GroupMembershipService.leave` (ou serviço colaborador) para deletar experiências do(s) participante(s) que saem em caixinhas do `groupId` antes de remover membresia.
- Preferir query/repository por `groupId` + `authorId`(s); transação única.
- Expor nomes de membros na listagem de grupos — opções:
  - **A)** Enriquecer `GroupResponse` com `members: [{ participantId, displayName }]` ou `memberPreview: string[]` em `GET /v1/groups`; ou
  - **B)** Implementar `GET /v1/groups/{groupId}/members` conforme OpenAPI e agregar no client (evitar N+1 excessivo — considerar endpoint enriquecido se performance for problema).
- Atualizar `openapi/openapi.yaml` e testes de integração (`GroupIntegrationTest`, `BoxIntegrationTest`, novo teste de leave + remoção de experiências).

**Client:**
- `client/src/domain/box/boxTypes.ts` — estender tipo `Group` com dados de membros/preview.
- `client/src/domain/box/boxUseCases.ts` — `ListGroupsUseCase`; eventual `ListGroupMembersUseCase`.
- `client/src/presentation/groups/GroupSelectionPage.tsx` + `.module.css` — cards com cor, preview de nomes; remover convite/sair.
- `client/src/presentation/boxes/BoxSelectionPage.tsx` — adicionar sair do grupo (padrão `BoxHomePage`).
- Novo helper `groupVisuals.ts` (espelhar `boxVisuals.ts` / `sessionModeVisuals.ts`) para cor estável por `groupId`.
- i18n `groups.*`, `boxes.*` em `pt-BR`, `en`, `it`.

**Regras arquiteturais:**
- Clean Architecture no client (DT-13): use cases no domínio, API via adapters.
- Convite continua sendo **por grupo** (`POST /v1/groups/{groupId}/invites`) — não por caixinha.
- Modo Experience Box (`BoxHomePage`) mantém convite e sair no contexto da sessão conjunta; alinhar copy de saída à nova regra de remoção de experiências se aplicável aos leavers.
- Seguir @ref:pt-br-design-system: cards coloridos sólidos, texto branco ou contraste adequado, tipografia secundária pequena para nomes.

**Documentação:**
- Atualizar @ref:pt-br-data-model (tabela "Sair do grupo") e equivalentes `en`/`it`: experiências do autor **são removidas** ao sair.
- Ajuste mínimo em @ref:pt-br-functional-components se a posição de convite/sair mudar na descrição do módulo "Gerenciamento de grupo".

**Critérios de aceitação:**
- Participante com 2+ grupos vê todos na `GroupSelectionPage` e distingue visualmente cada um (cor + nomes).
- Convite na listagem de grupos removido; convite acessível dentro de `BoxSelectionPage`.
- Entrada por convite global continua na autenticação e `/join`.
- Sair do grupo disponível em `BoxSelectionPage`; confirmação descreve remoção das contribuições do usuário.
- Após sair, experiências do autor não aparecem mais nas caixinhas do grupo (verificar via API/listagem).
- Cores dos grupos usam tokens do design system; preview de nomes abrevia corretamente grupos grandes.
- Testes de integração API para leave + cascade de experiências; testes unitários client para formatação de preview de membros (se extraído).
- Build e testes passam; OpenAPI alinhado.

**Restrições:**
- Não alterar formação de grupo por login conjunto nem regras de convite (expiração, revogação).
- Não implementar nome editável para grupos — identidade continua sendo o conjunto de membros.
- Não redesenhar `BoxCard` nem lista de experiências nesta tarefa.
- Escopo de remoção de experiências: apenas ao **sair do grupo**; não mudar exclusão manual de experiência pelo autor.

---

## Corrigir layout do cabeçalho com Voltar e Sair

### Descrição

As telas autenticadas usam o componente compartilhado `ScreenHeader` com três colunas em grid (`leading` | `body` | `trailing`): botão **Voltar** à esquerda, conteúdo central (`SessionModeChrome` com ícone do modo, rótulo EXPERIENCES/EXPERIENCE BOX, subtítulo, saudação ou chips de sala, e título da tela) e botão **Sair** à direita. Quando só existe o trailing (ex.: `GroupSelectionPage`, `BoxHomePage`), o cabeçalho respira e o bloco de título ocupa a largura útil. Quando **Voltar** e **Sair** coexistem (ex.: `BoxSelectionPage`, `SharedMomentPage`, `ExperienceListPage`), o conteúdo central fica espremido entre dois `NavButton` com ícone e rótulo — o modo, subtítulo e hierarquia visual quebram ou parecem desalinhados, especialmente em viewports estreitas.

O problema é estrutural: título e chrome de sessão não devem competir horizontalmente com os botões de navegação na mesma linha. A spec de design (@ref:pt-br-design-system) pede uma ação principal óbvia por tela e hierarquia clara; o layout atual viola isso quando a pilha de navegação está completa. Já existe no backlog a tarefa "Melhorar botões de navegação secundária (Voltar, Sair e afins)", focada no visual dos `NavButton` — esta tarefa trata da **arquitetura de layout** do header para que a solução seja estável em toda a aplicação, com ou sem botão de voltar.

### Prompt IA

**Objetivo:** Redesenhar o layout do cabeçalho de tela para que botões de navegação (Voltar, Sair, Fechar, Ajuda) e conteúdo de título/modo **não compartilhem a mesma faixa horizontal de forma que quebre a hierarquia**. A implementação deve ser analisada, validada em todas as telas consumidoras e entregue como padrão único reutilizável.

**Análise obrigatória (primeira etapa):**
1. Inventariar todos os usos de `ScreenHeader` e headers ad hoc que repetem o mesmo padrão.
2. Comparar telas **com** `leading` (Voltar) vs **sem** `leading` — documentar o desvio visual atual (screenshots ou descrição).
3. Avaliar abordagens e escolher a mais sólida; opções a considerar (não limitar a uma):
   - **Duas linhas:** faixa superior só para ações (`leading` | espaço flex | `trailing`); faixa inferior em largura total para `children` (modo + título).
   - **Slots simétricos:** colunas laterais com largura fixa/reservada igual (mesmo quando vazias) para estabilizar o centro — útil se mantiver layout em uma linha em alguns contextos.
   - **Ícone-only na faixa de ações** e rótulos só em `aria-label` na toolbar, liberando largura (coordenar com tarefa de NavButton se necessário).
   - **Variantes do header:** `stacked` (telas principais) vs `compact` (overlays como `CreationAssistant`).
4. Registrar a decisão em comentário breve no componente ou em nota no PR — justificar por que a solução não quebra quando `leading` é omitido.

**Estado atual (confirmar):**
- `client/src/presentation/components/ScreenHeader.tsx` — grid `auto 1fr auto`; `children` na coluna central.
- `client/src/presentation/components/ScreenHeader.module.css` — colunas laterais `auto`; `:empty` zera min-height mas não reserva largura simétrica.
- `client/src/presentation/components/SessionModeChrome.tsx` — bloco rico (ícone, modo, subtítulo, saudação/chips, `h1`); consumido dentro de `ScreenHeader` na maioria das telas autenticadas.
- `client/src/presentation/components/NavButton.tsx` — pills com ícone + texto; largura variável por locale ("Voltar", "Sair").
- Consumidores de `ScreenHeader`: `GroupSelectionPage`, `BoxSelectionPage`, `ExperienceListPage`, `BoxHomePage`, `SharedMomentPage`, `CreateBoxPage`, `CreateBoxExperiencesPage`, `CreationAssistant` (só `trailing` Fechar).

**Direção de produto / UX:**
- Botões de chrome ficam em faixa dedicada; títulos e identificador de modo (`SessionModeChrome` ou equivalente) ocupam **100% da largura abaixo** (ou em área que não seja comprimida pelos botões).
- Com Voltar presente: título e modo **não** devem deslocar-se nem encolher de forma perceptível em relação à tela sem Voltar — a diferença deve ser só a presença do botão na faixa superior, não o layout do título.
- Sem Voltar: trailing (Sair) permanece à direita na faixa de ações; área de título alinhada à mesma margem esquerda das telas com Voltar (consistência de padding).
- Overlays (`CreationAssistant`, `QuickGuideOverlay`, `ShareInviteSheet`) devem seguir o mesmo princípio onde usam header — evitar exceções visuais sem motivo.

**Implementação sugerida:**
- Evoluir `ScreenHeader` (preferível a CSS ad hoc por página) com estrutura explícita, ex.:
  ```tsx
  <header>
    <div className={toolbar}>  {/* leading | flex spacer | trailing */} </div>
    <div className={content}>  {/* children — largura total */} </div>
  </header>
  ```
- Slots `leading` e `trailing` aceitam `undefined`/vazio sem colapsar margens do `content` de forma assimétrica.
- Remover regras de header duplicadas nos `.module.css` das páginas que conflitem com o componente central.
- `SessionModeChrome` permanece responsável pelo conteúdo de modo/título; **não** precisa saber se há Voltar — responsabilidade do `ScreenHeader`.
- Respeitar `env(safe-area-inset-*)` no topo; manter `margin-bottom` consistente com o restante do app.
- i18n: sem mudança obrigatória de copy; se adotar ícone-only na toolbar, garantir `aria-label` nos `NavButton`.

**Escopo de telas (validar visualmente após mudança):**
- Experiences: `GroupSelectionPage` (sem Voltar), `BoxSelectionPage`, `ExperienceListPage`, `CreateBoxExperiencesPage`.
- Experience Box: `BoxHomePage` (sem Voltar), `SharedMomentPage`, `CreateBoxPage`.
- Overlays: `CreationAssistant`.
- Verificar também `InvitePreviewPage`, `AuthPage`, `QuickGuideOverlay`, `ShareInviteSheet` — se não usam `ScreenHeader`, aplicar o **mesmo padrão de duas faixas** ou migrar para o componente se trivial.

**Regras arquiteturais:**
- Alterar apenas apresentação/layout; mesmas rotas, handlers de `NavButton` e props das páginas.
- Um único componente (ou família mínima: `ScreenHeader` + variante `compact`) — evitar três implementações de flexbox espalhadas.
- Tokens e espaçamento de @ref:pt-br-design-system (`--space-page`, `--touch-min`, `--radius-button`).
- Não depender de JavaScript para medir largura de botões se CSS (grid com colunas iguais, `1fr auto 1fr` na toolbar, etc.) resolver.

**Coordenação com outras tarefas:**
- Complementa "Melhorar botões de navegação secundária" e "Diferenciar sessão individual e sessão em grupo na interface" — pode ser executada antes ou depois; se o visual dos `NavButton` mudar depois, o layout do header deve continuar válido.
- Não bloquear nem implementar tarefas de conteúdo de grupo/caixinha.

**Critérios de aceitação:**
- Em `BoxSelectionPage` e `SharedMomentPage` (Voltar + Sair): `SessionModeChrome` e `h1` usam largura total; sem compressão horizontal do bloco de modo entre os botões.
- Em `GroupSelectionPage` e `BoxHomePage` (só Sair): título/modo alinhados à mesma grade visual das telas com Voltar (sem “pulo” de margem).
- Redimensionar viewport mobile estreito (~320px): sem sobreposição de texto e botões; alvos de toque ≥ 48px preservados.
- Todos os consumidores de `ScreenHeader` migrados; sem regressão de navegação (Voltar, Sair, Fechar).
- Build do client passa; revisão visual manual nas telas listadas.

**Restrições:**
- Não alterar copy, identidade de modo (cores EXPERIENCES vs EXPERIENCE BOX) nem conteúdo de `SessionModeChrome` além de ajustes de margem herdados do novo layout.
- Não redesenhar botões primários de toolbar (Criar, Convidar, Sortear).
- Não introduzir biblioteca de UI externa.

---

## Compactar capa da carta sorteada com ênfase em intensidade

### Descrição

No momento compartilhado (`SharedMomentPage`), após sortear, a **capa** da carta (`DrawResultCard`, face antes da revelação) exibe intensidade, parâmetros (esforço, abertura, novidade) e selo de integridade para o grupo alinhar antes de virar a carta (@ref:pt-br-functional-components). A implementação atual empilha `IntensityBadge` (chip pequeno com nível + rótulo), três blocos verticais de parâmetros com ícone, label e estrelas (`ParameterStarsGroup` layout `cover`), e o selo — tudo dentro de `.cover` com `overflow: auto` e `min-height: 16rem`. Em viewports típicas de celular o conteúdo ultrapassa a altura do card e **aparece barra de rolagem**, quebrando a metáfora de carta física retangular e o ritual de leitura rápida em grupo.

A spec prevê na capa: nível de intensidade, parâmetros e selo (@ref:pt-br-data-model, @ref:pt-br-design-system — escala de intensidade 1–5 com calor afetivo). A tarefa "Representar parâmetros com estrelas na criação e na carta de sorteio" já alinhou parâmetros a ícones + estrelas coloridas; esta tarefa foca na **composição visual da capa do sorteio**: sem scroll, formato retangular estável, hierarquia clara com **intensidade em destaque**, parâmetros legíveis porém compactos, e selo quase imperceptível.

### Prompt IA

**Objetivo:** Redesenhar a capa da carta sorteada para caber em um card retangular fixo, **sem scroll**, com ênfase visual na intensidade e parâmetros compactos.

**Análise obrigatória (primeira etapa):**
1. Medir o layout atual em `DrawResultCard.module.css` — causa do scroll: `overflow: auto` em `.cover` + coluna vertical alta (`coverGroup` com `gap: 0.85rem` × 3 parâmetros + selo + `coverLabel`).
2. Propor composição que caiba em ~16rem de altura (ou aspect ratio explícito, ex. 4:3 / 3:2) em largura de tela mobile com `--space-page` — validar em ~320px e ~390px.
3. Documentar decisão de layout (grid vs flex, ordem dos blocos) antes de codificar.

**Estado atual (confirmar):**
- `client/src/presentation/shared-moment/DrawResultCard.tsx` — capa usa `ExperienceSummaryMeta` com `compact`.
- `client/src/presentation/shared-moment/DrawResultCard.module.css` — `.cover { overflow: auto }`; fundo com gradiente por `--intensity-accent`.
- `client/src/presentation/components/ExperienceSummaryMeta.tsx` — ordem: `IntensityBadge` → `ParameterStarsGroup` (layout `cover`) → `IntegritySeal`.
- `client/src/presentation/components/IntensityBadge.tsx` — chip textual (`intensity.levelNamed`); sem número hero.
- `client/src/presentation/components/ParameterStarField.tsx` + `ParameterStarField.module.css` — layout `cover`: ícone, label, estrelas `sm` em coluna.
- `client/src/presentation/components/IntegritySeal.tsx` — selo com ícone + label + código; `compact` ainda legível.
- Cores: `intensityTokens.ts`, tokens CSS `--intensity-accent`, `--param-effort/openness/novelty`.

**Hierarquia visual desejada (capa do sorteio):**

1. **Intensidade — protagonista**
   - Número do nível (1–5) **muito grande** (ex.: `clamp(3rem, 12vw, 4.5rem)`, peso 800–900).
   - Label pequeno abaixo ou acima: **"Intensidade"** (i18n `intensity.label` ou chave nova `sharedMoment.intensityLabel`).
   - Cor do número na cor canônica do nível (@ref:pt-br-design-system — escala 1–5); opcional: nome do nível (Leve, Coragem…) em tamanho secundário **muito** menor — não competir com o dígito.
   - Substituir ou complementar `IntensityBadge` apenas na capa do sorteio — não obrigar o mesmo visual na lista de experiências.

2. **Parâmetros — compactos, mesmo vocabulário visual**
   - Manter **ícone colorido**, **label** (Esforço / Abertura / Novidade) e **estrelas preenchidas** na cor do parâmetro — como hoje.
   - Reduzir espaçamento: gaps menores, estrelas `sm` ou nova variante `xs`, ícones menores.
   - Layout sugerido (escolher o que couber sem scroll):
     - **Três colunas** lado a lado na metade inferior do card; ou
     - **Uma linha** com três mini-blocos; ou
     - Ícone + label abreviado na mesma linha que as estrelas.
   - Somente leitura; `aria-label` por parâmetro preservado.

3. **Selo — discreto**
   - Quase imperceptível: fonte mínima (ex. 0.6–0.65rem), opacidade reduzida, sem ícone grande ou só ícone minúsculo.
   - Posição: canto inferior (ex. bottom-right), não competir com intensidade.
   - Manter `aria-label` e `title` para acessibilidade; código do selo pode truncar visualmente (ex. últimos 4–6 chars) se necessário — valor completo no `title`.

4. **Sem scroll**
   - Remover `overflow: auto` da capa; usar `overflow: hidden`.
   - Todo o conteúdo (incl. `coverLabel` "Antes de revelar" / equivalente) deve caber sem rolagem vertical nem horizontal.
   - Card permanece retangular com cantos `--radius-card`; altura fixa ou `aspect-ratio` consistente entre sorteios.

**Implementação sugerida:**
- Criar variante dedicada da meta da capa — ex. `DrawCardCover` ou `ExperienceSummaryMeta variant="drawCover"` — para não poluir lista/inline.
- Novo componente ou variante `IntensityHero` para o número grande (props: `level`, opcional `showName`).
- Estender `ParameterStarsGroup` com `layout="drawCover"` (ou reutilizar `inline` apertado) — CSS em `ParameterStarField.module.css`.
- `IntegritySeal`: prop `variant="minimal"` ou `drawCover` — opacidade ~0.45–0.55, tamanho reduzido.
- Ajustar `DrawResultCard.module.css`: grid da capa, ex.:
  ```
  [ coverLabel — opcional, pequeno ]
  [     INTENSIDADE HERO (centro)     ]
  [  effort  |  openness  |  novelty  ]
  [                    selo mínimo ↘ ]
  ```
- `coverLabel` pode encolher (fonte menor) ou integrar ao hero se redundante — avaliar na análise.
- Face revelada (`ExperienceContentBlock`) e animação de flip **inalteradas**.

**i18n:**
- `client/src/i18n/locales/{pt-BR,en,it}.json` — label "Intensidade" / "Intensity" / equivalente; revisar `sharedMoment.coverLabel` se o layout mudar.

**Regras arquiteturais:**
- Sem mudança de API nem campos de experiência (`intensity`, `parameters`, `seal`).
- Reutilizar `StarRating`, `parameterVisuals.ts`, `INTENSITY_COLORS` / tokens CSS existentes.
- Contraste: número de intensidade legível sobre fundo `color-mix` da capa; não depender só de cor (nível também visível como dígito grande).
- Não alterar filtros de sorteio, botões Sortear/Revelar nem `SharedMomentPage` além do card.

**Documentação (ajuste mínimo):**
- Atualizar @ref:pt-br-functional-components se a descrição da carta de resultado mencionar apenas "chip" de intensidade — passar a refletir número em destaque na capa.

**Critérios de aceitação:**
- Capa da carta sorteada **sem barra de rolagem** em mobile 320px e 390px de largura.
- Intensidade exibida com número grande + label "Intensidade" pequeno; cor do nível correta (1–5).
- Três parâmetros visíveis com ícone, label e estrelas coloridas — mais compactos que o layout atual.
- Selo presente mas visualmente secundário (usuário de produto descreve como "quase não enxergável").
- Formato retangular estável; flip e face revelada sem regressão.
- `ExperienceListPage` e outros usos de `ExperienceSummaryMeta` não degradados (variante isolada à capa do sorteio).
- Três locales com paridade de chaves novas/alteradas.
- Build do client passa.

**Restrições:**
- Escopo limitado à **capa** de `DrawResultCard` no momento compartilhado.
- Não redesenhar carta revelada, animação de flip ou dica de alinhamento âmbar.
- Não converter intensidade geral para estrelas (permanece número 1–5).
- Não alterar assistente de criação nem explorer de sugestões.

---

## Corrigir layout dos parâmetros no card de experiência

### Descrição

Na lista de experiências do modo Experiences (`ExperienceListPage`), cada card do autor exibe metadados via `ExperienceSummaryMeta`: chip de intensidade, três parâmetros (esforço, abertura, novidade) com ícone, rótulo e estrelas, e selo de integridade. A tarefa anterior "Redesenhar cards de experiência na lista do modo Experiences" já introduziu o ícone de olho e ações Editar/Excluir — porém o bloco de parâmetros permanece visualmente quebrado em larguras típicas de celular.

O layout atual usa `ParameterStarsGroup` com `layout="inline"`: cada parâmetro é um chip em flex row com `flex-wrap`, dentro de um `inlineGroup` também em flex com wrap (`flex: 1 1 7.5rem` por campo). Quando o card fica estreito — ainda mais com o botão de olho ocupando espaço à direita em `metaRow` — **Esforço** e **Abertura** aparecem lado a lado, mas as fileiras de estrelas de ambos caem na mesma linha horizontal e **colidem/sobrepõem** no centro do card. **Novidade**, por ser mais larga ou quebrar para linha seguinte, pode parecer correta enquanto os dois primeiros parâmetros ficam ilegíveis.

O problema é de composição CSS compartilhada (`ParameterStarField.module.css`), não de dados. A spec pede que intensidade, parâmetros e selo sejam legíveis de relance na listagem (@ref:pt-br-functional-components, @ref:pt-br-design-system). Esta tarefa corrige o layout para que cada parâmetro seja um bloco autocontido, sem sobreposição, em qualquer largura de card usada na lista.

### Prompt IA

**Objetivo:** Corrigir o layout quebrado dos parâmetros (estrelas sobrepostas) no card de experiência da lista do modo Experiences, com solução estável em mobile e reutilizável onde `ExperienceSummaryMeta` aparece em contexto de lista.

**Análise obrigatória (primeira etapa):**
1. Reproduzir o bug em `ExperienceListPage` com experiência que tenha os três parâmetros preenchidos — viewport ~320–390px, com e sem botão de olho visível.
2. Inspecionar cascata CSS: `ExperienceCard.metaRow` (flex, `min-width: 0`) → `ExperienceSummaryMeta.meta` → `ParameterStarsGroup` (`inlineGroup`) → `ParameterStarField` (`.inline` com `flex-wrap`).
3. Confirmar que a causa é **wrap compartilhado** entre campos irmãos (estrelas de parâmetros diferentes na mesma linha visual), não tamanho incorreto de `StarRating`.
4. Escolher abordagem que isole cada parâmetro; documentar brevemente no PR.

**Estado atual (confirmar):**
- `client/src/presentation/experiences/ExperienceCard.tsx` — `ExperienceSummaryMeta` sem `compact`; `metaRow` com olho à direita.
- `client/src/presentation/components/ExperienceSummaryMeta.tsx` — `layout="inline"` para parâmetros quando não `compact`.
- `client/src/presentation/components/ParameterStarField.tsx` — layouts `picker` | `cover` | `inline`.
- `client/src/presentation/components/ParameterStarField.module.css` — `.inlineGroup` + `.inline` (row + wrap).
- `client/src/presentation/components/StarRating.module.css` — estrelas `sm` em contexto inline/cover.

**Comportamento esperado:**
- Cada parâmetro (Esforço, Abertura, Novidade) forma um **bloco visual fechado**: ícone + rótulo + estrelas **nunca** compartilham linha de estrelas com outro parâmetro.
- Ordem de leitura clara: intensidade no topo → parâmetros → selo.
- Layout legível em card de largura total menos padding de página e espaço do botão de olho.
- Manter vocabulário visual atual: ícones coloridos (`parameterVisuals.ts`), rótulos i18n, estrelas na cor do parâmetro, fundo `--surface-sunken` nos chips se fizer sentido.
- Itens de outros participantes que usam o mesmo meta: mesmo layout corrigido (sem olho).

**Abordagens aceitáveis (escolher a mais sólida):**
- **A)** Novo layout `list` (ou `card`) em `ParameterStarField`: coluna por parâmetro (ícone + label numa linha, estrelas na linha abaixo); `inlineGroup` vira coluna ou grid de 1 coluna.
- **B)** Grid CSS no grupo: `grid-template-columns: 1fr` em viewports estreitas; opcional 2–3 colunas só acima de breakpoint se couber sem colisão.
- **C)** Uma linha horizontal **por parâmetro** com `flex-wrap: nowrap` no bloco de estrelas e `min-width` garantido — três linhas empilhadas no card.
- **D)** Passar `layout="cover"` ou variante compacta só na lista — se vertical couber sem scroll no card (avaliar altura).

Evitar: `flex-wrap` no `.inline` que permita estrelas órfãs na mesma linha que estrelas de outro `.field` irmão.

**Arquivos prováveis:**
- `client/src/presentation/components/ParameterStarField.tsx`
- `client/src/presentation/components/ParameterStarField.module.css`
- `client/src/presentation/components/ExperienceSummaryMeta.tsx` — usar novo layout na lista (prop `variant` ou trocar `inline` → `list`).
- `client/src/presentation/components/ExperienceSummaryMeta.module.css` — espaçamento vertical entre blocos.
- `client/src/presentation/experiences/ExperienceCard.module.css` — se `metaRow` precisar de ajuste (ex. empilhar olho em breakpoint extremo).
- Opcional: teste visual ou snapshot de estrutura DOM se o projeto tiver padrão.

**Regras arquiteturais:**
- Não alterar API, domínio nem valores de parâmetros.
- Não mudar capa do sorteio (`DrawResultCard`, `layout="cover"`) salvo extrair CSS compartilhado sem regressão.
- Manter `aria-label` em `ParameterStarsGroup` e descrição por parâmetro em `StarRating`.
- Seguir tokens @ref:pt-br-design-system; alvos de toque do olho e ações ≥ 48px inalterados.

**Critérios de aceitação:**
- Em mobile (~320px), card com três parâmetros: **zero sobreposição** de estrelas entre Esforço, Abertura e Novidade.
- Cada parâmetro identificável: ícone, rótulo e quantidade de estrelas correta (1–5).
- Intensidade, selo, olho, Editar e Excluir permanecem funcionais e bem posicionados.
- `DrawResultCard` / capa do sorteio sem regressão visual.
- Assistente de criação (`layout="picker"`) inalterado.
- Build do client passa; revisão manual em `ExperienceListPage` com 1+ cards.

**Restrições:**
- Escopo: correção de layout de metadados no card de lista — não redesenhar o card inteiro nem ritual de sorteio.
- Não remover estrelas nem voltar a chips numéricos antigos.
- Não alterar regras de visibilidade (`experienceVisibility`) nesta tarefa.

---

