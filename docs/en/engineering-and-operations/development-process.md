# Development Process

This document describes how Intensity is developed, tested, versioned, and deployed. It is written for developers, DevOps-minded maintainers, and anyone onboarding to the codebase.

---

## Short

Development happens in a **GitHub monorepo** on branch `master`. **API changes** flow through Maven tests, Docker build, GHCR push, and VPS webhook deploy. **Client changes** require manual store release after `npm run build` and Capacitor sync. Schema changes use **Flyway only**. API and client evolve with **backward-compatible** REST unless `/v2` is required.

---

## Medium

### Branch and ownership model

- **Production branch:** `master`
- **Workflow:** feature branches → merge when ready (solo maintainer baseline)
- **No mandatory staging environment**

### Local API workflow

1. Start PostgreSQL: `docker compose up` in `api/` (or equivalent)
2. Run API: `./mvnw spring-boot:run`
3. Apply schema changes via new Flyway migration `V{n}__description.sql`
4. Run tests: `./mvnw test` before pushing sensitive changes

### Local client workflow

1. `npm install` in `client/`
2. `npm run dev` — Vite on `:5173`, `VITE_API_URL=http://localhost:8080`
3. UI iteration primarily in browser
4. Mobile check: `npm run build` → `npx cap copy` → emulator or device
5. Android emulator API host: `10.0.2.2:8080`; physical device: machine LAN IP

### API deploy pipeline (automated)

```
Push to master
  → GitHub Actions: Maven test + Docker build
  → Push image to GHCR
  → POST deploy webhook on VPS
  → docker compose pull && up -d
  → HTTPS API live
```

### Client deploy pipeline (manual)

```
npm run build (production VITE_API_URL)
  → npx cap sync
  → Android Studio / Xcode signed release
  → Upload to Play Console / App Store Connect
  → Store review
```

### API ↔ client change ordering

| Change type | Order |
|-------------|-------|
| UI only | Client release |
| API-only, backward compatible | API deploy |
| New optional JSON field | API first; client when UI ready |
| Invite or delete endpoints (new) | API deploy before client using them |
| Breaking change | Avoid; or `/v2` + coordinated release |

### Testing strategy

| Layer | Tool | Scope |
|-------|------|-------|
| API | JUnit 5, Spring Boot Test | Services, controllers, migrations locally |
| Client | Vitest (optional) | Pure logic (filters, seal, invite code format) |
| Manual | Browser + emulator | Flows: invite, delete box, draw ritual, errors |

No mandatory mobile E2E CI in baseline.

### Versioning

| Artifact | Scheme |
|----------|--------|
| Docker image | `latest` + commit SHA tag |
| Client | Semver in `package.json` + store build numbers |
| Flyway | `V{n}__descricao.sql` sequential |
| REST | `/v1` implicit; `/v2` for breaks |

### Feature delivery notes (invite + box delete)

1. Flyway migration: `convite` table, indexes on `code` and `link_token`
2. API endpoints: create, validate, accept, revoke invite; DELETE box cascade
3. Client use cases + UI: share sheet, preview, confirm delete
4. Deep link domain verification on stores
5. Manual QA checklist before store submit

---

## Detailed

### Pre-commit expectations

Run API tests when touching `api/`. Run client build when touching `client/`. Update Flyway when entity schema changes. Update OpenAPI annotations when REST contract changes.

### Database migration rules

- **Never** manual DDL in production
- Migrations must be backward compatible when API old version still running during deploy window (single instance — brief overlap only)
- Cascade delete for boxes implemented in DB foreign keys **and** service layer for clarity

### CI workflow (API)

Typical GitHub Actions job:

1. Checkout
2. Set up JDK 21
3. `./mvnw -B test`
4. Docker build
5. Push to GHCR with SHA tag
6. Trigger webhook (secret)

### VPS operations

Compose stack: `proxy`, `api`, `postgres`. Webhook listener pulls new image and restarts API container. Postgres volume persisted across API restarts.

Rollback: redeploy previous SHA tag via compose image pin.

### Client environment variables

`VITE_API_URL` baked at build time — production builds must point to public HTTPS API, not localhost.

### Deferred process items

- OTA web bundle updates
- Automated store CI
- Staging VPS
- Mobile E2E in CI
- Contract testing (Pact) between client and API

### Documentation maintenance

Update `docs/` when stack, process, or domain rules change. English canonical; sync pt-br and it translations.

## Decisions assumed in this rewrite

- Invite and box delete ship as **API-first** increments with coordinated client release.
