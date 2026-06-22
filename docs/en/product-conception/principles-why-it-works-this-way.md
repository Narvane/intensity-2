# Principles — Why It Works This Way

This document captures the philosophy behind Intensity — the objectives, premises, and conceptual trade-offs that explain why the product is shaped as it is. It is written for stakeholders, product thinkers, and designers who need to understand intent beyond feature lists.

---

## Short

Intensity exists because **connection should not be left to chance**. It separates **private contribution** from **shared revelation**, treats the draw as a **commitment device** rather than a game, and asks groups to **align before revealing** full descriptions. Groups grow through **invitations** so belonging is intentional. The product favors **presence over checklist completion** and **group sovereignty** over rigid rules.

---

## Medium

### Core philosophy

Intensity believes memorable moments are usually **unusual**, yet people **postpone** them waiting for perfect conditions. The product replaces passive waiting with a structured ritual: collect ideas when apart, draw and reveal when together.

### Guiding principles

| Principle | How it shows up |
|-----------|-----------------|
| **Don't leave connection to chance** | Proactive collection; draw as commitment trigger |
| **Take the draw seriously** | Randomness is a decision tool, not entertainment |
| **Decide before reveal** | Intensity and parameters first; alignment; then flip the card |
| **Respect the group** | Reflection before adding; justification visible on reveal |
| **Grow gradually** | Start light; evolve intensity over time |
| **Accountability matters** | Optional real consequences before reveal (social guidance) |
| **Group sovereignty** | Group decides filters, re-draws, pauses, timing, box deletion |
| **Belonging by choice** | Invitations complement joint login — no one is trapped in a group by accident |

### Key trade-offs

- **Async contribution / sync revelation** — different psychological contexts deserve different modes
- **Hidden text until alignment** — consent and readiness over surprise
- **Individual curation / collective consumption** — proponents own their words; the group owns the moment
- **Structured randomness** — filters available; the group disposes
- **Guidance over rigid rules** — consequences and swaps are voluntary social practices
- **Open membership / closed ritual** — anyone can join via invite, but the draw still happens when people are physically together

### What Intensity is not

- A task manager or habit tracker
- A social network or content feed
- A gambling or party game
- A curated experience marketplace

---

## Detailed

### Causal chain (onboarding logic)

```
Repetitive experiences
  → lack of proximity
    → best moments were unusual
      → but deferred
        → waiting replaces acting
          → Intensity: collect, draw, live
```

This narrative is not a feature spec — it is the **emotional argument** for why structured randomness and deliberate reveal matter.

### Why two modes exist

**Experiences** and **Experience Box** are not arbitrary splits. Contribution requires privacy, time, and reflection; revelation requires presence, eye contact, and collective consent. Forcing both into one mode would either kill the intimacy of the draw or discourage honest contribution.

### Why groups form through login and invites

Joint login in Experience Box mode mirrors the physical reality of the ritual: **who is in the room defines who plays**. That model alone, however, makes it hard to grow a group when not everyone can authenticate at once. **Invitations** extend membership asynchronously while preserving the rule that the draw ritual stays synchronous on a shared device.

### Why reveal comes after alignment

Showing intensity and parameters before the full description protects vulnerable ideas and prevents snap rejection. The proponent already reflected on group acceptance when contributing; the group reflects again before seeing the text. This double layer of consent is intentional — surprise is not the goal; **readiness** is.

### Why box deletion exists

Groups evolve. Themes lose relevance; mistakes happen; empty boxes clutter the home screen. Deleting a box is a **group sovereignty** decision — available in Experience Box mode when members are present, with clear confirmation because experiences inside are removed together with the box.

### Why draw results are not stored

Each draw is a **moment**, not a history entry. Storing outcomes would shift the product toward analytics and gamification, contradicting the presence principle. The group remembers the lived moment; the app provides the ritual, not the archive.

### Essence restated

**Connection, intensity, and discovery** — lived with presence. The product succeeds when people stop postponing and start showing up for each other, not when they complete a list.

## Decisions assumed in this rewrite

- **Invitations** were added as a first-class concept alongside joint login, with seven-day expiring invites and member-initiated sharing.
- **Box deletion** was added as an explicit group action in Experience Box mode, with cascade removal of contained experiences.
- Groups remain **implicitly named** (identified by member set, not user-chosen titles) to preserve simplicity.
