# Processo de Desenvolvimento

Este documento descreve como o Intensity é desenvolvido, testado, versionado e implantado. É escrito para desenvolvedores, mantenedores com mentalidade DevOps e quem faz onboarding no codebase.

---

## Curta

O desenvolvimento acontece em um **monorepo GitHub** na branch `master`. **Mudanças na API** fluem por testes Maven, build Docker, push GHCR e deploy por webhook na VPS. **Mudanças no cliente** exigem release manual de loja após `npm run build` e sync Capacitor. Mudanças de schema usam **apenas Flyway**. API e cliente evoluem com REST **retrocompatível** a menos que `/v2` seja necessário.

---

## Média

### Modelo de branch e propriedade

- **Branch de produção:** `master`
- **Workflow:** branches de feature → merge quando pronto (baseline de mantenedor solo)
- **Sem ambiente de staging obrigatório**

### Workflow local da API

1. Iniciar PostgreSQL: `docker compose up` em `api/` (ou equivalente)
2. Executar API: `./mvnw spring-boot:run`
3. Aplicar mudanças de schema via nova migração Flyway `V{n}__description.sql`
4. Executar testes: `./mvnw test` antes de push de mudanças sensíveis

### Workflow local do cliente

1. `npm install` em `client/`
2. `npm run dev` — Vite em `:5173`, `VITE_API_URL=http://localhost:8080`
3. Iteração de UI principalmente no navegador
4. Verificação mobile: `npm run build` → `npx cap copy` → emulador ou dispositivo
5. Host da API no emulador Android: `10.0.2.2:8080`; dispositivo físico: IP LAN da máquina

### Pipeline de deploy da API (automatizado)

```
Push para master
  → GitHub Actions: teste Maven + build Docker
  → Push de imagem para GHCR
  → POST webhook de deploy na VPS
  → docker compose pull && up -d
  → API HTTPS no ar
```

### Pipeline de deploy do cliente (manual)

```
npm run build (VITE_API_URL de produção)
  → npx cap sync
  → Release assinado Android Studio / Xcode
  → Upload para Play Console / App Store Connect
  → Revisão de loja
```

### Ordem de mudanças API ↔ cliente

| Tipo de mudança | Ordem |
|-----------------|-------|
| Apenas UI | Release do cliente |
| Apenas API, retrocompatível | Deploy da API |
| Novo campo JSON opcional | API primeiro; cliente quando UI pronta |
| Endpoints de convite ou exclusão (novos) | Deploy da API antes do cliente que os usa |
| Mudança breaking | Evitar; ou `/v2` + release coordenado |

### Estratégia de testes

| Camada | Ferramenta | Escopo |
|--------|------------|--------|
| API | JUnit 5, Spring Boot Test | Serviços, controllers, migrações localmente |
| Cliente | Vitest (opcional) | Lógica pura (filtros, selo, formato de código de convite) |
| Manual | Navegador + emulador | Fluxos: convite, excluir caixinha, ritual de sorteio, erros |

Sem E2E mobile obrigatório em CI na baseline.

### Versionamento

| Artefato | Esquema |
|----------|---------|
| Imagem Docker | `latest` + tag commit SHA |
| Cliente | Semver em `package.json` + números de build de loja |
| Flyway | `V{n}__descricao.sql` sequencial |
| REST | `/v1` implícito; `/v2` para breaks |

### Notas de entrega de funcionalidades (convite + exclusão de caixinha)

1. Migração Flyway: tabela `convite`, índices em `code` e `link_token`
2. Endpoints da API: criar, validar, aceitar, revogar convite; DELETE caixinha em cascata
3. Casos de uso + UI do cliente: folha de compartilhamento, prévia, confirmar exclusão
4. Verificação de domínio de deep link nas lojas
5. Checklist de QA manual antes de submit de loja

---

## Detalhada

### Expectativas pré-commit

Executar testes da API ao tocar `api/`. Executar build do cliente ao tocar `client/`. Atualizar Flyway quando schema de entidade muda. Atualizar anotações OpenAPI quando contrato REST muda.

### Regras de migração de banco de dados

- **Nunca** DDL manual em produção
- Migrações devem ser retrocompatíveis quando versão antiga da API ainda roda durante janela de deploy (instância única — sobreposição breve apenas)
- Exclusão em cascata para caixinhas implementada em FKs do DB **e** camada de serviço para clareza

### Workflow de CI (API)

Job típico do GitHub Actions:

1. Checkout
2. Configurar JDK 21
3. `./mvnw -B test`
4. Build Docker
5. Push para GHCR com tag SHA
6. Disparar webhook (secret)

### Operações na VPS

Stack Compose: `proxy`, `api`, `postgres`. Listener de webhook puxa nova imagem e reinicia container da API. Volume Postgres persistido entre reinícios da API.

Rollback: redeploy de tag SHA anterior via pin de imagem no compose.

### Variáveis de ambiente do cliente

`VITE_API_URL` assado no build — builds de produção devem apontar para API HTTPS pública, não localhost.

### Itens de processo adiados

- Atualizações OTA de bundle web
- CI automatizado de loja
- VPS de staging
- E2E mobile em CI
- Contract testing (Pact) entre cliente e API

### Manutenção de documentação

Atualizar `docs/` quando stack, processo ou regras de domínio mudam. Inglês canônico; sincronizar traduções pt-br e it.

## Decisões assumidas nesta reescrita

- Convite e exclusão de caixinha são entregues como incrementos **API-first** com release coordenado do cliente.
