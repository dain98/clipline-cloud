import { html } from "../lib/html.js";

// Normalize avatar paths for <img src>. Session user responses use relative
// paths; public author/comment payloads may use same-origin absolute URLs.
export function resolveAvatarSrc(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return "";
  }
  return "";
}

// The avatar path is stable, so use updated_at as a cache key after re-upload.
export function avatarUrl(user) {
  const base = resolveAvatarSrc(user?.avatar_url);
  if (!base) return "";
  const cacheKey = user.updated_at || "";
  if (!cacheKey) return base;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${encodeURIComponent(cacheKey)}`;
}

// Stable fallback for users without an avatar.
function initialFor(name) {
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
