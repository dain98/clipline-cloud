import { html } from "../../lib/html.js";
import { useState } from "preact/hooks";
import { api } from "../../lib/api.js";
import { toast } from "../../lib/store.js";
import { formatBytes, formatDate } from "../../lib/format.js";
import { icon } from "../../lib/icons.js";
import { ConfirmDialog } from "../../components/ConfirmDialog.js";

function nullableString(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

// Pure port of legacy gibibytesToBytes (src/app.js:3714-3720).
export function gibibytesToBytes(value) {
  const amount = Number(String(value || "").trim());
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Storage quota must be a non-negative number");
  }
  return Math.round(amount * 1024 * 1024 * 1024);
}

// Pure port of legacy canDisableUser (src/app.js:3155-3162): governs the
// per-row Disable button. Must agree with the server's own role checks
// (apps/clipline-cloud-server/src/auth.rs around :1753-1832) or the button
// will look enabled but 4xx on click.
export function canDisableUser(user, currentUser) {
  if (user.is_disabled || currentUser?.id === user.id || user.role === "owner") {
    return false;
  }
  if (user.role === "admin" && currentUser?.role !== "owner") {
    return false;
  }
  return true;
}

function roleOptions(isOwner) {
  return isOwner ? [["user", "User"], ["admin", "Admin"]] : [["user", "User"]];
}

function CreateUserForm({ isOwner, onCreated }) {
  const [busy, setBusy] = useState(false);
  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    // Capture the form element before the `await` below: event.currentTarget
    // is cleared once the event finishes dispatching, so reading it after an
    // async gap throws "Cannot read properties of null".
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    try {
      await api("/api/v1/users", {
        method: "POST",
        body: {
          username: String(form.get("username") || ""),
          display_name: nullableString(form.get("display_name")),
          email: nullableString(form.get("email")),
          password: nullableString(form.get("password")),
          role: String(form.get("role") || "user"),
        },
      });
      toast("User created.");
      formEl.reset();
      onCreated();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }
  return html`<form class="panel section" onSubmit=${onSubmit}>
    <h2>Create user</h2>
    <label class="field"><span>Username</span><input class="input" name="username" required /></label>
    <label class="field"><span>Display name</span><input class="input" name="display_name" placeholder="Optional" /></label>
    <label class="field"><span>Email</span><input class="input" name="email" type="email" placeholder="Optional" /></label>
    <label class="field"><span>Password</span><input class="input" name="password" type="password" required /></label>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${roleOptions(isOwner).map(([v, l]) => html`<option value=${v}>${l}</option>`)}
      </select>
    </label>
    <button class="btn btn-primary" type="submit" disabled=${busy}>${icon("plus", { size: 14 })} Create user</button>
  </form>`;
}

function InviteLinkForm({ isOwner, smtpEnabled, onCreated }) {
  const [busy, setBusy] = useState(false);
  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const intent = event.submitter?.value === "email" ? "email" : "link";
    try {
      const data = await api("/api/v1/invites", {
        method: "POST",
        body: {
          role: String(form.get("role") || "user"),
          email: nullableString(form.get("email")),
          send_email: intent === "email",
        },
      });
      toast(intent === "email" ? "Invite sent." : "Invite link created.");
      onCreated({ ...data, kind: "invite" });
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }
  return html`<form class="panel section" onSubmit=${onSubmit}>
    <h2>Invite link</h2>
    <label class="field"><span>Role</span>
      <select class="input" name="role">
        ${roleOptions(isOwner).map(([v, l]) => html`<option value=${v}>${l}</option>`)}
      </select>
    </label>
    <label class="field"><span>Email</span>
      <input class="input" name="email" type="email" placeholder=${smtpEnabled ? "Optional" : "SMTP disabled"} disabled=${!smtpEnabled} />
    </label>
    <div class="actions">
      <button class="btn" type="submit" name="intent" value="link" disabled=${busy}>${icon("copy", { size: 14 })} Generate link</button>
      ${smtpEnabled && html`<button class="btn btn-primary" type="submit" name="intent" value="email" disabled=${busy}>${icon("message", { size: 14 })} Send email</button>`}
    </div>
  </form>`;
}

function ResetLinkNotice({ resetLink }) {
  if (!resetLink) return null;
  const kind = resetLink.kind === "invite" ? "Invite" : "Reset";
  // Legacy only ever attached a `username` here when one happened to be on
  // the response (src/app.js:3147-3161); neither /reset-password nor
  // /invites returns one, so this suffix is always empty — kept as-is for
  // an exact port rather than inventing a lookup that never existed.
  const username = resetLink.username ? ` for ${resetLink.username}` : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resetLink.reset_url);
      toast("Copied to clipboard.");
    } catch {
      toast("Copy failed. Select and copy the URL manually.");
    }
  };
  return html`<div class="notice admin-reset-link">
    <div>
      <strong>${kind} link created${username}</strong>
      <span>Expires ${formatDate(resetLink.expires_at)}</span>
      <code>${resetLink.reset_url}</code>
    </div>
    <button class="btn" type="button" onClick=${copy}>${icon("copy", { size: 14 })} Copy</button>
  </div>`;
}

