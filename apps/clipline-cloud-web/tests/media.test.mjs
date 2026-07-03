import test from "node:test";
import assert from "node:assert/strict";
import { publicThumbPath } from "../src/lib/media.js";

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
