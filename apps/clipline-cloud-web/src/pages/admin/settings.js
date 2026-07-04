import { html } from "../../lib/html.js";
import { useState } from "preact/hooks";
import { api } from "../../lib/api.js";
import { toast } from "../../lib/store.js";
import { icon } from "../../lib/icons.js";
import { gibibytesToBytes } from "./users.js";

function nullableString(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function quotaGibFromBytes(bytes) {
  if (bytes == null || bytes <= 0) return "";
  return String(Math.round((bytes / (1024 ** 3)) * 100) / 100);
}

export function AdminSettings({ settings, isOwner, reload }) {
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const form = new FormData(event.currentTarget);
      const quotaGib = String(form.get("user_storage_quota_gib") || "").trim();
      const body = {
        allow_vod_uploads: form.get("allow_vod_uploads") === "on",
        vod_threshold_minutes: Number(form.get("vod_threshold_minutes") || 30),
        user_storage_quota_bytes: quotaGib ? gibibytesToBytes(quotaGib) : null,
      };
      if (isOwner) {
        body.about_text = String(form.get("about_text") || "");
        body.smtp_enabled = form.get("smtp_enabled") === "on";
        body.smtp_host = nullableString(form.get("smtp_host"));
        body.smtp_port = Number(form.get("smtp_port") || 587);
        body.smtp_tls_mode = String(form.get("smtp_tls_mode") || "starttls");
        body.smtp_username = nullableString(form.get("smtp_username"));
        body.smtp_from_email = nullableString(form.get("smtp_from_email"));
        body.smtp_from_name = nullableString(form.get("smtp_from_name"));
        const smtpPassword = String(form.get("smtp_password") || "").trim();
        if (smtpPassword) body.smtp_password = smtpPassword;
        if (form.get("smtp_password_clear") === "on") body.smtp_password_clear = true;
      }
      await api("/api/v1/admin/settings", { method: "PATCH", body });
      toast("Settings saved.");
      reload();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return html`<form class="admin-settings-page" onSubmit=${onSubmit}>
    <section class="settings-section">
      <div class="settings-copy">
        <h2>Upload policy</h2>
        <p>Control whether long recordings can be uploaded and where Clipline classifies a clip as a full VOD.</p>
      </div>
      <div class="settings-controls">
        <label class="check-field">
          <input name="allow_vod_uploads" type="checkbox" checked=${settings.allow_vod_uploads} />
          <span>Allow full-length VOD uploads</span>
        </label>
        <label class="field"><span>VOD threshold minutes</span>
          <input class="input" name="vod_threshold_minutes" type="number" min="0" value=${settings.vod_threshold_minutes ?? 30} /></label>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-copy">
        <h2>Default storage quota</h2>
        <p>Per-user storage limit for accounts without an individual quota. Leave blank to disable quotas.</p>
      </div>
      <div class="settings-controls">
        <label class="field"><span>Default quota GiB</span>
          <input class="input" name="user_storage_quota_gib" type="number" min="0" step="0.1"
            placeholder="No default quota"
            value=${quotaGibFromBytes(settings.user_storage_quota_bytes)} /></label>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-copy">
        <h2>About page</h2>
        <p>${isOwner ? "Edit the public About page shown to all visitors." : "Only the owner can edit the public About page."}</p>
      </div>
      <div class="settings-controls">
        <label class="field"><span>About text</span>
          <textarea class="input" name="about_text" rows="5" maxlength="5000" disabled=${!isOwner}>${settings.about_text || ""}</textarea>
        </label>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-copy">
        <h2>Email invites</h2>
        <p>${isOwner ? "Configure SMTP so new users can receive password setup links by email." : "Only the owner can edit SMTP invite settings."}</p>
      </div>
      <div class="settings-controls">
        <label class="check-field">
          <input name="smtp_enabled" type="checkbox" checked=${settings.smtp_enabled} disabled=${!isOwner} />
          <span>Enable SMTP invites</span>
        </label>
        <label class="field"><span>SMTP host</span>
          <input class="input" name="smtp_host" value=${settings.smtp_host || ""} placeholder="smtp.example.com" disabled=${!isOwner} /></label>
        <label class="field"><span>SMTP port</span>
          <input class="input" name="smtp_port" type="number" min="1" value=${settings.smtp_port ?? 587} disabled=${!isOwner} /></label>
        <label class="field"><span>TLS mode</span>
          <select class="input" name="smtp_tls_mode" disabled=${!isOwner}>
            ${[["starttls", "STARTTLS"], ["tls", "TLS"], ["none", "None"]].map(([v, l]) =>
              html`<option value=${v} selected=${(settings.smtp_tls_mode || "starttls") === v}>${l}</option>`)}
          </select></label>
        <label class="field"><span>SMTP username</span>
          <input class="input" name="smtp_username" value=${settings.smtp_username || ""} placeholder="Optional" disabled=${!isOwner} /></label>
        <label class="field"><span>SMTP password</span>
          <input class="input" name="smtp_password" type="password"
            placeholder=${settings.smtp_password_configured ? "Configured; leave blank to keep" : "Optional"} disabled=${!isOwner} /></label>
        ${settings.smtp_password_configured && html`<label class="check-field">
          <input name="smtp_password_clear" type="checkbox" disabled=${!isOwner} />
          <span>Clear stored SMTP password</span>
        </label>`}
        <label class="field"><span>From email</span>
          <input class="input" name="smtp_from_email" type="email" value=${settings.smtp_from_email || ""} placeholder="clips@example.com" disabled=${!isOwner} /></label>
        <label class="field"><span>From name</span>
          <input class="input" name="smtp_from_name" value=${settings.smtp_from_name || ""} placeholder="Clipline Cloud" disabled=${!isOwner} /></label>
      </div>
    </section>

    <div class="settings-action-row">
      <button class="btn btn-primary" type="submit" disabled=${busy}>${icon("save", { size: 14 })} Save settings</button>
    </div>
  </form>`;
}
