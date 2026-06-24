# Functional Components

This document catalogs Intensity's functional modules, screens, user flows, and interface behaviors — what the user can do, where, and under what conditions. It specifies *what exists functionally* in the interface, without implementation detail.

**Audience:** analysts, product owners, designers, and functional QA — people who need to map features, journeys, and screen behaviors without knowing how the app was built.

**Visual presentation** of screens and components follows [`design-system.md`](design-system.md).

---

## Short

Intensity is a **mobile app** organized around **fourteen primary views** plus overlays. After bootstrap and optional onboarding, the user authenticates in one of four paths (**Experiences**, **Experience Box**, **Registration**, or **Join via invite**). The **Experiences** path flows through group selection → box selection → experience list → creation assistant. The **Experience Box** path flows through box home (list, create, invite, delete) → shared moment (draw and reveal). Each screen handles **loading**, **empty**, and **error** states explicitly.

---

## Medium

### Functional modules

| Module | Purpose |
|--------|---------|
| **Bootstrap** | Load language preference and first-run state before showing content |
| **Onboarding** | Four-step illustrated introduction to the product story |
| **Quick guide** | Reusable manual with core rules, flow, and tips |
| **Authentication** | Login (Experiences or Experience Box), registration, invite entry, help access |
| **Join via invite** | Preview group and accept membership |
| **Group selection** | Choose which group to contribute to (Experiences mode) |
| **Box selection** | Choose which box within the group (Experiences mode) |
| **Experience list** | View, reveal, edit, and delete own experiences in the active box |
| **Creation assistant** | Five-step guided flow to register a new experience |
| **Box home** | List, create, invite to, and delete boxes (Experience Box mode) |
| **Create box** | Sub-view from box home |
| **Group management** | Invite sharing, leave group (from box home or Experiences group context) |
| **Shared moment** | Random draw with filters, alignment hint, and card reveal |
| **Error recovery** | Screen for unrecognized session state with exit options |

### Screen catalog

| # | Screen | When shown |
|---|--------|------------|
| 1 | Bootstrap loading | Language/onboarding preferences not ready |
| 2 | Onboarding (4 steps) | First run |
| 3 | Quick guide | From onboarding or auth help; overlay |
| 4 | Authentication | No active session; onboarding complete |
| 5 | Join via invite | Valid code entered from auth or deep link |
| 6 | Unknown session | Session access mode not recognized |
| 7 | Group selection | Experiences mode; no group chosen |
| 8 | Box selection | Experiences mode; group set, box not chosen |
| 9 | Experience list | Experiences mode; group and box set |
| 10 | Creation assistant | Overlay from experience list |
| 11 | Box home | Experience Box mode |
| 12 | Create box | Sub-view from box home |
| 13 | Shared moment | Experience Box mode; box opened |
| 14 | Invite share | Sheet/overlay from box home or group management |

Authentication contains four **sub-panels** (not separate routes): Experiences login, Experience Box multi-login, Registration, and Invite code entry.

### Main user flows

```
Flow A — First run
  Bootstrap → Onboarding (4 steps) → [Optional quick guide] → Authentication

Flow B — Experiences (individual contribution)
  Auth → Group selection → Box selection → Experience list
    → [+ Create] → Assistant overlay → back to list
  Back: list → box selection → group selection
  Exit: logout from any authenticated screen

Flow C — Experience Box (group ritual)
  Auth (multi-user) → Box home → [Create box | Invite | Delete box]
    → Open box → Shared moment → Draw → Align → Reveal → Back to draw
  Back: shared moment → box home
  Exit: logout

Flow D — Join via invite
  Auth invite entry OR deep link → Join preview → Accept → Group selection (Experiences)
    OR prompt to enter Experience Box with group members

Flow E — Error recovery
  Unknown session → Logout OR Enter Experience Box (clears session)
```

### Group formation and invites

**When a group is born:**

1. Two or more participants authenticate together in Experience Box mode — new combination creates a group.
2. First member can also start solo (one credential); group exists with one member until others join via invite or future joint login.

**Invite flow:**

1. Member opens **Invite** from box home or group menu in Experiences mode.
2. App generates link + 6-character code (valid 7 days).
3. Member shares via system share sheet or copies code.
4. Recipient enters code on auth screen or opens deep link.
5. **Join preview** shows member display names (not emails).
6. Recipient accepts → added to group → lands in group selection (Experiences) or success message with next-step guidance.

**Permissions:**

| Action | Who |
|--------|-----|
| Create invite | Any group member |
| Revoke invite | Creator or any member |
| Accept invite | Invitee (registered account required) |
| Leave group | Any member (confirm); last member triggers group deletion |

**Errors:** invalid/expired/revoked code; already a member; network failure; allowlist registration required for new users.

### Box deletion

Available from **box home** in Experience Box mode:

