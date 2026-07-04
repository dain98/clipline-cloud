import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { navigate } from "../lib/router.js";
import { session, toast, useStore } from "../lib/store.js";
import { formatBytes, formatDate, formatDuration, formatViews } from "../lib/format.js";
import {
  deriveShareLink,
  ownedMediaPath,
  ownedPosterPath,
  publicMediaPath,
  publicPosterPath,
  publicThumbPath,
} from "../lib/media.js";
import { icon } from "../lib/icons.js";
import { Player } from "../components/Player.js";
import { Comments } from "../components/Comments.js";
import { ConfirmDialog } from "../components/ConfirmDialog.js";
import { EmptyState } from "../components/EmptyState.js";

export { deriveShareLink } from "../lib/media.js";

const VISIBILITIES = ["private", "public", "unlisted"];

// GET /api/v1/clips/{id} (route "clip") only ever returns a clip the caller
// owns — it 404s otherwise (apps/clipline-cloud-server/src/clips.rs:173-188,
// get_owned_ready filters on owner_user_id) — so a successful fetch already
// proves ownership. The public route instead carries the server-computed
// viewer_can_edit flag (media.rs:469-471, auth.user.id == clip.owner_user_id).
export function isOwnerForRoute(routeName, clip) {
  if (routeName === "clip") return true;
  return Boolean(clip?.viewer_can_edit);
}

// ClipDetailResponse (owned) exposes public_share_id; PublicClipResponse
// (public) exposes share_id directly (it *is* the share).
export function resolveShareId(routeName, route, clip) {
  if (routeName === "public") return route.shareId;
  return clip?.public_share_id || null;
}

// PublicClipResponse only carries viewer_clip_id when viewer_can_edit is
// true (media.rs:472) — that's the owned clip id mutation endpoints need.
export function resolveOwnedClipId(routeName, route, clip) {
  if (routeName === "clip") return route.clipId;
  return clip?.viewer_clip_id || null;
}

// Details-strip resolution label, ported from the brief's summary line
// (`${clip.height}p${Math.round(clip.fps || 0) || ""}`): "1080p60", or just
// "1080p" when fps is missing/zero.
export function resolutionLabel(clip) {
  const height = clip?.height != null ? clip.height : "";
  const fps = Math.round(clip?.fps || 0) || "";
  return `${height}p${fps}`;
}

export function recommendationsPath(shareId, limit = 8) {
  const params = new URLSearchParams();
  if (shareId) params.set("share_id", shareId);
  params.set("limit", String(limit));
  return `/api/v1/public/recommendations?${params}`;
}

// GET /api/v1/public/recommendations returns related clips; keep the exclusion
// as a defensive guard when the source share id is known.
export function upNextList(clips, currentShareId, limit = 8) {
  return (clips || []).filter((c) => c.share_id !== currentShareId).slice(0, limit);
}

