import test from "node:test";
import assert from "node:assert/strict";
import { parseRoute } from "../src/lib/routes.js";

test("parseRoute maps every route", () => {
  assert.deepEqual(parseRoute("/c/c_abc", ""), { name: "public", shareId: "c_abc" });
  assert.equal(parseRoute("/", "").name, "publicLibrary");
  assert.deepEqual(parseRoute("/game/VALORANT", "").game, "VALORANT");
  assert.deepEqual(parseRoute("/clip/01ABC", ""), { name: "clip", clipId: "01ABC" });
  assert.equal(parseRoute("/admin", "?tab=users").tab, "users");
  assert.equal(parseRoute("/reset-password", "?token=t&invite=1").invite, true);
  assert.equal(parseRoute("/nonsense", "").name, "publicLibrary");
});
