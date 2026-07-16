import { html } from "../../lib/html.js";
import { useEffect, useMemo, useState } from "preact/hooks";
import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { toast } from "../../lib/store.js";
import { ConfirmDialog } from "../../components/ConfirmDialog.js";
import { icon } from "../../lib/icons.js";

const ARTWORK_SLOTS = {
  grid: {
    kind: "grid",
    label: "Category Grid",
    description: "Portrait artwork used for this category on the Games page.",
  },
  video: {
    kind: "hero",
    label: "Video Art",
    description: "Wide artwork shown subtly behind video titles and metadata.",
  },
  icon: {
    kind: "icon",
    label: "Icon",
    description: "Compact artwork used in Library filters and category management.",
  },
};

export function steamGridDbPreviewUrl(gameId, kind, artworkId) {
  return `/api/v1/admin/game-categories/steamgriddb/games/${encodeURIComponent(gameId)}/artwork/${encodeURIComponent(kind)}/${encodeURIComponent(artworkId)}/preview`;
}

export function categoryRequestBody({ displayName, steamGameId, selectedArtworks }) {
  return {
    display_name: displayName,
    steamgriddb_game_id: steamGameId || null,
    grid_artwork_id: selectedArtworks?.grid?.id || null,
    video_artwork_id: selectedArtworks?.video?.id || null,
    icon_artwork_id: selectedArtworks?.icon?.id || null,
  };
}

export function steamGridDbStatus(category, configured) {
  if (!configured) return "Not configured";
  return category?.steamgriddb_game_id ? "Matched" : "Not matched";
}

export function mergeTargets(categories, sourceId, query = "") {
  const normalized = query.trim().toLocaleLowerCase();
  return (categories || []).filter((category) => {
    if (category.id === sourceId) return false;
    if (!normalized) return true;
    return [category.display_name, ...(category.reported_names || []).map((name) => name.reported_name)]
      .some((value) => String(value || "").toLocaleLowerCase().includes(normalized));
  });
}

export function gameCategoryPath(categoryId) {
  return `/admin/game-categories/${encodeURIComponent(categoryId)}`;
}

export function AdminCategories({ data, reload, categoryId }) {
  const categories = data?.categories || [];
  if (categoryId) {
    const category = categories.find((candidate) => candidate.id === categoryId);
    if (!category) {
      return html`<section class="admin-card">
        <div class="admin-section-heading">
          <div><p class="kicker">Game categories</p><h2>Category not found</h2></div>
          <a class="btn" href="/admin/game-categories">Back to categories</a>
        </div>
        <p class="muted">This category may have been merged or removed.</p>
      </section>`;
    }
    return html`<${AdminCategoryEditor} key=${category.id} data=${data} reload=${reload}
      editing=${category} categories=${categories} />`;
  }

  return html`<section class="admin-card">
    <div class="admin-section-heading"><div><p class="kicker">Library taxonomy</p><h2>Game categories</h2></div></div>
    ${categories.length === 0
      ? html`<p class="muted">Categories appear automatically when clips report a game name.</p>`
      : html`<div class="table-wrap"><table class="lib-table admin-category-table">
        <thead><tr><th>Icon</th><th>Category</th><th>Reported names</th><th>Clips</th><th>SteamGridDB</th><th></th></tr></thead>
        <tbody>${categories.map((category) => html`<tr key=${category.id}>
          <td>${category.icon_artwork_url
            ? html`<img class="category-icon-thumb" src=${category.icon_artwork_url} alt="" loading="lazy" />`
            : html`<span class="category-artwork-empty">—</span>`}</td>
          <td><strong>${category.display_name}</strong></td>
          <td><div class="category-name-chips">${(category.reported_names || []).map((name) => html`<code>${name.reported_name}</code>`)}</div></td>
          <td>${category.clip_count}</td>
          <td><span class=${`category-status ${category.steamgriddb_game_id ? "is-matched" : ""}`}>${steamGridDbStatus(category, data?.steamgriddb_configured)}</span></td>
          <td><a class="btn" href=${gameCategoryPath(category.id)}>${icon("edit", { size: 14 })} Edit</a></td>
        </tr>`)}</tbody>
      </table></div>`}
  </section>`;
}

