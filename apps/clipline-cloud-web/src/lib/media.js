// The public API's thumbnail_url is an ABSOLUTE URL built from the server's
// configured CLIPLINE_PUBLIC_URL (e.g. http://localhost:18080/...). When the
// site is browsed via any other host alias (127.0.0.1, LAN IP, Tailscale IP),
// img-src 'self' in the CSP blocks it. The legacy app therefore constructs
// RELATIVE paths (src/app.js:1180 public, :912 authenticated) — do the same
// everywhere we render a public thumbnail. Reused by the watch/user pages.
export function publicThumbPath(clip) {
  return `/api/v1/public/clips/${encodeURIComponent(clip.share_id)}/thumbnail`;
}
