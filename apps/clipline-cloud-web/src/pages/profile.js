import { html } from "../lib/html.js";
import { useState } from "preact/hooks";
import { api, getCsrfToken } from "../lib/api.js";
import { session, toast, useStore } from "../lib/store.js";
import { icon } from "../lib/icons.js";
import { UserAvatar } from "../components/UserAvatar.js";

function nullableString(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

// Port of legacy uploadAvatar (src/app.js:2795-2814): the only endpoint that
// takes a raw binary body instead of JSON, so it bypasses lib/api.js's
// json-body helper and builds the request by hand.
async function uploadAvatar(file) {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", file.type || "application/octet-stream");
  const csrfToken = getCsrfToken();
  if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  const response = await fetch("/api/v1/me/avatar", { method: "PUT", credentials: "same-origin", headers, body: file });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || response.statusText || "Avatar upload failed");
  return data;
}

function updateSessionUser(user) {
  session.set({ ...session.get(), user });
}

function ProfileForm({ user }) {
  const [busy, setBusy] = useState(false);
  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api("/api/v1/me/profile", {
        method: "PATCH",
        body: { display_name: nullableString(form.get("display_name")), bio: nullableString(form.get("bio")) },
      });
      updateSessionUser(updated);
      toast("Profile saved.");
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }
  return html`<form class="profile-form" onSubmit=${onSubmit}>
    <label class="field"><span>Display name</span>
      <input class="input" name="display_name" maxlength="120" value=${user.display_name || ""} placeholder=${user.username} /></label>
    <label class="field"><span>Bio</span>
      <textarea class="input" name="bio" rows="5" maxlength="2000" placeholder="Tell people what you upload.">${user.bio || ""}</textarea></label>
    <div class="clip-inline-actions">
      <button class="btn btn-primary" type="submit" disabled=${busy}>${icon("save", { size: 14 })} Save profile</button>
    </div>
  </form>`;
}

function AvatarForm({ user }) {
  const [busy, setBusy] = useState(false);
  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    const file = event.currentTarget.elements.avatar?.files?.[0];
    if (!file) {
      toast("Choose an avatar image first.");
      return;
    }
    setBusy(true);
    try {
      const updated = await uploadAvatar(file);
      updateSessionUser(updated);
      toast("Avatar uploaded.");
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }
  return html`<form class="profile-form" onSubmit=${onSubmit}>
    <label class="field"><span>Avatar</span>
      <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
      <small>PNG, JPEG, WebP, or GIF. Max 2 MiB.</small></label>
    <div class="clip-inline-actions">
      <button class="btn" type="submit" disabled=${busy}>${icon("upload", { size: 14 })} Upload avatar</button>
    </div>
  </form>`;
}

export function ProfilePage() {
  const { user } = useStore(session);
  if (!user) return null;
  return html`<main class="page">
    <h1>Profile</h1>
    <p class="page-subtitle">Public identity and avatar.</p>
    <div class="profile-settings-header">
      <${UserAvatar} user=${user} size=${72} />
      <div>
        <h2>${user.display_name || user.username}</h2>
        <p>@${user.username} · ${user.role}</p>
      </div>
    </div>
    <${ProfileForm} user=${user} />
    <${AvatarForm} user=${user} />
    <div class="profile-public-link">
      <a class="btn" href=${`/u/${encodeURIComponent(user.username)}`}>${icon("external", { size: 14 })} View public profile</a>
    </div>
  </main>`;
}
