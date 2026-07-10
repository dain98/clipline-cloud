// The public API's thumbnail_url is an ABSOLUTE URL built from the server's
// configured CLIPLINE_PUBLIC_URL (e.g. http://localhost:18080/...). When the
// site is browsed via any other host alias (127.0.0.1, LAN IP, Tailscale IP),
// img-src 'self' in the CSP blocks it, so browser views use relative paths.
export function publicThumbPath(clip) {
  return `/api/v1/public/clips/${encodeURIComponent(clip.share_id)}/thumbnail`;
}

// GET /api/v1/clips returns no thumbnail_url/media_url at all (unlike the
// public listing), so owned/library views build these relative paths from
// the clip id — matching the owned media routes registered in
// apps/clipline-cloud-server/src/media.rs (:53-54).
export function ownedThumbPath(clip) {
  return `/api/v1/clips/${encodeURIComponent(clip.id)}/thumbnail`;
}

export function ownedMediaPath(clip) {
  return `/api/v1/clips/${encodeURIComponent(clip.id)}/media`;
}

// The poster is the full-size first frame (max 1280px) vs the small thumbnail;
// use it where the image renders large (watch player). The server falls back
// to the thumbnail for clips that predate poster generation.
export function ownedPosterPath(clip) {
  return `/api/v1/clips/${encodeURIComponent(clip.id)}/poster`;
}

export function publicPosterPath(clip) {
  return `/api/v1/public/clips/${encodeURIComponent(clip.share_id)}/poster`;
}

// The public clip detail response's media_url is likewise an ABSOLUTE URL
// (apps/clipline-cloud-server/src/media.rs :489, `absolute_url(&state, …)`).
// Build the relative route directly (same route registered at :81-83) so the
// watch page's <video src> survives host-alias CSP the same way thumbnails do.
export function publicMediaPath(clip) {
  return `/api/v1/public/clips/${encodeURIComponent(clip.share_id)}/media`;
}

// Visibility/detail responses ship absolute share URLs built from the server's
// configured public URL. Resolve the path against the browser's actual origin
// so copied/opened links match the host alias the user is browsing through.
export function deriveShareLink(rawUrl, origin, shareId) {
  if (rawUrl) {
    try {
      return `${origin}${new URL(rawUrl).pathname}`;
    } catch {
      // fall through to the share-id fallback below
    }
  }
  return shareId ? `${origin}/c/${encodeURIComponent(shareId)}` : null;
}
