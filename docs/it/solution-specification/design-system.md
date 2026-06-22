# Design System

Questo documento definisce il **design system visivo** di Intensity — personalità, direzione flat cartoon, token colore, tipografia, spaziatura, componenti, movimento ed estetica del rituale di estrazione. È scritto per designer, sviluppatori frontend e agenti che implementano l'interfaccia.

**Correlati:** UX comportamentale, terminologia e tono di voce sono in [`experience-and-identity.md`](experience-and-identity.md). I comportamenti schermata sono in [`functional-components.md`](functional-components.md). La presentazione visiva delle schermate deve seguire questo documento.

**Nota di integrazione:** Questo documento ha assorbito l'ex Style Guide standalone e i token dichiarativi dalla proposta di redesign visivo (giu/2026). Artefatti diagnostici e prompt agente sono stati rimossi dal repository.

---

## Breve

Intensity usa una **UI flat cartoon di avventura sociale**: sfondo crema caldo (`#FFF7ED`), colori solidi vibranti (corallo primario), tipografia arrotondata, raggi generosi, ombre morbide e micro-animazioni giocose. Il prodotto deve sembrare aprire una **scatola delle sorprese**, non usare software di produttività. Evitare estetica corporate, bancaria, SaaS B2B, dashboard o social feed. Riferimenti: Duolingo, Headspace, Finch — mai Jira, Trello, Notion, Monday o Asana.

---

## Media

### Sensazione del brand

Il prodotto deve trasmettere:

- divertimento
- scoperta
- spontaneità
- amicizia
- connessione umana
- attesa positiva

### Personalità

| Fare | Evitare |
|------|---------|
| Amichevole, leggero, ottimista, accogliente, energico, casual | Corporate, bancario, SaaS B2B, dashboard, social network |

### Direzione di design — Flat Cartoon UI

| Caratteristica | Anti-pattern |
|----------------|--------------|
| Forme semplici, colori solidi, pochi dettagli | Realismo, glassmorphism, skeuomorfismo |
| Illustrazioni minime, clima ludico | Gradienti pesanti, ombre pesanti |
| Componenti grandi e accessibili | Bordi sottili 1–3px come identità principale |

### Euristiche di design

1. **Colore solido > linea** — categorizzare con blocchi colore, non bordi sottili.
2. **Spazio e raggruppamento > separatori** — respiro generoso.
3. **Icona o illustrazione > testo grezzo** — ogni categoria ha un simbolo.
4. **Celebrazione > conferma secca** — feedback con personalità.
5. **Un'azione principale ovvia per schermata** — secondarie discrete.

### Token colore principali

| Token | Hex / valore | Ruolo |
|-------|--------------|-------|
| `--bg` | `#FFF7ED` | Sfondo app (crema caldo) |
| `--surface` | `#FFFFFF` | Card, pannelli, sheet |
| `--surface-sunken` | `#FFF1DF` | Input, aree interne |
| `--text` | `#1F1F1F` | Testo principale |
| `--text-muted` | `#5A5A5A` | Testo secondario |
| `--coral` | `#FF6B3D` | Brand principale, CTA primario |
| `--coral-strong` | `#E85626` | Corallo hover / pressed |
| `--yellow` | `#FFC94D` | Scoperta, evidenziazioni |
| `--purple` | `#7B5CF6` | Creatività |
| `--teal` | `#2DBD9A` | Avventura |
| `--ink-soft` | `rgba(31,31,31,.06)` | Base ombra morbida |

**Tema:** solo modalità chiara. Non usare `color-scheme: dark` né gradienti radiali notturni sulle pagine.

### Scala intensità (1–5)

Usare **calore affettivo**, non scala semaforica di rischio. Nessuna semantica rossa di "pericolo" al livello 5.

| Livello | Etichetta | Colore |
|---------|-----------|--------|
| 1 | Leggero | `--teal` (`#2DBD9A`) |
| 2 | Scomodo | `#5BC8B0` |
| 3 | Coraggio | `--yellow` (`#FFC94D`) |
| 4 | Audace | `#FF9A4D` |
| 5 | Adrenalina | `--coral` (`#FF6B3D`) |

