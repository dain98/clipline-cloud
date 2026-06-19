import {
  clampTime,
  formatClock,
  formatReadout,
  markerSummary,
  nextMarker,
  normalizeMarkers,
  percentFor,
  playerKeyIntent,
  previousMarker,
  secondsFromMilliseconds,
} from "./player-core.js";

const app = document.querySelector("#app");

const state = {
  user: null,
  csrfToken: null,
  flash: null,
  selectedClipIds: new Set(),
  libraryQuery: {
    sort: "uploaded_at_desc",
    game: "",
    source_type: "",
    visibility: "",
    status: "",
    q: "",
    from: "",
    to: "",
    min_duration_seconds: "",
    max_duration_seconds: "",
    min_size_mib: "",
    max_size_mib: "",
    group: "none",
  },
  publicQuery: {
    sort: "uploaded_at_desc",
    game: "",
    q: "",
  },
  adminResetToken: null,
};

const icons = {
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  fastForward: '<path d="m13 19 9-7-9-7v14Z"/><path d="m2 19 9-7-9-7v14Z"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 8h4"/><path d="M3 16h4"/><path d="M17 8h4"/><path d="M17 16h4"/>',
  fullscreen: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 8.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M9 22V12h6v10"/>',
  library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  pause: '<path d="M8 5v14"/><path d="M16 5v14"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.7L21 8"/><path d="M21 3v5h-5"/>',
  rewind: '<path d="m11 19-9-7 9-7v14Z"/><path d="m22 19-9-7 9-7v14Z"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
  skipBack: '<path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/>',
  skipForward: '<path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V5l8-3 8 3v8Z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  volume2: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',
  volumeX: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

window.addEventListener("popstate", route);
document.addEventListener("click", onDocumentClick);

route();

async function route() {
  const current = currentRoute();
  if (current.name === "public") {
    await renderPublicShare(current.shareId);
    return;
  }
  if (current.name === "publicLibrary") {
    if (!state.user) {
      await refreshSession();
    }
    await renderPublicLibrary();
    return;
  }

  if (current.name === "login") {
    if (state.user) {
      navigate("/library");
      return;
    }
    renderLogin();
    return;
  }

  if (!state.user) {
    const authenticated = await refreshSession();
    if (!authenticated) {
      navigate("/login");
      return;
    }
  }

  if (current.name === "clip") {
    await renderClipDetail(current.clipId);
  } else if (current.name === "admin") {
    if (state.user.role !== "admin") {
      flash("Admin access is required.", "error");
      navigate("/library");
      return;
    }
    await renderAdmin(current.tab);
  } else if (current.name === "account") {
    await renderAccount();
  } else {
    await renderLibrary();
  }
}

function currentRoute() {
  const path = window.location.pathname;
  if (path.startsWith("/c/")) {
    return { name: "public", shareId: decodeURIComponent(path.slice(3)) };
  }
  if (path === "/" || path === "/public") {
    return { name: "publicLibrary" };
  }
  if (path === "/library") {
    return { name: "library" };
  }
  if (path.startsWith("/clip/")) {
    return { name: "clip", clipId: decodeURIComponent(path.slice(6)) };
  }
  if (path === "/admin") {
    return {
      name: "admin",
      tab: new URLSearchParams(window.location.search).get("tab") || "overview",
    };
  }
  if (path === "/account") {
    return { name: "account" };
  }
  if (path === "/login") {
    return { name: "login" };
  }
  return { name: "publicLibrary" };
}

function navigate(path) {
  window.history.pushState({}, "", path);
  route();
}

function onDocumentClick(event) {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    navigate(routeLink.getAttribute("href"));
    return;
  }

  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    event.preventDefault();
    copyText(copyButton.dataset.copy);
  }
}

async function refreshSession() {
  try {
    const data = await api("/api/v1/auth/me");
    state.user = data.user;
    state.csrfToken = data.csrf_token;
    return true;
  } catch (error) {
    state.user = null;
    state.csrfToken = null;
    return false;
  }
}

async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  let body = options.body;
  if (body && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && state.csrfToken) {
    headers.set("X-CSRF-Token", state.csrfToken);
  }

  const response = await fetch(path, {
    ...options,
    body,
    credentials: "same-origin",
    headers,
    method,
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const message = typeof data === "object" && data && data.error ? data.error : response.statusText;
    throw new Error(message || "Request failed");
  }
  return data;
}

function renderLogin(error = "") {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel" aria-labelledby="login-title">
        <div class="brand-mark" aria-hidden="true">CL</div>
        <h1 id="login-title">Clipline Cloud</h1>
        <p>Sign in with an account created by this instance's admin.</p>
        ${error ? `<div class="error-box">${escapeHtml(error)}</div>` : ""}
        <form id="login-form" class="section" autocomplete="on">
          <label class="field">
            <span>Username</span>
            <input name="username" autocomplete="username" required>
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          <button class="btn-primary" type="submit">${icon("lock")} Sign in</button>
        </form>
      </section>
    </main>
  `;
  document.querySelector("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await api("/api/v1/auth/login", {
        method: "POST",
        body: {
          username: String(form.get("username") || ""),
          password: String(form.get("password") || ""),
        },
      });
      state.user = data.user;
      state.csrfToken = data.csrf_token;
      navigate("/library");
    } catch (loginError) {
      renderLogin(loginError.message);
    }
  });
}

function renderShell({ active, title, subtitle, body }) {
  const adminLink =
    state.user?.role === "admin"
      ? navLink("/admin", "admin", active, icon("shield"), "Admin")
      : "";
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark" aria-hidden="true">CL</div>
          <div>
            <strong>Clipline</strong>
            <span>Cloud library</span>
          </div>
        </div>
        <nav class="nav-stack" aria-label="Primary">
          ${navLink("/", "public", active, icon("home"), "Home")}
          ${navLink("/library", "library", active, icon("library"), "Library")}
          ${navLink("/account", "account", active, icon("user"), "Account")}
          ${adminLink}
        </nav>
        <div class="sidebar-footer">
          <div class="user-chip">
            ${escapeHtml(state.user?.username || "")}
            <span>${escapeHtml(state.user?.role || "")}</span>
          </div>
          <button id="logout-button" class="btn-ghost" title="Sign out" aria-label="Sign out">
            ${icon("logOut")} Sign out
          </button>
        </div>
      </aside>
      <main class="main-pane">
        <header class="topbar">
          <div>
            <h1>${escapeHtml(title)}</h1>
            ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
          </div>
        </header>
        <div class="content">
          ${renderFlash()}
          ${body}
        </div>
      </main>
    </div>
  `;
  document.querySelector("#logout-button").addEventListener("click", logout);
}

