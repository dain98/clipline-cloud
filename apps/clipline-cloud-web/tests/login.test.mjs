import test from "node:test";
import assert from "node:assert/strict";

// login.js imports navigate() from router.js, which touches window at
// module load time (to wire up popstate/hashchange) — shim just enough of
// `window` before importing, same as tests/feed.test.mjs.
globalThis.window = new EventTarget();
window.location = { pathname: "/login", hash: "", search: "" };
window.history = { pushState() {} };

const { MONTAGE_SLOTS, montageTiles, montageCountLabel } = await import("../src/pages/login.js");

test("montageTiles zips clips with fixed collage slots in order", () => {
  const clips = [{ share_id: "a" }, { share_id: "b" }];
  const tiles = montageTiles(clips);
  assert.equal(tiles.length, 2);
  assert.deepEqual(tiles[0], { clip: clips[0], ...MONTAGE_SLOTS[0] });
  assert.deepEqual(tiles[1], { clip: clips[1], ...MONTAGE_SLOTS[1] });
});

test("montageTiles caps at MONTAGE_SLOTS.length even with more clips", () => {
  const clips = Array.from({ length: 10 }, (_, i) => ({ share_id: String(i) }));
  const tiles = montageTiles(clips);
  assert.equal(tiles.length, MONTAGE_SLOTS.length);
});

test("montageTiles returns an empty array for non-array/empty input", () => {
  assert.deepEqual(montageTiles([]), []);
  assert.deepEqual(montageTiles(null), []);
  assert.deepEqual(montageTiles(undefined), []);
});

test("montageCountLabel returns null when there is no data yet, a fetch error, or zero clips", () => {
  assert.equal(montageCountLabel(null), null);
  assert.equal(montageCountLabel(undefined), null);
  assert.equal(montageCountLabel({ clips: [] }), null);
});

test("montageCountLabel counts the loaded page", () => {
  assert.equal(montageCountLabel({ clips: [1, 2, 3], has_more: false }), "3 clips on this instance");
});

test("montageCountLabel appends '+' when has_more is true", () => {
  assert.equal(montageCountLabel({ clips: [1, 2, 3, 4, 5, 6], has_more: true }), "6+ clips on this instance");
});

test("montageCountLabel singularizes 'clip' for a single loaded clip", () => {
  assert.equal(montageCountLabel({ clips: [1], has_more: false }), "1 clip on this instance");
});
