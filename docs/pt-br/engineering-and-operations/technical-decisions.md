# Decisões Técnicas

Este documento registra escolhas tecnológicas concretas do Intensity — com motivações, alternativas consideradas e critérios de avaliação. É escrito para desenvolvedores que implementam ou estendem o sistema.

---

## Curta

O Intensity usa **Java 21 + Spring Boot 3.5** com **PostgreSQL 16** e **Flyway** no servidor, e **React 19 + Vite 6 + Capacitor 7** no cliente, em um **monorepo** implantado via **Docker em VPS** com **GitHub Actions → GHCR → webhook**. Código da API organiza por **pastas de domínio**; código do cliente segue **Clean Architecture** como estrutura cognitiva. REST evolui **retrocompatível**; mudanças breaking exigem `/v2`.

---

## Média

### Índice de decisões

| ID | Decisão |
|----|---------|
| **DT-01** | Java 21 + Spring Boot 3.5 + Maven |
| **DT-02** | PostgreSQL 16 |
| **DT-03** | Flyway + Hibernate |
| **DT-04** | React 19 + Vite 6 + TypeScript |
| **DT-05** | Capacitor 7 (shell WebView) |
| **DT-06** | Monorepo (`api/` + `client/`) |
| **DT-07** | VPS + Docker Compose para produção |
| **DT-08** | GitHub Actions → GHCR → deploy por webhook (apenas API) |
| **DT-09** | Releases manuais de loja do cliente |
| **DT-10** | API retrocompatível; `/v2` para breaks |
| **DT-11** | Sem atualizações OTA (baseline) |
| **DT-12** | API: módulos de domínio, camadas simples |
| **DT-13** | Cliente: mapa cognitivo Clean Architecture |
| **DT-14** | Códigos de convite: subconjunto Crockford Base32 de 6 caracteres |
| **DT-15** | Exclusão de caixinha: DB ON DELETE CASCADE + guarda de serviço |

### DT-01 — Java + Spring Boot

**Por quê:** Ecossistema REST maduro, produtividade JPA, integração forte com Flyway, familiaridade do mantenedor.

**Alternativas rejeitadas:** API Node (camadas de domínio menos estruturadas para este mantenedor), servidor Kotlin (consistência de equipe com escolha Java existente).

### DT-04 + DT-05 — React + Capacitor

**Por quê:** Codebase web única para iOS e Android; iteração Vite rápida; Capacitor cobre distribuição de loja sem complexidade de bridge React Native.

**Alternativas rejeitadas:** React Native (custo maior de bridge nativa para necessidades nativas modestas), codebase nativa Swift/Kotlin dupla (2× manutenção).

### DT-12 — Estrutura da API

Pastas domain-first (`participante/`, `grupo/`, `convite/`, `caixinha/`, `experiencia/`). Cada módulo: Controller → Service → Repository. Entidades anêmicas; regras de negócio em serviços. DTOs no limite REST.

Não são agregados DDD completos — CRUD pragmático com políticas explícitas (`ConviteExpiracaoPolicy`, `GrupoCapacidadeVerifier`).

### DT-13 — Estrutura do cliente

Casos de uso independentes de componentes React. Exemplo:

```
ExecutarSorteioUseCase
ExcluirCaixinhaUseCase
AceitarConviteUseCase
```

Componentes de apresentação chamam casos de uso; casos de uso chamam adaptadores de API.

### DT-14 — Códigos de convite

6 caracteres de alfabeto sem ambiguidade (sem 0/O, 1/I). Unicidade imposta por índice único no DB com retry em colisão. Token de link: UUID v4 indexado separadamente.

**Por quê:** Códigos curtos para compartilhamento verbal; links UUID para toque-para-abrir.

### DT-15 — Exclusão de caixinha

FK `experiencia.caixinha_id` com `ON DELETE CASCADE`. Serviço verifica membresia antes de excluir. Transação envolve exclusão + hook de log de auditoria (futuro opcional).

**Por quê:** Prevenir experiências órfãs; operação autoritativa única.

---

## Detalhada

### DT-02 — PostgreSQL

Modelo relacional encaixa grupos, membresias, convites, caixinhas, experiências. Colunas JSON não usadas para domínio central — clareza sobre flexibilidade de documento.

### DT-03 — Flyway + Hibernate

Flyway é dono da verdade do schema; Hibernate valida mapeamento. Migração `V{n}__add_convite.sql` e `V{n}__caixinha_cascade.sql` exemplificam evolução incremental.

### DT-06 — Monorepo

API e cliente versionam juntos em um repo; documentação em `docs/`. Simplifica troca de contexto do mantenedor solo.

### DT-07 — VPS + Compose

Custo operacional menor que Kubernetes para API de instância única. Aceita risco de downtime durante restart de deploy.

### DT-08 — Deploy CI por webhook

Caminho automatizado da API reduz fricção; cliente permanece manual devido à imprevisibilidade de revisão de loja.

### DT-10 — Compatibilidade da API

Adicionar campos opcionais ou novos endpoints (`POST convites`, `DELETE caixinhas`) é compatível. Remover campos ou mudar semântica exige `/v2` e release coordenado do cliente.

### DT-11 — Sem OTA

Assets web Capacitor vão apenas com builds de loja. Ciclo de deploy da API intencionalmente desacoplado do cliente.

### Critérios de avaliação usados nas decisões

1. **Sustentabilidade do mantenedor solo** — minimizar partes móveis
2. **Realidade de revisão de loja** — API não deve quebrar clientes antigos
3. **Adequação ao produto** — lógica pesada de ritual permanece em TypeScript
4. **Modelo social** — Postgres centralizado para caixinhas compartilhadas
5. **Saídas futuras** — caminhos documentados para escala, offline, push

### Tabela de alternativas (resumo)

| Necessidade | Escolhido | Rejeitado |
|-------------|-----------|-----------|
| Shell mobile | Capacitor | RN, dual nativo |
| Estilo de API | Recursos REST | GraphQL, BFF |
| Transporte de convite | REST + deep link | Provedor SMS, apenas QR |
| Semântica de exclusão | Cascata dura | Arquivo soft |
| Sync | Pull na leitura | Push WebSocket |

## Decisões assumidas nesta reescrita

- **DT-14** e **DT-15** suportam novas funcionalidades de convite e exclusão de caixinha.
- Módulo **`convite/`** segue o mesmo padrão DT-12 dos domínios existentes.
