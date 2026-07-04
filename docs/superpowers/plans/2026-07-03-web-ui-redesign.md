# Clipline Cloud Web UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `apps/clipline-cloud-web` as the approved "Broadcast" redesign (spec: `docs/superpowers/specs/2026-07-03-web-ui-redesign-design.md`) on Preact + htm + esbuild, with zero backend changes.

**Architecture:** A new Preact app is built in parallel inside the same `src/` tree (new entry `main.js`, pages in `pages/`, components in `components/`). The legacy `app.js` stays the served entry until every route is ported; a `preview.html` harness (served at `/preview.html`, same origin so all APIs work) is used to verify each new page before the final cutover task swaps `index.html` to the new entry and deletes the legacy code.

**Tech Stack:** Preact 10 + htm (tagged templates, no JSX/transpile), esbuild (bundling/minify), plain CSS with design tokens, `node --test` for pure-logic unit tests, seeded local server + Playwright for visual verification.

## Global Constraints

- **No backend changes.** Only `apps/clipline-cloud-web/**`, `Dockerfile` line 30, and `.github/workflows/ci.yml` (web job) may change.
- **CSP must keep passing** as served: `default-src 'self'; … img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` — no external requests at runtime (fonts self-hosted), no inline `<script>`.
- **Palette tokens are exact** (spec §2): bg `#0d1320`, surface `#141c2e`, surface-raised `#172236`, line `#1e2942`, line-strong `#2c3a5e`, ink `#eef4ff`, muted `#8d9bb5`, faint `#67758f`, accent `#3b82f6`, highlight `#8bbcff`, success `#5ee0a0`, danger `#ff6b7a`. No hex values outside `tokens.css`.
- **Route map unchanged** (spec §3). API endpoints and field names are those the legacy app already uses (`thumbnail_url`, `poster_url`, `media_url`, `view_count`, `uploaded_at`, `duration_ms`, …).
- **Dark theme only.** No download buttons on media.
- `prefers-reduced-motion` disables hover previews and transitions.
- Node ≥ 22 for build/test (CI uses 22). `dist/` stays committed; Docker never runs node.
- Commit after every task; messages `feat(web): …` / `chore(web): …`.

## Verification infrastructure (used by every UI task)

Run the seeded preview server once per session:

```bash
# 1. seed data (idempotent enough for reuse; wipe /tmp/clipline-ui-preview to reset)
mkdir -p /tmp/clipline-ui-preview && python3 /tmp/clipline-seed/seed.py 2>/dev/null || true
# 2. run the debug server against the repo's dist/
cd /home/dain/clipline-cloud && \
CLIPLINE_PUBLIC_URL=http://localhost:18080 CLIPLINE_ALLOW_INSECURE_PUBLIC_URL=true \
CLIPLINE_BIND_ADDR=127.0.0.1:18080 CLIPLINE_DATA_DIR=/tmp/clipline-ui-preview \
CLIPLINE_DATABASE_URL=sqlite:///tmp/clipline-ui-preview/clipline.db \
CLIPLINE_SESSION_SECRET=$(head -c 32 /dev/urandom | base64) \
CLIPLINE_BOOTSTRAP_ADMIN_USERNAME=admin CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD=preview-password-123 \
./target/debug/clipline-cloud-server
```

If `/tmp/clipline-seed/seed.py` is missing, recreate it from the session notes or seed manually; it inserts 14 clips across 3 users (admin/kairos/mira, all password `preview-password-123`) with generated PNG thumbnails. New-app pages are previewed pre-cutover at `http://127.0.0.1:18080/preview.html#<route>` (e.g. `#/library`). Rebuild between checks: `npm run build --prefix apps/clipline-cloud-web`.

---

### Task 1: Build toolchain — esbuild + npm deps, dist stays committed

**Files:**
- Modify: `apps/clipline-cloud-web/package.json`
- Create: `apps/clipline-cloud-web/package-lock.json` (via `npm install`)
- Modify: `apps/clipline-cloud-web/scripts/build.mjs`
- Modify: `apps/clipline-cloud-web/scripts/check-dist.mjs`
- Modify: `Dockerfile:30`
- Modify: `.github/workflows/ci.yml` (web job: add `npm ci`)
- Modify: `apps/clipline-cloud-web/.gitignore` (create; ignore `node_modules/`)

**Interfaces:**
- Produces: `npm run build` bundles every top-level `src/*.js` entry (currently `app.js`, later also `main.js`) into `dist/` (minified ESM) and copies all non-JS assets (html, css, svg, `fonts/`) verbatim. `npm run check:dist` rebuilds into `.dist-check/` and byte-compares with `dist/`, exiting 1 on drift. `DIST_DIR` env var overrides the output directory.

- [ ] **Step 1: Add dependencies (exact versions, then commit the lockfile)**

```bash
cd apps/clipline-cloud-web
npm install --save-exact preact@10 htm@3
npm install --save-exact --save-dev esbuild@0.25
printf 'node_modules/\n.dist-check/\n' > .gitignore
```

- [ ] **Step 2: Replace `scripts/build.mjs`**

```js
import { build } from "esbuild";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "src");
const dist = process.env.DIST_DIR ? join(root, process.env.DIST_DIR) : join(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

const entries = [];
for (const entry of await readdir(src, { withFileTypes: true })) {
  const path = join(src, entry.name);
  if (entry.isDirectory()) {
    // components/, pages/, lib/ are reached via imports; fonts/ is a static asset
    if (entry.name === "fonts") await cp(path, join(dist, "fonts"), { recursive: true });
    continue;
  }
  if (extname(entry.name) === ".js") entries.push(path);
  else await cp(path, join(dist, entry.name));
}

await build({
  entryPoints: entries,
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: true,
  sourcemap: false,
  legalComments: "none",
  outdir: dist,
});
```

Note: bundling the legacy `app.js` pulls in `player-core.js`; the standalone copy of `player-core.js` disappears from `dist/` and `index.html` needs no change (it only loads `/app.js`). Verify nothing else references `/player-core.js`: `grep -rn "player-core" apps/clipline-cloud-web/src/index.html` → no matches expected.

- [ ] **Step 3: Replace `scripts/check-dist.mjs`**

```js
import { execFileSync } from "node:child_process";
import { readdir, readFile, rm } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const check = join(root, ".dist-check");

execFileSync(process.execPath, [join(root, "scripts/build.mjs")], {
  env: { ...process.env, DIST_DIR: ".dist-check" },
  stdio: "inherit",
});

const [distFiles, checkFiles] = await Promise.all([listFiles(dist), listFiles(check)]);
const distSet = new Set(distFiles);
const checkSet = new Set(checkFiles);
const missing = checkFiles.filter((f) => !distSet.has(f));
const extra = distFiles.filter((f) => !checkSet.has(f));
const changed = [];
for (const file of checkFiles) {
  if (!distSet.has(file)) continue;
  const [a, b] = await Promise.all([readFile(join(dist, file)), readFile(join(check, file))]);
  if (!a.equals(b)) changed.push(file);
}
await rm(check, { force: true, recursive: true });
if (missing.length || extra.length || changed.length) {
  console.error("dist is stale — run: npm run build --prefix apps/clipline-cloud-web");
  for (const [label, files] of Object.entries({ missing, extra, changed })) {
    if (files.length) console.error(`${label}:\n  ${files.join("\n  ")}`);
  }
  process.exit(1);
}

async function listFiles(rootDir, currentDir = rootDir) {
  const files = [];
  for (const entry of await readdir(currentDir, { withFileTypes: true })) {
    const path = join(currentDir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(rootDir, path)));
    else files.push(relative(rootDir, path));
  }
  return files.sort();
}
```

- [ ] **Step 4: Update Dockerfile and CI**

`Dockerfile:30` — the byte-diff of src vs dist no longer holds (dist is now built output). Replace:

```dockerfile
RUN diff -ru apps/clipline-cloud-web/src apps/clipline-cloud-web/dist
```

with a sanity check that a built bundle was committed:

```dockerfile
RUN test -s apps/clipline-cloud-web/dist/index.html && test -s apps/clipline-cloud-web/dist/app.js
```

`.github/workflows/ci.yml` web job — add an `npm ci` step before "Build web app":

```yaml
      - name: Install web deps
        run: npm ci --prefix apps/clipline-cloud-web
```

(`check:dist` in CI now guarantees the committed dist matches a fresh build, replacing the Docker diff.)

