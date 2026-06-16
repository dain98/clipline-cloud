# 13 — Phase 3: Admin & Library Polish

**Phase:** Phase 3 (post-v1)
**Status:** ☐ Not started
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

- [ ] Per-user storage usage computed and shown in the admin UI
- [ ] Enforced per-user quotas + global storage-warning threshold (surfaced + blocking at upload create)
- [ ] Advanced sort/search beyond the doc-07 baseline; additions index-backed and dialect-clean
- [ ] Game grouping in the library view
- [ ] Bulk delete (soft-delete) across selected clips, transactional, audit-logged per clip
- [ ] Bulk visibility change across selected clips, audit-logged per clip
- [ ] Session management UI: list + revoke active browser sessions
- [ ] Device-token management UI: list + revoke device tokens with `name` / `last_used_at`

## Definition of done

- [ ] Admins see accurate per-user storage usage; quotas block over-quota uploads with a clear error
- [ ] Advanced sort/search and game grouping work and stay performant on a large library
- [ ] Bulk delete and bulk visibility apply atomically and are fully audit-logged
- [ ] Users/admins can review and revoke sessions and device tokens from the UI; revocation is immediate

## Progress log

- _(empty)_
