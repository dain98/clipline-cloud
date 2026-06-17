import { state } from "/js/state.js";
import { api } from "/js/api.js";
import { renderShell } from "/js/shell.js";
import { clipCard, bindThumbFallback } from "/js/components/card.js";
import {
  escapeHtml,
  escapeAttr,
  icon,
  flash,
  field,
  selectField,
  copyText,
} from "/js/util.js";

export async function renderLibrary() {
  const activeRail =
    state.libraryQuery.visibility === "public"
      ? "public"
      : state.libraryQuery.visibility === "private"
      ? "private"
      : "library";

  // Loading skeleton
  renderShell({
    active: activeRail,
    body: `
      <div class="library-page">
        <div class="chip-row">
          <div class="chip chip--active">All</div>
          <div class="chip-spacer"></div>
          <button class="btn-secondary chip-filters-btn" disabled>${icon("search")} Filters</button>
        </div>
        <div class="clip-grid">${Array(8).fill(skeletonCard()).join("")}</div>
      </div>`,
  });

  try {
    const data = await api(`/api/v1/clips?${libraryParams().toString()}`);
    const clips = data.clips || [];
    renderShell({
      active: activeRail,
      body: libraryBody(clips),
      onMount() {
        bindLibraryEvents();
        const content = document.querySelector(".app-content") || document.querySelector("main") || document.body;
        bindThumbFallback(content);
      },
    });
  } catch (error) {
    renderShell({
      active: activeRail,
      body: `<div class="library-page"><div class="error-box">${escapeHtml(error.message)}</div></div>`,
    });
  }
}

// ── Data ─────────────────────────────────────────────────────────────────────

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

// ── Rendering ─────────────────────────────────────────────────────────────────

function libraryBody(clips) {
  return `
    <div class="library-page">
      ${chipBar(clips)}
      ${clips.length ? `<div class="clip-grid">${clips.map(clipCard).join("")}</div>` : emptyState()}
    </div>`;
}

function chipBar(clips) {
  // Deduplicate games from loaded clips, cap at 12
  const seen = new Set();
  const games = [];
  for (const clip of clips) {
    const game = clip.game_name || clip.game_id || "";
    if (game && !seen.has(game)) {
      seen.add(game);
      games.push(game);
      if (games.length >= 12) break;
    }
  }

  const activeGame = state.libraryQuery.game || "";
  const allActive = !activeGame;

  const chips = [
    `<button class="chip${allActive ? " chip--active" : ""}" data-game="">${icon("library")} All</button>`,
    ...games.map(
      (g) =>
        `<button class="chip${activeGame === g ? " chip--active" : ""}" data-game="${escapeAttr(g)}">${escapeHtml(g)}</button>`
    ),
  ].join("");

  const panel = filtersPanel();

  return `
    <div class="chip-row" id="chip-row">
      ${chips}
      <div class="chip-spacer"></div>
      <button class="btn-secondary chip-filters-btn" id="filters-btn" aria-expanded="false" aria-controls="filters-panel">
        ${icon("search")} Filters
      </button>
    </div>
    <div class="filters-panel" id="filters-panel" hidden>
      ${panel}
    </div>`;
}

function filtersPanel() {
  return `
    <form id="filters-form" class="filters-form">
      ${selectField("Sort", "sort", state.libraryQuery.sort, [
        ["uploaded_at_desc", "Uploaded newest"],
        ["uploaded_at_asc", "Uploaded oldest"],
        ["recorded_at_desc", "Recorded newest"],
        ["recorded_at_asc", "Recorded oldest"],
        ["duration_desc", "Duration longest"],
        ["duration_asc", "Duration shortest"],
        ["title_asc", "Title A-Z"],
      ])}
      ${selectField("Status", "status", state.libraryQuery.status, [
        ["", "Any status"],
        ["created", "Created"],
        ["uploading", "Uploading"],
        ["processing", "Processing"],
        ["ready", "Ready"],
        ["failed", "Failed"],
      ])}
      ${field("From", "from", "date", state.libraryQuery.from || "", "")}
      ${field("To", "to", "date", state.libraryQuery.to || "", "")}
      <div class="filters-actions">
        <button class="btn-primary" type="submit">${icon("search")} Apply</button>
        <button class="btn-secondary" type="button" id="filters-clear">Clear</button>
      </div>
    </form>`;
}

function skeletonCard() {
  return `
    <article class="card skeleton-card">
      <div class="skeleton skeleton--thumb"></div>
      <div class="card-body">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--meta"></div>
      </div>
    </article>`;
}

function emptyState() {
  return `
    <div class="empty-state">
      <span class="empty-state__icon">${icon("film")}</span>
      <p class="empty-state__title">No clips found</p>
      <p class="empty-state__body">Try adjusting your filters or upload a new clip.</p>
    </div>`;
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindLibraryEvents() {
  bindChips();
  bindFiltersPanel();
  bindKebabMenu();
}

function bindChips() {
  document.querySelectorAll("[data-game]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.libraryQuery.game = btn.dataset.game;
      renderLibrary();
    });
  });
}

