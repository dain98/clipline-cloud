import test from "node:test";
import assert from "node:assert/strict";
import { formatDuration, formatBytes, formatViews } from "../src/lib/format.js";

test("formatDuration renders m:ss from ms", () => {
  assert.equal(formatDuration(58_000), "0:58");
  assert.equal(formatDuration(92_000), "1:32");
  assert.equal(formatDuration(null), "Unknown");
});
test("formatBytes matches legacy MiB/GiB output", () => {
  assert.equal(formatBytes(324 * 1024 * 1024), "324.0 MiB");
  assert.equal(formatBytes(null), "Unknown");
});
test("formatViews pluralizes", () => {
  assert.equal(formatViews(1), "1 view");
  assert.equal(formatViews(405), "405 views");
});
