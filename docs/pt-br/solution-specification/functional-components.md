# Componentes Funcionais

Este documento cataloga os módulos funcionais do Intensity, telas, fluxos de usuário e comportamentos de interface — o que o usuário pode fazer, onde e sob quais condições. Especifica *o que existe funcionalmente* na interface, sem detalhes de implementação.

**Público:** analistas, product owners, designers e QA funcional — pessoas que precisam mapear funcionalidades, jornadas e comportamentos de tela sem saber como o app foi construído.

**Apresentação visual** das telas e componentes segue [`design-system.md`](design-system.md).

---

## Curta

O Intensity é um **aplicativo mobile** organizado em torno de **quatorze telas primárias** mais sobreposições. Após bootstrap e onboarding opcional, o usuário se autentica em um de quatro caminhos (**Experiências**, **Caixa de Experiências**, **Registro** ou **Entrar via convite**). O caminho **Experiências** flui por seleção de grupo → seleção de caixinha → lista de experiências → assistente de criação. O caminho **Caixa de Experiências** flui por página inicial da caixinha (listar, criar, convidar, excluir) → momento compartilhado (sorteio e revelação). Cada tela trata estados de **carregamento**, **vazio** e **erro** explicitamente.

---

## Média

### Módulos funcionais

| Módulo | Propósito |
|--------|-----------|
| **Bootstrap** | Carregar preferência de idioma e estado de primeira execução antes de mostrar conteúdo |
| **Onboarding** | Introdução ilustrada em quatro etapas à história do produto |
| **Guia rápido** | Manual reutilizável com regras centrais, fluxo e dicas |
| **Autenticação** | Login (Experiências ou Caixa de Experiências), registro, entrada por convite, acesso à ajuda |
| **Entrar via convite** | Prévia do grupo e aceitar membresia |
| **Seleção de grupo** | Escolher a qual grupo contribuir (modo Experiências) |
| **Seleção de caixinha** | Escolher qual caixinha dentro do grupo (modo Experiências) |
| **Lista de experiências** | Ver, revelar, editar e excluir experiências próprias na caixinha ativa |
| **Assistente de criação** | Fluxo guiado em cinco etapas para registrar nova experiência |
| **Página inicial da caixinha** | Listar, criar, convidar para e excluir caixinhas (modo Caixa de Experiências) |
| **Criar caixinha** | Subtela da página inicial da caixinha |
| **Gerenciamento de grupo** | Compartilhamento de convite, sair do grupo (da página inicial da caixinha ou contexto de grupo em Experiências) |
| **Momento compartilhado** | Sorteio aleatório com filtros, dica de alinhamento e revelação de carta |
| **Recuperação de erro** | Tela para estado de sessão não reconhecido com opções de saída |

### Catálogo de telas

| # | Tela | Quando exibida |
|---|------|----------------|
| 1 | Carregamento bootstrap | Preferências de idioma/onboarding não prontas |
| 2 | Onboarding (4 etapas) | Primeira execução |
| 3 | Guia rápido | Do onboarding ou ajuda na autenticação; sobreposição |
| 4 | Autenticação | Sem sessão ativa; onboarding completo |
| 5 | Entrar via convite | Código válido inserido na autenticação ou deep link |
| 6 | Sessão desconhecida | Modo de acesso da sessão não reconhecido |
| 7 | Seleção de grupo | Modo Experiências; nenhum grupo escolhido |
| 8 | Seleção de caixinha | Modo Experiências; grupo definido, caixinha não escolhida |
| 9 | Lista de experiências | Modo Experiências; grupo e caixinha definidos |
| 10 | Assistente de criação | Sobreposição da lista de experiências |
| 11 | Página inicial da caixinha | Modo Caixa de Experiências |
| 12 | Criar caixinha | Subtela da página inicial da caixinha |
| 13 | Momento compartilhado | Modo Caixa de Experiências; caixinha aberta |
| 14 | Compartilhar convite | Folha/sobreposição da página inicial da caixinha ou gerenciamento de grupo |

A autenticação contém quatro **subpainéis** (não rotas separadas): login Experiências, login multi Caixa de Experiências, registro e entrada de código de convite.

### Principais fluxos de usuário