- [ ] **Step 5: Build, verify output, verify the running app is unchanged**

```bash
npm run build --prefix apps/clipline-cloud-web && npm run check:dist --prefix apps/clipline-cloud-web
```
Expected: exit 0; `dist/` contains `app.js` (minified), `index.html`, `styles.css`, `clipline-icon.svg`, no `player-core.js`. Start the preview server, load `http://127.0.0.1:18080/login`, sign in (`admin`/`preview-password-123`), click through Library and a clip page — behavior identical to before.

- [ ] **Step 6: Commit**

```bash
git add apps/clipline-cloud-web Dockerfile .github/workflows/ci.yml
git commit -m "chore(web): switch to esbuild bundling with committed dist"
```

---

### Task 2: Design tokens, fonts, and the new stylesheet skeleton

**Files:**
- Create: `apps/clipline-cloud-web/src/tokens.css`
- Create: `apps/clipline-cloud-web/src/ui.css` (new design system; grows in later tasks)
- Create: `apps/clipline-cloud-web/src/fonts/space-grotesk-{400,500,600,700}.woff2`
- Modify: `apps/clipline-cloud-web/src/index.html` (link tokens.css + ui.css before styles.css)

**Interfaces:**
- Produces: CSS custom properties `--bg --surface --surface-raised --line --line-strong --ink --muted --faint --accent --highlight --success --danger --radius --radius-sm --shadow-float`, font-family `"Space Grotesk"`, and base classes `.btn .btn-primary .btn-danger .chip .chip-on .badge .badge-public .badge-private .badge-unlisted .seg .seg-item .seg-on .card-thumb .dur-pill .kicker` used by all later tasks.

- [ ] **Step 1: Download Space Grotesk woff2 (latin, weights 400/500/600/700)**

```bash
mkdir -p apps/clipline-cloud-web/src/fonts && cd apps/clipline-cloud-web/src/fonts
# fetch the latin woff2 files referenced by the Google Fonts css2 API
for w in 400 500 600 700; do
  url=$(curl -s -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${w}" \
    | grep -o "https://fonts.gstatic.com/[^)]*latin[^)]*\.woff2" | head -1)
  curl -s -o "space-grotesk-${w}.woff2" "$url"
done
ls -la  # each file should be ~15-30 KB, non-empty
```

If the network is unavailable, stop and report — do not commit empty font files. (The CSS below falls back to Inter/system-ui, so the UI still works, but the task is incomplete without the fonts.)

- [ ] **Step 2: Write `src/tokens.css`** (the only file allowed to contain hex colors)

```css
:root {
  color-scheme: dark;
  --bg: #0d1320;
  --surface: #141c2e;
  --surface-raised: #172236;
  --line: #1e2942;
  --line-strong: #2c3a5e;
  --ink: #eef4ff;
  --muted: #8d9bb5;
  --faint: #67758f;
  --accent: #3b82f6;
  --highlight: #8bbcff;
  --success: #5ee0a0;
  --danger: #ff6b7a;
  --accent-soft: rgba(59, 130, 246, 0.12);
  --highlight-soft: rgba(139, 188, 255, 0.14);
  --danger-soft: rgba(255, 107, 122, 0.14);
  --success-soft: rgba(94, 224, 160, 0.14);
  --scrim: rgba(8, 11, 18, 0.82);
  --radius: 10px;
  --radius-sm: 6px;
  --shadow-float: 0 12px 32px rgba(0, 0, 0, 0.5);
  --font-sans: "Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 3: Write `src/ui.css` (base layer: fonts, reset alignment, core components)**

```css
@font-face { font-family: "Space Grotesk"; font-weight: 400; font-display: swap;
  src: url("/fonts/space-grotesk-400.woff2") format("woff2"); }
@font-face { font-family: "Space Grotesk"; font-weight: 500; font-display: swap;
  src: url("/fonts/space-grotesk-500.woff2") format("woff2"); }
@font-face { font-family: "Space Grotesk"; font-weight: 600; font-display: swap;
  src: url("/fonts/space-grotesk-600.woff2") format("woff2"); }
@font-face { font-family: "Space Grotesk"; font-weight: 700; font-display: swap;
  src: url("/fonts/space-grotesk-700.woff2") format("woff2"); }

.ui { font-family: var(--font-sans); background: var(--bg); color: var(--ink);
  min-height: 100vh; line-height: 1.5; }
.ui :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .ui *, .ui *::before, .ui *::after { transition: none !important; animation: none !important; }
}

.kicker { font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
  color: var(--highlight); font-weight: 600; }

.btn { display: inline-flex; align-items: center; gap: 7px; font: inherit; font-size: 12.5px;
  color: var(--ink); background: var(--surface); border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm); padding: 7px 14px; cursor: pointer; }
.btn:hover { border-color: var(--accent); }
.btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
.btn-danger { color: var(--danger); border-color: var(--danger-soft); }
.btn[disabled] { opacity: .55; cursor: default; }

.chip { font-size: 11.5px; padding: 6px 12px; border-radius: 999px; cursor: pointer;
  border: 1px solid var(--line-strong); color: var(--muted); background: none; font-family: inherit; }
.chip-on { border-color: var(--accent); color: var(--highlight); background: var(--accent-soft); }

.badge { font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; font-weight: 600;
  padding: 3px 8px; border-radius: 4px; }
.badge-public { background: var(--highlight); color: var(--bg); }
.badge-private { background: var(--scrim); color: var(--muted); border: 1px solid var(--line-strong); }
.badge-unlisted { background: var(--success-soft); color: var(--success);
  border: 1px solid var(--success); }

.seg { display: inline-flex; border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm); overflow: hidden; }
.seg-item { font: inherit; font-size: 12.5px; padding: 7px 14px; color: var(--muted);
  background: none; border: 0; cursor: pointer; }
.seg-on { background: var(--accent-soft); color: var(--highlight); font-weight: 600; }

.card-thumb { aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; position: relative;
  background: var(--surface); display: block; }
.card-thumb img, .card-thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }
.dur-pill { position: absolute; right: 8px; bottom: 8px; font-size: 10.5px;
  background: var(--scrim); padding: 2px 7px; border-radius: 4px; }

.input { font: inherit; font-size: 12.5px; color: var(--ink); background: var(--surface);
  border: 1px solid var(--line-strong); border-radius: var(--radius-sm); padding: 8px 14px; }
.input::placeholder { color: var(--faint); }
```

- [ ] **Step 4: Link in `index.html`** — add before the existing stylesheet link:

```html
    <link rel="stylesheet" href="/tokens.css">
    <link rel="stylesheet" href="/ui.css">
```

- [ ] **Step 5: Build + verify legacy app unaffected, commit**

```bash
npm run build --prefix apps/clipline-cloud-web && npm run check:dist --prefix apps/clipline-cloud-web
```
Load the app — identical look (new classes unused so far; `.ui` is scoped so legacy pages don't change).

```bash
git add apps/clipline-cloud-web
git commit -m "feat(web): add design tokens, self-hosted Space Grotesk, ui.css base"
```

---

### Task 3: Core runtime — api, formatters, router, stores (+ unit tests)

**Files:**
- Create: `apps/clipline-cloud-web/src/lib/api.js`
- Create: `apps/clipline-cloud-web/src/lib/format.js`
- Create: `apps/clipline-cloud-web/src/lib/routes.js`
- Create: `apps/clipline-cloud-web/src/lib/store.js`
- Create: `apps/clipline-cloud-web/tests/format.test.mjs`
- Create: `apps/clipline-cloud-web/tests/routes.test.mjs`
- Create: `apps/clipline-cloud-web/tests/api.test.mjs`
- Modify: `apps/clipline-cloud-web/package.json` (add `"test": "node --test tests/"`)

**Interfaces:**
- Produces:
  - `api(path, options) -> Promise<data>` throws `ApiError {status, message}`; emits `window` CustomEvent `"clipline:unauthorized"` on 401. `setCsrfToken(token)`, `getCsrfToken()`.
  - `formatDuration(ms) -> "m:ss"`, `formatRelativeTime(iso) -> "2 days ago"`, `formatBytes(n) -> "324.0 MiB"`, `formatViews(n) -> "405 views"`, `formatDate(iso) -> "Jul 3, 2026, 6:00 PM"` (port the legacy implementations verbatim from `src/app.js:3655-3778` so output strings do not change).
  - `parseRoute(pathname, search) -> {name, ...params}` — pure port of legacy `currentRoute()` (`src/app.js:182-233`), same route names: `public, publicLibrary, publicGame, about, publicUser, library, clip, admin, account, profile, login, resetPassword`.
  - `createStore(initial)` -> `{get, set, update, subscribe}`; `session` store `{user, csrfToken, ready}`; `toasts` store + `toast(message, {actionLabel, onAction, timeoutMs})`; `useStore(store)` Preact hook.

- [ ] **Step 1: Write the failing tests**

`tests/format.test.mjs`:
```js
import test from "node:test";
import assert from "node:assert/strict";
import { formatDuration, formatBytes, formatViews } from "../src/lib/format.js";

