# UI Guidelines — Plataforma Nana

## Overview

Plataforma Nana is a warm, editorial-first student platform for language learners. The visual identity draws from printed matter and personal notebooks — organic warmth, serif display type, muted pastels — while keeping the UI clean and functional.

---

## File Structure

| File | Role |
|---|---|
| `tokens.css` | All design tokens: colors, spacing, radii, typography |
| `chrome.jsx` | App shell: `Sidebar`, `RightRail`, `Icon`, `Avatar`, `NavBtn` |
| `screens.jsx` | Page components: `HomeScreen`, `DictionaryScreen`, `HomeworkScreen`, `MaterialsScreen` |
| `app.jsx` | Root: route state, theme application, `STUDENT` config |
| `tweaks-panel.jsx` | Dev tool only — theme/density switcher, not shipped to users |

---

## Layout

The app always uses a **three-column shell**:

```
┌──────────┬────────────────────────────┬───────────┐
│ Sidebar  │  Main content              │ Right Rail│
│  76px    │  flex: 1                   │  332px    │
└──────────┴────────────────────────────┴───────────┘
```

- **Sidebar** (`76px`): icon-only nav, logo, avatar. No labels.
- **Main content**: scrollable, owns the page-level padding.
- **Right Rail** (`332px`): student profile, CEFR bar, next class, streak, XP stats.

**Page padding:** `44px 56px 56px` on most screens.

---

## Tokens Reference

### Color Palettes

Four themes, switched via `data-palette` on `<html>`:

| Token | Warm (default) | Cool | Earthy | Ink (dark) |
|---|---|---|---|---|
| `--bg-app` | `#e6dccf` | `#d6dde0` | `#c8b8a1` | `#1a1714` |
| `--bg-window` | `#f6f0e6` | `#f3f4f3` | `#e9dcc6` | `#211d18` |
| `--bg-elevated` | `#fbf8f1` | `#fafbfa` | `#f1e8d4` | `#2b2620` |
| `--bg-sunken` | `#efe7d8` | `#ebedec` | `#ddcfb8` | `#181410` |

**Always use semantic tokens, never raw hex values.**

### Ink Scale (text)

| Token | Usage |
|---|---|
| `--ink-1` | Primary text, headings |
| `--ink-2` | Secondary text, interactive labels |
| `--ink-3` | Supporting text, metadata |
| `--ink-4` | Muted text, placeholders |
| `--ink-5` | Disabled, decorative |

### Pastel Accent Colors

Each accent has a **background** and an **ink** (text) token:

| Color | Background token | Text token | Typical use |
|---|---|---|---|
| Rose | `--c-rose` | `--c-rose-ink` | New / pending states |
| Peach | `--c-peach` | `--c-peach-ink` | In-progress, homework |
| Butter | `--c-butter` | `--c-butter-ink` | Flags, warnings (false friends) |
| Lavender | `--c-lavender` | `--c-lavender-ink` | Dictionary, primary cards |
| Mint | `--c-mint` | `--c-mint-ink` | Mastered, success, next class |
| Sky | `--c-sky` | `--c-sky-ink` | Materials, links |
| Clay | `--c-clay` | `--c-clay-ink` | Warm accent, misc |

**Rule:** always pair a color token with its `-ink` counterpart for text. Never use a non-ink token for text on a colored background.

### Accent (high-contrast CTA)

| Token | Value |
|---|---|
| `--accent` | `--ink-1` (near-black) |
| `--accent-ink` | `--bg-elevated` (near-white) |

Use `--accent` / `--accent-ink` for primary action buttons only.

### Borders

| Token | Usage |
|---|---|
| `--line` | Subtle dividers, card borders |
| `--line-strong` | More prominent dividers, ghost button borders |

---

## Spacing Scale

