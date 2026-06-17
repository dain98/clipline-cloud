import { api } from "/js/api.js";
import { escapeHtml, escapeAttr, formatDate, formatDuration, dataRow } from "/js/util.js";

const app = document.querySelector("#app");

export async function renderPublicShare(shareId) {
  app.innerHTML = `
    <main class="public-shell">
      <section class="public-panel">
        <div class="empty-state">Loading public clip...</div>
      </section>
    </main>
  `;
  try {
    const clip = await api(`/api/v1/public/clips/${encodeURIComponent(shareId)}`);
    const mediaUrl = safeMediaUrl(clip.media_url);
    const thumbnailUrl = safeMediaUrl(clip.thumbnail_url);
    app.innerHTML = `
      <main class="public-shell">
        <section class="public-panel" aria-labelledby="public-title">
          <div>
            <div class="brand-mark" aria-hidden="true">CL</div>
            <h1 id="public-title">${escapeHtml(clip.title)}</h1>
            <p>${escapeHtml(clip.game_name || clip.game_id || "Shared clip")}</p>
          </div>
          <div class="video-frame">
            <video controls preload="metadata" ${thumbnailUrl ? `poster="${escapeAttr(thumbnailUrl)}"` : ""} ${mediaUrl ? `src="${escapeAttr(mediaUrl)}"` : ""}></video>
          </div>
          <div class="panel">
            <dl class="data-list">
              ${dataRow("Recorded", formatDate(clip.recorded_at))}
              ${dataRow("Uploaded", formatDate(clip.uploaded_at))}
              ${dataRow("Duration", formatDuration(clip.duration_ms))}
            </dl>
          </div>
          <div class="public-copy">${escapeHtml(clip.copy_notice)}</div>
        </section>
      </main>
    `;
  } catch (_) {
    app.innerHTML = `
      <main class="public-shell">
        <section class="public-panel">
          <div class="brand-mark" aria-hidden="true">CL</div>
          <h1>Clip unavailable</h1>
          <p>This public link is no longer active.</p>
        </section>
      </main>
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
