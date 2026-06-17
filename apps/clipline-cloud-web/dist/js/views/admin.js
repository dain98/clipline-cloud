import { state } from "/js/state.js";
import { api } from "/js/api.js";
import { renderShell } from "/js/shell.js";
import {
  escapeHtml,
  escapeAttr,
  icon,
  flash,
  formatDate,
  formatBytes,
  formatProgress,
  field,
  selectField,
  dataRow,
  nullableString,
} from "/js/util.js";

export async function renderAdmin(tab) {
  renderShell({
    active: "admin",
    title: "Admin",
    subtitle: "Accounts, instance summary, and processing diagnostics.",
    body: `<div class="empty-state">Loading admin data...</div>`,
  });

  try {
    const [overview, users, failedUploads, deadJobs, recentErrors] = await Promise.all([
      api("/api/v1/admin/overview"),
      api("/api/v1/users"),
      api("/api/v1/admin/uploads/failed?limit=50"),
      api("/api/v1/admin/jobs/dead?limit=50"),
      api("/api/v1/admin/jobs/recent-errors?limit=50"),
    ]);
    renderShell({
      active: "admin",
      title: "Admin",
      subtitle: "Accounts, instance summary, and processing diagnostics.",
      body: adminView(tab, { overview, users, failedUploads, deadJobs, recentErrors }),
    });
    bindAdminEvents();
  } catch (error) {
    renderShell({
      active: "admin",
      title: "Admin",
      subtitle: "Accounts, instance summary, and processing diagnostics.",
      body: `<div class="error-box">${escapeHtml(error.message)}</div>`,
    });
  }
}

function adminView(tab, data) {
  const active = ["overview", "users", "jobs"].includes(tab) ? tab : "overview";
  return `
    <section class="section">
      <div class="tabs" role="tablist" aria-label="Admin views">
        ${adminTab("/admin?tab=overview", "overview", active, icon("server"), "Overview")}
        ${adminTab("/admin?tab=users", "users", active, icon("users"), "Users")}
        ${adminTab("/admin?tab=jobs", "jobs", active, icon("alert"), "Jobs")}
      </div>
      ${active === "users" ? adminUsersView(data.users) : ""}
      ${active === "jobs" ? adminJobsView(data.failedUploads, data.deadJobs, data.recentErrors) : ""}
      ${active === "overview" ? adminOverviewView(data.overview) : ""}
    </section>
  `;
}

function adminTab(href, key, active, iconSvg, label) {
  return `<a class="tab ${key === active ? "active" : ""}" href="${escapeAttr(href)}" data-route>${iconSvg} ${escapeHtml(label)}</a>`;
}

