# Game category management and SteamGridDB — design

**Date:** 2026-07-15
**Status:** ready for review

## Problem

The current uncommitted implementation models a category as a display override
for one raw `clips.game_name`. That makes aliases impossible to manage as a
group, makes merged filtering incorrect, and encourages SteamGridDB searches
using executable-derived strings such as `GTA5_Enhanced` rather than the
canonical title an administrator actually intends to find.

Game categories need to be durable first-class records. Raw clip metadata must
remain an immutable record of what the client reported, while a separate set
of reported-name mappings controls presentation, grouping, artwork, and
category filtering.

## Goals

- Give every nonblank reported `game_name` exactly one managed category.
- Automatically enrich categories first created by an upload with the most
  relevant SteamGridDB match and highest-scoring grid, hero, and icon artwork.
- Let an administrator edit a category's display name, SteamGridDB match, and
  artwork without modifying clips.
- Let an administrator explicitly merge categories and later separate any one
  reported name into a fresh category.
- Make category filters include every raw name attached to the category.
- Preserve the 13 configured rows already present in the seeded test volume.
- Keep behavior and schema portable across SQLite and Postgres.

## Non-goals

- Guessing aliases or automatically merging categories.
- Rewriting executable-derived searches into guessed commercial titles.
- Rewriting, deleting, or normalizing stored `clips.game_name` values after
  clip creation.
- Treating `game_id` or `game_executable` as category names when `game_name` is
  absent.
- Downloading and permanently storing SteamGridDB images in Clipline storage.
- Restoring metadata from a category that was consumed by a merge. Reversal
  means separating names into clean categories, not reconstructing discarded
  source appearance metadata.

## Domain model and invariants

### `game_categories`

A category owns canonical presentation:

- `id`: ULID text primary key.
- `display_name`: required, trimmed, 1–200 characters; not unique.
- `steamgriddb_game_id`: optional positive integer.
- Three optional, independent SteamGridDB artwork slots: Category Grid
  (`grid`), Video Art (`hero`), and Icon (`icon`). Each stores the upstream
  artwork ID, full URL, and thumbnail URL.
- `created_at` and `updated_at`: UTC timestamps.

Display names are intentionally not unique. Two categories may legitimately
have the same presentation before an administrator decides whether to merge
them.

### `game_category_names`

A reported-name row owns the mapping from raw client metadata to a category:

- `id`: ULID text primary key. Migrated override rows may reuse their existing
  category ULID as the mapping ULID because the tables have independent key
  spaces.
- `category_id`: required foreign key to `game_categories` with restrictive
  delete behavior.
- `reported_name`: required, trimmed, 1–1024 characters.
- `created_at` and `updated_at`: UTC timestamps.

`LOWER(reported_name)` has a unique index, matching the project's existing
case-insensitive name convention on both supported databases. A second index
on `category_id` supports category loading, aggregation, merge, and separate.
The first observed spelling is the representative reported name; clips retain
their exact stored spelling even when later clips differ only by case.

The following invariants hold:

1. Every nonblank `clips.game_name` has one case-insensitive
   `game_category_names` match.
2. Every reported-name row belongs to exactly one category.
3. Every persisted category has at least one reported-name row.
4. A clip with no nonblank `game_name` has no category.
5. Category operations never update `clips.game_name`.
6. Once a clip is inserted, `clips.game_name` is immutable. The database and
   repository API both enforce this, and `PATCH /api/v1/clips/{id}` rejects a
   supplied `game_name`.

No category foreign key is added to `clips`. Resolution is through the
case-insensitive reported-name mapping, so merge and separate change only the
taxonomy rows and immediately affect every matching clip.

## Category creation and retention lifecycle

When a new upload reports a nonblank `game_name`, the upload-bundle database
transaction ensures a mapping exists before inserting the clip:

1. Look up the reported name case-insensitively.
2. If it exists, use the existing mapping and make no category change.
3. If it does not exist, create a category whose display name equals the
   trimmed reported value, then create its reported-name row.
