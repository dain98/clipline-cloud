# 12 — Phase 2: Processing & Reliability Polish

**Phase:** Phase 2 (post-v1)
**Status:** ☐ Not started
**Depends on:** Phase 1 complete (docs 01–11), especially doc 06 (job runner) and doc 02 (dual-backend repos)
**Design sections:** §30 Phase 2, §13 (untrusted-media boundary), §7 (sweeps), §4.1/§30 (Postgres promotion)

> Goal: turn the Phase-1 placeholders into real processing, add the cleanup sweeps that keep the
> system tidy over time, harden login, and **promote Postgres to "supported" once CI proves both
> backends.** Each piece rides the durable job runner from doc 06.

---

## Goal

Thumbnail/poster generation and ffprobe metadata backfill (behind a hardened untrusted-media
boundary), expired-session and orphaned-part cleanup sweeps, richer upload progress in web +
desktop, login rate limiting, and the dual-backend CI gate that promotes Postgres.

## Design context

### Phase 2 scope (§30)

Thumbnail/poster generation; ffprobe metadata backfill; expired-session and orphaned-part cleanup
sweeps; richer upload progress in web + desktop; login rate limiting; **Postgres backend promoted to
supported once CI proves both backends** (migrations + repository tests green on SQLite **and**
Postgres).

### Untrusted-media boundary (§13) — hard requirement before any decoding job ships

Thumbnail/poster/probe jobs run `ffmpeg`/`ffprobe` against **arbitrary user-uploaded files**, which
is an attack surface. Those processes **must** run as a **non-root** user, with **no network
access**, a **strict wall-clock timeout**, and memory/process limits where the host allows
(cgroups/`ulimit`). `ffprobe` output is parsed but **never trusted blindly** — reported dimensions,
duration, and codecs are validated against sane bounds before they touch the DB or the player. This
is a hard requirement for the job that introduces media decoding.

### Jobs & sweeps (§7)

New `jobs.kind` values activate here: `thumbnail`, `poster`, `probe_metadata`, `cleanup_session`,
`cleanup_clip`. The sweeps use the **nullable `target_type`/`target_id`** rows (global sweeps) the
schema already supports — expired-session and orphaned-part cleanup share the same `jobs` table and
the same claim/retry/dead machinery from doc 06. No schema change needed.

- Generated keys land at `objects/media/<token>/poster.jpg` and `.../thumb_320.jpg` (doc 03 layout);
  set `clips.poster_key` / `clips.thumbnail_key` and the library/clip-detail UI swaps placeholders
  for real images.

### Postgres promotion (§4.1, §30)

Postgres moves from "optional" to "supported" **only once CI proves both backends**: both migration
sets apply and the repository test suite (doc 02) passes on SQLite **and** Postgres. Add per-backend
backup docs (doc 11 already drafts them). Remember this is migration testing + SQL-dialect discipline
+ pagination/timestamp/transaction-semantics checks — not a connection-string swap.

## Implementation checklist

- [ ] Sandboxed media-processing harness: non-root, no network, wall-clock timeout, memory/process limits
- [ ] `ffprobe` output validation against sane bounds before any value touches the DB or player
- [ ] `thumbnail` job → `thumb_320.jpg`; `poster` job → `poster.jpg`; set `thumbnail_key`/`poster_key`
- [ ] `probe_metadata` job backfills dimensions/duration/codecs (validated) on existing/incoming clips
- [ ] Frontend + thumbnail endpoints (doc 08/09) swap placeholders for generated images
- [ ] `cleanup_session` sweep: expire stale upload sessions (TTL from doc 11) and abort their storage multipart
- [ ] `cleanup_clip` / orphaned-part sweep: remove orphaned temp parts and objects-without-rows / rows-without-objects
- [ ] Sweeps scheduled as global (`target_type`/`target_id` NULL) jobs on the doc-06 runner
- [ ] Richer upload progress in web UI and desktop app
- [ ] Login rate limiting hardened beyond doc 04's basic version
- [ ] CI runs migrations + repository tests on **both** SQLite and Postgres; green run promotes Postgres to "supported"
- [ ] Per-backend backup docs finalized (doc 11)

## Definition of done

- [ ] New uploads get real thumbnails/posters; the library no longer shows placeholders
- [ ] Media-decoding jobs run non-root, network-isolated, time-bounded; a malicious file cannot escape or hang the runner
- [ ] `ffprobe`-reported values that exceed sane bounds are rejected, not stored
- [ ] Expired sessions and orphaned parts/objects are reclaimed automatically; storage doesn't accumulate cruft
- [ ] CI is green on both SQLite and Postgres; Postgres is documented as supported
- [ ] Login rate limiting demonstrably throttles brute-force attempts

## Progress log

- _(empty)_