function adminOverviewView(overview) {
  return `
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="data-list">
        ${dataRow("Server version", overview.server_version)}
        ${dataRow("API version", overview.api_version)}
        ${dataRow("Public URL", overview.public_url)}
        ${dataRow("Database", overview.database_backend)}
        ${dataRow("Storage", `${overview.storage_backend} - ${overview.storage_summary}`)}
        ${dataRow("Max upload", formatBytes(overview.max_upload_size_bytes))}
        ${dataRow("Part size", formatBytes(overview.upload_part_size_bytes))}
        ${dataRow("Single PUT max", formatBytes(overview.single_put_max_bytes))}
        ${dataRow("Upload TTL", `${overview.upload_session_ttl_seconds}s`)}
        ${dataRow("Public media", `${overview.public_media_mode}, ${overview.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  `;
}

function adminUsersView(users) {
  return `
    <div class="admin-grid">
      <form id="create-user-form" class="panel section">
        <h2>Create user</h2>
        ${field("Username", "username", "text", "", "Required")}
        ${field("Display name", "display_name", "text", "", "Optional")}
        ${field("Password", "password", "password", "", "At least 8 characters")}
        ${selectField("Role", "role", "user", [
          ["user", "User"],
          ["admin", "Admin"],
        ])}
        ${field("Your password", "reauth_password", "password", "", "Required")}
        <button class="btn-primary" type="submit">${icon("plus")} Create user</button>
      </form>
      <div class="panel">
        <div class="section-header">
          <h2>Users</h2>
          <span class="muted">${users.length} total</span>
        </div>
        ${state.adminResetToken ? `<div class="notice mono">${escapeHtml(state.adminResetToken)}</div>` : ""}
        <div class="table-wrap">
          <table>
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Last login</th><th></th></tr></thead>
            <tbody>${users.map(userRow).join("")}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function userRow(user) {
  return `
    <tr>
      <td>
        <strong>${escapeHtml(user.username)}</strong>
        <div class="muted">${escapeHtml(user.display_name || user.id)}</div>
      </td>
      <td>${escapeHtml(user.role)}</td>
      <td>${user.is_disabled ? `<span class="badge badge-warn">Disabled</span>` : `<span class="badge badge-public">Active</span>`}</td>
      <td>${formatDate(user.last_login_at)}</td>
      <td>
        <div class="actions">
          <button class="btn-secondary" data-user-action="reset" data-user-id="${escapeAttr(user.id)}">${icon("clipboard")} Reset</button>
          <button class="btn-danger" data-user-action="disable" data-user-id="${escapeAttr(user.id)}" ${user.is_disabled ? "disabled" : ""}>${icon("x")} Disable</button>
        </div>
      </td>
    </tr>
  `;
}

function adminJobsView(failedUploads, deadJobs, recentErrors) {
  return `
    <div class="section">
      <div class="panel">
        <div class="section-header">
          <h2>Failed uploads</h2>
          <span class="muted">${failedUploads.length}</span>
        </div>
        ${failedUploads.length ? `<div class="job-list">${failedUploads.map(uploadItem).join("")}</div>` : `<p class="muted">No failed uploads.</p>`}
      </div>
      <div class="panel">
        <div class="section-header">
          <h2>Dead jobs</h2>
          <span class="muted">${deadJobs.length}</span>
        </div>
        ${deadJobs.length ? `<div class="job-list">${deadJobs.map(jobItem).join("")}</div>` : `<p class="muted">No dead jobs.</p>`}
      </div>
      <div class="panel">
        <div class="section-header">
          <h2>Recent job errors</h2>
          <span class="muted">${recentErrors.length}</span>
        </div>
        ${recentErrors.length ? `<div class="job-list">${recentErrors.map(jobItem).join("")}</div>` : `<p class="muted">No recent job errors.</p>`}
      </div>
    </div>
  `;
}

function uploadItem(upload) {
  const progress = Math.max(0, Math.min(10000, Number(upload.progress_basis_points || 0)));
  const action = recoveryActionLabel(upload.recovery_action);
  return `
    <div class="job-item">
      <div class="job-title-line">
        <strong class="mono">${escapeHtml(upload.id)}</strong>
        <span class="badge badge-warn">${formatProgress(progress)}</span>
      </div>
      <div class="progress-meter" aria-label="Upload progress">
        <span style="width:${progress / 100}%"></span>
      </div>
      <span class="muted">clip ${escapeHtml(upload.clip_id)} - ${formatBytes(upload.received_size_bytes)} of ${formatBytes(upload.expected_size_bytes)} - updated ${formatDate(upload.updated_at)}</span>
      ${upload.failure_reason ? `<span class="error-box">${escapeHtml(upload.failure_reason)}</span>` : ""}
      ${action ? `<span class="muted">Recovery: ${escapeHtml(action)}</span>` : ""}
    </div>
  `;
}

function recoveryActionLabel(action) {
  switch (action) {
    case "delete_and_retry":
      return "delete the failed upload and retry from a new session";
    case "retry":
      return "retry the current upload request";
    default:
      return "";
  }
}

function jobItem(job) {
  return `
    <div class="job-item">
      <strong>${escapeHtml(job.kind)} <span class="mono">${escapeHtml(job.id)}</span></strong>
      <span class="muted">${escapeHtml(job.status)} - attempts ${job.attempts}/${job.max_attempts} - target ${escapeHtml(job.target_type || "")}:${escapeHtml(job.target_id || "")}</span>
      ${job.last_error ? `<span class="error-box">${escapeHtml(job.last_error)}</span>` : ""}
    </div>
  `;
}

function bindAdminEvents() {
  const createForm = document.querySelector("#create-user-form");
  if (createForm) {
    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await api("/api/v1/users", {
          method: "POST",
          body: {
            username: String(form.get("username") || ""),
            display_name: nullableString(form.get("display_name")),
            password: String(form.get("password") || ""),
            role: String(form.get("role") || "user"),
            reauth_password: String(form.get("reauth_password") || ""),
          },
        });
        flash("User created.");
        const { navigate } = await import("/js/router.js");
        navigate("/admin?tab=users");
      } catch (error) {
        flash(error.message, "error");
        renderAdmin("users");
      }
    });
  }

  document.querySelectorAll("[data-user-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.userId;
      const action = button.dataset.userAction;
      const reauth = window.prompt(`Confirm your password to ${action} this user.`);
      if (!reauth) {
        return;
      }
      try {
        if (action === "disable") {
          await api(`/api/v1/users/${encodeURIComponent(id)}`, {
            method: "DELETE",
            body: { reauth_password: reauth },
          });
          flash("User disabled.");
        } else if (action === "reset") {
          const data = await api(`/api/v1/users/${encodeURIComponent(id)}/reset-password`, {
            method: "POST",
            body: { reauth_password: reauth },
          });
          state.adminResetToken = `Reset token: ${data.reset_token} (expires ${formatDate(data.expires_at)})`;
          flash("Reset token created.");
        }
        renderAdmin("users");
      } catch (error) {
        flash(error.message, "error");
        renderAdmin("users");
      }
    });
  });
}
