import { state } from "/js/state.js";
import { logout } from "/js/api.js";
import { escapeHtml, escapeAttr, icon, renderFlash } from "/js/util.js";

const app = document.querySelector("#app");

// Module-scope guard: register document-level listeners only once.
let _docListenersRegistered = false;

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
        <div class="app-header__center" id="header-center">
          <button class="icon-btn search-toggle" id="search-toggle-btn" aria-label="Open search">${icon("search")}</button>
          <form id="header-search" class="search-pill" role="search">
            <input name="q" type="search" placeholder="Search clips…" value="${escapeAttr(currentQ)}" aria-label="Search clips">
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
      <div class="app-body${state.ui.railOpen ? "" : " rail-mini"}" id="app-body">
        <div class="drawer-scrim" id="drawer-scrim" aria-hidden="true"></div>
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

  const appBody = document.querySelector("#app-body");
  const railToggleBtn = document.querySelector("#rail-toggle");
  const drawerScrim = document.querySelector("#drawer-scrim");
  const accountBtn = document.querySelector("#account-btn");
  const accountMenu = document.querySelector("#account-menu");
  const headerCenter = document.querySelector("#header-center");
  const searchToggleBtn = document.querySelector("#search-toggle-btn");

  // Helper: is the page in mobile-drawer mode?
  function isMobileBreakpoint() {
    return window.matchMedia("(max-width: 1000px)").matches;
  }

  // Open / close drawer (mobile only)
  function openDrawer() {
    appBody.classList.add("drawer-open");
    railToggleBtn.setAttribute("aria-label", "Close navigation");
    drawerScrim.removeAttribute("aria-hidden");
  }

  function closeDrawer() {
    appBody.classList.remove("drawer-open");
    railToggleBtn.setAttribute("aria-label", "Toggle navigation");
    drawerScrim.setAttribute("aria-hidden", "true");
  }

  // Rail toggle
  railToggleBtn.addEventListener("click", () => {
    if (isMobileBreakpoint()) {
      if (appBody.classList.contains("drawer-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    } else {
      state.ui.railOpen = !state.ui.railOpen;
      appBody.classList.toggle("rail-mini", !state.ui.railOpen);
    }
  });

  // Scrim click closes drawer
  drawerScrim.addEventListener("click", () => {
    closeDrawer();
  });

  // Header search submit
  document.querySelector("#header-search").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector("input[name='q']");
    state.libraryQuery.q = input.value;
    // Close search on mobile after submit
    if (isMobileBreakpoint()) {
      headerCenter.classList.remove("search-open");
      searchToggleBtn.setAttribute("aria-label", "Open search");
    }
    const { navigate } = await import("/js/router.js");
    navigate("/");
  });

  // Search toggle (mobile: expand/collapse pill)
  searchToggleBtn.addEventListener("click", () => {
    const isOpen = headerCenter.classList.toggle("search-open");
    searchToggleBtn.setAttribute("aria-label", isOpen ? "Close search" : "Open search");
    if (isOpen) {
      headerCenter.querySelector("input[name='q']")?.focus();
    }
  });

  // Account menu: open/close + keyboard
  function openAccountMenu() {
    accountMenu.hidden = false;
    accountBtn.setAttribute("aria-expanded", "true");
  }

  function closeAccountMenu() {
    accountMenu.hidden = true;
    accountBtn.setAttribute("aria-expanded", "false");
  }

  accountBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (accountMenu.hidden) {
      openAccountMenu();
    } else {
      closeAccountMenu();
    }
  });

  accountBtn.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (accountMenu.hidden) {
        openAccountMenu();
      } else {
        closeAccountMenu();
      }
    }
  });

  // Sign out
  document.querySelector("#sign-out-btn").addEventListener("click", logout);

  // Register document-level listeners only once per module lifetime
  if (!_docListenersRegistered) {
    _docListenersRegistered = true;

    // Close account menu on outside click
    document.addEventListener("click", (event) => {
      const btn = document.querySelector("#account-btn");
      const menu = document.querySelector("#account-menu");
      if (btn && menu && !menu.hidden && !menu.contains(event.target) && event.target !== btn) {
        menu.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      }
    });

    // Escape key: close account menu, close drawer, close search
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      const btn = document.querySelector("#account-btn");
      const menu = document.querySelector("#account-menu");
      if (btn && menu && !menu.hidden) {
        menu.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
        return;
      }

      const body = document.querySelector("#app-body");
      if (body && body.classList.contains("drawer-open")) {
        body.classList.remove("drawer-open");
        const toggle = document.querySelector("#rail-toggle");
        if (toggle) {
          toggle.setAttribute("aria-label", "Toggle navigation");
          toggle.focus();
        }
        const scrim = document.querySelector("#drawer-scrim");
        if (scrim) scrim.setAttribute("aria-hidden", "true");
        return;
      }

      const center = document.querySelector("#header-center");
      if (center && center.classList.contains("search-open")) {
        center.classList.remove("search-open");
        const stBtn = document.querySelector("#search-toggle-btn");
        if (stBtn) {
          stBtn.setAttribute("aria-label", "Open search");
          stBtn.focus();
        }
      }
    });
  }

  // Rail links
  document.querySelectorAll(".rail-link").forEach((el) => {
    el.addEventListener("click", async (event) => {
      event.preventDefault();
      // Close mobile drawer when a link is activated
      if (isMobileBreakpoint()) {
        closeDrawer();
      }
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