export function WatchPage({ route }) {
  const { user } = useStore(session);
  const [clip, setClip] = useState(null);
  const [error, setError] = useState(null);
  const [upNext, setUpNext] = useState([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const routeKey = route.name === "clip" ? `clip:${route.clipId}` : `public:${route.shareId}`;
  const currentShareId = resolveShareId(route.name, route, clip);
  const recommendationsReady = route.name === "public" || Boolean(clip);

  useEffect(() => {
    let live = true;
    setClip(null);
    setError(null);
    setEditingTitle(false);
    setEditingDesc(false);
    setDetailsOpen(false);
    setMoreOpen(false);
    const path =
      route.name === "clip"
        ? `/api/v1/clips/${encodeURIComponent(route.clipId)}`
        : `/api/v1/public/clips/${encodeURIComponent(route.shareId)}`;
    api(path)
      .then((data) => {
        if (!live) return;
        setClip(data);
        // View-count beacon, ported from legacy recordPublicView (src/app.js:2618-2632) — public route only.
        if (route.name === "public") {
          api(`/api/v1/public/clips/${encodeURIComponent(route.shareId)}/view`, { method: "POST", body: {} })
            .then((result) => live && setClip((c) => c && { ...c, view_count: result.view_count }))
            .catch(() => {});
        }
      })
      .catch((e) => live && setError(e));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  useEffect(() => {
    let live = true;
    if (!recommendationsReady) {
      setUpNext([]);
      return () => {
        live = false;
      };
    }
    setUpNext([]);
    api(recommendationsPath(currentShareId, 8))
      .then((data) => live && setUpNext(data.clips || []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [routeKey, currentShareId, recommendationsReady]);

  if (error) {
    return html`<main class="page"><${EmptyState} name="alert" title="Couldn't load this clip" body=${error.message} /></main>`;
  }
  if (!clip) {
    return html`<main class="page watch"><div><div class="skeleton-thumb"></div></div><aside class="upnext"></aside></main>`;
  }

  const isOwner = isOwnerForRoute(route.name, clip);
  const shareId = currentShareId;
  const ownedClipId = resolveOwnedClipId(route.name, route, clip);
  const mediaSrc =
    route.name === "clip" ? ownedMediaPath({ id: clip.id }) : publicMediaPath({ share_id: route.shareId });
  const posterSrc =
    route.name === "clip" ? ownedPosterPath({ id: clip.id }) : publicPosterPath({ share_id: route.shareId });
  const authorName =
    route.name === "clip" ? user?.display_name || user?.username || "You" : clip.author_name || "Unknown creator";
  const rawShareUrl = clip.public_url ?? clip.share_url ?? null;
  const shareLink = deriveShareLink(rawShareUrl, window.location.origin, shareId);
  // Only the owned detail response carries file size/dimensions/codecs/checksum;
  // the public response omits them entirely, so visitors never see the strip.
  const hasTechnicalDetails = route.name === "clip";

  function startEditTitle() {
    setTitleDraft(clip.title);
    setEditingTitle(true);
  }
  async function saveTitle(event) {
    event?.preventDefault?.();
    const value = titleDraft.trim();
    if (!value || value === clip.title) {
      setEditingTitle(false);
      return;
    }
    try {
      await api(`/api/v1/clips/${encodeURIComponent(ownedClipId)}`, { method: "PATCH", body: { title: value } });
      setClip((c) => ({ ...c, title: value }));
      setEditingTitle(false);
      toast("Title saved.");
    } catch (e) {
      toast(e.message);
    }
  }

  function startEditDesc() {
    setDescDraft(clip.description || "");
    setEditingDesc(true);
  }
  async function saveDesc() {
    const value = descDraft.trim();
    try {
      await api(`/api/v1/clips/${encodeURIComponent(ownedClipId)}`, {
        method: "PATCH",
        body: { description: value || null },
      });
      setClip((c) => ({ ...c, description: value || null }));
      setEditingDesc(false);
      toast("Description saved.");
    } catch (e) {
      toast(e.message);
    }
  }

  async function setVisibility(next, { force = false } = {}) {
    const previous = clip.visibility;
    if (previous === next && !force) return;
    setClip((c) => ({ ...c, visibility: next }));
    try {
      const updated = await api(`/api/v1/clips/${encodeURIComponent(ownedClipId)}/visibility`, {
        method: "POST",
        body: { visibility: next },
      });
      setClip((c) => ({
        ...c,
        visibility: updated.visibility,
        public_url: updated.public_url,
        public_share_id: updated.public_share_id,
      }));
      toast(`Visibility set to ${next}.`, {
        actionLabel: "Undo",
        onAction: () => setVisibility(previous, { force: true }),
      });
    } catch (e) {
      setClip((c) => ({ ...c, visibility: previous }));
      toast(e.message);
    }
  }

  async function copyShareLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      toast("Link copied.");
    } catch {
      toast("Couldn't copy the link.");
    }
  }

  async function onDeleteConfirmed() {
    setConfirmDelete(false);
    try {
      await api(`/api/v1/clips/${encodeURIComponent(ownedClipId)}`, { method: "DELETE" });
      toast("Clip deleted.");
      navigate("/library");
    } catch (e) {
      toast(e.message);
    }
  }

  const metaParts = [
    clip.game_name &&
      html`<a class="chip chip-on" href=${`/game/${encodeURIComponent(clip.game_name)}`}>${clip.game_name}</a>`,
    formatViews(clip.view_count),
    `Recorded ${formatDate(clip.recorded_at)}`,
    `by ${authorName}`,
  ].filter(Boolean);

  const upNextItems = upNextList(upNext, shareId, 8);

  return html`<main class="page watch">
    <div>
      <${Player} src=${mediaSrc} poster=${posterSrc} durationMs=${clip.duration_ms} markers=${clip.markers} />
      <div class="watch-titlerow">
        ${editingTitle
          ? html`<input class="input watch-title-input" value=${titleDraft} autofocus
              onInput=${(e) => setTitleDraft(e.target.value)} onBlur=${saveTitle}
              onKeyDown=${(e) => {
                if (e.key === "Enter") saveTitle(e);
                if (e.key === "Escape") setEditingTitle(false);
              }} />`
          : html`<h1>${clip.title}
              ${isOwner &&
              html`<button type="button" class="edit-pencil" aria-label="Edit title" onClick=${startEditTitle}
                >${icon("edit", { size: 14 })}</button>`}</h1>`}
      </div>
      <p class="watch-meta">${metaParts.map((part, i) => html`${i > 0 ? " · " : ""}${part}`)}</p>

      ${isOwner &&
      html`<div class="watch-actions">
        <div class="seg" role="radiogroup" aria-label="Visibility">
          ${VISIBILITIES.map(
            (v) => html`<button type="button" role="radio" key=${v} aria-checked=${clip.visibility === v}
              class=${`seg-item ${clip.visibility === v ? "seg-on" : ""}`} onClick=${() => setVisibility(v)}
              >${v[0].toUpperCase() + v.slice(1)}</button>`
          )}
        </div>
        <button type="button" class="btn btn-primary" disabled=${!shareLink} onClick=${copyShareLink}>
          ${icon("copy", { size: 14 })} Copy share link</button>
        <div class="watch-more">
          <button type="button" class="btn" aria-haspopup="menu" aria-expanded=${moreOpen}
            onClick=${() => setMoreOpen((open) => !open)}>⋯</button>
          ${moreOpen &&
          html`<div class="menu" role="menu">
            <button type="button" class="menu-danger" role="menuitem"
              onClick=${() => {
                setMoreOpen(false);
                setConfirmDelete(true);
              }}>${icon("trash", { size: 14 })} Delete clip</button>
          </div>`}
        </div>
      </div>`}

      <div class="watch-desc">
        ${editingDesc
          ? html`<textarea class="input" rows="5" value=${descDraft} autofocus
              onInput=${(e) => setDescDraft(e.target.value)} onBlur=${saveDesc}
              onKeyDown=${(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveDesc();
                if (e.key === "Escape") setEditingDesc(false);
              }}></textarea>`
          : clip.description
          ? html`<p>${clip.description}
              ${isOwner &&
              html`<button type="button" class="edit-pencil" aria-label="Edit description" onClick=${startEditDesc}
                >${icon("edit", { size: 12 })}</button>`}</p>`
          : isOwner
          ? html`<button type="button" class="watch-desc-add" onClick=${startEditDesc}>+ Add a description</button>`
          : ""}
      </div>

      ${hasTechnicalDetails &&
      html`<button type="button" class="details-strip" aria-expanded=${detailsOpen}
        onClick=${() => setDetailsOpen((open) => !open)}>
        <span><b>${formatDuration(clip.duration_ms)}</b> length</span>
        <span><b>${formatBytes(clip.file_size_bytes)}</b></span>
        <span><b>${resolutionLabel(clip)}</b></span>
        <span><b>${clip.video_codec}/${clip.audio_codec}</b> ${clip.container}</span>
        <span class="details-chev">${detailsOpen ? "▴ less" : "▾ more"}</span>
      </button>`}
      ${hasTechnicalDetails && detailsOpen &&
      html`<dl class="details-full">
        <div><dt>Recorded</dt><dd>${formatDate(clip.recorded_at)}</dd></div>
        <div><dt>Uploaded</dt><dd>${formatDate(clip.uploaded_at)}</dd></div>
        <div><dt>Dimensions</dt><dd>${clip.width && clip.height ? `${clip.width} x ${clip.height}` : "Unknown"}</dd></div>
        <div><dt>FPS</dt><dd>${clip.fps ?? "Unknown"}</dd></div>
        <div><dt>Container</dt><dd>${clip.container || "Unknown"}</dd></div>
        <div><dt>Video codec</dt><dd>${clip.video_codec || "Unknown"}</dd></div>
        <div><dt>Audio codec</dt><dd>${clip.audio_codec || "Unknown"}</dd></div>
        <div><dt>Source</dt><dd>${clip.source_type || "Unknown"}</dd></div>
        <div><dt>Checksum</dt><dd>${clip.checksum_sha256 || "Unknown"}</dd></div>
      </dl>`}

      ${shareId && html`<${Comments} shareId=${shareId} />`}
    </div>
    <aside class="upnext">
      <h4 class="kicker">Up next</h4>
      ${upNextItems.map(
        (c) => html`<a class="upnext-row" key=${c.share_id} href=${`/c/${encodeURIComponent(c.share_id)}`}>
          <img src=${publicThumbPath(c)} alt="" loading="lazy" />
          <span><b>${c.title}</b><small>${c.author_name} · ${c.game_name || "No game"} · ${formatViews(c.view_count)}</small></span>
        </a>`
      )}
    </aside>

    <${ConfirmDialog} open=${confirmDelete} title="Delete this clip?" body="Public links stop working immediately."
      confirmLabel="Delete" danger onConfirm=${onDeleteConfirmed} onCancel=${() => setConfirmDelete(false)} />
  </main>`;
}
