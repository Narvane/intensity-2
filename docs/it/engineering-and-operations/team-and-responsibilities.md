# Team e Responsabilità

Questo documento descrive chi costruisce e mantiene Intensity — ruoli, confini di ownership e aspettative operative. È scritto per contributor, stakeholder e futuri membri del team.

---

## Breve

Intensity è mantenuto da un **maintainer solo** che possiede backend, frontend, database, infrastruttura, release e supporto end-to-end. Non c'è team DevOps, QA o piattaforma separato. Le credenziali per VPS, store, GitHub e database restano solo con il maintainer.

---

## Media

### Modello operativo

| Aspetto | Modello |
|---------|---------|
| Dimensione team | Un maintainer primario |
| Autorità decisionale | Maintainer per prodotto, architettura e stack |
| On-call / SLA | Best-effort; nessun SLA formale |
| Code review | Self-review + review esterna opzionale su PR |

### Ruoli consolidati

Il maintainer copre simultaneamente:

- **Sviluppatore backend** — API, logica dominio, Flyway, test
- **Sviluppatore frontend** — UI React, Capacitor, casi d'uso client
- **DBA** — design schema, migrazioni, consapevolezza backup
- **Infra ops** — VPS, Docker, TLS, webhook deploy
- **Release manager** — submit store, bump versione
- **Security ops** — segreti, aggiornamenti dipendenze, gestione allowlist
- **Support** — problemi utenti, risposta incidenti

### Mappa ownership

| Area | Owner | Note |
|------|-------|------|
| `api/` | Maintainer | Inclusi nuovo `convite` e eliminazione a cascata |
| `client/` | Maintainer | Inclusi UX invito e conferme eliminazione |
| VPS / Docker | Maintainer | Uptime produzione |
| Dati PostgreSQL | Maintainer | Backup via provider VPS o snapshot manuale |
| GitHub / CI | Maintainer | Secret Actions, token webhook |
| Play Console / App Store | Maintainer | Chiavi firma, metadata listing |
| Allowlist registrazione | Maintainer | Gate email per nuovi partecipanti |
| `docs/` | Maintainer | Sync documentazione prodotto |

### Custodia credenziali

**Mai nelle build client o in git:**

- Password database
- Secret firma JWT
- Chiavi SSH VPS
- Chiavi firma store
- Token autenticazione webhook

Memorizzati in VPS `.env` e GitHub Actions secrets.

### Cadenza manutenzione tipica

| Attività | Trigger |
|----------|---------|
| Deploy API | Merge su `master` con modifiche server |
| Release store client | Milestone UX o batch bugfix |
| Aggiornamenti dipendenze | Advisory sicurezza o review programmata |
| Immagine base VPS / Docker | Patch sicurezza |
| Documentazione | Cambio stack, dominio o processo |

### Ownership funzionalità invito ed eliminazione

| Preoccupazione | Responsabilità |
|----------------|----------------|
| Abuso inviti (link spam) | Monitora; revoca; rate limit futuri |
| Eliminazione scatola accidentale | Conferma UX — nessun recupero lato server |
| Rinnovo dominio deep link | Maintainer rinnova TLS e file association |
| Allowlist per nuovi membri | Maintainer aggiorna config server |

---

## Dettagliata

### Cosa non è volutamente coperto

- Team QA dedicato — test manuale dal maintainer prima delle release
- Rotazione on-call 24/7
- Team sicurezza separato — maintainer segue advisory
- Team customer success — canale supporto diretto minimale

### Scaling del team (futuro)

Se si uniscono contributor, split suggerito:

| Ruolo | Focus |
|-------|-------|
| Prodotto / client | UX, rituali, assistenti |
| Piattaforma / API | Regole dominio, persistenza, deploy |
| Condiviso | Documentazione in `docs/`, contratto OpenAPI |

L'ownership di `convite` ed elimina `caixinha` dovrebbe restare in un solo owner modulo API per preservare consistenza transazionale.

### Risposta incidenti (informale)

1. Conferma ambito (API down, rifiuto store, problema dati)
2. Controlla container e log VPS
3. Rollback immagine API se deploy recente ha causato regressione
4. Comunica agli utenti interessati se outage prolungato
5. Nota post-mortem in repo o docs se sistemico

### Trasferimento conoscenza

Verità prodotto canonica: `docs/en/`. Percorso onboarding: Layer 1 → 2 → codebase. Ingresso ingegneria: Layer 4 + `api/README` se presente.

## Decisioni assunte in questa riscrittura

- Modello maintainer solo preservato dalla documentazione precedente.
- Responsabilità allowlist inviti e revoca assegnata al maintainer.