4. Insert the clip, upload session, and markers in the same transaction.

The insert path handles concurrent first reports with a unique-index-safe
`ON CONFLICT DO NOTHING` strategy and removes any losing, unmapped category
inside the same transaction. A failed clip-bundle transaction therefore
cannot leave an empty category.

After that transaction commits, a newly created category starts a background
SteamGridDB scan using its display name. The relevance-ordered search accepts
an exact normalized title or a verified title that is a prefix of the reported
name (for example `Minecraft` for `Minecraft.Windows`); unrelated autocomplete
results are not applied. For the matched game, Clipline requests grids, heroes, and icons concurrently and
stores the highest-scoring eligible result in each slot. Missing results and
upstream failures leave the affected metadata empty without failing or delaying
the upload. The final write is conditional on the category's original
`updated_at` and empty metadata fields, so an administrator edit or merge that
wins the race is never overwritten.

Categories are durable taxonomy records:

- Deleting or soft-deleting the last matching clip does not remove the
  mapping or category.
- Zero-clip categories remain visible in administration and can match future
  uploads.
- There is no admin Create or Delete category endpoint and no Delete button.
- Reported-name rows cannot be deleted directly.
- The only category deletion is internal to merge after all source mappings
  have moved successfully.

This avoids a delete operation that would either violate the automatic
category invariant or silently discard a curated taxonomy. A future explicit
"reset metadata" action can be added independently if needed.

## Merge and separate semantics

### Merge

The administrator opens a source category, chooses a searchable destination,
and confirms the operation. In one transaction the server:

1. Verifies that source and destination exist and differ.
2. Moves every source `game_category_names` row to the destination.
3. Updates the moved mapping timestamps and the destination timestamp.
4. Deletes the now-empty source category.
5. Writes one audit entry containing source ID, destination ID, source display
   name, destination display name, and moved reported-name IDs/names.

The destination display name, SteamGridDB game, and artwork always win. Clips
are not touched. The response returns the refreshed destination category; the
client then reloads the list so the removed source disappears everywhere.

Merging a category into itself is a `400`. A stale missing source or
destination is a `404`. Transactional locking/conditional updates prevent a
partial merge under concurrent admin actions.

### Separate

Each reported name in a category containing two or more names has a Separate
action. In one transaction the server:

1. Verifies that the mapping still belongs to the requested category.
2. Verifies that the category has at least two reported names.
3. Creates a fresh category with `display_name = reported_name` and no
   SteamGridDB match or artwork.
4. Moves only that mapping to the fresh category.
5. Updates both category timestamps and writes one audit entry.

The response is `201 Created` with the fresh category. Separating a singleton
mapping is a `409` because it is already isolated. The client reloads both
categories after success.

## Admin API

All endpoints require an administrator. Mutations also require the existing
cookie-CSRF protection.

### Category endpoints

```
GET   /api/v1/admin/game-categories
PATCH /api/v1/admin/game-categories/{category_id}
POST  /api/v1/admin/game-categories/{source_category_id}/merge
POST  /api/v1/admin/game-categories/{category_id}/reported-names/{name_id}/separate
```

The old admin `POST /game-categories` and `DELETE /game-categories/{id}` routes
are removed. Raw names are managed only by ingestion, merge, and separate.

The list response is:

```json
{
  "steamgriddb_configured": true,
  "categories": [
    {
      "id": "01...",
      "display_name": "Grand Theft Auto V",
      "steamgriddb_game_id": 5258,
      "grid_artwork_id": 8841,
      "grid_artwork_url": "/api/v1/public/game-categories/01.../artwork/grid?v=8841",
      "video_artwork_id": 8842,
      "video_artwork_url": "/api/v1/public/game-categories/01.../artwork/video?v=8842",
      "icon_artwork_id": 8843,
      "icon_artwork_url": "/api/v1/public/game-categories/01.../artwork/icon?v=8843",
      "clip_count": 9,
      "reported_names": [
        { "id": "01...", "reported_name": "GTA5_Enhanced", "clip_count": 6 },
        { "id": "01...", "reported_name": "Grand Theft Auto V", "clip_count": 3 }
      ],
      "created_at": "2026-07-13T00:00:00Z",
      "updated_at": "2026-07-15T00:00:00Z"
    }
  ]
}
```

