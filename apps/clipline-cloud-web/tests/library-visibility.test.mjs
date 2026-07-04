import test from "node:test";
import assert from "node:assert/strict";
import { summarizeBulkOutcome } from "../src/pages/library.js";

// summarizeBulkOutcome is the pure core shared by the forward
// (updateVisibility) and revert (undoVisibility) bulk-visibility flows: given
// the attempted ids and the failures collected while POSTing each one, it
// returns which ids actually succeeded plus a toast message for any failure.

const opts = { verb: "update", allFailedMessage: "Couldn't update visibility." };

test("summarizeBulkOutcome returns every id as succeeded with no message when nothing failed", () => {
  const result = summarizeBulkOutcome(["a", "b"], [], opts);
  assert.deepEqual(result.succeeded, ["a", "b"]);
  assert.equal(result.message, null);
});

test("summarizeBulkOutcome excludes failed ids from succeeded", () => {
  const result = summarizeBulkOutcome(["a", "b", "c"], [{ id: "b", message: "boom" }], opts);
  assert.deepEqual(result.succeeded, ["a", "c"]);
});

test("summarizeBulkOutcome uses the first failure's message when every id failed", () => {
  const result = summarizeBulkOutcome(["a", "b"], [
    { id: "a", message: "server exploded" },
    { id: "b", message: "server exploded" },
  ], opts);
  assert.equal(result.message, "server exploded");
});

test("summarizeBulkOutcome falls back to allFailedMessage when the failure has no message", () => {
  const result = summarizeBulkOutcome(["a"], [{ id: "a" }], opts);
  assert.equal(result.message, "Couldn't update visibility.");
});

test("summarizeBulkOutcome reports a count message on partial failure", () => {
  const result = summarizeBulkOutcome(["a", "b", "c"], [{ id: "b", message: "boom" }], opts);
  assert.equal(result.message, "Couldn't update 1 of 3 clips.");
});

test("summarizeBulkOutcome uses the given verb in the partial-failure message", () => {
  const result = summarizeBulkOutcome(["a", "b"], [{ id: "a", message: "boom" }], {
    verb: "undo",
    allFailedMessage: "Couldn't undo visibility change.",
  });
  assert.equal(result.message, "Couldn't undo 1 of 2 clips.");
});
