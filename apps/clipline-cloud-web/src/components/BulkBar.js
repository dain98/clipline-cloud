import { html } from "../lib/html.js";

export function BulkBar({ count, busy = false, onPublic, onPrivate, onCopyLinks, onDelete, onClear }) {
  if (!count) return null;
  return html`<div class="bulkbar" role="toolbar" aria-label="Bulk actions" aria-busy=${busy ? "true" : "false"}>
    <b>${count} selected</b>
    <button class="btn" disabled=${busy} onClick=${onPublic}>Make public</button>
    <button class="btn" disabled=${busy} onClick=${onPrivate}>Make private</button>
    <button class="btn" disabled=${busy} onClick=${onCopyLinks}>Copy links</button>
    <button class="btn btn-danger" disabled=${busy} onClick=${onDelete}>Delete</button>
    <button class="btn bulk-x" disabled=${busy} aria-label="Clear selection" onClick=${onClear}>✕</button>
  </div>`;
}
