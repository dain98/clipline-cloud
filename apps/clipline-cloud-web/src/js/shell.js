import { state } from "/js/state.js";
import { logout } from "/js/api.js";
import { escapeHtml, escapeAttr, icon, renderFlash } from "/js/util.js";

const app = document.querySelector("#app");

export function renderShell({ active, body, onMount }) {
  const username = state.user?.username || "";
  const initial = username ? username[0].toUpperCase() : "?";
  const currentQ = state.libraryQuery?.q || "";

  const isAdmin = state.user?.role === "admin";

  function railLink(href, visibility, key, iconName, label) {
    const isActive =
      (key === "library" && active === "library" && state.libraryQuery.visibility === visibility) ||
      (key === "admin" && active === "admin");
    return `<li><a href="${escapeAttr(href)}" class="rail-link${isActive ? " active" : ""}" data-visibility="${escapeAttr(visibility)}">${icon(iconName)}<span>${escapeHtml(label)}</span></a></li>`;
  }

  app.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-header__start">
          <button id="rail-toggle" class="icon-btn" aria-label="Toggle navigation">${icon("menu")}</button>
          <a href="/" class="wordmark" data-route>Clipline</a>
        </div>
        <div class="app-header__center">
          <form id="header-search" class="search-pill" role="search">
            <input name="q" type="search" placeholder="Search clips…" value="${escapeAttr(currentQ)}" aria-label="Search">
            <button type="submit" class="icon-btn" aria-label="Search">${icon("search")}</button>
          </form>
        </div>
        <div class="app-header__end">
          <div class="account-menu-wrap">
            <button id="account-btn" class="icon-btn account-btn" aria-label="Account menu" aria-haspopup="true" aria-expanded="false">
              <span class="account-avatar">${escapeHtml(initial)}</span>
              ${icon("chevronDown")}
            </button>
            <menu id="account-menu" class="account-menu" hidden>
              <li><span class="account-menu__user">${escapeHtml(username)}</span></li>
              <li><button id="sign-out-btn" class="menu-item">Sign out</button></li>
            </menu>
          </div>
        </div>
      </header>
      <div class="app-body${state.ui.railOpen ? "" : " rail-mini"}">
        <nav class="guide-rail" aria-label="Main navigation">
          <ul class="rail-list">
            ${railLink("/", "", "library", "home", "Home")}
            ${railLink("/", "public", "library", "globe", "Public")}
            ${railLink("/", "unlisted", "library", "eye", "Unlisted")}
            ${railLink("/", "private", "library", "lock", "Private")}
            ${isAdmin ? railLink("/admin", "", "admin", "shield", "Admin") : ""}
          </ul>
        </nav>
        <main class="app-content" id="app-content">
          ${renderFlash()}
          ${body}
        </main>
      </div>
    </div>
  `;

  onMount?.();

  // Rail toggle
  document.querySelector("#rail-toggle").addEventListener("click", () => {
    state.ui.railOpen = !state.ui.railOpen;
    document.querySelector(".app-body").classList.toggle("rail-mini", !state.ui.railOpen);
  });

  // Header search submit
  document.querySelector("#header-search").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input[name='q']");
    state.libraryQuery.q = input.value;
    const { navigate } = await import("/js/router.js");
    navigate("/");
  });

  // Account menu toggle
  const accountBtn = document.querySelector("#account-btn");
  const accountMenu = document.querySelector("#account-menu");

  accountBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isHidden = accountMenu.hidden;
    accountMenu.hidden = !isHidden;
    accountBtn.setAttribute("aria-expanded", String(isHidden));
  });

  // Close account menu on outside click
  document.addEventListener("click", function closeAccountMenu(event) {
    if (!accountMenu.hidden && !accountMenu.contains(event.target) && event.target !== accountBtn) {
      accountMenu.hidden = true;
      accountBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Sign out
  document.querySelector("#sign-out-btn").addEventListener("click", logout);

  // Rail links
  document.querySelectorAll(".rail-link").forEach((el) => {
    el.addEventListener("click", async (event) => {
      event.preventDefault();
      const href = el.getAttribute("href");
      if (href === "/admin") {
        const { navigate } = await import("/js/router.js");
        navigate("/admin");
      } else {
        state.libraryQuery.visibility = el.dataset.visibility ?? "";
        const { navigate } = await import("/js/router.js");
        navigate("/");
      }
    });
  });
}

export function navLink(href, key, active, iconSvg, label) {
  return `
    <a class="nav-link ${active === key ? "active" : ""}" href="${escapeAttr(href)}" data-route>
      ${iconSvg}<span>${escapeHtml(label)}</span>
    </a>
  `;
}
