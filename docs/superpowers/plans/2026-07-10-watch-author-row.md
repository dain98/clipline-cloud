# Watch Author Row and Avatar Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the signed-in avatar against the top-bar search field and add a linked creator identity row with a presentation-only Follow button beneath every watch-page title.

**Architecture:** Keep the change entirely in the Preact web client. Normalize owned and public author payloads with a pure `watchAuthor()` helper, render them through a focused `WatchAuthorRow` component that reuses `UserAvatar`, and use CSS for top-bar centering, responsive watch layout, and theater-mode spacing.

**Tech Stack:** Preact, `htm`, JavaScript ES modules, Node's built-in test runner, CSS, esbuild.

## Global Constraints

- Reuse `apps/clipline-cloud-web/src/components/UserAvatar.js`; do not add image assets.
- Author profile links use the existing `/u/{username}` route with `encodeURIComponent`.
- The visible author label prefers display name, then username, then `Unknown creator`.
- The Follow control is presentation-only: no request, persisted state, or click behavior.
- Render the author row on both owned and public watch routes.
- Keep game, views, and recording date in metadata; remove `by <author>`.
- Preserve the existing top-bar menu, keyboard behavior, mobile layout, and watch theater mode.
- Do not change server APIs, database schema, dependencies, or routing.

---

## File Structure

- `apps/clipline-cloud-web/src/pages/watch.js`: author normalization, author-row VNode, and watch-page integration.
- `apps/clipline-cloud-web/tests/watch.test.mjs`: pure author-model and author-row structure coverage.
- `apps/clipline-cloud-web/src/ui.css`: top-bar alignment, author-row presentation, responsive wrapping, and theater spacing.
- `apps/clipline-cloud-web/tests/ui-css.test.mjs`: focused regression checks for the required layout declarations.
- `apps/clipline-cloud-web/dist/main.js`: generated JavaScript bundle.
- `apps/clipline-cloud-web/dist/ui.css`: generated stylesheet.

---

### Task 1: Add and integrate the watch author row

**Files:**
- Modify: `apps/clipline-cloud-web/tests/watch.test.mjs`
- Modify: `apps/clipline-cloud-web/src/pages/watch.js`

**Interfaces:**
- Consumes: `UserAvatar({ user, size, className })` and existing owned/public author fields.
- Produces: `watchAuthor(routeName, clip, viewer)` returning `{ label, username, href, avatarUser }`.
- Produces: `WatchAuthorRow({ author })` returning the author-row VNode.

- [ ] **Step 1: Write failing author-model tests**

Add `watchAuthor` to the existing import destructuring in `tests/watch.test.mjs`, then add:

```js
test("watchAuthor uses the session user for an owned clip", () => {
  const viewer = {
    display_name: "Arua",
    username: "arua",
    avatar_url: "/api/v1/public/users/arua/avatar",
    updated_at: "2026-07-10T00:00:00Z",
  };
  const author = watchAuthor("clip", {}, viewer);

  assert.equal(author.label, "Arua");
  assert.equal(author.username, "arua");
  assert.equal(author.href, "/u/arua");
  assert.equal(author.avatarUser, viewer);
});

test("watchAuthor adapts public clip author fields and encodes the profile link", () => {
  const author = watchAuthor("public", {
    author_name: "Kai Clips",
    author_username: "kai+clips",
    author_avatar_url: "/api/v1/public/users/kai%2Bclips/avatar",
  });

  assert.deepEqual(author, {
    label: "Kai Clips",
    username: "kai+clips",
    href: "/u/kai%2Bclips",
    avatarUser: {
      display_name: "Kai Clips",
      username: "kai+clips",
      avatar_url: "/api/v1/public/users/kai%2Bclips/avatar",
    },
  });
});

test("watchAuthor keeps a public author visible when the username is unavailable", () => {
  const author = watchAuthor("public", {
    author_name: "Unknown upload owner",
    author_username: null,
    author_avatar_url: null,
  });

  assert.equal(author.label, "Unknown upload owner");
  assert.equal(author.username, null);
  assert.equal(author.href, null);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test apps/clipline-cloud-web/tests/watch.test.mjs
```

Expected: module import failure because `watchAuthor` is not exported yet.

- [ ] **Step 3: Implement the minimal author view model**

Import `UserAvatar` in `src/pages/watch.js`, then add:

```js
export function watchAuthor(routeName, clip, viewer) {
  const avatarUser =
    routeName === "clip"
      ? viewer || {}
      : {
          display_name: clip?.author_name || null,
          username: clip?.author_username || null,
          avatar_url: clip?.author_avatar_url || null,
        };
  const username = avatarUser.username || null;
  const label = avatarUser.display_name || username || "Unknown creator";
  return {
    label,
    username,
    href: username ? `/u/${encodeURIComponent(username)}` : null,
    avatarUser,
  };
}
```

