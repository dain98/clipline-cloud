# Clipline Cloud Web UI Redesign — Design Spec

**Status:** approved (brainstormed with visual mockups, 2026-07-03)
**Scope:** frontend only — `apps/clipline-cloud-web`. No backend/API changes.
**Direction:** "Broadcast" — editorial studio-dark structure with Clipline's navy/blue palette, plus live hover previews.

## 1. Goals

Replace the current generic dark UI (blue-on-slate, "CL" box logo, row-list library under a
permanently open 13-field filter panel, settings-form clip page) with a distinctive,
media-first identity while keeping Clipline's existing color aesthetic and the
single-image/static-asset deployment story.

Non-goals: new backend features, new API endpoints, social features, light theme.

## 2. Design system

### Palette (derived from the Clipline app icon)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0d1320` | page background |
| `--surface` | `#141c2e` | cards, inputs, popovers |
| `--surface-raised` | `#172236` | floating bars, menus |
| `--line` | `#1e2942` | hairline borders/dividers |
| `--line-strong` | `#2c3a5e` | interactive borders |
| `--ink` | `#eef4ff` | primary text |
| `--muted` | `#8d9bb5` | secondary text |
| `--faint` | `#67758f` | placeholders, tertiary |
| `--accent` | `#3b82f6` | actions, focus, active nav |
| `--highlight` | `#8bbcff` | brand accents, links, meters |
| `--success` | `#5ee0a0` | unlisted badge, healthy states |
| `--danger` | `#ff6b7a` | destructive |

Existing `--danger`/`--warning` semantics carry over. All colors live in one
`tokens.css`; no hex values outside it.

### Typography

- **Space Grotesk** (self-hosted woff2, bundled in `dist/fonts/` — no Google Fonts
  request at runtime; self-hosted instances must not phone home) for everything;
  falls back to Inter/system-ui.
- Wordmark: `CLIP` + `LINE` with the second half in `--highlight`; the real icon SVG
  replaces the "CL" box everywhere.
- Scale: 22px page titles / 19px watch title / 13.5px body / 11.5px meta,
  uppercase letter-spaced kickers (11px, `.18em`) for section labels like "Up next".

### Core components

Buttons (primary/secondary/danger), segmented control, chip (filter pill), badge
(visibility: Public = highlight fill, Private = dark outline, Unlisted = success
outline), card, popover, floating action bar, bottom sheet (mobile), toast with
undo action, confirm dialog.

## 3. Navigation & information architecture

- **Top bar everywhere** (replaces the sidebar): wordmark · Feed · Library · Games ·
  Admin (admin only) · centered search · avatar → profile/account menu, sign out.
- Route map is unchanged (`/`, `/library`, `/clip/:id`, `/c/:shareId`, `/game/:name`,
  `/u/:username`, `/admin`, `/profile`, `/account`, `/login`, `/reset-password`, `/about`).
  "Games" links to a game index built from the existing `/api/v1/public/games`.
- The "Recommended" sidebar rail moves into page content (watch page "Up next");
  no persistent left rail anywhere.
- **Mobile (<720px):** bottom tab bar — Feed · Library · Search · Profile. Search tab
  opens the search screen; filters open as bottom sheets. Admin reachable from the
  profile menu.

## 4. Screens

### 4.1 Feed (`/`)

- Kicker "Now playing on this server" + **hero spotlight**: latest/most-viewed public
  clip large (16:8.4 crop) with title overlay, three compact "side" rows next to it.
- "Latest uploads" card grid below (4-col desktop, 2-col tablet, 1-col mobile).
- Inline toolbar: sort select, game chips (from `/api/v1/public/games`), clip count.
- Card = thumbnail (16:9, rounded 8px), duration pill, title, `game · author · views · age`
  with game name in `--highlight`.
- **Live hover preview**: after 300ms hover, the card swaps thumbnail for a muted
  looping `<video preload="none">` of the clip with a thin scrub-progress bar.
  Desktop/pointer devices only; skipped when `prefers-reduced-motion` or Save-Data.

### 4.2 Library (`/library`)

