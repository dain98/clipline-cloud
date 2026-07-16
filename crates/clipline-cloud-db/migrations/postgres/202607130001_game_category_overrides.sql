CREATE TABLE game_category_overrides (
  id           TEXT PRIMARY KEY,
  game_name    TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX game_category_overrides_game_name_ux
  ON game_category_overrides(LOWER(game_name));
