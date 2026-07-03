import test from "node:test";
import assert from "node:assert/strict";

// router.js touches window.addEventListener at module load time (to wire up
// popstate/hashchange), so shim just enough of `window` before importing it.
globalThis.window = new EventTarget();
window.location = { pathname: "/", hash: "", search: "" };
window.history = { pushState() {} };

const { previewHashToLocation, initialRouteName } = await import("../src/lib/router.js");

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

// Regression for the bootstrap-redirect bug: main.js must seed its
// module-level currentRouteName from the *actual* initial location before
// the session-bootstrap fetch runs, or every anonymous visitor on a public
// route gets bounced to /login by the first 401.
test("initialRouteName resolves the root path to the public library route", () => {
  assert.equal(initialRouteName({ pathname: "/", search: "" }), "publicLibrary");
});

test("initialRouteName resolves a shared-clip path to the public route", () => {
  assert.equal(initialRouteName({ pathname: "/c/c_abc", search: "" }), "public");
});