function navLink(href, key, active, iconSvg, label) {
  return `
    <a class="nav-link ${active === key ? "active" : ""}" href="${escapeAttr(href)}" data-route>
      ${iconSvg}<span>${escapeHtml(label)}</span>
    </a>
  `;
}

async function logout() {
  try {
    await api("/api/v1/auth/logout", { method: "POST", body: {} });
  } catch (_) {
    // The local session is cleared either way.
  }
  state.user = null;
  state.csrfToken = null;
  navigate("/login");
}

async function renderLibrary() {
  renderShell({
    active: "library",
    title: "Library",
    subtitle: "Your ready clips, filters, and sharing controls.",
    body: `<div class="empty-state">Loading clips...</div>`,
  });

  try {
    const data = await api(`/api/v1/clips?${libraryParams().toString()}`);
    syncSelectedClips(data.clips);
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
  for (const key of ["game", "source_type", "visibility", "status", "q"]) {
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
  setNumericParam(params, "min_duration_ms", secondsToMilliseconds(state.libraryQuery.min_duration_seconds));
  setNumericParam(params, "max_duration_ms", secondsToMilliseconds(state.libraryQuery.max_duration_seconds));
  setNumericParam(params, "min_size_bytes", mebibytesToBytes(state.libraryQuery.min_size_mib));
  setNumericParam(params, "max_size_bytes", mebibytesToBytes(state.libraryQuery.max_size_mib));
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
          ["updated_at_desc", "Updated newest"],
          ["updated_at_asc", "Updated oldest"],
          ["created_at_desc", "Created newest"],
          ["created_at_asc", "Created oldest"],
          ["duration_desc", "Duration longest"],
          ["duration_asc", "Duration shortest"],
          ["size_desc", "Size largest"],
          ["size_asc", "Size smallest"],
          ["title_asc", "Title A-Z"],
          ["title_desc", "Title Z-A"],
        ])}
        ${selectField("Group", "group", state.libraryQuery.group, [
          ["none", "None"],
          ["game", "Game"],
        ])}
        ${field("Game", "game", "text", state.libraryQuery.game, "Name or ID")}
        ${field("Source", "source_type", "text", state.libraryQuery.source_type, "Source type")}
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
        ${field("From", "from", "date", state.libraryQuery.from, "")}
        ${field("To", "to", "date", state.libraryQuery.to, "")}
        ${numberField("Min duration", "min_duration_seconds", state.libraryQuery.min_duration_seconds, "Seconds")}
        ${numberField("Max duration", "max_duration_seconds", state.libraryQuery.max_duration_seconds, "Seconds")}
        ${numberField("Min size", "min_size_mib", state.libraryQuery.min_size_mib, "MiB", "0.1")}
        ${numberField("Max size", "max_size_mib", state.libraryQuery.max_size_mib, "MiB", "0.1")}
        <button class="btn-primary" type="submit">${icon("search")} Apply</button>
      </form>
      ${
        clips.length
          ? `${bulkActions(clips)}${libraryResultsView(clips)}`
          : `<div class="empty-state">No clips match this view.</div>`
      }
    </section>
  `;
}

function bulkActions(clips) {
  const selectedCount = selectedVisibleCount(clips);
  const allSelected = clips.length > 0 && selectedCount === clips.length;
  return `
    <div class="panel bulk-toolbar">
      <label class="check-line">
        <input id="select-visible-clips" type="checkbox" ${allSelected ? "checked" : ""}>
        <span>Select visible</span>
      </label>
      <span id="bulk-selected-count" class="muted">${state.selectedClipIds.size} selected</span>
      <label class="field">
        <span>Visibility</span>
        <select id="bulk-visibility">
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
        </select>
      </label>
      <button id="bulk-visibility-button" class="btn-secondary" type="button" ${state.selectedClipIds.size ? "" : "disabled"}>${icon("globe")} Apply visibility</button>
      <button id="bulk-delete-button" class="btn-danger" type="button" ${state.selectedClipIds.size ? "" : "disabled"}>${icon("trash")} Delete selected</button>
    </div>
  `;
}

function libraryResultsView(clips) {
  if (state.libraryQuery.group !== "game") {
    return `<div class="clip-grid">${clips.map(clipRow).join("")}</div>`;
  }
  const groups = new Map();
  for (const clip of clips) {
    const label = gameLabel(clip);
    const group = groups.get(label) || [];
    group.push(clip);
    groups.set(label, group);
  }
  const sortedGroups = Array.from(groups.entries()).sort(([left], [right]) =>
    left.localeCompare(right, undefined, { sensitivity: "base" })
  );
  return `
    <div class="clip-groups">
      ${sortedGroups
        .map(
          ([label, groupClips]) => `
            <section class="clip-group">
              <div class="clip-group-header">
                <h2>${escapeHtml(label)}</h2>
                <span class="muted">${groupClips.length} clip${groupClips.length === 1 ? "" : "s"}</span>
              </div>
              <div class="clip-grid">${groupClips.map(clipRow).join("")}</div>
            </section>
          `
        )
        .join("")}
    </div>
  `;
}

function clipRow(clip) {
  const isPublic = clip.visibility === "public" || clip.visibility === "unlisted";
  const toggleLabel = isPublic ? "Make private" : "Publish";
  const toggleIcon = isPublic ? icon("lock") : icon("globe");
  const publicUrl = clip.public_url || "";
  return `
    <article class="clip-row">
      <label class="clip-select" title="Select clip">
        <input type="checkbox" data-select-clip="${escapeAttr(clip.id)}" ${state.selectedClipIds.has(clip.id) ? "checked" : ""} aria-label="Select ${escapeAttr(clip.title)}">
      </label>
      <img class="thumb" src="/api/v1/clips/${encodeURIComponent(clip.id)}/thumbnail" alt="">
      <div>
        <a class="clip-title" href="/clip/${encodeURIComponent(clip.id)}" data-route>${escapeHtml(clip.title)}</a>
        <div class="meta-line">
          <span>${escapeHtml(gameLabel(clip))}</span>
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
  bindBulkEvents();
}

async function renderPublicLibrary() {
  renderPublicLibraryPage({
    title: "Home",
    body: publicLibraryView([], {
      statusHtml: `<div class="empty-state">Loading public clips...</div>`,
    }),
  });

  try {
    const data = await api(`/api/v1/public/clips?${publicLibraryParams().toString()}`);
    renderPublicLibraryPage({
      title: "Home",
      body: publicLibraryView(data.clips, {
        resultText: `${data.clips.length} clip${data.clips.length === 1 ? "" : "s"}`,
      }),
    });
    bindPublicLibraryEvents();
  } catch (error) {
    renderPublicLibraryPage({
      title: "Home",
      body: publicLibraryView([], {
        statusHtml: `<div class="error-box">${escapeHtml(error.message)}</div>`,
      }),
    });
  }
}

