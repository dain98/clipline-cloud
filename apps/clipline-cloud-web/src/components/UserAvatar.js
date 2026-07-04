import { html } from "../lib/html.js";

// Pure port of legacy avatarUrl (src/app.js:2665-2670): appends a
// cache-busting `v=` param derived from updated_at so the browser refetches
// the image right after a re-upload even though the URL path never changes.
export function avatarUrl(user) {
  if (!user?.avatar_url) return "";
  const cacheKey = user.updated_at || "";
  if (!cacheKey) return user.avatar_url;
  const separator = String(user.avatar_url).includes("?") ? "&" : "?";
  return `${user.avatar_url}${separator}v=${encodeURIComponent(cacheKey)}`;
}

// Pure port of legacy authorInitial (src/app.js:2671-2673).
export function initialFor(name) {
  return (name || "C").trim().slice(0, 1).toUpperCase() || "C";
}

export function UserAvatar({ user, size = 40, className = "" }) {
  const src = avatarUrl(user);
  const style = `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px`;
  if (src) {
    return html`<img class=${`user-avatar ${className}`} style=${style} src=${src} alt="" />`;
  }
  const name = user?.display_name || user?.username;
  return html`<div class=${`user-avatar user-avatar-fallback ${className}`} style=${style} aria-hidden="true">
    ${initialFor(name)}
  </div>`;
}