function statusBadge(user) {
  return user.is_disabled
    ? html`<span class="badge badge-warn">Disabled</span>`
    : html`<span class="badge badge-public">Active</span>`;
}

function UserRow({ user, currentUser, onQuota, onReset, onDisable }) {
  const quotaLabel = user.storage_quota_bytes != null ? formatBytes(user.storage_quota_bytes) : "No limit";
  const disableDisabled = !canDisableUser(user, currentUser);
  return html`<tr>
    <td>
      <strong>${user.username}</strong>
      <div class="muted">${user.display_name || user.id}</div>
      ${user.email && html`<div class="muted">${user.email}</div>`}
    </td>
    <td>${user.role}</td>
    <td>${statusBadge(user)}</td>
    <td>
      <strong>${formatBytes(user.storage_bytes || 0)}</strong>
      <div class="muted">quota ${quotaLabel}</div>
    </td>
    <td>${formatDate(user.last_login_at)}</td>
    <td>
      <div class="actions">
        <button class="btn" type="button" onClick=${() => onQuota(user)}>${icon("sliders", { size: 14 })} Quota</button>
        <button class="btn" type="button" onClick=${() => onReset(user)}>${icon("clipboard", { size: 14 })} Reset link</button>
        <button class="btn btn-danger" type="button" disabled=${disableDisabled} onClick=${() => onDisable(user)}>${icon("x", { size: 14 })} Disable</button>
      </div>
    </td>
  </tr>`;
}

export function AdminUsers({ users, settings, currentUser, resetLink, setResetLink, reload }) {
  const [dialog, setDialog] = useState(null); // { type: "quota" | "disable" | "reset", user, value }
  const isOwner = currentUser?.role === "owner";
  const smtpEnabled = Boolean(settings?.smtp_enabled);

  const closeDialog = () => setDialog(null);

  async function confirmDialog() {
    const { type, user, value } = dialog;
    closeDialog();
    try {
      if (type === "quota") {
        const storage_quota_bytes = value.trim() ? gibibytesToBytes(value) : null;
        await api(`/api/v1/users/${encodeURIComponent(user.id)}`, { method: "PATCH", body: { storage_quota_bytes } });
        toast("Storage quota updated.");
      } else if (type === "disable") {
        await api(`/api/v1/users/${encodeURIComponent(user.id)}`, { method: "DELETE", body: { reauth_password: value } });
        toast("User disabled.");
      } else if (type === "reset") {
        const data = await api(`/api/v1/users/${encodeURIComponent(user.id)}/reset-password`, {
          method: "POST",
          body: { reauth_password: value },
        });
        setResetLink({ ...data, kind: "reset" });
        toast("Reset link created.");
      }
      reload();
    } catch (err) {
      toast(err.message);
    }
  }

  const dialogCopy = {
    quota: {
      title: "Set storage quota",
      description: "Enter a per-user storage limit in GiB. Leave it blank to remove the per-user limit.",
      confirmLabel: "Save quota",
      danger: false,
      field: html`<label class="field"><span>Quota GiB</span>
        <input class="input" type="number" min="0" step="0.1" placeholder="No per-user limit"
          value=${dialog?.value || ""} onInput=${(e) => setDialog((d) => ({ ...d, value: e.target.value }))} /></label>`,
    },
    disable: {
      title: "Disable user?",
      description: "This immediately revokes the user's sessions and device tokens.",
      confirmLabel: "Disable",
      danger: true,
      field: html`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${dialog?.value || ""}
          onInput=${(e) => setDialog((d) => ({ ...d, value: e.target.value }))} /></label>`,
    },
    reset: {
      title: "Create reset link?",
      description: "This creates a temporary password reset link for the selected user.",
      confirmLabel: "Create link",
      danger: false,
      field: html`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${dialog?.value || ""}
          onInput=${(e) => setDialog((d) => ({ ...d, value: e.target.value }))} /></label>`,
    },
  }[dialog?.type];

  return html`<div class="admin-grid">
    <div class="admin-side-stack">
      <${CreateUserForm} isOwner=${isOwner} onCreated=${() => { setResetLink(null); reload(); }} />
      <${InviteLinkForm} isOwner=${isOwner} smtpEnabled=${smtpEnabled}
        onCreated=${(data) => { setResetLink(data); reload(); }} />
    </div>
    <div class="panel">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${users.length} total</span>
      </div>
      <${ResetLinkNotice} resetLink=${resetLink} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${users.map((user) => html`<${UserRow} key=${user.id} user=${user} currentUser=${currentUser}
              onQuota=${(u) => setDialog({ type: "quota", user: u, value: "" })}
              onReset=${(u) => setDialog({ type: "reset", user: u, value: "" })}
              onDisable=${(u) => setDialog({ type: "disable", user: u, value: "" })} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${ConfirmDialog} open=${Boolean(dialog)}
      title=${dialogCopy?.title}
      body=${dialogCopy && html`${dialogCopy.description} ${dialogCopy.field}`}
      confirmLabel=${dialogCopy?.confirmLabel} danger=${dialogCopy?.danger}
      confirmDisabled=${dialog?.type !== "quota" && !dialog?.value?.trim()}
      onConfirm=${confirmDialog} onCancel=${closeDialog} />
  </div>`;
}
