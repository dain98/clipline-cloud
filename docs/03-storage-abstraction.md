# 03 — Storage Abstraction (local + S3)

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 01 (config), doc 02 (so `/readyz` storage probe can join the DB probe)
**Design sections:** §11

> Goal: one `StorageBackend` trait with **two** implementations — local filesystem and
> S3-compatible — that behave identically to the rest of the app. Both ship in v1. Implementation
> may do local-first then add S3, **but S3 is part of the v1 bar, not a later release.**

---

## Goal

`clipline-cloud-storage`: the `StorageBackend` trait plus local and S3 adapters, the random-token
object-key layout, and the multipart primitives the upload protocol (doc 05) wires straight into.
The API and DB never see filesystem paths — only logical, server-generated object keys.

## Design context

### The trait (§11)

```
trait StorageBackend {
  put_object(key, stream, metadata)
  get_object(key, range?) -> stream            // range for HTTP 206
  head_object(key) -> ObjectMetadata {         // metadata WITHOUT opening a stream
    size_bytes, content_type, etag, last_modified, checksum_sha256?
  }
  delete_object(key)
  object_exists(key) -> bool

  create_multipart_upload(key) -> upload_id
  upload_part(upload_id, key, part_number, stream) -> PartResult { etag, size }
  complete_multipart_upload(upload_id, key, parts[])
  abort_multipart_upload(upload_id, key)

  create_read_url(key, ttl) -> Option<Url>      // Some(..) for S3 presign; None for local
}
```

`head_object` exists because range responses, upload validation, thumbnail/poster jobs, and cleanup
all need size / content-type / ETag / last-modified (and optionally a checksum) **without streaming
the object body.**

### Local adapter (§11)

- `create_multipart_upload` allocates a temp dir; `upload_part` writes `part_<NNNN>`.
- **Completion is crash-safe:** validate all parts, concatenate in part-number order into
  `source.mp4.tmp`, `fsync`, then **atomically rename** to the final key. The server never exposes a
  partially assembled final object.
- `create_read_url` returns `None`, signalling the caller to proxy.

### S3 adapter (§11)

- Maps 1:1 to S3 multipart; `complete` passes the stored per-part ETags.
- `create_read_url` returns a presigned GET.
- Honors `CLIPLINE_S3_ENDPOINT`, `_BUCKET`, `_REGION`, `_ACCESS_KEY_ID`, `_SECRET_ACCESS_KEY`,
  `_FORCE_PATH_STYLE`, `_PREFIX` (config from doc 01).

### Object key layout (§11) — identical logical keys on both backends

Keys are built from a **random, non-sortable 256-bit media token** per clip — *not* from
`user_id`/`clip_id` — because S3 mode hands the raw object key to public viewers inside the
presigned URL. ULID-derived paths would leak internal IDs and rough creation timing through that
URL, partially defeating the random public share ID (doc 08). The owner/clip mapping lives only in
the database (`clips.storage_key` etc.):

```
objects/media/<random-256-bit-token>/source.mp4
objects/media/<random-256-bit-token>/poster.jpg
objects/media/<random-256-bit-token>/thumb_320.jpg
```

The media token is independent of `public_share_id` (so regenerating a share link never moves
objects) and of entity ULIDs (so the key reveals nothing). It is generated **server-side**; the
backend never trusts a client-supplied path.

- **Local disk** lays these under `CLIPLINE_DATA_DIR`: `/data/objects/media/<token>/...`, with
  `/data/tmp/uploads/<session>` for in-progress parts.
- **S3** keeps the bucket **private by default.** Public clips are still presented through the
  Clipline frontend (a share page), backed by either a backend proxy or a short-lived presigned GET
  — never permanent public bucket ACLs.

## Implementation checklist

- [x] `clipline-cloud-storage` crate defining the `StorageBackend` trait + `ObjectMetadata` / `PartResult`
- [x] Server-side random 256-bit media-token generator + key-builder (`objects/media/<token>/...`)
- [x] **Local adapter**: `put_object`, ranged `get_object`, `head_object`, `delete_object`, `object_exists`
- [x] Local multipart: temp dir + `part_<NNNN>`, validate → concat in order → `.tmp` → `fsync` → atomic rename
- [x] Local `create_read_url` returns `None`
- [x] Local in-progress parts live under `/data/tmp/uploads/<session>`
- [x] **S3 adapter**: object ops + multipart mapped 1:1 to S3 (`create`/`upload_part`/`complete` with stored ETags/`abort`)
- [x] S3 `create_read_url` returns a presigned GET; bucket stays private by default
- [x] S3 adapter honors endpoint/bucket/region/keys/path-style/prefix config
- [x] Backend selected at startup from `CLIPLINE_STORAGE_BACKEND`; never trusts client-supplied paths
- [x] `/readyz` storage-reachability probe implemented (joins the doc-02 DB probe)

## Definition of done

- [x] The same `StorageBackend` calls produce identical logical keys and behavior on local and S3
- [x] Local completion is crash-safe (no partial final object ever observable); verified by a test that interrupts between concat and rename
- [x] S3 multipart round-trips against MinIO (the doc-11 `docker-compose.minio.yml` profile)
- [x] Object keys contain only the random media token — no ULIDs, no user IDs, no timing signal
- [x] `/readyz` reports storage unreachable correctly when the backend is down/misconfigured

## Progress log

- 2026-06-16 — Implemented `clipline-cloud-storage` with a shared `StorageBackend` trait,
  random 256-bit media-token object keys, local filesystem storage, S3-compatible storage, ranged
  reads, metadata heads, multipart primitives, presigned S3 read URLs, and server backend selection
  from `CLIPLINE_STORAGE_BACKEND`.
- 2026-06-16 — Wired `/readyz` to check both DB and storage. Verified local ready and broken-local
  not-ready responses, local path traversal rejection, local object/range/delete behavior,
  crash-safe multipart completion before final rename, normal workspace build/tests, and an ignored
  MinIO S3 round-trip test run against a disposable `minio/minio` container.
