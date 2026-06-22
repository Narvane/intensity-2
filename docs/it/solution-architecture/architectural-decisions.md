# Decisioni Architetturali

Questo documento registra le scelte strutturali principali che modellano Intensity — con razionale, compromessi e vincoli noti. È scritto per architetti e senior engineer che valutano o evolvono il sistema.

---

## Breve

Intensity colloca **complessità prodotto nel client mobile** e mantiene il **server come layer di persistenza sottile**. Usa una **API REST orientata alle risorse** (non BFF), **dati centralizzati** su una singola istanza API e comunicazione **solo REST**. **Inviti ed eliminazione scatole** estendono il dominio senza cambiare questa forma. Il rituale estrazione resta **locale sul client** senza scrittura server.

---

## Media

### Riepilogo decisioni

| ID | Decisione | Razionale |
|----|-----------|-----------|
| **AD-01** | Client è core prodotto | Il valore è esperienziale — UI, rituale, assistente — non logica server |
| **AD-02** | API risorse, non BFF | Dominio CRUD semplice; le schermate si orchestrano da sole |
| **AD-03** | Dati centralizzati, API singola | I contributi individuali da dispositivi separati devono convergere in scatole condivise |
| **AD-04** | Solo REST | Operazioni discrete; estrazione su un telefono; nessuna sync live necessaria |
| **AD-05** | Semplicità rispetto a complessità | Due artefatti app + un DB, connessi da REST |
| **AD-06** | Accetta custodia dati server | Compromesso per modello sociale; offline futuro come mitigazione |
| **AD-07** | Inviti come token persistiti | Crescita appartenenza async senza indebolire rituale sincrono |
| **AD-08** | Eliminazione a cascata imposta dal server | La rimozione scatola deve essere autorevole; i client non possono orfanare esperienze |

### AD-07 — Inviti come token persistiti

**Contesto:** Il solo login congiunto confonde gli utenti quando non tutti possono autenticarsi insieme.

**Decisione:** Persistere entità invito con token link + codice breve, scadenza 7 giorni, creazione avviata dai membri.

**Conseguenze:**

- L'API guadagna modulo `convite` ed endpoint validazione
- I deep link diventano un requisito piattaforma mobile
- L'appartenenza gruppo è esplicita, non solo derivata dalla sessione
- Il login Scatola delle Esperienze deve validare appartenenza stesso gruppo

**Alternative rifiutate:** Accoppiamento solo QR effimero (nessuna adesione async); link pubblici aperti (rischio privacy).

### AD-08 — Eliminazione a cascata imposta dal server

**Contesto:** I gruppi devono rimuovere scatole obsolete; l'eliminazione solo client rischia inconsistenza.

**Decisione:** `DELETE /caixinhas/{id}` rimuove scatola e tutte le esperienze in una transazione.

**Conseguenze:**

- Irreversibile — UX conferma richiesta
- Le esperienze degli autori vanno perse con la scatola — compromesso prodotto accettabile
- Il pool estrazione riflette immediatamente l'eliminazione al successivo GET

### Compromessi accettati

| Guadagno | Costo |
|----------|-------|
| Pool esperienze condiviso tra dispositivi | Il server detiene credenziali e contenuto personale |
| Architettura semplice | Istanza API singola; percorso scale manuale |
| Semplicità REST | Nessun aggiornamento live quando altri contribuiscono |
| Flessibilità inviti | Più regole dominio e casi limite |
| Sovranità gruppo sull'eliminazione | Perdita dati permanente se confermato per errore |

### Vincoli noti

- Rete richiesta per operazioni persistite
- Rituale estrazione su singolo dispositivo condiviso
- Nessuna modalità offline in baseline
- Nessuna cronologia estrazione o audit trail

### Percorsi evoluzione futura

- Modalità offline con sync locale e risoluzione conflitti
- Scaling API orizzontale dietro load balancer
- Push o polling per "nuove esperienze nella scatola"
- Soft-delete o archivio scatole invece di cascata hard
- Rate limiting inviti e rilevamento abusi

---

## Dettagliata

### AD-01 — Client come core prodotto

Il rituale estrazione/rivelazione, l'assistente in cinque passi, i filtri intensità e i pacchetti suggerimenti incarnano il prodotto. Il server valida e memorizza — non orchestra il momento. Questa decisione mantiene i cicli release store allineati all'iterazione UX dove vive il valore.

### AD-02 — API risorse, non BFF

Ogni schermata compone le proprie chiamate (`GET scatole`, `GET esperienze`, `POST invito`). Nessun "DTO schermata" aggregato. BFF rifiutato perché il dominio è piccolo e l'aggregazione accoppierebbe release server a refactor UI.

### AD-03 — Dati centralizzati

Il contributo asincrono da molti telefoni in una scatola richiede una singola fonte di verità. Peer-to-peer o store per dispositivo romperebbero il modello sociale a meno di sync pesante — fuori scope per baseline.

### AD-04 — Solo REST

L'estrazione non produce evento server; i contributori non hanno bisogno di consapevolezza live durante il rituale. REST pull prima dell'estrazione è sufficiente. WebSockets rifiutati come costo operativo non necessario.

### AD-05 — Semplicità

Esattamente: client mobile + API + PostgreSQL. Nessun microservizio, broker o microservizio invito separato.

### AD-06 — Custodia dati

Le esperienze sono contenuto intimo memorizzato centralmente con avviso trasparenza (non crittografato a livello applicazione). La modalità offline futura sposterebbe l'equilibrio custodia — segnalato come pivot architetturale, non patch.

### Registro rischi

| Rischio | Mitigazione |
|---------|-------------|
| Link invito condiviso pubblicamente | Token opaco; scadenza; revoca; nessuna anteprima contenuto oltre nomi membri |
| Eliminazione scatola accidentale | Dialogo conferma con conteggio; nessun undo per design |
| Mismatch gruppo login congiunto | 409 con messaggio chiaro |
| Outage VPS singolo | Recupero manuale; nessuna HA baseline |

## Decisioni assunte in questa riscrittura

- **AD-07** e **AD-08** sono nuove decisioni che supportano funzionalità invito ed eliminazione scatole.
