import { escapeHtml, escapeAttr, formatDuration } from "/js/util.js";

function kindColor(kind) {
  if (kind === "objectives") return "var(--gold)";
  if (kind === "kill" || kind === "kills") return "var(--danger)";
  return "var(--accent)";
}

export function markerTimelineHtml({ markers, durationMs }) {
  if (!markers || !markers.length) return `<p class="muted">No markers on this clip.</p>`;
  const ticks = durationMs ? markers.map((m) => {
    const left = Math.max(0, Math.min(100, (m.timestamp_ms / durationMs) * 100));
    const label = `Seek to ${formatDuration(m.timestamp_ms)} — ${m.label || m.kind}`;
    return `<button type="button" class="tick" data-seek-ms="${m.timestamp_ms}"
      style="left:${left}%;--tick:${kindColor(m.kind)}" title="${escapeAttr(label)}"
      aria-label="${escapeAttr(label)}"></button>`;
  }).join("") : "";
  const rows = markers.map((m) =>
    `<li><button type="button" class="marker-row" data-seek-ms="${m.timestamp_ms}">
       <span class="marker-time mono">${escapeHtml(formatDuration(m.timestamp_ms))}</span>
       <span class="marker-label">${escapeHtml(m.label || m.kind)}</span>
       <span class="marker-kind muted">${escapeHtml(m.kind)}</span>
     </button></li>`).join("");
  return `<div class="marker-bar" aria-hidden="${durationMs ? "false" : "true"}">${ticks}</div>
          <ul class="marker-list">${rows}</ul>`;
}

export function bindMarkerTimeline(root, videoEl) {
  root.querySelectorAll("[data-seek-ms]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ms = Number(btn.dataset.seekMs) || 0;
      videoEl.currentTime = ms / 1000;
      videoEl.play?.().catch(() => {});
      videoEl.focus?.();
    });
  });
}
