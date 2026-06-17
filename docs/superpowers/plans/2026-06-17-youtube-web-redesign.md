# Clipline Cloud — YouTube-style Web Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul `apps/clipline-cloud-web` to feel like YouTube (dark-only, Clipline blue-slate brand, search header + guide rail + filter chips + card grid + watch page with marker chapters + up-next rail + studio-style admin), plus two small additive backend fields.

**Architecture:** Keep the dependency-free vanilla JS + CSS + Node-copy build. Split the current single `app.js` into native ES modules (no bundler — `index.html` uses `<script type="module">`, server serves `dist` via `ServeDir`). Behaviour-preserving module split first, then restyle/restructure one view at a time so the app is runnable after every task. Two additive Rust response fields (`markers` on the public clip endpoint, `has_thumbnail` on clip responses) unblock the public watch experience and precise thumbnail gating.

**Tech Stack:** Vanilla JS (ES modules), plain CSS (custom properties), Node build script (`scripts/build.mjs` copy + `scripts/check-dist.mjs` byte-match), Rust/Axum backend (`apps/clipline-cloud-server`), `cargo test` unit tests.

**Reference spec:** `docs/superpowers/specs/2026-06-17-youtube-web-redesign-design.md` (read it before starting).

## Global Constraints

- **Zero new runtime/build dependencies.** No framework, no bundler, no JS test runner, no CDN assets (CSP `default-src 'self'` blocks them; any web font must be self-hosted).
- **Dark-only.** No light theme, no theme toggle.
- **Brand = Clipline blue-slate**, not YouTube red, not the old sage-green. Accent `#2f6fed`.
- **Build invariant:** `dist/` must byte-match `src/`. After ANY `src` edit run `npm run build`, then `node scripts/check-dist.mjs` must pass. Never hand-edit `dist/`.
- **Module loading:** `index.html` loads `/js/app.js` as `type="module"`; all imports are root-absolute (e.g. `import { api } from "/js/api.js"`) or relative — they resolve through `ServeDir` over `dist`. CSS is linked via multiple `<link>` tags in order.
- **Auth/CSRF unchanged:** every state-changing request sends `X-CSRF-Token`; `credentials: "same-origin"`. Preserve the existing `api()` behaviour exactly.
- **Privacy boundary:** no UI path lists another user's clips. No "browse all clips" admin screen.
- **Escaping:** all interpolated user data goes through `escapeHtml`/`escapeAttr`. No raw template interpolation of clip titles, usernames, errors, etc.
- **Verification model (frontend):** there is no JS unit-test framework (zero-dep constraint). Each frontend task verifies with: `npm run build` → `node scripts/check-dist.mjs` → `node --check` on every changed `.js` module → run the server and confirm the behaviour described in the task's "Manual verification". Rust tasks use real `cargo test` TDD.
- **Backend changes are additive only:** new response fields, no new endpoints, no DB schema/migrations, no changes to existing field names/types.

## How to run the app for manual verification

```bash
# Build the frontend into dist/
cd apps/clipline-cloud-web && npm run build && node scripts/check-dist.mjs && cd -
# Build + run the server (serves dist/ at the configured static_dir; see docs/01).
cargo run -p clipline-cloud-server
# Then open the printed URL. Use an admin account created at first-run (docs/04).
```

Each frontend task lists the exact route(s) and what to look for. Screenshots via Playwright MCP are optional but encouraged at milestone ends (driver: `browser_navigate` + `browser_take_screenshot`).

---

## File Structure

`apps/clipline-cloud-web/src/`:

```
index.html               # MODIFY: link css/*.css in order; load /js/app.js (module)
css/
  tokens.css             # CREATE: :root custom properties (color/space/radius/type)
  base.css               # CREATE: reset, typography, buttons, form controls, helpers
  layout.css             # CREATE: app shell (header, rail, content), grids, watch layout, responsive
  components.css         # CREATE: cards, chips, badges, kebab menu, account menu, skeletons, marker bar, tables, dialogs
js/
  app.js                 # REWRITE (entry): boot, global listeners, start router
  state.js               # CREATE: shared mutable state object + small setters
  api.js                 # CREATE: api(), refreshSession(), logout() (ported verbatim from app.js)
  router.js              # CREATE: route(), currentRoute(), navigate() (ported, dispatches to view modules)
  util.js                # CREATE: escapeHtml/escapeAttr, format date/duration/bytes/relative, icon(), copyText, dom helpers, flash
  shell.js               # CREATE: renderShell() — header + guide rail + account menu + content slot
  views/
    login.js             # CREATE: renderLogin()
    library.js           # CREATE: renderLibrary() — chip bar + grid + filters panel
    watch.js             # CREATE: renderClipDetail() — player + marker timeline + actions + details + up-next
    public.js            # CREATE: renderPublicShare()
    admin.js             # CREATE: renderAdmin() — overview/users/jobs
  components/
    card.js              # CREATE: clipCard() (grid) + upNextCard() (compact) + gradient placeholder
    marker_timeline.js   # CREATE: markerTimeline() — a11y tick buttons + seek wiring
styles.css               # DELETE at end (replaced by css/*.css)
app.js                   # DELETE at end (replaced by js/app.js)
```

`apps/clipline-cloud-server/src/`:

```
media.rs                 # MODIFY: PublicClipResponse += markers + has_thumbnail; map in get_public_clip
clips.rs                 # MODIFY: set has_thumbnail in clip_summary_response/clip_detail_response
```

`crates/clipline-cloud-api-types/src/lib.rs`:

```
                         # MODIFY: ClipSummaryResponse += has_thumbnail; ClipDetailResponse += has_thumbnail
```

Docs: `docs/09-web-frontend.md` (progress log), `docs/08-media-serving-and-public-sharing.md` (public response fields).

---

## Module contracts (shared interfaces — every view depends on these)

These are produced by Phase 1 Task 1 and consumed everywhere. Implement exactly these signatures.

**`state.js`**
```js
export const state = {
  user: null,            // { id, username, display_name, role }
  csrfToken: null,
  flash: null,           // { message, type } | null  (type: "notice" | "error")
  ui: {
    railOpen: true,      // guide rail expanded vs mini (desktop) / drawer open (mobile)
  },
  libraryQuery: {        // unchanged shape from current app
    sort: "uploaded_at_desc", game: "", visibility: "", status: "", q: "", from: "", to: "",
  },
  adminResetToken: null,
};
```

