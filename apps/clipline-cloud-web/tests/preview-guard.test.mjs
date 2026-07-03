import test from "node:test";
import assert from "node:assert/strict";
import { claim, release, _reset } from "../src/lib/preview-guard.js";

test("claim calls previous teardown", () => {
  _reset();
  let called = false;
  const teardown1 = () => { called = true; };
  const teardown2 = () => {};

  claim(teardown1);
  assert.equal(called, false, "First claim should not call anything");

  claim(teardown2);
  assert.equal(called, true, "Second claim should call previous teardown");
});

test("release only clears if caller owns the slot", () => {
  _reset();
  let teardown1Called = false;
  const teardown1 = () => { teardown1Called = true; };
  const teardown2 = () => {};

  claim(teardown1);
  release(teardown2);
  // teardown1 should still be active since teardown2 is not the owner
  assert.equal(teardown1Called, false, "Non-owner release should not call the active teardown");

  // Now claim with teardown2 - should call teardown1 since it's the owner
  claim(teardown2);
  assert.equal(teardown1Called, true, "claim should call previous teardown");

  release(teardown2);
  // Now teardown2 is released, next claim should not call anything
  let teardown3Called = false;
  const teardown3 = () => { teardown3Called = true; };
  claim(teardown3);
  assert.equal(teardown3Called, false, "Release by owner should clear the slot");
});

test("release is a no-op when caller is not the owner", () => {
  _reset();
  let teardown1Called = 0;
  const teardown1 = () => { teardown1Called++; };
  const teardown2 = () => {};

  claim(teardown1);
  release(teardown2); // Wrong owner, should be no-op

  // teardown1 should still be the active one
  claim(teardown1);
  assert.equal(teardown1Called, 1, "Non-owner release should not clear the slot, so claiming same owner calls it");
});
