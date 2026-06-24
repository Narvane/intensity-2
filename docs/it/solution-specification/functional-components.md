# Componenti Funzionali

Questo documento cataloga i moduli funzionali, le schermate, i flussi utente e i comportamenti dell'interfaccia di Intensity — cosa l'utente può fare, dove e in quali condizioni. Specifica *cosa esiste funzionalmente* nell'interfaccia, senza dettagli di implementazione.

**Pubblico:** analisti, product owner, designer e QA funzionale — persone che devono mappare funzionalità, journey e comportamenti schermata senza conoscere come l'app è stata costruita.

**Presentazione visiva** di schermate e componenti segue [`design-system.md`](design-system.md).

---

## Breve

Intensity è un'**app mobile** organizzata attorno a **quattordici viste principali** più overlay. Dopo bootstrap e onboarding opzionale, l'utente si autentica in uno di quattro percorsi (**Esperienze**, **Scatola delle Esperienze**, **Registrazione** o **Unisciti via invito**). Il percorso **Esperienze** fluisce attraverso selezione gruppo → selezione scatola → elenco esperienze → assistente creazione. Il percorso **Scatola delle Esperienze** fluisce attraverso home scatole (elenco, crea, invita, elimina) → momento condiviso (estrazione e rivelazione). Ogni schermata gestisce esplicitamente stati di **caricamento**, **vuoto** ed **errore**.

---

## Media

### Moduli funzionali

| Modulo | Scopo |
|--------|-------|
| **Bootstrap** | Carica preferenza lingua e stato primo avvio prima di mostrare contenuto |
| **Onboarding** | Introduzione illustrata in quattro passi alla storia del prodotto |
| **Guida rapida** | Manuale riutilizzabile con regole core, flusso e suggerimenti |
| **Autenticazione** | Login (Esperienze o Scatola delle Esperienze), registrazione, inserimento invito, accesso aiuto |
| **Unisciti via invito** | Anteprima gruppo e accetta appartenenza |
| **Selezione gruppo** | Scegli a quale gruppo contribuire (modalità Esperienze) |
| **Selezione scatola** | Scegli quale scatola nel gruppo (modalità Esperienze) |
| **Elenco esperienze** | Visualizza, rivela, modifica ed elimina le proprie esperienze nella scatola attiva |
| **Assistente creazione** | Flusso guidato in cinque passi per registrare una nuova esperienza |
| **Home scatole** | Elenca, crea, invita ed elimina scatole (modalità Scatola delle Esperienze) |
| **Crea scatola** | Sotto-vista da home scatole |
| **Gestione gruppo** | Condivisione invito, lascia gruppo (da home scatole o contesto gruppo Esperienze) |
| **Momento condiviso** | Estrazione casuale con filtri, suggerimento allineamento e rivelazione carta |
| **Recupero errore** | Schermata per stato sessione non riconosciuto con opzioni di uscita |

### Catalogo schermate

| # | Schermata | Quando mostrata |
|---|-----------|-----------------|
| 1 | Caricamento bootstrap | Preferenze lingua/onboarding non pronte |
| 2 | Onboarding (4 passi) | Primo avvio |
| 3 | Guida rapida | Da onboarding o aiuto auth; overlay |
| 4 | Autenticazione | Nessuna sessione attiva; onboarding completato |
| 5 | Unisciti via invito | Codice valido inserito da auth o deep link |
| 6 | Sessione sconosciuta | Modalità accesso sessione non riconosciuta |
| 7 | Selezione gruppo | Modalità Esperienze; nessun gruppo scelto |
| 8 | Selezione scatola | Modalità Esperienze; gruppo impostato, scatola non scelta |
| 9 | Elenco esperienze | Modalità Esperienze; gruppo e scatola impostati |
| 10 | Assistente creazione | Overlay da elenco esperienze |
| 11 | Home scatole | Modalità Scatola delle Esperienze |
| 12 | Crea scatola | Sotto-vista da home scatole |
| 13 | Momento condiviso | Modalità Scatola delle Esperienze; scatola aperta |
| 14 | Condivisione invito | Foglio/overlay da home scatole o gestione gruppo |

L'autenticazione contiene quattro **sotto-pannelli** (non route separate): login Esperienze, multi-login Scatola delle Esperienze, Registrazione e inserimento codice invito.

### Flussi utente principali

