import {
  visibilityBadge,
  escapeHtml,
  escapeAttr,
  formatDuration,
  formatBytes,
  formatRelative,
  icon,
} from "/js/util.js";

export function gradientFor(seed) {
  const s = String(seed || "clip");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const a = h % 360, b = (a + 40 + (h >> 8) % 80) % 360;
  return `linear-gradient(135deg, hsl(${a} 45% 22%), hsl(${b} 50% 14%))`;
}

export function clipCard(clip) {
  const ready = clip.status === "ready";
  const showImg = ready && clip.has_thumbnail;
  const seed = `${clip.title}|${clip.game_name || clip.game_id || ""}`;
  const thumb = showImg
    ? `<img class="thumb-img" loading="lazy" alt=""
         src="/api/v1/clips/${encodeURIComponent(clip.id)}/thumbnail">`
    : "";
  const overlay = ready
    ? `<span class="thumb-duration">${escapeHtml(formatDuration(clip.duration_ms))}</span>`
    : `<span class="thumb-status status-${escapeAttr(clip.status)}">${escapeHtml(clip.status)}</span>`;
  return `
    <article class="card">
      <a class="thumb" href="/clip/${encodeURIComponent(clip.id)}" data-route
         style="background:${gradientFor(seed)}" aria-label="${escapeAttr(clip.title)}">
        ${thumb}
        <span class="thumb-badges">${visibilityBadge(clip.visibility)}</span>
        ${overlay}
        <span class="thumb-glyph" aria-hidden="true">${icon("play")}</span>
      </a>
      <div class="card-body">
        <a class="card-title" href="/clip/${encodeURIComponent(clip.id)}" data-route>${escapeHtml(clip.title)}</a>
        <div class="card-meta">${escapeHtml(clip.game_name || clip.game_id || "No game")}
          · ${escapeHtml(formatRelative(clip.recorded_at))} · ${escapeHtml(formatBytes(clip.file_size_bytes))}</div>
      </div>
      <button class="card-kebab icon-btn btn-ghost" aria-label="Clip actions"
        data-kebab data-clip-id="${escapeAttr(clip.id)}"
        data-visibility="${escapeAttr(clip.visibility)}"
        data-public-url="${escapeAttr(clip.public_url || "")}">${icon("more")}</button>
    </article>`;
}

export function upNextCard(clip) {
  const ready = clip.status === "ready";
  const showImg = ready && clip.has_thumbnail;
  const seed = `${clip.title}|${clip.game_name || clip.game_id || ""}`;
  const thumb = showImg
    ? `<img class="thumb-img" loading="lazy" alt=""
         src="/api/v1/clips/${encodeURIComponent(clip.id)}/thumbnail">`
    : "";
  return `
    <article class="up-next-card">
      <a class="thumb thumb--sm" href="/clip/${encodeURIComponent(clip.id)}" data-route
         style="background:${gradientFor(seed)}" aria-label="${escapeAttr(clip.title)}">
        ${thumb}
        ${ready ? `<span class="thumb-duration">${escapeHtml(formatDuration(clip.duration_ms))}</span>` : ""}
      </a>
      <div class="card-body">
        <a class="card-title" href="/clip/${encodeURIComponent(clip.id)}" data-route>${escapeHtml(clip.title)}</a>
        <div class="card-meta">${escapeHtml(clip.game_name || clip.game_id || "No game")}
          · ${escapeHtml(formatRelative(clip.recorded_at))}</div>
      </div>
    </article>`;
}

export function bindThumbFallback(root) {
  root.querySelectorAll(".thumb-img").forEach((img) => {
    img.addEventListener("error", () => img.remove());
  });
}
