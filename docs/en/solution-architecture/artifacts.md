# Artifacts

This document identifies the structural building blocks of Intensity — applications, services, data stores, and shared components. It is written for architects and senior engineers mapping ownership and boundaries.

---

## Short

Intensity comprises **three persisted artifacts**: **mobile client**, **REST API**, and **PostgreSQL database**. The client owns presentation, session context, draw mechanics, and embedded suggestion packs. The API owns authentication, validation, and all domain persistence including **groups**, **invites**, **boxes**, and **experiences**. Draw results stay on the client only.

---

## Medium

### Artifact inventory

| Artifact | Type | Responsibility |
|----------|------|----------------|
| **Mobile client** | Application | UI, navigation, rituals, assistants, invite sharing UI, local prefs |
| **API** | Server application | Resource-oriented REST, auth, persistence gateway |
| **Database** | Relational store | Domain truth for participants, groups, invites, boxes, experiences |

### Client responsibilities

**Owns (not server source of truth):**

- All screens and interaction flows
- Draw engine, filters, reveal orchestration, transient draw results
- Session context: access mode, selected group, selected box
- Embedded suggestion pack content (165 examples)
- Onboarding and quick guide content
- Local settings: UI language, onboarding completed

**Delegates to API:**

- Authentication and registration
- Group membership resolution and leave
- Invite create, revoke, validate, accept
- Experience CRUD
- Box list, create, delete
- Participant profile reads needed for invite preview

### API responsibilities

**Owns:**

- Credential validation and session token issuance
- Business rules at persistence boundary (group membership, invite expiry, cascade delete)
- REST resources for all persisted entities

**Does not own:**

- Draw execution or reveal state
- UI language preference
- Suggestion text storage

### Database contents

| Stored | Not stored |
|--------|------------|
| Participants | Draw results |
| Group ↔ participant memberships | UI language |
| Invites (token, code, expiry, status) | Onboarding flag |
| Boxes (name, type, group) | Suggestion packs |
| Experiences (content, metadata, seal) | Session context |

### API domain modules

Vertical slices by domain folder:

- `participante/` — registration, profile, auth
- `grupo/` — membership, joint-login resolution, leave
- `convite/` — invite lifecycle
- `caixinha/` — box CRUD including delete with cascade
- `experiencia/` — experience CRUD

Each module: Controller, Service, Repository, DTO, Entity.

### Client cognitive modules (information architecture)

Examples aligned with Clean Architecture layers on client:

- `grupo/` — creation, participants, boxes, invites, configuration
- `caixinha/` — list, create, delete
- `experiencia/` — creation assistant, listing, editing
- `sorteio/` — draw use case, intensity filter policy, reveal orchestrator
- `convite/` — generate, share, accept, preview

---

## Detailed

### Mobile client artifact

Built with React 19, TypeScript, Vite 6, Capacitor 7. Output: static `dist/` synced to native projects for store signing.

**Boundary rule:** presentation never writes directly to database; all persistence routes through API.

**Invite artifact flow:** client requests invite creation → API returns `{ linkToken, code, expiresAt }` → client constructs deep link and share message locally.

**Delete box flow:** client sends `DELETE /caixinhas/{id}` → API cascade deletes experiences → client refreshes box list.

### API artifact

Spring Boot 3.5 on Java 21. Exposes OpenAPI-documented REST endpoints. Schema migrations via Flyway on startup.

**Key service behaviors:**

| Service | Behavior |
|---------|----------|
| Group resolution | Joint login participant set → find or create group + memberships |
| Invite service | Generate unique code; enforce expiry; accept adds membership |
| Box service | Delete verifies caller is group member; cascade experiences |
| Experience service | Author-only update/delete |

Example domain helpers: `GrupoCapacidadeVerifier`, `ExperienciaDuplicataChecker`, `ConviteExpiracaoPolicy`.

### Database artifact

PostgreSQL 16. Normalized relational schema with foreign keys:

```
participante
grupo
grupo_participante (join)
convite
caixinha → grupo
experiencia → caixinha, participante (author)
```

Cascade: deleting `caixinha` deletes related `experiencia` rows. Deleting `grupo` deletes boxes, experiences, invites, memberships.

### Shared nothing

No shared libraries between API and client beyond OpenAPI contract as documentation. DTO shapes mirrored manually in TypeScript client types.

### Not separate artifacts

Message brokers, BFF layer, suggestion CMS, analytics pipeline, identity provider — all absent in baseline.

## Decisions assumed in this rewrite

- **`convite/`** is a new API domain module with persisted invite entity.
- Box delete is a **server-enforced cascade**, not client-only removal.
