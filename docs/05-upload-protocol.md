# 05 — Upload Protocol

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 02 (clips/upload_sessions/upload_parts), doc 03 (storage multipart), doc 04 (auth + ownership)
**Design sections:** §12, parts of §7, §20 (limits), Resolved Decisions 4–6

> Goal: one upload protocol that covers both storage backends and both file sizes. The client's
> chunk size **is** the storage part size, so the backend streams each chunk straight through to
> storage with no re-buffering. Idempotency (`client_clip_id`), resumability
> (`received_parts`/`missing_parts`), and crash-safe completion are the hard requirements.

---

## Goal

The full `/api/v1/uploads` endpoint set: create (clip + session, idempotent), progress, single-PUT
small-file path, chunked part upload (1-based), idempotent complete with two-system reconciliation,
and abort/cleanup — wired directly to the storage multipart methods from doc 03.

## Design context

### Endpoints (§12)

```
POST   /api/v1/uploads                          create clip + session
GET    /api/v1/uploads/{id}                      progress (received/missing parts)
PUT    /api/v1/uploads/{id}/content              single-PUT body (small clips)
PUT    /api/v1/uploads/{id}/parts/{part_number}  one chunk (chunked path)
POST   /api/v1/uploads/{id}/parts/{n}/presign    optional Phase-4 direct-S3 presign
POST   /api/v1/uploads/{id}/parts/{n}/ack        optional Phase-4 direct-S3 part ack
POST   /api/v1/uploads/{id}/complete             finalize
DELETE /api/v1/uploads/{id}                       abort + cleanup
```

### Part numbering (§12)

Part numbers are **1-based and in `[1, 10000]`**, matching S3 multipart exactly so there's no
off-by-one translation layer. The final part may be smaller than `part_size_bytes`; when
`storage_backend = s3`, every **non-final** part must be ≥ 5 MiB.

### Create (§12)

The client sends clip metadata **and the whole-file `checksum_sha256` and `file_size_bytes` up
front.** The server:

1. **Resolves idempotency:** if `(owner, client_clip_id)` already exists, return the existing
   clip/session instead of creating a new one.
2. Creates the `clips` row (`status=created`) and an `upload_sessions` row.
3. Computes and **pins** `part_size_bytes` for the session (formula below).
4. Chooses `mode`: `single_put` if `file_size_bytes <= CLIPLINE_SINGLE_PUT_MAX_BYTES` (default 64
   MiB), else `chunked`.
5. For S3 chunked mode, calls `create_multipart_upload` and stores `storage_upload_id`.

> Because part size is pinned on the session row (not re-read from env at finalize), changing the
> global default never corrupts in-flight sessions.

### Part-size selection (§12) — must respect S3's 10,000-part ceiling

The configured default is a **floor**, not the final value. The server computes, then rounds up to a
clean MiB boundary:

```
part_size_bytes = round_up_to_MiB( max(
    CLIPLINE_UPLOAD_PART_SIZE_BYTES,           # configured floor
    ceil(file_size_bytes / 10000),             # stay under 10k parts
    5 MiB if storage_backend == s3 else 0      # S3 minimum non-final part
) )
```

The client uses the **server-returned** `part_size_bytes`, never its own local default.

### Example create request / response (§12)

```json
{
  "client_clip_id": "6f70710e-54e6-49d1-b7ab-3802edabf3c5",
  "title": "Baron steal",
  "description": "Last-second steal from a ranked game.",
  "game_name": "League of Legends",
  "game_id": "league-of-legends",
  "source_type": "league_marker",
  "recorded_at": "2026-06-15T02:31:14Z",
  "duration_ms": 45000,
  "file_size_bytes": 83214521,
  "checksum_sha256": "9f2c...",
  "container": "mp4",
  "video_codec": "h264",
  "audio_codec": "aac",
  "width": 1920, "height": 1080, "fps": 60,
  "visibility": "private"
}
```