```
Fluxo A — Primeira execução
  Bootstrap → Onboarding (4 etapas) → [Guia rápido opcional] → Autenticação

Fluxo B — Experiências (contribuição individual)
  Auth → Seleção de grupo → Seleção de caixinha → Lista de experiências
    → [+ Criar] → Sobreposição do assistente → volta à lista
  Voltar: lista → seleção de caixinha → seleção de grupo
  Sair: logout de qualquer tela autenticada

Fluxo C — Caixa de Experiências (ritual em grupo)
  Auth (multiusuário) → Página inicial da caixinha → [Criar caixinha | Convidar | Excluir caixinha]
    → Abrir caixinha → Momento compartilhado → Sortear → Alinhar → Revelar → Voltar ao sorteio
  Voltar: momento compartilhado → página inicial da caixinha
  Sair: logout

Fluxo D — Entrar via convite
  Entrada de convite na auth OU deep link → Prévia de entrada → Aceitar → Seleção de grupo (Experiências)
    OU prompt para entrar na Caixa de Experiências com membros do grupo

Fluxo E — Recuperação de erro
  Sessão desconhecida → Logout OU Entrar na Caixa de Experiências (limpa sessão)
```

### Formação de grupo e convites

**Quando um grupo nasce:**

1. Dois ou mais participantes se autenticam juntos no modo Caixa de Experiências — combinação nova cria um grupo.
2. Primeiro membro também pode começar solo (uma credencial); grupo existe com um membro até outros entrarem via convite ou login conjunto futuro.

**Fluxo de convite:**

1. Membro abre **Convite** na página inicial da caixinha ou menu de grupo no modo Experiências.
2. App gera link + código de 6 caracteres (válido 7 dias).
3. Membro compartilha via folha de compartilhamento do sistema ou copia código.
4. Destinatário insere código na tela de autenticação ou abre deep link.
5. **Prévia de entrada** mostra nomes de exibição dos membros (não e-mails).
6. Destinatário aceita → adicionado ao grupo → chega na seleção de grupo (Experiências) ou mensagem de sucesso com orientação de próximo passo.

**Permissões:**

| Ação | Quem |
|------|------|
| Criar convite | Qualquer membro do grupo |
| Revogar convite | Criador ou qualquer membro |
| Aceitar convite | Convidado (conta registrada obrigatória) |
| Sair do grupo | Qualquer membro (confirmar); último membro dispara exclusão do grupo |

**Erros:** código inválido/expirado/revogado; já é membro; falha de rede; registro na allowlist obrigatório para novos usuários.

### Exclusão de caixinha

Disponível na **página inicial da caixinha** no modo Caixa de Experiências:

1. Membro abre menu de contexto no cartão da caixinha → **Excluir caixinha**.
2. Diálogo de confirmação: nome da caixinha, contagem de experiências, aviso de irreversibilidade.
3. Confirmar → caixinha e todas as experiências removidas → retorno à página inicial da caixinha com toast de sucesso.
4. Cancelar → sem alteração.

**Quem pode excluir:** qualquer membro autenticado na sessão atual da Caixa de Experiências.

**Erros:** falha de rede (retry oferecido); não autorizado se sessão inválida.

### Etapas do assistente de criação

| Etapa | Rótulo | Ação do usuário |
|-------|--------|-----------------|
| 1 — Sugestão | Escrever descrição ou tocar sugestão de tipo como inspiração |
| 2 — Reflexão | Justificar por que o grupo aceitaria a ideia |
| 3 — Parâmetros | Avaliar esforço, abertura, novidade (1–5 estrelas cada) |
| 4 — Classificação | Confirmar ou ajustar intensidade geral (auto-sugerida dos parâmetros) |
| 5 — Ramificação | Revisar resumo; salvar e criar outra, ou finalizar |

Carta de descrição persistente e indicador de progresso de cinco segmentos ao longo de todo o fluxo.

### Funcionalidades do momento compartilhado

- **Modos de filtro:** Qualquer (sem filtro de intensidade), Exata (nível fixo 1–5), Até (máximo inclusivo)
- **Ação de sortear:** seleção aleatória entre experiências elegíveis na caixinha
- **Carta de resultado:** capa de intensidade (nível, parâmetros, selo) antes da revelação
- **Dica de alinhamento:** solicita acordo do grupo antes de virar a carta
- **Revelar:** virada no eixo Y para ler descrição completa
- **Retorno:** voltar ao sorteio para nova seleção

### Onze tipos de caixinha

Cada tipo tem título, dica de subtítulo, destaque visual e pacote de sugestão associado. Padrão: **Saídas com amigos**.

---

## Detalhada

### Carregamento bootstrap

Mostra splash da marca enquanto carrega preferências locais (idioma, flag de onboarding concluído). Transiciona para onboarding ou autenticação. Erro: tentar novamente carregar preferências.

### Onboarding

Quatro etapas deslizáveis com ilustrações e copy. Etapa final oferece entrada no guia rápido ou pular para autenticação. Nunca mostrado novamente após conclusão (flag armazenada localmente).

