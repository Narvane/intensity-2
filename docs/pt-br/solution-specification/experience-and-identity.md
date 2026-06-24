# Experiência e Identidade

Este documento define as diretrizes de UX e o tom de comunicação do Intensity — como o produto fala com os usuários e como telas-chave se comportam. É escrito para designers, product owners e quem molda a comunicação voltada ao usuário.

**Apresentação visual** (paleta, tipografia, componentes, movimento) é canônica em [`design-system.md`](design-system.md). Este documento cobre terminologia, tom de voz, comportamentos de tela e padrões de consentimento.

---

## Curta

O Intensity apresenta uma marca **calorosa, íntima e corajosa** com visual **flat cartoon de aventura social** definido no design system. A voz é direta, encorajadora e respeitosa do consentimento do grupo. Dois modos de acesso — **Experiências** e **Caixa de Experiências** — permanecem funcionalmente distintos em layout e copy; acentos visuais seguem `design-system.md`.

---

## Média

### Essência da marca

| Atributo | Expressão |
|----------|-----------|
| **Conexão** | Ilustrações flat cartoon no onboarding, imagens em pares, linguagem de proximidade |
| **Intensidade** | Escala de calor afetivo (1–5), rótulos claros de nível, animação deliberada de revelação |
| **Descoberta** | Chips de sugestão lúdicos, tipos temáticos de caixinha, curiosidade no copy |
| **Presença** | Chrome mínimo durante ritual de sorteio; foco no momento da carta |

### Apresentação visual

Tokens de cor, tipografia, raios, sombras, componentes e movimento estão em [`design-system.md`](design-system.md). Não duplicar tokens aqui.

**Acentos por modo (resumo):**

| Modo | Indicador visual (ver design system) |
|------|--------------------------------------|
| Experiências | Contexto de contribuição com acento roxo flat |
| Caixa de Experiências | Contexto de ritual com destaque coral |
| Entrar via convite | Chip amarelo ou turquesa — distinto dos painéis de login |

### Logo e nomenclatura

- **Nome do produto:** Intensity — sempre capitalizado na interface
- **Logo:** Wordmark arredondado e lúdico em coral; formato de caixinha/etiqueta; usado em splash, onboarding e cabeçalhos de autenticação (ver Brand mark em `design-system.md`)
- **Ícone do app:** Motivo abstrato de energia calorosa (assets de loja)

### Princípios de UX

1. **Clareza de modo** — layout, copy e cor de destaque sinalizam imediatamente Experiências vs Caixa de Experiências
2. **Divulgação progressiva** — intensidade antes do texto; prévia de convite antes de entrar
3. **Consentimento explícito** — confirmações para excluir caixinha, sair do grupo, aceitar convite
4. **Estados vazios como orientação** — caixinha vazia incentiva contribuição; pool de sorteio vazio explica filtros
5. **Linha de base de acessibilidade** — alvos de toque ≥44pt (preferir 48px no design system); contraste WCAG AA; rótulos de leitor de tela em ações primárias

### Terminologia (canônica)

| Termo na interface | Significado |
|--------------------|-------------|
| Experiência | Uma ideia concreta para fazer juntos |
| Caixinha | Coleção temática de experiências |
| Caixa de Experiências | Modo em grupo para caixinhas e ritual de sorteio |
| Grupo | Pessoas que compartilham caixinhas |
| Intensidade | Quão ousada uma experiência parece (1–5) |
| Sorteio | Seleção aleatória de uma experiência de uma caixinha |
| Revelar | Virar carta para ver descrição completa |
| Selo | Marca de integridade na carta de experiência |
| Convite | Link ou código para entrar em um grupo |
| Proponente | Pessoa que contribuiu uma experiência |

Evitar termos técnicos como "hash" no copy do usuário — usar **Selo**.

---

## Detalhada

### Narrativa visual do onboarding

