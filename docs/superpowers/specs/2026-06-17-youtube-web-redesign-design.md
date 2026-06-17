# Clipline Cloud — YouTube-style Web Redesign (Design Spec)

**Date:** 2026-06-17
**Status:** Approved (pending implementation plan)
**Scope:** Full visual + IA overhaul of `apps/clipline-cloud-web`, plus one small backend
addition in `apps/clipline-cloud-server` (public clip markers).

---

## 1. Goal

The web frontend currently works well but reads like an internal SaaS/admin dashboard
(light sage-green theme, dark sidebar + topbar, a file-manager–style list of clip rows).
We are overhauling it to **feel like YouTube** — a thumbnail-forward video site — while wearing
**Clipline's own brand identity** (dark blue-slate, cobalt-blue accent) so the cloud web UI is
consistent with the Clipline desktop app.

This is a **full YouTube feel**: reskin *and* information-architecture restructure (search-centric
header, collapsible guide rail, filter chips, responsive card grid, dedicated watch page, an
"up next" rail, studio-style admin).

### Non-goals

- No framework migration. Stay on the dependency-free vanilla JS + CSS + Node build setup.
  (Revisit only if vanilla becomes genuinely painful — flag to the user if so.)
- No light mode. **Dark-only.**
- No new build tooling/bundler. Native ES modules served as static files.
- No backend changes beyond exposing markers on the public clip endpoint.
- No client-side thumbnail generation. Use designed placeholders that swap to real images later.
- No "browse everyone's clips" surface (the §22/Appendix A privacy boundary stays intact).

---

## 2. Decisions (locked)

| Decision | Choice |
| --- | --- |
| Transformation depth | Full YouTube feel (reskin + IA restructure) |
| Tech stack | Vanilla JS, zero deps; modularize into native ES modules. Framework is an escape hatch only. |
| Theme | Dark-only |
| Brand/accent | Clipline blue-slate identity (cobalt accent), **not** YouTube red, **not** the current sage-green |
| Thumbnails | Designed deterministic placeholders now; real `<img>` swaps in when Phase-2 thumbnails land |
| Public page | Full watch experience **including markers** (requires a small backend change) |
| Admin | Same tabs/functionality, restyled as a dark "Studio" dashboard |

---

## 3. Brand reference (from the Clipline desktop app)

Pulled from the Clipline app screenshot:

- **Dark blue-tinted slate** surfaces (not gray, not pure black), with subtle elevation steps.
- **Cobalt/royal blue accent** (~`#2563EB`) — primary buttons ("Save Replay"/"Clip"),
  selected-item border, logo.
- **Cyan/teal** for stats/highlights, used sparingly.
- **Red** for destructive/recording; **gold** for objective markers.
- Blue quill/needle logo mark + "Clipline" wordmark, clean sans-serif, ~8px rounded corners.

---

## 4. Design language & tokens

A single set of CSS custom properties (dark-only) drives everything.

### Color
- `--bg #0f131b` (app base)
- `--surface #161b26` (cards, header, rail)
- `--surface-2 #1d2330` (hover / inputs)
- `--surface-3 #262d3d` (active / pressed)
- `--border rgba(255,255,255,.08)` — YouTube-flat; separation via borders + surface steps, not heavy shadows
- `--text #e8edf4` / `--text-muted #9aa6b8` / `--text-faint #6b7589`
- `--accent #2f6fed` / `--accent-hover #3b7bf5` — primary buttons, active nav, focus rings, brand mark
- `--cyan #4fd1c5` (stats, sparing) / `--danger #e5484d` (destructive/recording) / `--gold #d9a93f` (objective markers)
- Visibility semantics: **private** = neutral slate + lock; **public** = green-tinted + globe; **unlisted** = blue + link

> Exact hex values may be nudged ±a few points during implementation for contrast/AA; the
> relationships above are the contract.

### Typography
- System stack (`system-ui, Inter, "Segoe UI", …`); YouTube-ish hierarchy:
  card title 14/600, section head 16, page title 20, muted meta 13.
- Optional self-hosted Roboto later (must be self-hosted — CSP blocks CDN fonts). Not needed now.

### Geometry
- 4px spacing scale; radius: thumbnails/cards **12px**, buttons **8px**, chips/pills **999px**.
- Transitions ~120ms. Respect `prefers-reduced-motion`.

---

## 5. App shell & navigation

Replaces the "dark sidebar + topbar" shell with YouTube's three-zone layout.

### Top header (sticky, ~56px, full width)
- **Left:** hamburger (toggles guide rail) + Clipline quill mark & wordmark → links home.
- **Center:** rounded **search pill** + search button → filters the library by title/game
  (wires to the existing `q` param). Collapses to an icon on narrow screens.
- **Right:** Admin/Studio link (admin only); **account button** (circular avatar w/ user initial)
  opening a small menu → username · role · Sign out.

