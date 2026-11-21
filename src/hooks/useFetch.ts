"use client";

import { useCallback, useEffect, useState } from "react";

interface FetchState<T> {
  key: string;
  data: T | null;
  error: string | null;
}

/**
 * Minimal data hook. `deps` decide when to refetch; `reload()` forces one.
 * Loading is derived (state belongs to a different key) so no synchronous
 * setState is needed inside the effect.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<FetchState<T>>({ key: "", data: null, error: null });

  const key = JSON.stringify([...deps, tick]);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ key, data, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({
            key,
            data: null,
            error: e instanceof Error ? e.message : "Something went wrong",
          });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  const settled = state.key === key;
  return {
    data: settled ? state.data : null,
    error: settled ? state.error : null,
    loading: !settled,
    reload,
  };
}
