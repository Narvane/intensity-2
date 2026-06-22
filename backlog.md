# Backlog

Mapa de referências do repositório: @ref:refs (`docs/refs.yaml`).

Sequência de execução: fundar a estrutura e o conteúdo canônico da documentação → estabilizar referências cruzadas com mapa centralizado → refatorar o código para inglês sobre base estável. Executar na ordem das seções abaixo.

---

## Fundações Arquiteturais

## Refatorar e consolidar documentação do produto

### Descrição

A documentação do Intensity vive hoje em `newdocs/`, com uma árvore canônica em inglês (`en/`) e traduções em `pt-br/` e `it/`, organizada em quatro camadas (concepção de produto, especificação de solução, arquitetura de solução, engenharia e operações). Na raiz de `newdocs/` há também artefatos soltos: `plano-desenvolvimento-ia.md`, `Intensity-Design-System-Style-Guide.md`, `UX-Audit.md`, `UX-Redesign-Proposal.md` e `ux-refactor-agent.md`. Os três últimos foram produzidos para conduzir uma refatoração visual após o layout gerado a partir da spec original não ter agradado; são diagnóstico, proposta e prompt de agente — não definem o produto em si.

O que vale como verdade visual e de identidade hoje é o `Intensity-Design-System-Style-Guide.md` (flat cartoon, paleta coral/amarelo/roxo/turquesa, fundo `#FFF7ED`, tipografia arredondada, bordas generosas, clima de jogo casual). Já o documento oficial `experience-and-identity.md` — em `en`, `pt-br` e `it` — ainda descreve uma identidade desatualizada (acentos marrom/azul, gradientes suaves, estética mais corporativa), alinhada ao layout que foi descartado. Isso cria contradição entre o que agentes e contribuidores leem na spec e o que a aplicação refatorada deve seguir.

Esta tarefa reorganiza a documentação: renomear `newdocs/` para `docs/`, mover o plano operacional para a raiz do repositório, remover artefatos exclusivos da refatoração visual, e integrar o conteúdo declarativo do Style Guide na estrutura oficial multilíngue — de forma coerente com as camadas existentes, substituindo declarações visuais obsoletas sem perder regras de domínio, terminologia, tom de voz e comportamentos de tela que continuam válidos.

**Por que vem primeiro:** define a estrutura final (`docs/`, plano na raiz, design system canônico) sobre a qual as tarefas seguintes de mapa de referências e tradução de código irão operar — evitando retrabalho em paths que ainda seriam renomeados.

### Prompt IA

Execute uma refatoração completa da documentação do produto, preservando a arquitetura de camadas e o modelo multilíngue (inglês canônico + sincronização pt-br e it).

**1. Renomear e reposicionar**

- Renomear a pasta `newdocs/` para `docs/`.
- Mover `newdocs/plano-desenvolvimento-ia.md` para a **raiz do repositório** (`plano-desenvolvimento-ia.md`).
- Atualizar **todas** as referências no repositório de `newdocs` → `docs` e do plano para o novo path na raiz. Arquivos conhecidos: `README.md`, `client/STORE_RELEASE.md`, `openapi/openapi.yaml`, documentos em `docs/en|pt-br|it/engineering-and-operations/`, `agents/*.md`, `plano-desenvolvimento-ia.md` (conteúdo interno).
- Ajustar o `plano-desenvolvimento-ia.md` na raiz: ele passa a referenciar `docs/en/` como spec e a si mesmo na raiz; remover menções de que o plano mora dentro de `docs/`.

**2. Remover artefatos de refatoração (não declaratórios)**

Excluir da árvore de documentação — após extrair o que for necessário para a integração:

| Arquivo | Motivo |
|---------|--------|
| `UX-Audit.md` | Diagnóstico pontual do layout antigo vs guia; não é spec de produto |
| `UX-Redesign-Proposal.md` | Proposta/roadmap de redesign; não é spec de produto |
| `ux-refactor-agent.md` | Prompt operacional de agente de refatoração; não é spec de produto |

Não remover conteúdo declarativo que só exista nesses arquivos sem antes incorporá-lo na spec oficial, se aplicável.

**3. Integrar o Style Guide na documentação oficial**