`description` is optional and may be set by clients at upload time. `markers` is deprecated for new
uploads; the server accepts the field for compatibility but no longer creates marker rows from upload
requests.

```json
{
  "clip_id": "01JZ8T2K9V7S8F5GTRR0VYR1WX",
  "upload_id": "01JZ8T2N8MM86AGD9TD98DQ1RE",
  "mode": "chunked",
  "part_size_bytes": 8388608,
  "single_put_url": null,
  "parts_url_template": "/api/v1/uploads/01JZ8T2N8MM86AGD9TD98DQ1RE/parts/{part_number}",
  "direct_part_presign_url_template": null,
  "direct_part_ack_url_template": null
}
```

(The response does **not** echo the bearer token — the client already has it.)

### Single-PUT path (§12)

`PUT /content` streams the body to `put_object`; the server verifies size and (cheaply, since it has
the bytes) `checksum_sha256`, then finalizes.

### Chunked path (§12)

Each `PUT /parts/{n}` (1-based) streams to `upload_part`. The client *may* send
`X-Clipline-Part-SHA256`; the server **computes the SHA-256 while streaming the part regardless**,
rejects the part if a supplied header mismatches, and stores **its own** server-computed checksum
(never the client's claim) along with `size_bytes` and the storage `etag`, then bumps
`received_size_bytes`. `GET /uploads/{id}` reports `received_parts` / `missing_parts` so an
interrupted client resumes exactly where it stopped.

```json
{
  "upload_id": "01JZ8T2N8MM86AGD9TD98DQ1RE",
  "clip_id": "01JZ8T2K9V7S8F5GTRR0VYR1WX",
  "status": "uploading",
  "file_size_bytes": 83214521,
  "part_size_bytes": 8388608,
  "received_parts": [1, 2, 3, 4, 5],
  "missing_parts":  [6, 7, 8, 9, 10]
}
```

**Duplicate parts.** `PUT /parts/{n}` is **idempotent** when the uploaded checksum matches the
already-stored checksum (safe to retry on flaky connections). Re-uploading an already-accepted part
number with a **different** checksum returns **`409 Conflict`** unless the upload session is
explicitly reset.

### Optional direct-to-S3 part transport (§12 / Phase 4)

When `CLIPLINE_DIRECT_S3_UPLOADS=true` and `storage_backend=s3`, the create response for chunked
uploads also includes:

```json
{
  "direct_part_presign_url_template": "/api/v1/uploads/01JZ8T2N8MM86AGD9TD98DQ1RE/parts/{part_number}/presign",
  "direct_part_ack_url_template": "/api/v1/uploads/01JZ8T2N8MM86AGD9TD98DQ1RE/parts/{part_number}/ack"
}
```

The server still owns the upload session and S3 multipart upload ID. For each missing part:

1. The client calls `POST /parts/{n}/presign`.
2. The server validates ownership/session state, then returns a short-lived S3 `UploadPart` PUT URL,
   the expected part size, expiry, and any required headers.
3. The client PUTs the exact part bytes to S3.
4. The client calls `POST /parts/{n}/ack` with `size_bytes`, whole-part `checksum_sha256`, and the
   S3 `ETag` returned by the PUT.
5. The server stores that part record and the normal `POST /complete` path assembles the S3 multipart
   upload with stored ETags.

This is an alternate **transport** for the chunked path, not a new lifecycle. `GET /uploads/{id}`,
`POST /complete`, and `DELETE /uploads/{id}` behave the same as server-proxy uploads.

**Integrity difference:** for server-proxy `PUT /parts/{n}`, the server computes and stores each
part checksum itself. For direct-S3 uploads, the ack endpoint stores the client-reported part
checksum and ETag because the API server never sees the bytes. The authoritative whole-object check
remains the asynchronous `validate_object` job after completion. Treat the ack checksum as resumable
upload metadata, not as final proof of object integrity.

**Size enforcement difference:** `expected_size_bytes` in the presign response tells the client which
byte range to upload, but the presigned S3 `UploadPart` URL does not itself enforce that length. The
ack `size_bytes` value is also client-reported metadata used for progress and complete-time part
accounting. The first server-observed size check in direct mode is the post-complete `head_object`
check; if the assembled object size differs from `expected_size_bytes`, the upload is marked failed
and the clip never becomes ready.

### Complete (§12)

The server verifies every part is present and `Σ size == expected_size_bytes`, then calls
`complete_multipart_upload` with the stored ETags.

**`POST /complete` is idempotent, because it spans two systems** (object storage and the DB) that
can't be updated atomically — the server can crash between `CompleteMultipartUpload` succeeding and
the DB commit, after which the S3 multipart upload ID no longer exists and a naive retry fails with
`NoSuchUpload` even though the final object may already be assembled. Reconciliation rule:

```
On POST /complete:
  if upload_session.status == 'completed':
      return the existing clip/upload state (200)         # already done
  try storage.complete_multipart_upload(...)
  on NoSuchUpload / already-completed error:
      meta = storage.head_object(storage_key)
      if meta exists and meta.size_bytes == expected_size_bytes:
          mark session completed; enqueue validate_object; return processing
      else:
          keep the session retryable, or mark failed on a hard storage error
```

Crash-then-retry is safe: either the object is there (adopt it) or it isn't (retry/fail), with no
dependence on the consumed multipart upload ID.

> **Integrity (be precise about S3):** in the server-proxy chunked path, the per-part checksum is
> always **server-computed**, never a client claim. On **local**, `complete` also verifies whole-file
> SHA-256 (the server has all the bytes). On **S3**, completion verifies part presence, part sizes,
> recorded part checksums, and S3 ETags; whole-object SHA-256 verification is **asynchronous** (a
> background `validate_object` job streams the object — doc 06) *unless* S3 native checksums
> (SHA-256/CRC32 on multipart) are enabled, in which case S3 verifies on `CompleteMultipartUpload`.
> Treat **S3 ETags as completion handles, not cryptographic integrity proofs** — providers vary. The
> product does **not** claim end-to-end hash verification at completion in S3 mode.

The clip becomes viewable only after `complete` succeeds **and** processing reaches `ready` (doc
06). `uploaded_at` is stamped **server-side** at this point — never from a client clock.

### Limits & defaults that bind here (§20)

Max upload size; allowed containers/MIME types (v1: `mp4` only — Clipline emits MP4); max active
upload sessions per user; upload session TTL (default 24h); strict server-side content-type/
extension handling; **no client-controlled paths.** Defaults: max upload 5 GiB; part size 8 MiB;
single-PUT threshold 64 MiB; default visibility `private`.

### Future (not v1)

Direct-to-S3 multipart via presigned part URLs is now scaffolded as the Phase-4 extension above, but
still requires desktop-client support before doc 14 marks it shipped. TUS remains a possible later
replacement if resumability requirements outgrow this first-party flow.

## Implementation checklist

- [x] `POST /uploads` — idempotent on `(owner, client_clip_id)`: returns existing clip/session if present
- [x] Create flow builds `clips` (`status=created`) + `upload_sessions`, generates storage key/media token (doc 03)
- [x] Part-size formula implemented and **pinned** on the session row; `mode` chosen by single-PUT threshold
- [x] S3 chunked create calls `create_multipart_upload`, stores `storage_upload_id`
- [x] `PUT /content` single-PUT: stream to storage, verify size + whole-file checksum, finalize
- [x] `PUT /parts/{n}` (1-based, `[1,10000]`): stream to `upload_part`, server-compute SHA-256, store own checksum + size + etag, bump `received_size_bytes`
- [x] `X-Clipline-Part-SHA256` mismatch → reject; duplicate same-checksum part → idempotent 200; different-checksum → `409`
- [x] Non-final S3 parts enforced ≥ 5 MiB
- [x] `GET /uploads/{id}` reports `received_parts` / `missing_parts` (resumability)
- [x] `POST /complete`: verify all parts present + `Σ size == expected`; idempotent with the `head_object` reconciliation rule
- [x] Local complete verifies whole-file SHA-256; S3 complete verifies parts/sizes/checksums/ETags and enqueues async `validate_object`
- [x] `uploaded_at` stamped server-side at finalize; enqueue `validate_object` (doc 06)
- [x] `DELETE /uploads/{id}` aborts session + storage multipart and cleans temp parts
- [x] Enforce per-endpoint authz (caller owns the session), session not expired, MP4-only content-type, no client paths, max-size + max-active-sessions limits
- [x] Phase-4 scaffold: disabled-by-default direct-S3 presign + ack endpoints for chunked uploads
- [x] Phase-4 direct-S3 MinIO smoke: presign -> PUT to S3 -> ack -> complete -> validate
- [ ] Phase-4 direct-S3 desktop-client upload path

## Definition of done

- [x] A large clip uploads via the chunked path on **both** local and S3 and reaches `processing`
- [x] A small clip (< 64 MiB) uses single-PUT and verifies its whole-file checksum
- [x] Killing the client mid-upload and resuming completes using `missing_parts` (no re-upload of received parts)
- [x] Re-issuing `POST /uploads` with the same `client_clip_id` returns the same clip (no duplicate)
- [x] Simulated crash between storage-complete and DB-commit → retried `POST /complete` adopts the existing object (no `NoSuchUpload` failure)
- [x] Re-uploading a part with a different checksum returns `409`; with the same checksum returns 200
- [x] No non-final S3 part smaller than 5 MiB is accepted
- [x] Upload create enforces instance VOD policy and per-user storage quota before allocating a new session

## Progress log

- 2026-06-16: Added the `/api/v1/uploads` route set in the server: idempotent create,
  resumable progress, single-PUT content upload, chunked part upload, completion, and abort.
- 2026-06-16: Extended DB repositories for upload lookup, active-session counting, received-size
  updates, completion/abort/fail state changes, part summing/deletion, and clip
  `uploaded_at`/`processing` finalization.
- 2026-06-16: Enforced upload authz, CSRF for cookie-backed state changes, MP4-only create/single
  PUT handling, max upload size, max active sessions, pinned part-size selection, part checksum
  mismatch rejection, duplicate part idempotency/conflict behavior, S3 non-final 5 MiB minimum,
  local whole-file checksum verification, and validate-object job enqueueing.
- 2026-06-16: Verified with `cargo fmt --all --check`, `cargo test --workspace`,
  `cargo build --workspace`, a local HTTP smoke test covering single PUT, idempotent create,
  resumable chunked upload, duplicate/conflicting parts, abort cleanup, DB processing/jobs checks,
  and manual storage-complete/DB-crash reconciliation, plus an S3/MinIO smoke test covering
  chunked upload, non-final S3 part rejection, completion, and processing/job state.
- 2026-06-17: Added the disabled-by-default direct-S3 upload scaffold: discovery/admin capability,
  create-response direct part templates, `POST /parts/{n}/presign`, `POST /parts/{n}/ack`, S3
  presigned `UploadPart` URL support, and docs for the integrity difference from server-proxy
  part uploads.
- 2026-06-17: Extended the Docker MinIO smoke to enable direct-S3 uploads, force a tiny MP4 through
  the chunked path, request a presigned part URL, PUT the part directly to MinIO, ack the S3 ETag,
  complete the upload, and wait for the clip to validate as ready.
- 2026-06-19: Added admin-configurable VOD policy at upload create. If full-length VOD uploads are
  disabled, `duration_ms` is required and uploads at or above the configured threshold minutes are
  rejected before a new session is allocated. Per-user storage quotas now override the instance
  default quota when set.
