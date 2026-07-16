import test from "node:test";
import assert from "node:assert/strict";
import { parseRoute, tabNavKeyForRoute, topNavKeyForRoute } from "../src/lib/routes.js";

test("parseRoute maps every route", () => {
  assert.deepEqual(parseRoute("/c/c_abc", ""), { name: "public", shareId: "c_abc" });
  assert.equal(parseRoute("/", "").name, "publicLibrary");
  assert.deepEqual(parseRoute("/game/VALORANT", "").game, "VALORANT");
  assert.deepEqual(parseRoute("/clip/01ABC", ""), { name: "clip", clipId: "01ABC" });
  assert.equal(parseRoute("/admin", "?tab=users").tab, "users");
  assert.deepEqual(parseRoute("/admin/game-categories", ""), { name: "admin", tab: "categories" });
  assert.deepEqual(parseRoute("/admin/game-categories/category%2Fone", ""), {
    name: "admin",
    tab: "categories",
    categoryId: "category/one",
  });
  assert.equal(parseRoute("/reset-password", "?token=t&invite=1").invite, true);
  assert.deepEqual(parseRoute("/games", ""), { name: "games" });
  assert.equal(parseRoute("/nonsense", "").name, "publicLibrary");
});

test("parseRoute marks /search as the search surface", () => {
  assert.deepEqual(parseRoute("/search", "?q=ace"), {
    name: "publicLibrary",
    query: { sort: "uploaded_at_desc", game: "", q: "ace", page: 1 },
    surface: "search",
  });
  assert.equal(parseRoute("/", "").surface, "feed");
});

test("tabNavKeyForRoute highlights Search for /search while top nav stays on Feed", () => {
  const route = parseRoute("/search", "?q=ace");
  assert.equal(tabNavKeyForRoute(route), "search");
  assert.equal(topNavKeyForRoute(route), "feed");
});

test("tabNavKeyForRoute highlights Games for /games", () => {
  assert.equal(tabNavKeyForRoute(parseRoute("/games", "")), "games");
});