Fonte de verdade visual: `Intensity-Design-System-Style-Guide.md`. O arquivo standalone deve ser **absorvido** na estrutura `docs/{en,pt-br,it}/` e depois removido da raiz de `docs/`.

**Estratégia de integração (escolha a mais coerente após análise — documente a decisão no PR ou em nota no `experience-and-identity.md`):**

- Criar `docs/en/solution-specification/design-system.md` (e equivalentes traduzidos) seguindo o formato Short / Medium / Detailed dos demais documentos da camada 2, incorporando: personalidade, direção flat cartoon, paleta com tokens hex, tipografia, bordas, sombras, ilustrações, ícones, componentes (cards colecionáveis), animações, ritual de sorteio, regra principal (evitar Jira/Notion; buscar Duolingo/Finch).
- Revisar `experience-and-identity.md` em `en`, `pt-br` e `it`: substituir declarações visuais obsoletas (ex.: acentos marrom/azul como identidade principal, gradientes corporativos) pelo que o design system define; **manter** o que continua válido (terminologia canônica, tom de voz, painéis de autenticação, fluxos de convite, ações destrutivas, localização, princípios de consentimento e progressive disclosure).
- Onde `functional-components.md` ou outros docs da camada 2 descrevem aparência ou padrões visuais conflitantes, alinhar ao design system ou referenciar `design-system.md` em vez de duplicar tokens.
- Garantir links cruzados: `experience-and-identity.md` → `design-system.md`; `tools.md` / `development-process.md` → `docs/en/` atualizado.

**Sincronização multilíngue:**

- Inglês (`docs/en/`) é canônico; traduzir integralmente o novo/alterado conteúdo para `pt-br/` e `it/`, mantendo paridade estrutural entre os três idiomas.

**4. Coerência global**

- Percorrer os 42 documentos em `docs/en/` (e traduções) em busca de menções a `newdocs`, paths antigos, identidade visual desatualizada ou referências aos arquivos removidos; corrigir ou redirecionar.
- Não alterar regras de negócio, modelo de dados, contratos REST ou arquitetura, exceto quando uma frase descrever visual obsoleto que contradiz o design system.
- Não modificar código-fonte (`api/`, `client/`) nesta tarefa.

**Regras arquiteturais da documentação:**

- Preservar as quatro camadas e convenção de profundidade Short / Medium / Detailed.
- `docs/en/` permanece fonte canônica de produto e engenharia.
- O plano operacional na raiz complementa a spec; não duplicar conteúdo de spec dentro dele.
- Evitar duplicação longa: design tokens vivem em `design-system.md`; `experience-and-identity.md` foca identidade, UX comportamental e tom, referenciando o design system para detalhes visuais.

**Critérios de aceitação:**

- A pasta `newdocs/` não existe; `docs/` contém apenas a árvore `en/`, `pt-br/`, `it/` (sem artefatos soltos de refatoração na raiz).
- `plano-desenvolvimento-ia.md` está na raiz do repositório com referências internas corretas.
- `UX-Audit.md`, `UX-Redesign-Proposal.md` e `ux-refactor-agent.md` foram removidos.
- `Intensity-Design-System-Style-Guide.md` não existe mais como arquivo solto; seu conteúdo declarativo está integrado na spec oficial em três idiomas.
- `experience-and-identity.md` não contradiz o design system (paleta, tipografia, direção flat cartoon, regra anti-corporativa).
- Existe documento de design system na camada 2 (ou estrutura equivalente documentada) em `en`, `pt-br` e `it`.
- `README.md`, `openapi/openapi.yaml` e demais referências externas apontam para `docs/` e para o plano na raiz.
- Nenhum link quebrado para paths `newdocs/` ou arquivos removidos.

**Restrições:**

- Não traduzir código-fonte nem renomear pacotes Java/TypeScript (tarefa separada neste backlog).
- Não reescrever documentação de produto além do necessário para integrar o design system e eliminar contradições visuais.
- Não arquivar os artefatos removidos em subpastas — excluir de fato, salvo se o repositório tiver política explícita de `archive/` (neste caso, justificar).

---

## Centralizar referências de documentação

### Descrição

