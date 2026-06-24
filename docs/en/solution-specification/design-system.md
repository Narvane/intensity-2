# Design System

This document defines Intensity's **visual design system** — personality, flat cartoon direction, color tokens, typography, spacing, components, motion, and the draw ritual aesthetic. It is written for designers, frontend developers, and agents implementing UI.

**Related:** behavioral UX, terminology, and tone of voice live in [`experience-and-identity.md`](experience-and-identity.md). Screen behaviors live in [`functional-components.md`](functional-components.md). Visual presentation of screens must follow this document.

**Integration note:** This document absorbed the former standalone Style Guide and declarative tokens from the visual redesign proposal (June 2026). Diagnostic and agent-only artifacts were removed from the repository.

---

## Short

Intensity uses a **flat cartoon social adventure UI**: warm cream background (`#FFF7ED`), vibrant solid colors (coral primary), rounded typography, generous radii, soft shadows, and playful micro-motion. The product must feel like opening a **surprise box**, not using productivity software. Avoid corporate, banking, B2B SaaS, dashboard, or social-feed aesthetics. Reference apps: Duolingo, Headspace, Finch — never Jira, Trello, Notion, Monday, or Asana.

---

## Medium

### Brand feeling

The product must convey:

- fun
- discovery
- spontaneity
- friendship
- human connection
- positive anticipation

### Personality

| Do | Avoid |
|----|-------|
| Friendly, light, optimistic, welcoming, energetic, casual | Corporate, banking, B2B SaaS, dashboard, social-network look |

### Design direction — Flat Cartoon UI

| Characteristic | Anti-pattern |
|----------------|--------------|
| Simple shapes, solid colors, minimal detail | Realism, glassmorphism, skeuomorphism |
| Minimal illustrations, playful feel | Heavy gradients, heavy shadows |
| Large, accessible components | Thin 1–3px category borders as primary identity |

### Design heuristics

1. **Solid color over lines** — categorize with color blocks, not hairline borders.
2. **Space and grouping over separators** — generous breathing room.
3. **Icon or illustration over raw text** — every category has a symbol.
4. **Celebration over dry confirmation** — feedback with personality.
5. **One obvious primary action per screen** — secondary actions stay quiet.

### Core color tokens

| Token | Hex / value | Role |
|-------|-------------|------|
| `--bg` | `#FFF7ED` | App background (warm cream) |
| `--surface` | `#FFFFFF` | Cards, panels, sheets |
| `--surface-sunken` | `#FFF1DF` | Inputs, inset areas |
| `--text` | `#1F1F1F` | Primary text |
| `--text-muted` | `#5A5A5A` | Secondary text |
| `--coral` | `#FF6B3D` | Primary brand, primary CTA |
| `--coral-strong` | `#E85626` | Coral hover / pressed |
| `--yellow` | `#FFC94D` | Discovery, highlights |
| `--purple` | `#7B5CF6` | Creativity, Experiences mode |
| `--purple-soft` | `rgba(123,92,246,.14)` | Soft purple backgrounds (chips, banners, auxiliary panels) |
| `--teal` | `#2DBD9A` | Adventure |
| `--ink-soft` | `rgba(31,31,31,.06)` | Soft shadow base |

**Theme:** light mode only. Do not use `color-scheme: dark` or night radial gradients on pages.

### Intensity scale (1–5)

Use **affective warmth**, not a traffic-light risk scale. No red "danger" semantics for level 5.

| Level | Label | Color |
|-------|-------|-------|
| 1 | Light | `--teal` (`#2DBD9A`) |
| 2 | Uncomfortable | `#5BC8B0` |
| 3 | Courage | `--yellow` (`#FFC94D`) |
| 4 | Bold | `#FF9A4D` |
| 5 | Adrenaline | `--coral` (`#FF6B3D`) |

### Box type category colors

Each of the eleven box types uses a **solid brand color** on the card (not a top border stripe). Domain types are unchanged; only presentation changes.

| Family | Box types | Color token |
|--------|-----------|-------------|
| Friends | Outings with friends, Trips with friends, Experiences with friends | `--teal` |
| Couple | Outings as a couple, Trips as a couple, Intimate as a couple | `--coral` |
| Growth | Break the routine, First times, Mild discomfort | `--purple` |
| Connection | Connection moments, Different experiences | `--yellow` |

### Typography

- **Families:** Nunito (headings) + Nunito Sans or Quicksand (body). Rounded, human feel. Alternatives: Rubik, Plus Jakarta Sans.
- **Headings:** weight 700–800, large and impactful.
- **Body:** weight 400–500, highly legible.
- **Invite codes and Seal display:** use the rounded UI font with `letter-spacing` — not monospace.

### Radii, shadow, spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-button` | `24px` | Buttons |
| `--radius-card` | `20px` | Cards, panels, sheets |
| `--radius-chip` | `999px` | Chips, badges, avatars |
| `--radius-input` | `16px` | Inputs, textareas |
| `--shadow-soft` | `0 4px 12px rgba(0,0,0,.06)` | Layer separation only |

- **Spacing scale (4px base):** `4 / 8 / 12 / 16 / 24 / 32 / 48`
- **Page padding:** `24px` minimum; block gap ≥ `16px`
- **Touch target:** minimum **48px** height (44pt WCAG baseline still applies; prefer 48px in this system)

### Icons and illustrations

