# Processo di Sviluppo

Questo documento descrive come Intensity viene sviluppato, testato, versionato e deployato. È scritto per sviluppatori, maintainer con mentalità DevOps e chiunque faccia onboarding al codebase.

---

## Breve

Lo sviluppo avviene in un **monorepo GitHub** sul branch `master`. Le **modifiche API** passano attraverso test Maven, build Docker, push GHCR e deploy webhook VPS. Le **modifiche client** richiedono release store manuale dopo `npm run build` e sync Capacitor. Le modifiche schema usano **solo Flyway**. API e client evolvono con REST **retrocompatibile** a meno che non serva `/v2`.

---

## Media

### Modello branch e ownership

- **Branch produzione:** `master`
- **Workflow:** feature branch → merge quando pronto (baseline maintainer solo)
- **Nessun ambiente staging obbligatorio**

### Workflow API locale

1. Avvia PostgreSQL: `docker compose up` in `api/` (o equivalente)
2. Esegui API: `./mvnw spring-boot:run`
3. Applica modifiche schema via nuova migrazione Flyway `V{n}__description.sql`
4. Esegui test: `./mvnw test` prima di push modifiche sensibili

### Workflow client locale

1. `npm install` in `client/`
2. `npm run dev` — Vite su `:5173`, `VITE_API_URL=http://localhost:8080`
3. Iterazione UI principalmente nel browser
4. Verifica mobile: `npm run build` → `npx cap copy` → emulatore o dispositivo
5. Host API emulatore Android: `10.0.2.2:8080`; dispositivo fisico: IP LAN macchina

### Pipeline deploy API (automatizzata)

```
Push su master
  → GitHub Actions: test Maven + build Docker
  → Push immagine su GHCR
  → POST webhook deploy su VPS
  → docker compose pull && up -d
  → API HTTPS live
```

### Pipeline deploy client (manuale)

```
npm run build (VITE_API_URL produzione)
  → npx cap sync
  → Release firmata Android Studio / Xcode
  → Upload su Play Console / App Store Connect
  → Review store
```

### Ordine modifiche API ↔ client

| Tipo modifica | Ordine |
|---------------|--------|
| Solo UI | Release client |
| Solo API, retrocompatibile | Deploy API |
| Nuovo campo JSON opzionale | API prima; client quando UI pronta |
| Endpoint invito o elimina (nuovi) | Deploy API prima del client che li usa |
| Breaking change | Evitare; o `/v2` + release coordinata |

### Strategia test

| Layer | Strumento | Ambito |
|-------|-----------|--------|
| API | JUnit 5, Spring Boot Test | Servizi, controller, migrazioni localmente |
| Client | Vitest (opzionale) | Logica pura (filtri, sigillo, formato codice invito) |
| Manuale | Browser + emulatore | Flussi: invito, elimina scatola, rituale estrazione, errori |

Nessun E2E mobile CI obbligatorio in baseline.

### Versioning

| Artefatto | Schema |
|-----------|--------|
| Immagine Docker | `latest` + tag commit SHA |
| Client | Semver in `package.json` + build number store |
| Flyway | `V{n}__descricao.sql` sequenziale |
| REST | `/v1` implicito; `/v2` per break |

### Note delivery funzionalità (invito + elimina scatola)

1. Migrazione Flyway: tabella `convite`, indici su `code` e `link_token`
2. Endpoint API: crea, valida, accetta, revoca invito; DELETE scatola cascata
3. Casi d'uso client + UI: share sheet, anteprima, conferma elimina
4. Verifica dominio deep link sugli store
5. Checklist QA manuale prima submit store

---

## Dettagliata

### Aspettative pre-commit

Esegui test API quando tocchi `api/`. Esegui build client quando tocchi `client/`. Aggiorna Flyway quando cambia schema entità. Aggiorna annotazioni OpenAPI quando cambia contratto REST.

### Regole migrazione database

- **Mai** DDL manuale in produzione
- Le migrazioni devono essere retrocompatibili quando la vecchia versione API è ancora in esecuzione durante la finestra deploy (istanza singola — sovrapposizione breve solo)
- Eliminazione a cascata scatole implementata in foreign key DB **e** layer servizio per chiarezza

### Workflow CI (API)

Job GitHub Actions tipico:

1. Checkout
2. Setup JDK 21
3. `./mvnw -B test`
4. Build Docker
5. Push su GHCR con tag SHA
6. Trigger webhook (secret)

### Operazioni VPS

Stack Compose: `proxy`, `api`, `postgres`. Listener webhook pulla nuova immagine e riavvia container API. Volume Postgres persistito tra riavvii API.

Rollback: redeploy tag SHA precedente via pin immagine compose.

### Variabili ambiente client

`VITE_API_URL` baked al momento build — le build produzione devono puntare all'API HTTPS pubblica, non localhost.

### Elementi processo differiti

- Aggiornamenti bundle web OTA
- CI store automatizzata
- VPS staging
- E2E mobile in CI
- Contract testing (Pact) tra client e API

### Manutenzione documentazione

Aggiorna `docs/` quando cambiano stack, processo o regole dominio. Inglese canonico; sincronizza traduzioni pt-br e it.

## Decisioni assunte in questa riscrittura

- Invito ed elimina scatola vengono rilasciati come incrementi **API-first** con release client coordinata.
