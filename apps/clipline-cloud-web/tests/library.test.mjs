import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LIBRARY_QUERY,
  libraryParams,
  countActiveFilters,
  deriveGameChips,
  bulkShareLinks,
} from "../src/pages/library.js";

// libraryParams is a pure port of legacy libraryParams (src/app.js:765-786):
// sort + page + page_size are always set; game/source_type/visibility/status/q are
// only set when truthy; from/to get midnight/end-of-day UTC suffixes;
// duration seconds -> ms and size MiB -> bytes conversions are passthrough
// (only present when the input parses to a finite number).

test("libraryParams sets sort, page, and a page_size of 100 by default", () => {
  const params = libraryParams(DEFAULT_LIBRARY_QUERY);
  assert.equal(params.get("sort"), "uploaded_at_desc");
  assert.equal(params.get("page_size"), "100");
  assert.equal(params.get("page"), "1");
});

test("libraryParams carries the selected page", () => {
  const params = libraryParams({ ...DEFAULT_LIBRARY_QUERY, page: 3 });
  assert.equal(params.get("page"), "3");
});

test("libraryParams omits every optional key when the query is default", () => {
  const params = libraryParams(DEFAULT_LIBRARY_QUERY);
  for (const key of [
    "game", "source_type", "visibility", "status", "q", "from", "to",
    "min_duration_ms", "max_duration_ms", "min_size_bytes", "max_size_bytes",
  ]) {
    assert.equal(params.has(key), false, `expected ${key} to be omitted`);
  }
});

test("libraryParams passes through the simple string filter keys", () => {
  const params = libraryParams({
    ...DEFAULT_LIBRARY_QUERY,
    game: "VALORANT",
    source_type: "manual",
    visibility: "public",
    status: "ready",
    q: "clutch",
  });
  assert.equal(params.get("game_category_id"), "VALORANT");
  assert.equal(params.get("source_type"), "manual");
  assert.equal(params.get("visibility"), "public");
  assert.equal(params.get("status"), "ready");
  assert.equal(params.get("q"), "clutch");
});

test("libraryParams appends UTC day boundaries to from/to dates", () => {
  const params = libraryParams({ ...DEFAULT_LIBRARY_QUERY, from: "2026-01-01", to: "2026-01-31" });
  assert.equal(params.get("from"), "2026-01-01T00:00:00Z");
  assert.equal(params.get("to"), "2026-01-31T23:59:59Z");
});

test("libraryParams converts duration seconds to milliseconds", () => {
  const params = libraryParams({
    ...DEFAULT_LIBRARY_QUERY,
    min_duration_seconds: "30",
    max_duration_seconds: "120.5",
  });
  assert.equal(params.get("min_duration_ms"), "30000");
  assert.equal(params.get("max_duration_ms"), "120500");
});

test("libraryParams converts size MiB to bytes", () => {
  const params = libraryParams({ ...DEFAULT_LIBRARY_QUERY, min_size_mib: "1", max_size_mib: "2.5" });
  assert.equal(params.get("min_size_bytes"), "1048576");
  assert.equal(params.get("max_size_bytes"), String(Math.round(2.5 * 1024 * 1024)));
});

test("libraryParams treats a non-numeric duration/size as absent", () => {
  const params = libraryParams({ ...DEFAULT_LIBRARY_QUERY, min_duration_seconds: "abc", min_size_mib: "" });
  assert.equal(params.has("min_duration_ms"), false);
  assert.equal(params.has("min_size_bytes"), false);
});

test("libraryParams carries a non-default sort through", () => {
  const params = libraryParams({ ...DEFAULT_LIBRARY_QUERY, sort: "title_asc" });
  assert.equal(params.get("sort"), "title_asc");
});

// countActiveFilters counts only the popover fields (not sort/q/game, which
// live in the toolbar/chips), so the "Filters" button badge reflects exactly
// what the popover would reset.

test("countActiveFilters is 0 for the default query", () => {
  assert.equal(countActiveFilters(DEFAULT_LIBRARY_QUERY), 0);
});