### Colori per categoria scatola

Ciascuno degli undici tipi usa **colore solido di marca** sulla card (non striscia in alto). Tipi di dominio invariati; cambia solo la presentazione.

| Famiglia | Tipi scatola | Token |
|----------|--------------|-------|
| Amici | Uscite con amici, Viaggi con amici, Esperienze con amici | `--teal` |
| Coppia | Uscite in coppia, Viaggi in coppia, Intimo in coppia | `--coral` |
| Crescita | Uscire dalla routine, Prime volte, Disagio leggero | `--purple` |
| Connessione | Momenti di connessione, Esperienze diverse | `--yellow` |

### Tipografia

- **Famiglie:** Nunito (titoli) + Nunito Sans o Quicksand (corpo). Arrotondata e umana. Alternative: Rubik, Plus Jakarta Sans.
- **Titoli:** peso 700–800, grandi e impattanti.
- **Corpo:** peso 400–500, alta leggibilità.
- **Codici invito e Sigillo:** font arrotondato UI con `letter-spacing` — non monospace.

### Raggi, ombra, spaziatura

| Token | Valore | Uso |
|-------|--------|-----|
| `--radius-button` | `24px` | Pulsanti |
| `--radius-card` | `20px` | Card, pannelli, sheet |
| `--radius-chip` | `999px` | Chip, badge, avatar |
| `--radius-input` | `16px` | Input, textarea |
| `--shadow-soft` | `0 4px 12px rgba(0,0,0,.06)` | Solo separazione livelli |

- **Scala spaziatura (base 4px):** `4 / 8 / 12 / 16 / 24 / 32 / 48`
- **Padding pagina:** minimo `24px`; gap tra blocchi ≥ `16px`
- **Target touch:** altezza minima **48px** (baseline WCAG 44pt ancora valida; preferire 48px in questo sistema)

### Icone e illustrazioni

- **Icone:** Lucide preferito (outline semplice, angoli arrotondati, tratto consistente). Alternative: Heroicons, Phosphor.
- **Illustrazioni:** flat cartoon — tratto semplice, pochi dettagli, espressioni felici, forme arrotondate. Temi: conversazione, viaggio, caffè, spiaggia, giochi, avventura, amicizia. Niente realismo, fotografia o 3D.
- **Evitare glifi testo** come icone (`?`, `⋯`, `I` per logo).

### Regola principale

Se una schermata potesse esistere in Jira, Trello, Notion, Monday o Asana — è sbagliata. Se potesse coesistere con Duolingo, Headspace, Finch o un gioco mobile casual — probabilmente è corretta.

---

## Dettagliata

### Filosofia del colore

Ogni scatola deve sembrare una **categoria divertente**. Il colore aiuta il riconoscimento immediato. Preferire riempimenti solidi ai contorni.

### Linee e separatori

Usare linee al minimo. Preferire spazio bianco, raggruppamento e contrasto.

### Componente — Pulsante

| Variante | Trattamento |
|----------|-------------|
| **Primario** | `--coral` solido, testo bianco, raggio 24px, peso 700, senza gradiente |
| **Secondario** | Superficie bianca, testo corallo, bordo corallo morbido |
| **Ghost** | Senza box, testo `--text-muted` |
| **Stati** | `:active` → `scale(0.96)` con leggero bounce; focus visibile |
| **Dimensione** | Altezza min. 48px, padding orizzontale confortevole |

Azioni distruttive di conferma possono usare coral-strong o trattamento avviso dedicato — non rosso enterprise generico, salvo perdita irreversibile (vedi `experience-and-identity.md`).

### Componente — Card scatola (collezionabile)

Le card devono sembrare **scatole collezionabili**:

```
┌───────────────┐
│  ☕  (icona    │  ← icona grande su colore solido categoria
│      grande)  │
│               │
│ Uscite con    │  ← titolo breve, peso 800
│ amici         │
│               │
│ 31 idee    ›  │  ← contatore in evidenza + chevron
└───────────────┘
```

