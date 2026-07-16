import { html } from "../../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../../lib/api.js";
import { toast } from "../../lib/store.js";
import { formatBytes, formatDate } from "../../lib/format.js";
import { icon } from "../../lib/icons.js";
import { ConfirmDialog } from "../../components/ConfirmDialog.js";

function nullableString(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

// UI affordance for the server's role rules. The server remains authoritative.
export function canDisableUser(user, currentUser) {
  if (user.is_disabled || currentUser?.id === user.id || user.role === "owner") {
    return false;
  }
  if (user.role === "admin" && currentUser?.role !== "owner") {
    return false;
  }
  return true;
}

export function canEnableUser(user, currentUser) {
  if (!user.is_disabled || currentUser?.id === user.id || user.role === "owner") {
    return false;
  }
  if (user.role === "admin" && currentUser?.role !== "owner") {
    return false;
  }
  return true;
}

export function canChangeRole(user, currentUser) {
  return currentUser?.role === "owner"
    && user.role !== "owner"
    && currentUser?.id !== user.id;
}

export function canPurgeUser(user, currentUser) {
  if (currentUser?.id === user.id || user.role === "owner") {
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

function effectiveDefaultQuotaBytes(settings) {
  if (!settings) return null;
  if (settings.user_storage_quota_bytes != null && settings.user_storage_quota_bytes > 0) {
    return settings.user_storage_quota_bytes;
  }
  return settings.user_storage_quota_env_fallback_bytes ?? null;
}

export function perUserQuotaLabel(user, settings) {
  if (user.storage_quota_bytes != null && user.storage_quota_bytes > 0) {
    return formatBytes(user.storage_quota_bytes);
  }
  const defaultQuota = effectiveDefaultQuotaBytes(settings);
  if (defaultQuota != null && defaultQuota > 0) {
    return `Default (${formatBytes(defaultQuota)})`;
  }
  return "No limit";
}

function UserRow({
  user,
  currentUser,
  settings,
  onQuota,
  onReset,
  onDisable,
  onEnable,
  onRole,
  onPurge,
}) {
  const quotaLabel = perUserQuotaLabel(user, settings);
  const disableDisabled = !canDisableUser(user, currentUser);
  const enableDisabled = !canEnableUser(user, currentUser);
  const purgeDisabled = !canPurgeUser(user, currentUser);
  const roleEditable = canChangeRole(user, currentUser);
  const [roleValue, setRoleValue] = useState(user.role);

  useEffect(() => {
    setRoleValue(user.role);
  }, [user.role]);

  return html`<tr>
    <td>
      <strong>${user.username}</strong>
      <div class="muted">${user.display_name || user.id}</div>
      ${user.email && html`<div class="muted">${user.email}</div>`}
    </td>
    <td>
      ${roleEditable
        ? html`<select class="input input-compact" value=${roleValue}
            onChange=${(event) => {
              const nextRole = event.target.value;
              if (nextRole === user.role) return;
              setRoleValue(user.role);
              onRole(user, nextRole);
            }}>
            ${roleOptions(true).map(([v, l]) => html`<option value=${v} selected=${roleValue === v}>${l}</option>`)}
          </select>`
        : user.role}
    </td>
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
        ${user.is_disabled
          ? html`<button class="btn" type="button" disabled=${enableDisabled} onClick=${() => onEnable(user)}>${icon("check", { size: 14 })} Enable</button>`
          : html`<button class="btn btn-danger" type="button" disabled=${disableDisabled} onClick=${() => onDisable(user)}>${icon("x", { size: 14 })} Disable</button>`}
        <button class="btn btn-danger" type="button" disabled=${purgeDisabled} onClick=${() => onPurge(user)}>${icon("trash", { size: 14 })} Delete</button>
      </div>
    </td>
  </tr>`;
}

export function AdminUsers({ users, settings, currentUser, resetLink, setResetLink, reload }) {
  const [dialog, setDialog] = useState(null);
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
      } else if (type === "enable") {
        await api(`/api/v1/users/${encodeURIComponent(user.id)}`, {
          method: "PATCH",
          body: { is_disabled: false, reauth_password: value },
        });
        toast("User enabled.");
      } else if (type === "role") {
        await api(`/api/v1/users/${encodeURIComponent(user.id)}`, {
          method: "PATCH",
          body: { role: value.role, reauth_password: value.password },
        });
        toast(`Role updated to ${value.role}.`);
      } else if (type === "purge") {
        await api(`/api/v1/users/${encodeURIComponent(user.id)}/purge`, {
          method: "POST",
          body: { reauth_password: value },
        });
        toast("User deleted.");
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
      reload();
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
    enable: {
      title: "Enable user?",
      description: "This restores sign-in access for the selected account.",
      confirmLabel: "Enable",
      danger: false,
      field: html`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${dialog?.value || ""}
          onInput=${(e) => setDialog((d) => ({ ...d, value: e.target.value }))} /></label>`,
    },
    role: {
      title: "Change user role?",
      description: `Set ${dialog?.user?.username || "this user"} to ${dialog?.value?.role || "the selected role"}.`,
      confirmLabel: "Save role",
      danger: false,
      field: html`<label class="field"><span>Your password</span>
        <input class="input" type="password" required value=${dialog?.value?.password || ""}
          onInput=${(e) => setDialog((d) => ({ ...d, value: { ...d.value, password: e.target.value } }))} /></label>`,
    },
    purge: {
      title: "Delete user permanently?",
      description: "This removes the account, clips, comments, and auth records. This cannot be undone.",
      confirmLabel: "Delete user",
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

  return html`<div class="admin-users-layout">
    <div class="admin-users-forms">
      <${CreateUserForm} isOwner=${isOwner} onCreated=${() => { setResetLink(null); reload(); }} />
      <${InviteLinkForm} isOwner=${isOwner} smtpEnabled=${smtpEnabled}
        onCreated=${(data) => { setResetLink(data); reload(); }} />
    </div>
    <div class="panel admin-users-table">
      <div class="section-header">
        <h2>Users</h2>
        <span class="muted">${users.length} total</span>
      </div>
      <${ResetLinkNotice} resetLink=${resetLink} />
      <div class="table-wrap">
        <table class="lib-table">
          <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Storage</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            ${users.map((user) => html`<${UserRow} key=${user.id} user=${user} currentUser=${currentUser} settings=${settings}
              onQuota=${(u) => setDialog({ type: "quota", user: u, value: "" })}
              onReset=${(u) => setDialog({ type: "reset", user: u, value: "" })}
              onDisable=${(u) => setDialog({ type: "disable", user: u, value: "" })}
              onEnable=${(u) => setDialog({ type: "enable", user: u, value: "" })}
              onRole=${(u, role) => setDialog({ type: "role", user: u, value: { role, password: "" } })}
              onPurge=${(u) => setDialog({ type: "purge", user: u, value: "" })} />`)}
          </tbody>
        </table>
      </div>
    </div>
    <${ConfirmDialog} open=${Boolean(dialog)}
      title=${dialogCopy?.title}
      body=${dialogCopy && html`${dialogCopy.description} ${dialogCopy.field}`}
      confirmLabel=${dialogCopy?.confirmLabel} danger=${dialogCopy?.danger}
      confirmDisabled=${dialog?.type === "quota"
        ? false
        : dialog?.type === "role"
          ? !dialog?.value?.password?.trim()
          : !dialog?.value?.trim()}
      onConfirm=${confirmDialog} onCancel=${closeDialog} />
  </div>`;
}

// Admin quota input is displayed in GiB while the API stores bytes.
export function gibibytesToBytes(value) {
  const amount = Number(String(value || "").trim());
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Storage quota must be a non-negative number");
  }
  return Math.round(amount * 1024 * 1024 * 1024);
}