```
Flusso A — Primo avvio
  Bootstrap → Onboarding (4 passi) → [Guida rapida opzionale] → Autenticazione

Flusso B — Esperienze (contributo individuale)
  Auth → Selezione gruppo → Selezione scatola → Elenco esperienze
    → [+ Crea] → Overlay assistente → ritorno all'elenco
  Indietro: elenco → selezione scatola → selezione gruppo
  Uscita: logout da qualsiasi schermata autenticata

Flusso C — Scatola delle Esperienze (rituale di gruppo)
  Auth (multi-utente) → Home scatole → [Crea scatola | Invita | Elimina scatola]
    → Apri scatola → Momento condiviso → Estrazione → Allineamento → Rivela → Torna all'estrazione
  Indietro: momento condiviso → home scatole
  Uscita: logout

Flusso D — Unisciti via invito
  Inserimento invito auth O deep link → Anteprima adesione → Accetta → Selezione gruppo (Esperienze)
    O prompt per entrare in Scatola delle Esperienze con i membri del gruppo

Flusso E — Recupero errore
  Sessione sconosciuta → Logout O Entra in Scatola delle Esperienze (cancella sessione)
```

### Formazione gruppo e inviti

**Quando nasce un gruppo:**

1. Due o più partecipanti si autenticano insieme in modalità Scatola delle Esperienze — una nuova combinazione crea un gruppo.
2. Il primo membro può anche iniziare da solo (una credenziale); il gruppo esiste con un membro finché altri non si uniscono via invito o futuro login congiunto.

**Flusso invito:**

1. Il membro apre **Invito** da home scatole o menu gruppo in modalità Esperienze.
2. L'app genera link + codice di 6 caratteri (valido 7 giorni).
3. Il membro condivide tramite share sheet di sistema o copia il codice.
4. Il destinatario inserisce il codice nella schermata auth o apre il deep link.
5. **Anteprima adesione** mostra nomi visualizzati dei membri (non email).
6. Il destinatario accetta → aggiunto al gruppo → atterra in selezione gruppo (Esperienze) o messaggio di successo con guida al passo successivo.

**Permessi:**

| Azione | Chi |
|--------|-----|
| Crea invito | Qualsiasi membro del gruppo |
| Revoca invito | Creatore o qualsiasi membro |
| Accetta invito | Invitato (account registrato richiesto) |
| Lascia gruppo | Qualsiasi membro (conferma); ultimo membro attiva eliminazione gruppo |

**Errori:** codice non valido/scaduto/revocato; già membro; errore di rete; registrazione allowlist richiesta per nuovi utenti.

### Eliminazione scatola

Disponibile da **home scatole** in modalità Scatola delle Esperienze:

1. Il membro apre il menu contestuale su una carta scatola → **Elimina scatola**.
2. Dialogo conferma: nome scatola, conteggio esperienze, avviso irreversibile.
3. Conferma → scatola e tutte le esperienze rimosse → ritorno a home scatole con toast di successo.
4. Annulla → nessuna modifica.

**Chi può eliminare:** qualsiasi membro autenticato nella sessione Scatola delle Esperienze corrente.

**Errori:** errore di rete (retry offerto); non autorizzato se sessione non valida.

### Passi assistente creazione

| Passo | Etichetta | Azione utente |
|-------|-----------|-----------------|
| 1 — Suggerimento | Scrivi descrizione o tocca suggerimento tipo come ispirazione |
| 2 — Riflessione | Giustifica perché il gruppo accetterebbe l'idea |
| 3 — Parametri | Valuta impegno, apertura, novità (1–5 stelle ciascuno) |
| 4 — Classificazione | Conferma o regola intensità complessiva (auto-suggerita dai parametri) |
| 5 — Ramificazione | Rivedi riepilogo; salva e creane un'altra, oppure termina |

Carta descrizione persistente e indicatore progresso a cinque segmenti per tutta la durata.

### Funzionalità momento condiviso

- **Modalità filtro:** Qualsiasi (nessun filtro intensità), Esatto (livello fisso 1–5), Fino a (massimo inclusivo)
- **Azione estrazione:** selezione casuale tra esperienze idonee nella scatola
- **Carta risultato:** copertina intensità (livello, parametri, sigillo) prima della rivelazione
- **Suggerimento allineamento:** invita al consenso del gruppo prima di girare la carta
- **Rivela:** flip asse Y per leggere descrizione completa
- **Ritorno:** torna all'estrazione per nuova selezione

### Undici tipi scatola

Ogni tipo ha titolo, sottotitolo suggerimento, evidenziazione visiva e pacchetto suggerimenti associato. Predefinito: **Uscite con amici**.

---

## Dettagliata

### Caricamento bootstrap

Mostra splash brand mentre carica preferenze locali (lingua, flag onboarding completato). Transizione a onboarding o autenticazione. Errore: riprova caricamento preferenze.

### Onboarding

Quattro passi scorrevoli con illustrazioni e copy. Il passo finale offre ingresso alla guida rapida o salta ad autenticazione. Non mostrato di nuovo una volta completato (flag memorizzato localmente).

### Autenticazione

