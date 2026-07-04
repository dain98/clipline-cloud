# Feed Hero Side-List Fill Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the three clips beside the feed's featured clip fill its height deliberately instead of stretching apart with large gaps, and polish the rows with a duration pill and hover state.

**Architecture:** Pure presentation change in the web app: the side-thumbnail width becomes a viewport-derived `clamp()` so three rows sum to the hero's height at every window width; a small markup wrap in `renderHero` adds the duration pill. No API, data, or router changes.

**Tech Stack:** Preact + htm (`apps/clipline-cloud-web`), hand-written CSS in `src/ui.css`, esbuild via `npm run build`, `node --test` suite.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-04-feed-hero-side-list-design.md`.
- Thumbnail width formula, exactly: `clamp(144px, 19.1vw - 32px, 300px)`.
- `dist/` is committed in this repo: run `npm run build` and commit `dist/` changes alongside `src/` in every task.
- The sub-900px stacked hero layout must keep working; the `@media (min-width: 1500px)` 160px override is deleted.
- No new test files: the suite covers exported pure helpers only, and these tasks add no new logic units. The gate is the existing suite staying green plus the visual checks written into each task.
- All commands below run from `apps/clipline-cloud-web/` unless a path says otherwise.

---

### Task 1: Sizing fix — side rows fill the hero column

**Files:**
- Modify: `apps/clipline-cloud-web/src/ui.css:179-197` (hero block)
- Modify (generated): `apps/clipline-cloud-web/dist/ui.css`, `apps/clipline-cloud-web/dist/main.js` (whatever `npm run build` regenerates)

**Interfaces:**
- Consumes: existing markup from `renderHero` (`.hero-side` > `.hero-row` > `img` + text `span`).
- Produces: `.hero-row img` sized by `clamp(144px, 19.1vw - 32px, 300px)`; 12px gaps. Task 2 moves this width onto a new `.hero-thumb` wrapper — keep the value identical.

- [ ] **Step 1: Update the hero CSS**

In `src/ui.css`, change these three rules (leave `.hero`, `.hero-main`, `.hero-caption`, and the `max-width: 900px` block untouched):

```css
.ui .hero-side { display: flex; flex-direction: column; gap: 12px; }
.ui .hero-row { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--ink);
  flex: 1; }
.ui .hero-row img { width: clamp(144px, 19.1vw - 32px, 300px); aspect-ratio: 16 / 9; object-fit: cover;
  border-radius: 10px; background: var(--surface); flex-shrink: 0; }
```

and delete this block entirely:

```css
@media (min-width: 1500px) {
  .ui .hero-row img { width: 160px; }
}
```

- [ ] **Step 2: Rebuild and run the suite**

Run: `npm run build && npm run check:dist && npm test`
Expected: build silent, check:dist silent, `pass 155` / `fail 0`.

- [ ] **Step 3: Visual verification in the running app**

With the local server up and the feed stubbed (Playwright route interception with 12 sample clips — same harness used during design), measure at a 1440×900 viewport:

```js
const r = (el) => Math.round(el.getBoundingClientRect().height);
({ main: r(document.querySelector('.hero-main')), side: r(document.querySelector('.hero-side')) })
```

Expected: `main` and `side` equal within ±2px (441 at 1440px). Repeat at 1720+ and ~950px widths: still equal within ±2px. At <900px width: side rows lay out horizontally (stacked mode), no overflow.

- [ ] **Step 4: Commit**

```bash
git add src/ui.css dist/
git commit -m "Size feed hero side thumbnails to fill the hero column."
```

---

### Task 2: Row polish — duration pill, hover state, type bump

**Files:**
- Modify: `apps/clipline-cloud-web/src/pages/feed.js:154-162` (`renderHero` side rows)
- Modify: `apps/clipline-cloud-web/src/ui.css` (hero block from Task 1)
- Modify (generated): `apps/clipline-cloud-web/dist/` (rebuild)

**Interfaces:**
- Consumes: Task 1's `.hero-row img` clamp width (moves verbatim onto `.hero-thumb`); existing `.dur-pill` rule (`ui.css:64`); `formatDuration` already imported in `feed.js:5`.
- Produces: side-row markup `a.hero-row > span.hero-thumb (img + span.dur-pill) + span.hero-copy (b + small)`.

- [ ] **Step 1: Update the side-row markup in `renderHero`**

In `src/pages/feed.js`, replace the side-row template:

```js
        ${sideRows.map(
          (c) => html`<a class="hero-row" href=${shareHref(c)}>
            <span class="hero-thumb">
              <img src=${publicThumbPath(c)} alt="" loading="lazy" />
              <span class="dur-pill">${formatDuration(c.duration_ms)}</span>
            </span>
            <span class="hero-copy"><b>${c.title}</b>
              <small>${clipAuthor(c)} · ${gameLabel(c)} · ${formatViews(c.view_count)}</small></span>
          </a>`
        )}
```

- [ ] **Step 2: Update the hero CSS for the new structure**

In `src/ui.css`, replace the Task 1 `.hero-row img` rule and the `.hero-row span` / `b` / `small` rules with:

```css
.ui .hero-thumb { position: relative; width: clamp(144px, 19.1vw - 32px, 300px); flex-shrink: 0; }
.ui .hero-thumb img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 10px;
  background: var(--surface); display: block; }
.ui .hero-copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ui .hero-row b { font-size: 13.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; }
.ui .hero-row small { font-size: 11.5px; color: var(--muted); overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; }
.ui .hero-row:hover b { color: var(--accent); }
```

The bare `.ui .hero-row span { … }` selector must not survive — it would also match `.hero-thumb` and `.dur-pill`.

In the `@media (max-width: 900px)` block, change `.ui .hero-row img { width: 100%; }` to:

```css
  .ui .hero-thumb { width: 100%; }
```

- [ ] **Step 3: Rebuild and run the suite**

Run: `npm run build && npm run check:dist && npm test`
Expected: build silent, check:dist silent, `pass 155` / `fail 0`.

- [ ] **Step 4: Visual verification in the running app**

Same stubbed-feed harness as Task 1. Check at 1440×900:
- `main`/`side` heights still equal within ±2px.
- Each side thumbnail shows a duration pill bottom-right (values like `5:56`, `2:38` from the stub data).
- Hovering a side row turns its title to the accent blue.
- At <900px width: stacked layout intact, thumbnails full-width with pill visible.

- [ ] **Step 5: Commit**

```bash
git add src/pages/feed.js src/ui.css dist/
git commit -m "Add duration pill and hover polish to feed hero side rows."
```