function ArtworkSlotField({
  slot,
  config,
  steamGameId,
  selected,
  active,
  results,
  busy,
  error,
  onToggle,
  onClear,
  onSelect,
}) {
  return html`<section class=${`category-artwork-slot artwork-slot-${slot}`}>
    <div class="category-artwork-slot-heading">
      <div><strong>${config.label}</strong><small>${config.description}</small></div>
      <div class="actions">
        ${selected && html`<button class="btn btn-small" type="button" onClick=${onClear}>Clear</button>`}
        ${!active && html`<button class="btn btn-small" type="button" aria-expanded="false" onClick=${onToggle}>
          ${selected ? "Change artwork" : "Choose artwork"}
        </button>`}
      </div>
    </div>
    ${selected && html`<img class="category-selected-artwork" src=${selected.preview_url || steamGridDbPreviewUrl(steamGameId, config.kind, selected.id)} alt="" />`}
    ${active && html`<div class="category-artwork-browser">
      ${busy ? html`<small class="muted">Loading artwork…</small>` : ""}
      ${error && html`<small class="field-error">${error}</small>`}
      ${!busy && !error && results.length === 0 && html`<small class="muted">No artwork found for this slot.</small>`}
      ${results.length > 0 && html`<small class="muted">Scroll to browse. Click an image to select it.</small>`}
      <div class="category-artwork-grid">
        ${results.map((artwork) => html`<button type="button"
          class=${`category-artwork-option ${selected?.id === artwork.id ? "is-selected" : ""}`}
          aria-label=${`Select ${config.label} artwork ${artwork.id}`}
          onClick=${() => onSelect(artwork)}>
          <img src=${artwork.preview_url || steamGridDbPreviewUrl(steamGameId, artwork.kind, artwork.id)} alt="" loading="lazy" />
        </button>`)}
      </div>
    </div>`}
  </section>`;
}