- [ ] **Step 4: Run the focused test and verify the model tests pass**

Run:

```bash
node --test apps/clipline-cloud-web/tests/watch.test.mjs
```

Expected: the three new model tests pass.

- [ ] **Step 5: Write failing author-row VNode tests**

Add `WatchAuthorRow` to the existing import destructuring, then add:

```js
test("WatchAuthorRow links the complete identity and exposes a non-functional Follow control", () => {
  const row = WatchAuthorRow({
    author: {
      label: "Arua",
      username: "arua",
      href: "/u/arua",
      avatarUser: { display_name: "Arua", username: "arua" },
    },
  });
  const [identity, follow] = row.props.children;

  assert.equal(row.type, "div");
  assert.equal(row.props.class, "watch-author-row");
  assert.equal(identity.type, "a");
  assert.equal(identity.props.href, "/u/arua");
  assert.equal(follow.type, "button");
  assert.equal(follow.props.type, "button");
  assert.equal(follow.props["aria-disabled"], "true");
  assert.equal(follow.props.onClick, undefined);
  assert.equal(follow.props.children, "Follow");
});

test("WatchAuthorRow renders static identity text without a username", () => {
  const row = WatchAuthorRow({
    author: {
      label: "Unknown creator",
      username: null,
      href: null,
      avatarUser: {},
    },
  });

  assert.equal(row.props.children[0].type, "span");
  assert.equal(row.props.children[0].props.class, "watch-author-link watch-author-static");
});
```

- [ ] **Step 6: Run the focused test and verify RED**

Run:

```bash
node --test apps/clipline-cloud-web/tests/watch.test.mjs
```

Expected: module import failure because `WatchAuthorRow` is not exported yet.

- [ ] **Step 7: Implement the author row and integrate it into WatchPage**

Implement:

```js
export function WatchAuthorRow({ author }) {
  const contents = html`
    <${UserAvatar} user=${author.avatarUser} size=${36} />
    <span class="watch-author-name">${author.label}</span>
  `;
  const identity = author.href
    ? html`<a class="watch-author-link" href=${author.href}>${contents}</a>`
    : html`<span class="watch-author-link watch-author-static">${contents}</span>`;

  return html`<div class="watch-author-row">
    ${identity}
    <button type="button" class="btn btn-primary watch-follow" aria-disabled="true">Follow</button>
  </div>`;
}
```

In `WatchPage`, replace the standalone `authorName` calculation with:

```js
const author = watchAuthor(route.name, clip, user);
```

Remove `` `by ${authorName}` `` from `metaParts`. Wrap the title, author row, and metadata in:

```js
<div class="watch-heading">
  <div class="watch-titlerow">...</div>
  <${WatchAuthorRow} author=${author} />
  <p class="watch-meta">...</p>
</div>
```

- [ ] **Step 8: Run focused and full web tests**

Run:

```bash
node --test apps/clipline-cloud-web/tests/watch.test.mjs
npm test --prefix apps/clipline-cloud-web
```

Expected: focused tests pass; full suite reports 165 passing tests and zero failures.

- [ ] **Step 9: Commit the author-row behavior**

```bash
git add apps/clipline-cloud-web/src/pages/watch.js apps/clipline-cloud-web/tests/watch.test.mjs
git commit -m "Add watch page author identity row"
```

---

### Task 2: Align and style the avatars and author row

**Files:**
- Create: `apps/clipline-cloud-web/tests/ui-css.test.mjs`
- Modify: `apps/clipline-cloud-web/src/ui.css`

**Interfaces:**
- Consumes: `.avatar-wrap`, `.avatar-btn`, `.watch-heading`, `.watch-author-row`, `.watch-author-link`, `.watch-author-name`, and `.watch-follow` markup.
- Produces: stable desktop, responsive, and theater-mode layout rules.

- [ ] **Step 1: Write failing CSS contract tests**

Create `tests/ui-css.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/ui.css", import.meta.url), "utf8");

test("top-bar avatar wrapper and button use explicit centered flex boxes", () => {
  assert.match(css, /\.ui \.avatar-wrap \{[^}]*display: flex;[^}]*align-items: center;/s);
  assert.match(
    css,
    /\.ui \.avatar-btn \{[^}]*display: inline-flex;[^}]*align-items: center;[^}]*justify-content: center;[^}]*width: 28px;[^}]*height: 28px;/s
  );
});

test("watch author row aligns identity and Follow control and can wrap", () => {
  assert.match(
    css,
    /\.ui \.watch-author-row \{[^}]*display: flex;[^}]*align-items: center;[^}]*flex-wrap: wrap;/s
  );
  assert.match(css, /\.ui \.watch-author-link \{[^}]*display: inline-flex;[^}]*align-items: center;/s);
});

test("theater mode spaces the complete watch heading as one unit", () => {
  assert.match(css, /\.clipline-theater \.ui \.watch-heading \{[^}]*margin-top: 18px;/s);
  assert.doesNotMatch(css, /\.clipline-theater \.ui \.watch-titlerow \{/s);
});
```

