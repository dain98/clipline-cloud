# 08 — Media Serving & Public Sharing

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 03 (storage `get_object`/`create_read_url`/`head_object`), doc 07 (clips + visibility)
**Design sections:** §14 (media + range), §15 (public sharing), §16 (media + public endpoints), §8 (share IDs)

> Goal: serve clip bytes correctly — range-aware playback for owners (private, ownership-enforced)
> and for the public (by share ID, no login) — and the public sharing model: random share IDs,
> inline "not DRM" playback, 404-on-private, and the presigned-vs-proxy split with its CORS and
> revocation caveats.

---

## Goal

Range-aware media endpoints from day one, the public share page data + media endpoints, random
`public_share_id` generation, and honest download/revocation behavior across local (proxy) and S3
(presigned) backends.

## Design context

### Media serving & range requests (§14)

Video seeking requires HTTP range support, so the media endpoint is range-aware from day one.

- Honor `Range: bytes=...`; respond `206 Partial Content` with `Accept-Ranges: bytes`,
  `Content-Range`, `Content-Length`, and the correct `Content-Type` (from `head_object`).
- Thumbnails/posters get cache headers; media gets conditional/`ETag` handling.

**Local backend:** stream from disk with range slicing.
**S3 backend:** **private** clips are **proxied** by the backend (range forwarded to S3); **public**
clips use short-lived **presigned GETs** (below) so the high-fanout path doesn't run through the
app's bandwidth.

### Endpoints (§16)

```
# Media (ownership enforced for private)
GET /api/v1/clips/{id}/media
GET /api/v1/clips/{id}/thumbnail
GET /api/v1/clips/{id}/poster

# Public (no auth, by share ID)
GET /api/v1/public/clips/{share_id}
GET /api/v1/public/clips/{share_id}/media
GET /api/v1/public/clips/{share_id}/thumbnail
```

> Thumbnails/posters are generated in Phase 2 (doc 12); in Phase 1 these endpoints return placeholders.

### Public sharing (§15)

Each clip has a `visibility` and, when shared, a `public_share_id`.

- Marking a clip public activates a **random** `public_share_id` (§8: `c_` + 22 base62 chars); URL
  form `https://clips.example.com/c/{share_id}`.
- The public page (no login) shows player, title, game, date, duration. It exposes **no owner
  metadata, no edit/delete controls.**
- Reverting to private makes the public page return **404 (not 403)** for anonymous users — 403 would
  confirm the clip exists.
- Public links are **stable until revoked**; expiring links are a future feature.

### Download honesty (§15)

Public clips are served **inline with no download button by default.** This is **not DRM** — a
presigned GET is a working URL while valid, and even backend-proxied video can be saved by a viewer.
The product states plainly that public media can be copied by anyone who can view it. In S3 mode,
public playback uses short-lived presigned GET URLs with `Content-Disposition: inline`.

### Revocation & CORS in S3 presigned mode (§15) — be precise

**Revocation is eventual, not instant, in S3 presigned mode.** Making a clip private immediately
takes down the share *page* and stops the backend from minting new presigned URLs — but any
presigned URL already handed out **stays valid until its TTL expires.** Keep that TTL short
(**recommended 5–10 minutes**); operators who need instant revocation should run public media
through the backend proxy instead of presigned URLs.

For browser `<video>` playback against a cross-origin S3 host, the bucket needs **CORS** allowing
`GET`/`HEAD` and the `Range` request header from the public origin, and the presigned response
should carry `Content-Type: video/mp4`, `Accept-Ranges: bytes`, and cache headers. Same-origin
backend-proxied media avoids the CORS surface entirely.

Implemented knobs:

- `CLIPLINE_PUBLIC_MEDIA_MODE=presigned|proxy` defaults to `presigned`. Local storage always
  proxies because it cannot mint object-store URLs; S3 in `proxy` mode keeps public media
  same-origin for instant revocation.
- `CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS` defaults to `300` seconds.

Minimal S3 bucket CORS for presigned cross-origin playback:

```json
[
  {
    "AllowedOrigins": ["https://clips.example.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": ["Accept-Ranges", "Content-Range", "Content-Length", "Content-Type", "ETag"],
    "MaxAgeSeconds": 300
  }
]
```

## Implementation checklist

- [x] `GET /clips/{id}/media` — owner-enforced; honors `Range`, returns `206` with `Accept-Ranges`/`Content-Range`/`Content-Length`/`Content-Type` (from `head_object`)
- [x] Local: range slicing from disk. S3 private: backend proxy forwarding `Range` to S3
- [x] `ETag`/conditional handling for media; cache headers for thumbnail/poster (placeholders in Phase 1)
- [x] Random `public_share_id` generator (`c_` + 22 base62); minted on visibility→public, cleared on →private
- [x] `GET /public/clips/{share_id}` — public page data (player/title/game/date/duration); **no owner metadata, no controls**
- [x] `GET /public/clips/{share_id}/media` — public playback; S3 → short-lived presigned GET with `Content-Disposition: inline`, `Content-Type: video/mp4`, `Accept-Ranges`
- [x] Reverting to private → public endpoints return **404** for anonymous callers
- [x] Presigned TTL configurable, defaulting short (5–10 min); proxy fallback path available for instant-revocation operators
- [x] Document required S3 bucket CORS (GET/HEAD + `Range`) for cross-origin `<video>`
- [x] No permanent public bucket ACLs; bucket stays private (doc 03)

## Definition of done

- [x] Seeking works in an HTML5 `<video>` element on both local and S3 (range requests return `206`)
- [x] A public share URL plays without login and shows no owner/edit controls
- [x] Reverting to private returns **404** (not 403) on the public endpoints
- [x] S3 public playback uses a short-lived presigned GET served inline; private S3 clips are proxied (never presigned to non-owners)
- [x] Product copy on the share page states plainly that public media can be copied (not DRM)
- [x] Documented CORS config lets a cross-origin S3 host play in-browser

## Progress log

- 2026-06-16 — Added owner and anonymous public media routes, range parsing, `206`/`416`
  responses, ETag/`If-None-Match`, Phase-1 thumbnail/poster placeholders, public clip page data,
  S3 presigned public media redirects, and configurable public media mode/TTL. Verified local
  playback and MinIO-backed S3 playback with HTTP smokes, including public revocation returning
  anonymous `404`.
- 2026-06-17 — Extended `GET /api/v1/public/clips/{share_id}` response with two new fields:
  - `markers`: array of `{kind: string, label: string, timestamp_ms: u64}` objects — the same
    marker set visible to the clip owner, allowing the public watch view to render a chapter
    timeline and seekable marker list without requiring authentication.
  - `has_thumbnail`: boolean — `true` when a thumbnail has been generated for this clip (Phase 2
    onwards); the public watch view uses this to decide whether to show a thumbnail or fall back
    to the dark placeholder. Both fields are safe to expose publicly (they carry no owner PII).