function renderPublicLibraryPage({ title, subtitle, body }) {
  if (state.user) {
    renderShell({
      active: "public",
      title,
      subtitle,
      body,
    });
    return;
  }

  app.innerHTML = `
    <main class="public-browse-shell">
      <header class="public-browse-topbar">
        <a class="sidebar-brand" href="/" data-route>
          <div class="brand-mark" aria-hidden="true">CL</div>
          <div>
            <strong>Clipline</strong>
            <span>Home</span>
          </div>
        </a>
        <a class="btn-secondary" href="/login" data-route>${icon("lock")} Sign in</a>
      </header>
      <section class="public-browse-content">
        ${renderFlash()}
        ${body}
      </section>
    </main>
  `;
}

function publicLibraryParams() {
  const params = new URLSearchParams();
  params.set("sort", state.publicQuery.sort);
  params.set("page_size", "60");
  for (const key of ["game", "q"]) {
    if (state.publicQuery[key]) {
      params.set(key, state.publicQuery[key]);
    }
  }
  return params;
}

function publicLibraryView(clips, options = {}) {
  return `
    <section class="section public-home">
      ${publicSearchForm(options.resultText || "")}
      ${
        options.statusHtml
          ? options.statusHtml
          : clips.length
          ? `<div class="public-clip-grid">${clips.map(publicClipCard).join("")}</div>`
          : `<div class="empty-state">No public clips match this view.</div>`
      }
    </section>
  `;
}

function publicSearchForm(resultText) {
  return `
    <form id="public-filter-form" class="public-search-form" role="search">
      <div class="public-search-row">
        <input name="q" type="search" value="${escapeAttr(state.publicQuery.q)}" placeholder="Search" aria-label="Search public clips" autocomplete="off">
        <button class="public-search-button" type="submit" aria-label="Search">${icon("search")}</button>
      </div>
      <div class="public-search-controls">
        ${publicSelectControl("Sort", "sort", state.publicQuery.sort, [
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
        ])}
        <label class="public-filter-control">
          <span>Game</span>
          <input name="game" type="text" value="${escapeAttr(state.publicQuery.game)}" placeholder="Any game">
        </label>
        ${resultText ? `<span class="public-result-count">${escapeHtml(resultText)}</span>` : ""}
      </div>
    </form>
  `;
}

function publicSelectControl(label, name, value, options) {
  return `
    <label class="public-filter-control">
      <span>${escapeHtml(label)}</span>
      <select name="${escapeAttr(name)}">
        ${options
          .map(([optionValue, optionLabel]) => `<option value="${escapeAttr(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`)
          .join("")}
      </select>
    </label>
  `;
}

function publicClipCard(clip) {
  const sharePath = `/c/${encodeURIComponent(clip.share_id)}`;
  const thumbnailPath = `/api/v1/public/clips/${encodeURIComponent(clip.share_id)}/thumbnail`;
  const authorName = publicAuthorName(clip);
  return `
    <a class="public-clip-card" href="${escapeAttr(sharePath)}" data-route>
      <img class="thumb" src="${escapeAttr(thumbnailPath)}" alt="">
      <div class="public-clip-body">
        <h2>${escapeHtml(clip.title)}</h2>
        <p class="public-author">by ${escapeHtml(authorName)}</p>
        <div class="meta-line">
          <span>${escapeHtml(gameLabel(clip))}</span>
          <span>${formatDuration(clip.duration_ms)}</span>
        </div>
        <div class="meta-line">
          <span>Uploaded ${formatDate(clip.uploaded_at)}</span>
        </div>
      </div>
    </a>
  `;
}

function bindPublicLibraryEvents() {
  document.querySelector("#public-filter-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    for (const key of Object.keys(state.publicQuery)) {
      state.publicQuery[key] = String(form.get(key) || "");
    }
    renderPublicLibrary();
  });
}

function gameLabel(clip) {
  return clip.game_name || clip.game_id || "No game";
}

function publicAuthorName(clip) {
  return clip.author_name || "Unknown creator";
}

function syncSelectedClips(clips) {
  const visibleIds = new Set(clips.map((clip) => clip.id));
  for (const id of Array.from(state.selectedClipIds)) {
    if (!visibleIds.has(id)) {
      state.selectedClipIds.delete(id);
    }
  }
}

function selectedVisibleCount(clips) {
  return clips.filter((clip) => state.selectedClipIds.has(clip.id)).length;
}

function selectedClipIds() {
  return Array.from(state.selectedClipIds);
}

function bindBulkEvents() {
  const selectVisible = document.querySelector("#select-visible-clips");
  if (!selectVisible) {
    return;
  }
  const clipCheckboxes = Array.from(document.querySelectorAll("[data-select-clip]"));
  selectVisible.indeterminate =
    clipCheckboxes.some((input) => input.checked) && !clipCheckboxes.every((input) => input.checked);
  selectVisible.addEventListener("change", () => {
    for (const input of clipCheckboxes) {
      if (selectVisible.checked) {
        state.selectedClipIds.add(input.dataset.selectClip);
        input.checked = true;
      } else {
        state.selectedClipIds.delete(input.dataset.selectClip);
        input.checked = false;
      }
    }
    updateBulkControls();
  });
  for (const input of clipCheckboxes) {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.selectedClipIds.add(input.dataset.selectClip);
      } else {
        state.selectedClipIds.delete(input.dataset.selectClip);
      }
      updateBulkControls();
    });
  }

  document.querySelector("#bulk-visibility-button")?.addEventListener("click", async () => {
    const ids = selectedClipIds();
    const visibility = document.querySelector("#bulk-visibility").value;
    if (!ids.length) {
      return;
    }
    try {
      const result = await api("/api/v1/clips/bulk-visibility", {
        method: "POST",
        body: { ids, visibility },
      });
      state.selectedClipIds.clear();
      flash(`Visibility updated for ${result.affected} clip${result.affected === 1 ? "" : "s"}.`);
      renderLibrary();
    } catch (error) {
      flash(error.message, "error");
      renderLibrary();
    }
  });

  document.querySelector("#bulk-delete-button")?.addEventListener("click", async () => {
    const ids = selectedClipIds();
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected clip${ids.length === 1 ? "" : "s"}?`)) {
      return;
    }
    try {
      const result = await api("/api/v1/clips/bulk-delete", {
        method: "POST",
        body: { ids },
      });
      state.selectedClipIds.clear();
      flash(`Deleted ${result.affected} clip${result.affected === 1 ? "" : "s"}.`);
      renderLibrary();
    } catch (error) {
      flash(error.message, "error");
      renderLibrary();
    }
  });
}