- **Icons:** Lucide preferred (simple outline, rounded corners, consistent stroke). Alternatives: Heroicons, Phosphor.
- **Illustrations:** flat cartoon — simple stroke, few details, happy expressions, rounded shapes. Themes: conversation, travel, coffee, beach, games, adventure, friendship. No realism, photography, or 3D renders.
- **Avoid text glyphs** as icons (`?`, `⋯`, `I` for logo).

### Master rule

If a screen could exist in Jira, Trello, Notion, Monday, or Asana — it is wrong. If it could coexist with Duolingo, Headspace, Finch, or a casual mobile game — it is likely correct.

---

## Detailed

### Color philosophy

Each box should feel like a **fun category**. Color aids recognition at a glance. Prefer solid fills over outlines.

**Purple (`--purple`):** always use as a **flat** color (`#7B5CF6`). Do not blend purple with `--teal` in gradients (e.g. `linear-gradient(teal → purple)`), which reads bluish and drifts from the token. Soft backgrounds use `--purple-soft` (neutral tint on white), not `color-mix` with teal. Experiences mode badges and icons: solid `background: var(--purple)`.

**Teal (`--teal`):** reserved for the Friends family (box types), invites, and low intensity scale — not as the primary Experiences flow accent.

### Lines and separators

Use lines minimally. Prefer whitespace, grouping, and contrast instead of visual dividers.

### Component — Button

| Variant | Treatment |
|---------|-----------|
| **Primary** | Solid `--coral`, white text, radius 24px, weight 700, no gradient |
| **Secondary** | White surface, coral text, soft coral border |
| **Ghost** | No box, `--text-muted` text |
| **States** | `:active` → `scale(0.96)` with light bounce; visible focus ring |
| **Size** | Min height 48px, comfortable horizontal padding |

Destructive confirm actions may use coral-strong or a dedicated warning treatment — never generic enterprise red unless confirming irreversible loss (see `experience-and-identity.md`).

### Component — Box card (collectible box)

Cards must feel like **collectible boxes**:

```
┌───────────────┐
│  ☕  (large     │  ← large icon on solid category color
│      icon)    │
│               │
│ Outings with  │  ← short title, weight 800
│ friends       │
│               │
│ 31 ideas   ›  │  ← prominent count + chevron
└───────────────┘
```

- Card background = **solid category color** (not a border accent).
- Large top icon in a rounded badge area.
- Idea count prominent.
- Optional overflow menu (icon, not `⋯` text) when applicable.
- Micro-motion: subtle scale/lift on press.

### Component — Experience card

- White rounded card (20px); **no `border-left` stripe**.
- Category/intensity shown as **colored chip** at top.
- `IntensityBadge` as rounded colored chip with label (e.g. "Courage"), not text-only.
- Edit/delete/preview in overflow menu — avoid CRUD table aesthetics.
- Pre-reveal summary feels like a **sealed card** (visual seal), not gray placeholder text.

### Component — Brand mark

- Rounded, playful logo in **coral**, box/tag shape with very rounded corners; optional mascot illustration.
- Replaces gradient teal lettermark treatments.

### Component — Integrity seal

- Wax/sticker metaphor: seal icon + short label in a chip.
- Light microcopy; never forensic or monospace "hash" presentation in UI.

### Component — Draw ritual card

The draw moment is the **emotional center** of the product. It must feel like:

- opening an envelope
- revealing a card
- discovering a prize

Never:

- a random list picker
- a generic modal
- a technical lottery widget

Cover side: intensity chip, parameters, seal. Face after reveal: full description, reflection, author name. Y-axis flip animation with playful timing (see Motion).

### Motion

Casual game feel. Allowed: bounce, scale, confetti, reveal transitions.

Avoid: slow transitions, dramatic motion, excessive animation.

Suggested draw reveal: short ease-out flip; alignment hint may use gentle pulse on amber/yellow chip before reveal.

### Auth and mode visuals

Mode clarity remains required (`experience-and-identity.md`). Within this system:

- **Experiences** path: **flat purple** (`--purple`) for session chrome, login, pills, and individual contribution highlights.
- **Experience Box** path: coral-forward ritual context.
- **Join via invite:** yellow or teal chip — distinct from login panels.
- **Registration:** neutral surface on warm background.

Do not use brown/blue corporate dual-mode palette or subtle wordmark gradients.

### Accessibility

- Touch targets ≥ 44pt (prefer 48px in this system).
- Text contrast WCAG AA on `--bg` and `--surface`.
- Intensity and filters always have **text labels**, not color alone.
- Focus states visible on all interactive components.
- Draw/reveal actions announce state changes to screen readers.

### What the design system deliberately avoids

- Gamification badges or streaks (product principle — unchanged)
- Social feed layouts
- Corporate enterprise UI patterns
- Dark productivity theme (`#0a1018`, heavy drop shadows)
- Green→red traffic-light intensity scale

### CSS token reference (implementation)

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
  --purple-soft: rgba(123, 92, 246, 0.14);
  --teal: #2DBD9A;
  --ink-soft: rgba(31, 31, 31, 0.06);
  --radius-button: 24px;
  --radius-card: 20px;
  --radius-chip: 999px;
  --radius-input: 16px;
  --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.06);
}
```

### Executive summary

**Flat cartoon social adventure UI: vibrant solid colors, rounded shapes, simple illustrations, discovery mood, casual game feel — with zero corporate or productivity-tool appearance.**