Categories sort by case-insensitive display name and ID. Reported names sort
case-insensitively. Counts exclude deleted clips and aggregate all case
variants of every attached name. Artwork response fields are same-origin proxy
URLs; upstream URLs remain internal database details.

`PATCH` accepts the complete editable presentation state:

```json
{
  "display_name": "Grand Theft Auto V",
  "steamgriddb_game_id": 5258,
  "grid_artwork_id": 8841,
  "video_artwork_id": 8842,
  "icon_artwork_id": 8843
}
```

Each artwork ID is independently optional. Artwork requires a selected
SteamGridDB game and is revalidated against that game's results for its fixed
kind before a new selection is stored. An unchanged stored selection may be
reused without an upstream lookup. Clearing or changing the SteamGridDB game
clears all incompatible slots.

Merge accepts `{ "destination_category_id": "01..." }`. Separate has no
request body.

### SteamGridDB endpoints

The existing authenticated admin-only endpoints remain:

```
GET /api/v1/admin/game-categories/steamgriddb/search?q={user_query}
GET /api/v1/admin/game-categories/steamgriddb/games/{game_id}/artwork?kind={kind}
GET /api/v1/admin/game-categories/steamgriddb/games/{game_id}/artwork/{kind}/{artwork_id}/preview
```

Search uses only the editable combobox query. It never substitutes
`game_executable`, `game_id`, or a raw reported name behind the administrator's
back. Search length remains 2–100 characters, results remain bounded, and no
results is a successful empty array.

### Error contract

The API keeps the existing `{ "error": "human-readable message" }` envelope;
introducing global error codes is outside this redesign. Statuses are
consistent and actionable:

| Status | Use |
|---|---|
| `400` | Invalid display/search length, invalid IDs, incoherent artwork fields, self-merge, or an attempted clip `game_name` patch |
| `401/403` | Existing authentication, authorization, and CSRF failures |
| `404` | Missing category, destination, reported-name mapping, or SteamGridDB artwork candidate |
| `409` | A stale lifecycle conflict, including separating a singleton mapping |
| `413` | SteamGridDB image exceeds the proxy size limit |
| `429` | SteamGridDB rate limit, with a bounded forwarded `Retry-After` when supplied |
| `502` | SteamGridDB network/auth/upstream/invalid-response failure |
| `503` | SteamGridDB is not configured |

Database uniqueness races are resolved inside repository transactions and are
not exposed as generic `500` responses. On `404` or `409`, the admin client
shows the server message and reloads category data because its view may be
stale. Domain mutations and their audit entries commit atomically.

## Clip and public API integration

Owned and public clip responses add `game_category_id` while retaining the raw
`game_name`, `game_id`, and canonical `game_display_name` fields. Category
resolution controls only the latter two category fields.

Both list endpoints add `game_category_id` as a filter:

```
GET /api/v1/clips?game_category_id={category_id}
GET /api/v1/public/clips?game_category_id={category_id}
```

The repository implements this as an existence/join against all reported
names attached to the category. The existing `game` parameter remains as a
legacy exact raw `game_name`/`game_id` filter. Supplying both filters returns
`400` rather than applying surprising intersection semantics.

Canonical display names participate in `q` search so searching for
`Grand Theft Auto V` can find clips whose immutable raw value is
`GTA5_Enhanced`.

`GET /api/v1/public/games` aggregates by category and returns
`category_id`, `display_name`, aggregate public clip count, and Category Grid
URL. Category Grids render as portrait Games cards, Video Art is exposed on
clip responses for the watch heading, and Icons are exposed for owned Library
filters. Raw-name fallback display remains only for a temporarily unmapped
clip; startup reconciliation makes that state exceptional.