function updateBulkControls() {
  const count = state.selectedClipIds.size;
  const countLabel = document.querySelector("#bulk-selected-count");
  if (countLabel) {
    countLabel.textContent = `${count} selected`;
  }
  document.querySelector("#bulk-visibility-button")?.toggleAttribute("disabled", count === 0);
  document.querySelector("#bulk-delete-button")?.toggleAttribute("disabled", count === 0);
  const clipCheckboxes = Array.from(document.querySelectorAll("[data-select-clip]"));
  const selectVisible = document.querySelector("#select-visible-clips");
  if (selectVisible && clipCheckboxes.length) {
    selectVisible.checked = clipCheckboxes.every((input) => input.checked);
    selectVisible.indeterminate =
      clipCheckboxes.some((input) => input.checked) && !clipCheckboxes.every((input) => input.checked);
  }
}

async function renderClipDetail(id) {
  renderShell({
    active: "library",
    title: "Clip detail",
    subtitle: "Playback, metadata, markers, and visibility.",
    body: `<div class="empty-state">Loading clip...</div>`,
  });

  try {
    const clip = await api(`/api/v1/clips/${encodeURIComponent(id)}`);
    renderShell({
      active: "library",
      title: clip.title,
      subtitle: clip.game_name || clip.game_id || "No game metadata",
      body: clipDetailView(clip),
    });
    bindClipDetailEvents(clip);
  } catch (error) {
    renderShell({
      active: "library",
      title: "Clip detail",
      subtitle: "Playback, metadata, markers, and visibility.",
      body: `<div class="error-box">${escapeHtml(error.message)}</div>`,
    });
  }
}

function clipPlayerView({ playerId, src, poster = "", durationMs = null }) {
  const safeSrc = src ? escapeAttr(src) : "";
  const safePoster = poster ? escapeAttr(poster) : "";
  const durationLabel = durationMs == null ? "Loading media..." : formatDuration(durationMs);
  return `
    <div class="clip-player" data-clip-player="${escapeAttr(playerId)}" tabindex="0" aria-label="Video player">
      <div class="clip-player-stage" data-player-stage>
        <video
          class="clip-player-video"
          data-player-video
          preload="metadata"
          playsinline
          ${safePoster ? `poster="${safePoster}"` : ""}
          ${safeSrc ? `src="${safeSrc}"` : ""}
        ></video>
        <div class="clip-player-note" data-player-note>${escapeHtml(durationLabel)}</div>
        <div class="clip-player-overlay">
          <div class="clip-player-transport">
            <div class="player-cluster">
              <button type="button" class="player-icon" data-player-prev-marker title="Previous marker (Shift+M)" aria-label="Previous marker">${icon("skipBack")}</button>
              <button type="button" class="player-icon" data-player-next-marker title="Next marker (M)" aria-label="Next marker">${icon("skipForward")}</button>
              <span class="player-marker-count" data-player-marker-count>No markers</span>
            </div>
            <div class="player-cluster player-cluster-main">
              <button type="button" class="player-icon" data-player-back title="Back 5 seconds" aria-label="Back 5 seconds">${icon("rewind")}</button>
              <button type="button" class="player-icon player-play" data-player-toggle title="Play / pause (Space)" aria-label="Play / pause">
                <span class="player-play-icon">${icon("play")}</span>
                <span class="player-pause-icon">${icon("pause")}</span>
              </button>
              <button type="button" class="player-icon" data-player-forward title="Forward 5 seconds" aria-label="Forward 5 seconds">${icon("fastForward")}</button>
              <span class="player-time" data-player-time>0:00.0 / 0:00.0</span>
            </div>
            <div class="player-cluster player-cluster-right">
              <select class="player-rate" data-player-rate title="Playback speed" aria-label="Playback speed">
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1" selected>1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
              <button type="button" class="player-icon" data-player-mute title="Mute / unmute" aria-label="Mute / unmute">
                <span class="player-volume-icon">${icon("volume2")}</span>
                <span class="player-muted-icon">${icon("volumeX")}</span>
              </button>
              <input class="player-volume" data-player-volume type="range" min="0" max="1" step="0.01" value="1" aria-label="Volume">
              <button type="button" class="player-icon" data-player-fullscreen title="Fullscreen (F)" aria-label="Fullscreen">${icon("fullscreen")}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="clip-player-deck">
        <div class="clip-player-timeline" data-player-timeline>
          <div class="clip-player-progress" data-player-progress></div>
          <div class="clip-player-marker-layer" data-player-marker-layer></div>
          <input class="clip-player-scrubber" data-player-scrubber type="range" min="0" max="0" step="0.01" value="0" aria-label="Seek">
        </div>
      </div>
    </div>
  `;
}