Quatro etapas ilustradas contam a história emocional: rotinas repetitivas → saudade de conexão → momentos inusitados adiados → Intensity como resposta. Ilustrações usam casais e grupos de amigos diversos em estilo flat cartoon; tom é esperançoso, não clínico.

### Painéis de autenticação

Três subpainéis dentro de uma tela de autenticação:

| Painel | Indicador visual | Ação primária |
|--------|------------------|---------------|
| Login Experiências | Destaque roxo flat (`--purple`) | Formulário de credencial única |
| Login Caixa de Experiências | Destaque coral | Cartões multi-credencial com "+" para adicionar participante |
| Registro | Superfície neutra sobre fundo quente | Nome de exibição, e-mail, senha |
| Entrar via convite | Chip amarelo ou turquesa | Campo de entrada de código + "Continuar" |

Entrada por convite é acessível da autenticação sem login completo — leva à tela de prévia após validação do código.

### Apresentação de tipos de caixinha

Onze tipos aparecem em **grade de duas colunas** com:

- Badge de ícone sobre cor sólida da categoria (ver cores de caixinha em `design-system.md`)
- Título
- Dica de subtítulo

O catálogo tem seções internas de apresentação (amigos, casal, pessoal, social), mas a UI de criação mostra uma **lista plana** sem cabeçalhos de seção.

### Cartas de experiência

**Carta de lista (modo Experiências):** chip de intensidade, indicadores de parâmetro, selo, descrição truncada ou oculta dependendo da autoria.

**Carta de sorteio (modo Caixa de Experiências):** carta de dois lados com animação de virada no eixo Y. Capa: número de intensidade em destaque, parâmetros compactos, selo discreto. Face: descrição completa e reflexão (autoria oculta no ritual).

### Ações destrutivas

**Excluir caixinha** e **Sair do grupo** usam:

- Tratamento de aviso na confirmação (coral-strong ou estilo destrutivo dedicado em `design-system.md`)
- Resumo do impacto (contagem de experiências / perda de membresia)
- Cancelar como padrão seguro (botão secundário)

**Excluir experiência** (apenas autor): diálogo de confirmação mais simples; sem cascata além do item único.

### Folha de compartilhamento de convite

Folha de compartilhamento nativa com mensagem pré-preenchida:

*"Entre no nosso grupo no Intensity — [link]. Ou digite o código: [CÓDIGO]"*

Código exibido em tipografia arredondada grande com espaçamento entre letras — copiável, sem monoespaçado. Expiração mostrada como data legível.

### Tom de voz

| Contexto | Estilo |
|----------|--------|
| Onboarding | Caloroso, narrativo, segunda pessoa |
| Guia rápido | Regras diretas, verbos imperativos |
| Dica de alinhamento | Gentil, chip amarelo — "Reservem um momento juntos antes de revelar" |
| Erros | Linguagem simples, recuperação acionável |
| Estados vazios | Encorajador, nunca culpando |

**Exemplos:**

- ✓ "Sorteiem de novo se esta não couber no momento."
- ✓ "Todos na sala devem pertencer ao mesmo grupo."
- ✗ "Invalid group_combination_error."

### Localização

A interface suporta **inglês**, **português (Brasil)** e **italiano**. Termos de domínio são traduzidos consistentemente (ver docs localizados). Exemplos de pacotes de sugestão seguem o idioma da interface onde pacotes localizados existem; exemplos canônicos de autoria permanecem em português no catálogo embutido.

### O que a identidade evita deliberadamente

- Badges de gamificação ou sequências
- Estética de feed social
- Padrões de UI corporativa enterprise
- Urgência agressiva ou copy de FOMO

## Decisões assumidas nesta reescrita

- UI de **Convite** usa destaque amarelo ou turquesa para distinguir dos modos de autenticação (`design-system.md`).
- **Excluir caixinha** segue o mesmo padrão de confirmação destrutiva que sair do grupo.
- Rótulos de filtro na UI usam **Exata** e **Até** (não nomenclatura interna "fixed/max").
