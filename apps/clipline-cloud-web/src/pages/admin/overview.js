import { html } from "../../lib/html.js";
import { formatBytes } from "../../lib/format.js";
import { StatCard } from "../../components/StatCard.js";

// Pure: fraction (0..1, clamped) of the configured storage-warning threshold
// currently used, or null when the admin hasn't configured one (the
// overview endpoint — apps/clipline-cloud-server/src/admin.rs:98-120 — has
// no hard storage cap, only an optional warning threshold).
export function storageMeterFraction(overview) {
  const threshold = Number(overview?.global_storage_warning_threshold_bytes || 0);
  if (!threshold) return null;
  const used = Number(overview?.total_storage_bytes || 0);
  return Math.max(0, Math.min(1, used / threshold));
}

// Pure port of legacy storageWarningLabel (src/app.js:3061-3066).
export function storageWarningLabel(overview) {
  if (!overview?.global_storage_warning_threshold_bytes) return "Disabled";
  const threshold = formatBytes(overview.global_storage_warning_threshold_bytes);
  return overview.global_storage_warning ? `At or above ${threshold}` : `Below ${threshold}`;
}

// Pure: the Jobs StatCard's failed count. Dead jobs and failed uploads
// (admin.rs :359-391) are things stuck needing operator attention;
// recent-errors is just a log of transient retries, so it doesn't count.
export function summarizeJobsHealth({ deadJobs = [], failedUploads = [] } = {}) {
  const failedCount = deadJobs.length + failedUploads.length;
  return { failedCount, healthy: failedCount === 0 };
}

function kv(label, value) {
  return html`<div><dt>${label}</dt><dd>${value ?? "Unknown"}</dd></div>`;
}

export function AdminOverview({ overview, deadJobs, failedUploads }) {
  const meter = storageMeterFraction(overview);
  const { failedCount, healthy } = summarizeJobsHealth({ deadJobs, failedUploads });
  const warningThreshold = overview.global_storage_warning_threshold_bytes;

  return html`<div>
    <div class="stat-grid">
      <${StatCard} label="Clips" value=${String(overview.total_clips)} />
      <${StatCard} label="Storage" value=${formatBytes(overview.total_storage_bytes)}
        sub=${warningThreshold ? `${formatBytes(warningThreshold)} warning threshold` : null}
        meter=${meter} tone=${overview.global_storage_warning ? "danger" : undefined} />
      <${StatCard} label="Users" value=${String(overview.total_users)} />
      <${StatCard} label="Jobs" value=${healthy ? "All healthy" : String(failedCount)}
        tone=${healthy ? "success" : "danger"} />
    </div>
    <div class="panel">
      <h2>Server summary</h2>
      <dl class="ad-kv">
        ${kv("Server version", overview.server_version)}
        ${kv("API version", overview.api_version)}
        ${kv("Public URL", overview.public_url)}
        ${kv("Database", overview.database_backend)}
        ${kv("Storage", `${overview.storage_backend} — ${overview.storage_summary}`)}
        ${kv("Stored clips", `${overview.total_clips} clips — ${formatBytes(overview.total_storage_bytes)}`)}
        ${kv("Users", `${overview.total_users} total`)}
        ${kv("Max upload", formatBytes(overview.max_upload_size_bytes))}
        ${kv("Part size", formatBytes(overview.upload_part_size_bytes))}
        ${kv("Single PUT max", formatBytes(overview.single_put_max_bytes))}
        ${kv("Active uploads/user", overview.max_active_upload_sessions_per_user)}
        ${kv("User quota", overview.user_storage_quota_bytes ? formatBytes(overview.user_storage_quota_bytes) : "Disabled")}
        ${kv("Storage warning", storageWarningLabel(overview))}
        ${kv("Upload TTL", `${overview.upload_session_ttl_seconds}s`)}
        ${kv("Direct S3 uploads", overview.direct_s3_uploads ? "Enabled" : "Disabled")}
        ${kv("Public media", `${overview.public_media_mode}, ${overview.public_read_url_ttl_seconds}s TTL`)}
      </dl>
    </div>
  </div>`;
}
