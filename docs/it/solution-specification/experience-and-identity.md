# Esperienza e Identità

Questo documento definisce le linee guida UX e il tono comunicativo di Intensity — come il prodotto parla agli utenti e come si comportano le schermate chiave. È scritto per designer, product owner e chiunque modelli la comunicazione rivolta all'utente.

**Presentazione visiva** (palette, tipografia, componenti, movimento) è canonica in [`design-system.md`](design-system.md). Questo documento copre terminologia, tono di voce, comportamenti schermata e pattern di consenso.

---

## Breve

Intensity presenta un brand **caldo, intimo e coraggioso** con un look **flat cartoon di avventura sociale** definito nel design system. La voce è diretta, incoraggiante e rispettosa del consenso del gruppo. Due modalità di accesso — **Esperienze** e **Scatola delle Esperienze** — restano funzionalmente distinte in layout e copy; gli accenti visivi seguono `design-system.md`.

---

## Media

### Essenza del brand

| Attributo | Espressione |
|-----------|-------------|
| **Connessione** | Illustrazioni flat cartoon in onboarding, immagini accoppiate, linguaggio di vicinanza |
| **Intensità** | Scala di calore affettivo (1–5), etichette livello chiare, animazione deliberata di rivelazione |
| **Scoperta** | Chip suggerimenti giocosi, tipi scatola tematici, curiosità nel copy |
| **Presenza** | Chrome minimo durante il rituale di estrazione; focus sul momento della carta |

### Presentazione visiva

Token colore, tipografia, raggi, ombre, componenti e movimento sono in [`design-system.md`](design-system.md). Non duplicare i token qui.

**Accenti per modalità (riepilogo):**

| Modalità | Indizio visivo (vedi design system) |
|----------|-------------------------------------|
| Esperienze | Contesto contributo con accento viola flat |
| Scatola delle Esperienze | Contesto rituale con accento corallo |
| Unisciti via invito | Chip giallo o teal — distinto dai pannelli login |

### Logo e naming

- **Nome prodotto:** Intensity — sempre con iniziale maiuscola nell'interfaccia
- **Logo:** Wordmark arrotondato e giocoso in corallo; forma scatola/etichetta; usato su splash, onboarding e header auth (vedi Brand mark in `design-system.md`)
- **Icona app:** Motivo astratto di energia calda (asset store)

### Principi UX

1. **Chiarezza modalità** — layout, copy e colore accento segnalano immediatamente Esperienze vs Scatola delle Esperienze
2. **Divulgazione progressiva** — intensità prima del testo; anteprima invito prima dell'adesione
3. **Consenso esplicito** — conferme per elimina scatola, lascia gruppo, accetta invito
4. **Stati vuoti come guida** — scatola vuota incoraggia il contributo; pool estrazione vuoto spiega i filtri
5. **Baseline accessibilità** — target touch ≥44pt (preferire 48px nel design system); contrasto WCAG AA; etichette screen reader sulle azioni principali

### Terminologia (canonica)

| Termine UI | Significato |
|------------|-------------|
| Esperienza | Un'idea concreta da fare insieme |
| Scatola | Collezione tematica di esperienze |
| Scatola delle Esperienze | Modalità gruppo per scatole e rituale di estrazione |
| Gruppo | Persone che condividono scatole |
| Intensità | Quanto audace sembra un'esperienza (1–5) |
| Estrazione | Selezione casuale di un'esperienza da una scatola |
| Rivela | Gira la carta per vedere la descrizione completa |
| Sigillo | Marchio di integrità sulla carta esperienza |
| Invito | Link o codice per unirsi a un gruppo |
| Proponente | Persona che ha contribuito con un'esperienza |

Evitare termini tecnici come "hash" nel copy utente — usare **Sigillo**.

---

## Dettagliata

### Narrativa visiva di onboarding

Quattro passi illustrati raccontano la storia emotiva: routine ripetitive → nostalgia di connessione → momenti inusuali rimandati → Intensity come risposta. Le illustrazioni usano coppie e gruppi di amici diversi in stile flat cartoon; il tono è speranzoso, non clinico.