## Admin experience

The admin section and route label are **Game categories**. No UI copy uses
"override."

The category list shows the category Icon, canonical display name, attached reported
names, aggregate clip count, SteamGridDB state (`Matched`, `Not matched`, or
`Not configured`), and Edit. It has no Add or Delete controls.

The editor contains:

1. **Appearance** — editable display name.
2. **Game metadata** — a searchable SteamGridDB combobox. Its initial query is
   the current display name. Typing is debounced, stale responses are ignored,
   and choosing a result selects its ID and populates the display name with the
   result name while leaving it editable. Changing or clearing the match clears
   incompatible artwork. Once matched, it exposes independent Category Grid,
   Video Art, and Icon selectors beneath the lookup.
3. **Reported names** — every attached representative name and per-name clip
   count. Separate appears only when two or more names are attached and uses a
   confirmation dialog.
4. **Merge with another category** — a searchable dropdown excluding the
   current category. Confirmation states that the destination's appearance
   and SteamGridDB metadata win and lists the names that will move.

An empty SteamGridDB result is not an error. The UI suggests trying the full
official game title but does not transform the query automatically.

## Migration and compatibility

The seeded `clipline-cloud_clipline_data` volume has migrations
`202607130001` and `202607130002` recorded as successful and contains 13
`game_category_overrides` rows. Editing either migration would cause SQLx
checksum validation to reject that database at startup. Therefore:

- Keep both existing migration files byte-for-byte unchanged as historical
  migrations.
- Add a forward migration for SQLite and Postgres that creates
  `game_categories` and `game_category_names`, copies each override row while
  preserving its category ID, display name, SteamGridDB metadata, artwork, and
  timestamps, creates the indexes/constraints and clip immutability guard, and
  then drops `game_category_overrides`.
- After SQL migrations and before readiness/listening, run an idempotent,
  startup-gated repository reconciliation over distinct nonblank existing
  `clips.game_name` values. It creates default categories for names not copied
  from an override. Failure prevents startup.
- The same unique-index-safe ensure operation is used by upload ingestion.

Migration never updates `clips.game_name`. Operators should back up the SQLite
volume or Postgres database before applying the release. The test deployment
must retain the existing volume and tunnel assignment.

## Security and observability

- SteamGridDB credentials continue to come from
  `CLIPLINE_STEAMGRIDDB_API_KEY_FILE`; keys are never returned, logged, or
  committed.
- Artwork fetches remain HTTPS-only, restricted to SteamGridDB hosts, bounded
  by size, content-type checked, and redirect-disabled.
- All admin category mutations are authenticated, CSRF-protected, validated,
  and audit logged without credentials or upstream URLs.
- Automatic categories created during ingestion/backfill are not individually
  audit logged; doing so would create noisy system events. Merge, separate,
  and appearance changes are audited.

## Verification requirements

- Fresh and forward-upgrade migration tests on SQLite and Postgres.
- Repository tests for automatic creation, case-insensitive uniqueness,
  aggregate counts, merge, separate, concurrent conflicts, and category
  filtering without clip mutation.
- Server tests for auth/CSRF, validation/status mapping, clip immutability,
  response fields, filtering, and SteamGridDB failure mapping.
- Web tests for category list/editor behavior, editable search queries,
  selection/artwork clearing, merge/separate confirmations, category-ID links,
  filters, and stale-response handling.
- Full Rust format/test/clippy gates, full web tests/build/dist check, and all
  six Compose validations.
- Upgrade the existing `clipline-category-test` deployment in place after a
  volume backup. Verify preserved category metadata, raw clip names, merge,
  merged filtering, separate, SteamGridDB search/artwork, localhost port 8080,
  and the already Access-protected `https://tunnel10.dain.cafe` URL without
  changing its Cloudflare assignment.
