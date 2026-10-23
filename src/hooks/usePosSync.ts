import { useCallback, useEffect, useState } from "react";
import useLatestRef from "./useLatestRef";
import { SYNC_KEY, SYNC_META_KEY } from "../views/main-pages/pos/posData";
import { readJSON, writeJSON } from "../views/main-pages/pos/posUtils";
import type { SyncEntry } from "../views/main-pages/pos/types";



const MAX_QUEUE = 40;
const PUSH_MS = 1100;
const OPPORTUNISTIC_MS = 900;
/** Refreshes the "x min ago" label without touching the queue. */
const TICK_MS = 30000;

export type SyncStatus = "offline" | "syncing" | "pending" | "synced";

export type PosSync = {
  queue: SyncEntry[];
  syncing: boolean;
  online: boolean;
  status: SyncStatus;
  pendingCount: number;
  lastSyncText: string;
  queueSale: (entry: Omit<SyncEntry, "state">) => void;
  queueRefund: (entry: Omit<SyncEntry, "state">) => void;
  syncNow: () => void;
};

const isOnline = () => navigator.onLine !== false;

export function usePosSync(
  onToast: (msg: string) => void,
  onError: () => void,
): PosSync {
  const [queue, setQueue] = useState<SyncEntry[]>(() => {
    const stored = readJSON<SyncEntry[]>(SYNC_KEY, []);
    /*
       A queue left "pending" from a previous session would otherwise sit
       there claiming an in-flight push that no longer exists.
    */
    return isOnline()
      ? stored
      : stored.map((q) => (q.state === "pending" ? { ...q, state: "offline" } : q));
  });
  const [lastSync, setLastSync] = useState<number | null>(
    () => readJSON<{ last: number | null }>(SYNC_META_KEY, { last: null }).last,
  );
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(isOnline);
  // Advances on a timer so the relative "x min ago" label stays honest.
  const [now, setNow] = useState(() => Date.now());

  const syncingRef = useLatestRef(syncing);
  // Lets the deferred push read the live queue without re-creating syncNow.
  const queueRef = useLatestRef(queue);
  // Callbacks are read through refs so syncNow's identity never changes.
  const toastRef = useLatestRef(onToast);
  const errorRef = useLatestRef(onError);

  const pendingCount = queue.filter((q) => q.state !== "synced").length;

  useEffect(() => writeJSON(SYNC_KEY, queue), [queue]);

  const syncNow = useCallback(() => {
    if (syncingRef.current) return;
    if (!isOnline()) {
      errorRef.current();
      toastRef.current("Still offline — queued for later");
      return;
    }

    if (!queueRef.current.some((q) => q.state !== "synced")) {
      toastRef.current("Everything is already synced");
      return;
    }

    setSyncing(true);
    setTimeout(() => {
      /*
         Counted at push time rather than when the timer was scheduled, so a
         sale rung up during the 1.1s window is reported too.
      */
      const due = queueRef.current.filter((q) => q.state !== "synced").length;
      setQueue((prev) =>
        prev.map((q) => (q.state === "synced" ? q : { ...q, state: "synced" as const })),
      );
      const stamp = Date.now();
      setLastSync(stamp);
      writeJSON(SYNC_META_KEY, { last: stamp });
      setSyncing(false);
      toastRef.current(due + (due === 1 ? " record synced" : " records synced"));
    }, PUSH_MS);
  }, [errorRef, queueRef, syncingRef, toastRef]);

  const enqueue = useCallback(
    (entry: Omit<SyncEntry, "state">) => {
      setQueue((prev) =>
        [
          { ...entry, state: isOnline() ? ("pending" as const) : ("offline" as const) },
          ...prev,
        ].slice(0, MAX_QUEUE),
      );
      if (isOnline()) setTimeout(syncNow, OPPORTUNISTIC_MS);
    },
    [syncNow],
  );

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setQueue((prev) =>
        prev.map((q) => (q.state === "offline" ? { ...q, state: "pending" } : q)),
      );
      toastRef.current("Back online — syncing");
      setTimeout(syncNow, 600);
    };
    const goOffline = () => {
      setOnline(false);
      setQueue((prev) =>
        prev.map((q) => (q.state === "pending" ? { ...q, state: "offline" } : q)),
      );
      errorRef.current();
      toastRef.current("Offline — sales are queued on this device");
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearInterval(timer);
    };
  }, [syncNow, errorRef, toastRef]);

  const status: SyncStatus = !online
    ? "offline"
    : syncing
      ? "syncing"
      : pendingCount
        ? "pending"
        : "synced";

  const lastSyncText = (() => {
    if (!lastSync) return "Not synced yet";
    const s = Math.round((now - lastSync) / 1000);
    if (s < 60) return "Last sync — just now";
    if (s < 3600) return "Last sync — " + Math.floor(s / 60) + " min ago";
    return "Last sync — " + Math.floor(s / 3600) + " hr ago";
  })();

  return {
    queue,
    syncing,
    online,
    status,
    pendingCount,
    lastSyncText,
    queueSale: enqueue,
    queueRefund: enqueue,
    syncNow,
  };
}

export default usePosSync;