O repositório concentra dezenas de arquivos Markdown espalhados entre `docs/`, `agents/`, `README.md`, `plano-desenvolvimento-ia.md` (raiz), `deploy/` e outros pontos de entrada. Hoje esses documentos apontam uns para os outros com caminhos relativos ou nomes de arquivo soltos — por exemplo, `plano-desenvolvimento-ia.md` cita dezenas de specs apenas como `` `tools.md` `` ou `` `data-model.md` ``, enquanto o `README.md` usa caminhos completos como `docs/en/`. Qualquer mudança futura de local exigiria caça manual a referências em vários arquivos, com alto risco de links quebrados e instruções desatualizadas para agentes de IA.

Esta tarefa deve introduzir um mapa centralizado de referências: um único artefato canônico onde cada documento ou recurso relevante recebe um identificador estável. Os demais arquivos passam a citar esse identificador em vez do caminho físico. Quando um arquivo mudar de lugar no futuro, basta atualizar o caminho no mapa — sem varrer todo o repositório. O valor entregue é resiliência a reorganizações futuras, consistência entre humanos e agentes, e base para validação automática de referências quebradas.

**Por que vem em segundo:** depende da estrutura final de `docs/` e do plano na raiz (tarefa anterior). Criar o mapa sobre paths ainda em `newdocs/` ou incluir artefatos que serão excluídos geraria retrabalho imediato.

### Prompt IA

**Pré-requisito:** a tarefa "Refatorar e consolidar documentação do produto" deve estar concluída (`docs/`, plano na raiz, artefatos de refatoração visual removidos).

Analise o repositório e mapeie onde documentos Markdown referenciam outros arquivos (links markdown, menções em backticks, caminhos em texto corrido). Priorize: `README.md`, `plano-desenvolvimento-ia.md`, `agents/*.md`, `client/STORE_RELEASE.md`, `docs/en/engineering-and-operations/tools.md` e quaisquer outros arquivos com referências cruzadas relevantes.

**Objetivo:** criar um registro central de referências e migrar os documentos prioritários para usá-lo.

**Artefato central (proposta inicial — ajuste se o projeto já tiver convenção melhor):**
- Arquivo na raiz ou em pasta de metadados de documentação (ex.: `docs/refs.yaml` ou `references.md`).
- Cada entrada deve ter: `id` (identificador estável, kebab-case), `path` (caminho relativo à raiz do repo), `label` (nome legível) e, quando aplicável, `locale` ou `role` (ex.: spec canônica en, plano operacional, agente de backlog).
- Incluir também pastas lógicas usadas com frequência (ex.: spec canônica `docs/en/`, OpenAPI, deploy, plano na raiz).

**Convenção de uso nos `.md`:**
- Substituir caminhos físicos repetidos por referência ao `id` do mapa.
- Formato sugerido para citação inline: `` @ref:<id> `` ou link simbólico documentado no próprio mapa — escolha um formato único, documente-o no topo do arquivo central e aplique de forma consistente.
- Manter links markdown clicáveis onde fizer sentido para leitores humanos (resolver o `id` para o `path` atual do mapa no momento da migração).

**Escopo da migração inicial:**
- Cobrir todas as referências identificadas nos arquivos prioritários listados acima.
- Registrar no mapa os paths canônicos dos 42 documentos em `docs/en/` (e equivalentes pt-br/it), mesmo que a migração para `@ref:` nesses arquivos seja incremental.
- Atualizar instruções em `agents/write-task.md` e `agents/order-backlog.md` para que agentes consultem o mapa ao citar arquivos do projeto.

**Validação (recomendado, mínimo viável):**
- Script simples (shell, Node ou Python — use o que já existir no repo) que lê o mapa, verifica se cada `path` existe no disco e falha se algum `id` referenciado nos `.md` migrados não existir no mapa.
- Integrar verificação ao CI existente em `.github/` se houver workflow adequado; caso contrário, documentar comando manual no README ou no próprio mapa.

**Regras arquiteturais:**
- O `id` é estável; só o `path` muda quando arquivos são movidos.
- Preservar `docs/en/` como idioma canônico da spec, alinhado ao que já está documentado no projeto.
- Não alterar o conteúdo semântico dos documentos — apenas a forma de referenciar caminhos.
- Não renomear pastas nem reorganizar a árvore de documentação nesta tarefa.

