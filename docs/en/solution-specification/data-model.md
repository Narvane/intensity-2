# Data Model

This document defines the functional domain model of Intensity — entities, relationships, attributes, and business rules at the specification level. It is written for analysts, product owners, designers, and QA who need to understand what data exists and how it behaves, without implementation detail.

---

## Short

The domain centers on **Participant**, **Group**, **Box**, and **Experience**, plus transient **Draw Result** and operational **Session Context**. A group is a set of participants who share boxes; it forms through joint Experience Box login or grows via **Invite**. Boxes contain experiences; only the author edits or deletes an experience. Boxes can be **deleted** in Experience Box mode, removing all contained experiences. Draw results are not persisted.

---

## Medium

### Core entities

| Entity | Definition | Key attributes |
|--------|------------|----------------|
| **Participant** | Registered person who contributes and joins groups | Display name, email (login), credentials |
| **Group** | Set of participants who share boxes | Member list, creation moment |
| **Box** | Named thematic container of experiences | Name, type (1 of 11), creation moment, parent group |
| **Experience** | Concrete idea authored by one participant | Description (≤1,000 chars), intensity (1–5), effort/openness/novelty (1–5 each), reflection (≤2,000 chars), author, registration moment, integrity seal, parent box |
| **Invite** | Token allowing a participant to join a group | Parent group, creator, code, link token, expiry, status (active/revoked/expired/accepted) |
| **Session context** | Operational scope (not user-managed) | Access mode, active group, active box, box type |
| **Draw result** | Transient output of a draw — **not persisted** | Selected experience, filter applied, reveal state |

### Relationships

```
Participant ↔ Group      (many-to-many — membership)
Group       → Box        (one-to-many)
Box         → Experience (one-to-many)
Participant → Experience (one-to-many, authorship)
Group       → Invite     (one-to-many, active invites)
Participant → Invite     (creator and acceptor roles)
```

### Identity rules

- A **group** is identified by its **member set**, not a user-chosen name.
- The same participant combination always resolves to the same group; a different combination is a different group.
- One participant can belong to multiple groups.
- **Boxes** are created only in Experience Box mode.
- **Experiences** are registered mainly in Experiences mode and belong to exactly one box.
- Only the **author** can edit or delete an experience.

### Group formation and membership

| Event | Effect |
|-------|--------|
| Joint login (Experience Box) | If member combination is new, creates group; if existing, reopens it |
| Accept invite | Adds participant to group membership |
| Leave group | Removes participant from membership; their authored experiences remain in boxes |
| Last member leaves | Group, its boxes, experiences, and pending invites are removed |

### Invite rules

| Rule | Value |
|------|-------|
| Who can create | Any authenticated group member |
| Who can accept | Any registered participant (including immediately after registration) |
| Channels | Shareable deep link + 6-character alphanumeric code |
| Validity | 7 days from creation |
| Revocation | Creator or any member can revoke an active invite |
| Acceptance | Single acceptor per invite token; adds one member |

### Box deletion rules

| Rule | Value |
|------|-------|
| Who can delete | Any member present in the current Experience Box session |
| Scope | Deletes box and **all experiences inside** (cascade) |
| Confirmation | Required — shows box name and experience count |
| Undo | Not supported |

### Intensity and parameters

**Intensity levels (1–5):** Light, Uncomfortable, Courage, Bold, Adrenaline.

**Parameters (separate from intensity):**

| Parameter | Question |
|-----------|----------|
| Effort | How demanding is this experience? |
| Openness | How much gentle exposure or sincerity does it require? |
| Novelty | How different from the group's usual activities? |

Suggested intensity = rounded mean of the three parameters; the proponent confirms or adjusts.

### Draw filters

| Filter | Behavior |
|--------|----------|
| Any | All experiences in the active box |
| Exact | Exactly intensity level N |
| Up to | Intensity level N or lower |

### Not modeled as domain data

Profile photo, notification preferences, group display name editing, draw history, revelation events, social practice tracking (consequences, swaps, gradual progression), UI language preference (client-only), suggestion pack text (embedded client content).

---

## Detailed

### Participant

Represents a person with a unique email login. Registration requires the email to be on an allowlist maintained by operators. Display name appears to other group members in invite previews and shared contexts.

### Group

Emerges when:

1. Two or more participants authenticate together in Experience Box mode — if that exact set has no group yet, one is created.
2. A participant accepts an invite to an existing group.

Membership is **persistent**: a participant who joined via invite appears in Experiences mode group selection without needing to repeat joint login. Experience Box mode still uses multi-credential login to define **who is present for this session**; all credentials must belong to members of the same group, or authentication fails with a clear mismatch error.

**Empty state:** A group with one member (solo joint login or first invite not yet accepted) is valid — boxes can exist and experiences can be contributed, but the draw ritual is most meaningful with others present.

### Box

Eleven thematic types define default suggestion packs and visual presentation:

Saídas com amigos, Saídas em casal, Viagens em casal, Íntimo em casal, Viagens com amigos, Experiências com amigos, Sair da rotina, Primeiras vezes, Desconforto leve, Momentos de conexão, Experiências diferentes.

Default type when unspecified: **Saídas com amigos** (Outings with friends).

Attributes: user-chosen name, type, creation timestamp, parent group. Boxes support **create**, **list**, and **delete** — not rename or type change after creation.

**Deletion impact:** All experiences in the box are permanently removed. Authors lose their contributions in that box. Other boxes in the group are unaffected.

### Experience

Content fields plus metadata. The **integrity seal** is derived from the description text and displayed on cards — it signals that the text has not been silently altered since registration (domain term: **Seal**, not "hash").

**Visibility rules:**

| Context | What is shown |
|---------|---------------|
| Experiences list (author's own) | Full description for own items; summary (intensity + seal) for others' items in the same box |
| Draw result (before reveal) | Intensity, parameters, seal — no description |
| Draw result (after reveal) | Full description and reflection |

The app displays a transparency notice: experiences are **not encrypted** on the server.

### Invite

Functional lifecycle:

```
Created (active) → Accepted | Revoked | Expired
```

- **Created:** Member generates link + code; expiry = creation + 7 days.
- **Accepted:** Invitee confirms preview; becomes group member; invite marked accepted.
- **Revoked:** Any member or creator cancels before acceptance.
- **Expired:** Past validity window; cannot be accepted.

**Error states:** invalid code, expired invite, already a member, revoked invite, network failure during accept.

### Session context

Tracks: access mode (Experiences / Experience Box), selected group, selected box, active box type for suggestions. Not persisted as domain truth — reconstructed on login and navigation.

### Draw result

Ephemeral client state only. Each draw activation produces a new selection. "Back to draw" discards the current result. No server write occurs for draws.

### Suggestion packs

165 embedded examples (11 types × 5 intensity levels × 3 each). Suggestions inspire creation; they are **not copied** into the box unless the user saves an experience. Canonical suggestion text is Portuguese; localized variants exist for EN and IT interfaces.

## Decisions assumed in this rewrite

- **Invite** is a new persisted entity with link + code dual channel and 7-day expiry.
- **Box deletion** cascades to experiences; no soft-delete or archive.
- Group membership is explicit and survives beyond a single login session.
- Experience Box login validates that all authenticated participants belong to the **same** group when reopening an existing group session.
