# Game Category Management Implementation Plan

**Goal:** Replace the one-name display-override implementation with durable,
mergeable game categories while preserving raw clip metadata and the seeded
deployment's existing SteamGridDB configuration.

**Architecture:** Store canonical presentation in `game_categories` and raw
name membership in `game_category_names`. Resolve clips dynamically through
the mapping, create missing mappings transactionally during upload, and expose
category IDs for aggregate filtering. Keep SteamGridDB as an admin-selected
metadata/artwork provider whose search query is fully user controlled.

**Tech stack:** Rust, Axum, SQLx, SQLite, Postgres, Preact/HTM, Node test runner,
esbuild, Docker Compose, SteamGridDB HTTP API.

## Global constraints

- Preserve all unrelated user changes in the dirty worktree.
- Do not edit the contents of migrations `202607130001` or `202607130002`;
  their checksums are already recorded in the seeded SQLite volume.
- Never modify an existing `clips.game_name` value.
- Never print, copy into the repository, or commit the SteamGridDB key.
- Do not add automatic merge heuristics or executable-name search rewriting.
- Keep SQLite and Postgres behavior covered and dialect-clean.
- Do not replace or reassign the existing `tunnel10.dain.cafe` ingress.
- Rebuild committed web `dist` assets only after source behavior is complete.

---

## Task 1: Lock down the data model and forward migration

**Files:**

- Create: `crates/clipline-cloud-db/migrations/sqlite/202607150001_game_categories.sql`
- Create: `crates/clipline-cloud-db/migrations/postgres/202607150001_game_categories.sql`
- Modify: `crates/clipline-cloud-db/src/lib.rs`
- Modify: `crates/clipline-cloud-db/src/models.rs`

- [ ] Add migration tests that start from the historical override schema,
      insert representative configured/unconfigured rows and clips, apply the
      forward migration, and assert that IDs, display metadata, artwork, and
      every raw clip name are preserved.
- [ ] Add fresh-schema assertions for `game_categories` and
      `game_category_names`, and assert that `game_category_overrides` no
      longer exists after all migrations.
- [ ] Create both tables, coherence checks, the case-insensitive unique
      reported-name index, category lookup index, restrictive foreign key, and
      backend-specific clip `game_name` immutability trigger.
- [ ] Copy historical override rows into a category and mapping apiece, then
      drop the historical table in the forward migration.
- [ ] Replace `GameCategoryOverride`/`NewGameCategoryOverride` with
      `GameCategory`, `NewGameCategory`, `GameCategoryName`, and
      `NewGameCategoryName` models.
- [ ] Run focused SQLite migration/model tests, then the Postgres migration
      tests when `CLIPLINE_TEST_POSTGRES_URL` is available.

## Task 2: Build transactional category repositories and startup reconciliation

**Files:**

- Modify: `crates/clipline-cloud-db/src/repositories.rs`
- Modify: `crates/clipline-cloud-db/src/repositories/transactions.rs`
- Modify: `crates/clipline-cloud-db/src/lib.rs`
- Modify: `apps/clipline-cloud-server/src/main.rs`

- [ ] Write repository tests for case-insensitive lookup, list ordering,
      per-name and aggregate clip counts, and zero-clip category retention.
- [ ] Implement category loading with attached reported names and aggregated
      non-deleted clip counts for both database backends.
- [ ] Implement a unique-index-safe `ensure_reported_name` transaction that
      creates a default category only when the name is new and cannot leave an
      empty losing category during a race.
- [ ] Add an idempotent reconciliation method over distinct nonblank existing
      clip names. Invoke it after migrations and before the server becomes
      ready or binds its listener; propagate failure as a startup failure.
- [ ] Implement transactional appearance update, merge, and separate methods.
      Include their audit rows in the same transaction and return typed
      outcomes for missing/stale/singleton cases.
- [ ] Prove with tests that merge moves every mapping, destination presentation
      wins, source deletion is all-or-nothing, separate creates clean metadata,
      and neither operation updates any clip row.
- [ ] Run the database crate tests on SQLite and Postgres.

## Task 3: Integrate category creation with upload and enforce clip immutability

**Files:**

