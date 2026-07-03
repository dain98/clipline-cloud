import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";
import { session, useStore } from "../lib/store.js";
import { navigate } from "../lib/router.js";
import { useEffect, useRef, useState } from "preact/hooks";

export function TopBar({ active }) {
  const { user } = useStore(session);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);
  const isAdmin = user?.role === "admin";

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
    const q = new FormData(event.target).get("q")?.toString().trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return html`<header class="topbar">
    <a class="wordmark" href="/" aria-label="Clipline home">
      <img src="/clipline-icon.svg" alt="" width="24" height="24" />
      CLIP<b>LINE</b>
    </a>
    <nav class="topnav" aria-label="Primary">
      ${nav.map(([key, href, label]) => html`
        <a class=${key === active ? "topnav-on" : ""} href=${href}>${label}</a>`)}
    </nav>
    <form class="topsearch" role="search" onSubmit=${onSearch}>
      <input class="input" name="q" placeholder="Search clips, games, players…" aria-label="Search" />
    </form>
    ${user
      ? html`<div class="avatar-wrap" ref=${menuWrapRef}>
          <button class="avatar-btn" aria-haspopup="menu" aria-expanded=${menuOpen}
            onClick=${() => setMenuOpen(!menuOpen)}>
            <span class="avatar">${(user.display_name || user.username)[0].toUpperCase()}</span>
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
  const { api } = await import("../lib/api.js");
  try { await api("/api/v1/auth/logout", { method: "POST" }); } catch {}
  session.set({ user: null, csrfToken: null, ready: true });
  navigate("/login");
}
