import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { session, useStore } from "../lib/store.js";
import { icon } from "../lib/icons.js";
import { EmptyState } from "../components/EmptyState.js";
import { AdminOverview } from "./admin/overview.js";
import { AdminUsers } from "./admin/users.js";
import { AdminSettings } from "./admin/settings.js";
import { AdminJobs } from "./admin/jobs.js";

const TABS = [
  ["overview", "server", "Overview"],
  ["users", "users", "Users"],
  ["settings", "sliders", "Settings"],
  ["jobs", "alert", "Jobs"],
];

// Legacy fetches all six admin endpoints together regardless of which tab is
// active (src/app.js renderAdmin :2979-2999) so switching tabs is instant;
// keep that shape here.
async function loadAdminData() {
  const [overview, settings, users, failedUploads, deadJobs, recentErrors] = await Promise.all([
    api("/api/v1/admin/overview"),
    api("/api/v1/admin/settings"),
    api("/api/v1/users"),
    api("/api/v1/admin/uploads/failed?limit=50"),
    api("/api/v1/admin/jobs/dead?limit=50"),
    api("/api/v1/admin/jobs/recent-errors?limit=50"),
  ]);
  return { overview, settings, users, failedUploads, deadJobs, recentErrors };
}

export function AdminPage({ route }) {
  const { user: currentUser } = useStore(session);
  const tab = TABS.some(([key]) => key === route.tab) ? route.tab : "overview";
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [resetLink, setResetLink] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const reload = () => setReloadTick((t) => t + 1);

  useEffect(() => {
    let live = true;
    setError(null);
    loadAdminData()
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e));
    return () => {
      live = false;
    };
  }, [reloadTick]);

  return html`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${TABS.map(([key, ic, label]) => html`<a key=${key} class=${`ad-tab ${key === tab ? "ad-tab-on" : ""}`}
        href=${`/admin?tab=${key}`} aria-current=${key === tab ? "page" : undefined}>${icon(ic, { size: 14 })} ${label}</a>`)}
    </nav>
    ${error
      ? html`<${EmptyState} name="alert" title="Couldn't load admin data" body=${error.message} />`
      : !data
      ? html`<p class="empty-state">Loading admin data…</p>`
      : tab === "users"
      ? html`<${AdminUsers} users=${data.users} settings=${data.settings} currentUser=${currentUser}
          resetLink=${resetLink} setResetLink=${setResetLink} reload=${reload} />`
      : tab === "settings"
      ? html`<${AdminSettings} settings=${data.settings} isOwner=${currentUser?.role === "owner"} reload=${reload} />`
      : tab === "jobs"
      ? html`<${AdminJobs} failedUploads=${data.failedUploads} deadJobs=${data.deadJobs} recentErrors=${data.recentErrors} />`
      : html`<${AdminOverview} overview=${data.overview} deadJobs=${data.deadJobs} failedUploads=${data.failedUploads} />`}
  </main>`;
}
