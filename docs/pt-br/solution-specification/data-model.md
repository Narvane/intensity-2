# Modelo de Dados

Este documento define o modelo de domínio funcional do Intensity — entidades, relacionamentos, atributos e regras de negócio no nível de especificação. É escrito para analistas, product owners, designers e QA que precisam entender quais dados existem e como se comportam, sem detalhes de implementação.

---

## Curta

O domínio centra-se em **Participante**, **Grupo**, **Caixinha** e **Experiência**, além de **Resultado de Sorteio** transitório e **Contexto de Sessão** operacional. Um grupo é um conjunto de participantes que compartilham caixinhas; forma-se por login conjunto na Caixa de Experiências ou cresce via **Convite**. Caixinhas contêm experiências; apenas o autor edita ou exclui uma experiência. Caixinhas podem ser **excluídas** no modo Caixa de Experiências, removendo todas as experiências contidas. Resultados de sorteio não são persistidos.

---

## Média

### Entidades centrais

| Entidade | Definição | Atributos-chave |
|----------|-----------|-----------------|
| **Participante** | Pessoa registrada que contribui e entra em grupos | Nome de exibição, e-mail (login), credenciais |
| **Grupo** | Conjunto de participantes que compartilham caixinhas | Lista de membros, momento de criação |
| **Caixinha** | Contêiner temático nomeado de experiências | Nome, tipo (1 de 11), momento de criação, grupo pai |
| **Experiência** | Ideia concreta autoria de um participante | Descrição (≤1.000 caracteres), intensidade (1–5), esforço/abertura/novidade (1–5 cada), reflexão (≤2.000 caracteres), autor, momento de registro, selo de integridade, caixinha pai |
| **Convite** | Token que permite a um participante entrar em um grupo | Grupo pai, criador, código, token de link, expiração, status (ativo/revogado/expirado/aceito) |
| **Contexto de sessão** | Escopo operacional (não gerenciado pelo usuário) | Modo de acesso, grupo ativo, caixinha ativa, tipo de caixinha |
| **Resultado de sorteio** | Saída transitória de um sorteio — **não persistido** | Experiência selecionada, filtro aplicado, estado de revelação |

### Relacionamentos

```
Participante ↔ Grupo      (muitos-para-muitos — membresia)
Grupo       → Caixinha    (um-para-muitos)
Caixinha    → Experiência (um-para-muitos)
Participante → Experiência (um-para-muitos, autoria)
Grupo       → Convite     (um-para-muitos, convites ativos)
Participante → Convite    (papéis de criador e aceitador)
```

### Regras de identidade

- Um **grupo** é identificado pelo seu **conjunto de membros**, não por um nome escolhido pelo usuário.
- A mesma combinação de participantes sempre resolve para o mesmo grupo; uma combinação diferente é um grupo diferente.
- Um participante pode pertencer a múltiplos grupos.
- **Caixinhas** são criadas apenas no modo Caixa de Experiências.
- **Experiências** são registradas principalmente no modo Experiências e pertencem a exatamente uma caixinha.
- Apenas o **autor** pode editar ou excluir uma experiência.

### Formação de grupo e membresia

| Evento | Efeito |
|--------|--------|
| Login conjunto (Caixa de Experiências) | Se a combinação de membros é nova, cria grupo; se existente, reabre |
| Aceitar convite | Adiciona participante à membresia do grupo |
| Sair do grupo | Remove participante da membresia; experiências autoria permanecem nas caixinhas |
| Último membro sai | Grupo, suas caixinhas, experiências e convites pendentes são removidos |

### Regras de convite

| Regra | Valor |
|-------|-------|
| Quem pode criar | Qualquer membro autenticado do grupo |
| Quem pode aceitar | Qualquer participante registrado (incluindo imediatamente após registro) |
| Canais | Deep link compartilhável + código alfanumérico de 6 caracteres |
| Validade | 7 dias a partir da criação |
| Revogação | Criador ou qualquer membro pode revogar um convite ativo |
| Aceitação | Um aceitador por token de convite; adiciona um membro |

### Regras de exclusão de caixinha

| Regra | Valor |
|-------|-------|
| Quem pode excluir | Qualquer membro presente na sessão atual da Caixa de Experiências |
| Escopo | Exclui caixinha e **todas as experiências dentro** (cascata) |
| Confirmação | Obrigatória — mostra nome da caixinha e contagem de experiências |
| Desfazer | Não suportado |

### Intensidade e parâmetros

**Níveis de intensidade (1–5):** Leve, Desconfortável, Coragem, Ousadia, Adrenalina.

**Parâmetros (separados da intensidade):**

| Parâmetro | Pergunta |
|-----------|----------|
| Esforço | Quão exigente é esta experiência? |
| Abertura | Quanta exposição gentil ou sinceridade ela exige? |
| Novidade | Quão diferente das atividades habituais do grupo? |

Intensidade sugerida = média arredondada dos três parâmetros; o proponente confirma ou ajusta.

### Filtros de sorteio