**`api.js`** (ported verbatim from current `app.js`)
```js
export async function api(path, options = {}) { /* identical to current implementation */ }
export async function refreshSession() { /* sets state.user/csrfToken; returns boolean */ }
export async function logout() { /* POST logout; clears state; navigate("/login") */ }
```

**`router.js`**
```js
export function currentRoute() { /* identical parsing: public/clip/admin/login/library */ }
export function navigate(path) { window.history.pushState({}, "", path); route(); }
export async function route() { /* identical dispatch, but calls view-module renderers */ }
```

**`util.js`**
```js
export function escapeHtml(v) {/*…*/}      export function escapeAttr(v) {/*…*/}
export function formatDate(v) {/*…*/}      export function formatDuration(ms) {/*…*/}
export function formatBytes(v) {/*…*/}     export function formatRelative(v) {/*…*/} // "3 days ago"
export function icon(name) {/*…*/}          export const icons = { /* extended set */ };
export async function copyText(v) {/*…*/}  export function flash(message, type = "notice") {/*…*/}
export function renderFlash() {/*…*/}       // consumes+clears state.flash → html string
export function nullableString(v) {/*…*/}  export function nullableNumber(v) {/*…*/}
```

**`shell.js`**
```js
// Renders header + guide rail + content. `active` ∈ {"library","public-filter:<vis>","admin"}.
export function renderShell({ active, body, onMount }) {/*…*/}
```

**`components/card.js`**
```js
export function clipCard(clip) {/* returns <article class="card"> html */}
export function upNextCard(clip) {/* returns compact row html */}
export function gradientFor(seed) {/* returns CSS gradient string, deterministic from seed */}
```

**`components/marker_timeline.js`**
```js
// markers: [{ kind, label, timestamp_ms }], durationMs: number.
export function markerTimelineHtml({ markers, durationMs }) {/* returns html with <button class="tick"> + list */}
export function bindMarkerTimeline(root, videoEl) {/* wires tick/list buttons → videoEl.currentTime */}
```

---

# PHASE 1 — Module scaffold, design tokens, shell, login

## Task 1: Behaviour-preserving ES module split

Split the working `app.js` into modules **without changing any behaviour or markup yet**. This de-risks everything after it: the app must look and behave identically when this task is done.

**Files:**
- Create: `src/js/state.js`, `src/js/api.js`, `src/js/router.js`, `src/js/util.js`
- Create: `src/js/shell.js` (move `renderShell`/`navLink` verbatim), `src/js/views/login.js`, `src/js/views/library.js`, `src/js/views/watch.js`, `src/js/views/public.js`, `src/js/views/admin.js` (move each existing `render*`/helpers verbatim)
- Rewrite: `src/js/app.js` (entry — imports + global listeners + initial `route()`)
- Modify: `src/index.html` (point script at `/js/app.js`)
- Delete (at this task's end): `src/app.js`

**Interfaces:**
- Produces: the full module contract above (verbatim ports — same function bodies, now `export`ed and importing their deps).

- [ ] **Step 1: Create `state.js`, `api.js`, `util.js`** by cutting the corresponding code out of `app.js` verbatim and adding `export`. `state` moves to `state.js`; `api/refreshSession/logout` to `api.js` (import `state` + `navigate`); all formatters/escapers/`icon`/`icons`/`copyText`/`flash`/`renderFlash`/`nullable*` to `util.js`.

- [ ] **Step 2: Create `router.js`** with `route`/`currentRoute`/`navigate` ported verbatim; it imports each view renderer from `./views/*` and `refreshSession` from `./api.js`.

- [ ] **Step 3: Create `shell.js` + `views/*.js`** by moving each `render*` function and its private helpers verbatim, adding imports for `state`, `api`, `util`, `navigate`. (`shell.js` ← `renderShell`,`navLink`; `views/library.js` ← `renderLibrary`,`libraryParams`,`libraryView`,`clipRow`,`bindLibraryEvents`,`field`,`selectField`,`visibilityBadge`; `views/watch.js` ← `renderClipDetail`,`clipDetailView`,`bindClipDetailEvents`,`markerTimeline`,`markerItem`,`dataRow`; `views/public.js` ← `renderPublicShare`,`safeMediaUrl`; `views/admin.js` ← all `renderAdmin`/`admin*`/`userRow`/`uploadItem`/`jobItem`/`recoveryActionLabel`/`bindAdminEvents`.)

- [ ] **Step 4: Rewrite `app.js` (entry)**:
```js
import { route } from "/js/router.js";
import { onDocumentClick } from "/js/util.js"; // move the existing onDocumentClick here or keep in router
window.addEventListener("popstate", route);
document.addEventListener("click", onDocumentClick);
route();
```
(Place `onDocumentClick` wherever its deps are cleanest — `router.js` is fine since it calls `navigate`; export and import accordingly.)

- [ ] **Step 5: Update `index.html`** — change `<script type="module" src="/app.js">` to `src="/js/app.js"`. Leave the `styles.css` link unchanged for now.

- [ ] **Step 6: Delete `src/app.js`.**

- [ ] **Step 7: Build + check + lint**
```bash
cd apps/clipline-cloud-web
npm run build && node scripts/check-dist.mjs
for f in src/js/app.js src/js/*.js src/js/views/*.js; do node --check "$f"; done
```
Expected: build prints nothing/0 exit, check-dist exits 0, every `node --check` exits 0.

- [ ] **Step 8: Manual verification** — run the server; confirm login, library list, sort/filter, clip detail playback + markers, visibility toggle, admin tabs, and a public `/c/...` link **all behave exactly as before** (identical markup/CSS). This task changes file layout only.

- [ ] **Step 9: Commit**
```bash
git add apps/clipline-cloud-web && git commit -m "refactor(web): split app.js into ES modules (no behaviour change)"
```

## Task 2: Design tokens + base CSS

Introduce the dark blue-slate token system and base element styling. Layout stays old; the app just turns dark and on-brand.

**Files:**
- Create: `src/css/tokens.css`, `src/css/base.css`
- Modify: `src/index.html` (link the two new files before `styles.css`)

- [ ] **Step 1: Create `css/tokens.css`** with the spec's tokens:
```css
:root {
  color-scheme: dark;
  --bg:#0f131b; --surface:#161b26; --surface-2:#1d2330; --surface-3:#262d3d;
  --border:rgba(255,255,255,.08); --border-strong:rgba(255,255,255,.14);
  --text:#e8edf4; --text-muted:#9aa6b8; --text-faint:#6b7589;
  --accent:#2f6fed; --accent-hover:#3b7bf5; --accent-contrast:#fff;
  --cyan:#4fd1c5; --danger:#e5484d; --danger-soft:rgba(229,72,77,.14);
  --gold:#d9a93f; --public:#4cb782; --public-soft:rgba(76,183,130,.16);
  --space-1:.25rem; --space-2:.5rem; --space-3:.75rem; --space-4:1rem; --space-6:1.5rem;
  --radius-card:12px; --radius-btn:8px; --radius-pill:999px;
  --header-h:56px; --rail-w:240px; --rail-mini-w:72px;
  --font: system-ui, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

- [ ] **Step 2: Create `css/base.css`** — reset (`*{box-sizing}`), `body{background:var(--bg);color:var(--text);font-family:var(--font);margin:0}`, link colors, `:focus-visible{outline:2px solid var(--accent);outline-offset:2px}`, button base (`.btn`, `.btn-primary` accent, `.btn-secondary` surface-2, `.btn-danger` danger-soft, `.btn-ghost`, `.icon-btn`), form controls (`input/select/textarea` on `--surface-2` with `--border`), `.muted`, `.mono`, and `@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}`. Port the existing button/field rules from `styles.css` but recolor with tokens.

- [ ] **Step 3: Update `index.html`** head:
```html
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/styles.css">
```
Also set `<meta name="color-scheme" content="dark">`.

- [ ] **Step 4: Build + check + lint** (`npm run build && node scripts/check-dist.mjs`).

- [ ] **Step 5: Manual verification** — every screen now renders dark with blue accents; old layout intact, text legible (AA), buttons recolored. No console errors.

- [ ] **Step 6: Commit** `style(web): add dark blue-slate design tokens + base styles`.

## Task 3: App shell (header + guide rail + account menu)

Replace the old sidebar/topbar shell with the YouTube three-zone layout.

**Files:**
- Rewrite: `src/js/shell.js`
- Create: `src/css/layout.css`; Modify: `src/index.html` (link it); Modify: `src/js/util.js` (extend `icons`)
- Modify: callers `renderLibrary`/`renderClipDetail`/`renderAdmin` to use the new `renderShell({ active, body, onMount })` signature.

**Interfaces:**
- Produces: `renderShell({ active, body, onMount })`. `active` selects the highlighted rail item. `onMount` (optional `() => void`) runs after innerHTML is set so views can bind events. Header search input name=`q` submits → sets `state.libraryQuery.q` and `navigate("/")`.

- [ ] **Step 1: Extend `icons` in `util.js`** — add: `menu` (`<path d="M4 6h16M4 12h16M4 18h16"/>`), `play` (`<path d="M6 4l14 8-14 8z"/>`), `home`, `share` (`<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/>`), `edit` (`<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>`), `eye`, `link`, `chevronDown`, `more` (`<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>`). Reuse existing `lock/globe/trash/copy/...`.

- [ ] **Step 2: Write `css/layout.css`** — the shell grid:
```
.app-shell{display:grid;grid-template-rows:var(--header-h) 1fr;min-height:100vh}
.app-header{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:var(--space-4);
  height:var(--header-h);padding:0 var(--space-4);background:var(--surface);border-bottom:1px solid var(--border)}
