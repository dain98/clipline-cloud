import { html } from "../lib/html.js";
import { useEffect, useRef, useState } from "preact/hooks";

// Anchored panel used by the Filters button on the library toolbar (and any
// future trigger-driven panel). Owns its own open state so callers only need
// to render a trigger + content pair:
//   <${Popover}
//     trigger=${({ open, toggle }) => html`<button onClick=${toggle}>Filters</button>`}
//     content=${html`<div>...</div>`}
//     onClose=${() => {}} />
// Behavior: closes on Escape or an outside pointerdown; moves focus to the
// first focusable field inside the panel on open; restores focus to whatever
// had it before opening (normally the trigger) on close.
export function Popover({ trigger, content, onClose, label, panelClass = "" }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);

  const close = () => {
    setOpen(false);
    onClose?.();
  };
  const toggle = () => {
    if (open) {
      close();
      return;
    }
    restoreFocusRef.current = document.activeElement;
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const focusTarget = panelRef.current?.querySelector(
      "input, select, textarea, button, a[href], [tabindex]"
    );
    focusTarget?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return html`<div class="popover-wrap" ref=${wrapRef}>
    ${trigger({ open, toggle })}
    ${open && html`<div class=${`popover ${panelClass}`} ref=${panelRef} role="dialog" aria-label=${label || "Filters"}>
      ${content}
    </div>`}
  </div>`;
}
