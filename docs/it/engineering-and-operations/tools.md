# Strumenti

Questo documento inventaria linguaggi, framework, librerie e servizi esterni usati per costruire ed eseguire Intensity. È scritto per sviluppatori e maintainer che necessitano un riferimento stack concreto.

---

## Breve

Intensity è un **monorepo** con `api/` (Java 21, Spring Boot 3.5, Maven, PostgreSQL 16, Flyway) e `client/` (Node 22, TypeScript 5.7, React 19, Vite 6, Capacitor 7). La produzione gira su **VPS con Docker Compose**; la CI usa **GitHub Actions** e **GHCR**. Le release mobile passano attraverso **Google Play** e **App Store Connect**.

---

## Media

### Layout repository

```
intensity/
├── api/          Java REST API
├── client/       App mobile React + Capacitor
├── docs/         Documentazione prodotto
└── plano-desenvolvimento-ia.md  Piano sviluppo IA (root del repo)
```

### Stack backend

| Strumento | Versione / ruolo |
|-----------|------------------|
| Java | 21 |
| Spring Boot | 3.5.x |
| Maven | 3.9+ |
| Hibernate / JPA | ORM |
| Flyway | Migrazioni schema |
| PostgreSQL | 16 |
| springdoc-openapi | Documentazione API |
| JUnit 5 | Test |

### Stack client

| Strumento | Versione / ruolo |
|-----------|------------------|
| Node.js | 22 LTS |
| npm | 10+ |
| TypeScript | 5.7+ |
| React | 19 |
| Vite | 6 |
| Capacitor | 7 |
| Vitest | 3 (test unitari opzionali) |

### Plugin Capacitor (baseline)

- `@capacitor/app` — lifecycle
- `@capacitor/status-bar` — styling status bar
- `@capacitor/splash-screen` — splash avvio
- `@capacitor/preferences` — impostazioni locali

### Infrastruttura e delivery

| Strumento | Ruolo |
|-----------|-------|
| Docker | Container API e Postgres |
| Docker Compose v2 | Orchestrazione locale e produzione |
| GitHub Actions | CI: test, build, push immagine |
| GHCR | Container registry |
| Caddy (o equivalente) | Reverse proxy TLS su VPS |
| Webhook deploy | POST trigger su VPS dopo push immagine |
| Google Play Console | Android AAB |
| Apple App Store Connect | iOS IPA |

### Superfici configurazione

| Posizione | Contenuti |
|-----------|-----------|
| `api/src/main/resources/application.yml` | Datasource, JWT, porte, profili |
| VPS `.env` | Segreti (non versionati) |
| `client/.env.development` / `.env.production` | `VITE_API_URL` |
| `client/capacitor.config.ts` | App id, display name, `webDir` |

### Non usati (baseline)

BaaS, Kubernetes, React Native, KMP, message broker, CDN, GraphQL, gRPC, WebSockets, servizi aggiornamento OTA, SDK analytics.

---

## Dettagliata

### Strumenti sviluppo

- **JDK 21** — compilazione ed esecuzione API
- **Docker Desktop / Engine** — PostgreSQL locale
- **Browser moderno** — iterazione UI client primaria via Vite
- **Android Studio / Xcode** — build store firmate e debug dispositivo

### Output build

| Artefatto | Output |
|-----------|--------|
| API | Immagine Docker taggata `latest` + git SHA |
| Bundle web client | Asset statici `client/dist/` |
| Android | `.aab` via Gradle |
| iOS | `.ipa` via archivio Xcode |

### Cartelle dominio API (allineamento DT-12)

```
api/src/.../
├── participante/
├── grupo/
├── convite/      ← modulo invito
├── caixinha/
└── experiencia/
```

Ogni cartella: `controller`, `service`, `repository`, `dto`, `entity`.

### Euristica cartelle client (allineamento DT-13)

Struttura cognitiva: `Sistema → Dominio → Contexto → Capacità → Caso d'Uso → Implementazione`

Esempi percorsi:

```
client/src/.../grupo/convite/GerarConviteUseCase.ts
client/src/.../caixinha/excluir/ExcluirCaixinhaUseCase.ts
client/src/.../sorteio/ExecutarSorteioUseCase.ts
```

### OpenAPI

springdoc espone `/v3/api-docs` e Swagger UI nei profili non-produzione come riferimento contratto durante lo sviluppo client.

### Strumenti specifici invito

Domini deep link configurati in:

- `android/app/src/main/AndroidManifest.xml` (intent filter)
- Entitlement Apple Associated Domains + `apple-app-site-association` su VPS

Nessun SaaS deep-link di terze parti in baseline.

## Decisioni assunte in questa riscrittura

- Modulo **`convite/`** aggiunto alla struttura cartelle API.
- L'hosting deep link usa VPS esistente + file statico Caddy o endpoint redirect API.
