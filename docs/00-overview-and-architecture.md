# 00 — Overview & Architecture

**Phase:** Reference (read before starting any milestone)
**Status:** ☑ Complete
**Depends on:** nothing
**Design sections:** §1–§6, §8, §22, §23, §29, Appendices A–D

> This is context, not a build step. It defines *what Clipline Cloud is*, the opinionated decisions
> that constrain every later milestone, the component architecture, identifier scheme, privacy
> model, configuration surface, and repository layout. Reread the relevant part whenever a later doc
> references a decision here.

---

## One sentence

Clipline Cloud is a **self-hosted clip library and sharing server** for Clipline — users keep
control of the host, storage, accounts, and public links while still getting the
upload-and-share workflow expected from a modern game clipper.

## 1. Summary

A self-hosted web app + API server that lets the Clipline desktop client upload recorded clips to a
host the user controls, and lets users/admins browse, manage, and share those clips from a web
frontend. Deployable with Docker Compose, points the desktop app at a host URL, and **never depends
on Clipline-operated infrastructure**.

One backend serves two clients:

- The **Clipline desktop app** — authenticates and uploads clips.
- The **Clipline Cloud web frontend** — manages clips, visibility, accounts, and storage.

Storage is pluggable: a mounted local data directory (the simplest default) or any S3-compatible
provider (MinIO, Backblaze B2, Cloudflare R2, Wasabi, AWS S3). **Both local and S3 are in scope for
v1** — local is the default Compose path, but S3 support is required before the backend is v1-complete.

## 2. Goals and Non-Goals

**v1 delivers a complete self-hosted clip-sharing loop:** deploy with Compose → first-run owner →
owner/admin creates users → desktop app connects with a host URL + credentials, receives a revocable
device token, and uploads → clips appear in the owner's library → owner sorts/filters, sets
private/public, and shares public clips via non-guessable URLs. Storage works identically on local
disk or S3.

**Still out of scope:** a central Clipline account system; federation; mobile apps; real-time chat;
end-to-end encrypted media; multi-tenant commercial hosting; and OAuth/OIDC login. The current
product does include a public discovery feed, comments, recommendations, and optional server-side
video optimization; the privacy and operator-control principles below still apply to them.

## 3. Design Principles

Follows the desktop app's philosophy: local-first, privacy-aware, user-controlled, minimal.

- The backend never phones home to Clipline-owned services.
- The whole stack runs on a single machine with Docker Compose, with **no required second
  container** in the default (SQLite + local disk) configuration.
- Infrastructure is open and replaceable: a single embedded database by default, a storage
  abstraction, and static frontend assets served by the backend.
- The desktop app never persists the user's password — it exchanges credentials once for a revocable
  device token stored in the platform credential store.
- The backend never stores plaintext passwords. **Argon2id only.**
- The storage layer is abstracted so local disk and S3 behave identically to the rest of the app.

## 4. Resolved Decisions (the opinionated part)

Each is a deliberate v1 commitment. Later milestones must honor these.

1. **Database: SQLite is the default/required v1 database; Postgres is supported.**
   Read-heavy, modest writes, single node → fits SQLite + WAL. A required Postgres container is
   exactly the friction a hobbyist audience doesn't want. Postgres is selected via
   `CLIPLINE_DATABASE_URL`; CI runs migrations and repository tests on both backends
   (dual-backend support is migration testing, SQL-dialect discipline,
   pagination/timestamp/transaction-semantics checks, and per-backend backup docs — not a
   connection-string swap).
2. **Tokens are opaque, never JWT.** Hashed-at-rest storage, revocation from the web UI, and
   `last_used_at` only work with opaque random tokens looked up by hash. Both browser sessions and
   desktop device tokens are opaque random strings stored as SHA-256 hashes.
3. **Identifiers are ULIDs stored as `TEXT`.** Time-sortable IDs give better index locality for
   time-ordered library views than random UUIDv4, and `TEXT` ULIDs port trivially across SQLite and
   Postgres. Public share IDs are a *separate*, random, non-sortable token (§15 / doc 08).
4. **`client_clip_id` is an enforced idempotency key**, not advisory metadata (docs 05/07).
5. **Chunked upload is the default path; single-PUT is the small-file exception.** 1080p60 clips
   routinely exceed several hundred MiB; a non-resumable multi-GiB PUT that dies at 90% wastes
   everything. Single-PUT only below a configurable threshold (default 64 MiB).
6. **One upload protocol, wired directly to the storage abstraction's multipart methods.** The
   client's chunk boundaries *are* the S3 multipart part boundaries (1-based), so the backend never
   buffers a whole part to re-chunk it.