.app-body{display:grid;grid-template-columns:var(--rail-w) 1fr;min-height:0}
.app-body.rail-mini{grid-template-columns:var(--rail-mini-w) 1fr}
.guide-rail{background:var(--bg);border-right:1px solid var(--border);padding:var(--space-2);overflow-y:auto}
.rail-link{display:flex;align-items:center;gap:var(--space-3);padding:.5rem .75rem;border-radius:var(--radius-btn);color:var(--text-muted)}
.rail-link.active,.rail-link:hover{background:var(--surface-2);color:var(--text)}
.app-content{min-width:0;overflow-x:hidden;padding:var(--space-6)}
.search-pill{flex:1;max-width:560px;display:flex;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-pill)}
.search-pill input{flex:1;background:transparent;border:0;padding:.5rem .9rem;color:var(--text)}
```
Add the mini-rail rule (`.app-body.rail-mini .rail-link span{display:none}` etc.), the brand mark, and the account button. (Responsive drawer behaviour lands in Phase 6 — for now the rail is a static column.)

- [ ] **Step 3: Rewrite `shell.js`** — `renderShell` emits: `.app-header` (hamburger button `#rail-toggle` → toggles `state.ui.railOpen` and the `.rail-mini` class; brand mark+wordmark `data-route href="/"`; `.search-pill` form `#header-search` with input `name=q`; right cluster: Admin link if `state.user.role==="admin"`, account button `#account-btn` opening `#account-menu`). `.app-body` with `.guide-rail` (rail links: Home `/`, Public `/?vis=public`-style via `data-vis`, Unlisted, Private, divider, Admin, footer version) and `.app-content` containing `renderFlash() + body`. After setting innerHTML, bind: rail-toggle, header-search submit (`state.libraryQuery.q = value; navigate("/")`), account menu open/close + Sign out (`logout`), and call `onMount?.()`. Rail visibility links set `state.libraryQuery.visibility` then `navigate("/")`.

- [ ] **Step 4: Update view callers** to pass `body` + `onMount` to the new `renderShell` (replace the old `bind*` calls done after render with an `onMount` callback). Keep titles/subtitles out of the shell (the topbar is gone); views render their own page heading inside `body`.

- [ ] **Step 5: Link `layout.css`** in `index.html` after `base.css`.

- [ ] **Step 6: Build + check + lint.**

- [ ] **Step 7: Manual verification** — header shows brand + centered search + account button; rail lists Home/Public/Unlisted/Private (+ Admin for admins); hamburger toggles expanded↔mini; clicking a rail visibility item filters the library; typing in search + Enter filters by `q`; account menu opens and Sign out works; admin still reachable. No console errors.

- [ ] **Step 8: Commit** `feat(web): YouTube-style app shell (header, guide rail, account menu)`.

## Task 4: Login restyle

**Files:** Modify: `src/js/views/login.js`; add login styles to `css/layout.css` (or a `.auth-shell` block in `components.css`).

