# Piattaforme e Ambienti

Questo documento descrive dove Intensity viene eseguito — piattaforme di esecuzione, ambienti di deployment e pattern di utilizzo dei dispositivi. È scritto per architetti e senior engineer che pianificano infrastruttura e distribuzione client.

---

## Breve

Intensity gira su **due piattaforme**: un **client mobile** (iOS e Android via Capacitor) e un **server centralizzato** (API + PostgreSQL). Non esiste client web. Lo sviluppo **locale** abbina un'API localhost con Vite dev server o build emulator; la **produzione** esegue API e database in Docker su un VPS mentre i client chiamano l'API HTTPS pubblica dagli app store.

---

## Media

### Piattaforme di esecuzione

| Piattaforma | Ruolo | Istanze |
|-------------|-------|---------|
| **Client mobile** | UI prodotto completa, flussi, rituale estrazione, sessione locale | Un'installazione per dispositivo partecipante |
| **Server** | REST API + PostgreSQL co-locato | Singolo ambiente produzione |

**Topologia:** molti client mobile → una REST API → un database. Nessuna sync peer-to-peer, nessun CDN, nessun message broker.

### Pattern di utilizzo dispositivi

| Modalità | Pattern dispositivo |
|----------|---------------------|
| **Esperienze** | Ogni partecipante usa il proprio telefono per registrare idee |
| **Scatola delle Esperienze** | Rituale di gruppo (naviga scatole, invita, elimina, estrae, rivela) su **un telefono condiviso**; i contributi possono arrivare da dispositivi separati |

L'accettazione invito e il contributo individuale avvengono su dispositivi personali; il rituale di estrazione assume co-presenza su uno schermo condiviso.

### Ambienti

| Ambiente | Client | API | Database |
|----------|--------|-----|----------|
| **Locale** | Vite dev server o build debug Capacitor | `localhost:8080` | PostgreSQL via Docker Compose |
| **Produzione** | Build store (AAB/IPA) | HTTPS su VPS | Container PostgreSQL sullo stesso VPS |

Nessun ambiente staging dedicato nell'architettura baseline.

### Requisiti runtime

- Mobile: iOS e Android versione corrente meno due major
- Server: VPS Linux, Docker 24+, Docker Compose v2
- Rete richiesta per tutte le operazioni persistite (nessuna baseline offline)

---

## Dettagliata

### Piattaforma mobile

Il client è un'**app ibrida**: UI React in shell WebView Capacitor con asset statici embedded dopo la build. Capacità native usate minimamente: lifecycle app, status bar, splash screen, preferenze locali (lingua, flag onboarding).

Distribuzione esclusivamente tramite **Google Play** (AAB) e **Apple App Store** (IPA). Nessuna distribuzione sideload o web PWA.

I deep link per **URL invito** risolvono nell'app installata (Universal Links / App Links) o richiedono installazione dallo store se assente.

### Piattaforma server

Singolo processo JVM (Spring Boot) dietro reverse proxy (Caddy o equivalente) che termina TLS. PostgreSQL 16 co-locato nello stack Compose su un VPS.

Lo scaling orizzontale non è baseline — l'architettura accetta API single-instance con percorso di evoluzione futuro documentato nelle decisioni architetturali.

### Topologia sviluppo locale

```
Macchina sviluppatore
├── client/     npm run dev → browser :5173
├── api/        spring-boot:run → :8080
└── docker      postgres → :5432

Opzionale: Capacitor copy → emulatore Android (10.0.2.2:8080) o dispositivo (IP LAN)
```

La variabile d'ambiente `VITE_API_URL` punta il client all'API locale o produzione al momento della build.

### Topologia produzione

```
App store → Client mobile
                ↓ HTTPS REST
           VPS (Docker Compose)
             ├── reverse proxy :443
             ├── container API :8080
             └── container PostgreSQL
```

Deploy attivato da webhook dopo che CI pusha l'immagine nel registry.

### Cosa è esplicitamente assente

Client web, BaaS, Kubernetes, VPS staging, CDN, WebSockets, gRPC, GraphQL, sync multi-dispositivo in tempo reale durante l'estrazione.

## Decisioni assunte in questa riscrittura

- I deep link invito sono una **preoccupazione piattaforma mobile** (App Links / Universal Links).
- I flussi eliminazione scatola e invito richiedono rete; nessuna coda offline in baseline.
