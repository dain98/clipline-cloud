import { html } from "../lib/html.js";
import { useEffect, useRef } from "preact/hooks";

export function ConfirmDialog({ open, title, body, confirmLabel = "Confirm", onConfirm, onCancel, danger = false, confirmDisabled = false }) {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      confirmRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return html`<dialog ref=${dialogRef} class="confirm-dialog" aria-labelledby="confirm-dialog-title"
    onCancel=${(e) => { e.preventDefault(); onCancel?.(); }}
    onClose=${() => open && onCancel?.()}>
    ${open && html`<div class="confirm-dialog-body">
      <h2 id="confirm-dialog-title">${title}</h2>
      ${body && html`<p>${body}</p>`}
      <div class="confirm-dialog-actions">
        <button type="button" class="btn" onClick=${onCancel}>Cancel</button>
        <button type="button" ref=${confirmRef} class=${`btn ${danger ? "btn-danger" : "btn-primary"}`}
          disabled=${confirmDisabled} onClick=${onConfirm}>${confirmLabel}</button>
      </div>
    </div>`}
  </dialog>`;
}