test("formatDuration renders m:ss from ms", () => {
  assert.equal(formatDuration(58_000), "0:58");
  assert.equal(formatDuration(92_000), "1:32");
  assert.equal(formatDuration(null), "Unknown");
});
test("formatBytes matches legacy MiB/GiB output", () => {
  assert.equal(formatBytes(324 * 1024 * 1024), "324.0 MiB");
  assert.equal(formatBytes(null), "Unknown");
});
test("formatViews pluralizes", () => {
  assert.equal(formatViews(1), "1 view");
  assert.equal(formatViews(405), "405 views");
});
```

`tests/routes.test.mjs`:
```js
import test from "node:test";
import assert from "node:assert/strict";
import { parseRoute } from "../src/lib/routes.js";

test("parseRoute maps every route", () => {
  assert.deepEqual(parseRoute("/c/c_abc", ""), { name: "public", shareId: "c_abc" });
  assert.equal(parseRoute("/", "").name, "publicLibrary");
  assert.deepEqual(parseRoute("/game/VALORANT", "").game, "VALORANT");
  assert.deepEqual(parseRoute("/clip/01ABC", ""), { name: "clip", clipId: "01ABC" });
  assert.equal(parseRoute("/admin", "?tab=users").tab, "users");
  assert.equal(parseRoute("/reset-password", "?token=t&invite=1").invite, true);
  assert.equal(parseRoute("/nonsense", "").name, "publicLibrary");
});
```

`tests/api.test.mjs`:
```js
import test from "node:test";
import assert from "node:assert/strict";

globalThis.window = new EventTarget();
const { api, ApiError, setCsrfToken } = await import("../src/lib/api.js");

test("api parses json, sets CSRF on mutations, maps errors", async () => {
  let captured;
  globalThis.fetch = async (path, init) => {
    captured = { path, init };
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { "content-type": "application/json" } });
  };
  setCsrfToken("tok");
  await api("/api/v1/clips/x/visibility", { method: "POST", body: { visibility: "public" } });
  assert.equal(captured.init.headers.get("X-CSRF-Token"), "tok");
  assert.equal(captured.init.headers.get("Content-Type"), "application/json");

  globalThis.fetch = async () => new Response(JSON.stringify({ error: "nope" }), {
    status: 403, headers: { "content-type": "application/json" } });
  await assert.rejects(() => api("/x"), (e) => e instanceof ApiError && e.status === 403 && e.message === "nope");

  let unauthorized = 0;
  window.addEventListener("clipline:unauthorized", () => unauthorized++);
  globalThis.fetch = async () => new Response("{}", { status: 401, headers: { "content-type": "application/json" } });
  await assert.rejects(() => api("/x"));
  assert.equal(unauthorized, 1);
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
cd apps/clipline-cloud-web && npm test
```
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the modules**

`src/lib/format.js` — copy `formatDuration`, `formatRelativeTime`, `formatBytes`, `formatViews`, `formatDate`, `escapeHtml`-free (Preact escapes) from `src/app.js:3655-3778`, exporting each.

`src/lib/routes.js` — port `currentRoute()` (`src/app.js:182-233`) into pure `parseRoute(pathname, search)`; also port `safeDecodeURIComponent` (`:243`) and `publicRouteQuery` reading from a passed `URLSearchParams` instead of `window.location`.

`src/lib/api.js`:
```js
let csrfToken = null;
export function setCsrfToken(token) { csrfToken = token; }
export function getCsrfToken() { return csrfToken; }

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  let body = options.body;
  if (body && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(path, { ...options, body, credentials: "same-origin", headers, method });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("clipline:unauthorized"));
    }
    const message = typeof data === "object" && data?.error ? data.error : response.statusText;
    throw new ApiError(message || "Request failed", response.status);
  }
  return data;
}
```
(`api.test.mjs` runs without DOM: `CustomEvent` exists in Node ≥ 19, `window` is stubbed as an `EventTarget`.)

`src/lib/store.js`:
```js
import { useEffect, useState } from "preact/hooks";