- Sfondo card = **colore solido categoria** (non bordo).
- Icona grande in alto in area badge arrotondato.
- Contatore idee prominente.
- Menu overflow opzionale (icona, non testo `⋯`) quando applicabile.
- Micro-movimento: leggero scale/lift al tocco.

### Componente — Card esperienza

- Card bianca arrotondata (20px); **nessuna striscia `border-left`**.
- Categoria/intensità come **chip colorato** in alto.
- `IntensityBadge` come chip arrotondato con etichetta (es. "Coraggio"), non solo testo.
- Modifica/elimina/anteprima in menu overflow — evitare estetica tabella CRUD.
- Riepilogo pre-rivelazione come **carta sigillata** (sigillo visivo), non testo grigio placeholder.

### Componente — Marchio (Brand mark)

- Logo arrotondato e giocoso in **corallo**, forma scatola/etichetta con angoli molto arrotondati; mascotte opzionale.
- Sostituisce trattamenti lettera "I" in gradiente teal.

### Componente — Sigillo di integrità

- Metafora cera/adesivo: icona sigillo + etichetta breve in chip.
- Microcopy leggera; mai presentazione forense o monospace di "hash" nell'UI.

### Componente — Carta rituale estrazione

Il momento dell'estrazione è il **centro emotivo** del prodotto. Deve sembrare:

- aprire una busta
- rivelare una carta
- scoprire un premio

Mai:

- un selettore lista casuale
- un modale generico
- un sorteggiatore tecnico

Copertina: chip intensità, parametri, sigillo. Fronte dopo rivelazione: descrizione completa, riflessione, nome autore. Animazione flip asse Y con timing giocoso (vedi Movimento).

### Movimento

Clima gioco casual. Consentito: bounce, scale, confetti, transizioni reveal.

Evitare: transizioni lente, motion drammatico, animazione eccessiva.

Suggerimento reveal estrazione: flip breve ease-out; suggerimento allineamento può usare pulse delicato su chip giallo prima del reveal.

### Auth e modalità visive

Chiarezza modalità resta obbligatoria (`experience-and-identity.md`). In questo sistema:

- **Esperienze:** accenti teal o viola per contesto contributo individuale.
- **Scatola delle Esperienze:** contesto rituale con accento corallo.
- **Unisciti via invito:** chip giallo o teal — distinto dai pannelli login.
- **Registrazione:** superficie neutra su sfondo caldo.

Non usare palette corporate marrone/blu né gradienti sottili sul wordmark.

### Accessibilità

- Target touch ≥ 44pt (preferire 48px in questo sistema).
- Contrasto testo WCAG AA su `--bg` e `--surface`.
- Intensità e filtri sempre con **etichette testo**, non solo colore.
- Stati focus visibili su tutti i componenti interattivi.
- Azioni estrazione/rivelazione annunciano cambio stato agli screen reader.

### Cosa il design system evita deliberatamente

- Badge gamification o streak (principio prodotto — invariato)
- Layout social feed
- Pattern UI corporate enterprise
- Tema scuro produttività (`#0a1018`, ombre pesanti)
- Scala semaforica verde→rosso per intensità

### Riferimento token CSS (implementazione)

```css
:root {
  --bg: #FFF7ED;
  --surface: #FFFFFF;
  --surface-sunken: #FFF1DF;
  --text: #1F1F1F;
  --text-muted: #5A5A5A;
  --coral: #FF6B3D;
  --coral-strong: #E85626;
  --yellow: #FFC94D;
  --purple: #7B5CF6;
  --teal: #2DBD9A;
  --ink-soft: rgba(31, 31, 31, 0.06);
  --radius-button: 24px;
  --radius-card: 20px;
  --radius-chip: 999px;
  --radius-input: 16px;
  --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.06);
}
```

### Riepilogo esecutivo

**UI flat cartoon di avventura sociale: colori solidi vibranti, forme arrotondate, illustrazioni semplici, clima scoperta, sensazione gioco casual — senza alcuna apparenza corporate o da strumento di produttività.**
