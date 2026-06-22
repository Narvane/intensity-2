# Artefatti

Questo documento identifica i blocchi strutturali di Intensity — applicazioni, servizi, data store e componenti condivisi. È scritto per architetti e senior engineer che mappano ownership e confini.

---

## Breve

Intensity comprende **tre artefatti persistiti**: **client mobile**, **REST API** e **database PostgreSQL**. Il client possiede presentazione, contesto sessione, meccanica estrazione e pacchetti suggerimenti embedded. L'API possiede autenticazione, validazione e tutta la persistenza di dominio inclusi **gruppi**, **inviti**, **scatole** ed **esperienze**. I risultati dell'estrazione restano solo sul client.

---

## Media

### Inventario artefatti

| Artefatto | Tipo | Responsabilità |
|-----------|------|----------------|
| **Client mobile** | Applicazione | UI, navigazione, rituali, assistenti, UI condivisione invito, preferenze locali |
| **API** | Applicazione server | REST orientata alle risorse, auth, gateway persistenza |
| **Database** | Store relazionale | Verità di dominio per partecipanti, gruppi, inviti, scatole, esperienze |

### Responsabilità client

**Possiede (non fonte di verità server):**

- Tutte le schermate e i flussi di interazione
- Motore estrazione, filtri, orchestrazione rivelazione, risultati estrazione transitori
- Contesto sessione: modalità accesso, gruppo selezionato, scatola selezionata
- Contenuto pacchetti suggerimenti embedded (165 esempi)
- Contenuto onboarding e guida rapida
- Impostazioni locali: lingua UI, onboarding completato

**Delega all'API:**

- Autenticazione e registrazione
- Risoluzione appartenenza gruppo e uscita
- Invito crea, revoca, valida, accetta
- CRUD Esperienza
- Scatola elenco, crea, elimina
- Letture profilo partecipante necessarie per anteprima invito

### Responsabilità API

**Possiede:**

- Validazione credenziali e emissione token sessione
- Regole di business al confine persistenza (appartenenza gruppo, scadenza invito, eliminazione a cascata)
- Risorse REST per tutte le entità persistite

**Non possiede:**

- Esecuzione estrazione o stato rivelazione
- Preferenza lingua UI
- Memorizzazione testo suggerimenti

### Contenuti database

| Memorizzato | Non memorizzato |
|-------------|-----------------|
| Partecipanti | Risultati estrazione |
| Appartenenze Gruppo ↔ partecipante | Lingua UI |
| Inviti (token, codice, scadenza, stato) | Flag onboarding |
| Scatole (nome, tipo, gruppo) | Pacchetti suggerimenti |
| Esperienze (contenuto, metadati, sigillo) | Contesto sessione |

### Moduli dominio API

Slice verticali per cartella dominio:

- `participante/` — registrazione, profilo, auth
- `grupo/` — appartenenza, risoluzione login congiunto, uscita
- `convite/` — ciclo di vita invito
- `caixinha/` — CRUD scatola inclusa eliminazione con cascata
- `experiencia/` — CRUD esperienza

Ogni modulo: Controller, Service, Repository, DTO, Entity.

### Moduli cognitivi client (architettura informativa)

Esempi allineati ai layer Clean Architecture sul client:

- `grupo/` — creazione, partecipanti, scatole, inviti, configurazione
- `caixinha/` — elenco, crea, elimina
- `experiencia/` — assistente creazione, elenco, modifica
- `sorteio/` — caso d'uso estrazione, policy filtro intensità, orchestratore rivelazione
- `convite/` — genera, condividi, accetta, anteprima

---

## Dettagliata

### Artefatto client mobile

Costruito con React 19, TypeScript, Vite 6, Capacitor 7. Output: `dist/` statico sincronizzato ai progetti nativi per firma store.

**Regola confine:** la presentazione non scrive mai direttamente al database; tutta la persistenza passa attraverso l'API.

**Flusso artefatto invito:** il client richiede creazione invito → l'API restituisce `{ linkToken, code, expiresAt }` → il client costruisce deep link e messaggio condivisione localmente.

**Flusso elimina scatola:** il client invia `DELETE /caixinhas/{id}` → l'API elimina a cascata le esperienze → il client aggiorna l'elenco scatole.

### Artefatto API

Spring Boot 3.5 su Java 21. Espone endpoint REST documentati OpenAPI. Migrazioni schema via Flyway all'avvio.

**Comportamenti servizio chiave:**

| Servizio | Comportamento |
|----------|---------------|
| Risoluzione gruppo | Insieme partecipanti login congiunto → trova o crea gruppo + appartenenze |
| Servizio invito | Genera codice univoco; applica scadenza; accettazione aggiunge appartenenza |
| Servizio scatola | Elimina verifica che il chiamante sia membro del gruppo; cascata esperienze |
| Servizio esperienza | Aggiorna/elimina solo autore |

Esempi helper dominio: `GrupoCapacidadeVerifier`, `ExperienciaDuplicataChecker`, `ConviteExpiracaoPolicy`.

### Artefatto database

PostgreSQL 16. Schema relazionale normalizzato con foreign key:

```
participante
grupo
grupo_participante (join)
convite
caixinha → grupo
experiencia → caixinha, participante (autore)
```

Cascata: eliminare `caixinha` elimina le righe `experiencia` correlate. Eliminare `grupo` elimina scatole, esperienze, inviti, appartenenze.

### Shared nothing

Nessuna libreria condivisa tra API e client oltre al contratto OpenAPI come documentazione. Forme DTO replicate manualmente nei tipi TypeScript client.

### Non artefatti separati

Message broker, layer BFF, CMS suggerimenti, pipeline analytics, identity provider — tutti assenti in baseline.

## Decisioni assunte in questa riscrittura

- **`convite/`** è un nuovo modulo dominio API con entità invito persistita.
- L'eliminazione scatola è **cascata imposta dal server**, non rimozione solo client.