**Critérios de aceitação:**
- Existe um único arquivo de mapa de referências versionado no repositório, com documentação de uso no próprio arquivo.
- Os arquivos prioritários citam `id`s do mapa em vez de caminhos hardcoded repetidos.
- O mapa contém entradas para documentos e pastas usados com frequência por agentes e pelo plano de desenvolvimento.
- Existe verificação (script ou CI) que detecta `path` inexistente ou `id` órfão nos arquivos migrados.
- Agentes em `agents/` foram instruídos a usar o mapa ao referenciar artefatos do projeto.

**Restrições:**
- Não remover documentação existente.
- Não introduzir dependências pesadas de build só para resolver referências, a menos que já existam no projeto.
- Não alterar código-fonte (`api/`, `client/`).

---

## Refatorações

## Traduzir código-fonte para inglês

### Descrição

Grande parte do código do Intensity foi escrita com identificadores em português, refletindo o vocabulário de domínio do produto mas contrariando a convenção de engenharia do projeto — documentada em `docs/en/engineering-and-operations/technical-decisions.md` (DT-12 e DT-13), que já exemplifica nomes em inglês como `ExecutarSorteioUseCase` e pastas como `participante/` e `grupo/`. Na API Spring Boot, isso aparece em pacotes (`com.intensity.participante`, `grupo`, `caixinha`, `experiencia`, `convite`), classes (`Grupo`, `Participante`, `Caixinha`, `Experiencia`, `Convite`), rotas REST (`/v1/grupos`, `/v1/participantes`, `/v1/caixinhas`, `/v1/experiencias`, `/v1/convites`, `/v1/auth/grupo`, ações `validar`/`aceitar`/`membros`) e schema PostgreSQL nas migrações Flyway (`participante`, `grupo`, `caixinha`, `experiencia`, `convite`). No client React/TypeScript, há pastas e arquivos como `domain/convite/`, `domain/sorteio/`, `ExecutarSorteioUseCase`, `FiltroIntensidadePolicy` e `RevelacaoOrchestrator`. O contrato OpenAPI em `openapi/openapi.yaml` replica os mesmos paths em português.

Essa inconsistência dificulta manutenção, onboarding de contribuidores e alinhamento com a spec canônica em inglês (`docs/en/`). A refatoração deve ser completa e cuidadosa: renomear tudo que é código (identificadores, paths de API, tabelas/colunas, imports, testes, configurações) para inglês sem alterar comportamento. Documentação em texto — planos, specs, README, comentários de agentes — **não** deve ser traduzida como conteúdo; apenas as **referências a código** nesses arquivos (nomes de classes, endpoints, tabelas, pacotes, paths de arquivo de código) devem ser atualizadas para refletir os novos nomes. Strings voltadas ao usuário final permanecem no sistema de i18n (`client/src/i18n/locales/`) e não fazem parte desta tarefa.

**Por que vem por último:** é a refatoração estrutural mais ampla e de maior risco (API, banco, client, OpenAPI). Executá-la com documentação já consolidada e mapa de referências ativo reduz retrabalho em paths de docs e permite atualizar o mapa central em um único lugar quando pacotes e endpoints mudarem.

### Prompt IA

**Pré-requisitos:** documentação consolidada em `docs/` e mapa centralizado de referências implementado (tarefas anteriores deste backlog).

Realize uma refatoração sistemática de português para inglês em **todo o código-fonte** do monorepo (`api/`, `client/`, `openapi/`, migrações Flyway, testes, CI). Preserve comportamento e contratos funcionais; nenhuma regressão é aceitável.