- [ ] **Step 1:** Rewrite `renderLogin(error)` markup: centered `.auth-shell` with a `.auth-card` (surface, border, radius-card) containing brand mark+wordmark, heading, the error box (`renderFlash`-style) when `error`, and the existing username/password form posting to `/api/v1/auth/login` (logic unchanged — same `api()` call, same success `navigate("/")`). Primary button is `.btn .btn-primary`.

- [ ] **Step 2:** Add `.auth-shell{display:grid;place-items:center;min-height:100vh;padding:1.25rem}` and `.auth-card{width:min(100%,26rem);background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:1.5rem}`.

- [ ] **Step 3: Build + check + lint.**

- [ ] **Step 4: Manual verification** — log out → `/login` shows the branded dark card; wrong password shows a clear error; correct login lands on the library.

- [ ] **Step 5: Commit** `style(web): restyle login to Clipline dark brand`.

---

# PHASE 2 — Backend `has_thumbnail` + library card grid

## Task 5: Backend `has_thumbnail` field (TDD)

**Files:**
- Modify: `crates/clipline-cloud-api-types/src/lib.rs` (add field to `ClipSummaryResponse`, `ClipDetailResponse`)
- Modify: `apps/clipline-cloud-server/src/clips.rs` (set the field; add a serde test)

**Interfaces:**
- Produces: JSON for `/api/v1/clips` summaries and `/api/v1/clips/{id}` detail now includes `"has_thumbnail": bool`.

- [ ] **Step 1: Write the failing test** in `clips.rs` `mod tests`:
```rust
#[test]
fn clip_summary_serializes_has_thumbnail() {
    let json = serde_json::to_value(ClipSummaryResponse {
        id: "c_1".into(), title: "t".into(), game_name: None, game_id: None,
        recorded_at: None, uploaded_at: None, duration_ms: None, file_size_bytes: None,
        width: None, height: None, fps: None, visibility: "private".into(), status: "ready".into(),
        public_url: None, has_thumbnail: true,
        created_at: chrono::Utc::now(), updated_at: chrono::Utc::now(),
    }).unwrap();
    assert_eq!(json.get("has_thumbnail").and_then(|v| v.as_bool()), Some(true));
}
```

- [ ] **Step 2: Run — verify it fails (does not compile: missing field `has_thumbnail`)**
```bash
cargo test -p clipline-cloud-server clip_summary_serializes_has_thumbnail
```
Expected: compile error `missing field has_thumbnail` (the red state).

- [ ] **Step 3: Add the field** to both structs in `crates/clipline-cloud-api-types/src/lib.rs`:
```rust
// in ClipSummaryResponse and ClipDetailResponse, after `public_url` / before timestamps:
pub has_thumbnail: bool,
```

- [ ] **Step 4: Populate it** in `clips.rs`:
  - `clip_summary_response`: add `has_thumbnail: clip.thumbnail_key.is_some(),`
  - `clip_detail_response`: add `has_thumbnail: clip.thumbnail_key.is_some(),`
  (Place the line consistently; both build `clip` fields before the move — read `clip.thumbnail_key.is_some()` before any field that moves `clip`. Since `is_some()` borrows, compute it into a `let has_thumbnail = clip.thumbnail_key.is_some();` at the top of each fn to avoid borrow-after-move.)

- [ ] **Step 5: Run tests — verify pass**
```bash
cargo test -p clipline-cloud-server
cargo build -p clipline-cloud-server
cargo fmt --all --check
```
Expected: the new test passes, all existing tests pass, build OK, fmt clean.

- [ ] **Step 6: Commit** `feat(api): expose has_thumbnail on clip responses`.

## Task 6: Card component (gradient placeholder, thumbnail gating, kebab)

**Files:** Create: `src/js/components/card.js`; Create `src/css/components.css` (link in `index.html`).

**Interfaces:**
- Produces: `clipCard(clip)`, `upNextCard(clip)`, `gradientFor(seed)` (Task 10 reuses `upNextCard`).

- [ ] **Step 1: Implement `gradientFor(seed)`** — deterministic, no RNG:
```js
export function gradientFor(seed) {
  const s = String(seed || "clip");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const a = h % 360, b = (a + 40 + (h >> 8) % 80) % 360;
  return `linear-gradient(135deg, hsl(${a} 45% 22%), hsl(${b} 50% 14%))`;
}
```

- [ ] **Step 2: Implement `clipCard(clip)`** returning:
```js
export function clipCard(clip) {
  const ready = clip.status === "ready";
  const showImg = ready && clip.has_thumbnail;            // <-- the gate (spec §6)
  const seed = `${clip.title}|${clip.game_name || clip.game_id || ""}`;
  const thumb = showImg
    ? `<img class="thumb-img" loading="lazy" alt="" src="/api/v1/clips/${encodeURIComponent(clip.id)}/thumbnail"
         onerror="this.remove()">`                         // defensive only; gate already prevents non-ready/no-thumb
    : "";
  const overlay = ready
    ? `<span class="thumb-duration">${escapeHtml(formatDuration(clip.duration_ms))}</span>`
    : `<span class="thumb-status status-${escapeAttr(clip.status)}">${escapeHtml(clip.status)}</span>`;
  return `
    <article class="card">
      <a class="thumb" href="/clip/${encodeURIComponent(clip.id)}" data-route
         style="background:${gradientFor(seed)}" aria-label="${escapeAttr(clip.title)}">
        ${thumb}
        <span class="thumb-badges">${visibilityBadge(clip.visibility)}</span>
        ${overlay}
        <span class="thumb-glyph" aria-hidden="true">${icon("play")}</span>
      </a>
      <div class="card-body">
        <a class="card-title" href="/clip/${encodeURIComponent(clip.id)}" data-route>${escapeHtml(clip.title)}</a>
        <div class="card-meta">${escapeHtml(clip.game_name || clip.game_id || "No game")}
          · ${escapeHtml(formatRelative(clip.recorded_at))} · ${escapeHtml(formatBytes(clip.file_size_bytes))}</div>
      </div>
      <button class="card-kebab icon-btn btn-ghost" aria-label="Clip actions"
        data-kebab data-clip-id="${escapeAttr(clip.id)}"
        data-visibility="${escapeAttr(clip.visibility)}"
        data-public-url="${escapeAttr(clip.public_url || "")}">${icon("more")}</button>
    </article>`;
}
```
Import `escapeHtml,escapeAttr,formatDuration,formatBytes,formatRelative,icon` from `/js/util.js` and `visibilityBadge` (move `visibilityBadge` into `util.js` so both `card.js` and `watch.js` share it).

