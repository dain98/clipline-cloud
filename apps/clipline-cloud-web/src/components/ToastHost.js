import { html } from "../lib/html.js";
import { toasts, dismissToast, useStore } from "../lib/store.js";

export function ToastHost() {
  const list = useStore(toasts);
  return html`<div class="toasts" role="status" aria-live="polite">
    ${list.map((t) => html`<div class="toast" key=${t.id}>
      <span>${t.message}</span>
      ${t.actionLabel && html`<button class="toast-action"
        onClick=${() => { t.onAction?.(); dismissToast(t.id); }}>${t.actionLabel}</button>`}
      <button class="toast-x" aria-label="Dismiss" onClick=${() => dismissToast(t.id)}>✕</button>
    </div>`)}
  </div>`;
}
