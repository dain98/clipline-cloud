import test from "node:test";
import assert from "node:assert/strict";

// pages/watch.js imports lib/router.js (for navigate()), which touches
// window.addEventListener at module load time — shim just enough of
// `window` before importing, same as tests/shell.test.mjs.
globalThis.window = new EventTarget();
window.location = { pathname: "/", hash: "", search: "" };
window.history = { pushState() {} };

const {
  isOwnerForRoute,
  resolveShareId,
  resolveOwnedClipId,
  deriveShareLink,
  resolutionLabel,
  recommendationsPath,
  upNextList,
} = await import("../src/pages/watch.js");

// GET /api/v1/clips/{id} (route "clip") 404s unless the caller owns the clip
// (verified with curl + apps/clipline-cloud-server/src/clips.rs:173-188), so
// a successful fetch already proves ownership on that route. The public
// route instead relies on the server-computed viewer_can_edit flag.

test("isOwnerForRoute is always true on the clip route (fetch already proved ownership)", () => {
  assert.equal(isOwnerForRoute("clip", { viewer_can_edit: false }), true);
  assert.equal(isOwnerForRoute("clip", {}), true);
});

test("isOwnerForRoute defers to viewer_can_edit on the public route", () => {
  assert.equal(isOwnerForRoute("public", { viewer_can_edit: true }), true);
  assert.equal(isOwnerForRoute("public", { viewer_can_edit: false }), false);
  assert.equal(isOwnerForRoute("public", {}), false);
});

test("resolveShareId reads the route's shareId on the public route", () => {
  assert.equal(resolveShareId("public", { shareId: "c_abc" }, {}), "c_abc");
});

test("resolveShareId reads public_share_id from the owned clip response", () => {
  assert.equal(resolveShareId("clip", {}, { public_share_id: "c_abc" }), "c_abc");
  assert.equal(resolveShareId("clip", {}, { public_share_id: null }), null);
});

test("resolveOwnedClipId reads the route's clipId on the clip route", () => {
  assert.equal(resolveOwnedClipId("clip", { clipId: "01ABC" }, {}), "01ABC");
});

test("resolveOwnedClipId reads viewer_clip_id from the public clip response", () => {
  assert.equal(resolveOwnedClipId("public", {}, { viewer_clip_id: "01ABC" }), "01ABC");
  assert.equal(resolveOwnedClipId("public", {}, {}), null);
});

// deriveShareLink resolves just the pathname of the server's absolute
// public_url/share_url against the browser's real origin (host-alias CSP
// safety, same rationale as lib/media.js), falling back to /c/{shareId}.

test("deriveShareLink resolves the pathname of an absolute url against the given origin", () => {
  assert.equal(
    deriveShareLink("http://localhost:18080/c/c_abc", "http://127.0.0.1:18080", "c_abc"),
    "http://127.0.0.1:18080/c/c_abc"
  );
});

test("deriveShareLink falls back to /c/{shareId} when there's no url yet", () => {
  assert.equal(deriveShareLink(null, "http://127.0.0.1:18080", "c_abc"), "http://127.0.0.1:18080/c/c_abc");
});

test("deriveShareLink returns null when there's neither a url nor a share id", () => {
  assert.equal(deriveShareLink(null, "http://127.0.0.1:18080", null), null);
});

test("deriveShareLink falls back to the share id when the url fails to parse", () => {
  assert.equal(deriveShareLink("not a url", "http://127.0.0.1:18080", "c_abc"), "http://127.0.0.1:18080/c/c_abc");
});

// resolutionLabel builds the details-strip's "1080p60" summary segment.

test("resolutionLabel combines height and rounded fps", () => {
  assert.equal(resolutionLabel({ height: 1080, fps: 60 }), "1080p60");
});

test("resolutionLabel rounds a fractional fps", () => {
  assert.equal(resolutionLabel({ height: 720, fps: 59.94 }), "720p60");
});

test("resolutionLabel omits the fps suffix when fps is missing or zero", () => {
  assert.equal(resolutionLabel({ height: 1080, fps: null }), "1080p");
  assert.equal(resolutionLabel({ height: 1080, fps: 0 }), "1080p");
});

test("resolutionLabel handles a missing height", () => {
  assert.equal(resolutionLabel({ fps: 60 }), "p60");
});

// upNextList: first N public clips excluding the one being watched.

test("recommendationsPath requests related clips for the watched share id", () => {
  assert.equal(
    recommendationsPath("c_abc", 8),
    "/api/v1/public/recommendations?share_id=c_abc&limit=8"
  );
});

test("recommendationsPath omits share_id when no public share exists yet", () => {
  assert.equal(recommendationsPath(null, 6), "/api/v1/public/recommendations?limit=6");
});

test("upNextList excludes the current clip by share_id", () => {
  const clips = [{ share_id: "a" }, { share_id: "b" }, { share_id: "c" }];
  assert.deepEqual(upNextList(clips, "b").map((c) => c.share_id), ["a", "c"]);
});

test("upNextList caps the result at the given limit", () => {
  const clips = Array.from({ length: 10 }, (_, i) => ({ share_id: `s${i}` }));
  assert.equal(upNextList(clips, null, 8).length, 8);
});

test("upNextList returns everything when there's no current share id to exclude", () => {
  const clips = [{ share_id: "a" }, { share_id: "b" }];
  assert.deepEqual(upNextList(clips, null).map((c) => c.share_id), ["a", "b"]);
});