### Left guide rail (two states, like YouTube)
- **Expanded** (~240px, icon + label) and **mini** (~72px, icons), toggled by the hamburger.
- On narrow screens (< ~1000px) it becomes an **overlay drawer**.
- Items double as **visibility quick-filters** so the rail has real purpose:
  **Home** (all ready clips) · **Public** · **Unlisted** · **Private** — each sets the library's
  visibility filter. Divider → **Admin** (admin only). Faint footer with server version.

### Content zone
- Right of the rail, scrolls under the sticky header.
- On the watch page the rail auto-collapses to mini (YouTube behavior).

---

## 6. Home / Library (card grid)

The row list becomes a YouTube-style grid.

### Chip bar (sticky under header, horizontally scrollable)
- An **All** chip + one chip per game present in the loaded clips (derived client-side).
- Right side: a **Filters / Sort** button opening a small panel with the remaining current
  controls — **sort**, **status**, **date range**. (Visibility lives in the rail.)
- Net: every existing filter capability is preserved; the chip row stays YouTube-clean.

### Responsive card grid (auto-fill, cards ~300px min, 16px gaps)
Each card:
- **16:9 thumbnail**, 12px radius. Overlays: **duration** pill (bottom-right), **visibility**
  badge (top-left). Hover = subtle lift + play affordance.
  - **Placeholder:** deterministic gradient seeded from title+game, with a faint game label /
    play glyph. A real `<img src=…/thumbnail>` swaps in automatically when Phase-2 thumbnails
    exist; `onerror` falls back to the placeholder.
- **Below:** title (2-line clamp, 14/600); muted meta line — game · relative recorded date
  ("3 days ago") · file size.
