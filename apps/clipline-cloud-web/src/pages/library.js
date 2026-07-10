import { html } from "../lib/html.js";
import { useEffect, useRef, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { useApiResource } from "../lib/use-api-resource.js";
import { toast } from "../lib/store.js";
import { formatBytes, formatDate, formatDuration } from "../lib/format.js";
import { deriveShareLink, ownedMediaPath, ownedThumbPath } from "../lib/media.js";
import { ClipCard } from "../components/ClipCard.js";
import { EmptyState } from "../components/EmptyState.js";
import { Popover } from "../components/Popover.js";
import { BulkBar } from "../components/BulkBar.js";
import { ConfirmDialog } from "../components/ConfirmDialog.js";
import { icon } from "../lib/icons.js";

const VIEW_STORAGE_KEY = "clipline.libraryView";

// Sort values are API contract keys; labels may change, values must stay synchronized with the server.
const SORTS = [
  ["uploaded_at_desc", "Uploaded newest"],
  ["uploaded_at_asc", "Uploaded oldest"],
  ["recorded_at_desc", "Recorded newest"],
  ["recorded_at_asc", "Recorded oldest"],
  ["updated_at_desc", "Updated newest"],
  ["updated_at_asc", "Updated oldest"],
  ["created_at_desc", "Created newest"],
  ["created_at_asc", "Created oldest"],
  ["duration_desc", "Duration longest"],
  ["duration_asc", "Duration shortest"],
  ["size_desc", "Size largest"],
  ["size_asc", "Size smallest"],
  ["title_asc", "Title A-Z"],
  ["title_desc", "Title Z-A"],
];

// Column -> [ascKey, descKey] used by the sortable row headers.
const SORT_COLUMNS = {
  title: ["title_asc", "title_desc"],
  size: ["size_asc", "size_desc"],
  duration: ["duration_asc", "duration_desc"],
  uploaded: ["uploaded_at_asc", "uploaded_at_desc"],
};

// Fields owned by the Filters popover (not sort/q/game, which live in the
// toolbar/chips) — used both to build request params and to count active
// filters for the badge.
const POPOVER_FIELDS = [
  "visibility", "status", "source_type", "from", "to",
  "min_duration_seconds", "max_duration_seconds", "min_size_mib", "max_size_mib",
];

export const DEFAULT_LIBRARY_QUERY = {
  sort: "uploaded_at_desc",
  page: 1,
  game: "",
  source_type: "",
  visibility: "",
  status: "",
  q: "",
  from: "",
  to: "",
  min_duration_seconds: "",
  max_duration_seconds: "",
  min_size_mib: "",
  max_size_mib: "",
};

function toFiniteNumber(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Build the library API query. Required paging/sort values are always present;
// optional filters are omitted until supplied, and display units are converted
// to the milliseconds/bytes expected by the server.
export function libraryParams(query) {
  const params = new URLSearchParams();
  params.set("sort", query.sort || DEFAULT_LIBRARY_QUERY.sort);
  params.set("page_size", "100");
  params.set("page", String(Math.max(1, Number(query.page || 1))));
  for (const key of ["game", "source_type", "visibility", "status", "q"]) {
    if (query[key]) params.set(key, query[key]);
  }
  if (query.from) params.set("from", `${query.from}T00:00:00Z`);
  if (query.to) params.set("to", `${query.to}T23:59:59Z`);
  const minDurationSeconds = toFiniteNumber(query.min_duration_seconds);
  if (minDurationSeconds != null) params.set("min_duration_ms", String(Math.round(minDurationSeconds * 1000)));
  const maxDurationSeconds = toFiniteNumber(query.max_duration_seconds);
  if (maxDurationSeconds != null) params.set("max_duration_ms", String(Math.round(maxDurationSeconds * 1000)));
  const minSizeMib = toFiniteNumber(query.min_size_mib);
  if (minSizeMib != null) params.set("min_size_bytes", String(Math.round(minSizeMib * 1024 * 1024)));
  const maxSizeMib = toFiniteNumber(query.max_size_mib);
  if (maxSizeMib != null) params.set("max_size_bytes", String(Math.round(maxSizeMib * 1024 * 1024)));
  return params;
}

export function countActiveFilters(query) {
  return POPOVER_FIELDS.reduce((count, key) => count + (query[key] ? 1 : 0), 0);
}

// Dedupe clips' game_name, count occurrences, return the top `max` sorted by
// count desc then name asc for stable ties.
export function deriveGameChips(clips, max = 6) {
  const counts = new Map();
  for (const clip of clips) {
    const game = clip.game_name;
    if (!game) continue;
    counts.set(game, (counts.get(game) || 0) + 1);
  }
  return Array.from(counts, ([game, count]) => ({ game, count }))
    .sort((a, b) => b.count - a.count || a.game.localeCompare(b.game))
    .slice(0, max);
}

// Pure helper shared by the forward (updateVisibility) and revert
// (undoVisibility) bulk-visibility flows: given the attempted ids and the
// failures collected while POSTing each one, returns which ids actually
// succeeded plus a human toast message for any failures (or null if none).
export function summarizeBulkOutcome(ids, failed, { verb, allFailedMessage }) {
  const succeeded = ids.filter((id) => !failed.some((f) => f.id === id));
  if (!failed.length) return { succeeded, message: null };
  const message =
    failed.length === ids.length
      ? failed[0]?.message || allFailedMessage
      : `Couldn't ${verb} ${failed.length} of ${ids.length} clips.`;
  return { succeeded, message };
}

export function bulkShareLinks(clips, origin) {
  return (clips || [])
    .map((clip) => deriveShareLink(clip.public_url, origin, clip.public_share_id))
    .filter(Boolean);
}

// Simple bounded-concurrency runner for the sequential-but-parallel-ish bulk
// visibility requests (spec: "sequentially, <=4 in flight").
async function runPool(items, limit, worker) {
  let index = 0;
  async function next() {
    const current = index++;
    if (current >= items.length) return;
    await worker(items[current]);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
}

function readStoredView() {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "rows" ? "rows" : "grid";
  } catch {
    return "grid";
  }
}

export function LibraryPage() {
  const [view, setView] = useState(readStoredView);
  const [query, setQuery] = useState(DEFAULT_LIBRARY_QUERY);
  const [searchText, setSearchText] = useState(DEFAULT_LIBRARY_QUERY.q);
  const [selected, setSelected] = useState(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const libraryResource = `/api/v1/clips?${libraryParams(query)}`;
  const { data, error, setData } = useApiResource(libraryResource, reloadTick);
  const bulkBusyRef = useRef(false);
  const searchTimer = useRef(null);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  useEffect(() => setSelected(new Set()), [libraryResource, reloadTick]);

  const changeView = (next) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore (private browsing / storage disabled)
    }
  };

  const reload = () => setReloadTick((t) => t + 1);

  const setBulkBusyValue = (value) => {
    bulkBusyRef.current = value;
    setBulkBusy(value);
  };

  const onSearchInput = (event) => {
    const value = event.target.value;
    setSearchText(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setQuery((q) => ({ ...q, q: value, page: 1 }));
    }, 300);
  };

  const setFilter = (key) => (event) => {
    const value = event.target.value;
    setQuery((q) => ({ ...q, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setQuery((q) => ({
      ...q,
      page: 1,
      visibility: "", status: "", source_type: "", from: "", to: "",
      min_duration_seconds: "", max_duration_seconds: "", min_size_mib: "", max_size_mib: "",
    }));
  };

  const setGame = (game) => setQuery((q) => ({ ...q, game: q.game === game ? "" : game, page: 1 }));

  const setSort = (sort) => setQuery((q) => ({ ...q, sort, page: 1 }));
  const setPage = (page) => setQuery((q) => ({ ...q, page: Math.max(1, page) }));

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  function patchClip(id, patch) {
    setData((d) => d && { ...d, clips: d.clips.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }

  function patchClips(ids, patch) {
    const idSet = new Set(ids);
    setData((d) => d && { ...d, clips: d.clips.map((c) => (idSet.has(c.id) ? { ...c, ...patch } : c)) });
  }

  async function updateVisibility(newVisibility) {
    if (bulkBusyRef.current) return;
    const ids = Array.from(selected);
    if (!ids.length) return;
    const clips = data?.clips || [];
    const snapshot = new Map(ids.map((id) => [id, clips.find((c) => c.id === id)]));
    setBulkBusyValue(true);
    patchClips(ids, { visibility: newVisibility });

    const failed = [];
    // Track each success's server-confirmed { visibility, public_url } so an
    // eventual undo can roll a failed revert back to exactly this state
    // (visibility→public regenerates the share id, so "pre-undo" is not the
    // same as the local `newVisibility` patch above).
    const confirmedState = new Map();
    try {
      await runPool(ids, 4, async (id) => {
        try {
          const updated = await api(`/api/v1/clips/${encodeURIComponent(id)}/visibility`, {
            method: "POST",
            body: { visibility: newVisibility },
          });
          const patch = {
            visibility: updated.visibility,
            public_url: updated.public_url,
            public_share_id: updated.public_share_id,
          };
          patchClip(id, patch);
          confirmedState.set(id, patch);
        } catch (e) {
          failed.push({ id, message: e.message });
        }
      });

      const { succeeded, message } = summarizeBulkOutcome(ids, failed, {
        verb: "update",
        allFailedMessage: "Couldn't update visibility.",
      });
      if (message) {
        for (const { id } of failed) {
          const original = snapshot.get(id);
          if (original) patchClip(id, {
            visibility: original.visibility,
            public_url: original.public_url,
            public_share_id: original.public_share_id,
          });
        }
        toast(message);
      }

      if (succeeded.length) {
        setSelected(new Set());
        toast(`Made ${succeeded.length} clip${succeeded.length === 1 ? "" : "s"} ${newVisibility}`, {
          actionLabel: "Undo",
          onAction: () => undoVisibility(succeeded, snapshot, confirmedState),
        });
      }
    } finally {
      setBulkBusyValue(false);
    }
  }

  async function undoVisibility(ids, snapshot, confirmedState) {
    if (bulkBusyRef.current) {
      toast("Wait for visibility changes to finish.");
      return;
    }
    setBulkBusyValue(true);
    try {
      for (const id of ids) {
        const original = snapshot.get(id);
        if (original) patchClip(id, {
          visibility: original.visibility,
          public_url: original.public_url,
          public_share_id: original.public_share_id,
        });
      }

      const failed = [];
      await runPool(ids, 4, async (id) => {
        const original = snapshot.get(id);
        if (!original) return;
        try {
          const updated = await api(`/api/v1/clips/${encodeURIComponent(id)}/visibility`, {
            method: "POST",
            body: { visibility: original.visibility },
          });
          patchClip(id, {
            visibility: updated.visibility,
            public_url: updated.public_url,
            public_share_id: updated.public_share_id,
          });
        } catch (e) {
          failed.push({ id, message: e.message });
        }
      });

      const { message } = summarizeBulkOutcome(ids, failed, {
        verb: "undo",
        allFailedMessage: "Couldn't undo visibility change.",
      });
      if (message) {
        // Revert failed — put those clips back to the state they were in right
        // before this undo ran (the confirmed post-forward-change state), not
        // the optimistic pre-undo local patch, which may be stale.
        for (const { id } of failed) {
          const current = confirmedState.get(id);
          if (current) patchClip(id, current);
        }
        toast(message);
      }
    } finally {
      setBulkBusyValue(false);
    }
  }

  async function onCopyLinks() {
    if (bulkBusyRef.current) {
      toast("Wait for visibility changes to finish.");
      return;
    }
    const ids = Array.from(selected);
    const clips = data?.clips || [];
    const picked = ids.map((id) => clips.find((c) => c.id === id)).filter(Boolean);
    const links = bulkShareLinks(picked, window.location.origin);
    const skipped = picked.length - links.length;
    if (!links.length) {
      toast("No links to copy — selected clips are private.");
      return;
    }
    try {
      await navigator.clipboard.writeText(links.join("\n"));
      toast(
        `Copied ${links.length} link${links.length === 1 ? "" : "s"}` +
          (skipped ? ` (${skipped} skipped, private)` : "")
      );
    } catch {
      toast("Couldn't copy links to clipboard.");
    }
  }

  async function onDeleteConfirmed() {
    const ids = Array.from(selected);
    setConfirmOpen(false);
    try {
      const result = await api("/api/v1/clips/bulk-delete", { method: "POST", body: { ids } });
      setSelected(new Set());
      reload();
      toast(`Deleted ${result.affected} clip${result.affected === 1 ? "" : "s"}.`);
    } catch (e) {
      toast(e.message);
    }
  }

  if (error) {
    return html`<main class="page">
      <${EmptyState} name="alert" title="Couldn't load your library" body=${error.message} />
    </main>`;
  }

  const clips = data?.clips;
  const activeFilterCount = countActiveFilters(query);
  const hasFilter = Boolean(query.q || query.game) || activeFilterCount > 0;
  const chips = deriveGameChips(clips || []);
  const totalClips = Number(data?.total ?? (clips || []).length);
  const totalBytes = Number(data?.total_size_bytes ?? (clips || []).reduce((sum, c) => sum + (c.file_size_bytes || 0), 0));
  const currentPage = Number(data?.page || query.page || 1);
  const showPager = currentPage > 1 || Boolean(data?.has_more);

  const filterFields = html`<div class="popover-fields">
    <label class="field"><span>Visibility</span>
      <select class="input" value=${query.visibility} onChange=${setFilter("visibility")}>
        <option value="">Any</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>
    </label>
    <label class="field"><span>Status</span>
      <select class="input" value=${query.status} onChange=${setFilter("status")}>
        <option value="">Any</option>
        <option value="created">Created</option>
        <option value="uploading">Uploading</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="failed">Failed</option>
      </select>
    </label>
    <label class="field"><span>Source</span>
      <input class="input" type="text" value=${query.source_type} onInput=${setFilter("source_type")} placeholder="Source type" />
    </label>
    <label class="field"><span>From</span>
      <input class="input" type="date" value=${query.from} onInput=${setFilter("from")} />
    </label>
    <label class="field"><span>To</span>
      <input class="input" type="date" value=${query.to} onInput=${setFilter("to")} />
    </label>
    <label class="field"><span>Min duration (s)</span>
      <input class="input" type="number" min="0" value=${query.min_duration_seconds} onInput=${setFilter("min_duration_seconds")} />
    </label>
    <label class="field"><span>Max duration (s)</span>
      <input class="input" type="number" min="0" value=${query.max_duration_seconds} onInput=${setFilter("max_duration_seconds")} />
    </label>
    <label class="field"><span>Min size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${query.min_size_mib} onInput=${setFilter("min_size_mib")} />
    </label>
    <label class="field"><span>Max size (MiB)</span>
      <input class="input" type="number" min="0" step="0.1" value=${query.max_size_mib} onInput=${setFilter("max_size_mib")} />
    </label>
    <div class="popover-actions">
      <button type="button" class="btn" onClick=${clearFilters}>Clear filters</button>
    </div>
  </div>`;

  return html`<main class="page">
    <div class="lib-header">
      <div>
        <h1>Library</h1>
        <p>${totalClips} clip${totalClips === 1 ? "" : "s"} · ${formatBytes(totalBytes)} used</p>
      </div>
      <div class="seg" role="group" aria-label="View">
        <button type="button" class=${`seg-item ${view === "grid" ? "seg-on" : ""}`}
          aria-pressed=${view === "grid"} onClick=${() => changeView("grid")}>Grid</button>
        <button type="button" class=${`seg-item ${view === "rows" ? "seg-on" : ""}`}
          aria-pressed=${view === "rows"} onClick=${() => changeView("rows")}>Rows</button>
      </div>
    </div>

    <div class="lib-toolbar">
      <input class="input" type="search" aria-label="Search clips" placeholder="Search title or game"
        value=${searchText} onInput=${onSearchInput} />
      <select class="input" aria-label="Sort" value=${query.sort} onChange=${(e) => setSort(e.target.value)}>
        ${SORTS.map(([v, l]) => html`<option value=${v}>${l}</option>`)}
      </select>
      <${Popover}
        label="Filters"
        panelClass="popover-filters"
        trigger=${({ open, toggle }) => html`<button type="button" class="btn" aria-haspopup="dialog"
          aria-expanded=${open} onClick=${toggle}>
          ${icon("sliders", { size: 14 })} Filters
          ${activeFilterCount > 0 && html`<span class="filter-badge">${activeFilterCount}</span>`}
        </button>`}
        content=${filterFields} />
    </div>

    ${chips.length > 0 && html`<div class="lib-chips">
      <button type="button" class=${`chip ${!query.game ? "chip-on" : ""}`} aria-pressed=${!query.game}
        onClick=${() => setGame("")}>All</button>
      ${chips.map((c) => html`<button type="button" class=${`chip ${query.game === c.game ? "chip-on" : ""}`}
        aria-pressed=${query.game === c.game} onClick=${() => setGame(c.game)}>${c.game}</button>`)}
    </div>`}

    ${clips == null
      ? html`<${SkeletonGrid} />`
      : clips.length === 0
      ? hasFilter
        ? html`<${EmptyState} name="film" title="No clips match this view"
            body="Try a different search, game, or clear your filters."
            action=${html`<button type="button" class="btn" onClick=${() => { setQuery(DEFAULT_LIBRARY_QUERY); setSearchText(""); }}>Clear filters</button>`} />`
        : html`<${EmptyState} name="upload" title="Connect the Clipline desktop app to start uploading"
            body="New clips uploaded from the desktop app will show up here."
            action=${html`<a class="btn" href="/about">Learn more</a>`} />`
      : view === "grid"
      ? html`<div class=${`card-grid ${selected.size > 0 ? "selecting" : ""}`}>
          ${clips.map((clip) => html`<${ClipCard} key=${clip.id}
            clip=${{ ...clip, thumbnail_url: ownedThumbPath(clip), media_url: ownedMediaPath(clip) }}
            href=${`/clip/${encodeURIComponent(clip.id)}`}
            selectable selected=${selected.has(clip.id)} onToggleSelect=${toggleSelect} showVisibility />`)}
        </div>`
      : html`<${RowsTable} clips=${clips} query=${query} onSort=${setSort}
          selected=${selected} onToggleSelect=${toggleSelect} />`}

    ${showPager && html`<nav class="pager" aria-label="Library pages">
      <button type="button" class="btn" disabled=${currentPage <= 1}
        onClick=${() => setPage(currentPage - 1)}>Previous</button>
      <span>Page ${currentPage}</span>
      <button type="button" class="btn" disabled=${!data?.has_more}
        onClick=${() => setPage(currentPage + 1)}>Next</button>
    </nav>`}

    <${BulkBar} count=${selected.size} busy=${bulkBusy}
      onPublic=${() => updateVisibility("public")}
      onPrivate=${() => updateVisibility("private")}
      onCopyLinks=${onCopyLinks}
      onDelete=${() => setConfirmOpen(true)}
      onClear=${() => setSelected(new Set())} />

    <${ConfirmDialog} open=${confirmOpen}
      title=${`Delete ${selected.size} clip${selected.size === 1 ? "" : "s"}?`}
      body="Public links stop working immediately."
      confirmLabel="Delete" danger
      onConfirm=${onDeleteConfirmed}
      onCancel=${() => setConfirmOpen(false)} />
  </main>`;
}

function sortHeaderState(query, [ascKey, descKey]) {
  const ariaSort = query.sort === ascKey ? "ascending" : query.sort === descKey ? "descending" : "none";
  const next = query.sort === descKey ? ascKey : descKey;
  return { ariaSort, next };
}

function RowsTable({ clips, query, onSort, selected, onToggleSelect }) {
  const title = sortHeaderState(query, SORT_COLUMNS.title);
  const size = sortHeaderState(query, SORT_COLUMNS.size);
  const duration = sortHeaderState(query, SORT_COLUMNS.duration);
  const uploaded = sortHeaderState(query, SORT_COLUMNS.uploaded);
  return html`<table class="lib-table">
    <thead>
      <tr>
        <th class="row-select-cell"></th>
        <th></th>
        <th aria-sort=${title.ariaSort}><button type="button" class="sort-btn" onClick=${() => onSort(title.next)}>Title</button></th>
        <th>Game</th>
        <th>Visibility</th>
        <th aria-sort=${size.ariaSort}><button type="button" class="sort-btn" onClick=${() => onSort(size.next)}>Size</button></th>
        <th aria-sort=${duration.ariaSort}><button type="button" class="sort-btn" onClick=${() => onSort(duration.next)}>Duration</button></th>
        <th aria-sort=${uploaded.ariaSort}><button type="button" class="sort-btn" onClick=${() => onSort(uploaded.next)}>Uploaded</button></th>
      </tr>
    </thead>
    <tbody>
      ${clips.map((clip) => html`<tr key=${clip.id} class=${selected?.has(clip.id) ? "is-selected" : ""}>
        <td class="row-select-cell">
          <input class="row-select" type="checkbox" checked=${selected?.has(clip.id)}
            aria-label=${`Select ${clip.title}`} onChange=${() => onToggleSelect?.(clip.id)} />
        </td>
        <td><img class="row-thumb" src=${ownedThumbPath(clip)} alt="" width="64" height="36" loading="lazy" /></td>
        <td><a href=${`/clip/${encodeURIComponent(clip.id)}`}>${clip.title}</a></td>
        <td>${clip.game_name || "—"}</td>
        <td><span class=${`badge badge-${clip.visibility}`}>${clip.visibility}</span></td>
        <td>${formatBytes(clip.file_size_bytes)}</td>
        <td>${formatDuration(clip.duration_ms)}</td>
        <td>${formatDate(clip.uploaded_at)}</td>
      </tr>`)}
    </tbody>
  </table>`;
}

function SkeletonGrid({ count = 8 }) {
  return html`<div class="card-grid">
    ${Array.from({ length: count }, (_, i) => html`<div class="clip-card" key=${i}>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line is-short"></div>
    </div>`)}
  </div>`;
}
