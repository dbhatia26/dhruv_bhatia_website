"use client";

import { useCallback, useEffect, useState } from "react";
import { getGroup, ApiError } from "./api";
import { addDeviceGroup } from "./storage";
import type { GroupState } from "./types";

/**
 * Fetch on mount, expose refresh(). No polling or websockets: every mutation
 * calls its API function then refresh(), matching the no-realtime v1 scope.
 */
export function useGroup(secret: string) {
  const [state, setState] = useState<GroupState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await getGroup(secret);
      setState(next);
      setError(null);
      addDeviceGroup({ secret, name: next.group.name, joinedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, error, loading, refresh };
}
