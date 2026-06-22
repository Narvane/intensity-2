# Tools

This document inventories the languages, frameworks, libraries, and external services used to build and run Intensity. It is written for developers and maintainers who need a concrete stack reference.

**Doc references:** canonical spec @ref:docs-en · map @ref:refs · operational plan @ref:plano-desenvolvimento-ia

---

## Short

Intensity is a **monorepo** with `api/` (Java 21, Spring Boot 3.5, Maven, PostgreSQL 16, Flyway) and `client/` (Node 22, TypeScript 5.7, React 19, Vite 6, Capacitor 7). Production runs on a **VPS with Docker Compose**; CI uses **GitHub Actions** and **GHCR**. Mobile releases go through **Google Play** and **App Store Connect**.

---

## Medium

### Repository layout

```
intensity/
├── api/          Java REST API
├── client/       React + Capacitor mobile app
├── docs/         Product documentation (@ref:docs-en)
└── plano-desenvolvimento-ia.md  AI development plan (@ref:plano-desenvolvimento-ia)
```

### Backend stack

| Tool | Version / role |
|------|----------------|
| Java | 21 |
| Spring Boot | 3.5.x |
| Maven | 3.9+ |
| Hibernate / JPA | ORM |
| Flyway | Schema migrations |
| PostgreSQL | 16 |
| springdoc-openapi | API docs |
| JUnit 5 | Tests |

### Client stack

| Tool | Version / role |
|------|----------------|
| Node.js | 22 LTS |
| npm | 10+ |
| TypeScript | 5.7+ |
| React | 19 |
| Vite | 6 |
| Capacitor | 7 |
| Vitest | 3 (optional unit tests) |

### Capacitor plugins (baseline)

- `@capacitor/app` — lifecycle
- `@capacitor/status-bar` — status bar styling
- `@capacitor/splash-screen` — launch splash
- `@capacitor/preferences` — local settings

### Infrastructure and delivery

| Tool | Role |
|------|------|
| Docker | API and Postgres containers |
| Docker Compose v2 | Local and production orchestration |
| GitHub Actions | CI: test, build, push image |
| GHCR | Container registry |
| Caddy (or equivalent) | TLS reverse proxy on VPS |
| Deploy webhook | POST trigger on VPS after image push |
| Google Play Console | Android AAB |
| Apple App Store Connect | iOS IPA |

### Configuration surfaces

| Location | Contents |
|----------|----------|
| `api/src/main/resources/application.yml` | Datasource, JWT, ports, profiles |
| VPS `.env` | Secrets (not versioned) |
| `client/.env.development` / `.env.production` | `VITE_API_URL` |
| `client/capacitor.config.ts` | App id, display name, `webDir` |

### Not used (baseline)

BaaS, Kubernetes, React Native, KMP, message brokers, CDN, GraphQL, gRPC, WebSockets, OTA update services, analytics SDKs.

---

## Detailed

### Development tooling

- **JDK 21** — API compile and run
- **Docker Desktop / Engine** — local PostgreSQL
- **Modern browser** — primary client UI iteration via Vite
- **Android Studio / Xcode** — signed store builds and device debugging

### Build outputs

| Artifact | Output |
|----------|--------|
| API | Docker image tagged `latest` + git SHA |
| Client web bundle | `client/dist/` static assets |
| Android | `.aab` via Gradle |
| iOS | `.ipa` via Xcode archive |

### API domain folders (DT-12 alignment)

```
api/src/.../
├── participante/
├── grupo/
├── convite/      ← invite module
├── caixinha/
└── experiencia/
```

Each folder: `controller`, `service`, `repository`, `dto`, `entity`.

### Client folder heuristic (DT-13 alignment)

Cognitive structure: `Sistema → Domínio → Contexto → Capacidade → Caso de Uso → Implementação`

Example paths:

```
client/src/.../grupo/convite/GerarConviteUseCase.ts
client/src/.../caixinha/excluir/ExcluirCaixinhaUseCase.ts
client/src/.../sorteio/ExecutarSorteioUseCase.ts
```

### OpenAPI

springdoc exposes `/v3/api-docs` and Swagger UI in non-production profiles for contract reference during client development.

### Invite-specific tooling

Deep link domains configured in:

- `android/app/src/main/AndroidManifest.xml` (intent filters)
- Apple Associated Domains entitlement + `apple-app-site-association` on VPS

No third-party deep-link SaaS in baseline.

## Decisions assumed in this rewrite

- **`convite/`** module added to API folder structure.
- Deep link hosting uses existing VPS + Caddy static file or API redirect endpoint.