| Token | Value | Common usage |
|---|---|---|
| `--sp-1` | 4px | Icon padding |
| `--sp-2` | 8px | Chip padding, inline gaps |
| `--sp-3` | 12px | Small gaps |
| `--sp-4` | 16px | Standard padding |
| `--sp-5` | 20px | Default gap/pad (maps to `--d-gap`, `--d-pad`) |
| `--sp-6` | 24px | Card padding (maps to `--d-card-pad`) |
| `--sp-7` | 32px | Section gaps |
| `--sp-8` | 40px | Large spacing |
| `--sp-9` | 56px | Page padding horizontal |
| `--sp-10` | 72px | Page padding top |

### Density variants

Via `data-density` on `<html>`:

| Density | `--d-row` | `--d-pad` | `--d-gap` | `--d-card-pad` |
|---|---|---|---|---|
| `compact` | 44px | 14px | 14px | 18px |
| `regular` (default) | 56px | 20px | 20px | 24px |
| `comfy` | 64px | 26px | 28px | 30px |

**Use density tokens (`--d-gap`, `--d-card-pad`) for card padding and layout gaps — never hardcode values.**

---

## Radii

| Token | Value | Usage |
|---|---|---|
| `--r-sm` | 8px | Small chips, icon containers |
| `--r-md` | 12px | Cards, input fields, exercise blocks |
| `--r-lg` | 18px | Large cards, module cards, panels |
| `--r-xl` | 24px | Very large containers (rare) |
| `--r-pill` | 999px | Buttons, tags, status pills |

---

## Typography

### Font Families

| Token | Fonts | Use for |
|---|---|---|
| `--font-display` | Instrument Serif → Newsreader → Georgia | All headings, word display, large decorative text |
| `--font-sans` | Geist → DM Sans → system-ui | Body text, UI labels, buttons |
| `--font-mono` | Geist Mono → JetBrains Mono | Eyebrows, metadata, counts, status labels |

### Type Pairings

Via `data-typeface` on `<html>`:

- `editorial` (default): Instrument Serif display + Geist sans
- `modern`: Geist for both display and body
- `classic`: Newsreader display + DM Sans body

### Size Guidelines

| Role | Size | Font | Weight |
|---|---|---|---|
| Hero heading | 64px | display | 400 |
| Page heading | 56px | display | 400 |
| Section heading | 30–40px | display | 400 |
| Card title | 22–32px | display | 400 |
| Word display | 22–56px | display | 400 |
| Body | 13–15px | sans | 400 |
| Labels / eyebrows | 10–11px | mono | 400–500 |
| Status pills | 11px | mono | 400 |

**Always use `font-weight: 400` for display font** — Instrument Serif has no bold. Italic (`fontStyle: "italic"`) is the emphasis mechanism.

### Eyebrows

Eyebrows are the small metadata label above headings. Always:
- `fontFamily: "var(--font-mono)"`
- `fontSize: 11px`
- `letterSpacing: 0.08`
- `textTransform: "uppercase"`
- `color: "var(--ink-3)"`

---

## Components

### PageHeader

Standard heading for full-page views. Accepts `eyebrow`, `title`, `accent` (italic, rose-ink colored), `subtitle`, and `right` slot.

```jsx
<PageHeader
  eyebrow="247 words · since February 4"
  title="Your"
  accent="dictionary."
  subtitle="Every word here came from a conversation with Natália."
  right={<SearchInput />}
/>
```

- The `accent` word renders in italic in `--c-rose-ink`.
- `subtitle` max-width is ~460px.

### ModuleCard

Large colored card for navigating to a section. Used on Home.

```jsx
<ModuleCard
  tone="lavender"          // pastel color name (no --c- prefix)
  icon="book"              // Icon name
  eyebrow="Dictionary · 247 words"
  title={<>Your words from <i>Wednesday's class</i>.</>}
  body="14 new entries waiting."
  footer="Open dictionary"
  onClick={() => setRoute("dictionary")}
  big                      // optional: taller variant
/>
```

- Background: `var(--c-{tone})`, text: `var(--c-{tone}-ink)`.
- Hover: `translateY(-2px)`.
- The icon sits inside a `rgba(255,255,255,.45)` circle.

### Chip (filter tag)