test("countActiveFilters counts each non-empty popover field", () => {
  assert.equal(
    countActiveFilters({ ...DEFAULT_LIBRARY_QUERY, visibility: "public", status: "ready" }),
    2
  );
});

test("countActiveFilters ignores sort/q/game", () => {
  assert.equal(
    countActiveFilters({ ...DEFAULT_LIBRARY_QUERY, sort: "title_asc", q: "ace", game: "VALORANT" }),
    0
  );
});

// deriveGameChips: dedupe clips' game_name, count occurrences, return the
// top N (default 6) sorted by count desc then name asc for stable ties.

test("deriveGameChips dedupes and counts game_name occurrences", () => {
  const clips = [
    { game_name: "VALORANT" }, { game_name: "VALORANT" }, { game_name: "Apex Legends" },
  ];
  assert.deepEqual(deriveGameChips(clips), [
    { game: "VALORANT", count: 2, label: "VALORANT" },
    { game: "Apex Legends", count: 1, label: "Apex Legends" },
  ]);
});

test("deriveGameChips uses the category id and canonical display name", () => {
  assert.deepEqual(
    deriveGameChips([{ game_category_id: "cat-gta", game_name: "GTA5_Enhanced", game_display_name: "Grand Theft Auto V" }]),
    [{ game: "cat-gta", count: 1, label: "Grand Theft Auto V" }]
  );
});

test("deriveGameChips carries the category icon into its filter", () => {
  assert.deepEqual(
    deriveGameChips([{
      game_category_id: "cat-minecraft",
      game_name: "Minecraft.Windows",
      game_display_name: "Minecraft",
      game_icon_url: "/api/v1/public/game-categories/cat-minecraft/artwork/icon?v=4",
    }]),
    [{
      game: "cat-minecraft",
      count: 1,
      label: "Minecraft",
      icon_url: "/api/v1/public/game-categories/cat-minecraft/artwork/icon?v=4",
    }]
  );
});

test("deriveGameChips merges different raw names in the same category", () => {
  assert.deepEqual(
    deriveGameChips([
      { game_category_id: "cat-gta", game_name: "GTA5_Enhanced", game_display_name: "Grand Theft Auto V" },
      { game_category_id: "cat-gta", game_name: "Grand Theft Auto V", game_display_name: "Grand Theft Auto V" },
    ]),
    [{ game: "cat-gta", count: 2, label: "Grand Theft Auto V" }]
  );
});

test("deriveGameChips ignores clips without a game_name", () => {
  assert.deepEqual(deriveGameChips([{ game_name: null }, { game_name: "" }, {}]), []);
});

test("deriveGameChips caps the result at the top 6 by count", () => {
  const clips = Array.from({ length: 8 }, (_, i) => ({ game_name: `Game ${i}` }));
  clips.push({ game_name: "Game 0" }); // bump Game 0 to count 2, top of the list
  const chips = deriveGameChips(clips);
  assert.equal(chips.length, 6);
  assert.equal(chips[0].game, "Game 0");
  assert.equal(chips[0].count, 2);
});

test("deriveGameChips breaks count ties alphabetically", () => {
  const clips = [{ game_name: "Zeta" }, { game_name: "Alpha" }, { game_name: "Mid" }];
  assert.deepEqual(deriveGameChips(clips).map((c) => c.game), ["Alpha", "Mid", "Zeta"]);
});

test("bulkShareLinks rewrites server public URLs onto the current origin", () => {
  assert.deepEqual(
    bulkShareLinks(
      [
        { public_url: "http://localhost:18080/c/c_one" },
        { public_url: "https://clips.example.com/c/c_two" },
      ],
      "http://127.0.0.1:18080"
    ),
    ["http://127.0.0.1:18080/c/c_one", "http://127.0.0.1:18080/c/c_two"]
  );
});

test("bulkShareLinks skips private clips and can fall back to public_share_id", () => {
  assert.deepEqual(
    bulkShareLinks(
      [
        { public_url: null },
        { public_url: "not a url", public_share_id: "c fallback" },
      ],
      "http://127.0.0.1:18080"
    ),
    ["http://127.0.0.1:18080/c/c%20fallback"]
  );
});