- **⋮ kebab menu** (top-right of card text): Copy link · Make public/private · Delete
  (the row's old actions, YouTube-ified). Clicking the card opens the watch page.

### Non-ready clips
Processing/uploading/failed clips show a **status overlay** on the thumb instead of a duration
pill (spinner for processing, red for failed). Default view = ready (matches current behavior).

### States
- **Loading:** shimmer skeleton cards.
- **Empty:** friendly empty state.
- **Error:** inline error box.

---

## 7. Watch page

### Layout
- **Two columns** on desktop: main player+info (`1fr`) + right **"Up next" rail** (~400px).
- Single column under ~1000px (up-next drops below). Guide rail auto-collapses to mini here.

### Player
- HTML5 `<video>` with **native controls** (reliable; existing range-seek preserved), in a
  rounded black frame. *(A fully custom scrubber with inline chapter ticks is a possible later
  enhancement — not in scope; native controls + the marker bar below cover it reliably.)*

### Marker timeline (standout feature)
- A dedicated tick bar directly **below** the player. Ticks colored by `marker.kind` via a small
  best-effort kind→color map (gold = objectives, red = kills, etc.); unknown/other kinds fall back
  to the accent blue. Positioned by `timestamp_ms` over `duration_ms`.
- Click a tick **or** a marker-list row → seeks the video (`video.currentTime`).
- Hover → tooltip (label + time). This is the "chapters" analog and showcases the League markers.

### Title + action row
- Title (20px); YouTube-style pill button cluster — **Share** (copy link / publish),
  **Visibility** toggle, **Edit**, **Delete** — with recorded/uploaded/duration/size meta.

### Details card (collapsible, YouTube "description"-style)
- Technical metadata grid (dimensions, fps, codecs, container, checksum) + full markers list.
- **Edit** reveals the inline metadata form (title / game_name / game_id / duration_ms →
  existing `PATCH /api/v1/clips/{id}`).

### Up-next rail
- The user's **other clips** as compact rows (small 16:9 thumb + title + meta), same-game first
  then most recent, each linking to its watch page. Reuses the clips list API
  (`GET /api/v1/clips`), excluding the current clip.

---

## 8. Public share page (full experience + markers)

A full-width dark watch page for anonymous viewers — no guide rail, no account chrome.

- Slim top bar: just the Clipline mark + wordmark.
- Centered (~1100px max): the player (using `thumbnail_url` as poster when present), title, game,
  recorded/uploaded/duration meta.
- **Marker timeline** (same component as the logged-in watch page), fed by the new public markers
  field. Click-to-seek works for anonymous viewers.
- Existing **copy notice** kept as a subtle footer line.
- Clean "this link is no longer active" state with the logo (preserves current behavior).
- No actions, no up-next (there is no public catalog and the public API exposes no listing).

---

## 9. Admin (Studio style)

Same chrome (header + rail), restyled as a dark Studio-like dashboard. **All functionality
preserved.** Current **Overview / Users / Jobs** tabs become underlined tabs.

- **Overview:** server/config data → a row of **metric cards** (version, API, storage, upload
  limits, public-media mode, TTLs…) + a config details panel.
- **Users:** a "Create user" panel + a clean dark table (avatar initial, username, role chip,
  status chip, last login, Reset / Disable actions). Reset token surfaces in a highlighted
  callout. Re-auth prompts unchanged.
- **Jobs:** failed uploads (with progress meters), dead jobs, recent errors → grouped dark cards;
  error text in code-style blocks.
- **Privacy boundary holds** — no cross-user clip browsing anywhere.

---

## 10. Login

Centered card on the blue-slate background: Clipline mark + wordmark, username/password, a blue
primary **Sign in**, clear error box. Same cookie-session + CSRF flow underneath — purely a
restyle to match the brand.

---

## 11. Code architecture (frontend)

`apps/clipline-cloud-web/src/`, native ESM, no bundler. The build (`scripts/build.mjs`) copies
`src → dist` recursively; `check-dist.mjs` enforces a byte-for-byte match, so **rebuild after every
src edit**. The server serves `dist` via `ServeDir` (fallback), with explicit SPA routes for `/`,
`/login`, `/admin`, `/clip/*`, `/c/*` — so `/js/*.js` and `/css/*.css` resolve as static assets.

```
src/
  index.html          # boots /js/app.js (module); links css files in order
  css/
    tokens.css         # variables
    base.css           # reset, typography, buttons, form controls
    layout.css         # shell, header, rail, grids, watch layout
    components.css      # cards, chips, badges, kebab menu, skeletons, marker bar, tables
  js/
    app.js             # entry: boot, global listeners, kick off router
    state.js           # shared app state (user, csrf, ui flags, library query)
    api.js             # api(), refreshSession(), logout()
    router.js          # route(), currentRoute(), navigate()
    util.js            # escapeHtml/escapeAttr, format date/duration/bytes, icon(), copyText, dom helpers
    shell.js           # header + guide rail + account menu
    views/
      login.js
      library.js
      watch.js
      public.js
      admin.js
    components/
      card.js          # library grid card + up-next compact card
      marker-timeline.js  # shared tick bar + click-to-seek (watch + public)
```

> Pragmatic split — shared/reused pieces (`card`, `marker-timeline`) are extracted; view-local
> bits stay in their view module. Avoid over-fragmentation.

### Data flow — unchanged
- Same endpoints, same cookie-session + CSRF, same `api()` layer.
- `state` gains only UI bits: rail collapsed/open, active chip, filter-panel open.
- Router maps `path → view module`; views fetch via `api()` and render.

### CSP compatibility (verified, no changes needed)
Global `secure_headers` CSP:
`script-src 'self'` (ESM modules OK), `style-src 'self' 'unsafe-inline'` (inline gradient/tick
styles OK), `img-src 'self' data: blob:` (data-URI placeholders + real thumbnails OK),
`media-src 'self' blob:`, `connect-src 'self'`. Web fonts must be self-hosted (no CDN).

---

## 12. Backend change (the only Rust edit)

**File:** `apps/clipline-cloud-server/src/media.rs`

- Extend the local `PublicClipResponse` struct with `markers: Vec<PublicMarker>`, where
  `PublicMarker = { kind: String, label: Option<String>, timestamp_ms: i64 }` — a **minimal public
  shape** (no internal ids, no metadata blob) to avoid leaking internal detail.
- In `get_public_clip`, after `load_public_clip`, load markers via
  `state.repositories.clip_markers.list_for_clip(&clip.id)` and map into `PublicMarker`
  (mirrors the owner path in `clips.rs::detail_response`).
- No new endpoints, no DB schema/migration changes.
- Frontend `public.js` reads the new `markers` field to render the shared marker timeline.

---

## 13. Cross-cutting concerns

### States & error handling
- Shimmer skeletons (grid + watch) replace "Loading…" text.
- Inline error boxes preserved (existing flash pattern).
- Friendly empty states per view.
- 401 → redirect to login (existing `refreshSession` logic).
- Thumbnail `onerror` → gradient placeholder.

### Responsive
- Header search collapses to an icon on mobile.
- Guide rail → overlay drawer under ~1000px.
- Grid flows 1 → N columns.
- Watch page → single column (up-next below) on narrow.

### Accessibility
- aria-labeled icon buttons (already present), accent `:focus-visible` rings.
- Keyboard navigation for the account menu, kebab menus, and chips.
- `prefers-reduced-motion` disables hover-lift + shimmer.
- Maintain semantic landmarks (`header`, `nav`, `main`, `aside`).

---

## 14. Verification

- **Frontend:** `npm run build` (regenerate `dist`), `node scripts/check-dist.mjs` (byte-match),
  `node --check` per JS module.
- **Backend:** `cargo fmt --all --check`, `cargo test --workspace`, `cargo build --workspace`.
- **Smoke:** update the existing public-route HTTP smoke to expect the new `markers` field.
- **Manual:** run the server and show the running pages between milestones; optionally drive
  Playwright to screenshot grid / watch / public / admin / login.
- **Docs:** update `docs/09-web-frontend.md` progress log; note the public-markers field in
  `docs/08-media-serving-and-public-sharing.md`.

---

## 15. Milestones (show the running page between each)

1. Tokens + shell (header, guide rail) + login restyle.
2. Library grid + chips + cards + designed placeholders.
3. Watch page + marker timeline + up-next rail.
4. Public page + backend markers change.
5. Admin Studio restyle.
6. Responsive + accessibility + polish + full verification.
