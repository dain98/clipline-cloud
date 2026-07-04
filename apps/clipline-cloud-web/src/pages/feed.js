import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { navigate } from "../lib/router.js";
import { formatDuration, formatViews } from "../lib/format.js";
import { publicMediaPath, publicPosterPath, publicThumbPath } from "../lib/media.js";
import { ClipCard, clipAuthor } from "../components/ClipCard.js";
import { EmptyState } from "../components/EmptyState.js";

// Exact legacy sort key list (src/app.js:1127-1134) — labels/values must not drift.
const SORTS = [
  ["uploaded_at_desc", "Uploaded newest"],
  ["uploaded_at_asc", "Uploaded oldest"],
  ["recorded_at_desc", "Recorded newest"],
  ["recorded_at_asc", "Recorded oldest"],
  ["created_at_desc", "Created newest"],
  ["created_at_asc", "Created oldest"],
  ["duration_desc", "Duration longest"],
  ["duration_asc", "Duration shortest"],
  ["title_asc", "Title A-Z"],
  ["title_desc", "Title Z-A"],
];

const MAX_GAME_CHIPS = 6;
const PUBLIC_PAGE_SIZE = 60;

export function publicFeedParams(query) {
  const params = new URLSearchParams();
  params.set("page_size", String(PUBLIC_PAGE_SIZE));
  if (query.sort !== "uploaded_at_desc") params.set("sort", query.sort);
  if (query.game) params.set("game", query.game);
  if (query.q) params.set("q", query.q);
  if (Number(query.page) > 1) params.set("page", String(query.page));
  return params;
}

export function gameLabel(clip) {
  return clip?.game_name || "No game";
}

export function feedGameChips(games, activeGame, max = MAX_GAME_CHIPS) {
  const sortedGames = [...(games || [])].sort((a, b) => (b.clip_count || 0) - (a.clip_count || 0));
  const topGames = sortedGames.slice(0, max);
  const normalizedActiveGame = String(activeGame || "").trim();
  const activeInTop = normalizedActiveGame && topGames.some((game) => game.game === normalizedActiveGame);
  const activeGameChip =
    normalizedActiveGame && !activeInTop
      ? sortedGames.find((game) => game.game === normalizedActiveGame) || { game: normalizedActiveGame, clip_count: 0 }
      : null;
  const chips = activeGameChip ? [activeGameChip, ...topGames] : topGames;
  const visibleGames = new Set(chips.map((game) => game.game));
  const extraGameCount = sortedGames.filter((game) => !visibleGames.has(game.game)).length;
  return { chips, extraGameCount };
}

