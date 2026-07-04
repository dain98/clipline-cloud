import test from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_ROUTE_NAMES, isPublicRouteName, shouldRedirectToLogin } from "../src/lib/routes.js";

test("isPublicRouteName returns true for every declared public route name", () => {
  for (const name of PUBLIC_ROUTE_NAMES) {
    assert.equal(isPublicRouteName(name), true, `expected ${name} to be public`);
  }
});

test("isPublicRouteName returns false for authenticated/unknown route names", () => {
  for (const name of ["library", "clip", "admin", "account", "profile", ""]) {
    assert.equal(isPublicRouteName(name), false, `expected ${name} to be non-public`);
  }
});

test("shouldRedirectToLogin redirects anonymous users on protected routes only", () => {
  assert.equal(shouldRedirectToLogin("profile", null), true);
  assert.equal(shouldRedirectToLogin("admin", null), true);
  assert.equal(shouldRedirectToLogin("publicLibrary", null), false);
  assert.equal(shouldRedirectToLogin("profile", { username: "kai" }), false);
});
