import test from "node:test";
import assert from "node:assert/strict";
import { avatarUrl } from "../src/components/UserAvatar.js";

// avatarUrl: pure port of legacy avatarUrl (src/app.js:2665-2670). Appends a
// cache-busting `v=` param derived from updated_at so the browser refetches
// the image right after a re-upload, even though the URL path is stable.

test("avatarUrl returns empty string when the user has no avatar", () => {
  assert.equal(avatarUrl(null), "");
  assert.equal(avatarUrl({}), "");
  assert.equal(avatarUrl({ avatar_url: "" }), "");
});

test("avatarUrl returns the raw url unchanged when there is no updated_at", () => {
  assert.equal(avatarUrl({ avatar_url: "/api/v1/public/users/kai/avatar" }), "/api/v1/public/users/kai/avatar");
});

test("avatarUrl appends a ?v= cache-buster when the url has no query string", () => {
  assert.equal(
    avatarUrl({ avatar_url: "/api/v1/public/users/kai/avatar", updated_at: "2026-07-04T00:00:00Z" }),
    "/api/v1/public/users/kai/avatar?v=2026-07-04T00%3A00%3A00Z"
  );
});

test("avatarUrl appends a &v= cache-buster when the url already has a query string", () => {
  assert.equal(
    avatarUrl({ avatar_url: "/avatar?x=1", updated_at: "abc" }),
    "/avatar?x=1&v=abc"
  );
});