**Login Esperienze:** email + password → selezione gruppo.

**Login Scatola delle Esperienze:** una o più carte credenziale; "+" aggiunge un altro partecipante. Tutti devono autenticarsi con successo. Tutti i partecipanti devono appartenere allo **stesso gruppo** quando si uniscono a un gruppo esistente, OPPURE formare un nuovo gruppo se la combinazione è nuova. Errore mismatch spiega che le credenziali appartengono a gruppi diversi.

**Registrazione:** nome visualizzato, email, password. L'email deve essere nella allowlist operatore. Successo → pannello login.

**Inserimento codice invito:** campo 6 caratteri; valida formato → anteprima adesione o errore.

Icona aiuto apre overlay guida rapida.

### Unisciti via invito

Mostra: nomi / nomi visualizzati membri gruppo, scadenza invito, pulsanti accetta e annulla. Accetta richiede sessione autenticata — se aperto via deep link senza sessione, richiede login o registrazione prima. Successo naviga a selezione gruppo Esperienze con nuovo gruppo pre-selezionato.

### Selezione gruppo (Esperienze)

Elenca gruppi dove il partecipante è membro. Stato vuoto: "Unisciti a un gruppo via invito o entra in Scatola delle Esperienze con altri." Ogni riga mostra conteggio membri e suggerimento attività recente opzionale. Azioni: seleziona gruppo, **Invito** (condividi nuovo invito), **Lascia gruppo** (conferma).

### Selezione scatola (Esperienze)

Elenca scatole nel gruppo selezionato. Stato vuoto: "Crea una scatola insieme in modalità Scatola delle Esperienze." Seleziona scatola → elenco esperienze.

### Elenco esperienze

Mostra contributi nella scatola attiva. Propri elementi: intensità, parametri e sigillo sempre visibili; descrizione e riflessione rivelabili dall'autore tramite icona occhio; modifica ed elimina nel piè di pagina della carta. Elementi altrui: solo riepilogo intensità + sigillo (nessuna descrizione). Azioni pagina: crea (+), logout, indietro.

**Modifica esperienza:** l'autore apre modifica dal menu elemento → stessi campi dell'assistente (pre-compilati) → salva.

### Home scatole (Scatola delle Esperienze)

Griglia a due colonne di carte scatola con sigillo tipo, nome, sottotitolo. Azioni per carta: **Apri**, **Elimina** (menu). Azioni header: **Crea scatola**, **Invito**, logout. Stato vuoto: CTA crea prima scatola.

**Dialogo elimina scatola:** "Eliminare [nome]? Questo rimuove permanentemente [N] esperienze." Conferma / Annulla.

### Crea scatola

Campo nome, selettore tipo (elenco piatto 11 tipi), pulsante crea. Validazione: nome obbligatorio (1–80 car.). Successo ritorna a home scatole con nuova carta.

### Momento condiviso

Chip filtro + selettore intensità opzionale (predefinito 3 — Coraggio). Etichetta pulsante estrazione si adatta alla modalità filtro. Caricamento: "Scelta in corso…". Scatola vuota: carta suggerimento per aggiungere esperienze via modalità Esperienze. Pool filtro vuoto: "Nessuna esperienza disponibile."

Post-estrazione: suggerimento allineamento (ambra tratteggiato), pulsante rivela, torna all'estrazione. Stato rivelato mostra descrizione completa e riflessione, senza identificare l'autore.

### Sessione sconosciuta

Mostrato quando il contesto sessione memorizzato non è valido. Opzioni: logout (cancella tutto) o passa a ingresso Scatola delle Esperienze (cancella modalità, mantiene credenziali se presenti).

### Stati UI trasversali

| Stato | Pattern |
|-------|---------|
| Caricamento | Skeleton o spinner con etichetta accessibile |
| Vuoto | Illustrazione + CTA primaria + copy esplicativo |
| Errore | Messaggio inline + retry dove applicabile |
| Rete offline | Banner su schermate autenticate; blocca azioni distruttive finché online |

### Note accessibilità

I pulsanti principali hanno etichette accessibilità. Le azioni estrazione e rivelazione annunciano cambi di stato. Le conferme eliminazione intrappolano il focus finché chiuse. I colori intensità sono integrati con etichette testo (mai significato solo colore).

## Decisioni assunte in questa riscrittura

- **Invito** è un flusso dedicato con schermata anteprima e share sheet.
- L'**eliminazione scatola** risiede nel menu contestuale home scatole con conferma a cascata.
- Il login Scatola delle Esperienze valida **appartenenza stesso gruppo** quando la combinazione corrisponde a un gruppo esistente.
- Il flusso **modifica esperienza** è documentato esplicitamente (mancava nella documentazione precedente).