function AdminCategoryEditor({ data, reload, editing, categories }) {
  const [displayName, setDisplayName] = useState(editing.display_name);
  const [steamQuery, setSteamQuery] = useState(editing.display_name);
  const [steamGameId, setSteamGameId] = useState(editing.steamgriddb_game_id || null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [activeArtworkSlot, setActiveArtworkSlot] = useState(null);
  const [artworkResults, setArtworkResults] = useState([]);
  const [artworkBusy, setArtworkBusy] = useState(false);
  const [artworkError, setArtworkError] = useState("");
  const [selectedArtworks, setSelectedArtworks] = useState({
    grid: editing.grid_artwork_id ? {
      id: editing.grid_artwork_id,
      kind: "grid",
      preview_url: editing.grid_artwork_url,
    } : null,
    video: editing.video_artwork_id ? {
      id: editing.video_artwork_id,
      kind: "hero",
      preview_url: editing.video_artwork_url,
    } : null,
    icon: editing.icon_artwork_id ? {
      id: editing.icon_artwork_id,
      kind: "icon",
      preview_url: editing.icon_artwork_url,
    } : null,
  });
  const [mergeQuery, setMergeQuery] = useState("");
  const [mergeDestinationId, setMergeDestinationId] = useState("");
  const [busy, setBusy] = useState(false);
  const [separateTarget, setSeparateTarget] = useState(null);
  const [mergeConfirmOpen, setMergeConfirmOpen] = useState(false);

  const targets = useMemo(
    () => mergeTargets(categories, editing.id, mergeQuery),
    [categories, editing.id, mergeQuery]
  );
  const mergeDestination = categories.find((category) => category.id === mergeDestinationId) || null;

  useEffect(() => {
    if (!data?.steamgriddb_configured || !searchOpen || steamQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchBusy(false);
      setSearchError("");
      return;
    }
    let cancelled = false;
    const query = steamQuery.trim();
    setSearchBusy(true);
    setSearchError("");
    const timer = setTimeout(async () => {
      try {
        const results = await api(`/api/v1/admin/game-categories/steamgriddb/search?q=${encodeURIComponent(query)}`);
        if (!cancelled) setSearchResults(results || []);
      } catch (error) {
        if (!cancelled) {
          setSearchResults([]);
          setSearchError(error.message);
        }
      } finally {
        if (!cancelled) setSearchBusy(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data?.steamgriddb_configured, searchOpen, steamQuery]);

  useEffect(() => {
    if (!steamGameId || !data?.steamgriddb_configured || !activeArtworkSlot) {
      setArtworkResults([]);
      setArtworkError("");
      return;
    }
    const artworkKind = ARTWORK_SLOTS[activeArtworkSlot].kind;
    let cancelled = false;
    setArtworkBusy(true);
    setArtworkError("");
    api(`/api/v1/admin/game-categories/steamgriddb/games/${encodeURIComponent(steamGameId)}/artwork?kind=${encodeURIComponent(artworkKind)}`)
      .then((results) => {
        if (!cancelled) setArtworkResults(results || []);
      })
      .catch((error) => {
        if (!cancelled) {
          setArtworkResults([]);
          setArtworkError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) setArtworkBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data?.steamgriddb_configured, steamGameId, activeArtworkSlot]);

  function selectSteamGame(result) {
    setSteamGameId(result.id);
    setSteamQuery(result.name);
    setDisplayName(result.name);
    setSearchOpen(false);
    setSearchResults([]);
    setActiveArtworkSlot(null);
    setArtworkResults([]);
    setSelectedArtworks({ grid: null, video: null, icon: null });
  }

  function clearSteamGame() {
    setSteamGameId(null);
    setSelectedArtworks({ grid: null, video: null, icon: null });
    setActiveArtworkSlot(null);
    setArtworkResults([]);
    setSearchOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    try {
      await api(`/api/v1/admin/game-categories/${encodeURIComponent(editing.id)}`, {
        method: "PATCH",
        body: categoryRequestBody({ displayName, steamGameId, selectedArtworks }),
      });
      toast("Game category updated.");
      await reload();
    } catch (error) {
      toast(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmSeparate() {
    const target = separateTarget;
    setSeparateTarget(null);
    if (!target || busy) return;
    setBusy(true);
    try {
      await api(`/api/v1/admin/game-categories/${encodeURIComponent(target.category.id)}/reported-names/${encodeURIComponent(target.name.id)}/separate`, {
        method: "POST",
      });
      toast(`${target.name.reported_name} separated into its own category.`);
      await reload();
    } catch (error) {
      toast(error.message);
      if (error.status === 404 || error.status === 409) await reload();
    } finally {
      setBusy(false);
    }
  }

  async function confirmMerge() {
    setMergeConfirmOpen(false);
    if (!editing || !mergeDestination || busy) return;
    setBusy(true);
    try {
      await api(`/api/v1/admin/game-categories/${encodeURIComponent(editing.id)}/merge`, {
        method: "POST",
        body: { destination_category_id: mergeDestination.id },
      });
      toast(`${editing.display_name} merged into ${mergeDestination.display_name}.`);
      await reload();
      navigate(gameCategoryPath(mergeDestination.id));
    } catch (error) {
      toast(error.message);
      if (error.status === 404 || error.status === 409) await reload();
    } finally {
      setBusy(false);
    }
  }

  return html`<div class="admin-categories-page">
    <form class="admin-card admin-category-editor" onSubmit=${save}>
      <div class="admin-section-heading category-editor-heading">
        <a class="category-back-arrow" href="/admin/game-categories" aria-label="Back to game categories">
          ${icon("arrowLeft", { size: 20 })}
        </a>
        <div><p class="kicker">Category settings</p><h2>${editing.display_name}</h2></div>
      </div>

      <section class="category-settings-section">
        <h3>Appearance</h3>
        <label class="field"><span>Display name</span>
          <input class="input" maxlength="200" required value=${displayName}
            onInput=${(event) => setDisplayName(event.target.value)} />
        </label>
      </section>

      <section class="category-settings-section">
        <h3>Game metadata</h3>
        ${data?.steamgriddb_configured ? html`<label class="field steamgriddb-search"><span>Find on SteamGridDB</span>
          <input class="input" value=${steamQuery} placeholder="Enter the official game title"
            onFocus=${() => setSearchOpen(true)}
            onInput=${(event) => { setSteamQuery(event.target.value); setSearchOpen(true); }} />
          ${searchBusy && html`<small class="muted">Searching…</small>`}
          ${searchError && html`<small class="field-error">${searchError}</small>`}
          ${searchOpen && !searchBusy && !searchError && steamQuery.trim().length >= 2 && searchResults.length === 0 &&
            html`<small class="muted">No results. Try the full official game title.</small>`}
          ${searchOpen && searchResults.length > 0 && html`<div class="steamgriddb-results">
            ${searchResults.map((result) => html`<button type="button" onClick=${() => selectSteamGame(result)}>
              <strong>${result.name}</strong><small>#${result.id}${result.verified ? " · verified" : ""}</small>
            </button>`)}
          </div>`}
          ${steamGameId && html`<span class="steamgriddb-selected">SteamGridDB #${steamGameId}
            <button class="btn btn-small" type="button" onClick=${clearSteamGame}>Clear match</button>
          </span>`}
        </label>` : html`<p class="muted"><strong>SteamGridDB is not configured.</strong> Set the API key file to enable matching and artwork.</p>`}
        ${steamGameId && html`<div class="category-artwork-slots">
          ${Object.entries(ARTWORK_SLOTS).map(([slot, config]) => html`<${ArtworkSlotField}
            key=${slot}
            slot=${slot}
            config=${config}
            steamGameId=${steamGameId}
            selected=${selectedArtworks[slot]}
            active=${activeArtworkSlot === slot}
            results=${activeArtworkSlot === slot ? artworkResults : []}
            busy=${activeArtworkSlot === slot && artworkBusy}
            error=${activeArtworkSlot === slot ? artworkError : ""}
            onToggle=${() => {
              setArtworkBusy(activeArtworkSlot !== slot);
              setArtworkResults([]);
              setArtworkError("");
              setActiveArtworkSlot((current) => current === slot ? null : slot);
            }}
            onClear=${() => setSelectedArtworks((current) => ({ ...current, [slot]: null }))}
            onSelect=${(artwork) => {
              setSelectedArtworks((current) => ({ ...current, [slot]: artwork }));
              setActiveArtworkSlot(null);
              setArtworkResults([]);
              setArtworkBusy(false);
            }} />`)}
        </div>`}
      </section>

      <section class="category-settings-section">
        <h3>Reported names</h3>
        <div class="category-reported-name-list">
          ${(editing.reported_names || []).map((name) => html`<div class="category-reported-name">
            <span><code>${name.reported_name}</code><small>${name.clip_count} clip${name.clip_count === 1 ? "" : "s"}</small></span>
            ${editing.reported_names.length > 1 && html`<button class="btn" type="button" disabled=${busy}
              onClick=${() => setSeparateTarget({ category: editing, name })}>Separate</button>`}
          </div>`)}
        </div>
      </section>

      <section class="category-settings-section">
        <h3>Merge with another category</h3>
        <p class="muted">All reported names move to the destination. Its display name, SteamGridDB match, and artwork win.</p>
        <label class="field"><span>Search categories</span>
          <input class="input" value=${mergeQuery} onInput=${(event) => setMergeQuery(event.target.value)} />
        </label>
        <label class="field"><span>Destination</span>
          <select class="input" value=${mergeDestinationId} onChange=${(event) => setMergeDestinationId(event.target.value)}>
            <option value="">Select a category</option>
            ${targets.map((category) => html`<option value=${category.id}>${category.display_name} · ${(category.reported_names || []).map((name) => name.reported_name).join(", ")}</option>`)}
          </select>
        </label>
        <button class="btn btn-danger" type="button" disabled=${busy || !mergeDestinationId}
          onClick=${() => setMergeConfirmOpen(true)}>Merge category</button>
      </section>

      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit" disabled=${busy}>${icon("save", { size: 14 })} Save changes</button>
      </div>
    </form>

    <${ConfirmDialog} open=${Boolean(separateTarget)} title="Separate this reported name?"
      body=${separateTarget ? `${separateTarget.name.reported_name} will become a new category with no SteamGridDB match or artwork.` : ""}
      confirmLabel="Separate" onCancel=${() => setSeparateTarget(null)} onConfirm=${confirmSeparate} />
    <${ConfirmDialog} open=${mergeConfirmOpen} title="Merge these categories?"
      body=${editing && mergeDestination ? `${editing.display_name} will disappear. ${(editing.reported_names || []).map((name) => name.reported_name).join(", ")} will move to ${mergeDestination.display_name}, whose appearance and metadata will win.` : ""}
      confirmLabel="Merge category" danger onCancel=${() => setMergeConfirmOpen(false)} onConfirm=${confirmMerge} />
  </div>`;
}
