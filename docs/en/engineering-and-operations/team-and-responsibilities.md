# Team and Responsibilities

This document describes who builds and maintains Intensity — roles, ownership boundaries, and operational expectations. It is written for contributors, stakeholders, and future team members.

---

## Short

Intensity is maintained by a **solo maintainer** who owns backend, frontend, database, infrastructure, releases, and support end-to-end. There is no separate DevOps, QA, or platform team. Credentials for VPS, stores, GitHub, and database live with the maintainer only.

---

## Medium

### Operating model

| Aspect | Model |
|--------|-------|
| Team size | One primary maintainer |
| Decision authority | Maintainer for product, architecture, and stack |
| On-call / SLA | Best-effort; no formal SLA |
| Code review | Self-review + optional external review on PRs |

### Consolidated roles

The maintainer simultaneously covers:

- **Backend developer** — API, domain logic, Flyway, tests
- **Frontend developer** — React UI, Capacitor, client use cases
- **DBA** — schema design, migrations, backup awareness
- **Infra ops** — VPS, Docker, TLS, deploy webhook
- **Release manager** — store submissions, version bumps
- **Security ops** — secrets, dependency updates, allowlist management
- **Support** — user issues, incident response

### Ownership map

| Area | Owner | Notes |
|------|-------|-------|
| `api/` | Maintainer | Including new `convite` and cascade delete |
| `client/` | Maintainer | Including invite UX and delete confirmations |
| VPS / Docker | Maintainer | Production uptime |
| PostgreSQL data | Maintainer | Backups via VPS provider or manual snapshot |
| GitHub / CI | Maintainer | Actions secrets, webhook token |
| Play Console / App Store | Maintainer | Signing keys, listing metadata |
| Registration allowlist | Maintainer | Email gate for new participants |
| `docs/` | Maintainer | Product documentation sync |

### Credential custody

**Never in client builds or git:**

- Database passwords
- JWT signing secrets
- VPS SSH keys
- Store signing keys
- Webhook authentication tokens

Stored in VPS `.env` and GitHub Actions secrets.

### Typical maintenance cadence

| Activity | Trigger |
|----------|---------|
| API deploy | Merge to `master` with server changes |
| Client store release | UX milestone or bugfix batch |
| Dependency updates | Security advisories or scheduled review |
| VPS / Docker base image | Security patches |
| Documentation | Stack, domain, or process change |

### Invite and delete feature ownership

| Concern | Responsibility |
|---------|----------------|
| Invite abuse (spam links) | Monitor; revoke; future rate limits |
| Accidental box deletion | UX confirmation — no server-side recovery |
| Deep link domain renewal | Maintainer renews TLS and association files |
| Allowlist for new members | Maintainer updates server config |

---

## Detailed

### What is intentionally not staffed

- Dedicated QA team — manual testing by maintainer before releases
- 24/7 on-call rotation
- Separate security team — maintainer follows advisories
- Customer success team — direct support channel minimal

### Scaling the team (future)

If contributors join, suggested split:

| Role | Focus |
|------|-------|
| Product / client | UX, rituals, assistants |
| Platform / API | Domain rules, persistence, deploy |
| Shared | Documentation in `docs/`, OpenAPI contract |

Ownership of `convite` and `caixinha` delete should stay in one API module owner to preserve transaction consistency.

### Incident response (informal)

1. Confirm scope (API down, store rejection, data issue)
2. Check VPS containers and logs
3. Roll back API image if recent deploy caused regression
4. Communicate to affected users if prolonged outage
5. Post-mortem note in repo or docs if systemic

### Knowledge transfer

Canonical product truth: `docs/en/`. Onboarding path: Layer 1 → 2 → codebase. Engineering entry: Layer 4 + `api/README` if present.

## Decisions assumed in this rewrite

- Solo maintainer model preserved from prior documentation.
- Invite allowlist and revocation responsibility assigned to maintainer.
