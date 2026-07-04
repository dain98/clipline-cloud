import test from "node:test";
import assert from "node:assert/strict";

// TopBar.js imports router.js (via store/navigate) which touches window at
// module load time — shim just enough of `window` first, same as
// tests/feed.test.mjs and tests/shell.test.mjs.
globalThis.window = new EventTarget();
window.location = { pathname: "/", hash: "", search: "" };
window.history = { pushState() {} };
window.matchMedia = () => ({ matches: false });
globalThis.document = { addEventListener() {}, removeEventListener() {} };

const { topBarSearchValue } = await import("../src/components/TopBar.js");

// topBarSearchValue mirrors what publicRouteQuery puts on the route for "/"
// and "/search" (publicLibrary) and "/game/<name>" (publicGame) — every
// other route has no query.q at all, so the search box should read empty
// instead of echoing a stale value.

test("topBarSearchValue reads q off a publicLibrary route", () => {
  assert.equal(topBarSearchValue({ name: "publicLibrary", query: { q: "ace" } }), "ace");
});

test("topBarSearchValue reads q off a publicGame route", () => {
  assert.equal(topBarSearchValue({ name: "publicGame", game: "VALORANT", query: { q: "clutch" } }), "clutch");
});

test("topBarSearchValue is empty when q is absent", () => {
  assert.equal(topBarSearchValue({ name: "publicLibrary", query: {} }), "");
});

test("topBarSearchValue is empty for routes with no query at all", () => {
  assert.equal(topBarSearchValue({ name: "library" }), "");
  assert.equal(topBarSearchValue(undefined), "");
});
