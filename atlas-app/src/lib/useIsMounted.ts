"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  // nothing ever notifies this store — "mounted" only ever transitions
  // once, at the client/server boundary itself, which useSyncExternalStore
  // already handles by re-checking the snapshot right after hydration.
  return () => {};
}
function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

/** True once hydrated on the client, false during SSR and the initial
 * hydration pass. Use this instead of the classic
 * `useState(false) + useEffect(() => setMounted(true), [])` pair — that
 * pattern works but trips the react-hooks/set-state-in-effect lint rule;
 * useSyncExternalStore is built for exactly this "read an external,
 * SSR-unavailable fact" case and needs no effect at all. */
export function useIsMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
