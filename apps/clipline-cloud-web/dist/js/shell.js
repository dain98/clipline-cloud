import { state } from "/js/state.js";
import { logout } from "/js/api.js";
import { escapeHtml, escapeAttr, icon, renderFlash } from "/js/util.js";

const app = document.querySelector("#app");

export function renderShell({ active, title, subtitle, body }) {
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
            <strong>Clipline Cloud</strong>
            <span>Self-hosted clips</span>
          </div>
        </div>
        <nav class="nav-stack" aria-label="Primary">
          ${navLink("/", "library", active, icon("library"), "Library")}
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
            <p>${escapeHtml(subtitle || "")}</p>
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

export function navLink(href, key, active, iconSvg, label) {
  return `
    <a class="nav-link ${active === key ? "active" : ""}" href="${escapeAttr(href)}" data-route>
      ${iconSvg}<span>${escapeHtml(label)}</span>
    </a>
  `;
}
