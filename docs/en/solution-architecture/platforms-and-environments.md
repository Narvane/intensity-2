# Platforms and Environments

This document describes where Intensity runs — execution platforms, deployment environments, and device usage patterns. It is written for architects and senior engineers planning infrastructure and client distribution.

---

## Short

Intensity runs on **two platforms**: a **mobile client** (iOS and Android via Capacitor) and a **centralized server** (API + PostgreSQL). There is no web client. **Local** development pairs a localhost API with Vite dev server or emulator builds; **production** runs API and database in Docker on a VPS while clients call the public HTTPS API from app stores.

---

## Medium

### Execution platforms

| Platform | Role | Instances |
|----------|------|-----------|
| **Mobile client** | Full product UI, flows, draw ritual, local session | One install per participant device |
| **Server** | REST API + co-located PostgreSQL | Single production environment |

**Topology:** many mobile clients → one REST API → one database. No peer-to-peer sync, no CDN, no message broker.

### Device usage patterns

| Mode | Device pattern |
|------|----------------|
| **Experiences** | Each participant uses their own phone to register ideas |
| **Experience Box** | Group ritual (navigate boxes, invite, delete, draw, reveal) on **one shared phone**; contributions may come from separate devices |

Invite acceptance and individual contribution happen on personal devices; the draw ritual assumes co-presence on a shared screen.

### Environments

| Environment | Client | API | Database |
|-------------|--------|-----|----------|
| **Local** | Vite dev server or Capacitor debug build | `localhost:8080` | PostgreSQL via Docker Compose |
| **Production** | Store builds (AAB/IPA) | HTTPS on VPS | PostgreSQL container on same VPS |

No dedicated staging environment in the baseline architecture.

### Runtime requirements

- Mobile: iOS and Android current minus two major versions
- Server: Linux VPS, Docker 24+, Docker Compose v2
- Network required for all persisted operations (no offline baseline)

---

## Detailed

### Mobile platform

The client is a **hybrid app**: React UI in a Capacitor WebView shell with embedded static assets after build. Native capabilities used minimally: app lifecycle, status bar, splash screen, local preferences (language, onboarding flag).

Distribution exclusively through **Google Play** (AAB) and **Apple App Store** (IPA). No sideload or web PWA distribution.

Deep links for **invite URLs** resolve into the installed app (Universal Links / App Links) or prompt install from store if missing.

### Server platform

Single JVM process (Spring Boot) behind reverse proxy (Caddy or equivalent) terminating TLS. PostgreSQL 16 co-located in Compose stack on one VPS.

Horizontal scaling is not baseline — architecture accepts single-instance API with future evolution path documented in architectural decisions.

### Local development topology

```
Developer machine
├── client/     npm run dev → browser :5173
├── api/        spring-boot:run → :8080
└── docker      postgres → :5432

Optional: Capacitor copy → Android emulator (10.0.2.2:8080) or device (LAN IP)
```

Environment variable `VITE_API_URL` points client to local or production API at build time.

### Production topology

```
App stores → Mobile clients
                ↓ HTTPS REST
           VPS (Docker Compose)
             ├── reverse proxy :443
             ├── API container :8080
             └── PostgreSQL container
```

Deploy triggered by webhook after CI pushes image to registry.

### What is explicitly absent

Web client, BaaS, Kubernetes, staging VPS, CDN, WebSockets, gRPC, GraphQL, real-time multi-device sync during draw.

## Decisions assumed in this rewrite

- Invite deep links are a **mobile platform concern** (App Links / Universal Links).
- Box deletion and invite flows require network; no offline queue in baseline.
