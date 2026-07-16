import { html } from "../lib/html.js";
import { formatDuration, formatRelativeTime, formatViews } from "../lib/format.js";
import { HoverPreview } from "./HoverPreview.js";

// Author extraction handles both shapes seen in the wild:
//  - authenticated/library-style responses that nest an `owner` object
//    ({ username, display_name }) or a flat `owner_username`,
//  - the *actual* /api/v1/public/clips response, which has neither and
//    instead ships flat `author_name` / `author_username` fields.
export function clipAuthor(clip) {
  return (
    clip.owner?.display_name ||
    clip.owner?.username ||
    clip.owner_username ||
    clip.author_name ||
    clip.author_username ||
    null
  );
}

export function ClipCard({ clip, href, selectable = false, selected = false,
  onToggleSelect, showVisibility = false, showAuthor = false }) {
  const author = clipAuthor(clip);
  const meta = [
    clip.game_name && html`<em>${clip.game_display_name || clip.game_name}</em>`,
    showAuthor && author,
    clip.view_count != null && formatViews(clip.view_count),
    clip.uploaded_at && formatRelativeTime(clip.uploaded_at),
  ].filter(Boolean);

  return html`<article class=${`clip-card ${selected ? "is-selected" : ""} ${selectable ? "is-selectable" : ""}`}>
    <a class="card-thumb" href=${href} tabindex="-1" aria-hidden="true">
      <${HoverPreview} src=${clip.media_url} poster=${clip.thumbnail_url} />
      ${clip.duration_ms != null && html`<span class="dur-pill">${formatDuration(clip.duration_ms)}</span>`}
      ${showVisibility && html`<span class=${`badge badge-${clip.visibility} card-vis`}>${clip.visibility}</span>`}
    </a>
    ${selectable && html`<label class="card-check">
      <input type="checkbox" checked=${selected} aria-label=${`Select ${clip.title}`}
        onChange=${() => onToggleSelect?.(clip.id)} />
    </label>`}
    <h3 class="card-title"><a href=${href}>${clip.title}</a></h3>
    <p class="card-meta">${meta.map((m, i) => html`${i > 0 && " · "}${m}`)}</p>
  </article>`;
}