### Autenticação

**Login Experiências:** e-mail + senha → seleção de grupo.

**Login Caixa de Experiências:** um ou mais cartões de credencial; "+" adiciona outro participante. Todos devem autenticar com sucesso. Todos os participantes devem pertencer ao **mesmo grupo** ao entrar em grupo existente, OU formar novo grupo se a combinação for nova. Erro de incompatibilidade explica que credenciais pertencem a grupos diferentes.

**Registro:** nome de exibição, e-mail, senha. E-mail deve estar na allowlist do operador. Sucesso → painel de login.

**Entrada de código de convite:** campo de 6 caracteres; valida formato → prévia de entrada ou erro.

Ícone de ajuda abre sobreposição do guia rápido.

### Entrar via convite

Exibe: primeiros nomes / nomes de exibição dos membros do grupo, expiração do convite, botões aceitar e cancelar. Aceitar exige sessão autenticada — se aberto via deep link sem sessão, solicita login ou registro primeiro. Sucesso navega para seleção de grupo em Experiências com novo grupo pré-selecionado.

### Seleção de grupo (Experiências)

Lista grupos onde o participante é membro. Estado vazio: "Entre em um grupo via convite ou entre na Caixa de Experiências com outros." Cada linha mostra contagem de membros e dica opcional de última atividade. Ações: selecionar grupo, **Convidar** (compartilhar novo convite), **Sair do grupo** (confirmar).

### Seleção de caixinha (Experiências)

Lista caixinhas no grupo selecionado. Estado vazio: "Criem uma caixinha juntos no modo Caixa de Experiências." Selecionar caixinha → lista de experiências.

### Lista de experiências

Mostra contribuições na caixinha ativa. Itens próprios: intensidade, parâmetros e selo sempre visíveis; descrição e reflexão reveláveis pelo autor via ícone de olho; editar e excluir no rodapé do card. Itens de outros: apenas resumo de intensidade + selo (sem descrição). Ações da página: criar (+), logout, voltar.

**Editar experiência:** autor abre edição no menu do item → mesmos campos do assistente (pré-preenchidos) → salvar.

### Página inicial da caixinha (Caixa de Experiências)

Grade de duas colunas de cartões de caixinha com selo de tipo, nome, subtítulo. Ações por cartão: **Abrir**, **Excluir** (menu). Ações do cabeçalho: **Criar caixinha**, **Convidar**, logout. Estado vazio: CTA para criar primeira caixinha.

**Diálogo excluir caixinha:** "Excluir [nome]? Isso remove [N] experiências permanentemente." Confirmar / Cancelar.

### Criar caixinha

Campo de nome, seletor de tipo (lista plana de 11 tipos), botão criar. Validação: nome obrigatório (1–80 caracteres). Sucesso retorna à página inicial da caixinha com novo cartão.

### Momento compartilhado

Chips de filtro + seletor de intensidade opcional (padrão 3 — Coragem). Rótulo do botão de sortear adapta ao modo de filtro. Carregando: "Escolhendo…". Caixinha vazia: carta de dica para adicionar experiências via modo Experiências. Pool de filtro vazio: "Nenhuma experiência disponível."

Pós-sorteio: dica de alinhamento (âmbar tracejado), botão revelar, voltar ao sorteio. Estado revelado mostra descrição completa e reflexão, sem identificar o autor.

### Sessão desconhecida

Exibida quando contexto de sessão armazenado é inválido. Opções: logout (limpar tudo) ou mudar para entrada da Caixa de Experiências (limpa modo, mantém credenciais se houver).

### Estados de UI transversais

| Estado | Padrão |
|--------|--------|
| Carregando | Skeleton ou spinner com rótulo acessível |
| Vazio | Ilustração + CTA primário + copy explicativo |
| Erro | Mensagem inline + retry quando aplicável |
| Rede offline | Banner em telas autenticadas; bloqueia ações destrutivas até online |

### Notas de acessibilidade

Botões primários têm rótulos de acessibilidade. Ações de sortear e revelar anunciam mudanças de estado. Confirmações de exclusão prendem foco até dispensadas. Cores de intensidade complementadas com rótulos de texto (nunca significado apenas por cor).

## Decisões assumidas nesta reescrita

- **Convite** é um fluxo dedicado com tela de prévia e folha de compartilhamento.
- **Exclusão de caixinha** fica no menu de contexto da página inicial da caixinha com confirmação em cascata.
- Login na Caixa de Experiências valida **membresia no mesmo grupo** quando combinação corresponde a grupo existente.
- Fluxo de **editar experiência** está explicitamente documentado (faltava na documentação anterior).
