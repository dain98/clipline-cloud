import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { EmptyState } from "../components/EmptyState.js";

// Tile grid of every game with public clips. Data: GET /api/v1/public/games
// → { games: [{ game, clip_count }] } (real field is `game`, not `name` —
// see legacy publicGameOptions at src/app.js:1145-1164, which reads
// game.game/game.clip_count). The API doesn't return a thumbnail, so every
// tile falls back to a gradient block with the game's initial letter.
export function GamesPage() {
  const [games, setGames] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    api("/api/v1/public/games")
      .then((d) => live && setGames(d.games || []))
      .catch((e) => live && setError(e));
    return () => {
      live = false;
    };
  }, []);

  if (error) {
    return html`<main class="page">
      <${EmptyState} name="alert" title="Couldn't load games" body=${error.message} />
    </main>`;
  }

  return html`<main class="page">
    <p class="kicker">Browse by game</p>
    ${games == null
      ? html`<div class="game-grid">
          ${Array.from({ length: 6 }, (_, i) => html`<div class="game-tile is-loading" key=${i}>
            <div class="skeleton-thumb"></div>
          </div>`)}
        </div>`
      : games.length === 0
      ? html`<${EmptyState} name="film" title="No games yet"
          body="Once clips are shared as public, their games will show up here." />`
      : html`<div class="game-grid">
          ${games.map((g) => html`<a class="game-tile" href=${`/game/${encodeURIComponent(g.game)}`}>
            ${g.thumbnail_url
              ? html`<img src=${g.thumbnail_url} alt="" loading="lazy" />`
              : html`<div class="game-tile-fallback">${(g.game || "?")[0].toUpperCase()}</div>`}
            <div class="game-tile-body">
              <b>${g.game}</b>
              <small>${g.clip_count} clip${g.clip_count === 1 ? "" : "s"}</small>
            </div>
          </a>`)}
        </div>`}
  </main>`;
}
