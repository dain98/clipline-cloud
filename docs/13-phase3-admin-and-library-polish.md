# 13 — Phase 3: Admin & Library Polish

**Phase:** Phase 3 (post-v1)
**Status:** ☑ Complete
**Depends on:** Phase 1 complete (docs 01–11); benefits from Phase 2 (doc 12)
**Design sections:** §30 Phase 3, §17 (admin/library), §20 (quotas)

> Goal: quality-of-life depth on top of a working, processed library — storage usage/quotas,
> richer sort/search, game grouping, bulk operations, and management UIs for sessions and device
> tokens. Nothing here is required for v1; build it as the library grows and operators ask for it.

---

## Goal

Per-user storage usage + enforced quotas, advanced sort/search, game grouping, bulk delete and bulk
visibility, and device-token / session management UI.

## Design context (§30 Phase 3)

Per-user storage usage and quotas; advanced sort/search; game grouping; bulk delete and bulk
visibility; device-token and session management UI.

- **Storage usage & quotas** build on the optional per-user quota and global storage-warning
  threshold from §20 (drafted in doc 11) — Phase 3 surfaces them in the admin UI and enforces them
  richly.
- **Advanced sort/search & game grouping** extend the §19 query surface (doc 07) — keep additions
  index-backed and dialect-clean (SQLite/Postgres parity).
- **Bulk operations** apply the doc-07 delete/visibility mutations across multiple clips
  transactionally, with audit-log entries per affected clip.
- **Session/device-token management UI** exposes the revocation + `last_used_at` data already stored
  (docs 02/04) so users and admins can review and revoke active sessions and device tokens from the
  web UI.

## Implementation checklist

- [x] Per-user storage usage computed and shown in the admin UI
- [x] Enforced per-user quotas + global storage-warning threshold (surfaced + blocking at upload create)
- [x] Advanced sort/search beyond the doc-07 baseline; additions index-backed and dialect-clean
- [x] Game grouping in the library view
- [x] Bulk delete (soft-delete) across selected clips, transactional, audit-logged per clip
- [x] Bulk visibility change across selected clips, audit-logged per clip
- [x] Session management UI: list + revoke active browser sessions
- [x] Device-token management UI: list + revoke device tokens with `name` / `last_used_at`

## Definition of done

- [x] Admins see accurate per-user storage usage; quotas block over-quota uploads with a clear error
- [x] Advanced sort/search and game grouping work and stay performant on a large library
- [x] Bulk delete and bulk visibility apply atomically and are fully audit-logged
- [x] Users/admins can review and revoke sessions and device tokens from the UI; revocation is immediate

## Progress log

- 2026-06-17: Added per-user active storage aggregation to the admin users API and surfaced it in
  the admin Users table.
- 2026-06-17: Surfaced quota, active upload, total storage, and global storage warning state in the
  admin Overview panel; upload creation already enforces the configured per-user quota.
- 2026-06-17: Added index-backed source, duration, size, created, updated, and file-size query
  support plus expanded library controls and client-side game grouping.
- 2026-06-17: Added owner-scoped bulk selection UI plus transactional bulk delete / bulk visibility
  endpoints with full selection prevalidation and per-clip audit entries.
- 2026-06-17: Added Account navigation for browser session and device-token review/revocation, plus
  current-session detection and user-scoped session revoke endpoints.
