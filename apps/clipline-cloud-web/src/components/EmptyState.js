import { html } from "../lib/html.js";
import { icon } from "../lib/icons.js";

export function EmptyState({ name = "film", title, body, action }) {
  return html`<div class="empty">
    <div class="empty-icon">${icon(name, { size: 28 })}</div>
    <h3>${title}</h3>
    ${body && html`<p>${body}</p>`}
    ${action}
  </div>`;
}
