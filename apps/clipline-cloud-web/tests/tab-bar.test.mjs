import test from "node:test";
import assert from "node:assert/strict";
import { visibleTabs } from "../src/components/TabBar.js";

// visibleTabs mirrors TopBar's Library gating: Library and Profile require a
// signed-in session, so anonymous mobile users should still get the public
// Feed + Games + Search tabs.

test("visibleTabs shows every tab for a signed-in user", () => {
  const keys = visibleTabs({ username: "kai" }).map(([key]) => key);
  assert.deepEqual(keys, ["feed", "games", "library", "search", "profile"]);
});

test("visibleTabs hides Library and Profile for an anonymous user", () => {
  const keys = visibleTabs(null).map(([key]) => key);
  assert.deepEqual(keys, ["feed", "games", "search"]);
});

test("visibleTabs treats undefined the same as anonymous", () => {
  const keys = visibleTabs(undefined).map(([key]) => key);
  assert.deepEqual(keys, ["feed", "games", "search"]);
});
