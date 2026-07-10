import { html } from "../lib/html.js";
import { useState } from "preact/hooks";
import { api, setCsrfToken } from "../lib/api.js";
import { useAsyncResource } from "../lib/use-api-resource.js";
import { navigate } from "../lib/router.js";
import { session, toast } from "../lib/store.js";
import { formatDate } from "../lib/format.js";
import { icon } from "../lib/icons.js";
import { EmptyState } from "../components/EmptyState.js";
import { ConfirmDialog } from "../components/ConfirmDialog.js";

async function loadAccountData(signal) {
  const options = { signal };
  const [sessions, deviceTokens] = await Promise.all([
    api("/api/v1/auth/sessions", options),
    api("/api/v1/auth/device-tokens", options),
  ]);
  return { sessions, deviceTokens };
}

function SessionItem({ item, onRevoke }) {
  return html`<div class="management-item">
    <div>
      <strong>${item.user_agent || "Unknown browser"}</strong>
      <div class="meta-line">
        <span>${item.ip_address || "Unknown IP"}</span>
        <span>Last used ${formatDate(item.last_used_at || item.created_at)}</span>
        <span>Expires ${formatDate(item.expires_at)}</span>
      </div>
    </div>
    <div class="actions">
      ${item.current && html`<span class="badge badge-public">Current</span>`}
      <button class="btn btn-danger" type="button" onClick=${() => onRevoke(item)}>${icon("x", { size: 14 })} Revoke</button>
    </div>
  </div>`;
}

function DeviceTokenItem({ item, onRevoke }) {
  const revoked = Boolean(item.revoked_at);
  return html`<div class="management-item">
    <div>
      <strong>${item.name}</strong>
      <div class="meta-line">
        <span>Created ${formatDate(item.created_at)}</span>
        <span>Last used ${formatDate(item.last_used_at)}</span>
        ${item.expires_at && html`<span>Expires ${formatDate(item.expires_at)}</span>`}
        ${revoked && html`<span>Revoked ${formatDate(item.revoked_at)}</span>`}
      </div>
    </div>
    <div class="actions">
      <span class=${`badge ${revoked ? "badge-private" : "badge-public"}`}>${revoked ? "Revoked" : "Active"}</span>
      <button class="btn btn-danger" type="button" disabled=${revoked} onClick=${() => onRevoke(item)}>${icon("x", { size: 14 })} Revoke</button>
    </div>
  </div>`;
}

export function AccountPage() {
  const [reloadTick, setReloadTick] = useState(0);
  const { data, error } = useAsyncResource(reloadTick, loadAccountData);
  const [confirmTarget, setConfirmTarget] = useState(null); // { kind: "session" | "device", item }

  const reload = () => setReloadTick((t) => t + 1);

  async function onConfirmRevoke() {
    const target = confirmTarget;
    setConfirmTarget(null);
    try {
      if (target.kind === "session") {
        await api(`/api/v1/auth/sessions/${encodeURIComponent(target.item.id)}`, { method: "DELETE", body: {} });
        if (target.item.current) {
          setCsrfToken(null);
          session.set({ user: null, csrfToken: null, ready: true });
          toast("Current session revoked.");
          navigate("/login");
          return;
        }
        toast("Session revoked.");
      } else {
        await api(`/api/v1/auth/device-tokens/${encodeURIComponent(target.item.id)}`, { method: "DELETE", body: {} });
        toast("Device token revoked.");
      }
      reload();
    } catch (err) {
      toast(err.message);
    }
  }

  if (error) {
    return html`<main class="page"><${EmptyState} name="alert" title="Couldn't load account data" body=${error.message} /></main>`;
  }

  return html`<main class="page">
    <h1>Account</h1>
    <p class="page-subtitle">Sessions and device tokens.</p>
    ${!data
      ? html`<p class="empty-state">Loading account data…</p>`
      : html`<div class="account-grid">
          <div class="panel">
            <div class="section-header"><h2>Browser sessions</h2><span class="muted">${data.sessions.length} active</span></div>
            ${data.sessions.length
              ? html`<div class="management-list">${data.sessions.map((s) => html`<${SessionItem} key=${s.id} item=${s}
                  onRevoke=${(item) => setConfirmTarget({ kind: "session", item })} />`)}</div>`
              : html`<p class="muted">No active sessions.</p>`}
          </div>
          <div class="panel">
            <div class="section-header"><h2>Device tokens</h2><span class="muted">${data.deviceTokens.length} total</span></div>
            ${data.deviceTokens.length
              ? html`<div class="management-list">${data.deviceTokens.map((t) => html`<${DeviceTokenItem} key=${t.id} item=${t}
                  onRevoke=${(item) => setConfirmTarget({ kind: "device", item })} />`)}</div>`
              : html`<p class="muted">No device tokens.</p>`}
          </div>
        </div>`}
    <${ConfirmDialog} open=${Boolean(confirmTarget)}
      title=${confirmTarget?.kind === "session" ? "Revoke browser session?" : "Revoke device token?"}
      body=${confirmTarget?.kind === "session"
        ? (confirmTarget.item.current ? "This signs you out of the current browser session." : "This signs out that browser session immediately.")
        : "The desktop client using this token will need to reconnect."}
      confirmLabel="Revoke" danger
      onConfirm=${onConfirmRevoke} onCancel=${() => setConfirmTarget(null)} />
  </main>`;
}