| Filtro | Comportamento |
|--------|---------------|
| Qualquer | Todas as experiências na caixinha ativa |
| Exata | Exatamente o nível de intensidade N |
| Até | Nível de intensidade N ou inferior |

### Não modelado como dados de domínio

Foto de perfil, preferências de notificação, edição de nome de exibição do grupo, histórico de sorteios, eventos de revelação, rastreamento de práticas sociais (consequências, trocas, progressão gradual), preferência de idioma da interface (apenas no cliente), texto de pacotes de sugestão (conteúdo embutido no cliente).

---

## Detalhada

### Participante

Representa uma pessoa com login de e-mail único. O registro exige que o e-mail esteja em uma allowlist mantida pelos operadores. O nome de exibição aparece para outros membros do grupo em prévias de convite e contextos compartilhados.

### Grupo

Emerge quando:

1. Dois ou mais participantes se autenticam juntos no modo Caixa de Experiências — se esse conjunto exato ainda não tem grupo, um é criado.
2. Um participante aceita um convite para um grupo existente.

A membresia é **persistente**: um participante que entrou via convite aparece na seleção de grupo do modo Experiências sem precisar repetir login conjunto. O modo Caixa de Experiências ainda usa login multi-credencial para definir **quem está presente nesta sessão**; todas as credenciais devem pertencer a membros do mesmo grupo, ou a autenticação falha com erro claro de incompatibilidade.

**Estado vazio:** Um grupo com um membro (login conjunto solo ou primeiro convite ainda não aceito) é válido — caixinhas podem existir e experiências podem ser contribuídas, mas o ritual de sorteio é mais significativo com outros presentes.

### Caixinha

Onze tipos temáticos definem pacotes de sugestão padrão e apresentação visual:

Saídas com amigos, Saídas em casal, Viagens em casal, Íntimo em casal, Viagens com amigos, Experiências com amigos, Sair da rotina, Primeiras vezes, Desconforto leve, Momentos de conexão, Experiências diferentes.

Tipo padrão quando não especificado: **Saídas com amigos**.

Atributos: nome escolhido pelo usuário, tipo, timestamp de criação, grupo pai. Caixinhas suportam **criar**, **listar** e **excluir** — não renomear ou alterar tipo após criação.

**Impacto da exclusão:** Todas as experiências na caixinha são removidas permanentemente. Autores perdem suas contribuições nessa caixinha. Outras caixinhas no grupo não são afetadas.

### Experiência

Campos de conteúdo mais metadados. O **selo de integridade** é derivado do texto da descrição e exibido nas cartas — sinaliza que o texto não foi alterado silenciosamente desde o registro (termo de domínio: **Selo**, não "hash").

**Regras de visibilidade:**

| Contexto | O que é mostrado |
|----------|------------------|
| Lista de Experiências (próprias do autor) | Descrição completa para itens próprios; resumo (intensidade + selo) para itens de outros na mesma caixinha |
| Resultado de sorteio (antes da revelação) | Intensidade, parâmetros, selo — sem descrição |
| Resultado de sorteio (após revelação) | Descrição completa e reflexão |

O app exibe aviso de transparência: experiências **não são criptografadas** no servidor.

### Convite

Ciclo de vida funcional:

```
Criado (ativo) → Aceito | Revogado | Expirado
```

- **Criado:** Membro gera link + código; expiração = criação + 7 dias.
- **Aceito:** Convidado confirma prévia; torna-se membro do grupo; convite marcado como aceito.
- **Revogado:** Qualquer membro ou criador cancela antes da aceitação.
- **Expirado:** Fora da janela de validade; não pode ser aceito.

**Estados de erro:** código inválido, convite expirado, já é membro, convite revogado, falha de rede durante aceitação.

### Contexto de sessão

Rastreia: modo de acesso (Experiências / Caixa de Experiências), grupo selecionado, caixinha selecionada, tipo de caixinha ativo para sugestões. Não persistido como verdade de domínio — reconstruído no login e na navegação.

### Resultado de sorteio

Estado efêmero apenas no cliente. Cada ativação de sorteio produz uma nova seleção. "Voltar ao sorteio" descarta o resultado atual. Nenhuma escrita no servidor ocorre para sorteios.

### Pacotes de sugestão

165 exemplos embutidos (11 tipos × 5 níveis de intensidade × 3 cada). Sugestões inspiram criação; **não são copiadas** para a caixinha a menos que o usuário salve uma experiência. Texto canônico de sugestão é português; variantes localizadas existem para interfaces EN e IT.

## Decisões assumidas nesta reescrita

- **Convite** é uma nova entidade persistida com canal duplo link + código e expiração de 7 dias.
- **Exclusão de caixinha** em cascata para experiências; sem soft-delete ou arquivo.
- Membresia de grupo é explícita e sobrevive além de uma única sessão de login.
- Login na Caixa de Experiências valida que todos os participantes autenticados pertencem ao **mesmo** grupo ao reabrir uma sessão de grupo existente.
