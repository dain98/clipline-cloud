import test from "node:test";
import assert from "node:assert/strict";
import { canDisableUser } from "../src/pages/admin/users.js";

// canDisableUser: pure port of legacy canDisableUser (src/app.js:3155-3162) —
// governs both the disabled state of the row's Disable button and (once
// wired) must agree with the server's own admin.rs role checks.

const owner = { id: "owner-1", role: "owner" };
const admin = { id: "admin-1", role: "admin" };

test("a user who is already disabled cannot be disabled again", () => {
  const target = { id: "u1", role: "user", is_disabled: true };
  assert.equal(canDisableUser(target, admin), false);
});

test("an actor cannot disable themself", () => {
  const target = { id: "admin-1", role: "admin", is_disabled: false };
  assert.equal(canDisableUser(target, admin), false);
});

test("the owner can never be disabled by anyone", () => {
  const target = { id: "owner-1", role: "owner", is_disabled: false };
  assert.equal(canDisableUser(target, admin), false);
  assert.equal(canDisableUser(target, owner), false);
});

test("a plain admin cannot disable another admin", () => {
  const target = { id: "u2", role: "admin", is_disabled: false };
  const otherAdmin = { id: "admin-3", role: "admin" };
  assert.equal(canDisableUser(target, otherAdmin), false);
});

test("the owner can disable another admin", () => {
  const target = { id: "u2", role: "admin", is_disabled: false };
  assert.equal(canDisableUser(target, owner), true);
});

test("any admin-like actor can disable a plain user", () => {
  const target = { id: "u3", role: "user", is_disabled: false };
  assert.equal(canDisableUser(target, admin), true);
  assert.equal(canDisableUser(target, owner), true);
});
