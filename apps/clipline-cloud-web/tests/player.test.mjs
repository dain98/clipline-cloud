import test from "node:test";
import assert from "node:assert/strict";

// Player.js reads localStorage at module scope only inside functions (not
// top-level), but it does reference the global `window`, so shim a minimal
// localStorage before importing — same pattern as tests/shell.test.mjs.
function makeMemoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}
globalThis.window = { localStorage: makeMemoryStorage() };

const { resolvePlayerKeyIntent, readStoredVolume } = await import("../src/components/Player.js");

test("KeyM resolves to toggle-mute", () => {
  assert.deepEqual(resolvePlayerKeyIntent("KeyM", false), { kind: "toggle-mute" });
  assert.deepEqual(resolvePlayerKeyIntent("KeyM", true), { kind: "toggle-mute" });
});

test("KeyF resolves to theater", () => {
  assert.deepEqual(resolvePlayerKeyIntent("KeyF", false), { kind: "theater" });
});

test("Escape resolves to exit-theater", () => {
  assert.deepEqual(resolvePlayerKeyIntent("Escape", false), { kind: "exit-theater" });
});

test("maps playback and seeking shortcuts", () => {
  assert.deepEqual(resolvePlayerKeyIntent("Space", false), { kind: "toggle-play" });
  assert.deepEqual(resolvePlayerKeyIntent("KeyK", false), { kind: "toggle-play" });
  assert.deepEqual(resolvePlayerKeyIntent("ArrowLeft", false), { kind: "seek-by", seconds: -5 });
  assert.deepEqual(resolvePlayerKeyIntent("ArrowRight", false), { kind: "seek-by", seconds: 5 });
  assert.deepEqual(resolvePlayerKeyIntent("KeyJ", false), { kind: "seek-by", seconds: -10 });
  assert.deepEqual(resolvePlayerKeyIntent("KeyL", false), { kind: "seek-by", seconds: 10 });
  assert.deepEqual(resolvePlayerKeyIntent("KeyT", false), { kind: "theater" });
});

test("unknown codes resolve to null", () => {
  assert.equal(resolvePlayerKeyIntent("KeyQ", false), null);
});

test("readStoredVolume defaults to 1 (full volume) when nothing is stored", () => {
  window.localStorage.removeItem("clipline.playerVolume");
  assert.equal(readStoredVolume(), 1);
});

test("readStoredVolume returns a validly stored value, including 0", () => {
  window.localStorage.setItem("clipline.playerVolume", "0.4");
  assert.equal(readStoredVolume(), 0.4);
  window.localStorage.setItem("clipline.playerVolume", "0");
  assert.equal(readStoredVolume(), 0);
});

test("readStoredVolume clamps an out-of-range stored value", () => {
  window.localStorage.setItem("clipline.playerVolume", "5");
  assert.equal(readStoredVolume(), 1);
  window.localStorage.setItem("clipline.playerVolume", "-2");
  assert.equal(readStoredVolume(), 0);
});

test("readStoredVolume defaults to 1 for a non-numeric stored value", () => {
  window.localStorage.setItem("clipline.playerVolume", "not-a-number");
  assert.equal(readStoredVolume(), 1);
});
