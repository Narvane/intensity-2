# Modello Dati

Questo documento definisce il modello di dominio funzionale di Intensity — entità, relazioni, attributi e regole di business a livello di specifica. È scritto per analisti, product owner, designer e QA che devono comprendere quali dati esistono e come si comportano, senza dettagli di implementazione.

---

## Breve

Il dominio ruota attorno a **Partecipante**, **Gruppo**, **Scatola** ed **Esperienza**, più **Risultato Estrazione** transitorio e **Contesto Sessione** operativo. Un gruppo è un insieme di partecipanti che condividono scatole; si forma tramite login congiunto in Scatola delle Esperienze o cresce via **Invito**. Le scatole contengono esperienze; solo l'autore modifica o elimina un'esperienza. Le scatole possono essere **eliminate** in modalità Scatola delle Esperienze, rimuovendo tutte le esperienze contenute. I risultati dell'estrazione non vengono persistiti.

---

## Media

### Entità principali

| Entità | Definizione | Attributi chiave |
|--------|-------------|------------------|
| **Partecipante** | Persona registrata che contribuisce e si unisce ai gruppi | Nome visualizzato, email (login), credenziali |
| **Gruppo** | Insieme di partecipanti che condividono scatole | Elenco membri, momento di creazione |
| **Scatola** | Contenitore tematico nominato di esperienze | Nome, tipo (1 di 11), momento di creazione, gruppo padre |
| **Esperienza** | Idea concreta creata da un partecipante | Descrizione (≤1.000 car.), intensità (1–5), impegno/apertura/novità (1–5 ciascuno), riflessione (≤2.000 car.), autore, momento di registrazione, sigillo di integrità, scatola padre |
| **Invito** | Token che consente a un partecipante di unirsi a un gruppo | Gruppo padre, creatore, codice, token link, scadenza, stato (attivo/revocato/scaduto/accettato) |
| **Contesto sessione** | Ambito operativo (non gestito dall'utente) | Modalità accesso, gruppo attivo, scatola attiva, tipo scatola |
| **Risultato estrazione** | Output transitorio di un'estrazione — **non persistito** | Esperienza selezionata, filtro applicato, stato rivelazione |

### Relazioni

```
Partecipante ↔ Gruppo      (many-to-many — appartenenza)
Gruppo       → Scatola     (one-to-many)
Scatola      → Esperienza  (one-to-many)
Partecipante → Esperienza  (one-to-many, paternità)
Gruppo       → Invito      (one-to-many, inviti attivi)
Partecipante → Invito      (ruoli creatore e accettatore)
```

### Regole di identità

- Un **gruppo** è identificato dal suo **insieme di membri**, non da un nome scelto dall'utente.
- La stessa combinazione di partecipanti risolve sempre allo stesso gruppo; una combinazione diversa è un gruppo diverso.
- Un partecipante può appartenere a più gruppi.
- Le **scatole** vengono create solo in modalità Scatola delle Esperienze.
- Le **esperienze** vengono registrate principalmente in modalità Esperienze e appartengono a esattamente una scatola.
- Solo l'**autore** può modificare o eliminare un'esperienza.

### Formazione del gruppo e appartenenza

| Evento | Effetto |
|--------|---------|
| Login congiunto (Scatola delle Esperienze) | Se la combinazione di membri è nuova, crea il gruppo; se esistente, lo riapre |
| Accetta invito | Aggiunge il partecipante all'appartenenza del gruppo |
| Lascia il gruppo | Rimuove il partecipante dall'appartenenza; le sue esperienze create restano nelle scatole |
| Ultimo membro esce | Gruppo, scatole, esperienze e inviti pendenti vengono rimossi |

### Regole degli inviti

| Regola | Valore |
|--------|--------|
| Chi può creare | Qualsiasi membro autenticato del gruppo |
| Chi può accettare | Qualsiasi partecipante registrato (anche subito dopo la registrazione) |
| Canali | Deep link condivisibile + codice alfanumerico di 6 caratteri |
| Validità | 7 giorni dalla creazione |
| Revoca | Il creatore o qualsiasi membro può revocare un invito attivo |
| Accettazione | Un solo accettatore per token invito; aggiunge un membro |

### Regole di eliminazione scatola

| Regola | Valore |
|--------|--------|
| Chi può eliminare | Qualsiasi membro presente nella sessione Scatola delle Esperienze corrente |
| Ambito | Elimina la scatola e **tutte le esperienze al suo interno** (cascata) |
| Conferma | Obbligatoria — mostra nome scatola e conteggio esperienze |
| Annullamento | Non supportato |

### Intensità e parametri

**Livelli di intensità (1–5):** Leggero, Scomodo, Coraggio, Audace, Adrenalina.

**Parametri (separati dall'intensità):**

| Parametro | Domanda |
|-----------|---------|
| Impegno | Quanto è impegnativa questa esperienza? |
| Apertura | Quanta esposizione delicata o sincerità richiede? |
| Novità | Quanto è diversa dalle attività usuali del gruppo? |

Intensità suggerita = media arrotondata dei tre parametri; il proponente conferma o regola.

### Filtri di estrazione

| Filtro | Comportamento |
|--------|---------------|
| Qualsiasi | Tutte le esperienze nella scatola attiva |
| Esatto | Esattamente livello intensità N |
| Fino a | Livello intensità N o inferiore |

### Non modellato come dati di dominio

Foto profilo, preferenze notifiche, modifica nome visualizzato gruppo, cronologia estrazioni, eventi di rivelazione, tracciamento pratiche sociali (conseguenze, scambi, progressione graduale), preferenza lingua interfaccia (solo client), testo pacchetti suggerimenti (contenuto embedded nel client).

---

## Dettagliata

### Partecipante

Rappresenta una persona con login email univoco. La registrazione richiede che l'email sia in una allowlist mantenuta dagli operatori. Il nome visualizzato appare agli altri membri del gruppo nelle anteprime invito e nei contesti condivisi.

### Gruppo

Emerge quando:

1. Due o più partecipanti si autenticano insieme in modalità Scatola delle Esperienze — se quell'insieme esatto non ha ancora un gruppo, ne viene creato uno.
2. Un partecipante accetta un invito a un gruppo esistente.

L'appartenenza è **persistente**: un partecipante che si è unito via invito appare nella selezione gruppo in modalità Esperienze senza dover ripetere il login congiunto. La modalità Scatola delle Esperienze usa ancora il login multi-credenziale per definire **chi è presente in questa sessione**; tutte le credenziali devono appartenere a membri dello stesso gruppo, altrimenti l'autenticazione fallisce con un errore di mismatch chiaro.

**Stato vuoto:** Un gruppo con un membro (login congiunto solo o primo invito non ancora accettato) è valido — le scatole possono esistere e le esperienze possono essere contribuite, ma il rituale di estrazione ha più senso con altri presenti.

### Scatola

Undici tipi tematici definiscono pacchetti suggerimenti predefiniti e presentazione visiva:

Saídas com amigos, Saídas em casal, Viagens em casal, Íntimo em casal, Viagens com amigos, Experiências com amigos, Sair da rotina, Primeiras vezes, Desconforto leve, Momentos de conexão, Experiências diferentes.

Tipo predefinito se non specificato: **Saídas com amigos** (Uscite con amici).

Attributi: nome scelto dall'utente, tipo, timestamp creazione, gruppo padre. Le scatole supportano **creazione**, **elenco** ed **eliminazione** — non rinomina o cambio tipo dopo la creazione.

**Impatto eliminazione:** Tutte le esperienze nella scatola vengono rimosse permanentemente. Gli autori perdono i propri contributi in quella scatola. Le altre scatole del gruppo non sono interessate.

### Esperienza

Campi contenuto più metadati. Il **sigillo di integrità** è derivato dal testo della descrizione e mostrato sulle carte — segnala che il testo non è stato alterato silenziosamente dalla registrazione (termine di dominio: **Sigillo**, non "hash").

**Regole di visibilità:**

| Contesto | Cosa viene mostrato |
|----------|---------------------|
| Elenco Esperienze (proprie dell'autore) | Descrizione completa per i propri elementi; riepilogo (intensità + sigillo) per gli elementi altrui nella stessa scatola |
| Risultato estrazione (prima della rivelazione) | Intensità, parametri, sigillo — nessuna descrizione |
| Risultato estrazione (dopo la rivelazione) | Descrizione completa e riflessione |

L'app mostra un avviso di trasparenza: le esperienze **non sono crittografate** sul server.

### Invito

Ciclo di vita funzionale:

```
Creato (attivo) → Accettato | Revocato | Scaduto
```

- **Creato:** Il membro genera link + codice; scadenza = creazione + 7 giorni.
- **Accettato:** L'invitato conferma l'anteprima; diventa membro del gruppo; invito marcato accettato.
- **Revocato:** Qualsiasi membro o creatore annulla prima dell'accettazione.
- **Scaduto:** Oltre la finestra di validità; non può essere accettato.

**Stati di errore:** codice non valido, invito scaduto, già membro, invito revocato, errore di rete durante l'accettazione.

### Contesto sessione

Traccia: modalità accesso (Esperienze / Scatola delle Esperienze), gruppo selezionato, scatola selezionata, tipo scatola attivo per suggerimenti. Non persistito come verità di dominio — ricostruito al login e alla navigazione.

### Risultato estrazione

Solo stato client effimero. Ogni attivazione di estrazione produce una nuova selezione. "Torna all'estrazione" scarta il risultato corrente. Nessuna scrittura server avviene per le estrazioni.

### Pacchetti suggerimenti

165 esempi embedded (11 tipi × 5 livelli intensità × 3 ciascuno). I suggerimenti ispirano la creazione; **non vengono copiati** nella scatola a meno che l'utente salvi un'esperienza. Il testo canonico dei suggerimenti è in portoghese; esistono varianti localizzate per interfacce EN e IT.

## Decisioni assunte in questa riscrittura

- **Invito** è una nuova entità persistita con canale duale link + codice e scadenza a 7 giorni.
- L'**eliminazione scatola** ha effetto a cascata sulle esperienze; nessun soft-delete o archivio.
- L'appartenenza al gruppo è esplicita e sopravvive oltre una singola sessione di login.
- Il login Scatola delle Esperienze valida che tutti i partecipanti autenticati appartengano allo **stesso** gruppo quando si riapre una sessione di gruppo esistente.