export function FeedPage({ route }) {
  const query = {
    sort: "uploaded_at_desc",
    page: 1,
    q: "",
    ...route.query,
    game: route.name === "publicGame" ? route.game : route.query?.game || "",
  };
  const [data, setData] = useState(null); // { page, page_size, has_more, clips }
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    setData(null);
    setError(null);
    const params = publicFeedParams(query);
    api(`/api/v1/public/clips?${params}`)
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e));
    return () => {
      live = false;
    };
  }, [route.name, query.sort, query.game, query.q, query.page]);

  useEffect(() => {
    let live = true;
    api("/api/v1/public/games")
      .then((d) => live && setGames(d.games || []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const setQ = (patch) => navigate(feedPath({ ...query, page: 1, ...patch }));

  if (error) {
    return html`<main class="page">
      <${EmptyState} name="alert" title="Couldn't load the feed" body=${error.message} />
    </main>`;
  }

  const clips = data?.clips;
  const hasFilter = Boolean(query.game || query.q) || Number(query.page) > 1;
  const isDefaultView = !hasFilter;

  const { chips: gameChips, extraGameCount } = feedGameChips(games, query.game);

  return html`<main class="page">
    ${clips == null
      ? html`<${SkeletonGrid} />`
      : clips.length === 0
      ? html`<${EmptyState} name="film"
          title=${hasFilter ? "No clips match this filter" : "No public clips yet"}
          body=${hasFilter
            ? "Try a different game, search, or clear your filters."
            : "Clips shared as public from a library will show up here."}
          action=${hasFilter && html`<a class="btn" href="/">Clear filters</a>`} />`
      : html`
        ${isDefaultView ? renderHero(clips) : ""}
        <div class="feed-toolbar">
          <h2>Latest uploads</h2>
          <select class="input" value=${query.sort} onChange=${(e) => setQ({ sort: e.target.value })}>
            ${SORTS.map(([v, l]) => html`<option value=${v}>${l}</option>`)}
          </select>
          <div class="chips">
            <button class=${`chip ${!query.game ? "chip-on" : ""}`} onClick=${() => setQ({ game: "" })}>All</button>
            ${gameChips.map((g) => html`<button
              class=${`chip ${query.game === g.game ? "chip-on" : ""}`}
              onClick=${() => setQ({ game: g.game })}>${g.game}</button>`)}
            ${extraGameCount > 0 && html`<a class="chip" href="/games">+${extraGameCount}</a>`}
          </div>
        </div>
        <div class="card-grid">
          ${(isDefaultView ? clips.slice(4) : clips).map(
            // Override the API's absolute thumbnail_url with the relative
            // path so ClipCard's poster survives host-alias CSP (see media.js).
            // media_url is likewise supplied so ClipCard's HoverPreview has
            // something to play — the public listing response never sends one.
            (c) => html`<${ClipCard} clip=${{ ...c, thumbnail_url: publicThumbPath(c), media_url: publicMediaPath(c) }}
              href=${shareHref(c)} showAuthor />`
          )}
        </div>
        ${pager(data, query, setQ)}
      `}
  </main>`;
}

function renderHero(clips) {
  const [hero, ...rest] = clips;
  const sideRows = rest.slice(0, 3);
  return html`<p class="kicker">Now playing on this server</p>
    <section class="hero">
      <a class="hero-main" href=${shareHref(hero)}>
        <img src=${publicPosterPath(hero)} alt="" loading="lazy" />
        <span class="hero-caption">▶ ${hero.title} — ${gameLabel(hero)} · ${formatDuration(hero.duration_ms)}</span>
      </a>
      <div class="hero-side">
        ${sideRows.map(
          (c) => html`<a class="hero-row" href=${shareHref(c)}>
            <span class="hero-thumb">
              <img src=${publicThumbPath(c)} alt="" loading="lazy" />
              <span class="dur-pill">${formatDuration(c.duration_ms)}</span>
            </span>
            <span class="hero-copy"><b>${c.title}</b>
              <small>${clipAuthor(c)} · ${gameLabel(c)} · ${formatViews(c.view_count)}</small></span>
          </a>`
        )}
      </div>
    </section>`;
}

function SkeletonGrid({ count = 8 }) {
  return html`<div class="card-grid">
    ${Array.from({ length: count }, (_, i) => html`<div class="clip-card" key=${i}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`;
}

function shareHref(clip) {
  return `/c/${encodeURIComponent(clip.share_id)}`;
}

// Port of legacy publicLibraryPath (src/app.js:1063-1089), unchanged behavior:
// the default sort is omitted from the URL; a `q` filter routes to /search
// (carrying `game` along as a query param if present); a bare `game` filter
// routes to /game/<name>; otherwise falls back to /search or / when empty.
export function feedPath({ sort = "uploaded_at_desc", game = "", q = "", page = 1 } = {}) {
  const params = new URLSearchParams();
  const normalizedSort = sort || "uploaded_at_desc";
  const normalizedGame = String(game || "").trim();
  const normalizedQuery = String(q || "").trim();
  const normalizedPage = Math.max(1, Number(page || 1));
  if (normalizedSort !== "uploaded_at_desc") {
    params.set("sort", normalizedSort);
  }
  if (normalizedPage > 1) {
    params.set("page", String(normalizedPage));
  }
  if (normalizedQuery) {
    params.set("q", normalizedQuery);
    if (normalizedGame) {
      params.set("game", normalizedGame);
    }
    return `/search?${params.toString()}`;
  }
  if (normalizedGame) {
    const query = params.toString();
    return `/game/${encodeURIComponent(normalizedGame)}${query ? `?${query}` : ""}`;
  }
  const query = params.toString();
  return query ? `/search?${query}` : "/";
}

// Port of legacy publicPager (src/app.js:1108-1121) to Preact buttons wired
// through setQ/navigate instead of DOM event delegation.
function pager(data, query, setQ) {
  const currentPage = Math.max(1, Number(query.page || 1));
  const hasMore = Boolean(data?.has_more);
  if (currentPage <= 1 && !hasMore) return "";
  return html`<nav class="pager" aria-label="Public clip pages">
    <button class="btn" type="button" disabled=${currentPage <= 1}
      onClick=${() => setQ({ page: currentPage - 1 })}>Previous</button>
    <span class="muted">Page ${currentPage}</span>
    <button class="btn" type="button" disabled=${!hasMore}
      onClick=${() => setQ({ page: currentPage + 1 })}>Next</button>
  </nav>`;
}
