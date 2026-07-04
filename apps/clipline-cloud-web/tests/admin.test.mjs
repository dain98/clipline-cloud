import test from "node:test";
import assert from "node:assert/strict";

globalThis.window = new EventTarget();
window.location = { pathname: "/admin", hash: "", search: "" };
window.history = { pushState() {} };

const { isAdminLike } = await import("../src/pages/admin.js");

test("isAdminLike allows admins and the owner", () => {
  assert.equal(isAdminLike({ role: "admin" }), true);
  assert.equal(isAdminLike({ role: "owner" }), true);
});

test("isAdminLike rejects non-admin users", () => {
  assert.equal(isAdminLike({ role: "user" }), false);
  assert.equal(isAdminLike(null), false);
});
