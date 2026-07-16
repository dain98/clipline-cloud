CREATE TABLE game_categories (
  id                      TEXT PRIMARY KEY,
  display_name            TEXT NOT NULL,
  steamgriddb_game_id     INTEGER,
  artwork_kind            TEXT,
  artwork_id              INTEGER,
  artwork_url             TEXT,
  artwork_thumb_url       TEXT,
  created_at              TEXT NOT NULL,
  updated_at              TEXT NOT NULL,
  CHECK (LENGTH(TRIM(display_name)) BETWEEN 1 AND 200),
  CHECK (steamgriddb_game_id IS NULL OR steamgriddb_game_id > 0),
  CHECK (artwork_kind IS NULL OR artwork_kind IN ('grid', 'hero', 'logo', 'icon')),
  CHECK (
    (artwork_kind IS NULL AND artwork_id IS NULL AND artwork_url IS NULL AND artwork_thumb_url IS NULL)
    OR
    (steamgriddb_game_id IS NOT NULL AND artwork_kind IS NOT NULL AND artwork_id IS NOT NULL
      AND artwork_url IS NOT NULL AND artwork_thumb_url IS NOT NULL)
  )
);

CREATE TABLE game_category_names (
  id            TEXT PRIMARY KEY,
  category_id   TEXT NOT NULL REFERENCES game_categories(id) ON DELETE RESTRICT,
  reported_name TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  CHECK (LENGTH(TRIM(reported_name)) BETWEEN 1 AND 1024)
);

CREATE UNIQUE INDEX game_category_names_reported_name_ux
  ON game_category_names(LOWER(reported_name));
CREATE INDEX game_category_names_category_idx
  ON game_category_names(category_id);

INSERT INTO game_categories
  (id, display_name, steamgriddb_game_id, artwork_kind, artwork_id,
   artwork_url, artwork_thumb_url, created_at, updated_at)
SELECT id, display_name, steamgriddb_game_id, artwork_kind, artwork_id,
       artwork_url, artwork_thumb_url, created_at, updated_at
FROM game_category_overrides;

INSERT INTO game_category_names
  (id, category_id, reported_name, created_at, updated_at)
SELECT id, id, game_name, created_at, updated_at
FROM game_category_overrides;

DROP TABLE game_category_overrides;

CREATE TRIGGER clips_game_name_immutable
BEFORE UPDATE OF game_name ON clips
FOR EACH ROW
WHEN NEW.game_name IS NOT OLD.game_name
BEGIN
  SELECT RAISE(ABORT, 'clips.game_name is immutable');
END;