- Modify: `crates/clipline-cloud-db/src/repositories/transactions.rs`
- Modify: `crates/clipline-cloud-db/src/repositories.rs`
- Modify: `apps/clipline-cloud-server/src/uploads.rs`
- Modify: `apps/clipline-cloud-server/src/clips.rs`

- [ ] Add upload tests showing that a first reported name creates a default
      category, a case variant reuses it, an upload failure leaves no partial
      taxonomy rows, and an idempotent upload retry does not duplicate rows.
- [ ] Extend `create_upload_bundle` so reported-name ensure and clip/session/
      marker insertion share one transaction.
- [ ] Remove `game_name` from repository metadata updates so no internal update
      path can change it.
- [ ] Keep deserializing a supplied clip PATCH `game_name` long enough to
      return an explicit `400 game_name cannot be changed after upload`; update
      the clip API documentation accordingly.
- [ ] Add direct database-trigger tests for null/value/case-changing updates
      and verify unrelated clip metadata updates still work.

## Task 4: Replace the admin override API with category lifecycle endpoints

**Files:**

- Modify: `apps/clipline-cloud-server/src/admin.rs`
- Modify: `apps/clipline-cloud-server/src/error.rs`
- Modify: `apps/clipline-cloud-server/src/steamgriddb.rs`

- [ ] Replace `overrides`/`detected_games` response models with
      `categories` containing attached reported names, per-name counts,
      aggregate count, status metadata, and same-origin artwork URLs.
- [ ] Remove manual create/delete routes and old override validation/copy.
- [ ] Make PATCH update presentation only; retain unchanged-artwork reuse and
      validate every newly selected asset against the selected SteamGridDB
      game.
- [ ] Add merge and separate handlers with admin auth, CSRF, typed repository
      outcome mapping, `201` for separate, and refreshed response objects.
- [ ] Refactor SteamGridDB request construction enough to test upstream
      responses against a local mock server without weakening production host
      validation for artwork URLs.
- [ ] Map missing configuration, rate limit/`Retry-After`, auth rejection,
      timeout/network, invalid JSON, not found, oversized image, and invalid
      content type to the statuses in the design.
- [ ] Add handler tests for successful response shapes and every important
      `400/404/409/413/429/502/503` path, including auth and CSRF failures.

## Task 5: Resolve categories in clip responses, search, and filters

**Files:**

- Modify: `crates/clipline-cloud-api-types/src/lib.rs`
- Modify: `crates/clipline-cloud-db/src/repositories.rs`
- Modify: `apps/clipline-cloud-server/src/main.rs`
- Modify: `apps/clipline-cloud-server/src/clips.rs`
- Modify: `apps/clipline-cloud-server/src/media.rs`

- [ ] Add `game_category_id` alongside raw `game_name` and canonical
      `game_display_name` in owned and public clip responses.
- [ ] Add `game_category_id` filters to owned/public list params using all
      attached reported names; retain the legacy exact `game` filter and reject
      requests that supply both.
- [ ] Include canonical category display names in clip text search.
- [ ] Replace raw public-game grouping with category aggregation and return
      category IDs, canonical display names, aggregate public counts, and
      same-origin artwork URLs.
- [ ] Keep category artwork serving keyed by category ID and preserve current
      SteamGridDB URL/content safety checks.
- [ ] Add SQLite/Postgres repository tests and server response/filter tests,
      including a merge followed by owned and public filtering and a separate
      followed by split results.

## Task 6: Rebuild the Game categories admin experience

**Files:**

- Modify: `apps/clipline-cloud-web/src/pages/admin/categories.js`
- Modify: `apps/clipline-cloud-web/src/pages/admin.js`
- Modify: `apps/clipline-cloud-web/src/ui.css`
- Modify: `apps/clipline-cloud-web/tests/admin-categories.test.mjs`

- [ ] Replace all override terminology, add/create/remove controls, and
      detected-game sections with the approved category list and Edit flow.
- [ ] Add pure helpers/tests for category update bodies, SteamGridDB status,
      reported-name presentation, merge destination search, and aggregate
      counts.
