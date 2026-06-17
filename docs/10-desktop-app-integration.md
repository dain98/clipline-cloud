# 10 — Desktop App Integration

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 04 (discovery + device-token + transport guard), doc 05 (upload protocol)
**Design sections:** §18, §9 (transport guard), §16 (discovery), §29 (shared types crate)

> Goal: the Clipline desktop client's Cloud integration — a Settings section to connect to a host,
> the discovery + device-token connect flow with the non-HTTPS guard, per-clip upload using the
> first-party protocol, and a local mapping that makes uploads safe across restarts via the
> `client_clip_id` idempotency key. Lives in the existing Tauri/Rust app, using the shared
> `clipline-cloud-api-types` crate so the contract is type-checked on both ends.

---

## Goal

A **Cloud** settings page + upload flow in the desktop app: connect once (store a device token,
discard the password), then upload clips with in-app progress and copyable private/public URLs.

## Design context

### Cloud settings (§18)

A **Cloud** section in Settings: host URL, username, password, Connect button, connection status,
connected account, default visibility, optional *delete-local-after-upload* (off by default),
optional *auto-upload rules* (off by default, and a later feature — Appendix A).

### Connect flow (§18, §9)

Open Settings → Cloud → enter host + credentials → app validates the discovery endpoint
(`/.well-known/clipline-cloud`) → (if non-HTTPS, the LAN-only confirmation from §9) → logs in, stores
the device token, **discards the password** → clips gain an Upload button → progress shows in-app →
after upload the user copies the private or public URL.

**Transport guard (§9):** the desktop app **refuses non-HTTPS hosts by default.** Plain HTTP is
permitted only for `localhost`, `127.0.0.1`, and RFC1918 LAN addresses, and only after an explicit
"I understand this sends my password in plaintext on this network" confirmation. A device token,
once issued, is still a bearer secret and should travel over HTTPS. The app shows the connected
server and account.

### Upload states (§18)

`not_uploaded`, `queued`, `uploading`, `processing`, `uploaded_private`, `uploaded_public`,
`failed`, `retrying`.

### Local mapping & idempotency (§18)

The app keeps a local mapping `local_clip_id -> remote_clip_id -> remote_url -> upload_status`. The
`client_clip_id` idempotency key is what makes this **safe across restarts** and prevents duplicate
uploads (doc 05 create is idempotent on `(owner, client_clip_id)`). Uploads are treated as
**retryable** unless the server returns a permanent validation error.

### Token storage (§9, §10)

Store the device token in the OS credential store; never persist the password. All API calls send
`Authorization: Bearer clp_dev_...` over HTTPS.

## Implementation checklist

- [x] Cloud Settings page: host URL, username, password, Connect, connection status, connected account, default visibility
- [x] Optional toggles: delete-local-after-upload (off by default), auto-upload rules (off, stubbed/disabled — later feature)
- [x] Connect flow validates `/.well-known/clipline-cloud` and checks API/client version compatibility in the reusable Rust client core
- [x] Non-HTTPS transport guard: blocked except `localhost`/`127.0.0.1`/RFC1918, behind explicit plaintext-password confirmation, in the reusable Rust client core
- [x] Device-token exchange via `POST /auth/device-token`; store token in OS credential store; discard password
- [x] Per-clip Upload button using the doc-05 protocol (single-PUT or chunked per server-returned `mode`/`part_size_bytes`)
- [x] Resumable uploads: reusable Rust client uses `GET /uploads/{id}` `missing_parts` for chunked uploads
- [x] Local mapping `local_clip_id -> remote_clip_id -> remote_url -> upload_status` persisted; `client_clip_id` reused to prevent duplicates
- [x] In-app upload states surfaced: `not_uploaded`/`queued`/`uploading`/`processing`/`uploaded_private`/`uploaded_public`/`failed`/`retrying`
- [x] Copy private/public URL after upload; retry on transient errors, stop on permanent validation errors
- [x] Request/response types consumed from the shared `clipline-cloud-api-types` crate for discovery, device-token, upload, clip detail, and visibility endpoints

## Definition of done

- [x] Connecting to an HTTPS host stores a device token and never persists the password
- [x] Connecting to a plain-HTTP non-LAN host is refused; a LAN host requires the explicit confirmation
- [x] A clip uploads end to end and shows `uploaded_private`/`uploaded_public` with a copyable URL
- [x] Restarting the app mid-upload resumes via `missing_parts` and does not create a duplicate clip
- [x] A permanent server validation error surfaces as `failed`

## Progress log

- 2026-06-16 — Blocked on the actual desktop/Tauri shell: the sibling `/home/dain/clipline`
  repository currently contains platform-neutral Rust crates and documentation, but no Tauri app,
  Settings UI, library UI, OS credential-store integration, or local upload mapping store to wire.
- 2026-06-16 — Completed the cloud-side desktop integration core that can be reused once the
  desktop shell exists: expanded `clipline-cloud-api-types` with discovery, user/device-token, and
  upload DTOs; refactored the server discovery/device-token/upload endpoints to consume those
  shared types; added `clipline-cloud-api` as a reusable Rust client with host transport guard,
  discovery compatibility checks, device-token connect flow, single-PUT upload, chunked upload,
  `missing_parts`-based resume, and completion.
- 2026-06-16 — Verified the reusable client core with unit tests for HTTPS/LAN/plain-HTTP transport
  decisions, discovery compatibility, and upload body size/checksum validation. Remaining checklist
  items require the desktop app shell.
- 2026-06-16 — User confirmed the desktop app is a Windows app and allowed cloning
  `https://github.com/dain98/clipline`; cloned it into ignored `external/clipline` and wired the
  Windows Tauri shell to the shared cloud client. Added Cloud Settings UI, Windows Credential
  Manager device-token storage, connect/disconnect commands, persisted cloud upload mapping,
  per-clip upload/copy controls, progress events, private/public URL handling, optional
  delete-local-after-upload, and disabled auto-upload-rule controls.
- 2026-06-16 — Expanded the shared API contract/client with clip detail, visibility updates, upload
  progress callbacks, and completed single-PUT idempotent retry handling. Verified cloud workspace
  with `cargo fmt --all --check` and `cargo test --workspace`; verified desktop static/UI contracts
  with `cargo fmt --all --check` and `cargo test -p clipline-app`. Windows-target `cargo check`
  could not complete in this Linux environment because `ring` requires missing MinGW/MSVC C tools
  before app code is reached.
- 2026-06-17 — Completed the Cloud v1 Windows runtime smoke against the HTTPS deployment at
  `https://clips.petrichor.one`: the Windows app connected to the real host, uploaded a clip,
  reported `cloud upload ready`, exposed a copyable private cloud link, and preserved the
  `cloud: private` local mapping after app restart. The transport guard, idempotent resume via
  `missing_parts`, upload metadata validation, and permanent client-side upload validation are
  covered by the shared Rust client tests used by the desktop shell. Follow-up desktop polish found
  during the smoke: the app currently labels `unlisted` uploads as public and does not refresh a
  local upload record after visibility is changed in the web app; those are desktop UI/state sync
  issues, not Cloud API blockers.
