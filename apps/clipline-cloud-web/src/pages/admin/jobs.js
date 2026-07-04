import { html } from "../../lib/html.js";
import { formatBytes, formatDate } from "../../lib/format.js";

// Pure port of legacy formatProgress (src/app.js:3746-3748).
export function formatProgress(basisPoints) {
  return `${(basisPoints / 100).toFixed(basisPoints % 100 === 0 ? 0 : 1)}%`;
}

// Pure port of legacy recoveryActionLabel (src/app.js:3291-3299).
export function recoveryActionLabel(action) {
  switch (action) {
    case "delete_and_retry":
      return "delete the failed upload and retry from a new session";
    case "retry":
      return "retry the current upload request";
    default:
      return "";
  }
}

function UploadItem({ upload }) {
  const progress = Math.max(0, Math.min(10000, Number(upload.progress_basis_points || 0)));
  const action = recoveryActionLabel(upload.recovery_action);
  return html`<div class="job-item">
    <div class="job-title-line">
      <strong class="mono">${upload.id}</strong>
      <span class="badge badge-warn">${formatProgress(progress)}</span>
    </div>
    <div class="progress-meter" aria-label="Upload progress"><span style=${`width:${progress / 100}%`}></span></div>
    <span class="muted">clip ${upload.clip_id} — ${formatBytes(upload.received_size_bytes)} of ${formatBytes(upload.expected_size_bytes)} — updated ${formatDate(upload.updated_at)}</span>
    ${upload.failure_reason && html`<span class="form-error">${upload.failure_reason}</span>`}
    ${action && html`<span class="muted">Recovery: ${action}</span>`}
  </div>`;
}

function JobItem({ job }) {
  return html`<div class="job-item">
    <strong>${job.kind} <span class="mono">${job.id}</span></strong>
    <span class="muted">${job.status} — attempts ${job.attempts}/${job.max_attempts} — updated ${formatDate(job.updated_at)} — target ${job.target_type || ""}:${job.target_id || ""}</span>
    ${job.last_error && html`<span class="form-error">${job.last_error}</span>`}
  </div>`;
}

function JobPanel({ title, items, renderItem, emptyLabel }) {
  return html`<div class="panel">
    <div class="section-header">
      <h2>${title}</h2>
      <span class="muted">${items.length}</span>
    </div>
    ${items.length
      ? html`<div class="job-list">${items.map(renderItem)}</div>`
      : html`<p class="muted">${emptyLabel}</p>`}
  </div>`;
}

export function AdminJobs({ failedUploads, deadJobs, recentErrors }) {
  // Jobs are read-only here — the server has no retry endpoint (only
  // apps/clipline-cloud-server/src/admin.rs:31-33 GETs), matching legacy
  // (src/app.js adminJobsView never rendered a retry action either).
  return html`<div class="section">
    <${JobPanel} title="Failed uploads" items=${failedUploads} emptyLabel="No failed uploads."
      renderItem=${(upload) => html`<${UploadItem} key=${upload.id} upload=${upload} />`} />
    <${JobPanel} title="Dead jobs" items=${deadJobs} emptyLabel="No dead jobs."
      renderItem=${(job) => html`<${JobItem} key=${job.id} job=${job} />`} />
    <${JobPanel} title="Recent job errors" items=${recentErrors} emptyLabel="No recent job errors."
      renderItem=${(job) => html`<${JobItem} key=${job.id} job=${job} />`} />
  </div>`;
}