Pill-shaped filter button. Active state inverts to `--ink-1` background.

```jsx
<Chip active={filter === "all"} onClick={() => setFilter("all")} count={247}>
  All
</Chip>
```

### SearchInput

Pill-shaped search field with a search icon.

```jsx
<SearchInput placeholder="Search words…" value={query} onChange={setQuery} />
```

### Icon

SVG icon component. All icons are 24×24 viewBox, stroke-based.

```jsx
<Icon name="book" size={18} stroke={1.6} />
```

Available names: `home`, `book`, `pencil`, `folder`, `spark`, `cal`, `cog`, `bell`, `search`, `plus`, `arrowR`, `arrowL`, `check`, `flame`, `play`, `dot`, `grid`, `sliders`, `headset`, `paper`, `link`, `quote`, `star`, `bolt`.

### Avatar

Circular avatar with initials, display font italic.

```jsx
<Avatar name="LM" size={72} tone="lavender" />
```

### StatusDot / HWPill

Color-coded status indicators:

| Status | Color |
|---|---|
| `new` | rose |
| `learning` | peach |
| `mastered` | mint |
| `pending` | rose |
| `in-progress` | peach |
| `done` | mint |

### NavBtn

Sidebar icon button. Active state: `--ink-1` background, `--bg-elevated` icon. Supports `dot` prop for badge.

---

## Interaction Patterns

### Hover

Cards and rows that navigate: `transform: translateY(-2px)` on hover, transition `0.2s ease`.

Interactive rows (dict rows, hw cards): background shifts to `--bg-elevated` on hover.

### Primary Button

```jsx
background: "var(--ink-1)"
color: "var(--bg-elevated)"
border: 0
padding: "10px 18px"
borderRadius: 999
fontSize: 13
fontWeight: 500
```

### Ghost Button

```jsx
background: "transparent"
border: "1px solid var(--line-strong)"
color: "var(--ink-2)"
padding: "8px 14px"
borderRadius: 999
fontSize: 12
```

### Status Update Buttons (Dict)

Use three inline buttons: "Mastered" (primary style), "Need review" (ghost), "Hide" (ghost).

### Exercise Feedback

- **Correct:** `--c-mint` background, `--c-mint-ink` text
- **Incorrect:** `--c-rose` background, `--c-rose-ink` text
- Answer blanks: dashed border when empty, solid border when filled, color changes on feedback

---

## Data Conventions

### Word Status

Words always have one of three statuses: `new`, `learning`, `mastered`.

### CEFR Levels

`A1 → A2 → B1 → B2 → C1 → C2`. Current level shown with progress bar underneath.

### Homework Status

`pending`, `in-progress`, `done`.

### Material Types

`PDF`, `Audio`, `Link`.

---

## Layout Rules

1. **Never use raw hex colors** — always reference design tokens.
2. **Never hardcode spacing** that should scale with density — use `--d-gap`, `--d-card-pad`, `--d-pad`.
3. **Section dividers** use `borderTop: "0.5px solid var(--line)"`.
4. **Card borders** use `border: "0.5px solid var(--line)"`.
5. **Sidebar and right rail** background is `--bg-window`, not `--bg-elevated`.
6. **Main content area** background is `--bg-window`.
7. **Panel/card interiors** use `--bg-elevated`.
8. **Elevated elements within a card** use `--bg-sunken` (e.g. icon container).

---

## Accessibility

- All icon-only buttons must have `aria-label`.
- Status indicators use both color and text (never color alone).
- Font smoothing: `antialiased` on `body`.
- Scrollbars are styled subtly but visible when needed.

---

## Do Nots

- Do not use shadows for elevation — use background layering (`--bg-app` → `--bg-window` → `--bg-elevated`).
- Do not use bold in display font — use italic for emphasis.
- Do not use more than one primary action button per card or section.
- Do not add new icon paths — use the existing `Icon` component's name set.
- Do not change font sizes below 10px (use `--font-mono` at 10–11px for the smallest labels).
- Do not use arbitrary colors — only tokens from `tokens.css`.
