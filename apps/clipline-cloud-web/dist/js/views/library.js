import { state } from "/js/state.js";
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
} from "/js/util.js";

export async function renderLibrary() {
  renderShell({
    active: "library",
    title: "Library",
    subtitle: "Your ready clips, filters, and sharing controls.",
    body: `<div class="empty-state">Loading clips...</div>`,
  });

  try {
    const data = await api(`/api/v1/clips?${libraryParams().toString()}`);
    renderShell({
      active: "library",
      title: "Library",
      subtitle: `${data.clips.length} clip${data.clips.length === 1 ? "" : "s"} in this view.`,
      body: libraryView(data.clips),
    });
    bindLibraryEvents();
  } catch (error) {
    renderShell({
      active: "library",
      title: "Library",
      subtitle: "Your ready clips, filters, and sharing controls.",
      body: `<div class="error-box">${escapeHtml(error.message)}</div>`,
    });
  }
}

function libraryParams() {
  const params = new URLSearchParams();
  params.set("sort", state.libraryQuery.sort);
  params.set("page_size", "100");
  for (const key of ["game", "visibility", "status", "q"]) {
    if (state.libraryQuery[key]) {
      params.set(key, state.libraryQuery[key]);
    }
  }
  if (state.libraryQuery.from) {
    params.set("from", `${state.libraryQuery.from}T00:00:00Z`);
  }
  if (state.libraryQuery.to) {
    params.set("to", `${state.libraryQuery.to}T23:59:59Z`);
  }
  return params;
}

function libraryView(clips) {
  return `
    <section class="section">
      <form id="library-filter-form" class="panel toolbar">
        ${field("Search", "q", "search", state.libraryQuery.q, "Title or game")}
        ${selectField("Sort", "sort", state.libraryQuery.sort, [
          ["uploaded_at_desc", "Uploaded newest"],
          ["uploaded_at_asc", "Uploaded oldest"],
          ["recorded_at_desc", "Recorded newest"],
          ["recorded_at_asc", "Recorded oldest"],
          ["duration_desc", "Duration longest"],
          ["duration_asc", "Duration shortest"],
          ["title_asc", "Title A-Z"],
        ])}
        ${field("Game", "game", "text", state.libraryQuery.game, "Name or ID")}
        ${selectField("Visibility", "visibility", state.libraryQuery.visibility, [
          ["", "Any"],
          ["private", "Private"],
          ["public", "Public"],
          ["unlisted", "Unlisted"],
        ])}
        ${selectField("Status", "status", state.libraryQuery.status, [
          ["", "Ready"],
          ["created", "Created"],
          ["uploading", "Uploading"],
          ["processing", "Processing"],
          ["ready", "Ready"],
          ["failed", "Failed"],
        ])}
        <button class="btn-primary" type="submit">${icon("search")} Apply</button>
      </form>
      ${
        clips.length
          ? `<div class="clip-grid">${clips.map(clipRow).join("")}</div>`
          : `<div class="empty-state">No clips match this view.</div>`
      }
    </section>
  `;
}

function clipRow(clip) {
  const isPublic = clip.visibility === "public" || clip.visibility === "unlisted";
  const toggleLabel = isPublic ? "Make private" : "Publish";
  const toggleIcon = isPublic ? icon("lock") : icon("globe");
  const publicUrl = clip.public_url || "";
  return `
    <article class="clip-row">
      <img class="thumb" src="/api/v1/clips/${encodeURIComponent(clip.id)}/thumbnail" alt="">
      <div>
        <a class="clip-title" href="/clip/${encodeURIComponent(clip.id)}" data-route>${escapeHtml(clip.title)}</a>
        <div class="meta-line">
          <span>${escapeHtml(clip.game_name || clip.game_id || "No game")}</span>
          <span>${formatDuration(clip.duration_ms)}</span>
          <span>${formatBytes(clip.file_size_bytes)}</span>
        </div>
      </div>
      <div>
        ${visibilityBadge(clip.visibility)}
        <div class="meta-line"><span>${escapeHtml(clip.status)}</span></div>
      </div>
      <div class="meta-line">
        <span>Recorded ${formatDate(clip.recorded_at)}</span>
        <span>Uploaded ${formatDate(clip.uploaded_at)}</span>
      </div>
      <div class="actions">
        <a class="btn-secondary" href="/clip/${encodeURIComponent(clip.id)}" data-route>${icon("film")} View</a>
        <button class="btn-secondary icon-btn" title="Copy public link" aria-label="Copy public link" ${publicUrl ? `data-copy="${escapeAttr(publicUrl)}"` : "disabled"}>${icon("copy")}</button>
        <button class="btn-secondary" data-clip-action="toggle" data-clip-id="${escapeAttr(clip.id)}" data-next-visibility="${isPublic ? "private" : "public"}">${toggleIcon} ${toggleLabel}</button>
        <button class="btn-danger icon-btn" title="Delete clip" aria-label="Delete clip" data-clip-action="delete" data-clip-id="${escapeAttr(clip.id)}">${icon("trash")}</button>
      </div>
    </article>
  `;
}

function bindLibraryEvents() {
  document.querySelector("#library-filter-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    for (const key of Object.keys(state.libraryQuery)) {
      state.libraryQuery[key] = String(form.get(key) || "");
    }
    renderLibrary();
  });
  document.querySelectorAll("[data-clip-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.clipId;
      const action = button.dataset.clipAction;
      try {
        if (action === "toggle") {
          await api(`/api/v1/clips/${encodeURIComponent(id)}/visibility`, {
            method: "POST",
            body: { visibility: button.dataset.nextVisibility },
          });
          flash(button.dataset.nextVisibility === "private" ? "Public access removed." : "Public link created.");
        } else if (action === "delete" && window.confirm("Delete this clip?")) {
          await api(`/api/v1/clips/${encodeURIComponent(id)}`, { method: "DELETE", body: {} });
          flash("Clip deleted.");
        }
        renderLibrary();
      } catch (error) {
        flash(error.message, "error");
        renderLibrary();
      }
    });
  });
}
