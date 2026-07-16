import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { navigate } from "../lib/router.js";
import { useAsyncResource } from "../lib/use-api-resource.js";
import { session, toast, useStore } from "../lib/store.js";
import { icon } from "../lib/icons.js";
import { EmptyState } from "../components/EmptyState.js";
import { AdminOverview } from "./admin/overview.js";
import { AdminUsers } from "./admin/users.js";
import { AdminSettings } from "./admin/settings.js";
import { AdminJobs } from "./admin/jobs.js";
import { AdminCategories } from "./admin/categories.js";

const TABS = [
  ["overview", "server", "Overview"],
  ["users", "users", "Users"],
  ["categories", "film", "Game categories"],
  ["settings", "sliders", "Settings"],
  ["jobs", "alert", "Jobs"],
];

export function isAdminLike(user) {
  return user?.role === "admin" || user?.role === "owner";
}

// Fetch every admin panel together so switching tabs is immediate.
async function loadAdminData(signal) {
  const options = { signal };
  const [overview, settings, users, categories, failedUploads, deadJobs, recentErrors] = await Promise.all([
    api("/api/v1/admin/overview", options),
    api("/api/v1/admin/settings", options),
    api("/api/v1/users", options),
    api("/api/v1/admin/game-categories", options),
    api("/api/v1/admin/uploads/failed?limit=50", options),
    api("/api/v1/admin/jobs/dead?limit=50", options),
    api("/api/v1/admin/jobs/recent-errors?limit=50", options),
  ]);
  return { overview, settings, users, categories, failedUploads, deadJobs, recentErrors };
}

export function AdminPage({ route }) {
  const { user: currentUser } = useStore(session);
  const canUseAdmin = isAdminLike(currentUser);
  const shouldRedirect = Boolean(currentUser && !canUseAdmin);
  const tab = TABS.some(([key]) => key === route.tab) ? route.tab : "overview";
  const [resetLink, setResetLink] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);
  const { data, error } = useAsyncResource(
    canUseAdmin ? `admin:${reloadTick}` : null,
    loadAdminData
  );
  const reload = () => setReloadTick((t) => t + 1);

  useEffect(() => {
    if (!shouldRedirect) return;
    toast("Admin access required.");
    navigate("/library");
  }, [shouldRedirect]);

  if (!canUseAdmin) return null;

  return html`<main class="page">
    <h1>Admin</h1>
    <p class="page-subtitle">Accounts, instance summary, and processing diagnostics.</p>
    <nav class="ad-tabs" aria-label="Admin views">
      ${TABS.map(([key, ic, label]) => html`<a key=${key} class=${`ad-tab ${key === tab ? "ad-tab-on" : ""}`}
        href=${key === "categories" ? "/admin/game-categories" : `/admin?tab=${key}`}
        aria-current=${key === tab ? "page" : undefined}>${icon(ic, { size: 14 })} ${label}</a>`)}
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
      : tab === "categories"
      ? html`<${AdminCategories} data=${data.categories} reload=${reload} categoryId=${route.categoryId} />`
      : tab === "jobs"
      ? html`<${AdminJobs} failedUploads=${data.failedUploads} deadJobs=${data.deadJobs} recentErrors=${data.recentErrors} />`
      : html`<${AdminOverview} overview=${data.overview} deadJobs=${data.deadJobs} failedUploads=${data.failedUploads} />`}
  </main>`;
}