1. Member opens context menu on a box card → **Delete box**.
2. Confirmation dialog: box name, experience count, irreversible warning.
3. Confirm → box and all experiences removed → return to box home with success toast.
4. Cancel → no change.

**Who can delete:** any member authenticated in the current Experience Box session.

**Errors:** network failure (retry offered); unauthorized if session invalid.

### Creation assistant steps

| Step | Label | User action |
|------|-------|-------------|
| 1 — Suggestion | Write description or tap type suggestion as inspiration |
| 2 — Reflection | Justify why the group would accept the idea |
| 3 — Parameters | Rate effort, openness, novelty (1–5 stars each) |
| 4 — Classification | Confirm or adjust overall intensity (auto-suggested from parameters) |
| 5 — Branching | Review summary; save and create another, or finish |

Persistent description card and five-segment progress indicator throughout.

### Shared moment features

- **Filter modes:** Any (no intensity filter), Exact (fixed level 1–5), Up to (inclusive maximum)
- **Draw action:** random selection among eligible experiences in the box
- **Result card:** intensity cover (level, parameters, seal) before reveal
- **Alignment hint:** prompts group agreement before flipping card
- **Reveal:** Y-axis flip to read full description
- **Return:** back to draw for new selection

### Eleven box types

Each type has title, subtitle hint, visual highlight, and associated suggestion pack. Default: **Outings with friends**.

---

## Detailed

### Bootstrap loading

Shows brand splash while loading local preferences (language, onboarding completed flag). Transitions to onboarding or authentication. Error: retry load preferences.

### Onboarding

Four swipable steps with illustrations and copy. Final step offers entry to quick guide or skip to authentication. Never shown again once completed (flag stored locally).

### Authentication

**Experiences login:** email + password → group selection.

**Experience Box login:** one or more credential cards; "+" adds another participant. All must authenticate successfully. All participants must belong to the **same group** when joining an existing group, OR form a new group if the combination is new. Mismatch error explains that credentials belong to different groups.

**Registration:** display name, email, password. Email must be on operator allowlist. Success → login panel.

**Invite code entry:** 6-character field; validates format → join preview or error.

Help icon opens quick guide overlay.

### Join via invite

Displays: group member first names / display names, invite expiry, accept and cancel buttons. Accept requires authenticated session — if opened via deep link without session, prompts login or registration first. Success navigates to Experiences group selection with new group pre-selected.

### Group selection (Experiences)

Lists groups where the participant is a member. Empty state: "Join a group via invite or enter Experience Box with others." Each row shows member count and optional last activity hint. Actions: select group, **Invite** (share new invite), **Leave group** (confirm).

### Box selection (Experiences)

Lists boxes in selected group. Empty state: "Create a box together in Experience Box mode." Select box → experience list.

### Experience list

Shows contributions in active box. Own items: intensity, parameters, and seal always visible; description and reflection revealed by the author via eye icon; edit and delete in the card footer. Others' items: intensity + seal summary only (no description). Page actions: create (+), logout, back.

**Edit experience:** author opens edit from item menu → same fields as assistant (pre-filled) → save.

### Box home (Experience Box)

Two-column grid of box cards with type seal, name, subtitle. Actions per card: **Open**, **Delete** (menu). Header actions: **Create box**, **Invite**, logout. Empty state: create first box CTA.

**Delete box dialog:** "Delete [name]? This removes [N] experiences permanently." Confirm / Cancel.

### Create box

Name field, type picker (flat 11-type list), create button. Validation: name required (1–80 chars). Success returns to box home with new card.

### Shared moment

Filter chips + optional intensity selector (defaults to 3 — Courage). Draw button label adapts to filter mode. Loading: "Choosing…". Empty box: hint card to add experiences via Experiences mode. Empty filter pool: "No experiences available."

Post-draw: alignment hint (amber dashed), reveal button, back to draw. Revealed state shows full description and reflection, without identifying the author.

### Unknown session

Shown when stored session context is invalid. Options: logout (clear all) or switch to Experience Box entry (clear mode, keep credentials if any).

### Cross-cutting UI states

| State | Pattern |
|-------|---------|
| Loading | Skeleton or spinner with accessible label |
| Empty | Illustration + primary CTA + explanatory copy |
| Error | Inline message + retry where applicable |
| Network offline | Banner on authenticated screens; block destructive actions until online |

### Accessibility notes

Primary buttons have accessibility labels. Draw and reveal actions announce state changes. Delete confirmations trap focus until dismissed. Intensity colors supplemented with text labels (never color-only meaning).

## Decisions assumed in this rewrite

- **Invite** is a dedicated flow with preview screen and share sheet.
- **Box deletion** lives in box home context menu with cascade confirm.
- Experience Box login validates **same-group membership** when combination matches an existing group.
- **Edit experience** flow is explicitly documented (was missing in prior docs).
