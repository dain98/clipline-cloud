import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { session, useStore } from "../lib/store.js";
import { publicThumbPath } from "../lib/media.js";
import { icon } from "../lib/icons.js";
import { EmptyState } from "../components/EmptyState.js";
import { ClipCard } from "../components/ClipCard.js";
import { UserAvatar } from "../components/UserAvatar.js";

export function UserPage({ route }) {
  const { user: currentUser } = useStore(session);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    setProfile(null);
    setError(null);
    api(`/api/v1/public/users/${encodeURIComponent(route.username)}`)
      .then((p) => live && setProfile(p))
      .catch((e) => live && setError(e));
    return () => {
      live = false;
    };
  }, [route.username]);

  if (error) {
    return html`<main class="page"><${EmptyState} name="alert" title="Profile unavailable" body=${error.message} /></main>`;
  }
  if (!profile) {
    return html`<main class="page"><p class="empty-state">Loading profile…</p></main>`;
  }

  const canEdit = currentUser && currentUser.username.toLowerCase() === profile.username.toLowerCase();
  const clips = profile.clips || [];

  return html`<main class="page">
    <header class="public-user-header">
      <${UserAvatar} user=${profile} size=${72} />
      <div class="public-user-header-body">
        <div class="public-user-title-row">
          <div>
            <h1>${profile.display_name || profile.username}</h1>
            <p>@${profile.username}</p>
          </div>
          ${canEdit && html`<a class="btn" href="/profile">${icon("edit", { size: 14 })} Edit profile</a>`}
        </div>
        ${profile.bio && html`<p class="public-user-bio">${profile.bio}</p>`}
        <p class="meta-line">${profile.clip_count} public clip${profile.clip_count === 1 ? "" : "s"}</p>
      </div>
    </header>
    ${clips.length === 0
      ? html`<${EmptyState} name="film" title="No public clips yet" />`
      : html`<div class="card-grid">
          ${clips.map((clip) => html`<${ClipCard} key=${clip.share_id}
            clip=${{ ...clip, thumbnail_url: publicThumbPath(clip) }}
            href=${`/c/${encodeURIComponent(clip.share_id)}`} showAuthor=${false} />`)}
        </div>`}
  </main>`;
}
