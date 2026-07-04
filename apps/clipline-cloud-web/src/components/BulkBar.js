import { html } from "../lib/html.js";

export function BulkBar({ count, onPublic, onPrivate, onCopyLinks, onDelete, onClear }) {
  if (!count) return null;
  return html`<div class="bulkbar" role="toolbar" aria-label="Bulk actions">
    <b>${count} selected</b>
    <button class="btn" onClick=${onPublic}>Make public</button>
    <button class="btn" onClick=${onPrivate}>Make private</button>
    <button class="btn" onClick=${onCopyLinks}>Copy links</button>
    <button class="btn btn-danger" onClick=${onDelete}>Delete</button>
    <button class="btn bulk-x" aria-label="Clear selection" onClick=${onClear}>✕</button>
  </div>`;
}