- [ ] **Step 3: Implement `formatRelative(v)` in `util.js`**:
```js
export function formatRelative(v) {
  if (!v) return "Unknown";
  const d = new Date(v); if (Number.isNaN(d.getTime())) return "Unknown";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  const u = [["year",31536000],["month",2592000],["week",604800],["day",86400],["hour",3600],["minute",60]];
  for (const [name, secs] of u) { const n = Math.floor(s / secs); if (n >= 1) return `${n} ${name}${n>1?"s":""} ago`; }
  return "just now";
}
```

- [ ] **Step 4: Implement `upNextCard(clip)`** — compact horizontal variant (small `.thumb` ~168px + title + meta), same gating logic, linking to `/clip/{id}`.

- [ ] **Step 5: Write `components.css`** card rules: `.clip-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:var(--space-4)}`, `.card`, `.thumb{position:relative;aspect-ratio:16/9;border-radius:var(--radius-card);overflow:hidden;display:block}`, `.thumb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}`, `.thumb-duration/.thumb-status` (bottom-right pill), `.thumb-badges` (top-left), `.thumb-glyph` (centered, opacity 0 → .9 on `.card:hover`), `.card-title` (2-line clamp via `-webkit-line-clamp`), `.card-meta` (muted 13px), `.card-kebab`, hover lift `.card:hover .thumb{transform:translateY(-2px)}`. Link `components.css` in `index.html`.

- [ ] **Step 6: Build + check + lint** (`node --check src/js/components/card.js src/js/util.js`).

- [ ] **Step 7: Commit** `feat(web): clip card component with gradient placeholders + thumbnail gating`.

## Task 7: Library view — chip bar, grid, filters panel, states

**Files:** Rewrite: `src/js/views/library.js`; add chip/skeleton/menu/filters styles to `components.css`.

**Interfaces:**
- Consumes: `clipCard` from `components/card.js`; `renderShell` (Task 3); `state.libraryQuery`.
- Produces: kebab-menu behaviour (copy link / toggle visibility / delete) reused conceptually by watch actions.

