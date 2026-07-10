import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";
import { session, useStore } from "../lib/store.js";
import { navigate } from "../lib/router.js";
import { useEffect, useRef, useState } from "preact/hooks";
import { UserAvatar } from "./UserAvatar.js";

// The only routes that carry a `q` (publicLibrary covers both "/" and
// "/search", publicGame carries one too via routes.js publicRouteQuery) —
// every other route (library, watch, admin, …) has no query.q, so the box
// should read empty rather than echoing a stale search.
export function topBarSearchValue(route) {
  return route?.query?.q || "";
}

export function topBarSearchPath(route, queryText) {
  const params = new URLSearchParams();
  const q = String(queryText || "").trim();
  const game = route?.name === "publicGame" ? route.game : route?.query?.game || "";
  if (q) params.set("q", q);
  if (game) params.set("game", game);
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export function TopBar({ active, route }) {
  const { user } = useStore(session);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);
  const routeSearchValue = topBarSearchValue(route);
  const [searchValue, setSearchValue] = useState(routeSearchValue);
  // Re-sync the box whenever the route's own q changes (new search, cleared
  // filters, navigating away and back) without fighting the user's typing —
  // typing only touches local state, never route.query, until submit.
  useEffect(() => {
    setSearchValue(routeSearchValue);
  }, [routeSearchValue]);
  // The bootstrap owner has the same navigation access as an admin.
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event) => {
      if (!menuWrapRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);
  const nav = [
    ["feed", "/", "Feed"],
    ["library", "/library", "Library", !!user],
    ["games", "/games", "Games"],
    ["admin", "/admin", "Admin", isAdmin],
  ].filter(([, , , show]) => show !== false);

  const onSearch = (event) => {
    event.preventDefault();
    const q = new FormData(event.target).get("q")?.toString() || "";
    navigate(topBarSearchPath(route, q));
  };

  return html`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      <span class="wordmark-text">CLIP<span class="wordmark-accent">LINE</span></span>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${nav.map(([key, href, label]) => html`
        <a class=${key === active ? "topnav-on" : ""} href=${href}>${label}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${onSearch}>
      <input class="input" name="q" value=${searchValue} onInput=${(e) => setSearchValue(e.target.value)}
        placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${user
      ? html`<div class="avatar-wrap" ref=${menuWrapRef}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${menuOpen}
            onClick=${() => setMenuOpen(!menuOpen)}>
            <${UserAvatar} user=${user} size=${28} />
          </button>
          ${menuOpen && html`<div class="menu" role="menu" onClick=${() => setMenuOpen(false)}>
            <a role="menuitem" href="/profile">Profile</a>
            <a role="menuitem" href="/account">Account</a>
            ${isAdmin && html`<a role="menuitem" href="/admin">Admin</a>`}
            <button role="menuitem" class="menu-danger" onClick=${signOut}>Sign out</button>
          </div>`}
        </div>`
      : html`<a class="btn" href="/login">${icon("lock", { size: 14 })} Sign in</a>`}
  </header>`;
}

async function signOut() {
  const { api, setCsrfToken } = await import("../lib/api.js");
  try { await api("/api/v1/auth/logout", { method: "POST" }); } catch {}
  setCsrfToken(null);
  session.set({ user: null, csrfToken: null, ready: true });
  navigate("/login");
}
