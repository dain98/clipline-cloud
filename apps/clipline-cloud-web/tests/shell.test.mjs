import test from "node:test";
import assert from "node:assert/strict";

// router.js touches window.addEventListener at module load time (to wire up
// popstate), so shim just enough of `window` before importing it.
globalThis.window = new EventTarget();
window.location = { pathname: "/", search: "" };
window.history = { pushState() {} };

const { initialRouteName } = await import("../src/lib/router.js");

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

test("initialRouteName resolves an admin path with a query string to the admin route", () => {
  assert.equal(initialRouteName({ pathname: "/admin", search: "?tab=users" }), "admin");
});

test("initialRouteName falls back to the public library route for an unknown path", () => {
  assert.equal(initialRouteName({ pathname: "/bogus", search: "" }), "publicLibrary");
});
