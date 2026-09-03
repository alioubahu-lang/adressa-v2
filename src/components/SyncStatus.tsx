"use client";

import { useEffect, useState, useCallback } from "react";
import { getPendingAddresses, syncPendingAddresses } from "@/lib/offlineQueue";

export function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(() => setPendingCount(getPendingAddresses().length), []);

  const trySync = useCallback(async () => {
    if (getPendingAddresses().length === 0) return;
    setSyncing(true);
    await syncPendingAddresses();
    setSyncing(false);
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
    setOnline(navigator.onLine);

    const handleOnline = () => {
      setOnline(true);
      trySync();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refresh, trySync]);

  if (pendingCount === 0 && online) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-adressa-light px-3 py-1.5 text-xs font-medium text-adressa-deep">
      {!online && <span>🔌 Hors ligne</span>}
      {pendingCount > 0 && (
        <span>
          {pendingCount} adresse{pendingCount > 1 ? "s" : ""} en attente de synchronisation
        </span>
      )}
      {online && pendingCount > 0 && (
        <button onClick={trySync} disabled={syncing} className="underline">
          {syncing ? "Synchronisation…" : "Synchroniser"}
        </button>
      )}
    </div>
  );
}
