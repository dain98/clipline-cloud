import { api } from "/js/api.js";
import { escapeHtml, escapeAttr, formatDate, formatDuration, icon } from "/js/util.js";
import { markerTimelineHtml, bindMarkerTimeline } from "/js/components/marker_timeline.js";

const app = document.querySelector("#app");

export async function renderPublicShare(shareId) {
  app.innerHTML = `
    <div class="public-shell">
      <header class="public-topbar">
        <div class="brand-mark" aria-hidden="true">CL</div>
        <span class="wordmark">Clipline</span>
      </header>
      <main class="public-main">
        <div class="empty-state">Loading clip…</div>
      </main>
    </div>
  `;
  try {
    const clip = await api(`/api/v1/public/clips/${encodeURIComponent(shareId)}`);
    const mediaUrl = safeMediaUrl(clip.media_url);
    const posterAttr = clip.has_thumbnail ? ` poster="${escapeAttr(safeMediaUrl(clip.thumbnail_url))}"` : "";
    const gameLabel = escapeHtml(clip.game_name || clip.game_id || "");
    app.innerHTML = `
      <div class="public-shell">
        <header class="public-topbar">
          <div class="brand-mark" aria-hidden="true">CL</div>
          <span class="wordmark">Clipline</span>
        </header>
        <main class="public-main" id="public-root">
          <div class="player-frame">
            <video id="public-video" controls preload="metadata"${posterAttr}${mediaUrl ? ` src="${escapeAttr(mediaUrl)}"` : ""}></video>
          </div>
          <h1>${escapeHtml(clip.title)}</h1>
          ${gameLabel ? `<p class="muted">${gameLabel}</p>` : ""}
          <p class="faint">
            Recorded&nbsp;${escapeHtml(formatDate(clip.recorded_at))} &middot;
            Uploaded&nbsp;${escapeHtml(formatDate(clip.uploaded_at))} &middot;
            ${escapeHtml(formatDuration(clip.duration_ms))}
          </p>
          ${markerTimelineHtml({ markers: clip.markers, durationMs: clip.duration_ms })}
          ${clip.copy_notice ? `<p class="faint copy-notice">${escapeHtml(clip.copy_notice)}</p>` : ""}
        </main>
      </div>
    `;
    const publicRoot = document.querySelector("#public-root");
    const videoEl = document.querySelector("#public-video");
    bindMarkerTimeline(publicRoot, videoEl);
  } catch (_) {
    app.innerHTML = `
      <div class="public-shell">
        <header class="public-topbar">
          <div class="brand-mark" aria-hidden="true">CL</div>
          <span class="wordmark">Clipline</span>
        </header>
        <main class="public-main">
          <div class="empty-state">
            ${icon("film")}
            <p>This link is no longer active.</p>
          </div>
        </main>
      </div>
    `;
  }
}

function safeMediaUrl(value) {
  if (!value) {
    return "";
  }
  const raw = String(value);
  try {
    const parsed = new URL(raw, window.location.origin);
    return ["http:", "https:"].includes(parsed.protocol) ? raw : "";
  } catch (_) {
    return "";
  }
}