- Header: `Library · N clips · X GiB used`, Grid/Rows view toggle (persisted in
  localStorage).
- Toolbar: title search, sort select, **Filters button opening a popover** containing
  the remaining fields (visibility, status, source, date range, duration, size) with
  an active-filter count badge; game chips inline.
- **Grid view (default):** same card as the feed + visibility badge (top-left) and a
  selection checkbox that appears on hover (always visible once ≥1 selected).
- **Rows view:** compact table for power sorting (thumb, title, game, visibility,
  size, duration, uploaded) — kept because bulk triage by size/date is a real
  self-hosting workflow.
- Selecting any clip raises a **floating bulk bar** (bottom center): `N selected ·
  Make public · Make private · Copy links · Delete · ✕`. Replaces the permanent
  bulk toolbar. Delete confirms; visibility applies optimistically with an undo toast.
- Live hover preview applies here too.

### 4.3 Watch page (`/clip/:id` and `/c/:shareId`)

One layout for owner and visitor; ownership adds controls.

- **Player** (new chrome, replaces `<select>`-based controls): scrubber with buffered
  region + hover time tooltip, play/skip, time, speed menu, volume slider, captions
  toggle (kept), fullscreen, **theater mode** (F or player click-zone) that expands
  edge-to-edge and fades chrome. Keyboard: space/K play, ←/→ ±5s, J/L ±10s, M mute,
  F theater, Esc exit. `player-core.js` logic is retained/wrapped; only the chrome
  is rebuilt.
- Title + meta line (`game chip · views · recorded · author`).
- **Owner action row** (single row between hairlines): visibility **segmented control**
  (Private/Public/Unlisted, one-click apply + undo toast; copy-link enabled when a
  share link exists), primary "Copy share link", overflow `⋯` menu (Delete with
  confirm — the current "danger zone"). No download button: matches the existing
  inline-only media decision. Marker prev/next stays in the player chrome as today.
- Inline editing: pencil affordance on title and description (owner only) — replaces
  the textarea + "Save description" block.
- **Details strip**: one line (`0:58 length · 324 MiB · 1080p60 · h264/aac mp4`)
  expanding to the full metadata table (recorded/uploaded/checksum/container/…).
- Comments below (existing create/delete semantics, restyled).
- Right rail: "Up next" list (public clips), replacing the sidebar Recommended rail.
- Visitor view (`/c/:shareId`, logged out): same minus owner row/editing; top bar
  shows "Sign in".

### 4.4 Games (`/game/:name` + Games nav)

- Games index: grid of game tiles (latest clip thumbnail, name, clip count) from
  `/api/v1/public/games`.
- Game page: same feed grid filtered to the game (existing route/behavior).

### 4.5 Login / reset / invite

- Split layout: left half is a montage of up to ~6 of this server's public clip
  thumbnails under a navy/blue gradient wash with "Your clips. Your server." and
  `N clips · M players on this instance` (from the public clips API; falls back to
  pure brand gradient when the instance has no public clips or the fetch fails).
- Right half: icon mark + wordmark, username/password, sign-in button,
  "Accounts are created by this server's admin" hint. Reset/invite pages reuse the
  same shell.

### 4.6 Admin (`/admin`)

- Same tabs: Overview / Users / Settings / Jobs (underline-style tabs).
- Overview leads with **stat cards**: Clips (+N this week), Storage (with usage meter
  vs. warning threshold when configured), Users, Jobs health; the full config
  key-value list moves below into a two-column layout.
- Users / Settings / Jobs keep their current structure, restyled with the design
  system (tables, forms, buttons).

### 4.7 Profile & account

Restyled in the design system, structure unchanged (avatar/bio editing, sessions,
device tokens, password). Public user page (`/u/:username`) gets the feed card grid.

## 5. Architecture

### Stack

- **Preact + htm** (tagged templates — no JSX, no transpile) as UI runtime;
  vendored/pinned via npm, bundled with **esbuild** in `scripts/build.mjs`
  (replaces the copy-only build; output stays plain static files in `dist/`,
  served by the same axum `ServeDir`). `check-dist.mjs` keeps verifying dist is
  in sync.
