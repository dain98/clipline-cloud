import { useCallback, useEffect, useState } from "preact/hooks";
import { api } from "./api.js";

/**
 * Loads an async resource and cancels it when the component unmounts or its key
 * changes. Loaders should pass the supplied signal to every underlying request.
 */
export function useAsyncResource(key, load, initialData = null) {
  const enabled = key != null;
  const [state, setState] = useState(() => ({
    key,
    data: initialData,
    error: null,
    loading: enabled,
  }));

  useEffect(() => {
    if (!enabled) {
      setState({ key, data: initialData, error: null, loading: false });
      return undefined;
    }

    const controller = new AbortController();
    setState({ key, data: initialData, error: null, loading: true });

    Promise.resolve()
      .then(() => load(controller.signal))
      .then((data) => {
        setState((current) =>
          current.key === key
            ? { key, data, error: null, loading: false }
            : current
        );
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setState((current) =>
          current.key === key
            ? { key, data: initialData, error, loading: false }
            : current
        );
      });

    return () => controller.abort();
  }, [key, load]);

  const setData = useCallback(
    (update) => {
      setState((current) => {
        if (current.key !== key) return current;
        const data = typeof update === "function" ? update(current.data) : update;
        return { ...current, data };
      });
    },
    [key]
  );

  if (state.key !== key) {
    return { data: initialData, error: null, loading: enabled, setData };
  }
  return { data: state.data, error: state.error, loading: state.loading, setData };
}

/** Loads a GET endpoint using the shared API client. */
export function useApiResource(path, reloadKey = 0, initialData = null) {
  const load = useCallback((signal) => api(path, { signal }), [path]);
  return useAsyncResource(`${path}\u0000${reloadKey}`, load, initialData);
}
