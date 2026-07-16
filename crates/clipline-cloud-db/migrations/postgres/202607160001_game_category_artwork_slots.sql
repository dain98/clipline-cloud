ALTER TABLE game_categories ADD COLUMN video_artwork_id BIGINT;
ALTER TABLE game_categories ADD COLUMN video_artwork_url TEXT;
ALTER TABLE game_categories ADD COLUMN video_artwork_thumb_url TEXT;
ALTER TABLE game_categories ADD COLUMN icon_artwork_id BIGINT;
ALTER TABLE game_categories ADD COLUMN icon_artwork_url TEXT;
ALTER TABLE game_categories ADD COLUMN icon_artwork_thumb_url TEXT;

UPDATE game_categories
SET video_artwork_id = artwork_id,
    video_artwork_url = artwork_url,
    video_artwork_thumb_url = artwork_thumb_url
WHERE artwork_kind = 'hero';

UPDATE game_categories
SET icon_artwork_id = artwork_id,
    icon_artwork_url = artwork_url,
    icon_artwork_thumb_url = artwork_thumb_url
WHERE artwork_kind = 'icon';

UPDATE game_categories
SET artwork_kind = NULL,
    artwork_id = NULL,
    artwork_url = NULL,
    artwork_thumb_url = NULL
WHERE artwork_kind IS NOT NULL AND artwork_kind <> 'grid';