export function createStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set(next) { value = next; listeners.forEach((l) => l(value)); },
    update(fn) { this.set(fn(value)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

export function useStore(store) {
  const [value, setValue] = useState(store.get());
  useEffect(() => store.subscribe(setValue), [store]);
  return value;
}

export const session = createStore({ user: null, csrfToken: null, ready: false });

export const toasts = createStore([]);
let toastId = 0;
export function toast(message, { actionLabel, onAction, timeoutMs = 5000 } = {}) {
  const id = ++toastId;
  toasts.update((list) => [...list, { id, message, actionLabel, onAction }]);
  if (timeoutMs) setTimeout(() => dismissToast(id), timeoutMs);
  return id;
}
export function dismissToast(id) {
  toasts.update((list) => list.filter((t) => t.id !== id));
}
```

Add to `package.json` scripts: `"test": "node --test tests/"`.

- [ ] **Step 4: Run tests, verify pass; commit**

```bash
npm test  # expected: all pass
git add apps/clipline-cloud-web && git commit -m "feat(web): core runtime modules (api, format, routes, stores) with tests"
```

---

### Task 4: App shell — entry, router, TopBar, TabBar, toasts, preview harness

**Files:**
- Create: `apps/clipline-cloud-web/src/main.js`
- Create: `apps/clipline-cloud-web/src/lib/html.js`
- Create: `apps/clipline-cloud-web/src/lib/icons.js`
- Create: `apps/clipline-cloud-web/src/lib/router.js`
- Create: `apps/clipline-cloud-web/src/components/TopBar.js`
- Create: `apps/clipline-cloud-web/src/components/TabBar.js`
- Create: `apps/clipline-cloud-web/src/components/ToastHost.js`
- Create: `apps/clipline-cloud-web/src/preview.html`
- Append: `apps/clipline-cloud-web/src/ui.css` (shell styles)

**Interfaces:**
- Consumes: Task 3 modules.
- Produces:
  - `html` — bound htm tag: `import { html } from "../lib/html.js"`.
  - `navigate(path)`; `useRoute() -> route object` (hash-shim aware for preview.html).
  - `icon(name)` returning an inline SVG vnode; names = legacy icon set (`src/app.js:53-92`).
  - `<Shell>`: TopBar (wordmark, Feed/Library/Games/Admin links, search form → `/search?q=`, avatar menu with Profile/Account/Admin/Sign out), TabBar (mobile bottom tabs: Feed/Library/Search/Profile), `<main>` slot, ToastHost. Pages are functions `({ route }) => vnode` registered in `PAGES` map in `main.js`.
  - Page registry: routes not yet ported render `<LegacyRedirect>` (a full-page note linking to `/` — only reachable in preview mode pre-cutover).

- [ ] **Step 1: `src/lib/html.js` + `src/lib/icons.js`**

```js
// html.js
import { h } from "preact";
import htm from "htm";
export const html = htm.bind(h);
```

`icons.js`: port the `icons` map from `src/app.js:53-92` verbatim, and:
```js
import { html } from "./html.js";
import { icons } from "./icon-paths.js"; // the ported map (same file is fine)
export function icon(name, { size = 18 } = {}) {
  return html`<svg viewBox="0 0 24 24" width=${size} height=${size} fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" dangerouslySetInnerHTML=${{ __html: icons[name] || "" }} />`;
}
```

- [ ] **Step 2: `src/lib/router.js`**

```js
import { useEffect, useState } from "preact/hooks";
import { parseRoute } from "./routes.js";

const isPreview = () => window.location.pathname === "/preview.html";

function readLocation() {
  if (isPreview()) {
    const hash = window.location.hash.slice(1) || "/";
    const [pathname, search = ""] = hash.split("?");
    return { pathname, search: search ? `?${search}` : "" };
  }
  return { pathname: window.location.pathname, search: window.location.search };
}

const listeners = new Set();
export function navigate(path) {
  if (isPreview()) window.location.hash = path;
  else window.history.pushState({}, "", path);
  emit();
}
function emit() {
  const { pathname, search } = readLocation();
  const route = parseRoute(pathname, search);
  listeners.forEach((l) => l(route));
}
window.addEventListener("popstate", emit);
window.addEventListener("hashchange", emit);

export function useRoute() {
  const { pathname, search } = readLocation();
  const [route, setRoute] = useState(() => parseRoute(pathname, search));
  useEffect(() => { listeners.add(setRoute); return () => listeners.delete(setRoute); }, []);
  return route;
}

// intercept plain <a href> clicks inside the app for SPA navigation
export function onLinkClick(event) {
  const a = event.target.closest("a[href^='/']");
  if (!a || a.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(a.getAttribute("href"));
}
```

- [ ] **Step 3: Shell components**

`components/TopBar.js`:
```js
import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";
import { session, useStore } from "../lib/store.js";
import { navigate } from "../lib/router.js";
import { useState } from "preact/hooks";

export function TopBar({ active }) {
  const { user } = useStore(session);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const nav = [
    ["feed", "/", "Feed"],
    ["library", "/library", "Library", !!user],
    ["games", "/games", "Games"],
    ["admin", "/admin", "Admin", isAdmin],
  ].filter(([, , , show]) => show !== false);

  const onSearch = (event) => {
    event.preventDefault();
    const q = new FormData(event.target).get("q")?.toString().trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return html`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${nav.map(([key, href, label]) => html`
        <a class=${key === active ? "topnav-on" : ""} href=${href}>${label}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${onSearch}>
      <input class="input" name="q" placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${user
      ? html`<div class="avatar-wrap">
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${menuOpen}
            onClick=${() => setMenuOpen(!menuOpen)}>
            <span class="avatar">${(user.display_name || user.username)[0].toUpperCase()}</span>
          </button>
          ${menuOpen && html`<div class="menu" role="menu" onClick=${() => setMenuOpen(false)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${isAdmin && html`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${signOut}>Sign out</button>
          </div>`}
        </div>`
      : html`<a class="btn" href="/login">${icon("lock", { size: 14 })} Sign in</a>`}
  </header>`;
}

async function signOut() {
  const { api } = await import("../lib/api.js");
  try { await api("/api/v1/auth/logout", { method: "POST" }); } catch {}
  session.set({ user: null, csrfToken: null, ready: true });
  navigate("/login");
}
```

`components/TabBar.js` (mobile only, hidden ≥720px by CSS):
```js
import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";
export function TabBar({ active }) {
  const tabs = [
    ["feed", "/", "home", "Feed"],
    ["library", "/library", "library", "Library"],
    ["search", "/search", "search", "Search"],
    ["profile", "/profile", "user", "Profile"],
  ];
  return html`<nav class="tabbar" aria-label="Primary">
    ${tabs.map(([key, href, ic, label]) => html`
      <a class=${key === active ? "tab-on" : ""} href=${href}>${icon(ic)}<span>${label}</span></a>`)}
  </nav>`;
}
```

`components/ToastHost.js`:
```js
import { html } from "../lib/html.js";
import { toasts, dismissToast, useStore } from "../lib/store.js";
export function ToastHost() {
  const list = useStore(toasts);
  return html`<div class="toasts" role="status" aria-live="polite">
    ${list.map((t) => html`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel && html`<button class="toast-action"
        onClick=${() => { t.onAction?.(); dismissToast(t.id); }}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${() => dismissToast(t.id)}>✕</button>
    </div>`)}
  </div>`;
}
```

- [ ] **Step 4: `src/main.js` entry + `src/preview.html`**

```js
import { render } from "preact";
import { html } from "./lib/html.js";
import { api, setCsrfToken } from "./lib/api.js";
import { session, useStore } from "./lib/store.js";
import { useRoute, onLinkClick, navigate } from "./lib/router.js";
import { TopBar } from "./components/TopBar.js";
import { TabBar } from "./components/TabBar.js";
import { ToastHost } from "./components/ToastHost.js";

const PAGES = {
  // filled in by later tasks:
  // publicLibrary: FeedPage, publicGame: FeedPage, library: LibraryPage, …
};

const NAV_KEY = { publicLibrary: "feed", publicGame: "feed", games: "games",
  library: "library", clip: "library", admin: "admin", profile: "profile" };

function LegacyRedirect({ route }) {
  return html`<main class="page"><p class="kicker">Not ported yet</p>
    <p>Route <code>${route.name}</code> still renders in the legacy app — open it from
    <a href="/">the served site</a>.</p></main>`;
}

function App() {
  const route = useRoute();
  const { ready } = useStore(session);
  if (!ready) return html`<div class="boot">Loading…</div>`;
  const Page = PAGES[route.name] || LegacyRedirect;
  const bare = route.name === "login" || route.name === "resetPassword";
  return html`<div class="ui" onClick=${onLinkClick}>
    ${!bare && html`<${TopBar} active=${NAV_KEY[route.name] || ""} />`}
    <${Page} route=${route} />
    ${!bare && html`<${TabBar} active=${NAV_KEY[route.name] || ""} />`}
    <${ToastHost} />
  </div>`;
}

window.addEventListener("clipline:unauthorized", () => {
  session.set({ user: null, csrfToken: null, ready: true });
  if (!["login", "resetPassword", "public", "publicLibrary"].includes(
    (PAGES.currentRouteName || ""))) navigate("/login");
});

(async () => {
  try {
    const me = await api("/api/v1/auth/me");
    setCsrfToken(me.csrf_token);
    session.set({ user: me.user, csrfToken: me.csrf_token, ready: true });
  } catch {
    session.set({ user: null, csrfToken: null, ready: true });
  }
  render(html`<${App} />`, document.querySelector("#app"));
})();
```

`src/preview.html` — copy of `index.html` with `<script type="module" src="/main.js">` and title `Clipline Cloud (preview)`.

- [ ] **Step 5: Shell CSS** — append to `ui.css`: `.topbar` (flex, 14px 28px padding, bottom hairline `var(--line)`), `.wordmark b { color: var(--highlight) }`, `.topnav a` (13.5px, `--muted`, active `--ink` + 2px `--accent` underline via `border-bottom`), `.topsearch { margin-left: auto }` with 200px input, `.avatar` (28px circle, `linear-gradient(135deg, var(--accent), var(--highlight))`), `.menu` (absolute, `--surface-raised`, `--shadow-float`), `.tabbar` (fixed bottom, 4 equal tabs, `display:none` at ≥720px; at <720px hide `.topnav`/`.topsearch`), `.toasts` (fixed bottom-center, above tabbar), `.toast` (`--surface-raised`, hairline, float shadow), `.page { max-width: 1200px; margin: 0 auto; padding: 24px 28px; }`, `.boot` centered.

- [ ] **Step 6: Build, verify shell in preview harness, commit**

```bash
npm run build --prefix apps/clipline-cloud-web
```
Open `http://127.0.0.1:18080/preview.html` (signed in): topbar with wordmark/nav/search/avatar renders, menu opens/closes, "Not ported yet" body, toasts area empty. At 390px width the tab bar replaces the top nav. Legacy `/` unchanged.

```bash
npm test && git add apps/clipline-cloud-web && git commit -m "feat(web): preact app shell with router, topbar, tabbar, toasts, preview harness"
```

---

### Task 5: ClipCard + live hover preview + skeletons/empty states

**Files:**
- Create: `apps/clipline-cloud-web/src/components/ClipCard.js`
- Create: `apps/clipline-cloud-web/src/components/HoverPreview.js`
- Create: `apps/clipline-cloud-web/src/components/EmptyState.js`
- Append: `apps/clipline-cloud-web/src/ui.css`

**Interfaces:**
- Consumes: `html`, `formatDuration/formatRelativeTime/formatViews`, `icon`.
- Produces:
  - `<ClipCard clip href selectable selected onToggleSelect showVisibility showAuthor />` — `clip` uses public/library API fields: `title, game_name, duration_ms, view_count, uploaded_at, thumbnail_url, media_url (optional), visibility, owner {username, display_name} (public lists)`.
  - `<HoverPreview src poster>` — renders `<img>`; on pointerenter (after 300 ms, pointer-fine devices, no reduced-motion/Save-Data, `src` truthy) swaps to muted looping `<video preload="none" playsinline>` with a progress bar; tears down on pointerleave. Exports module-level guard so only one preview plays at a time.
  - `<EmptyState icon title body action>` block.

- [ ] **Step 1: `HoverPreview.js`**

```js
import { html } from "../lib/html.js";
import { useRef, useState } from "preact/hooks";

let activeTeardown = null;
const canPreview = () =>
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  !navigator.connection?.saveData;

export function HoverPreview({ src, poster, alt = "" }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  const videoRef = useRef(null);

  const stop = () => {
    clearTimeout(timer.current);
    setPlaying(false);
    setProgress(0);
    activeTeardown = null;
  };
  const onEnter = () => {
    if (!src || !canPreview()) return;
    timer.current = setTimeout(() => {
      activeTeardown?.();
      activeTeardown = stop;
      setPlaying(true);
    }, 300);
  };
  const onTime = (e) => {
    const v = e.target;
    if (v.duration) setProgress(v.currentTime / v.duration);
  };

  return html`<span class="hover-preview" onPointerEnter=${onEnter} onPointerLeave=${stop}>
    ${playing
      ? html`<video ref=${videoRef} src=${src} poster=${poster} muted loop autoplay
          playsinline preload="none" onTimeUpdate=${onTime} />`
      : html`<img src=${poster} alt=${alt} loading="lazy" />`}
    ${playing && html`<span class="preview-scrub"><span style=${`width:${progress * 100}%`} /></span>`}
  </span>`;
}
```

- [ ] **Step 2: `ClipCard.js`**

```js
import { html } from "../lib/html.js";
import { formatDuration, formatRelativeTime, formatViews } from "../lib/format.js";
import { HoverPreview } from "./HoverPreview.js";

export function ClipCard({ clip, href, selectable = false, selected = false,
  onToggleSelect, showVisibility = false, showAuthor = false }) {
  const author = clip.owner?.display_name || clip.owner?.username || clip.owner_username;
  const meta = [
    clip.game_name && html`<em>${clip.game_name}</em>`,
    showAuthor && author,
    clip.view_count != null && formatViews(clip.view_count),
    clip.uploaded_at && formatRelativeTime(clip.uploaded_at),
  ].filter(Boolean);

  return html`<article class=${`clip-card ${selected ? "is-selected" : ""} ${selectable ? "is-selectable" : ""}`}>
    <a class="card-thumb" href=${href} tabindex="-1" aria-hidden="true">
      <${HoverPreview} src=${clip.media_url} poster=${clip.thumbnail_url} />
      ${clip.duration_ms != null && html`<span class="dur-pill">${formatDuration(clip.duration_ms)}</span>`}
      ${showVisibility && html`<span class=${`badge badge-${clip.visibility} card-vis`}>${clip.visibility}</span>`}
    </a>
    ${selectable && html`<label class="card-check">
      <input type="checkbox" checked=${selected} aria-label=${`Select ${clip.title}`}
        onChange=${() => onToggleSelect?.(clip.id)} />
    </label>`}
    <h3 class="card-title"><a href=${href}>${clip.title}</a></h3>
    <p class="card-meta">${meta.map((m, i) => html`${i > 0 && " · "}${m}`)}</p>
  </article>`;
}
```

- [ ] **Step 3: `EmptyState.js`**

```js
import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";
export function EmptyState({ name = "film", title, body, action }) {
  return html`<div class="empty">
    <div class="empty-icon">${icon(name, { size: 28 })}</div>
    <h3>${title}</h3>
    ${body && html`<p>${body}</p>`}
    ${action}
  </div>`;
}
```

- [ ] **Step 4: CSS** — append: `.clip-card` (title 13.5px/600, meta 11.5px `--muted` with `em { color: var(--highlight); font-style: normal }`), `.card-vis { position:absolute; left:8px; top:8px }`, `.card-check` (absolute right/top 8px, hidden until `.is-selectable:hover` or `.is-selected`, always visible when any selected via parent class `.selecting`), `.hover-preview` + `.preview-scrub` (3px bottom bar, fill `--highlight`), `.card-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px }` with 2-col ≤1100px / 1-col ≤640px, `.skeleton` shimmer block (aspect 16/9 + two text bars, `@media (prefers-reduced-motion: reduce)` static), `.empty` (centered, 48px padding, faint icon circle).

- [ ] **Step 5: Verify in preview, commit** — temporarily register a scratch page in `PAGES` rendering 8 `ClipCard`s from `/api/v1/public/clips` (delete before commit), check hover preview swap + single-active-preview + reduced-motion off-switch (toggle in devtools rendering emulation). Then:

```bash
npm test && npm run build --prefix apps/clipline-cloud-web
git add apps/clipline-cloud-web && git commit -m "feat(web): clip card with live hover preview, empty states, skeletons"
```

---

### Task 6: Feed page (hero spotlight + grid) and Games index

**Files:**
- Create: `apps/clipline-cloud-web/src/pages/feed.js`
- Create: `apps/clipline-cloud-web/src/pages/games.js`
- Modify: `apps/clipline-cloud-web/src/main.js` (register `publicLibrary`, `publicGame`, `games` pages; add `games` route)
- Modify: `apps/clipline-cloud-web/src/lib/routes.js` (`/games` → `{name:"games"}`; keep `/search` under `publicLibrary`)
- Modify: `apps/clipline-cloud-web/tests/routes.test.mjs` (cover `/games`)
- Append: `apps/clipline-cloud-web/src/ui.css`

**Interfaces:**
- Consumes: `ClipCard`, `EmptyState`, `api`, format helpers, `useRoute`/`navigate`.
- Produces: `FeedPage({route})`, `GamesPage()`. Data: `GET /api/v1/public/clips?sort&game&q&page` (legacy param builder `publicLibraryParams`, `src/app.js:1050-1062`) and `GET /api/v1/public/games`.

- [ ] **Step 1: `pages/feed.js`** — structure (complete component; loading/error states included):

```js
import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { navigate } from "../lib/router.js";
import { formatDuration, formatRelativeTime, formatViews } from "../lib/format.js";
import { ClipCard } from "../components/ClipCard.js";
import { EmptyState } from "../components/EmptyState.js";

const SORTS = [["uploaded_at_desc", "Uploaded · newest"], ["uploaded_at_asc", "Uploaded · oldest"],
  ["views_desc", "Most viewed"], ["duration_desc", "Longest"]]; // keep exactly the legacy sort keys (src/app.js:1127-1134)

export function FeedPage({ route }) {
  const query = { sort: "uploaded_at_desc", page: 1, q: "", ...route.query,
    game: route.name === "publicGame" ? route.game : route.query?.game || "" };
  const [data, setData] = useState(null);   // { clips, total_pages, … } same shape legacy uses
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    setData(null); setError(null);
    const params = new URLSearchParams();
    if (query.sort !== "uploaded_at_desc") params.set("sort", query.sort);
    if (query.game) params.set("game", query.game);
    if (query.q) params.set("q", query.q);
    if (query.page > 1) params.set("page", String(query.page));
    api(`/api/v1/public/clips${params.size ? `?${params}` : ""}`)
      .then((d) => live && setData(d)).catch((e) => live && setError(e));
    return () => { live = false; };
  }, [route]);

  useEffect(() => { api("/api/v1/public/games").then((d) => setGames(d.games || [])).catch(() => {}); }, []);

  if (error) return html`<main class="page"><${EmptyState} name="alert" title="Couldn't load the feed" body=${error.message} /></main>`;
  const clips = data?.clips;
  const [hero, ...rest] = clips || [];
  const setQ = (patch) => navigate(feedPath({ ...query, page: 1, ...patch }));

  return html`<main class="page">
    ${clips === undefined || clips === null
      ? html`<div class="card-grid">${Array.from({ length: 8 }, () => html`<div class="skeleton" />`)}</div>
      : clips.length === 0
      ? html`<${EmptyState} name="film" title="No public clips yet"
          body="Clips shared as public from a library will show up here." />`
      : html`
        <p class="kicker">Now playing on this server</p>
        <section class="hero">
          <a class="hero-main card-thumb" href=${shareHref(hero)}>
            <img src=${hero.thumbnail_url} alt="" loading="lazy" />
            <span class="hero-caption">▶ ${hero.title} — ${hero.game_name} · ${formatDuration(hero.duration_ms)}</span>
          </a>
          <div class="hero-side">
            ${rest.slice(0, 3).map((c) => html`<a class="hero-row" href=${shareHref(c)}>
              <img src=${c.thumbnail_url} alt="" loading="lazy" />
              <span><b>${c.title}</b>
                <small>${c.owner?.display_name || c.owner?.username} · ${c.game_name} · ${formatViews(c.view_count)}</small></span>
            </a>`)}
          </div>
        </section>
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${query.sort} onChange=${(e) => setQ({ sort: e.target.value })}>
            ${SORTS.map(([v, l]) => html`<option value=${v}>${l}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${!query.game ? "chip-on" : ""}`} onClick=${() => setQ({ game: "" })}>All</button>
            ${games.slice(0, 6).map((g) => html`<button
              class=${`chip ${query.game === g.name ? "chip-on" : ""}`}
              onClick=${() => setQ({ game: g.name })}>${g.name}</button>`)}
          </div>
        </div>
        <div class="card-grid">
          ${rest.slice(3).map((c) => html`<${ClipCard} clip=${c} href=${shareHref(c)} showAuthor />`)}
        </div>
        ${pager(data, query, setQ)}`}
  </main>`;
}

function shareHref(clip) { return `/c/${encodeURIComponent(clip.public_share_id || clip.share_id)}`; }
function feedPath(q) { /* port publicLibraryPath (src/app.js:1063-1089) unchanged */ }
function pager(data, query, setQ) { /* port publicPager (src/app.js:1108-1121) to Preact buttons */ }
```

Before coding, confirm the exact response field names with `curl -s http://127.0.0.1:18080/api/v1/public/clips | head -c 600` and `…/public/games` — use what the API actually returns (the legacy renderers `publicClipCard` `src/app.js:1178-1209` and `publicGameOptions` `:1145-1164` show every field in use). Hero uses the first clip of the default sort; when a `game`/`q` filter or `page>1` is active, skip the hero and render all clips in the grid.

- [ ] **Step 2: `pages/games.js`** — grid of tiles from `/api/v1/public/games` (fields per legacy `publicGameOptions`): tile = latest thumbnail if the API provides one, else gradient block with initial; name + clip count; links to `/game/<name>`. Route `/games` added to `parseRoute` + test updated + `NAV_KEY.games`.

- [ ] **Step 3: CSS** — `.hero { display:grid; grid-template-columns:1.6fr 1fr; gap:18px }` (stack ≤900px), `.hero-caption` (absolute bottom-left, `--scrim` pill, 14px/600), `.hero-row` (104px thumb + two-line text), `.feed-toolbar` (flex baseline: h2 17px/700, sort select, chips with `margin-left:auto`), `.game-tile`.

- [ ] **Step 4: Verify + commit** — `preview.html#/` shows hero + 3 side rows + grid + chips against seeded data; chip filters/sort/pager update the list and URL hash; empty state renders when filtering to a game with no clips (`#/game/Nope`). `npm test` passes.

```bash
git add apps/clipline-cloud-web && git commit -m "feat(web): feed page with hero spotlight and games index"
```

---

### Task 7: Library page — grid/rows, filter popover, selection + floating bulk bar

**Files:**
- Create: `apps/clipline-cloud-web/src/pages/library.js`
- Create: `apps/clipline-cloud-web/src/components/Popover.js`
- Create: `apps/clipline-cloud-web/src/components/BulkBar.js`
- Create: `apps/clipline-cloud-web/src/components/ConfirmDialog.js`
- Modify: `apps/clipline-cloud-web/src/main.js` (register `library`)
- Append: `apps/clipline-cloud-web/src/ui.css`

**Interfaces:**
- Consumes: `ClipCard` (with `selectable`), `api`, `toast`, format helpers.
- Produces:
  - `<Popover trigger content onClose>` — anchored panel, closes on Escape/outside click, focus moves in on open and restores on close.
  - `<BulkBar count onPublic onPrivate onCopyLinks onDelete onClear />` — fixed bottom-center floating bar.
  - `<ConfirmDialog open title body confirmLabel onConfirm onCancel danger>` — wraps native `<dialog>`.
  - `LibraryPage`. Data: `GET /api/v1/clips?<params>` (port `libraryParams`, `src/app.js:765-786` — keys `sort game source_type visibility status q from to min_duration_seconds max_duration_seconds min_size_mib max_size_mib`), `POST /api/v1/clips/{id}/visibility {visibility}`, `POST /api/v1/clips/bulk-delete {clip_ids}`.

- [ ] **Step 1: Components** — implement `Popover`, `BulkBar`, `ConfirmDialog` exactly as specced:

```js
// BulkBar.js
import { html } from "../lib/html.js";
export function BulkBar({ count, onPublic, onPrivate, onCopyLinks, onDelete, onClear }) {
  if (!count) return null;
  return html`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${count} selected</b>
    <button class="btn" onClick=${onPublic}>Make public</button>
    <button class="btn" onClick=${onPrivate}>Make private</button>
    <button class="btn" onClick=${onCopyLinks}>Copy links</button>
    <button class="btn btn-danger" onClick=${onDelete}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${onClear}>✕</button>
  </div>`;
}
```

`ConfirmDialog` uses `<dialog>` + `ref` calling `showModal()`/`close()` in `useEffect` on `open`; confirm button autofocuses; `onCancel` on `cancel` event. `Popover` renders `position:absolute` panel inside a `position:relative` wrapper; `useEffect` adds document `pointerdown` (outside → close) and `keydown` Escape listeners while open.

- [ ] **Step 2: `LibraryPage`** — state: `query` (ported param object, defaults as legacy `state.libraryQuery`, `src/app.js:28-42`), `view` (`"grid"|"rows"`, localStorage key `clipline.libraryView`), `selected` (Set of clip ids), `confirm` (null | {…}), `data/error`. Layout:

  - Header: `Library` + `${total} clips · ${formatBytes(total_size_bytes)} used` (fields per legacy `libraryView` `src/app.js:787-844`; confirm with `curl -s -b cookie /api/v1/clips | head -c 600`), Grid/Rows toggle.
  - Toolbar: title-search input (debounced 300 ms → setQuery), sort select (legacy sort keys `src/app.js:793-800`), `Filters` button with active-count badge opening a `Popover` containing the remaining fields (visibility, status, source, from/to dates, min/max duration, min/max size — same input types as legacy `libraryView` filter panel `src/app.js:801-843`) with per-change apply; game chips inline (games derived from loaded clips' `game_name` values, deduped, top 6 by count).
  - Grid view: `.card-grid.selecting=${selected.size>0}` of `ClipCard selectable selected showVisibility` with `href=/clip/{id}`; live preview uses `clip.media_url` when the API provides it for owner listings (verify with curl; omit `src` otherwise — card then shows static thumb).
  - Rows view: table with columns thumb (64px), title (link), game, visibility badge, size (`formatBytes`), duration, uploaded (`formatDate`); header cells with `aria-sort`, clicking toggles the matching sort key.
  - Selection: card checkbox toggles id; `BulkBar` handlers:
    - `onPublic`/`onPrivate`: optimistic — snapshot affected clips, patch local state, fire `POST /api/v1/clips/{id}/visibility` for each selected id (sequentially, ≤4 in flight), then `toast("Made N clips public", {actionLabel:"Undo", onAction: revert})` where revert re-POSTs the snapshot visibilities; on any failure, roll back the failed ids and `toast(error.message)`.
    - `onCopyLinks`: for clips with `public_share_id`, `navigator.clipboard.writeText(joined urls)`; toast count copied (and how many skipped as private).
    - `onDelete`: `ConfirmDialog` ("Delete N clips? Public links stop working immediately.") → `POST /api/v1/clips/bulk-delete { clip_ids }` (payload shape per legacy `bindBulkEvents`, `src/app.js:1441-1520`), refresh list, toast.
  - Empty library: `EmptyState` with "Connect the Clipline desktop app to start uploading" + link `/about`.

- [ ] **Step 3: CSS** — `.bulkbar` (fixed, bottom 20px desktop / above tabbar mobile, centered, `--surface-raised`, `--shadow-float`, hairline `--line-strong`), `.popover` panel (320px, raised surface, 12px padding, labeled 2-col field grid), `.filter-badge { color: var(--highlight) }`, `.lib-table` styles, checkbox reveal rules (`.is-selectable:hover .card-check, .selecting .card-check, .is-selected .card-check { opacity:1 }` default 0, but **always visible when :focus-visible within**).

- [ ] **Step 4: Verify + commit** — in `preview.html#/library` (signed in as admin): filter popover applies + badge counts, grid/rows toggle persists across reload, select 3 → bulk bar; make-private flips badges instantly and Undo restores; delete flow removes rows after confirm; keyboard: tab to a card, space toggles checkbox, bulk bar reachable. `npm test` passes.

```bash
git add apps/clipline-cloud-web && git commit -m "feat(web): library page with filter popover, selection and floating bulk bar"
```

---

### Task 8: Watch page — player chrome, owner action row, comments, up-next

**Files:**
- Create: `apps/clipline-cloud-web/src/components/Player.js`
- Create: `apps/clipline-cloud-web/src/pages/watch.js`
- Create: `apps/clipline-cloud-web/src/components/Comments.js`
- Modify: `apps/clipline-cloud-web/src/main.js` (register `clip` and `public` routes → `WatchPage`)
- Append: `apps/clipline-cloud-web/src/ui.css`

**Interfaces:**
- Consumes: `player-core.js` helpers (`clampTime formatClock formatReadout normalizeMarkers nextMarker previousMarker percentFor playerKeyIntent secondsFromMilliseconds` — same imports as legacy `src/app.js:1-12`), `api`, `toast`, `SegmentedControl` pattern (`.seg` classes), `ConfirmDialog`, `ClipCard` styles.
- Produces:
  - `<Player src poster durationMs markers>` — chrome: scrubber (buffered + played + hover-time tooltip), play/pause, marker prev/next (when markers exist), time readout, speed menu (0.25–2×, button + popover, not `<select>`), volume slider (persist `clipline.playerVolume`), captions toggle when `clip.captions_url` exists (match legacy behavior in `clipPlayerView` `src/app.js:1572-1638`), fullscreen, theater toggle. Keyboard (via `playerKeyIntent` + additions): Space/K play, ←/→ ±5s, J/L ±10s, M mute, F theater, Esc exits theater. Theater = `.theater` class on the page root (player expands edge-to-edge, chrome fades after 2s idle), persisted `clipline.clipTheaterMode`.
  - `WatchPage({route})` — one component for `route.name === "clip"` (fetch `GET /api/v1/clips/{id}`, owner tools if `session.user` owns it or is admin, per legacy `isOwner` `src/app.js:583-586`) and `route.name === "public"` (fetch `GET /api/v1/public/clips/{shareId}`, fire the view-count beacon exactly as legacy `recordPublicView` `src/app.js:2618-2632`).

- [ ] **Step 1: `Player.js`** — Preact component owning a `<video>` ref; internal state `{playing, currentTime, duration, buffered, volume, muted, rate, theater, chromeVisible}`. Port the media-event wiring from legacy `initClipPlayer` (`src/app.js:1639-2085`) into `useEffect` hooks: `timeupdate/durationchange/progress/ended/volumechange` handlers set state; scrubber is an `<input type="range">` styled as the spec bar plus a hover tooltip div positioned by `percentFor`; global `keydown` listener active while the player is mounted, skipping when `isPlayerShortcutBlockedTarget` (port `src/app.js:693-699`) matches. All chrome is inside `<div class="player">`; theater toggles class on `document.documentElement` (`clipline-theater`) and body scroll-lock.

- [ ] **Step 2: `pages/watch.js`** — layout per spec §4.3 (grid `1fr 300px`, stack ≤900px):

```js
// core structure (data plumbing follows the FeedPage pattern)
return html`<main class="page watch">
  <div>
    <${Player} src=${clip.media_url} poster=${clip.poster_url || clip.thumbnail_url}
      durationMs=${clip.duration_ms} markers=${clip.markers} />
    <div class="watch-titlerow">
      ${editingTitle
        ? html`<input class="input watch-title-input" value=${title} onBlur=${saveTitle}
            onKeyDown=${(e) => e.key === "Enter" && saveTitle(e)} />`
        : html`<h1>${clip.title} ${isOwner && html`<button class="edit-pencil"
            aria-label="Edit title" onClick=${() => setEditingTitle(true)}>✎</button>`}</h1>`}
    </div>
    <p class="watch-meta">
      ${clip.game_name && html`<a class="chip chip-on" href=${`/game/${encodeURIComponent(clip.game_name)}`}>${clip.game_name}</a>`}
      <span>${formatViews(clip.view_count)}</span> ·
      <span>Recorded ${formatDate(clip.recorded_at)}</span> ·
      <span>by ${authorName}</span>
    </p>
    ${isOwner && html`<div class="watch-actions">
      <div class="seg" role="radiogroup" aria-label="Visibility">
        ${["private", "public", "unlisted"].map((v) => html`<button role="radio"
          aria-checked=${clip.visibility === v}
          class=${`seg-item ${clip.visibility === v ? "seg-on" : ""}`}
          onClick=${() => setVisibility(v)}>${v[0].toUpperCase() + v.slice(1)}</button>`)}
      </div>
      <button class="btn btn-primary" disabled=${!shareUrl} onClick=${copyShareLink}>
        ${icon("copy", { size: 14 })} Copy share link</button>
      <div class="watch-more">
        <button class="btn" aria-haspopup="menu" onClick=${() => setMoreOpen(!moreOpen)}>⋯</button>
        ${moreOpen && html`<div class="menu" role="menu">
          <button class="menu-danger" role="menuitem" onClick=${() => setConfirmDelete(true)}>Delete clip</button>
        </div>`}
      </div>
    </div>`}
    <div class="watch-desc">…description with owner inline edit (textarea appears on ✎, saves on blur/Ctrl+Enter via the same endpoint legacy bindClipDetailEvents uses, src/app.js:2172-2265)…</div>
    <button class="details-strip" aria-expanded=${detailsOpen} onClick=${() => setDetailsOpen(!detailsOpen)}>
      <span><b>${formatDuration(clip.duration_ms)}</b> length</span>
      <span><b>${formatBytes(clip.file_size_bytes)}</b></span>
      <span><b>${clip.height}p${Math.round(clip.fps || 0) || ""}</b></span>
      <span><b>${clip.video_codec}/${clip.audio_codec}</b> ${clip.container}</span>
      <span class="details-chev">${detailsOpen ? "▴ less" : "▾ more"}</span>
    </button>
    ${detailsOpen && html`<dl class="details-full">…all rows from legacy clipDetailView details table (src/app.js:2086-2171): recorded, uploaded, dimensions, fps, container, codecs, checksum, source…</dl>`}
    <${Comments} clip=${clip} />
  </div>
  <aside class="upnext">
    <h4 class="kicker">Up next</h4>
    ${upNext.map((c) => html`…hero-row-style item linking to /c/…`)}
  </aside>
</main>`;
```

  - `setVisibility(v)`: optimistic patch + `POST /api/v1/clips/{id}/visibility {visibility: v}`; response includes the share id/url (legacy `src/app.js:353-364, 462-464`) — update `shareUrl`; toast with Undo (restores previous visibility). Copy-link disabled when private.
  - Delete: `ConfirmDialog`, then the same DELETE endpoint legacy uses (`bindClipDetailEvents`), then `navigate("/library")` + toast.
  - Visitor (`public` route): no action row/pencils; comments use the public endpoints exactly as legacy `publicCommentsView/bindPublicShareEvents` (`src/app.js:2420-2617`) — port create/reply/delete semantics unchanged.
  - "Up next": `GET /api/v1/public/clips` first 8 excluding current.

- [ ] **Step 3: `Comments.js`** — one component both modes: list (threaded replies per legacy `publicCommentTree` `src/app.js:2450-2530`), composer for signed-in users, delete for comment author/admin. Port endpoint paths verbatim from the legacy bindings.

- [ ] **Step 4: CSS** — `.watch` grid, `.watch-actions` row between hairlines, `.details-strip` (full-width flex, 12px font, `--muted`, `b { color: var(--ink) }`), `.player` chrome (gradient scrim bottom, 4px scrub track with `--accent` fill + `--highlight` thumb, controls row 13px), `.theater .player { position: fixed; inset: 0; z-index: 50; border-radius: 0 }` with chrome fade (`opacity` transition, disabled under reduced-motion), `.upnext` list, `.edit-pencil` (faint, visible on hover/focus).

- [ ] **Step 5: Verify + commit** — with seeded data the media 404s: verify chrome renders over the poster, keyboard shortcuts drive state (mute icon flips, time readout changes disabled without media — acceptable), theater toggles + persists, segmented visibility round-trips against the API (badge in library reflects change after navigation), copy-share-link writes a working `/c/…` URL, delete flow works, comments post/render/delete on a public clip, visitor view (log out, open `/preview.html#/c/<shareId>`) hides owner controls. `npm test` passes.

```bash
git add apps/clipline-cloud-web && git commit -m "feat(web): unified watch page with new player chrome, owner action row, comments"
```

---

### Task 9: Login / reset-password / invite pages

**Files:**
- Create: `apps/clipline-cloud-web/src/pages/login.js`
- Modify: `apps/clipline-cloud-web/src/main.js` (register `login`, `resetPassword`)
- Append: `apps/clipline-cloud-web/src/ui.css`

**Interfaces:**
- Consumes: `api`, `session`, `navigate`, `toast`.
- Produces: `LoginPage`, `ResetPasswordPage` (also handles invite mode `route.invite === true`, including the invite-token preflight the legacy `renderInviteResetPassword` does, `src/app.js:457-490`).

- [ ] **Step 1: `LoginPage`** — split layout: left montage panel fetches `/api/v1/public/clips` (limit 6; on error or 0 clips render the pure gradient) and absolutely positions the 6 thumbnails in a loose collage under a `linear-gradient` navy/blue wash, with `Your clips. Your server.` + `${total} clips · ${users} players on this instance` when available; right panel = icon + wordmark, username/password `input`s, primary submit, admin hint line. Submit: `POST /api/v1/auth/login {username, password}` → `setCsrfToken`, `session.set`, `navigate("/library")`; error renders inline `<p class="form-error" role="alert">`. Left panel `display:none` ≤800px.

- [ ] **Step 2: `ResetPasswordPage`** — same right-panel shell; port legacy flows verbatim: token redemption `POST /api/v1/auth/reset-password` (`renderResetPassword` `src/app.js:389-456`), invite preflight + messaging (`:457-490`).

- [ ] **Step 3: Verify + commit** — log out; `preview.html#/login`: montage renders from seeded public clips; bad password shows inline error; good login lands on library with session loaded. Fresh-install fallback: temporarily filter montage fetch to a nonexistent game to see the gradient fallback.

```bash
git add apps/clipline-cloud-web && git commit -m "feat(web): split login with public clip montage, reset and invite flows"
```

---

### Task 10: Admin, profile, account, public user, about

**Files:**
- Create: `apps/clipline-cloud-web/src/pages/admin.js` (+ `src/pages/admin/{overview,users,settings,jobs}.js` if any file would exceed ~300 lines)
- Create: `apps/clipline-cloud-web/src/components/StatCard.js`
- Create: `apps/clipline-cloud-web/src/pages/profile.js`
- Create: `apps/clipline-cloud-web/src/pages/account.js`
- Create: `apps/clipline-cloud-web/src/pages/user.js`
- Create: `apps/clipline-cloud-web/src/pages/about.js`
- Modify: `apps/clipline-cloud-web/src/main.js` (register `admin account profile publicUser about`)
- Append: `apps/clipline-cloud-web/src/ui.css`

**Interfaces:**
- Consumes: everything above.
- Produces: `<StatCard label value sub meter>` (meter = 0..1 renders the gradient bar); pages are ports of the legacy views **with structure unchanged** — same tabs, same endpoints, same forms — restyled with the design system. Legacy sources to port from: admin `renderAdmin*` (find via `grep -n "renderAdmin" src/app.js`), profile `src/app.js:2685-2814`, account `:2815-…`, public user `:1324-1383`, about `:1384-1423`.

- [ ] **Step 1: Admin overview** — `?tab=` routing preserved (underline tabs link to `/admin?tab=users` etc.). Overview: 4 `StatCard`s — Clips (count + `+N this week` computed from list if the summary endpoint exposes it, else omit the sub), Storage (`formatBytes` + meter vs warning threshold when configured, else no meter), Users, Jobs (failed count; `--success` "all healthy" when 0) — then the full config key-value list in a 2-col `.ad-kv` grid. Users/Settings/Jobs tabs: port forms/tables 1:1 (user create/disable/quota/reset-link, settings form, jobs table) using `.btn/.input/.badge` classes.

- [ ] **Step 2: Profile/account/user/about** — direct ports restyled; public user page renders `ClipCard` grid with `showAuthor=false`; about page keeps its copy.

- [ ] **Step 3: Verify + commit** — walk every admin tab against the seeded server (create a user, generate + copy a reset link, check jobs table renders), profile avatar upload works (`uploadAvatar` port, `src/app.js:2795-2814`), `preview.html#/u/kairos` shows Kai's public clips.

```bash
git add apps/clipline-cloud-web && git commit -m "feat(web): admin stat cards and remaining page ports"
```

---

### Task 11: Cutover, legacy deletion, and final QA sweep

**Files:**
- Modify: `apps/clipline-cloud-web/src/index.html` (script → `/main.js`; boot screen gets the icon + new copy; delete `styles.css` link)
- Delete: `apps/clipline-cloud-web/src/app.js`, `apps/clipline-cloud-web/src/styles.css`, `apps/clipline-cloud-web/src/preview.html`
- Modify: `apps/clipline-cloud-web/src/main.js` (remove `LegacyRedirect` and preview shim usage if now dead)
- Modify: `apps/clipline-cloud-web/src/lib/router.js` (drop the preview-hash shim)

**Interfaces:** none new — this task removes the old world.

- [ ] **Step 1: Flip the entry** — `index.html`: `<script type="module" src="/main.js">`; boot screen: icon svg + "Loading Clipline Cloud". Remove the `styles.css` link; move any still-referenced legacy rules (search `grep -rn "class=" src/components src/pages | grep -oE 'class="[^"]*"'` against `ui.css`) into `ui.css` first.

- [ ] **Step 2: Delete legacy files and the preview shim.** Ensure `player-core.js` stays (imported by `Player.js`). Build must succeed with only `main.js` as the JS entry.

- [ ] **Step 3: Full QA sweep on the served app (not preview)** at 1440×900 and 390×844, signed in and signed out:
  - Every route: `/`, `/games`, `/game/VALORANT`, `/library`, `/clip/<id>`, `/c/<shareId>`, `/u/kairos`, `/login`, `/reset-password?token=x`, `/admin` (all 4 tabs), `/profile`, `/account`, `/about`, plus a bogus path (falls back to feed).
  - Keyboard pass: tab through feed → library selection → bulk bar; watch-page shortcuts; popover/dialog focus and Escape.
  - Reduced-motion emulation: no hover previews, no shimmer animation.
  - Console: zero errors; Network: zero requests to non-self origins; CSP violations tab empty.
  - Screenshot the five key screens (feed, library w/ selection, watch owner, login, admin) and compare against the approved mockups in `.superpowers/brainstorm/*/content/` — layout and palette should visibly match.

- [ ] **Step 4: Final checks + commit**

```bash
npm test && npm run build --prefix apps/clipline-cloud-web && npm run check:dist --prefix apps/clipline-cloud-web
cargo test -p clipline-cloud-server 2>/dev/null | tail -5   # server untouched; smoke only
git add -A apps/clipline-cloud-web
git commit -m "feat(web): cut over to redesigned Preact UI, remove legacy app"
```

---

## Self-review results

- **Spec coverage:** §2 tokens/typography → T2; §3 nav/mobile → T4; §4.1 → T6; §4.2 → T7; §4.3 → T8; §4.4 → T6; §4.5 → T9; §4.6/4.7 → T10; §5 stack/build → T1/T3/T4; §6 errors → T3 (api) + per-page error states; §7 verification → per-task verify steps + T11 sweep; §8 order preserved.
- **Known deviation:** spec §8 said "old pages render inside the new shell"; this plan uses a parallel entry + preview harness instead (cleaner: no vanilla-in-Preact bridging), with the served app staying fully legacy until T11. Usability at every boundary holds either way.
- **Port-reference steps:** several steps port legacy logic by exact line reference instead of inlining 3,800 lines; each such reference names the function, lines, and required behavior. Executors must read the referenced legacy code before writing the port.
