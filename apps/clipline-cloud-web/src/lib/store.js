import { useEffect, useState } from "preact/hooks";

export function createStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set(next) { value = next; listeners.forEach((l) => l(value)); },
    update(fn) { this.set(fn(value)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

export function useStore(store) {
  const [value, setValue] = useState(store.get());
  useEffect(() => store.subscribe(setValue), [store]);
  return value;
}

export const session = createStore({ user: null, csrfToken: null, ready: false });

export const toasts = createStore([]);
let toastId = 0;
export function toast(message, { actionLabel, onAction, timeoutMs = 5000 } = {}) {
  const id = ++toastId;
  toasts.update((list) => [...list, { id, message, actionLabel, onAction }]);
  if (timeoutMs) setTimeout(() => dismissToast(id), timeoutMs);
  return id;
}
export function dismissToast(id) {
  toasts.update((list) => list.filter((t) => t.id !== id));
}
