# 07 — Clips API, Sorting & Search

**Phase:** Phase 1 (v1)
**Status:** ☑ Complete
**Depends on:** doc 04 (auth/ownership), doc 06 (clip states + soft-delete), doc 02 (indexes)
**Design sections:** §16 (clips endpoints), §19 (sorting/search), §13 (states), Appendix A (admin/privacy)

> Goal: the owner-facing clip resource API — list with sort/filter/search, get, patch metadata,
> delete (soft), and visibility toggle. This is what the library frontend (doc 09) consumes. The
> §7 indexes back the common views. Media bytes are doc 08; this doc is metadata + lifecycle.

---

## Goal

CRUD-ish clip endpoints with per-user authorization on every call, the documented sort/filter/search
query surface, soft-delete semantics, and the visibility mutation that hands off to public sharing
(doc 08).

## Design context

### Clips API (§16)

```
GET    /api/v1/clips
GET    /api/v1/clips/{id}
PATCH  /api/v1/clips/{id}
DELETE /api/v1/clips/{id}
POST   /api/v1/clips/{id}/visibility
```

List example:

```
GET /api/v1/clips?sort=recorded_at_desc&game_category_id=01K...&visibility=private&page=1&page_size=50
```

Every clip endpoint enforces: **authenticated caller owns the resource**; nothing becomes viewable
until finalized (doc 05/06).

### Sorting and search (§19)

Query fields:

- `sort`: `recorded_at_desc | recorded_at_asc | uploaded_at_desc | uploaded_at_asc | duration_desc | duration_asc | title_asc`
- `game_category_id`: canonical category ID; includes clips from every attached reported name
- `game`: legacy exact raw-name/ID filter; cannot be combined with `game_category_id`
- `visibility`
- `status`
- `from` / `to`: date bounds
- `q`: simple title, raw game name, or canonical category display-name search

Clip responses retain the raw `game_name` and add `game_category_id` plus
`game_display_name`. Raw `game_name` is upload metadata and cannot be changed through clip PATCHes
or direct database updates. New nonblank reported names automatically create categories; category
merge and separation change mappings only.

The §7 indexes back the common views (`clips_owner_recorded_at_idx`,
`clips_owner_uploaded_at_idx`, `clips_owner_game_idx`, `clips_owner_visibility_idx`). Keep pagination
and timestamp comparisons dialect-clean (SQLite/Postgres parity — relevant to the doc-12 CI gate).

### Visibility mutation (§16, §15)

`POST /clips/{id}/visibility` flips `private` ↔ `public` (and `unlisted`, which behaves like
`public` in v1). Activating `public` mints a random `public_share_id` (doc 08); reverting to private
is what makes the public page 404 for anonymous users (doc 08). Record the change in the audit log.

### Delete (§13, §16)

`DELETE /clips/{id}` is a **soft-delete** (`status=deleted`, `deleted_at` set) per the lifecycle in
doc 06. Actual object cleanup is a job (`cleanup_clip`) — sweeps land in doc 12; this endpoint marks
the row and stops serving the clip.

### Admin / privacy boundary (Appendix A, §22)

Admins manage accounts and infrastructure but get **no casual "view everyone's private clips" UI.**
The clips list/get endpoints are owner-scoped; there is no admin "view all clips" path. Keep that
boundary here.

## Implementation checklist

- [x] `GET /clips` with `sort`, category/legacy game filters, `visibility`, `status`, `from`/`to`, `q`, `page`/`page_size`; owner-scoped
- [x] Query plans use the §7 indexes; pagination + timestamp comparisons are dialect-clean
- [x] `GET /clips/{id}` — owner-only; returns metadata + markers + visibility + public URL when public
- [x] `PATCH /clips/{id}` — edit allowed metadata (e.g. title); owner-only
- [x] `DELETE /clips/{id}` — soft-delete (`status=deleted`, `deleted_at`); stops serving immediately
- [x] `POST /clips/{id}/visibility` — toggle private/public/unlisted; mint/clear `public_share_id` via doc 08; audit-logged
- [x] Per-user authorization enforced on every endpoint; non-`ready`/deleted clips excluded from normal views
- [x] No admin "view all private clips" endpoint exists (privacy boundary honored)

## Definition of done

- [x] Owner can list/sort/filter/search their clips; another user cannot see or fetch them (404, not 403, for cross-owner access)
- [x] Every documented `sort` value returns correctly ordered results backed by an index
- [x] Soft-deleted clips disappear from listings and stop serving, while the row persists for the cleanup job
- [x] Toggling visibility to public produces a share URL; toggling back clears the share id; anonymous public access is verified in doc 08
- [x] Visibility changes and deletes appear in the audit log

## Progress log

- 2026-06-16: Added owner-scoped clips API routes for list, get, patch, soft-delete, and
  visibility changes. Normal library listing defaults to ready, non-deleted clips; explicit status
  filtering remains owner-scoped for lifecycle views.
- 2026-06-16: Added DB library query support with dialect-clean filtering, pagination, timestamp
  bounds, text search, documented sort values, and extra owner/status, owner/duration, and
  owner/title indexes.
- 2026-06-16: Implemented random `c_` public share id minting/clearing, public URL response fields,
  CSRF on cookie-backed mutations, cross-owner 404 behavior, and audit writes for clip update,
  visibility change, and delete.
- 2026-06-16: Verified with `cargo fmt --all --check`, `cargo test --workspace`,
  `cargo build --workspace`, and a local HTTP smoke test covering all sort values, filtering,
  search, pagination, cross-owner 404, detail markers, metadata patch, public/private visibility,
  soft-delete persistence, audit logs, and expected clip indexes.
- 2026-07-15: Added canonical game category IDs and display names to clip responses. Category-ID
  filtering follows all attached reported names, while raw clip game names remain immutable.
