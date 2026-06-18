# 06 — Clip Lifecycle & Durable Jobs

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 02 (`jobs` table), doc 03 (storage `head_object`), doc 05 (finalize enqueues `validate_object`)
**Design sections:** §13, §7 (jobs table + claiming/recovery), relevant parts of §27

> Goal: the durable, in-process job runner and the clip state machine. **No transcoding in v1** —
> Clipline already produces playable MP4. The one Phase-1 job is `validate_object`, which confirms
> the stored object and transitions the clip to `ready`. The runner's value is restart safety:
> persisted state means a restart mid-processing resumes instead of stranding a clip.

---

## Goal

`clipline-cloud-core` job runner: claim → run → retry-with-backoff → `dead`, with atomic claiming
and stale-lock recovery, plus the clip lifecycle transitions. Implement `validate_object`. Build the
claim mechanism so the future worker-container split (doc 14) needs **no schema change.**

## Design context

### Clip lifecycle (§13)

Clipline already produces playable MP4, so **no server-side transcoding in v1.** After finalize
(doc 05), a durable `validate_object` job confirms the stored object exists and matches expected
size, then transitions the clip to `ready`. Post-v1 video optimization/compression, if enabled, is
a doc-14 job layered on top of this lifecycle and must never make a validated upload unplayable.

> Thumbnail/poster generation and ffprobe metadata backfill are **Phase 2** jobs (doc 12) — so the
> Phase-1 library shows placeholders, intentionally.

States: `created` → `uploading` → `processing` → `ready`, plus `failed` and `deleted` (soft-delete).
Because jobs are persisted, a restart during processing **resumes** rather than stranding a clip; a
job that exhausts `max_attempts` is marked `dead` and surfaced in the admin UI (doc 09).

### The durable jobs table (§7)

The runner is in-process for v1, but **state is persisted** so a restart mid-processing doesn't
strand a clip in `processing` or orphan temp files: jobs are picked up by `next_run_at`, retried
with backoff up to `max_attempts`, then marked `dead` for admin visibility. `target_type`/`target_id`
are nullable so periodic sweeps (expired-session and orphaned-part cleanup — doc 12) share the same
table.

`kind` values seen across phases: `validate_object` (Phase 1) | `thumbnail` | `poster` |
`probe_metadata` | `cleanup_session` | `cleanup_clip` (Phase 2) | `optimize_video` (optional
Phase 4). `status`: `pending` | `running` | `succeeded` | `failed` | `dead`.

### Claiming and stale-lock recovery (§7) — required (round-3 edit)

A persisted table alone doesn't prevent two runners claiming the same job, or a crashed process
leaving a job stuck in `running`. A job is **claimable** when:

- `status = 'pending'`, **or**
- `status = 'running' AND locked_at < now() - job_lock_timeout` (a crashed runner's job is requeued
  after the timeout).

Claiming is a single atomic statement (SQLite 3.35+ and Postgres both support `RETURNING`):

```sql
UPDATE jobs SET status='running', locked_by=:runner, locked_at=now()
WHERE id = (SELECT id FROM jobs WHERE <claimable> ORDER BY next_run_at LIMIT 1)
RETURNING *
```

This is overkill for a single v1 process but makes restart recovery precise and makes the future
worker-container split (doc 14) safe with **no schema change.**

### `validate_object` (§13)

Confirms the stored object exists and matches expected size (via `head_object`), then transitions
the clip to `ready`. On S3 without native checksums, this is also where the **asynchronous
whole-object SHA-256 verification** happens (stream the object) — see doc 05's integrity note.

### Failure modes this milestone owns (§27)

- "upload complete but processing failed" → the `validate_object`/processing job retries, then goes
  `dead` and shows in admin.
- "restart mid-processing" → durable jobs resume.
- "metadata row without object" / "object without row" → surfaced/cleaned (cleanup sweeps are doc 12,
  but the lifecycle states must represent these cleanly).

## Implementation checklist

- [x] In-process job runner loop in `clipline-cloud-core`, driven by `next_run_at`
- [x] Atomic claim via `UPDATE ... RETURNING` with the claimable predicate (pending OR stale-running)
- [x] `job_lock_timeout`-based stale-lock requeue (crashed-runner recovery)
- [x] Retry with backoff up to `max_attempts`; exhaustion → `status = 'dead'` with `last_error`
- [x] Enqueue API used by doc 05 finalize (`validate_object` for the new clip)
- [x] `validate_object` handler: `head_object` exists + size matches → clip `ready`; mismatch/missing → fail/retry
- [x] S3-mode async whole-object SHA-256 verification path inside `validate_object` (when native checksums are off)
- [x] Clip state machine enforced: `created`→`uploading`→`processing`→`ready`, plus `failed`/`deleted`
- [x] Soft-delete (`deleted` + `deleted_at`) supported for the clips delete path (used by doc 07)
- [x] Dead jobs and recent job errors queryable for the admin surface (doc 09 / doc 11 observability)

## Definition of done

- [x] A finalized upload progresses `processing` → `ready` via `validate_object` on both local and S3
- [x] Restarting the server mid-processing resumes the job (clip does not get stranded in `processing`)
- [x] A job that keeps failing is retried with backoff and ends `dead`, visible to admin
- [x] Two concurrent runner loops never double-claim the same job (atomic claim verified under contention)
- [x] A simulated crashed runner (stale `running` lock) gets its job requeued after the timeout

## Progress log

- 2026-06-16: Implemented durable jobs in `clipline-cloud-core`: queue API, in-process runner,
  atomic claim, stale-lock recovery, retry/backoff, dead-job handling, and `validate_object`.
- 2026-06-16: Wired the server to start and stop the job runner with graceful shutdown; added job
  timing config (`CLIPLINE_JOB_*`), runner startup logging, and admin-only dead/recent-error job
  endpoints.
- 2026-06-16: Extended DB repositories for guarded clip lifecycle transitions, atomic job claiming,
  retry/dead/success state updates, and dead/recent-error job listing.
- 2026-06-16: Verified with `cargo fmt --all --check`, `cargo test --workspace`,
  `cargo build --workspace`, a local lifecycle smoke covering upload-to-ready, stale-running restart
  recovery, dead-job/admin visibility, and an S3/MinIO lifecycle smoke covering chunked upload,
  async whole-object SHA-256 validation, and ready transition.