7. **Public media is served inline.** No download button by default; in S3 mode the page points at a
   short-lived presigned GET with `Content-Disposition: inline`. This is **not DRM** — viewers can
   still save the bytes — and the product says so plainly. S3 ships within v1, not as an add-on.
8. **`private` means application-level access control, not cryptography.** The operator runs the
   infrastructure and can technically read files and rows. E2E encryption is out of scope.
9. **No social features, no self-registration, manual upload only, public links stable-until-revoked.**
10. **Reported game names are immutable source metadata, organized through managed categories.**
    Every nonblank name reported by a clip maps case-insensitively to one canonical game category.
    Administrators may edit category presentation, merge categories, and separate a reported name
    again without rewriting any clip. Optional SteamGridDB matches and artwork belong to the
    category, not to the raw reported name.

## 5. Architecture

Five components:

- **Clipline Desktop Client** — existing Tauri/Rust app; gains a Cloud settings page + upload flow.
- **Web Frontend** — login, library, clip detail, share pages, admin. Static assets, served by the backend.
- **API Backend** — auth, users, clip metadata, upload sessions, permissions, public links, storage
  coordination, lightweight processing.
- **Database** — SQLite by default, Postgres optional.
- **Storage** — local filesystem or S3-compatible, behind one abstraction.

A typical deployment:

```
clipline-desktop
      |
      |  HTTPS API
      v
reverse proxy (Caddy/Traefik/nginx)   <- TLS terminates here in prod
      |
      v
clipline-cloud-backend
      |-- sqlite file (default)  OR  postgres (optional)
      |-- local /data directory  OR  S3-compatible storage
      |-- in-process job runner (durable jobs table, docs 06)
      `-- frontend static assets (served directly)
```

For v1 the backend serves the frontend's static files itself. A separate frontend container is
allowed but the simpler single-process deployment is preferred.

## 6. Technology Stack

**Backend:** Rust with Axum, Tokio for async I/O, SQLx for DB access (SQLite + Postgres), Argon2id
for password hashing, opaque tokens. The backend image bundles `ffmpeg`/`ffprobe` for
thumbnail/poster generation and metadata backfill — so it is **not** a tiny static binary; this is a
deliberate, stated dependency.

**Frontend:** Preact, HTM templates, and esbuild, with HTML5 `<video>` playback. The compiled static
assets are committed and served by the backend. No proprietary cloud dependency.

**Storage:** local filesystem adapter + S3-compatible adapter behind one trait. Optional MinIO
Compose profile for local S3 testing.

**Reverse proxy:** Caddy is the documented default (automatic HTTPS). The base Compose file exposes
the app port directly; a Caddy example is provided for production.

## 8. Identifiers

- **Entity IDs** (`users`, `clips`, `sessions`, …): ULID, stored as 26-char `TEXT`. Time-sortable, so
  inserts cluster well and the `*_recorded_at`/`*_uploaded_at` index views stay tight. (UUIDv7 is an
  equivalent choice; ULID chosen for compactness.)
- **Public share IDs:** deliberately *not* derived from entity IDs and *not* sortable. A separate
  random token, `c_` + 22 chars base62, e.g. `c_7Gx9rLmP2qVaFz31N6db`. Sequential/guessable public
  URLs are never exposed.
- **Tokens** (session, device, reset): 256 bits of CSPRNG randomness, base64url-encoded, with a
  human-readable prefix (`clp_ses_`, `clp_dev_`). Shown to the client once; only the SHA-256 hash is
  persisted.

## 22. Privacy Model

Stated plainly to the user, because people read "private" as cryptographic:

- Private clips are private from other normal users and are not public on the web.
- The instance operator runs the server, database, and storage and **can technically access files
  and rows.**
- True secrecy from the operator would require end-to-end encryption, which is out of scope for v1.

In v1, **private = application-level access control**, nothing more, and the product never claims
otherwise. (Reinforced in the admin model: no casual "view everyone's private clips" UI — doc 09.)

## 23. Configuration (full reference)

The complete env surface. Authoritative loading/validation rules live in doc 01.

```
CLIPLINE_PUBLIC_URL                 # required for share links; warns if not HTTPS
CLIPLINE_BIND_ADDR
CLIPLINE_DATABASE_URL[_FILE]        # sqlite:///data/clipline.db (default) | postgres://...

CLIPLINE_BOOTSTRAP_ADMIN_USERNAME
CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD
CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD_FILE
CLIPLINE_STEAMGRIDDB_API_KEY[_FILE] # optional; admin game search and category artwork

