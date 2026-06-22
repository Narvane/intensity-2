# Intensity

Mobile app for collecting experiences and running shared draw rituals in groups.

**Canonical specification:** @ref:docs-en — [docs/en/](docs/en/)  
**Development plan (slices, DoR/DoD):** @ref:plano-desenvolvimento-ia — [plano-desenvolvimento-ia.md](plano-desenvolvimento-ia.md)  
**Reference map:** @ref:refs (`docs/refs.yaml`)

## Prerequisites

| Tool | Version |
|------|---------|
| JDK | 21 |
| Node.js | 22 LTS |
| npm | 10+ |
| Docker | 24+ with Compose v2 |

## Repository layout

```
├── api/          Spring Boot REST API (Java 21)
├── client/       React + Capacitor mobile app
├── deploy/       Production VPS stack (Compose + Caddy + webhook)
├── openapi/      Contract-first OpenAPI v1
├── docs/         Product and engineering documentation (@ref:docs-en)
└── plano-desenvolvimento-ia.md  AI development plan (@ref:plano-desenvolvimento-ia)
```

## Local development

### API

```bash
cd api
docker compose up -d
./mvnw spring-boot:run
```

- Health: http://localhost:8080/actuator/health
- OpenAPI (dev): http://localhost:8080/v3/api-docs

### Client

```bash
cd client
npm install
npm run dev
```

- Dev server: http://localhost:5173
- API URL: `VITE_API_URL=http://localhost:8080` (see `client/.env.development`)

### Mobile (optional)

```bash
cd client
npm run build
npx cap sync
```

Open the native project in Android Studio or Xcode for emulator/device runs.  
Android emulator API host: `10.0.2.2:8080`; physical device: your machine LAN IP.

## Production deploy

### API (automated CI → VPS)

GitHub Actions runs `./mvnw test`, builds the Docker image, and pushes to GHCR on push to `master`.

**Required repository secrets:**

| Secret | Purpose |
|--------|---------|
| `DEPLOY_WEBHOOK_URL` | POST URL on VPS to pull and restart API after image push |
| `DEPLOY_WEBHOOK_SECRET` | Shared secret sent as `X-Deploy-Secret` header |

GHCR push uses the built-in `GITHUB_TOKEN` (no extra PAT required for public repos).

**VPS setup:** see @ref:deploy-readme — [deploy/README.md](deploy/README.md) — copy `deploy/.env.example` → `.env`, run `./deploy.sh`.

Order: **deploy API first**, then store client release.

### Client (manual store release)

1. Set `client/.env.production` → `VITE_API_URL=https://api.your-domain`
2. `npm run build:store` (production Vite build + Capacitor sync with HTTPS scheme)
3. Sign and upload in Android Studio / Xcode

Full checklist: @ref:store-release — [client/STORE_RELEASE.md](client/STORE_RELEASE.md)

## Stack

- **API:** Java 21, Spring Boot 3.5, Maven, Hibernate, Flyway, PostgreSQL 16
- **Client:** Node 22, TypeScript 5.7, React 19, Vite 6, Capacitor 7
- **Infra:** Docker Compose, GitHub Actions → GHCR → VPS webhook, Caddy TLS

See @ref:en-tools — [tools inventory](docs/en/engineering-and-operations/tools.md) for the full stack.

Validate doc references: `python3 scripts/validate-refs.py`
