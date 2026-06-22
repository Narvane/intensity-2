# Decisioni Tecniche

Questo documento registra le scelte tecnologiche concrete per Intensity — con motivazioni, alternative considerate e criteri di valutazione. È scritto per sviluppatori che implementano o estendono il sistema.

---

## Breve

Intensity usa **Java 21 + Spring Boot 3.5** con **PostgreSQL 16** e **Flyway** sul server, e **React 19 + Vite 6 + Capacitor 7** sul client, in un **monorepo** deployato via **Docker su VPS** con **GitHub Actions → GHCR → webhook**. Il codice API si organizza per **cartelle dominio**; il codice client segue **Clean Architecture** come struttura cognitiva. REST evolve **retrocompatibilmente**; breaking change richiedono `/v2`.

---

## Media

### Indice decisioni

| ID | Decisione |
|----|-----------|
| **DT-01** | Java 21 + Spring Boot 3.5 + Maven |
| **DT-02** | PostgreSQL 16 |
| **DT-03** | Flyway + Hibernate |
| **DT-04** | React 19 + Vite 6 + TypeScript |
| **DT-05** | Capacitor 7 (shell WebView) |
| **DT-06** | Monorepo (`api/` + `client/`) |
| **DT-07** | VPS + Docker Compose per produzione |
| **DT-08** | GitHub Actions → GHCR → webhook deploy (solo API) |
| **DT-09** | Release store client manuali |
| **DT-10** | API retrocompatibile; `/v2` per break |
| **DT-11** | Nessun aggiornamento OTA (baseline) |
| **DT-12** | API: moduli dominio, layer semplici |
| **DT-13** | Client: mappa cognitiva Clean Architecture |
| **DT-14** | Codici invito: sottoinsieme Crockford Base32 6 caratteri |
| **DT-15** | Elimina scatola: DB ON DELETE CASCADE + guard servizio |

### DT-01 — Java + Spring Boot

**Perché:** Ecosistema REST maturo, produttività JPA, integrazione Flyway forte, familiarità maintainer.

**Alternative rifiutate:** API Node (layering dominio meno strutturato per questo maintainer), server Kotlin (consistenza team con scelta Java esistente).

### DT-04 + DT-05 — React + Capacitor

**Perché:** Codebase web singola per iOS e Android; iterazione Vite veloce; Capacitor copre distribuzione store senza complessità bridge React Native.

**Alternative rifiutate:** React Native (costo bridge nativo più alto per bisogni nativi modesti), codebase nativa Swift/Kotlin duale (2× manutenzione).

### DT-12 — Struttura API

Cartelle domain-first (`participante/`, `grupo/`, `convite/`, `caixinha/`, `experiencia/`). Ogni modulo: Controller → Service → Repository. Entità anemiche; regole business nei servizi. DTO al confine REST.

Non aggregati DDD completi — CRUD pragmatico con policy esplicite (`ConviteExpiracaoPolicy`, `GrupoCapacidadeVerifier`).

### DT-13 — Struttura client

Casi d'uso indipendenti dai componenti React. Esempio:

```
ExecutarSorteioUseCase
ExcluirCaixinhaUseCase
AceitarConviteUseCase
```

I componenti presentazione chiamano casi d'uso; i casi d'uso chiamano adapter API.

### DT-14 — Codici invito

6 caratteri da alfabeto non ambiguo (no 0/O, 1/I). Unicità imposta da indice univoco DB con retry su collisione. Token link: UUID v4 indicizzato separatamente.

**Perché:** Codici brevi per condivisione verbale; link UUID per tap-to-open.

### DT-15 — Elimina scatola

FK `experiencia.caixinha_id` con `ON DELETE CASCADE`. Il servizio verifica appartenenza prima dell'eliminazione. La transazione avvolge eliminazione + hook audit log (opzionale futuro).

**Perché:** Prevenire esperienze orfane; operazione autorevole singola.

---

## Dettagliata

### DT-02 — PostgreSQL

Il modello relazionale si adatta a gruppi, appartenenze, inviti, scatole, esperienze. Colonne JSON non usate per dominio core — chiarezza rispetto a flessibilità documento.

### DT-03 — Flyway + Hibernate

Flyway possiede verità schema; Hibernate valida mapping. Migrazione `V{n}__add_convite.sql` e `V{n}__caixinha_cascade.sql` esemplificano evoluzione incrementale.

### DT-06 — Monorepo

API e client versionati insieme in un repo; documentazione in `docs/`. Semplifica context switching maintainer solo.

### DT-07 — VPS + Compose

Costo operativo inferiore a Kubernetes per API single-instance. Accetta rischio downtime durante restart deploy.

### DT-08 — CI webhook deploy

Percorso API automatizzato riduce attrito; client resta manuale per imprevedibilità review store.

### DT-10 — Compatibilità API

Aggiungere campi opzionali o nuovi endpoint (`POST convites`, `DELETE caixinhas`) è compatibile. Rimuovere campi o cambiare semantica richiede `/v2` e release client coordinata.

### DT-11 — Nessun OTA

Gli asset web Capacitor vanno con build store solo. Ciclo deploy API più veloce intenzionalmente disaccoppiato dal client.

### Criteri valutazione usati nelle decisioni

1. **Sostenibilità maintainer solo** — minimizzare parti mobili
2. **Realtà review store** — l'API non deve rompere client vecchi
3. **Fit prodotto** — logica rituale client-heavy resta in TypeScript
4. **Modello sociale** — Postgres centralizzato per scatole condivise
5. **Exit ramp futuri** — percorsi documentati verso scale, offline, push

### Tabella alternative (riepilogo)

| Bisogno | Scelto | Rifiutato |
|---------|--------|-----------|
| Shell mobile | Capacitor | RN, nativo duale |
| Stile API | Risorse REST | GraphQL, BFF |
| Trasporto invito | REST + deep link | Provider SMS, solo QR |
| Semantica elimina | Cascata hard | Archivio soft |
| Sync | Pull in lettura | Push WebSocket |

## Decisioni assunte in questa riscrittura

- **DT-14** e **DT-15** supportano nuove funzionalità invito ed eliminazione scatole.
- Il modulo **`convite/`** segue lo stesso pattern DT-12 dei domini esistenti.