CLIPLINE_STORAGE_BACKEND            # local | s3
CLIPLINE_DATA_DIR                   # required for local

CLIPLINE_S3_ENDPOINT
CLIPLINE_S3_BUCKET
CLIPLINE_S3_REGION
CLIPLINE_S3_ACCESS_KEY_ID[_FILE]
CLIPLINE_S3_SECRET_ACCESS_KEY[_FILE]
CLIPLINE_S3_FORCE_PATH_STYLE
CLIPLINE_S3_PREFIX

CLIPLINE_MAX_UPLOAD_SIZE_BYTES
CLIPLINE_UPLOAD_PART_SIZE_BYTES     # must be >= 5 MiB for S3
CLIPLINE_SINGLE_PUT_MAX_BYTES       # default 64 MiB
CLIPLINE_UPLOAD_SESSION_TTL_SECONDS
CLIPLINE_DIRECT_S3_UPLOADS          # optional Phase-4 direct upload; false by default, s3 only
CLIPLINE_VIDEO_OPTIMIZATION         # off (default) | on; optional lossy source optimization
CLIPLINE_VIDEO_OPTIMIZATION_CRF     # default 26
CLIPLINE_VIDEO_OPTIMIZATION_PRESET  # default veryfast
CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH # optional; 0/unset disables resize
CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT # default 5
CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL # false by default
CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER
CLIPLINE_USER_STORAGE_QUOTA_BYTES   # optional; 0/unset disables
CLIPLINE_GLOBAL_STORAGE_WARNING_THRESHOLD_BYTES # optional; 0/unset disables
CLIPLINE_PUBLIC_MEDIA_MODE          # presigned (default) | proxy
CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS # default 300
CLIPLINE_TRUSTED_PROXY_HOPS         # comma-separated proxy IPs allowed to set X-Forwarded-For

CLIPLINE_SESSION_SECRET[_FILE]      # HMAC for CSRF tokens (NOT session validation)
CLIPLINE_LOG_LEVEL
```

Config is validated at startup; the app fails loudly on invalid storage/DB settings. `local`
requires `CLIPLINE_DATA_DIR`; `s3` requires endpoint, bucket, access key, secret key;
`CLIPLINE_PUBLIC_URL` is required for share links.

## 29. Repository Layout

**Monorepo, inside `dain98/clipline`.** The decisive reason: the desktop app is Rust/Tauri and the
backend is Rust, so a shared `clipline-cloud-api-types` crate lets the upload/auth contract be
type-checked on *both* ends. A separate repo is operationally cleaner but loses that, and the
coordination cost between desktop and server is exactly where bugs hide.

```
clipline/
  crates/
    clipline-cloud-api-types/   # shared request/response types (desktop + server)
    clipline-cloud-api/         # Axum handlers, auth, permissions
    clipline-cloud-core/        # domain logic, clip lifecycle, job runner
    clipline-cloud-storage/     # StorageBackend trait + local/s3 adapters
    clipline-cloud-db/          # SQLx, migrations, repositories
  apps/
    clipline-cloud-server/      # binary: serves API + static frontend
    clipline-cloud-web/         # frontend
  deploy/compose/               # the Compose profiles (doc 11)
  docs/cloud/                   # deployment, configuration, api, backup-restore