- [ ] Implement Appearance and Game metadata sections. Initialize the editable
      search query from display name, debounce queries, ignore stale results,
      populate-but-do-not-lock display name on selection, and clear artwork
      when the matched game changes.
- [ ] Implement the Reported names section with conditional Separate actions
      and confirmations; refresh after success or stale `404/409` errors.
- [ ] Implement the searchable Merge with another category dropdown and a
      confirmation that clearly identifies destination-wins behavior and moved
      names.
- [ ] Render only same-origin artwork/preview URLs and provide configured,
      empty-result, upstream-error, and no-artwork states.
- [ ] Add DOM/helper tests for list fields, editor sections, search interaction,
      merge/separate request paths, confirmations, busy-state guards, and the
      complete absence of override/Add/Delete copy.

## Task 7: Switch category-aware navigation and filtering in the web client

**Files:**

- Modify: `apps/clipline-cloud-web/src/components/ClipCard.js`
- Modify: `apps/clipline-cloud-web/src/pages/feed.js`
- Modify: `apps/clipline-cloud-web/src/pages/games.js`
- Modify: `apps/clipline-cloud-web/src/pages/library.js`
- Modify: `apps/clipline-cloud-web/src/pages/watch.js`
- Modify: relevant files in `apps/clipline-cloud-web/tests/`

- [ ] Group feed/library chips by `game_category_id`, label them with the
      canonical display name, and send the new category filter rather than a
      raw reported name.
- [ ] Build `/game/{category_id}` links from games, chips, and watch metadata;
      URL-encode the opaque ID and preserve existing sort/search pagination.
- [ ] Keep raw-name display fallbacks for exceptional unmapped payloads without
      exposing raw values as the normal category route key.
- [ ] Update feed, games, library, watch, card, route, and query helper tests to
      prove merged names share one chip/tile/link and one filter result.
- [ ] Run the complete web test suite.

## Task 8: Documentation, generated assets, and full verification

**Files:**

- Modify: `docs/00-overview-and-architecture.md`
- Modify: `docs/02-database-and-migrations.md`
- Modify: `docs/05-upload-protocol.md`
- Modify: `docs/07-clips-api-and-library-queries.md`
- Modify: `docs/08-media-serving-and-public-sharing.md`
- Modify: `docs/09-web-frontend.md`
- Modify: `docs/11-deployment-operations-and-hardening.md`
- Modify: `apps/clipline-cloud-web/dist/main.js` (generated)
- Modify: `apps/clipline-cloud-web/dist/ui.css` (generated)

- [ ] Document category invariants, immutable raw metadata, automatic creation,
      lifecycle endpoints, category filters, SteamGridDB configuration, and the
      forward-migration backup requirement.
- [ ] Remove all live-code/docs references that describe the feature as a
      display override, while retaining the unchanged historical migration
      filenames/content.
- [ ] Run `cargo fmt --all --check`.
- [ ] Run `cargo test --workspace` and confirm the expected S3 integration test
      remains the only ignored test.
- [ ] Run `cargo clippy --workspace --all-targets --all-features -- -D warnings`.
- [ ] Run the complete web test suite, production build, and dist consistency
      check; review generated diffs before accepting them.
- [ ] Validate all six Docker Compose variants.

## Task 9: Upgrade and smoke-test the preserved deployment

- [ ] Back up `clipline-cloud_clipline_data` without printing or copying any
      secret material.
- [ ] Build the test image and replace only `clipline-category-test`, preserving
      its data and secrets volume mounts, port 8080, SteamGridDB key-file env,
      and existing network configuration.
- [ ] Confirm startup applies the forward migration and reconciliation without
      SQLx checksum errors. Verify the 13 configured categories retain IDs,
      display names, SteamGridDB IDs, and artwork; verify stored clip raw names
      are byte-for-byte unchanged.
- [ ] Smoke-test automatic creation, canonical rename, direct user-query
      SteamGridDB search, artwork selection, merge, merged owned/public filter,
      separate, and post-separate filters.
- [ ] Verify `http://localhost:8080` and the existing Access-protected
      `https://tunnel10.dain.cafe` URL. Do not edit the tunnel assignment.
- [ ] Record final Rust/web/Compose counts and any intentionally ignored tests
      in the handoff.
