import test from "node:test";
import assert from "node:assert/strict";

const { categoryRequestBody, gameCategoryPath, mergeTargets, steamGridDbPreviewUrl, steamGridDbStatus } = await import(
  "../src/pages/admin/categories.js"
);

test("game category editor paths encode category ids", () => {
  assert.equal(gameCategoryPath("category/one"), "/admin/game-categories/category%2Fone");
});

test("categoryRequestBody updates presentation without raw reported metadata", () => {
  assert.deepEqual(
    categoryRequestBody({
      displayName: "Grand Theft Auto V",
      steamGameId: 5258,
      selectedArtworks: {
        grid: { id: 8841 },
        video: { id: 8842 },
        icon: { id: 8843 },
      },
    }),
    {
      display_name: "Grand Theft Auto V",
      steamgriddb_game_id: 5258,
      grid_artwork_id: 8841,
      video_artwork_id: 8842,
      icon_artwork_id: 8843,
    }
  );
});

test("categoryRequestBody can clear artwork and SteamGridDB metadata", () => {
  assert.deepEqual(
    categoryRequestBody({ displayName: "Factorio", steamGameId: null, selectedArtworks: null }),
    {
      display_name: "Factorio",
      steamgriddb_game_id: null,
      grid_artwork_id: null,
      video_artwork_id: null,
      icon_artwork_id: null,
    }
  );
});

test("mergeTargets excludes the source and searches display and reported names", () => {
  const categories = [
    { id: "a", display_name: "GTA Enhanced", reported_names: [{ reported_name: "GTA5_Enhanced" }] },
    { id: "b", display_name: "Grand Theft Auto V", reported_names: [{ reported_name: "GTA V" }] },
    { id: "c", display_name: "Factorio", reported_names: [{ reported_name: "factorio" }] },
  ];
  assert.deepEqual(mergeTargets(categories, "a", "grand").map((category) => category.id), ["b"]);
  assert.deepEqual(mergeTargets(categories, "a", "factorio").map((category) => category.id), ["c"]);
  assert.equal(mergeTargets(categories, "a").some((category) => category.id === "a"), false);
});

test("SteamGridDB status distinguishes integration and category state", () => {
  assert.equal(steamGridDbStatus({ steamgriddb_game_id: 5258 }, true), "Matched");
  assert.equal(steamGridDbStatus({ steamgriddb_game_id: null }, true), "Not matched");
  assert.equal(steamGridDbStatus({ steamgriddb_game_id: 5258 }, false), "Not configured");
});

test("SteamGridDB candidate previews stay on the Clipline origin", () => {
  assert.equal(
    steamGridDbPreviewUrl(5258, "logo", 99),
    "/api/v1/admin/game-categories/steamgriddb/games/5258/artwork/logo/99/preview"
  );
});