```

The milestone docs map onto these crates: doc 01 sets up the workspace + `*-server`; doc 02 →
`*-db`; doc 03 → `*-storage`; docs 04–08 → `*-api` + `*-core`; the shared contract types accrue in
`*-api-types` throughout; doc 09 → `*-web`; doc 10 → the desktop app.

---

## Appendix A — Resolved Open Questions

| Question | v1 decision |
|---|---|
| Can admins view all users' private clips in the UI? | No casual "view all" UI. Admins see storage/account metadata only. The privacy model (§22) is honest that the operator controls the infrastructure. |
| Are public clips downloadable? | No download button by default; served inline. Not DRM — viewers can still copy the bytes. An explicit download toggle is a later per-clip / instance setting. |
| Self-registration? | Disabled by default; omitted from v1. |
| Auto-upload rules in desktop v1? | No. Manual upload first; auto-upload later. |
| Do public links expire? | Stable until revoked; expiring links are a future feature. |
| Accept uploads from non-Clipline clients? | API is clean and documented, but the supported client is Clipline. |

## Appendix B — Changes From the Original Draft (round 1)

- **Tokens:** committed to opaque (dropped JWT) so hashed-at-rest storage, revocation, and
  `last_used_at` actually work.
- **IDs:** unified on ULID-as-`TEXT` everywhere, for index locality and SQLite/Postgres portability.
- **Database:** flipped the default to SQLite (Postgres optional) to match the hobbyist goal; schema
  made portable with a type-mapping table.
- **Idempotency:** `client_clip_id` made an enforced `UNIQUE(owner, client_clip_id)` with defined
  repeat-request behavior.
- **Upload protocol ↔ storage:** explicitly wired together (`storage_upload_id`, per-part `etag`);
  client chunk size pinned to S3 part size.
- **Integrity:** whole-file `checksum_sha256` declared at create time.
- **Upload sizing:** chunked default, single-PUT for small files.
- **New columns:** `source_type`, `checksum_sha256` on `clips`; `etag`, `storage_upload_id` on upload tables.
- **Smaller fixes:** server-authoritative `uploaded_at`; upload response no longer echoes the bearer
  token; `X-Forwarded-For` trust scoped to the proxy hop; `CLIPLINE_SESSION_SECRET` role clarified;
  migrations take a Postgres advisory lock; ffmpeg dependency stated outright.

## Appendix C — Changes In Revision (round 2, post-review)

- **S3 moved into v1.** "Pluggable (local or S3)" is a v1 requirement, so S3 is in the Phase-1
  completeness target. Phases renumbered (old 5 → 4).
- **Database commitment tightened.** SQLite is the only *required* v1 DB; Postgres "supported" only
  once CI proves both backends.
- **Part numbers are 1-based `[1, 10000]` everywhere**, matching S3 multipart. Added duplicate-part
  idempotency + `409` on checksum mismatch.
- **S3 integrity wording corrected.** Completion verifies part presence/sizes/checksums/ETags;
  whole-object SHA-256 is asynchronous unless S3 native checksums are enabled.
- **"Streamable, not downloadable" replaced** with honest language: inline, no download button, **not
  DRM**, copyable; presigned GETs use `Content-Disposition: inline`.
- **Storage trait gained `head_object` / `ObjectMetadata`.**
- **Crash-safe local completion specified:** temp parts → validate → concat to `.tmp` → `fsync` →
  atomic rename.
- **Added a durable `jobs` table** so processing and cleanup survive restarts.
- **CSRF simplified** to one `SameSite=Lax` cookie + CSRF token + `Origin`/`Referer` checks, with
  re-auth for sensitive admin actions.
- **Desktop transport guard:** refuses non-HTTPS hosts except `localhost`/`127.0.0.1`/RFC1918, behind
  an explicit plaintext-password confirmation.
- **Compose fixed:** minimal example uses the generated first-run password; a second example shows
  the full Docker `secrets:` block.
- **SQLite operational requirements added** (WAL, `foreign_keys=ON`, `busy_timeout`, short
  transactions, no NFS/SMB, single-writer) and a backup caveat (no live-file copy).

## Appendix D — Changes In Revision (round 3, post-review)

After this round the design is treated as an implementation base rather than something to keep rewriting.

- **(Required) Storage keys randomized** to `objects/media/<random-256-bit-token>/...` — ULID-derived
  keys leaked internal IDs/timing through public presigned URLs.
- **(Required) Durable job locking/recovery.** Added `locked_by`/`locked_at`, atomic
  `UPDATE ... RETURNING` claim, stale-lock requeue rule.
- **(Required) Idempotent multipart-complete reconciliation** via `head_object` adoption on
  `NoSuchUpload`/already-completed.
- **(Required) Minimal Compose `CLIPLINE_PUBLIC_URL` fixed** to `http://localhost:8080`.
- **Part-size selection is now formulaic:** `round_up_MiB(max(configured, ceil(size/10000), 5 MiB for s3))`.
- **Checksum mechanism specified:** optional `X-Clipline-Part-SHA256`; server computes and stores its
  own checksum regardless; S3 ETags labelled completion handles, not cryptographic proofs.
- **Presigned revocation/CORS spelled out.**
- **ffmpeg untrusted-media boundary** written down as a hard requirement for the Phase-2 decoding job.
- **Discovery slimmed:** removed storage backend from the client-facing feature contract.

---

## Read-and-understood checklist

- [x] Resolved decisions (§4) understood — these constrain every later milestone
- [x] Component architecture and the single-process default understood
- [x] Identifier scheme understood (ULID entity IDs vs random public share IDs vs hashed tokens)
- [x] Privacy model understood and will be reflected honestly in product copy
- [x] Config surface and repo/crate layout understood

## Progress log

- 2026-06-16 — Read before implementation; used as the source for milestone 01 workspace,
  configuration, logging, static-serving, and Dockerfile decisions.