function initClipPlayer(root, { durationMs = null, markers = [] } = {}) {
  if (!root) {
    return;
  }

  const video = root.querySelector("[data-player-video]");
  const note = root.querySelector("[data-player-note]");
  const time = root.querySelector("[data-player-time]");
  const progress = root.querySelector("[data-player-progress]");
  const scrubber = root.querySelector("[data-player-scrubber]");
  const markerLayer = root.querySelector("[data-player-marker-layer]");
  const markerCount = root.querySelector("[data-player-marker-count]");
  const prevMarkerButton = root.querySelector("[data-player-prev-marker]");
  const nextMarkerButton = root.querySelector("[data-player-next-marker]");
  const volume = root.querySelector("[data-player-volume]");
  const muteButton = root.querySelector("[data-player-mute]");
  const fullscreenButton = root.querySelector("[data-player-fullscreen]");
  const playbackRate = root.querySelector("[data-player-rate]");
  const playButtons = Array.from(root.querySelectorAll("[data-player-toggle]"));
  const fallbackDuration = secondsFromMilliseconds(durationMs);
  let duration = fallbackDuration;
  let normalizedMarkers = normalizeMarkers(markers, duration);
  let pendingSeek = null;
  let scrubbing = false;
  let resumeAfterScrub = false;

  video.controls = false;
  video.playbackRate = Number(playbackRate.value);

  function playable() {
    return Boolean(video.currentSrc || video.getAttribute("src"));
  }

  function setRangeFill(input, value, max) {
    const pct = max > 0 ? percentFor(value, max) : 0;
    input.style.setProperty("--range-fill", `${pct}%`);
  }

  function resolveDuration() {
    return Number.isFinite(video.duration) && video.duration > 0 ? video.duration : fallbackDuration;
  }

  function setDuration(nextDuration) {
    duration = Number.isFinite(nextDuration) && nextDuration > 0 ? nextDuration : fallbackDuration;
    scrubber.max = duration > 0 ? String(duration) : "0";
    scrubber.disabled = !(duration > 0);
    normalizedMarkers = normalizeMarkers(markers, duration);
    renderMarkers();
    updateProgress(video.currentTime || 0);
  }

  function updateProgress(timeValue = video.currentTime || 0) {
    const current = duration > 0 ? clampTime(timeValue, duration) : Math.max(0, timeValue || 0);
    const pct = percentFor(current, duration);
    progress.style.width = `${pct}%`;
    if (!scrubbing) {
      scrubber.value = String(current);
    }
    setRangeFill(scrubber, current, duration);
    time.textContent = formatReadout(current, duration);
  }

  function updatePlayState() {
    const playing = !video.paused && !video.ended;
    root.classList.toggle("is-playing", playing);
    playButtons.forEach((button) => {
      button.setAttribute("aria-label", playing ? "Pause video" : "Play video");
      button.setAttribute("aria-pressed", String(playing));
    });
  }

  function updateVolumeState() {
    const muted = video.muted || video.volume === 0;
    root.classList.toggle("is-muted", muted);
    volume.value = String(muted ? 0 : video.volume);
    setRangeFill(volume, Number(volume.value), 1);
  }

  function renderMarkers() {
    markerLayer.replaceChildren();
    markerCount.textContent = markerSummary(normalizedMarkers);
    prevMarkerButton.disabled = !normalizedMarkers.length;
    nextMarkerButton.disabled = !normalizedMarkers.length;

    for (const marker of normalizedMarkers) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `clip-player-marker marker-${marker.category}`;
      button.style.left = `${percentFor(marker.time, duration)}%`;
      button.title = `${marker.label} @ ${formatClock(marker.time)}`;
      button.setAttribute("aria-label", `Seek to ${marker.label} at ${formatClock(marker.time)}`);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        seekTo(marker.time);
      });
      markerLayer.appendChild(button);
    }
  }

  function seekTo(value) {
    if (!playable()) {
      return;
    }
    const target = duration > 0 ? clampTime(Number(value), duration) : Math.max(0, Number(value) || 0);
    if (video.seeking) {
      pendingSeek = target;
    } else {
      pendingSeek = null;
      video.currentTime = target;
    }
    updateProgress(target);
  }

  function seekBy(seconds) {
    seekTo((video.currentTime || 0) + seconds);
  }

  function togglePlay() {
    if (!playable()) {
      note.textContent = "Media unavailable";
      return;
    }
    if (video.paused || video.ended) {
      video.play().catch((error) => {
        note.textContent = error?.message || "Playback failed";
        updatePlayState();
      });
    } else {
      video.pause();
    }
  }

  function jumpMarker(direction) {
    const current = video.currentTime || 0;
    const marker = direction > 0
      ? nextMarker(normalizedMarkers, current)
      : previousMarker(normalizedMarkers, current);
    if (marker) {
      seekTo(marker.time);
    }
  }

  function toggleMute() {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) {
        video.volume = 1;
      }
    } else {
      video.muted = true;
    }
    updateVolumeState();
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (root.requestFullscreen) {
      await root.requestFullscreen();
    }
  }

  function updateMediaNote() {
    if (video.videoWidth && video.videoHeight) {
      note.textContent = `${video.videoWidth}x${video.videoHeight} - ${duration > 0 ? formatClock(duration) : "ready"}`;
    }
  }

  function startScrub() {
    scrubbing = true;
    resumeAfterScrub = !video.paused;
    if (resumeAfterScrub) {
      video.pause();
    }
  }

  function endScrub() {
    if (!scrubbing) {
      return;
    }
    scrubbing = false;
    if (resumeAfterScrub) {
      resumeAfterScrub = false;
      video.play().catch(updatePlayState);
    }
  }

  playButtons.forEach((button) => button.addEventListener("click", togglePlay));
  video.addEventListener("click", togglePlay);
  root.querySelector("[data-player-back]").addEventListener("click", () => seekBy(-5));
  root.querySelector("[data-player-forward]").addEventListener("click", () => seekBy(5));
  prevMarkerButton.addEventListener("click", () => jumpMarker(-1));
  nextMarkerButton.addEventListener("click", () => jumpMarker(1));
  muteButton.addEventListener("click", toggleMute);
  fullscreenButton.addEventListener("click", () => {
    toggleFullscreen().catch((error) => {
      note.textContent = error?.message || "Fullscreen unavailable";
    });
  });
  playbackRate.addEventListener("change", () => {
    video.playbackRate = Number(playbackRate.value);
  });
  volume.addEventListener("input", () => {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
    updateVolumeState();
  });
  scrubber.addEventListener("pointerdown", startScrub);
  scrubber.addEventListener("input", () => {
    seekTo(Number(scrubber.value));
  });
  scrubber.addEventListener("change", endScrub);
  scrubber.addEventListener("pointerup", endScrub);
  scrubber.addEventListener("pointercancel", endScrub);
  scrubber.addEventListener("lostpointercapture", endScrub);
  root.addEventListener("pointerdown", () => root.focus({ preventScroll: true }));
  root.addEventListener("keydown", (event) => {
    const tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || tag === "BUTTON") {
      return;
    }
    const intent = playerKeyIntent(event.code, event.shiftKey);
    if (!intent) {
      return;
    }
    event.preventDefault();
    switch (intent.kind) {
      case "toggle-play":
        togglePlay();
        break;
      case "seek-by":
        seekBy(intent.seconds);
        break;
      case "seek-to":
        seekTo(intent.seconds);
        break;
      case "seek-to-end":
        seekTo(duration);
        break;
      case "next-marker":
        jumpMarker(1);
        break;
      case "previous-marker":
        jumpMarker(-1);
        break;
      case "fullscreen":
        toggleFullscreen().catch(() => {});
        break;
    }
  });

  video.addEventListener("loadedmetadata", () => {
    setDuration(resolveDuration());
    updateMediaNote();
  });
  video.addEventListener("durationchange", () => setDuration(resolveDuration()));
  video.addEventListener("timeupdate", () => updateProgress());
  video.addEventListener("play", updatePlayState);
  video.addEventListener("pause", updatePlayState);
  video.addEventListener("ended", updatePlayState);
  video.addEventListener("volumechange", updateVolumeState);
  video.addEventListener("seeked", () => {
    if (pendingSeek != null) {
      const target = pendingSeek;
      pendingSeek = null;
      video.currentTime = target;
    }
    updateProgress();
  });
  video.addEventListener("error", () => {
    const error = video.error;
    note.textContent = `Load error ${error ? error.code : ""}`.trim();
  });

  setDuration(duration);
  updatePlayState();
  updateVolumeState();
  updateMediaNote();
}