**Inventário inicial (confirmar e completar antes de alterar):**
- API: pacotes Java, classes, métodos, `@RequestMapping`, `@Table`/`@Column`, repositórios, DTOs, testes de integração.
- Banco: migrações em `api/src/main/resources/db/migration/` — tabelas e colunas em português.
- Client: pastas em `domain/`, nomes de arquivos, classes/funções exportadas, imports, chamadas à API que usam paths em português.
- Contrato: `openapi/openapi.yaml` — paths, tags, operationIds, schemas se aplicável.
- Configuração e deploy: referências a paths ou nomes de artefatos em português, se existirem.
- Documentação: **somente** trechos que citam código (ex.: `docs/en/solution-architecture/integrations-and-communication.md`, `docs/en/engineering-and-operations/technical-decisions.md`, `plano-desenvolvimento-ia.md`, `README.md`, `client/STORE_RELEASE.md`). Não traduzir prosa, specs pt-br/it, nem copy de produto.
- Mapa de referências: atualizar `path`s de entradas que apontem para código renomeado; manter `id`s estáveis.

**Mapa de tradução de domínio (base — aplicar de forma consistente):**

| Português (atual) | Inglês (alvo) |
|-------------------|---------------|
| participante | participant |
| grupo | group |
| caixinha | box |
| experiencia | experience |
| convite | invite |
| sorteio | draw |
| revelacao | revelation |
| filtro (intensidade) | filter / intensity filter |
| validar | validate |
| aceitar | accept |
| membros | members |

**Ordem sugerida de execução (minimizar janelas quebradas):**
1. Definir tabela de renomeação completa e validá-la contra OpenAPI + testes existentes.
2. Atualizar `openapi/openapi.yaml` como fonte de verdade do contrato REST.
3. Refatorar API (pacotes, classes, controllers, entidades JPA, repositórios, serviços).
4. Tratar schema do banco: se já houver ambiente com dados, criar **nova** migração Flyway de rename (não editar migrações já aplicadas); se ambiente ainda greenfield, avaliar consolidar renomes nas migrações existentes sem quebrar histórico versionado em produção.
5. Refatorar client (pastas, use cases, adapters, testes) alinhado aos novos paths da API.
6. Atualizar referências a código na documentação listada acima e no mapa centralizado de referências.
7. Executar suite completa: `./mvnw test` na API, `npm test` / `npm run build` no client, validação OpenAPI vs implementação.

**Regras arquiteturais:**
- Seguir DT-12 (API por domínio) e DT-13 (Clean Architecture no client) — apenas trocar idioma dos identificadores, não reestruturar camadas.
- Manter DT-10: se a API já estiver em uso externo, avaliar necessidade de `/v2` ou período de compatibilidade; caso contrário, renomear em `/v1` de forma coordenada com client e OpenAPI na mesma entrega.
- Não alterar conteúdo de `client/src/i18n/locales/*.json` exceto se houver chaves de tradução que espelhem nomes de código interno (improvável — verificar).
- Não traduzir nomes de produto na UI ("Intensity", "Experience Box") nem documentação de produto em pt-br/it.
- Preservar convenções existentes: kebab-case em URLs, PascalCase em classes Java/TS, camelCase em métodos/propriedades.
- Commits atômicos por camada são desejáveis, mas a entrega deve deixar o repositório em estado consistente (build verde).

**Critérios de aceitação:**
- Não restam pacotes, pastas de domínio, classes, arquivos de código ou endpoints REST com vocabulário português do domínio (participante, grupo, caixinha, experiencia, convite, sorteio, etc.).
- Schema PostgreSQL e entidades JPA usam nomes em inglês; migrações são reproduzíveis do zero (`flyway migrate` em banco limpo).
- `openapi/openapi.yaml` está alinhado com a implementação da API.
- Client compila, testes passam e todas as chamadas HTTP usam os novos paths.
- Testes de integração da API passam sem alteração de comportamento esperado.
- Documentação que citava identificadores ou paths antigos foi atualizada **apenas nas referências a código**; conteúdo narrativo permanece no idioma original de cada documento.
- `technical-decisions.md` (en) reflete os novos exemplos de nomenclatura (ex.: `ExecuteDrawUseCase`, `participant/`, `group/`).
- Mapa centralizado de referências atualizado para paths de código renomeados.

**Restrições:**
- Não traduzir documentação de produto (prosa em pt-br, it, ou en) além de referências técnicas a código.
- Não alterar regras de negócio, fluxos de tela ou contratos de erro além do necessário para o rename.
- Não renomear `docs/` nem reorganizar pastas de documentação nesta tarefa.