- [ ] **Step 1: Rewrite `renderLibrary()`** to call `renderShell({ active, body, onMount })` where `active` reflects `state.libraryQuery.visibility` (`"library"` when empty). `body` = a page-heading row + `chipBar(clips)` + (`clips.length ? '<div class="clip-grid">'+clips.map(clipCard).join("")+'</div>' : emptyState)`. While loading, render the shell with **skeleton cards** (`'<div class="clip-grid">'+Array(8).fill(skeletonCard()).join("")+'</div>'`). `onMount` binds: chip clicks (set `state.libraryQuery.game`, re-render), the Filters/Sort panel, the header isn't re-bound here (shell owns it), and the card kebab menu.

- [ ] **Step 2: Implement `chipBar(clips)`** — `All` chip + a chip per distinct `game_name||game_id` present in `clips` (dedupe, cap ~12, `data-game`), active state from `state.libraryQuery.game`; a right-aligned `Filters` button `#filters-btn` toggling a `.filters-panel` containing the existing sort/status/date controls (port `selectField`/`field` markup; keep the current `from`/`to` date inputs and the sort options list verbatim). Applying the panel sets the `state.libraryQuery` fields and re-renders.

- [ ] **Step 3: Implement the kebab menu** — clicking `[data-kebab]` opens a small popover (`.menu` positioned near the button) with: **Copy link** (enabled only when `data-public-url`), **Make public/Make private** (calls `POST /api/v1/clips/{id}/visibility` with the opposite visibility — preserve current toggle logic), **Delete** (confirm → `DELETE /api/v1/clips/{id}`). Reuse `copyText`, `flash`, and re-render `renderLibrary()` after actions. Close on outside-click/Escape. (Move the visibility-toggle + delete logic from the old `bindLibraryEvents` here.)

- [ ] **Step 4: Implement `skeletonCard()`** (shimmer) and `emptyState()`; add `.skeleton`/`@keyframes shimmer` (guarded by reduced-motion) + `.menu`/`.chip`/`.chip-row`/`.filters-panel` rules to `components.css`.

- [ ] **Step 5: Keep `libraryParams()`** logic identical (sort/page_size/game/visibility/status/q/from/to). The data fetch (`api('/api/v1/clips?'+params)`) is unchanged.

- [ ] **Step 6: Build + check + lint.**

- [ ] **Step 7: Manual verification** — `/` shows a responsive card grid with gradient placeholders, duration pills, visibility badges; chips filter by game; Filters panel applies sort/status/date; kebab menu copies link / toggles visibility / deletes; non-ready clips (if any) show a status overlay and make no `/thumbnail` request (check the Network tab — no request to `/thumbnail` for non-ready or `has_thumbnail:false` cards); empty state appears when filters match nothing; skeletons flash on load. No console errors.

- [ ] **Step 8: Commit** `feat(web): YouTube-style library grid with chips, filters, and kebab actions`.

---

# PHASE 3 — Watch page

## Task 8: Marker timeline component (a11y + seek)

**Files:** Create: `src/js/components/marker_timeline.js`; add `.marker-bar`/`.tick`/`.marker-list` rules to `components.css`.

**Interfaces:**
- Produces: `markerTimelineHtml({ markers, durationMs })` and `bindMarkerTimeline(root, videoEl)` — reused by both `watch.js` and `public.js`.

- [ ] **Step 1: Implement `kindColor(kind)`** map → returns a CSS var: objectives→`var(--gold)`, kill/kills→`var(--danger)`, else `var(--accent)`.

- [ ] **Step 2: Implement `markerTimelineHtml({ markers, durationMs })`**:
```js
export function markerTimelineHtml({ markers, durationMs }) {
  if (!markers || !markers.length) return `<p class="muted">No markers on this clip.</p>`;
  const ticks = durationMs ? markers.map((m, i) => {
    const left = Math.max(0, Math.min(100, (m.timestamp_ms / durationMs) * 100));
    const label = `Seek to ${formatDuration(m.timestamp_ms)} — ${m.label || m.kind}`;
    return `<button type="button" class="tick" data-seek-ms="${m.timestamp_ms}"
      style="left:${left}%;--tick:${kindColor(m.kind)}" title="${escapeAttr(label)}"
      aria-label="${escapeAttr(label)}"></button>`;
  }).join("") : "";
  const rows = markers.map((m) =>
    `<li><button type="button" class="marker-row" data-seek-ms="${m.timestamp_ms}">
       <span class="marker-time mono">${escapeHtml(formatDuration(m.timestamp_ms))}</span>
       <span class="marker-label">${escapeHtml(m.label || m.kind)}</span>
       <span class="marker-kind muted">${escapeHtml(m.kind)}</span>
     </button></li>`).join("");
  return `<div class="marker-bar" aria-hidden="${durationMs ? "false" : "true"}">${ticks}</div>
          <ul class="marker-list">${rows}</ul>`;
}
```

- [ ] **Step 3: Implement `bindMarkerTimeline(root, videoEl)`**:
```js
export function bindMarkerTimeline(root, videoEl) {
  root.querySelectorAll("[data-seek-ms]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ms = Number(btn.dataset.seekMs) || 0;
      videoEl.currentTime = ms / 1000;
      videoEl.play?.().catch(() => {});
      videoEl.focus?.();
    });
  });
}
```

- [ ] **Step 4: CSS** — `.marker-bar{position:relative;height:.5rem;background:var(--surface-3);border-radius:var(--radius-pill);margin:.75rem 0}`, `.tick{position:absolute;top:50%;width:.85rem;height:.85rem;transform:translate(-50%,-50%);border:2px solid var(--surface);border-radius:50%;background:var(--tick,var(--accent));padding:0;cursor:pointer}`, `.tick:focus-visible{outline:2px solid var(--accent-contrast)}`, `.marker-list{list-style:none;margin:0;padding:0;display:grid;gap:.25rem}`, `.marker-row{display:grid;grid-template-columns:4rem 1fr auto;gap:.5rem;width:100%;text-align:left;background:transparent;border:0;padding:.4rem .5rem;border-radius:var(--radius-btn);color:var(--text)}`, `.marker-row:hover{background:var(--surface-2)}`.

- [ ] **Step 5: Build + check + lint.**

- [ ] **Step 6: Commit** `feat(web): accessible marker timeline component (ticks + seek)`.

## Task 9: Watch view (player, markers, actions, details, edit)

**Files:** Rewrite: `src/js/views/watch.js`; add watch-layout rules to `css/layout.css` and detail/description/dialog rules to `components.css`.

**Interfaces:**
- Consumes: `markerTimelineHtml`/`bindMarkerTimeline` (Task 8), `upNextCard` (Task 6 — used in Task 10), `renderShell`.

- [ ] **Step 1: Rewrite `renderClipDetail(id)`** — fetch `GET /api/v1/clips/{id}` (unchanged). Render via `renderShell({ active:"library", body, onMount })`. `body` = `.watch-layout` with a main column and an `.up-next` aside (populated in Task 10; render an empty `<aside class="up-next" id="up-next"></aside>` placeholder here).

- [ ] **Step 2: Main column markup** — `.player-frame > video#player` (controls, preload metadata, `src=/api/v1/clips/{id}/media`); `<h1 class="watch-title">`; `.watch-actions` pill cluster: **Share** (`#share-btn`, copies `public_url` if set else triggers publish via visibility POST then copy), **Visibility** (`#visibility-btn` cycling/۲setting via a small inline select keeping current POST `/visibility` logic), **Edit** (`#edit-btn` toggles the metadata form), **Delete** (`#delete-btn`, confirm → DELETE → `navigate("/")`); a `.watch-meta` line (recorded/uploaded/duration/size + visibility badge). Then a `.description-card` (collapsible `<details>`-style) containing the technical metadata grid (port `dataRow` rows: dimensions, fps, container, codecs, checksum) + `markerTimelineHtml({markers, durationMs:clip.duration_ms})`. The **Edit** form (hidden until toggled) ports the current PATCH form (title/game_name/game_id/duration_ms → `PATCH /api/v1/clips/{id}`).

- [ ] **Step 3: `onMount`** — grab `videoEl=#player`; `bindMarkerTimeline(contentRoot, videoEl)`; bind Share/Visibility/Edit/Delete and the edit-form submit (port the exact `api()` calls + `flash` + re-render from the old `bindClipDetailEvents`). Call the Task-10 `loadUpNext(clip)`.

- [ ] **Step 4: CSS** — `.watch-layout{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:var(--space-6);align-items:start}`, `.player-frame{background:#000;border-radius:var(--radius-card);overflow:hidden}`, `video#player{width:100%;aspect-ratio:16/9;display:block}`, `.watch-actions{display:flex;flex-wrap:wrap;gap:var(--space-2)}`, `.description-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:var(--space-4)}`, plus the metadata grid. Also set the watch page to **force rail-mini** (add a body/shell flag so `renderShell` applies `.rail-mini` on the watch route).

- [ ] **Step 5: Build + check + lint.**

- [ ] **Step 6: Manual verification** — open a ready clip: player plays with working seek; title + action pills present; Share copies the link (and publishes if private); Visibility toggles; Edit reveals the form and saves metadata; Delete confirms and returns to library; markers render as colored ticks + list and clicking either a tick or a row seeks the video; keyboard Tab reaches ticks/rows and Enter seeks; rail is in mini state. No console errors.

- [ ] **Step 7: Commit** `feat(web): YouTube-style watch page with marker chapters`.

## Task 10: Up-next rail (best-effort single-page partition)

**Files:** Modify: `src/js/views/watch.js` (add `loadUpNext` + `partitionUpNext`).

**Interfaces:**
- Consumes: `GET /api/v1/clips` (one page), `upNextCard`.

- [ ] **Step 1: Implement `partitionUpNext(clips, current)`** (pure, testable by eye):
```js
function partitionUpNext(clips, current) {
  const others = clips.filter((c) => c.id !== current.id && c.status === "ready");
  const key = (c) => c.game_id || c.game_name || "";
  const same = others.filter((c) => key(c) && key(c) === key(current));
  const rest = others.filter((c) => !(key(c) && key(c) === key(current)));
  return [...same, ...rest].slice(0, 20);   // recency preserved within each group (API returns sorted)
}
```

- [ ] **Step 2: Implement `loadUpNext(current)`** — `const data = await api("/api/v1/clips?sort=uploaded_at_desc&page_size=30")`; `document.querySelector("#up-next").innerHTML = '<h2 class="up-next-head">Up next</h2>' + partitionUpNext(data.clips, current).map(upNextCard).join("")`. Wrap in try/catch → on error leave the rail empty (non-fatal). Import `upNextCard`.

- [ ] **Step 3: CSS** — `.up-next{display:grid;gap:var(--space-3)}` and the compact `upNextCard` row styles (small thumb 168px + title clamp + meta) in `components.css`.

- [ ] **Step 4: Build + check + lint.**

- [ ] **Step 5: Manual verification** — on a clip whose game matches other clips, the up-next rail lists same-game clips first then recent others (current clip excluded, non-ready excluded, ≤20); each links to its watch page and navigates correctly. With only one clip, the rail is empty and nothing errors.

- [ ] **Step 6: Commit** `feat(web): up-next rail with same-game-first partitioning`.

---

# PHASE 4 — Public watch page + backend markers

## Task 11: Backend public markers (TDD)

**Files:** Modify: `apps/clipline-cloud-server/src/media.rs`.

**Interfaces:**
- Produces: `GET /api/v1/public/clips/{share_id}` JSON now includes `"markers": [{kind,label,timestamp_ms}]` and `"has_thumbnail": bool`.

- [ ] **Step 1: Write the failing test** in `media.rs` `mod tests`:
```rust
#[test]
fn public_clip_response_serializes_markers_and_has_thumbnail() {
    let resp = PublicClipResponse {
        share_id: "c_x".into(), title: "t".into(), game_name: None, game_id: None,
        recorded_at: None, uploaded_at: None, duration_ms: Some(1000),
        media_url: "u".into(), thumbnail_url: "u".into(), share_url: "u".into(),
        copy_notice: "n", has_thumbnail: false,
        markers: vec![PublicMarker { kind: "kill".into(), label: Some("First Blood".into()), timestamp_ms: 500 }],
    };
    let json = serde_json::to_value(&resp).unwrap();
    assert_eq!(json["markers"][0]["kind"], "kill");
    assert_eq!(json["markers"][0]["timestamp_ms"], 500);
    assert_eq!(json["has_thumbnail"], false);
    assert!(json["markers"][0].get("id").is_none(), "must not leak internal id");
}
```

- [ ] **Step 2: Run — verify it fails** (`cargo test -p clipline-cloud-server public_clip_response_serializes_markers_and_has_thumbnail`): compile error (no `PublicMarker`, missing fields).

- [ ] **Step 3: Add `PublicMarker` + fields** in `media.rs`:
```rust
#[derive(Debug, Serialize)]
struct PublicMarker { kind: String, label: Option<String>, timestamp_ms: i64 }
```
Add to `PublicClipResponse`: `has_thumbnail: bool,` and `markers: Vec<PublicMarker>,`.

- [ ] **Step 4: Populate in `get_public_clip`** — after `load_public_clip`:
```rust
let markers = state.repositories.clip_markers.list_for_clip(&clip.id).await?
    .into_iter()
    .map(|m| PublicMarker { kind: m.kind, label: m.label, timestamp_ms: m.timestamp_ms })
    .collect();
```
Set `has_thumbnail: clip.thumbnail_key.is_some(),` (compute before `clip.title` etc. move it; bind `let has_thumbnail = clip.thumbnail_key.is_some();` up top) and `markers,` in the returned struct.

- [ ] **Step 5: Run — verify pass + full suite**
```bash
cargo test -p clipline-cloud-server
cargo build -p clipline-cloud-server
cargo fmt --all --check
```

- [ ] **Step 6: Commit** `feat(api): expose markers + has_thumbnail on public clip endpoint`.

## Task 12: Public watch view (full experience)

**Files:** Rewrite: `src/js/views/public.js`; add `.public-shell`/`.public-topbar` rules.

**Interfaces:**
- Consumes: `markerTimelineHtml`/`bindMarkerTimeline` (Task 8), the new public `markers` + `has_thumbnail`.

- [ ] **Step 1: Rewrite `renderPublicShare(shareId)`** — fetch `GET /api/v1/public/clips/{shareId}` (unchanged). Render a no-chrome `.public-shell`: a `.public-topbar` (Clipline mark + wordmark only) + a centered `.public-main` (max 1100px) with `.player-frame > video` (use `safeMediaUrl(clip.media_url)`; set `poster` to `safeMediaUrl(clip.thumbnail_url)` **only when `clip.has_thumbnail`**), `<h1>` title, game line, a meta line (recorded/uploaded/duration), `markerTimelineHtml({markers:clip.markers, durationMs:clip.duration_ms})`, and the `copy_notice` footer. Keep the existing "unavailable" catch branch but restyle it.

- [ ] **Step 2: `onMount`/binding** — after innerHTML, `bindMarkerTimeline(publicRoot, videoEl)`.

- [ ] **Step 3: CSS** — `.public-shell{min-height:100vh}`, `.public-topbar{display:flex;align-items:center;gap:.6rem;height:var(--header-h);padding:0 var(--space-4);border-bottom:1px solid var(--border)}`, `.public-main{max-width:1100px;margin:0 auto;padding:var(--space-6);display:grid;gap:var(--space-4)}`.

- [ ] **Step 4: Build + check + lint.**

- [ ] **Step 5: Manual verification** — publish a clip, open its `/c/{shareId}` in a logged-out/private window: full-width dark watch page, video plays, markers render as ticks + list, clicking seeks — all without login; revoke → page shows the styled "unavailable" state. No console errors.

- [ ] **Step 6: Commit** `feat(web): full public watch page with marker chapters`.

---

# PHASE 5 — Admin Studio restyle

## Task 13: Admin (overview metric cards, users table, jobs cards)

**Files:** Rewrite: `src/js/views/admin.js`; add `.metric-grid`/`.metric-card`/admin table rules to `components.css`.

**Interfaces:**
- Consumes: the five existing admin endpoints (unchanged Promise.all fetch); `renderShell`.

- [ ] **Step 1: Rewrite `renderAdmin(tab)`** — keep the exact `Promise.all` of `/api/v1/admin/overview`, `/api/v1/users`, `/api/v1/admin/uploads/failed`, `/api/v1/admin/jobs/dead`, `/api/v1/admin/jobs/recent-errors`. Render via `renderShell({ active:"admin", body, onMount })`. `body` = underlined `.studio-tabs` (Overview/Users/Jobs via `data-route` `?tab=`) + the active panel.

- [ ] **Step 2: Overview** → `.metric-grid` of `.metric-card`s (label + value) for server version, API version, public URL, database, storage backend/summary, max upload, part size, single-PUT max, upload TTL, public media mode/TTL (port the exact values from the current `adminOverviewView`).

- [ ] **Step 3: Users** → a `.panel` "Create user" form (port fields + reauth) + a dark `table` (avatar initial, username/display, role chip, status chip, last login, Reset/Disable actions). Reset token surfaces in a `.notice` callout. **Port `bindAdminEvents` verbatim** (create user, reset with `window.prompt` reauth, disable with reauth) — logic unchanged.

- [ ] **Step 4: Jobs** → three `.panel`s (failed uploads with progress meters, dead jobs, recent errors) — port `uploadItem`/`jobItem`/`recoveryActionLabel` markup, restyled; error text in `.mono` code blocks.

- [ ] **Step 5: CSS** — `.metric-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-4)}`, `.metric-card`, `.studio-tabs` underline tabs, dark `table`/`th`/`td`, `.role-chip`/`.status-chip`.

- [ ] **Step 6: Build + check + lint.**

- [ ] **Step 7: Manual verification** — `/admin` (as admin) shows Studio-style overview metric cards; Users tab creates a user (reauth enforced), resets a password (token shown), disables a user; Jobs tab shows failed uploads/dead jobs/recent errors. Non-admin visiting `/admin` is redirected with the existing flash. No "browse all clips" surface exists anywhere. No console errors.

- [ ] **Step 8: Commit** `feat(web): YouTube-Studio-style admin dashboard`.

---

# PHASE 6 — Responsive, accessibility, polish, cleanup

## Task 14: Responsive + accessibility polish

**Files:** Modify: `src/css/layout.css`, `src/css/components.css`, `src/js/shell.js`.

- [ ] **Step 1: Header/rail responsive** — under `1000px`, `.app-body` collapses the rail to an overlay drawer: rail becomes `position:fixed` off-canvas, the hamburger toggles a `.drawer-open` class + a `.scrim` backdrop (click/Escape closes). Search collapses to an icon button that expands the pill (toggle a `.search-open` class on the header). Add the media queries + the small JS toggles in `shell.js`.

- [ ] **Step 2: Grid/watch responsive** — `.clip-grid` min drops to `~160px` on narrow; `.watch-layout` becomes single column under `1000px` with `.up-next` flowing below; `.metric-grid` reflows.

- [ ] **Step 3: A11y sweep** — confirm every icon-only button has `aria-label` (header, kebab, account, ticks, marker rows); account menu + kebab menu are keyboard operable (open on Enter/Space, close on Escape, focus returns to trigger); `:focus-visible` rings visible on all interactive elements; `prefers-reduced-motion` disables hover-lift + shimmer (already in base — verify card/skeleton honor it); semantic landmarks present (`header`, `nav` on rail, `main` on content, `aside` on up-next).

- [ ] **Step 4: Build + check + lint.**

- [ ] **Step 5: Manual verification** — resize to mobile width: rail becomes a drawer with scrim; search collapses/expands; grid reflows to 1–2 columns; watch page is single-column with up-next below. Keyboard-only: Tab through header → rail → cards → kebab; open/close menus with keyboard; all focus rings visible. Test at ~375px, ~768px, ~1280px.

- [ ] **Step 6: Commit** `feat(web): responsive drawer + accessibility polish`.

## Task 15: Cleanup, docs, full verification

**Files:** Delete: `src/styles.css`; Modify: `docs/09-web-frontend.md`, `docs/08-media-serving-and-public-sharing.md`.

- [ ] **Step 1: Remove the legacy stylesheet** — delete `src/styles.css` and its `<link>` in `index.html` (all styles now in `css/*.css`). Grep for stray references: `grep -rn "styles.css" apps/clipline-cloud-web/src`.

- [ ] **Step 2: Docs** — add a progress-log entry to `docs/09-web-frontend.md` describing the YouTube redesign (modules, shell, grid, watch, public markers, admin studio). In `docs/08-media-serving-and-public-sharing.md`, document the new public response fields (`markers`, `has_thumbnail`).

- [ ] **Step 3: Full frontend verification**
```bash
cd apps/clipline-cloud-web
npm run build && node scripts/check-dist.mjs
find src -name "*.js" -exec node --check {} \;
cd -
```
Expected: all exit 0.

- [ ] **Step 4: Full backend verification**
```bash
cargo fmt --all --check
cargo test --workspace
cargo build --workspace
```
Expected: clean fmt, all tests pass, build OK.

- [ ] **Step 5: End-to-end manual smoke** — login → library grid → filter via chips + panel → open a clip → play + seek via markers → edit metadata → publish → open the public link logged-out (markers work) → revoke → admin create/reset/disable user → sign out. Confirm no console errors and the privacy boundary holds.

- [ ] **Step 6: Commit** `docs: record YouTube web redesign; chore(web): drop legacy styles.css`.

---

## Self-Review (completed by plan author)

- **Spec coverage:** Tokens/§4 → T2; shell/§5 → T3; library/§6 → T6–T7 (+T5 for `has_thumbnail`); watch/§7 → T8–T10; public/§8 → T11–T12; admin/§9 → T13; login/§10 → T4; architecture/§11 → T1; backend/§12 → T5 + T11; cross-cutting/§13 → T6–T8 (states/skeletons), T14 (responsive/a11y); verification/§14 → per-task + T15; milestones/§15 → the six phases. No gaps.
- **Placeholder scan:** logic-bearing code is shown in full; the bulk mechanical CSS/markup is specified with exact class names, token usage, representative rules, and the precise source functions to port — intentional and sufficient given the zero-JS-test constraint, not a TBD.
- **Type consistency:** `gradientFor`, `clipCard`/`upNextCard`, `markerTimelineHtml`/`bindMarkerTimeline`, `partitionUpNext`, `has_thumbnail`, `PublicMarker{kind,label,timestamp_ms}`, and the `state`/`renderShell` shapes are used consistently across tasks.
