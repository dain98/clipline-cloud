import { api } from "/js/api.js";
import { renderShell } from "/js/shell.js";
import { markerTimelineHtml, bindMarkerTimeline } from "/js/components/marker_timeline.js";
import { bindThumbFallback } from "/js/components/card.js";
import {
  escapeHtml,
  escapeAttr,
  icon,
  flash,
  copyText,
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
    body: `<div class="empty-state">Loading clip…</div>`,
  });

  try {
    const clip = await api(`/api/v1/clips/${encodeURIComponent(id)}`);
    renderShell({
      active: "library",
      body: clipWatchView(clip),
      onMount() {
        bindWatchEvents(clip);
      },
    });
  } catch (error) {
    renderShell({
      active: "library",
      body: `<div class="error-box">${escapeHtml(error.message)}</div>`,
    });
  }
}

function clipWatchView(clip) {
  const safeId = encodeURIComponent(clip.id);
  const dims =
    clip.width && clip.height ? `${clip.width} × ${clip.height}` : "Unknown";

  return `
    <div class="watch-layout">
      <div class="watch-main">

        <!-- Player -->
        <div class="player-frame">
          <video id="player" controls preload="metadata"
            src="/api/v1/clips/${safeId}/media"></video>
        </div>

        <!-- Title -->
        <h1 class="watch-title">${escapeHtml(clip.title)}</h1>

        <!-- Action pills -->
        <div class="watch-actions">
          <button id="share-btn" class="chip">
            ${icon("share")} Share
          </button>
          <button id="visibility-btn" class="chip">
            ${icon("globe")} Visibility
          </button>
          <button id="edit-btn" class="chip">
            ${icon("edit")} Edit
          </button>
          <button id="delete-btn" class="chip chip--danger">
            ${icon("trash")} Delete
          </button>
        </div>

        <!-- Meta line -->
        <div class="watch-meta">
          <span>${escapeHtml(formatDate(clip.recorded_at))}</span>
          <span class="watch-meta-sep">·</span>
          <span>${escapeHtml(formatDuration(clip.duration_ms))}</span>
          <span class="watch-meta-sep">·</span>
          <span>${escapeHtml(formatBytes(clip.file_size_bytes))}</span>
          <span class="watch-meta-sep">·</span>
          ${visibilityBadge(clip.visibility)}
        </div>

        <!-- Visibility inline panel (hidden by default) -->
        <div id="visibility-panel" class="description-card" hidden>
          <h2 class="description-card__heading">Visibility</h2>
          ${selectField("Visibility", "detail_visibility", clip.visibility, [
            ["private", "Private"],
            ["public", "Public"],
            ["unlisted", "Unlisted"],
          ])}
          <div class="watch-actions" style="margin-top:var(--space-3)">
            <button id="apply-visibility-btn" class="chip chip--accent">
              ${icon("refresh")} Apply
            </button>
            ${clip.public_url
              ? `<button class="chip" data-copy="${escapeAttr(clip.public_url)}">
                   ${icon("copy")} Copy link
                 </button>`
              : ""}
          </div>
        </div>

        <!-- Edit form (hidden until toggled) -->
        <form id="clip-edit-form" class="description-card" hidden>
          <h2 class="description-card__heading">Edit metadata</h2>
          ${field("Title", "title", "text", clip.title, "Clip title")}
          ${field("Game name", "game_name", "text", clip.game_name || "", "Optional")}
          ${field("Game ID", "game_id", "text", clip.game_id || "", "Optional")}
          ${field("Duration ms", "duration_ms", "number", clip.duration_ms ?? "", "Optional")}
          <div class="watch-actions" style="margin-top:var(--space-3)">
            <button class="chip chip--accent" type="submit">
              ${icon("save")} Save metadata
            </button>
          </div>
        </form>

        <!-- Description card: technical details + markers -->
        <details class="description-card" open>
          <summary class="description-card__summary">
            <span class="description-card__heading">Details &amp; chapters</span>
            ${icon("chevronDown")}
          </summary>

          <dl class="data-list">
            ${dataRow("Recorded", formatDate(clip.recorded_at))}
            ${dataRow("Uploaded", formatDate(clip.uploaded_at))}
            ${dataRow("Duration", formatDuration(clip.duration_ms))}
            ${dataRow("Size", formatBytes(clip.file_size_bytes))}
            ${dataRow("Dimensions", dims)}
            ${dataRow("FPS", clip.fps ?? "Unknown")}
            ${dataRow("Container", clip.container || "Unknown")}
            ${dataRow("Video codec", clip.video_codec || "Unknown")}
            ${dataRow("Audio codec", clip.audio_codec || "Unknown")}
            ${dataRow("Checksum", clip.checksum_sha256 || "Unknown")}
          </dl>

          <div class="marker-section">
            <h3 class="marker-section__heading">
              Chapters
              <span class="text-muted">${clip.markers.length} marker${clip.markers.length === 1 ? "" : "s"}</span>
            </h3>
            ${markerTimelineHtml({ markers: clip.markers, durationMs: clip.duration_ms })}
          </div>
        </details>

      </div>

      <!-- Up-next rail — populated in Task 10 -->
      <aside class="up-next" id="up-next"></aside>
    </div>
  `;
}