function bindFiltersPanel() {
  const filtersBtn = document.getElementById("filters-btn");
  const filtersPanel = document.getElementById("filters-panel");
  if (!filtersBtn || !filtersPanel) return;

  filtersBtn.addEventListener("click", () => {
    const isOpen = !filtersPanel.hidden;
    filtersPanel.hidden = isOpen;
    filtersBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  const form = document.getElementById("filters-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      state.libraryQuery.sort = String(fd.get("sort") || "uploaded_at_desc");
      state.libraryQuery.status = String(fd.get("status") || "");
      state.libraryQuery.from = String(fd.get("from") || "");
      state.libraryQuery.to = String(fd.get("to") || "");
      renderLibrary();
    });
  }

  const clearBtn = document.getElementById("filters-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.libraryQuery.sort = "uploaded_at_desc";
      state.libraryQuery.status = "";
      state.libraryQuery.from = "";
      state.libraryQuery.to = "";
      state.libraryQuery.q = "";
      renderLibrary();
    });
  }
}

// ── Kebab menu ────────────────────────────────────────────────────────────────

let _openMenu = null;
let _kebabGlobalsBound = false;

function closeOpenMenu() {
  if (_openMenu) {
    _openMenu.remove();
    _openMenu = null;
  }
}

function bindKebabGlobals() {
  if (_kebabGlobalsBound) return;
  _kebabGlobalsBound = true;
  document.addEventListener("click", closeOpenMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOpenMenu();
  });
}

function buildMenu(clipId, visibility, publicUrl) {
  const isPublic = visibility === "public" || visibility === "unlisted";
  const toggleLabel = isPublic ? "Make private" : "Make public";
  const toggleIcon = isPublic ? "lock" : "globe";
  const copyDisabled = publicUrl ? "" : " disabled";
  return `
    <ul class="menu" role="menu">
      <li role="presentation">
        <button class="menu__item" role="menuitem" id="menu-copy"${copyDisabled}>
          ${icon("copy")} Copy link
        </button>
      </li>
      <li role="presentation">
        <button class="menu__item" role="menuitem" id="menu-toggle"
          data-clip-id="${escapeAttr(clipId)}"
          data-next-visibility="${escapeAttr(isPublic ? "private" : "public")}">
          ${icon(toggleIcon)} ${escapeHtml(toggleLabel)}
        </button>
      </li>
      <li role="presentation">
        <button class="menu__item menu__item--danger" role="menuitem" id="menu-delete"
          data-clip-id="${escapeAttr(clipId)}">
          ${icon("trash")} Delete
        </button>
      </li>
    </ul>`;
}

function positionMenu(menuEl, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const scrollY = window.scrollY || 0;
  const scrollX = window.scrollX || 0;
  menuEl.style.position = "absolute";
  menuEl.style.top = `${rect.bottom + scrollY + 4}px`;
  // Try to align to the right of the anchor; clamp to viewport
  const menuWidth = 180;
  let left = rect.right + scrollX - menuWidth;
  if (left < 8) left = 8;
  menuEl.style.left = `${left}px`;
  menuEl.style.zIndex = "200";
}

function bindKebabMenu() {
  bindKebabGlobals();
  document.querySelectorAll("[data-kebab]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Toggle: close if this button's menu is already open
      if (_openMenu && _openMenu.dataset.forKebab === btn.dataset.clipId) {
        closeOpenMenu();
        return;
      }
      closeOpenMenu();

      const clipId = btn.dataset.clipId;
      const visibility = btn.dataset.visibility;
      const publicUrl = btn.dataset.publicUrl || "";

      const container = document.createElement("div");
      container.innerHTML = buildMenu(clipId, visibility, publicUrl);
      const menuEl = container.querySelector(".menu");
      menuEl.dataset.forKebab = clipId;
      document.body.appendChild(menuEl);
      _openMenu = menuEl;

      positionMenu(menuEl, btn);

      // Copy link
      const copyBtn = menuEl.querySelector("#menu-copy");
      if (copyBtn && !copyBtn.disabled) {
        copyBtn.addEventListener("click", async () => {
          closeOpenMenu();
          await copyText(publicUrl);
        });
      }

      // Toggle visibility
      const toggleBtn = menuEl.querySelector("#menu-toggle");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", async () => {
          closeOpenMenu();
          const id = toggleBtn.dataset.clipId;
          const nextVisibility = toggleBtn.dataset.nextVisibility;
          try {
            await api(`/api/v1/clips/${encodeURIComponent(id)}/visibility`, {
              method: "POST",
              body: { visibility: nextVisibility },
            });
            flash(nextVisibility === "private" ? "Public access removed." : "Public link created.");
          } catch (err) {
            flash(err.message, "error");
          }
          renderLibrary();
        });
      }

      // Delete
      const deleteBtn = menuEl.querySelector("#menu-delete");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          closeOpenMenu();
          const id = deleteBtn.dataset.clipId;
          if (!window.confirm("Delete this clip?")) return;
          try {
            await api(`/api/v1/clips/${encodeURIComponent(id)}`, { method: "DELETE", body: {} });
            flash("Clip deleted.");
          } catch (err) {
            flash(err.message, "error");
          }
          renderLibrary();
        });
      }
    });
  });
}