function clipDetailView(clip) {
  return `
    <section class="detail-layout">
      <div class="section">
        ${clipPlayerView({
          playerId: `clip-${clip.id}`,
          src: `/api/v1/clips/${encodeURIComponent(clip.id)}/media`,
          durationMs: clip.duration_ms,
        })}
        <div class="panel">
          <div class="section-header">
            <h2>Markers</h2>
            <span class="muted">${clip.markers.length} marker${clip.markers.length === 1 ? "" : "s"}</span>
          </div>
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
  initClipPlayer(document.querySelector("[data-clip-player]"), {
    durationMs: clip.duration_ms,
    markers: clip.markers,
  });

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
      navigate("/library");
    } catch (error) {
      flash(error.message, "error");
      renderClipDetail(clip.id);
    }
  });
}

function markerItem(marker) {
  return `
    <li>
      <strong>${escapeHtml(marker.label || marker.kind)}</strong>
      <span class="muted">${formatDuration(marker.timestamp_ms)} ${escapeHtml(marker.kind)}</span>
    </li>
  `;
}

async function renderPublicShare(shareId) {
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
    const authorName = publicAuthorName(clip);
    app.innerHTML = `
      <main class="public-shell">
        <section class="public-panel" aria-labelledby="public-title">
          <div>
            <div class="brand-mark" aria-hidden="true">CL</div>
            <h1 id="public-title">${escapeHtml(clip.title)}</h1>
            <p>by ${escapeHtml(authorName)} - ${escapeHtml(clip.game_name || clip.game_id || "Shared clip")}</p>
          </div>
          ${clipPlayerView({
            playerId: `public-${clip.share_id}`,
            src: mediaUrl,
            poster: thumbnailUrl,
            durationMs: clip.duration_ms,
          })}
          <div class="panel">
            <dl class="data-list">
              ${dataRow("Author", authorName)}
              ${dataRow("Recorded", formatDate(clip.recorded_at))}
              ${dataRow("Uploaded", formatDate(clip.uploaded_at))}
              ${dataRow("Duration", formatDuration(clip.duration_ms))}
            </dl>
          </div>
          <div class="public-copy">${escapeHtml(clip.copy_notice)}</div>
        </section>
      </main>
    `;
    initClipPlayer(document.querySelector("[data-clip-player]"), {
      durationMs: clip.duration_ms,
      markers: [],
    });
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

async function renderAccount() {
  renderShell({
    active: "account",
    title: "Account",
    subtitle: "Sessions and device tokens.",
    body: `<div class="empty-state">Loading account data...</div>`,
  });

  try {
    const [sessions, deviceTokens] = await Promise.all([
      api("/api/v1/auth/sessions"),
      api("/api/v1/auth/device-tokens"),
    ]);
    renderShell({
      active: "account",
      title: "Account",
      subtitle: "Sessions and device tokens.",
      body: accountView(sessions, deviceTokens),
    });
    bindAccountEvents();
  } catch (error) {
    renderShell({
      active: "account",
      title: "Account",
      subtitle: "Sessions and device tokens.",
      body: `<div class="error-box">${escapeHtml(error.message)}</div>`,
    });
  }
}

function accountView(sessions, deviceTokens) {
  return `
    <section class="account-grid">
      <div class="panel section">
        <div class="section-header">
          <h2>Browser sessions</h2>
          <span class="muted">${sessions.length} active</span>
        </div>
        ${
          sessions.length
            ? `<div class="management-list">${sessions.map(sessionItem).join("")}</div>`
            : `<div class="empty-state">No active sessions.</div>`
        }
      </div>
      <div class="panel section">
        <div class="section-header">
          <h2>Device tokens</h2>
          <span class="muted">${deviceTokens.length} total</span>
        </div>
        ${
          deviceTokens.length
            ? `<div class="management-list">${deviceTokens.map(deviceTokenItem).join("")}</div>`
            : `<div class="empty-state">No device tokens.</div>`
        }
      </div>
    </section>
  `;
}

function sessionItem(session) {
  return `
    <div class="management-item">
      <div>
        <strong>${escapeHtml(session.user_agent || "Unknown browser")}</strong>
        <div class="meta-line">
          <span>${escapeHtml(session.ip_address || "Unknown IP")}</span>
          <span>Last used ${formatDate(session.last_used_at || session.created_at)}</span>
          <span>Expires ${formatDate(session.expires_at)}</span>
        </div>
      </div>
      <div class="actions">
        ${session.current ? `<span class="badge badge-public">Current</span>` : ""}
        <button class="btn-danger" data-session-revoke="${escapeAttr(session.id)}" data-current="${session.current ? "true" : "false"}">${icon("x")} Revoke</button>
      </div>
    </div>
  `;
}

function deviceTokenItem(token) {
  const revoked = Boolean(token.revoked_at);
  return `
    <div class="management-item">
      <div>
        <strong>${escapeHtml(token.name)}</strong>
        <div class="meta-line">
          <span>Created ${formatDate(token.created_at)}</span>
          <span>Last used ${formatDate(token.last_used_at)}</span>
          ${token.expires_at ? `<span>Expires ${formatDate(token.expires_at)}</span>` : ""}
          ${revoked ? `<span>Revoked ${formatDate(token.revoked_at)}</span>` : ""}
        </div>
      </div>
      <div class="actions">
        ${revoked ? `<span class="badge badge-private">Revoked</span>` : `<span class="badge badge-public">Active</span>`}
        <button class="btn-danger" data-device-token-revoke="${escapeAttr(token.id)}" ${revoked ? "disabled" : ""}>${icon("x")} Revoke</button>
      </div>
    </div>
  `;
}

function bindAccountEvents() {
  document.querySelectorAll("[data-session-revoke]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!window.confirm("Revoke this browser session?")) {
        return;
      }
      try {
        await api(`/api/v1/auth/sessions/${encodeURIComponent(button.dataset.sessionRevoke)}`, {
          method: "DELETE",
          body: {},
        });
        if (button.dataset.current === "true") {
          state.user = null;
          state.csrfToken = null;
          flash("Current session revoked.");
          navigate("/login");
          return;
        }
        flash("Session revoked.");
        renderAccount();
      } catch (error) {
        flash(error.message, "error");
        renderAccount();
      }
    });
  });

  document.querySelectorAll("[data-device-token-revoke]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!window.confirm("Revoke this device token?")) {
        return;
      }
      try {
        await api(`/api/v1/auth/device-tokens/${encodeURIComponent(button.dataset.deviceTokenRevoke)}`, {
          method: "DELETE",
          body: {},
        });
        flash("Device token revoked.");
        renderAccount();
      } catch (error) {
        flash(error.message, "error");
        renderAccount();
      }
    });
  });
}

async function renderAdmin(tab) {
  renderShell({
    active: "admin",
    title: "Admin",
    subtitle: "Accounts, instance summary, and processing diagnostics.",
    body: `<div class="empty-state">Loading admin data...</div>`,
  });

  try {
    const [overview, users, failedUploads, deadJobs, recentErrors] = await Promise.all([
      api("/api/v1/admin/overview"),
      api("/api/v1/users"),
      api("/api/v1/admin/uploads/failed?limit=50"),
      api("/api/v1/admin/jobs/dead?limit=50"),
      api("/api/v1/admin/jobs/recent-errors?limit=50"),
    ]);
    renderShell({
      active: "admin",
      title: "Admin",
      subtitle: "Accounts, instance summary, and processing diagnostics.",
      body: adminView(tab, { overview, users, failedUploads, deadJobs, recentErrors }),
    });
    bindAdminEvents();
  } catch (error) {
    renderShell({
      active: "admin",
      title: "Admin",
      subtitle: "Accounts, instance summary, and processing diagnostics.",
      body: `<div class="error-box">${escapeHtml(error.message)}</div>`,
    });
  }
}

function adminView(tab, data) {
  const active = ["overview", "users", "jobs"].includes(tab) ? tab : "overview";
  return `
    <section class="section">
      <div class="tabs" role="tablist" aria-label="Admin views">
        ${adminTab("/admin?tab=overview", "overview", active, icon("server"), "Overview")}
        ${adminTab("/admin?tab=users", "users", active, icon("users"), "Users")}
        ${adminTab("/admin?tab=jobs", "jobs", active, icon("alert"), "Jobs")}
      </div>
      ${active === "users" ? adminUsersView(data.users) : ""}
      ${active === "jobs" ? adminJobsView(data.failedUploads, data.deadJobs, data.recentErrors) : ""}
      ${active === "overview" ? adminOverviewView(data.overview) : ""}
    </section>
  `;
}

function adminTab(href, key, active, iconSvg, label) {
  return `<a class="tab ${key === active ? "active" : ""}" href="${escapeAttr(href)}" data-route>${iconSvg} ${escapeHtml(label)}</a>`;
}

function adminOverviewView(overview) {
  return `
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="data-list">
        ${dataRow("Server version", overview.server_version)}
        ${dataRow("API version", overview.api_version)}
        ${dataRow("Public URL", overview.public_url)}
        ${dataRow("Database", overview.database_backend)}
        ${dataRow("Storage", `${overview.storage_backend} - ${overview.storage_summary}`)}
        ${dataRow("Stored clips", `${overview.total_clips} clips - ${formatBytes(overview.total_storage_bytes)}`)}
        ${dataRow("Users", `${overview.total_users} total`)}
        ${dataRow("Max upload", formatBytes(overview.max_upload_size_bytes))}
        ${dataRow("Part size", formatBytes(overview.upload_part_size_bytes))}
        ${dataRow("Single PUT max", formatBytes(overview.single_put_max_bytes))}
        ${dataRow("Active uploads/user", overview.max_active_upload_sessions_per_user)}
        ${dataRow("User quota", overview.user_storage_quota_bytes ? formatBytes(overview.user_storage_quota_bytes) : "Disabled")}
        ${dataRow("Storage warning", storageWarningLabel(overview))}
        ${dataRow("Upload TTL", `${overview.upload_session_ttl_seconds}s`)}
        ${dataRow("Direct S3 uploads", overview.direct_s3_uploads ? "Enabled" : "Disabled")}
        ${dataRow("Public media", `${overview.public_media_mode}, ${overview.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  `;
}

function storageWarningLabel(overview) {
  if (!overview.global_storage_warning_threshold_bytes) {
    return "Disabled";
  }
  const threshold = formatBytes(overview.global_storage_warning_threshold_bytes);
  return overview.global_storage_warning ? `At or above ${threshold}` : `Below ${threshold}`;
}

function adminUsersView(users) {
  return `
    <div class="admin-grid">
      <form id="create-user-form" class="panel section">
        <h2>Create user</h2>
        ${field("Username", "username", "text", "", "Required")}
        ${field("Display name", "display_name", "text", "", "Optional")}
        ${field("Password", "password", "password", "", "At least 8 characters")}
        ${selectField("Role", "role", "user", [
          ["user", "User"],
          ["admin", "Admin"],
        ])}
        ${field("Your password", "reauth_password", "password", "", "Required")}
        <button class="btn-primary" type="submit">${icon("plus")} Create user</button>
      </form>
      <div class="panel">
        <div class="section-header">
          <h2>Users</h2>
          <span class="muted">${users.length} total</span>
        </div>
        ${state.adminResetToken ? `<div class="notice mono">${escapeHtml(state.adminResetToken)}</div>` : ""}
        <div class="table-wrap">
          <table>
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
            <tbody>${users.map(userRow).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function userRow(user) {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(user.username)}</strong>
        <div class="muted">${escapeHtml(user.display_name || user.id)}</div>
      </td>
      <td>${escapeHtml(user.role)}</td>
      <td>${user.is_disabled ? `<span class="badge badge-warn">Disabled</span>` : `<span class="badge badge-public">Active</span>`}</td>
      <td>${formatBytes(user.storage_bytes || 0)}</td>
      <td>${formatDate(user.last_login_at)}</td>
      <td>
        <div class="actions">
          <button class="btn-secondary" data-user-action="reset" data-user-id="${escapeAttr(user.id)}">${icon("clipboard")} Reset</button>
          <button class="btn-danger" data-user-action="disable" data-user-id="${escapeAttr(user.id)}" ${user.is_disabled ? "disabled" : ""}>${icon("x")} Disable</button>
        </div>
      </td>
    </tr>
  `;
}

function adminJobsView(failedUploads, deadJobs, recentErrors) {
  return `
    <div class="section">
      <div class="panel">
        <div class="section-header">
          <h2>Failed uploads</h2>
          <span class="muted">${failedUploads.length}</span>
        </div>
        ${failedUploads.length ? `<div class="job-list">${failedUploads.map(uploadItem).join("")}</div>` : `<p class="muted">No failed uploads.</p>`}
      </div>
      <div class="panel">
        <div class="section-header">
          <h2>Dead jobs</h2>
          <span class="muted">${deadJobs.length}</span>
        </div>
        ${deadJobs.length ? `<div class="job-list">${deadJobs.map(jobItem).join("")}</div>` : `<p class="muted">No dead jobs.</p>`}
      </div>
      <div class="panel">
        <div class="section-header">
          <h2>Recent job errors</h2>
          <span class="muted">${recentErrors.length}</span>
        </div>
        ${recentErrors.length ? `<div class="job-list">${recentErrors.map(jobItem).join("")}</div>` : `<p class="muted">No recent job errors.</p>`}
      </div>
    </div>
  `;
}

function uploadItem(upload) {
  const progress = Math.max(0, Math.min(10000, Number(upload.progress_basis_points || 0)));
  const action = recoveryActionLabel(upload.recovery_action);
  return `
    <div class="job-item">
      <div class="job-title-line">
        <strong class="mono">${escapeHtml(upload.id)}</strong>
        <span class="badge badge-warn">${formatProgress(progress)}</span>
      </div>
      <div class="progress-meter" aria-label="Upload progress">
        <span style="width:${progress / 100}%"></span>
      </div>
      <span class="muted">clip ${escapeHtml(upload.clip_id)} - ${formatBytes(upload.received_size_bytes)} of ${formatBytes(upload.expected_size_bytes)} - updated ${formatDate(upload.updated_at)}</span>
      ${upload.failure_reason ? `<span class="error-box">${escapeHtml(upload.failure_reason)}</span>` : ""}
      ${action ? `<span class="muted">Recovery: ${escapeHtml(action)}</span>` : ""}
    </div>
  `;
}

function recoveryActionLabel(action) {
  switch (action) {
    case "delete_and_retry":
      return "delete the failed upload and retry from a new session";
    case "retry":
      return "retry the current upload request";
    default:
      return "";
  }
}

function jobItem(job) {
  return `
    <div class="job-item">
      <strong>${escapeHtml(job.kind)} <span class="mono">${escapeHtml(job.id)}</span></strong>
      <span class="muted">${escapeHtml(job.status)} - attempts ${job.attempts}/${job.max_attempts} - target ${escapeHtml(job.target_type || "")}:${escapeHtml(job.target_id || "")}</span>
      ${job.last_error ? `<span class="error-box">${escapeHtml(job.last_error)}</span>` : ""}
    </div>
  `;
}

function bindAdminEvents() {
  const createForm = document.querySelector("#create-user-form");
  if (createForm) {
    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await api("/api/v1/users", {
          method: "POST",
          body: {
            username: String(form.get("username") || ""),
            display_name: nullableString(form.get("display_name")),
            password: String(form.get("password") || ""),
            role: String(form.get("role") || "user"),
            reauth_password: String(form.get("reauth_password") || ""),
          },
        });
        flash("User created.");
        navigate("/admin?tab=users");
      } catch (error) {
        flash(error.message, "error");
        renderAdmin("users");
      }
    });
  }

  document.querySelectorAll("[data-user-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.userId;
      const action = button.dataset.userAction;
      const reauth = window.prompt(`Confirm your password to ${action} this user.`);
      if (!reauth) {
        return;
      }
      try {
        if (action === "disable") {
          await api(`/api/v1/users/${encodeURIComponent(id)}`, {
            method: "DELETE",
            body: { reauth_password: reauth },
          });
          flash("User disabled.");
        } else if (action === "reset") {
          const data = await api(`/api/v1/users/${encodeURIComponent(id)}/reset-password`, {
            method: "POST",
            body: { reauth_password: reauth },
          });
          state.adminResetToken = `Reset token: ${data.reset_token} (expires ${formatDate(data.expires_at)})`;
          flash("Reset token created.");
        }
        renderAdmin("users");
      } catch (error) {
        flash(error.message, "error");
        renderAdmin("users");
      }
    });
  });
}

