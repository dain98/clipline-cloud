import test from "node:test";
import assert from "node:assert/strict";

// feed.js imports navigate() from router.js, which touches window at module
// load time (to wire up popstate/hashchange) — shim just enough of `window`
// before importing, same as tests/shell.test.mjs.
globalThis.window = new EventTarget();
window.location = { pathname: "/", hash: "", search: "" };
window.history = { pushState() {} };

const { feedGameChips, feedPath, gameLabel, publicFeedParams } = await import("../src/pages/feed.js");

// Port of legacy publicLibraryPath (src/app.js:1063-1089): the default sort
// is omitted from the URL, game/q/page are only appended when non-default,
// and a `q` filter routes to /search while a bare `game` filter routes to
// /game/<name>.

test("feedPath omits every param on the default view", () => {
  assert.equal(feedPath({}), "/");
  assert.equal(feedPath({ sort: "uploaded_at_desc", page: 1 }), "/");
});

test("feedPath omits the sort param when it is the default", () => {
  assert.equal(feedPath({ sort: "uploaded_at_desc", game: "VALORANT" }), "/game/VALORANT");
});

test("feedPath includes a non-default sort", () => {
  assert.equal(feedPath({ sort: "views_desc" }), "/search?sort=views_desc");
});

test("feedPath routes a game filter to /game/<name>", () => {
  assert.equal(feedPath({ game: "VALORANT" }), "/game/VALORANT");
});

test("feedPath encodes the game name in the path", () => {
  assert.equal(feedPath({ game: "Counter-Strike 2" }), "/game/Counter-Strike%202");
});

test("feedPath routes a q filter to /search, carrying game along as a query param", () => {
  assert.equal(feedPath({ q: "ace", game: "VALORANT" }), "/search?q=ace&game=VALORANT");
});

test("feedPath includes page only when greater than 1", () => {
  assert.equal(feedPath({ game: "VALORANT", page: 2 }), "/game/VALORANT?page=2");
  assert.equal(feedPath({ page: 1 }), "/");
});

test("feedPath combines sort + page for the default (no game/q) view", () => {
  assert.equal(feedPath({ sort: "views_desc", page: 3 }), "/search?sort=views_desc&page=3");
});

test("feedPath trims whitespace-only game/q filters", () => {
  assert.equal(feedPath({ game: "  ", q: "  " }), "/");
});

test("publicFeedParams requests the legacy 60-clip page size by default", () => {
  const params = publicFeedParams({ sort: "uploaded_at_desc", game: "", q: "", page: 1 });
  assert.equal(params.get("page_size"), "60");
  assert.equal(params.has("sort"), false);
  assert.equal(params.has("page"), false);
});

test("publicFeedParams keeps filters while preserving the fixed page size", () => {
  const params = publicFeedParams({ sort: "title_asc", game: "VALORANT", q: "ace", page: 2 });
  assert.equal(params.get("page_size"), "60");
  assert.equal(params.get("sort"), "title_asc");
  assert.equal(params.get("game_category_id"), "VALORANT");
  assert.equal(params.get("q"), "ace");
  assert.equal(params.get("page"), "2");
});

test("gameLabel falls back when public clip summaries omit game_name", () => {
  assert.equal(gameLabel({ game_name: "GTA5_Enhanced", game_display_name: "Grand Theft Auto V" }), "Grand Theft Auto V");
  assert.equal(gameLabel({ game_name: "VALORANT" }), "VALORANT");
  assert.equal(gameLabel({ game_name: null }), "No game");
  assert.equal(gameLabel({}), "No game");
});

test("feedGameChips includes the active off-list game as selected chip data", () => {
  const games = [
    { category_id: "A", clip_count: 10 },
    { category_id: "B", clip_count: 9 },
    { category_id: "C", clip_count: 8 },
    { category_id: "D", clip_count: 7 },
    { category_id: "E", clip_count: 6 },
    { category_id: "F", clip_count: 5 },
    { category_id: "G", clip_count: 4 },
    { category_id: "H", clip_count: 3 },
  ];
  const { chips, extraGameCount } = feedGameChips(games, "G", 6);
  assert.deepEqual(chips.map((chip) => chip.category_id), ["G", "A", "B", "C", "D", "E", "F"]);
  assert.equal(extraGameCount, 1);
});

test("feedGameChips shows an active game even before the games API returns it", () => {
  const { chips, extraGameCount } = feedGameChips([{ category_id: "A", clip_count: 1 }], "Missing", 6);
  assert.deepEqual(chips.map((chip) => chip.category_id), ["Missing", "A"]);
  assert.equal(extraGameCount, 0);
});