- [ ] **Step 2: Run the CSS test and verify RED**

Run:

```bash
node --test apps/clipline-cloud-web/tests/ui-css.test.mjs
```

Expected: all three tests fail against the current stylesheet.

- [ ] **Step 3: Implement top-bar and normal watch-page styles**

Update the top-bar rules to:

```css
.ui .avatar-wrap { position: relative; display: flex; align-items: center; }
.ui .avatar-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px;
  height: 28px; border: 0; background: none; padding: 0; cursor: pointer; line-height: 0; }
.ui .avatar-btn img.user-avatar { display: block; }
```

Update the watch heading and add author styles:

```css
.ui .watch-heading { margin: 14px 0; }
.ui .watch-titlerow { margin: 0 0 8px; }
.ui .watch-author-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
  margin: 0 0 6px; }
.ui .watch-author-link { display: inline-flex; align-items: center; gap: 9px; color: var(--ink);
  text-decoration: none; min-width: 0; }
.ui .watch-author-link[href]:hover .watch-author-name { color: var(--highlight); }
.ui .watch-author-name { font-size: 13px; font-weight: 600; overflow-wrap: anywhere;
  transition: color .15s; }
.ui .watch-author-static { cursor: default; }
.ui .watch-follow { margin-left: 2px; font-weight: 600; cursor: default; }
.ui .watch-meta { margin: 0; }
```

- [ ] **Step 4: Move theater spacing to the complete heading**

Replace the existing title-only theater margin with:

```css
.clipline-theater .ui .watch-heading { margin-top: 18px; }
```

This preserves the current full-width theater stage and keeps title, author row, and metadata together below the player.

- [ ] **Step 5: Run CSS and full web tests**

Run:

```bash
node --test apps/clipline-cloud-web/tests/ui-css.test.mjs
npm test --prefix apps/clipline-cloud-web
```

Expected: CSS tests pass; full suite reports 168 passing tests and zero failures.

- [ ] **Step 6: Commit the layout source and regression test**

```bash
git add apps/clipline-cloud-web/src/ui.css apps/clipline-cloud-web/tests/ui-css.test.mjs
git commit -m "Align avatars and style watch author row"
```

---

### Task 3: Rebuild and verify the shipped web application

**Files:**
- Modify: `apps/clipline-cloud-web/dist/main.js`
- Modify: `apps/clipline-cloud-web/dist/ui.css`

**Interfaces:**
- Consumes: the completed source and test changes from Tasks 1 and 2.
- Produces: committed browser assets matching source exactly.

- [ ] **Step 1: Build the distribution bundle**

Run:

```bash
npm run build --prefix apps/clipline-cloud-web
```

Expected: esbuild completes successfully and updates `dist/main.js` and `dist/ui.css`.

- [ ] **Step 2: Verify generated assets and the full web suite**

Run:

```bash
npm run check:dist --prefix apps/clipline-cloud-web
npm test --prefix apps/clipline-cloud-web
git diff --check
```

Expected: dist check exits zero, 168 web tests pass, and Git reports no whitespace errors.

- [ ] **Step 3: Verify the workspace that embeds the bundle**

Run:

```bash
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```

Expected: formatting and Clippy exit zero; the Rust workspace reports 183 passed tests and one ignored live-S3 test.

- [ ] **Step 4: Inspect the final responsive layout contract**

Confirm from the source and generated CSS that:

```text
desktop top bar: 28px centered avatar button beside the search input
normal watch: title -> linked 36px avatar/name + Follow -> game/views/date
narrow watch: identity remains intact and Follow may wrap after it
theater watch: title, author row, and metadata stay together below the full-width player
missing avatar: UserAvatar initial fallback remains centered
```

Expected: every line maps to an implemented selector or VNode covered by the focused tests; no `by <author>` fragment remains in `watch.js` or `dist/main.js`.

- [ ] **Step 5: Commit generated assets**

```bash
git add apps/clipline-cloud-web/dist/main.js apps/clipline-cloud-web/dist/ui.css
git commit -m "Rebuild web assets for watch author row"
```

- [ ] **Step 6: Final branch audit**

Run:

```bash
git status --short --branch
git log --oneline --decorate main..HEAD
```

Expected: only the two pre-existing untracked review documents remain; the branch contains the design, author-row, styling, and generated-asset commits.
