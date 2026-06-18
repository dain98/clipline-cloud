# 14 — Phase 4: Optional Scale

**Phase:** Phase 4 (post-v1, build only if demand appears)
**Status:** ◐ In progress
**Depends on:** Phase 1 complete (docs 01–11); doc 06 (job claiming was designed for the worker split); doc 05 (upload protocol)
**Design sections:** §30 Phase 4, §12 (direct-to-S3 future), §7 (worker-split safety)

> Goal: the optional scaling and integration features. **Build only if demand appears** — none of
> this is needed for a working self-hosted instance. Several items were explicitly designed-for
> earlier (the durable-job claim mechanism already makes the worker split schema-free), so they slot
> in cleanly.

---

## Goal

Direct-to-S3 multipart via presigned part URLs; a dedicated worker container; single-output video
optimization/compression; a CDN for public clips; invite links; OIDC; federation.

## Design context (§30 Phase 4)

Direct-to-S3 multipart via presigned part URLs; dedicated worker container; video optimization;
CDN for public clips; invite links; OIDC; federation. **Build only if demand appears.**

Notes from earlier design decisions that make these cheaper:

- **Direct-to-S3 multipart** (§12): a future version can let the client upload parts straight to S3
  via presigned part URLs, with the backend only orchestrating — or adopt TUS. The first-party
  protocol (doc 05) was kept deliberately so v1 keeps tight control over the desktop UX; this is the
  step that trades that for offloaded bandwidth. The first scaffold keeps it disabled by default
  (`CLIPLINE_DIRECT_S3_UPLOADS=false`) and exposes presign/ack endpoints only for S3-backed chunked
  uploads.
- **Dedicated worker container** (§7): the durable-job **claim mechanism** (atomic `UPDATE ...
  RETURNING` + `locked_by`/`locked_at` + stale-lock requeue, doc 06) was built so the worker split is
  **safe with no schema change.** A second process just becomes another `locked_by` runner.
- **CDN for public clips**: extends the presigned/proxy public-media path (doc 08).
- **OIDC / invite links / federation**: all explicitly **out of scope for v1** (§2); revisit here.
- **Video optimization / compression**: doc 06 commits to *no* server-side transcoding in v1, but the
  browser-serving path benefits from smaller, fast-start MP4s. This is not a multi-quality ladder.
  The first version should produce at most one optimized browser MP4, keep the upload playable if
  optimization fails, and only replace the active media object when the optimized result is valid
  and meaningfully smaller.

### Video optimization design

The optimization goal is storage and bandwidth reduction, not quality selection. Uploaded clips are
already playable MP4s, so optimization must be optional, conservative, and loss-safe.

- Add a disabled-by-default setting such as `CLIPLINE_VIDEO_OPTIMIZATION=off|on`. Operators can
  enable it only when they accept extra CPU work and lossy recompression.
- Run a new durable job kind, `optimize_video`, through the existing media-processing harness:
  non-root, network-isolated, wall-clock bounded, and subject to the same memory/process limits as
  thumbnail/poster/probe jobs.
- Generate a temporary optimized candidate object under the same media token, for example
  `objects/media/<token>/optimized-candidate.mp4`. Do **not** change `clips.storage_key`, because
  storage and media artifact helpers currently assume the canonical source key shape
  `objects/media/<token>/source.mp4`.
- Encode to a single browser-friendly MP4, initially H.264 video, AAC audio or safe audio copy,
  `yuv420p`, and `-movflags +faststart`. Use configurable CRF/preset and optional max-width
  controls; start conservatively (`CRF 26`-ish, no default resize) and tune with real clips.
- Validate the candidate before activating it: non-empty file, `ffprobe` sanity checks, readable
  through the storage backend, expected container/codec/pixel format, and a measured byte size.
- Replace the canonical `source.mp4` object only when the candidate is valid and meaningfully
  smaller than the original. A small threshold such as 5% avoids spending quality for negligible
  savings.
- After replacement, update `clips.file_size_bytes`, `clips.checksum_sha256`, and probe-derived
  metadata for the active media. Re-enqueue or refresh thumbnail/poster/probe artifacts if the
  optimized source changes dimensions/codecs.
- If optimization fails, times out, or produces a larger file, delete the candidate, keep serving the
  original upload, and mark optimization as skipped/failed in logs/admin diagnostics. The clip must
  remain `ready`.
- Default retention should delete the original after successful replacement, because the feature's
  purpose is storage savings. Add an operator escape hatch to keep originals during early testing.

## Implementation checklist (activate items only when demanded)

- [ ] Direct-to-S3 multipart via presigned part URLs (backend orchestrates; client PUTs to S3) — or TUS
  - [x] Server scaffold: S3-only config flag, discovery/admin capability, presigned part URL endpoint, direct part ack endpoint
  - [ ] Desktop client direct-upload flow
  - [x] MinIO/direct-S3 smoke test covering presign → PUT to S3 → ack → complete → validate
- [x] Dedicated worker container as an additional job runner (no schema change; relies on doc-06 claiming)
- [ ] Single-output video optimization/compression for browser serving
  - [ ] Config gate: disabled by default, with CRF/preset/max-width/min-savings/keep-original controls
  - [ ] `optimize_video` job uses the hardened media-processing harness and never blocks ready playback
  - [ ] Candidate object generation and validation before activation
  - [ ] Safe replacement of canonical `source.mp4`; failed/skipped optimization leaves original intact
  - [ ] DB metadata update for active optimized media plus artifact/probe refresh where needed
  - [ ] Cleanup deletes candidates and, by default, originals after successful replacement
  - [ ] Local and S3 smoke coverage proves optimized media serves correctly and saves bytes on a fixture
- [ ] CDN in front of public clips (extends doc-08 public-media path)
- [ ] Invite links (self-service onboarding without full self-registration)
- [ ] OIDC login (Discord/Google/Steam)
- [ ] Federation

## Definition of done

- [ ] Per shipped item: it works end to end, is documented, and degrades gracefully when disabled
- [x] The dedicated worker (if shipped) coexists with the in-process runner without double-processing jobs
- [x] No Phase-4 feature is enabled by default that would compromise the v1 self-hosted simplicity guarantee

## Progress log

- 2026-06-17: Added `CLIPLINE_PROCESS_ROLE=all|web|worker` plus optional Compose
  `clipline-worker` services. The default remains the single combined process; split deployments
  set the web container to `web` and enable the worker profile so job processing runs in a separate
  container against the same database/storage state.
- 2026-06-17: Added the direct-to-S3 server scaffold. S3 deployments can opt into
  `CLIPLINE_DIRECT_S3_UPLOADS=true`; chunked upload creation then advertises presign/ack URL
  templates, the API can mint short-lived S3 `UploadPart` URLs, and clients can acknowledge direct
  parts with size/checksum/ETag metadata before the existing complete path runs.
- 2026-06-17: Added Docker MinIO smoke coverage for the full direct-S3 server path: presign,
  direct PUT to MinIO, ack, complete, validate-object job, and ready clip polling. The desktop
  client flow remains the unshipped part of direct-to-S3.
- 2026-06-18: Reframed the old "transcoding/multiple qualities" item as single-output video
  optimization/compression. The intended feature is an optional, conservative `optimize_video` job
  that reduces storage and browser bandwidth by replacing `source.mp4` only after a validated
  smaller candidate exists; it is not a multi-quality ladder.
