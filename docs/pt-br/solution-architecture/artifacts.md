# Artefatos

Este documento identifica os blocos estruturais de construção do Intensity — aplicações, serviços, armazenamentos de dados e componentes compartilhados. É escrito para arquitetos e engenheiros seniores que mapeiam propriedade e limites.

---

## Curta

O Intensity compreende **três artefatos persistidos**: **cliente mobile**, **API REST** e **banco de dados PostgreSQL**. O cliente é dono da apresentação, contexto de sessão, mecânicas de sorteio e pacotes de sugestão embutidos. A API é dona da autenticação, validação e toda persistência de domínio incluindo **grupos**, **convites**, **caixinhas** e **experiências**. Resultados de sorteio permanecem apenas no cliente.

---

## Média

### Inventário de artefatos

| Artefato | Tipo | Responsabilidade |
|----------|------|------------------|
| **Cliente mobile** | Aplicação | UI, navegação, rituais, assistentes, UI de compartilhamento de convite, prefs locais |
| **API** | Aplicação servidor | REST orientada a recursos, auth, gateway de persistência |
| **Banco de dados** | Armazenamento relacional | Verdade de domínio para participantes, grupos, convites, caixinhas, experiências |

### Responsabilidades do cliente

**É dono (não fonte de verdade no servidor):**

- Todas as telas e fluxos de interação
- Motor de sorteio, filtros, orquestração de revelação, resultados de sorteio transitórios
- Contexto de sessão: modo de acesso, grupo selecionado, caixinha selecionada
- Conteúdo embutido de pacotes de sugestão (165 exemplos)
- Conteúdo de onboarding e guia rápido
- Configurações locais: idioma da UI, onboarding concluído

**Delega à API:**

- Autenticação e registro
- Resolução de membresia de grupo e saída
- Criar, revogar, validar e aceitar convite
- CRUD de experiências
- Listar, criar e excluir caixinhas
- Leituras de perfil de participante necessárias para prévia de convite

### Responsabilidades da API

**É dona:**

- Validação de credenciais e emissão de token de sessão
- Regras de negócio no limite de persistência (membresia de grupo, expiração de convite, exclusão em cascata)
- Recursos REST para todas as entidades persistidas

**Não é dona:**

- Execução de sorteio ou estado de revelação
- Preferência de idioma da UI
- Armazenamento de texto de sugestão

### Conteúdo do banco de dados

| Armazenado | Não armazenado |
|------------|----------------|
| Participantes | Resultados de sorteio |
| Membresias Grupo ↔ participante | Idioma da UI |
| Convites (token, código, expiração, status) | Flag de onboarding |
| Caixinhas (nome, tipo, grupo) | Pacotes de sugestão |
| Experiências (conteúdo, metadados, selo) | Contexto de sessão |

### Módulos de domínio da API

Fatias verticais por pasta de domínio:

- `participante/` — registro, perfil, auth
- `grupo/` — membresia, resolução de login conjunto, saída
- `convite/` — ciclo de vida de convite
- `caixinha/` — CRUD de caixinha incluindo exclusão com cascata
- `experiencia/` — CRUD de experiência

Cada módulo: Controller, Service, Repository, DTO, Entity.

### Módulos cognitivos do cliente (arquitetura da informação)

Exemplos alinhados com camadas Clean Architecture no cliente:

- `grupo/` — criação, participantes, caixinhas, convites, configuração
- `caixinha/` — listar, criar, excluir
- `experiencia/` — assistente de criação, listagem, edição
- `sorteio/` — caso de uso de sorteio, política de filtro de intensidade, orquestrador de revelação
- `convite/` — gerar, compartilhar, aceitar, prévia

---

## Detalhada

### Artefato cliente mobile

Construído com React 19, TypeScript, Vite 6, Capacitor 7. Saída: `dist/` estático sincronizado com projetos nativos para assinatura de loja.

**Regra de limite:** apresentação nunca escreve diretamente no banco de dados; toda persistência passa pela API.

**Fluxo de artefato de convite:** cliente solicita criação de convite → API retorna `{ linkToken, code, expiresAt }` → cliente constrói deep link e mensagem de compartilhamento localmente.

**Fluxo excluir caixinha:** cliente envia `DELETE /caixinhas/{id}` → API exclui experiências em cascata → cliente atualiza lista de caixinhas.

### Artefato API

Spring Boot 3.5 em Java 21. Expõe endpoints REST documentados em OpenAPI. Migrações de schema via Flyway na inicialização.

**Comportamentos-chave de serviço:**

| Serviço | Comportamento |
|---------|---------------|
| Resolução de grupo | Conjunto de participantes do login conjunto → encontrar ou criar grupo + membresias |
| Serviço de convite | Gerar código único; impor expiração; aceitar adiciona membresia |
| Serviço de caixinha | Exclusão verifica que chamador é membro do grupo; cascata experiências |
| Serviço de experiência | Atualizar/excluir apenas autor |

Exemplos de helpers de domínio: `GrupoCapacidadeVerifier`, `ExperienciaDuplicataChecker`, `ConviteExpiracaoPolicy`.

### Artefato banco de dados

PostgreSQL 16. Schema relacional normalizado com chaves estrangeiras:

```
participante
grupo
grupo_participante (join)
convite
caixinha → grupo
experiencia → caixinha, participante (autor)
```

Cascata: excluir `caixinha` exclui linhas `experiencia` relacionadas. Excluir `grupo` exclui caixinhas, experiências, convites, membresias.

### Shared nothing

Sem bibliotecas compartilhadas entre API e cliente além do contrato OpenAPI como documentação. Formas de DTO espelhadas manualmente em tipos TypeScript do cliente.

### Não são artefatos separados

Message brokers, camada BFF, CMS de sugestões, pipeline de analytics, provedor de identidade — todos ausentes na baseline.

## Decisões assumidas nesta reescrita

- **`convite/`** é um novo módulo de domínio da API com entidade de convite persistida.
- Exclusão de caixinha é **cascata imposta pelo servidor**, não remoção apenas no cliente.
