import { api } from "/js/api.js";
import { renderShell } from "/js/shell.js";
import {
  escapeHtml,
  escapeAttr,
  icon,
  flash,
  formatDate,
  formatDuration,
  formatBytes,
  visibilityBadge,
  field,
  selectField,
  dataRow,
  nullableString,
  nullableNumber,
} from "/js/util.js";

export async function renderClipDetail(id) {
  renderShell({
    active: "library",
    body: `<div class="empty-state">Loading clip...</div>`,
  });

  try {
    const clip = await api(`/api/v1/clips/${encodeURIComponent(id)}`);
    renderShell({
      active: "library",
      body: clipDetailView(clip),
      onMount() {
        bindClipDetailEvents(clip);
      },
    });
  } catch (error) {
    renderShell({
      active: "library",
      body: `<div class="error-box">${escapeHtml(error.message)}</div>`,
    });
  }
}

function clipDetailView(clip) {
  return `
    <section class="detail-layout">
      <div class="section">
        <div class="video-frame">
          <video controls preload="metadata" src="/api/v1/clips/${encodeURIComponent(clip.id)}/media"></video>
        </div>
        <div class="panel">
          <div class="section-header">
            <h2>Markers</h2>
            <span class="muted">${clip.markers.length} marker${clip.markers.length === 1 ? "" : "s"}</span>
          </div>
          ${markerTimeline(clip)}
          ${
            clip.markers.length
              ? `<ul class="marker-list">${clip.markers.map(markerItem).join("")}</ul>`
              : `<p class="muted">No markers on this clip.</p>`
          }
        </div>
        <form id="clip-edit-form" class="panel section">
          <h2>Metadata</h2>
          ${field("Title", "title", "text", clip.title, "Clip title")}
          ${field("Game name", "game_name", "text", clip.game_name || "", "Optional")}
          ${field("Game ID", "game_id", "text", clip.game_id || "", "Optional")}
          ${field("Duration ms", "duration_ms", "number", clip.duration_ms ?? "", "Optional")}
          <button class="btn-primary" type="submit">${icon("save")} Save metadata</button>
        </form>
      </div>
      <aside class="section">
        <div class="panel section">
          <div class="section-header">
            <h2>Visibility</h2>
            ${visibilityBadge(clip.visibility)}
          </div>
          ${selectField("Visibility", "detail_visibility", clip.visibility, [
            ["private", "Private"],
            ["public", "Public"],
            ["unlisted", "Unlisted"],
          ])}
          <button id="clip-visibility-button" class="btn-secondary">${icon("refresh")} Apply visibility</button>
          ${
            clip.public_url
              ? `<div class="share-line">
                  <input readonly value="${escapeAttr(clip.public_url)}" aria-label="Public URL">
                  <button class="btn-secondary" data-copy="${escapeAttr(clip.public_url)}">${icon("copy")} Copy</button>
                </div>`
              : `<p class="muted">No public URL is active.</p>`
          }
        </div>
        <div class="panel">
          <h2>Details</h2>
          <dl class="data-list">
            ${dataRow("Recorded", formatDate(clip.recorded_at))}
            ${dataRow("Uploaded", formatDate(clip.uploaded_at))}
            ${dataRow("Duration", formatDuration(clip.duration_ms))}
            ${dataRow("Size", formatBytes(clip.file_size_bytes))}
            ${dataRow("Dimensions", clip.width && clip.height ? `${clip.width} x ${clip.height}` : "Unknown")}
            ${dataRow("FPS", clip.fps ?? "Unknown")}
            ${dataRow("Container", clip.container || "Unknown")}
            ${dataRow("Video codec", clip.video_codec || "Unknown")}
            ${dataRow("Audio codec", clip.audio_codec || "Unknown")}
            ${dataRow("Checksum", clip.checksum_sha256 || "Unknown", true)}
          </dl>
        </div>
        <div class="panel section">
          <h2>Danger zone</h2>
          <button id="clip-delete-button" class="btn-danger">${icon("trash")} Delete clip</button>
        </div>
      </aside>
    </section>
  `;
}

function bindClipDetailEvents(clip) {
  document.querySelector("#clip-edit-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api(`/api/v1/clips/${encodeURIComponent(clip.id)}`, {
        method: "PATCH",
        body: {
          title: String(form.get("title") || ""),
          game_name: nullableString(form.get("game_name")),
          game_id: nullableString(form.get("game_id")),
          duration_ms: nullableNumber(form.get("duration_ms")),
        },
      });
      flash("Clip metadata saved.");
      renderClipDetail(clip.id);
    } catch (error) {
      flash(error.message, "error");
      renderClipDetail(clip.id);
    }
  });

  document.querySelector("#clip-visibility-button").addEventListener("click", async () => {
    const visibility = document.querySelector("[name='detail_visibility']").value;
    try {
      await api(`/api/v1/clips/${encodeURIComponent(clip.id)}/visibility`, {
        method: "POST",
        body: { visibility },
      });
      flash(visibility === "private" ? "Public access removed." : "Visibility updated.");
      renderClipDetail(clip.id);
    } catch (error) {
      flash(error.message, "error");
      renderClipDetail(clip.id);
    }
  });

  document.querySelector("#clip-delete-button").addEventListener("click", async () => {
    if (!window.confirm("Delete this clip?")) {
      return;
    }
    try {
      await api(`/api/v1/clips/${encodeURIComponent(clip.id)}`, { method: "DELETE", body: {} });
      flash("Clip deleted.");
      const { navigate } = await import("/js/router.js");
      navigate("/");
    } catch (error) {
      flash(error.message, "error");
      renderClipDetail(clip.id);
    }
  });
}

function markerTimeline(clip) {
  if (!clip.duration_ms || !clip.markers.length) {
    return "";
  }
  const ticks = clip.markers
    .map((marker) => {
      const left = Math.max(0, Math.min(100, (marker.timestamp_ms / clip.duration_ms) * 100));
      return `<span class="tick" style="left:${left}%" title="${escapeAttr(marker.label || marker.kind)}"></span>`;
    })
    .join("");
  return `<div class="timeline" aria-hidden="true">${ticks}</div>`;
}

function markerItem(marker) {
  return `
    <li>
      <strong>${escapeHtml(marker.label || marker.kind)}</strong>
      <span class="muted">${formatDuration(marker.timestamp_ms)} ${escapeHtml(marker.kind)}</span>
    </li>
  `;
}