function field(label, name, type, value, placeholder) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input name="${escapeAttr(name)}" type="${escapeAttr(type)}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder || "")}">
    </label>
  `;
}

function numberField(label, name, value, placeholder, step = "1") {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input name="${escapeAttr(name)}" type="number" min="0" step="${escapeAttr(step)}" value="${escapeAttr(value)}" placeholder="${escapeAttr(placeholder || "")}">
    </label>
  `;
}

function selectField(label, name, value, options) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <select name="${escapeAttr(name)}">
        ${options
          .map(([optionValue, optionLabel]) => `<option value="${escapeAttr(optionValue)}" ${optionValue === value ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`)
          .join("")}
      </select>
    </label>
  `;
}

function dataRow(label, value, mono = false) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd class="${mono ? "mono" : ""}">${escapeHtml(value ?? "Unknown")}</dd>
    </div>
  `;
}

function visibilityBadge(visibility) {
  const key = visibility || "private";
  const className = key === "public" ? "badge-public" : key === "unlisted" ? "badge-unlisted" : "badge-private";
  const iconName = key === "private" ? "lock" : "globe";
  return `<span class="badge ${className}">${icon(iconName)} ${escapeHtml(key)}</span>`;
}

function renderFlash() {
  if (!state.flash) {
    return "";
  }
  const current = state.flash;
  state.flash = null;
  const className = current.type === "error" ? "error-box" : "notice";
  return `<div class="${className}">${escapeHtml(current.message)}</div>`;
}

