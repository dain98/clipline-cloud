import test from "node:test";
import assert from "node:assert/strict";
import { publicThumbPath, ownedThumbPath, ownedMediaPath } from "../src/lib/media.js";

// The public API's thumbnail_url is an ABSOLUTE URL built from the server's
// configured CLIPLINE_PUBLIC_URL, so it breaks img-src 'self' whenever the
// site is browsed via any other host alias (127.0.0.1, LAN IP, …). Like the
// legacy app (src/app.js:1180), we always construct the relative path.

test("publicThumbPath builds the relative public thumbnail path", () => {
  assert.equal(
    publicThumbPath({ share_id: "c_rnn3Eq2pKPH4DwyaujKDfV" }),
    "/api/v1/public/clips/c_rnn3Eq2pKPH4DwyaujKDfV/thumbnail"
  );
});

test("publicThumbPath URL-encodes the share_id", () => {
  assert.equal(
    publicThumbPath({ share_id: "c a/b?x" }),
    "/api/v1/public/clips/c%20a%2Fb%3Fx/thumbnail"
  );
});

// The authenticated GET /api/v1/clips list doesn't return thumbnail/media
// URLs at all (verified with curl), so owned library views must construct
// them from the clip id — mirroring the owned media routes registered in
// apps/clipline-cloud-server/src/media.rs (:53-54).

test("ownedThumbPath builds the relative owned thumbnail path", () => {
  assert.equal(ownedThumbPath({ id: "01KWMJ6C80XQAQPDH4AFAXRHEM" }), "/api/v1/clips/01KWMJ6C80XQAQPDH4AFAXRHEM/thumbnail");
});

test("ownedThumbPath URL-encodes the id", () => {
  assert.equal(ownedThumbPath({ id: "a b/c" }), "/api/v1/clips/a%20b%2Fc/thumbnail");
});

test("ownedMediaPath builds the relative owned media path", () => {
  assert.equal(ownedMediaPath({ id: "01KWMJ6C80XQAQPDH4AFAXRHEM" }), "/api/v1/clips/01KWMJ6C80XQAQPDH4AFAXRHEM/media");
});

test("ownedMediaPath URL-encodes the id", () => {
  assert.equal(ownedMediaPath({ id: "a b/c" }), "/api/v1/clips/a%20b%2Fc/media");
});