- App state: Preact hooks + small module-level stores (auth/session, toasts,
  selection); no external state library.
- Router: keep the existing tiny history-based router, adapted to render page
  components; route table unchanged.

### Source layout (`apps/clipline-cloud-web/src`)

```
src/
  main.js            entry: router + shell mount
  router.js
  api.js             fetch wrapper (CSRF, errors) — extracted from app.js
  tokens.css         design tokens only
  styles.css         base/reset + shared layout
  components/        TopBar, TabBar, ClipCard, HoverPreview, Chip, Badge,
                     SegmentedControl, Popover, BulkBar, Toast, ConfirmDialog,
                     Player (wraps player-core.js), BottomSheet, StatCard, …
  pages/             feed.js, library.js, watch.js, games.js, login.js,
                     admin/*.js, profile.js, account.js, user.js, about.js
  player-core.js     kept
```

### Behaviors & quality bars

- **Optimistic updates + undo toasts** for visibility changes (single and bulk);
  errors roll back with a toast.
- **Empty states** designed for every list (fresh install feed, empty library with
  "connect the desktop app" pointer, no public clips, no comments).
- **Loading**: skeleton cards for grids, spinner-free where possible.
- **A11y**: visible focus rings (`--accent`), full keyboard operability (popover,
  bulk bar, segmented control, player), `aria-label`s preserved from current code,
  `prefers-reduced-motion` disables hover previews and transitions.
- **Performance**: thumbnails `loading="lazy"`; hover preview videos `preload="none"`,
  created on hover and torn down on leave, max one active at a time.
- CSP: current strict CSP must keep passing — no inline styles/scripts beyond what
  the CSP already allows; fonts self-hosted.

## 6. Error handling

- `api.js` centralizes error mapping: 401 → redirect to login (preserving return
  path), 403 CSRF → session-expired toast + re-auth, 409/422 → inline field errors,
  network/5xx → retryable toast. Route-level errors render an in-shell error state
  (not a blank page), matching current SPA fallback behavior.

## 7. Testing & verification

- `node scripts/build.mjs && node scripts/check-dist.mjs` in CI (as today).
- Manual verification loop (documented in the plan): run the debug server with the
  seeded preview database (`/tmp/clipline-seed/seed.py`), walk every route at
  1440px and 390px with Playwright, screenshot-compare against the approved mockups.
- Keyboard walkthrough: tab order on library (select → bulk bar), watch page
  shortcuts, popover focus trap.
- Cross-check both auth states (owner vs. logged-out visitor) on the watch page,
  and admin vs. non-admin nav.

## 8. Implementation order (for the plan)

1. Foundation: tokens.css, esbuild build, Preact+htm shell, top bar/tab bar, router
   integration — old pages still render inside the new shell where untouched.
2. Card + feed page (hero, grid, chips, hover preview).
3. Library (grid/rows, filter popover, selection + bulk bar).
4. Watch page (player chrome, action row, inline edit, details strip, comments,
   up-next, theater mode).
5. Login/reset/invite, Games index.
6. Admin, profile/account, public user pages.
7. Empty states, a11y & reduced-motion pass, mobile polish, screenshot verification.

Each step ships a working UI (the redesign can land as one PR or stacked PRs, but
the app must be usable at every step boundary).

## 9. Decisions log

- Direction: **A "Broadcast"** structure/typography; user explicitly kept
  **Clipline's navy/blue palette** (icon colors `#0f1724`/`#172236`/`#3b82f6`/`#8bbcff`).
- **Live hover preview** adopted from direction B; "Theater" survives only as the
  watch-page theater mode.
- Library: all four moves approved (cards default + rows toggle, filter popover,
  hover-select + floating bulk bar, live previews).
- Watch page: merged owner/visitor layout, segmented visibility, collapsed details,
  theater mode — approved.
- Mobile bottom tabs, login montage split, admin stat cards — approved.
- Stack: **Preact + htm + esbuild** (user chose over Svelte+Vite and vanilla
  restructure); deployment model unchanged.
- Dark theme only (matches product identity; light theme out of scope).
