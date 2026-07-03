import test from "node:test";
import assert from "node:assert/strict";
import { clipAuthor } from "../src/components/ClipCard.js";

test("clipAuthor prefers a nested owner's display_name", () => {
  assert.equal(clipAuthor({ owner: { display_name: "Kai R.", username: "kairos" } }), "Kai R.");
});

test("clipAuthor falls back to owner.username when no display_name", () => {
  assert.equal(clipAuthor({ owner: { username: "kairos" } }), "kairos");
});

test("clipAuthor falls back to a flat owner_username field", () => {
  assert.equal(clipAuthor({ owner_username: "kairos" }), "kairos");
});

test("clipAuthor falls back to the real /api/v1/public/clips fields (author_name/author_username)", () => {
  assert.equal(clipAuthor({ author_name: "Kai", author_username: "kairos" }), "Kai");
  assert.equal(clipAuthor({ author_username: "kairos" }), "kairos");
});

test("clipAuthor returns null when nothing is present", () => {
  assert.equal(clipAuthor({}), null);
});