function flash(message, type = "notice") {
  state.flash = { message, type };
}

async function copyText(value) {
  if (!value) {
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const input = document.createElement("textarea");
      input.value = value;
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    flash("Copied to clipboard.");
  } catch (_) {
    flash("Copy failed. Select and copy the URL manually.", "error");
  }
  route();
}

function nullableString(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function nullableNumber(value) {
  const text = String(value || "").trim();
  return text ? Number(text) : null;
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDuration(value) {
  if (value == null) {
    return "Unknown";
  }
  const totalSeconds = Math.max(0, Math.round(Number(value) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatBytes(value) {
  if (value == null) {
    return "Unknown";
  }
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) {
    return "Unknown";
  }
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let amount = bytes;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function setNumericParam(params, name, value) {
  if (value != null) {
    params.set(name, String(value));
  }
}

function secondsToMilliseconds(value) {
  const number = optionalNumber(value);
  return number == null ? null : Math.round(number * 1000);
}

function mebibytesToBytes(value) {
  const number = optionalNumber(value);
  return number == null ? null : Math.round(number * 1024 * 1024);
}

function optionalNumber(value) {
  if (value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatProgress(basisPoints) {
  return `${(basisPoints / 100).toFixed(basisPoints % 100 === 0 ? 0 : 1)}%`;
}

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.alert}</svg>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
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
