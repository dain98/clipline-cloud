import test from "node:test";
import assert from "node:assert/strict";

// router.js touches window.addEventListener at module load time (to wire up
// popstate/hashchange), so shim just enough of `window` before importing it.
globalThis.window = new EventTarget();
window.location = { pathname: "/", hash: "", search: "" };
window.history = { pushState() {} };

const { previewHashToLocation } = await import("../src/lib/router.js");

test("previewHashToLocation defaults to root when hash is empty", () => {
  assert.deepEqual(previewHashToLocation(""), { pathname: "/", search: "" });
  assert.deepEqual(previewHashToLocation("#"), { pathname: "/", search: "" });
});

test("previewHashToLocation splits pathname and search off the hash", () => {
  assert.deepEqual(previewHashToLocation("#/library"), { pathname: "/library", search: "" });
  assert.deepEqual(previewHashToLocation("#/admin?tab=users"), {
    pathname: "/admin",
    search: "?tab=users",
  });
});

test("previewHashToLocation preserves multiple query params", () => {
  assert.deepEqual(previewHashToLocation("#/search?q=ace&page=2"), {
    pathname: "/search",
    search: "?q=ace&page=2",
  });
});
