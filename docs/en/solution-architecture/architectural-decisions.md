# Architectural Decisions

This document records the major structural choices shaping Intensity — with rationale, trade-offs, and known constraints. It is written for architects and senior engineers evaluating or evolving the system.

---

## Short

Intensity places **product complexity in the mobile client** and keeps the **server as a thin persistence layer**. It uses a **resource-oriented REST API** (not BFF), **centralized data** on one API instance, and **REST-only** communication. **Invites and box deletion** extend the domain without changing this shape. Draw ritual stays **client-local** with no server write.

---

## Medium

### Decision summary

| ID | Decision | Rationale |
|----|----------|-----------|
| **AD-01** | Client is product core | Value is experiential — UI, ritual, assistant — not server logic |
| **AD-02** | Resource API, not BFF | Simple CRUD domain; screens orchestrate themselves |
| **AD-03** | Centralized data, single API | Individual contributions from separate devices must converge in shared boxes |
| **AD-04** | REST only | Discrete operations; draw on one phone; no live sync needed |
| **AD-05** | Simplicity over complexity | Two app artifacts + one DB, connected by REST |
| **AD-06** | Accept server data custody | Trade-off for social model; future offline as mitigation |
| **AD-07** | Invites as persisted tokens | Async membership growth without weakening synchronous ritual |
| **AD-08** | Server-enforced cascade delete | Box removal must be authoritative; clients cannot orphan experiences |

### AD-07 — Invites as persisted tokens

**Context:** Joint login alone confuses users when not everyone can authenticate together.

**Decision:** Persist invite entities with link token + short code, 7-day expiry, member-initiated creation.

**Consequences:**

- API gains `convite` module and validation endpoints
- Deep links become a mobile platform requirement
- Group membership is explicit, not only session-derived
- Experience Box login must validate same-group membership

**Alternatives rejected:** Ephemeral QR-only pairing (no async join); open public links (privacy risk).

### AD-08 — Server-enforced cascade delete

**Context:** Groups need to remove obsolete boxes; client-only delete risks inconsistency.

**Decision:** `DELETE /caixinhas/{id}` removes box and all experiences in one transaction.

**Consequences:**

- Irreversible — confirmation UX required
- Author experiences lost with box — acceptable product trade-off
- Draw pool immediately reflects deletion on next GET

### Accepted trade-offs

| Gain | Cost |
|------|------|
| Shared experience pool across devices | Server holds credentials and personal content |
| Simple architecture | Single API instance; manual scale path |
| REST simplicity | No live updates when others contribute |
| Invite flexibility | More domain rules and edge cases |
| Group sovereignty on delete | Permanent data loss if misconfirmed |

### Known constraints

- Network required for persisted operations
- Draw ritual on single shared device
- No offline mode in baseline
- No draw history or audit trail

### Future evolution paths

- Offline mode with local sync and conflict resolution
- Horizontal API scaling behind load balancer
- Push or polling for "new experiences in box"
- Soft-delete or archive for boxes instead of hard cascade
- Invite rate limiting and abuse detection

---

## Detailed

### AD-01 — Client as product core

The draw/reveal ritual, five-step assistant, intensity filters, and suggestion packs embody the product. The server validates and stores — it does not orchestrate the moment. This decision keeps store release cycles aligned with UX iteration where value lives.

### AD-02 — Resource API, not BFF

Each screen composes its own calls (`GET boxes`, `GET experiences`, `POST invite`). No aggregated "screen DTOs." Rejected BFF because domain is small and aggregation would couple server releases to UI refactors.

### AD-03 — Centralized data

Asynchronous contribution from many phones into one box requires a single source of truth. Peer-to-peer or per-device stores would break the social model unless paired with heavy sync — out of scope for baseline.

### AD-04 — REST only

Draw produces no server event; contributors do not need live awareness during the ritual. REST pull before draw is sufficient. WebSockets rejected as unnecessary operational cost.

### AD-05 — Simplicity

Exactly: mobile client + API + PostgreSQL. No microservices, no broker, no separate invite microservice.

### AD-06 — Data custody

Experiences are intimate content stored centrally with transparency notice (not encrypted at application layer). Future offline mode would shift custody balance — flagged as architectural pivot, not patch.

### Risk register

| Risk | Mitigation |
|------|------------|
| Invite link shared publicly | Opaque token; expiry; revoke; no content preview beyond member names |
| Accidental box delete | Confirm dialog with count; no undo by design |
| Joint login group mismatch | 409 with clear message |
| Single VPS outage | Manual recovery; no HA baseline |

## Decisions assumed in this rewrite

- **AD-07** and **AD-08** are new decisions supporting invite and box deletion features.
