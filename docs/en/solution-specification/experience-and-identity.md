# Experience and Identity

This document defines Intensity's UX guidelines and communication tone — how the product speaks to users and how key screens behave. It is written for designers, product owners, and anyone shaping user-facing communication.

**Visual presentation** (palette, typography, components, motion) is canonical in [`design-system.md`](design-system.md). This document covers terminology, tone of voice, screen behaviors, and consent patterns.

---

## Short

Intensity presents a **warm, intimate, courageous** brand with a **flat cartoon social adventure** look defined in the design system. Voice is direct, encouraging, and respectful of group consent. Two access modes — **Experiences** and **Experience Box** — stay functionally distinct in layout and copy; visual accents follow `design-system.md`.

---

## Medium

### Brand essence

| Attribute | Expression |
|-----------|------------|
| **Connection** | Flat cartoon onboarding illustrations, paired imagery, language of closeness |
| **Intensity** | Affective warmth scale (1–5), clear level labels, deliberate reveal animation |
| **Discovery** | Playful suggestion chips, themed box types, curiosity in copy |
| **Presence** | Minimal chrome during draw ritual; focus on the card moment |

### Visual presentation

Color tokens, typography, radii, shadows, component chrome, and motion are defined in [`design-system.md`](design-system.md). Do not duplicate tokens here.

**Mode accents (summary):**

| Mode | Visual cue (see design system) |
|------|--------------------------------|
| Experiences | Teal or purple contribution context |
| Experience Box | Coral-forward ritual context |
| Join via invite | Yellow or teal chip — distinct from login panels |

### Logo and naming

- **Product name:** Intensity — always capitalized in UI
- **Logo:** Rounded playful wordmark in coral; box/tag shape; used on splash, onboarding, and auth headers (see Brand mark in `design-system.md`)
- **App icon:** Abstract warm energy motif (store assets)

### UX principles

1. **Mode clarity** — layout, copy, and accent color immediately signal Experiences vs Experience Box
2. **Progressive disclosure** — intensity before text; invite preview before join
3. **Explicit consent** — confirmations for delete box, leave group, accept invite
4. **Empty states as guidance** — empty box encourages contribution; empty draw pool explains filters
5. **Accessibility baseline** — touch targets ≥44pt (prefer 48px per design system); contrast WCAG AA; screen reader labels on primary actions

### Terminology (canonical)

| UI term | Meaning |
|---------|---------|
| Experience | A concrete idea to do together |
| Box | Thematic collection of experiences |
| Experience Box | Group mode for boxes and draw ritual |
| Group | People who share boxes |
| Intensity | How bold an experience feels (1–5) |
| Draw | Random selection of an experience from a box |
| Reveal | Flip card to see full description |
| Seal | Integrity mark on experience card |
| Invite | Link or code to join a group |
| Proponent | Person who contributed an experience |

Avoid technical terms like "hash" in user copy — use **Seal**.

---

## Detailed

### Onboarding visual narrative

Four illustrated steps tell the emotional story: repetitive routines → longing for connection → unusual moments postponed → Intensity as answer. Illustrations use diverse couples and friend groups in flat cartoon style; tone is hopeful, not clinical.

### Authentication panels

Three sub-panels within one auth screen:

| Panel | Visual cue | Primary action |
|-------|------------|----------------|
| Experiences login | Teal or purple accent | Single credential form |
| Experience Box login | Coral accent | Multi-credential cards with "+" to add participant |
| Registration | Neutral surface on warm background | Display name, email, password |
| Join via invite | Yellow or teal accent chip | Code entry field + "Continue" |

Invite entry is reachable from auth without full login — leads to preview screen after code validation.

### Box type presentation

Eleven types appear in a **two-column grid** with:

- Type icon badge on solid category color (see `design-system.md` Box type colors)
- Title
- Subtitle hint

Catalog has internal presentation sections (friends, couple, personal, social) but the creation UI shows a **flat list** without section headers.

### Experience cards

**List card (Experiences mode):** intensity chip, parameter indicators, seal, truncated or hidden description depending on authorship.

**Draw card (Experience Box mode):** two-sided card with Y-axis flip animation. Cover: intensity, parameters, seal. Face: full description and reflection (authorship hidden during the ritual).

### Destructive actions

**Delete box** and **Leave group** use:

- Warning treatment on confirm (coral-strong or dedicated destructive style per `design-system.md`)
- Summary of impact (experience count / membership loss)
- Cancel as safe default (secondary button)

**Delete experience** (author only): simpler confirm dialog; no cascade beyond single item.

### Invite sharing sheet

Native share sheet with pre-filled message:

*"Join our group on Intensity — [link]. Or enter code: [CODE]"*

Code displayed in large rounded UI type with letter-spacing — copyable, not monospace. Expiry shown as human-readable date.

### Tone of voice

| Context | Style |
|---------|-------|
| Onboarding | Warm, narrative, second person |
| Quick guide | Direct rules, imperative verbs |
| Alignment hint | Gentle, yellow chip — "Take a moment together before revealing" |
| Errors | Plain language, actionable recovery |
| Empty states | Encouraging, never blaming |

**Examples:**

- ✓ "Draw again if this one doesn't fit the moment."
- ✓ "Everyone in the room should belong to the same group."
- ✗ "Invalid group_combination_error."

### Localization

Interface supports **English**, **Portuguese (Brazil)**, and **Italian**. Domain terms are translated consistently (see localized docs). Suggestion pack examples follow interface language where localized packs exist; canonical authoring examples remain Portuguese in the embedded catalog.

### What identity deliberately avoids

- Gamification badges or streaks
- Social feed aesthetics
- Corporate enterprise UI patterns
- Aggressive urgency or FOMO copy

## Decisions assumed in this rewrite

- **Invite** UI uses yellow or teal accent to distinguish from auth modes (`design-system.md`).
- **Delete box** follows the same destructive confirmation pattern as leave group.
- Filter labels in UI use **Exact** and **Up to** (not internal "fixed/max" naming).