### Pannelli di autenticazione

Tre sotto-pannelli all'interno di una schermata auth:

| Pannello | Indizio visivo | Azione principale |
|----------|----------------|-------------------|
| Login Esperienze | Accento viola flat (`--purple`) | Form credenziale singola |
| Login Scatola delle Esperienze | Accento corallo | Carte multi-credenziale con "+" per aggiungere partecipante |
| Registrazione | Superficie neutra su sfondo caldo | Nome visualizzato, email, password |
| Unisciti via invito | Chip giallo o teal | Campo inserimento codice + "Continua" |

L'inserimento invito è raggiungibile dall'auth senza login completo — conduce alla schermata anteprima dopo la validazione del codice.

### Presentazione tipi scatola

Undici tipi appaiono in una **griglia a due colonne** con:

- Badge icona su colore solido di categoria (vedi colori scatola in `design-system.md`)
- Titolo
- Sottotitolo suggerimento

Il catalogo ha sezioni di presentazione interne (amici, coppia, personale, sociale) ma l'UI di creazione mostra un **elenco piatto** senza header di sezione.

### Carte esperienza

**Carta elenco (modalità Esperienze):** chip intensità, indicatori parametri, sigillo, descrizione troncata o nascosta a seconda della paternità.

**Carta estrazione (modalità Scatola delle Esperienze):** carta a due lati con animazione flip asse Y. Copertina: intensità, parametri, sigillo. Fronte: descrizione completa e riflessione (autoria nascosta nel rituale).

### Azioni distruttive

**Elimina scatola** e **Lascia gruppo** usano:

- Trattamento avviso sulla conferma (coral-strong o stile distruttivo dedicato in `design-system.md`)
- Riepilogo impatto (conteggio esperienze / perdita appartenenza)
- Annulla come default sicuro (pulsante secondario)

**Elimina esperienza** (solo autore): dialogo conferma più semplice; nessuna cascata oltre il singolo elemento.

### Foglio condivisione invito

Share sheet nativo con messaggio precompilato:

*"Unisciti al nostro gruppo su Intensity — [link]. Oppure inserisci il codice: [CODICE]"*

Codice mostrato in tipografia arrotondata grande con letter-spacing — copiabile, senza monospace. Scadenza mostrata come data leggibile.

### Tono di voce

| Contesto | Stile |
|----------|-------|
| Onboarding | Caldo, narrativo, seconda persona |
| Guida rapida | Regole dirette, verbi imperativi |
| Suggerimento allineamento | Delicato, chip giallo — "Prendetevi un momento insieme prima di rivelare" |
| Errori | Linguaggio semplice, recupero azionabile |
| Stati vuoti | Incoraggiante, mai colpevolizzante |

**Esempi:**

- ✓ "Estrai di nuovo se questa non si adatta al momento."
- ✓ "Tutti nella stanza dovrebbero appartenere allo stesso gruppo."
- ✗ "Invalid group_combination_error."

### Localizzazione

L'interfaccia supporta **inglese**, **portoghese (Brasile)** e **italiano**. I termini di dominio sono tradotti in modo coerente (vedi documenti localizzati). Gli esempi dei pacchetti suggerimenti seguono la lingua dell'interfaccia dove esistono pacchetti localizzati; gli esempi canonici di authoring restano in portoghese nel catalogo embedded.

### Cosa l'identità evita deliberatamente

- Badge gamification o streak
- Estetica social feed
- Pattern UI enterprise corporate
- Copy di urgenza aggressiva o FOMO

## Decisioni assunte in questa riscrittura

- L'UI **Invito** usa accento giallo o teal per distinguersi dalle modalità auth (`design-system.md`).
- **Elimina scatola** segue lo stesso pattern di conferma distruttiva di lascia gruppo.
- Le etichette filtro nell'UI usano **Esatto** e **Fino a** (non naming interno "fixed/max").
