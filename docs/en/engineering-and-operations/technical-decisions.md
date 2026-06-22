# Technical Decisions

This document records concrete technology choices for Intensity — with motivations, alternatives considered, and evaluation criteria. It is written for developers implementing or extending the system.

---

## Short

Intensity uses **Java 21 + Spring Boot 3.5** with **PostgreSQL 16** and **Flyway** on the server, and **React 19 + Vite 6 + Capacitor 7** on the client, in a **monorepo** deployed via **Docker on a VPS** with **GitHub Actions → GHCR → webhook**. API code organizes by **domain folders**; client code follows **Clean Architecture** as cognitive structure. REST evolves **backward-compatibly**; breaking changes require `/v2`.

---

## Medium

### Decision index

| ID | Decision |
|----|----------|
| **DT-01** | Java 21 + Spring Boot 3.5 + Maven |
| **DT-02** | PostgreSQL 16 |
| **DT-03** | Flyway + Hibernate |
| **DT-04** | React 19 + Vite 6 + TypeScript |
| **DT-05** | Capacitor 7 (WebView shell) |
| **DT-06** | Monorepo (`api/` + `client/`) |
| **DT-07** | VPS + Docker Compose for production |
| **DT-08** | GitHub Actions → GHCR → webhook deploy (API only) |
| **DT-09** | Manual client store releases |
| **DT-10** | Backward-compatible API; `/v2` for breaks |
| **DT-11** | No OTA updates (baseline) |
| **DT-12** | API: domain modules, simple layers |
| **DT-13** | Client: Clean Architecture cognitive map |
| **DT-14** | Invite codes: 6-char Crockford Base32 subset |
| **DT-15** | Box delete: DB ON DELETE CASCADE + service guard |

### DT-01 — Java + Spring Boot

**Why:** Mature REST ecosystem, JPA productivity, strong Flyway integration, maintainer familiarity.

**Alternatives rejected:** Node API (less structured domain layering for this maintainer), Kotlin server (team consistency with existing Java choice).

### DT-04 + DT-05 — React + Capacitor

**Why:** Single web codebase for iOS and Android; fast Vite iteration; Capacitor covers store distribution without React Native bridge complexity.

**Alternatives rejected:** React Native (higher native bridge cost for modest native needs), native Swift/Kotlin dual codebase (2× maintenance).

### DT-12 — API structure

Domain-first folders (`participante/`, `grupo/`, `convite/`, `caixinha/`, `experiencia/`). Each module: Controller → Service → Repository. Anemic entities; business rules in services. DTOs at REST boundary.

Not full DDD aggregates — pragmatic CRUD with explicit policies (`ConviteExpiracaoPolicy`, `GrupoCapacidadeVerifier`).

### DT-13 — Client structure

Use cases independent of React components. Example:

```
ExecutarSorteioUseCase
ExcluirCaixinhaUseCase
AceitarConviteUseCase
```

Presentation components call use cases; use cases call API adapters.

### DT-14 — Invite codes

6 characters from unambiguous alphabet (no 0/O, 1/I). Uniqueness enforced by DB unique index with retry on collision. Link token: UUID v4 separately indexed.

**Why:** Short codes for verbal sharing; UUID links for tap-to-open.

### DT-15 — Box delete

`experiencia.caixinha_id` FK with `ON DELETE CASCADE`. Service verifies membership before delete. Transaction wraps delete + audit log hook (optional future).

**Why:** Prevent orphaned experiences; single authoritative operation.

---

## Detailed

### DT-02 — PostgreSQL

Relational model fits groups, memberships, invites, boxes, experiences. JSON columns not used for core domain — clarity over document flexibility.

### DT-03 — Flyway + Hibernate

Flyway owns schema truth; Hibernate validates mapping. Migration `V{n}__add_convite.sql` and `V{n}__caixinha_cascade.sql` exemplify incremental evolution.

### DT-06 — Monorepo

API and client version together in one repo; documentation in `docs/`. Simplifies solo maintainer context switching.

### DT-07 — VPS + Compose

Lower operational cost than Kubernetes for single-instance API. Accept downtime risk during deploy restart.

### DT-08 — CI webhook deploy

Automated API path reduces friction; client stays manual due to store review unpredictability.

### DT-10 — API compatibility

Adding optional fields or new endpoints (`POST convites`, `DELETE caixinhas`) is compatible. Removing fields or changing semantics requires `/v2` and coordinated client release.

### DT-11 — No OTA

Capacitor web assets ship with store builds only. Faster API deploy cycle intentionally decoupled from client.

### Evaluation criteria used across decisions

1. **Solo maintainer sustainability** — minimize moving parts
2. **Store review reality** — API must not break old clients
3. **Product fit** — client-heavy ritual logic stays in TypeScript
4. **Social model** — centralized Postgres for shared boxes
5. **Future exit ramps** — documented paths to scale, offline, push

### Alternatives table (summary)

| Need | Chosen | Rejected |
|------|--------|----------|
| Mobile shell | Capacitor | RN, native dual |
| API style | REST resources | GraphQL, BFF |
| Invite transport | REST + deep link | SMS provider, QR-only |
| Delete semantics | Hard cascade | Soft archive |
| Sync | Pull on read | WebSocket push |

## Decisions assumed in this rewrite

- **DT-14** and **DT-15** support new invite and box deletion features.
- **`convite/`** module follows same DT-12 pattern as existing domains.