function bindWatchEvents(clip) {
  const contentRoot = document.querySelector("#app-content");
  const videoEl = document.querySelector("#player");

  // Force guide rail to mini on watch page
  document.querySelector(".app-body")?.classList.add("rail-mini");

  // Bind marker timeline seeking
  bindMarkerTimeline(contentRoot, videoEl);

  // Bind thumbnail fallback (for any thumb images in up-next area later)
  bindThumbFallback(contentRoot);

  // ── Share ────────────────────────────────────────────────────────────────
  document.querySelector("#share-btn").addEventListener("click", async () => {
    if (clip.public_url) {
      await copyText(clip.public_url);
    } else {
      // Publish first, then copy
      try {
        const updated = await api(
          `/api/v1/clips/${encodeURIComponent(clip.id)}/visibility`,
          { method: "POST", body: { visibility: "public" } }
        );
        const url = updated?.public_url || clip.public_url;
        flash(url ? "Published and copied." : "Published.");
        if (url) {
          await copyText(url);
        } else {
          renderClipDetail(clip.id);
        }
      } catch (error) {
        flash(error.message, "error");
        renderClipDetail(clip.id);
      }
    }
  });

  // ── Visibility toggle ────────────────────────────────────────────────────
  const visibilityPanel = document.querySelector("#visibility-panel");
  document.querySelector("#visibility-btn").addEventListener("click", () => {
    visibilityPanel.hidden = !visibilityPanel.hidden;
  });

  document.querySelector("#apply-visibility-btn")?.addEventListener("click", async () => {
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

  // Inline copy link button inside visibility panel
  visibilityPanel?.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await copyText(btn.dataset.copy);
    });
  });

  // ── Edit form toggle ──────────────────────────────────────────────────────
  const editForm = document.querySelector("#clip-edit-form");
  document.querySelector("#edit-btn").addEventListener("click", () => {
    editForm.hidden = !editForm.hidden;
  });

  editForm.addEventListener("submit", async (event) => {
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

  // ── Delete ────────────────────────────────────────────────────────────────
  document.querySelector("#delete-btn").addEventListener("click", async () => {
    if (!window.confirm("Delete this clip?")) {
      return;
    }
    try {
      await api(`/api/v1/clips/${encodeURIComponent(clip.id)}`, {
        method: "DELETE",
        body: {},
      });
      flash("Clip deleted.");
      const { navigate } = await import("/js/router.js");
      navigate("/");
    } catch (error) {
      flash(error.message, "error");
      renderClipDetail(clip.id);
    }
  });
}
