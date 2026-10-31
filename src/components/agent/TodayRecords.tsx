"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, CloudUpload, LoaderCircle, RefreshCw, WifiOff } from "lucide-react";
import { getPendingAddresses, syncPendingAddresses } from "@/lib/offlineQueue";

type SavedToday = { code: string; neighborhood: string; landmark: string | null; plateStatus: string | null; createdAt: string };
type LocalToday = { localId: string; createdAt: string; code: string; neighborhood: string; plateStatus: string | null; addressId?: string };

export function TodayRecords({ savedRecords }: { savedRecords: SavedToday[] }) {
  const [localRecords, setLocalRecords] = useState<LocalToday[]>([]);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const refreshLocal = useCallback(async () => {
    try {
      const today = new Date().toLocaleDateString("sv-SE");
      const rows = await getPendingAddresses();
      setLocalRecords(rows.filter((row) => new Date(row.createdAt).toLocaleDateString("sv-SE") === today).map((row) => ({
        localId: row.localId,
        createdAt: row.createdAt,
        code: row.addressId ?? `LOCAL-${row.localId.slice(0, 6).toUpperCase()}`,
        neighborhood: String(row.payload.neighborhoodName ?? row.payload.landmark ?? "Nouvelle saisie terrain"),
        plateStatus: typeof row.payload.plateStatus === "string" ? row.payload.plateStatus : null,
        addressId: row.addressId
      })));
    } catch { setLocalRecords([]); }
  }, []);

  useEffect(() => {
    const onlineHandler = () => { setOnline(true); void refreshLocal(); };
    const offlineHandler = () => setOnline(false);
    const refresh = () => { void refreshLocal(); };
    setOnline(navigator.onLine);
    void refreshLocal();
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);
    window.addEventListener("focus", refresh);
    window.addEventListener("adressa:queue-updated", refresh);
    const timer = window.setInterval(refresh, 12000);
    return () => { window.removeEventListener("online", onlineHandler); window.removeEventListener("offline", offlineHandler); window.removeEventListener("focus", refresh); window.removeEventListener("adressa:queue-updated", refresh); window.clearInterval(timer); };
  }, [refreshLocal]);

  async function syncNow() {
    setSyncing(true);
    setSyncMessage("");
    const result = await syncPendingAddresses();
    await refreshLocal();
    setSyncing(false);
    setSyncMessage(result.failed ? `${result.synced} envoyée(s), ${result.failed} en attente.` : `${result.synced} saisie(s) synchronisée(s).`);
  }

  const entries = [
    ...savedRecords.map((record) => ({ ...record, key: record.code, local: false })),
    ...localRecords.map((record) => ({ code: record.code, neighborhood: record.neighborhood, landmark: null, plateStatus: record.plateStatus, createdAt: record.createdAt, key: record.localId, local: true, addressId: record.addressId }))
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-4 sm:px-5"><div><h2 className="font-bold text-adressa-deep">Mes derniers enregistrements aujourd’hui</h2><p className="mt-1 text-xs text-adressa-ink/55">État du réseau et de la synchronisation inclus</p></div>{localRecords.length > 0 && <button type="button" onClick={() => void syncNow()} disabled={!online || syncing} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-adressa-deep px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{syncing ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}{syncing ? "Synchronisation…" : `Synchroniser (${localRecords.length})`}</button>}</header>
    {syncMessage && <p role="status" className="border-b border-black/5 bg-adressa-light/40 px-4 py-2 text-xs text-adressa-deep">{syncMessage}</p>}
    {entries.length ? <ul className="divide-y divide-black/5">{entries.map((entry) => <li key={entry.key} className="flex items-center gap-3 px-4 py-3 sm:px-5"><span className={`grid size-9 shrink-0 place-items-center rounded-xl ${entry.local ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{entry.local ? online ? <CloudUpload size={17} /> : <WifiOff size={17} /> : <CheckCircle2 size={17} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-adressa-deep">{entry.code} <span className="font-normal text-adressa-ink/60">· {entry.neighborhood}</span></span><span className="mt-0.5 block text-xs text-adressa-ink/50">{new Date(entry.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{entry.plateStatus ? ` · ${entry.plateStatus === "POSEE" ? "Plaque posée" : entry.plateStatus === "INACCESSIBLE" ? "Inaccessible" : "À refaire"}` : ""}{entry.landmark ? ` · ${entry.landmark}` : ""}</span></span>{entry.local ? <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">{online ? "À synchroniser" : "Hors ligne"}</span> : <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-emerald-700"><Check size={13} />Synchronisée</span>}{!entry.local && <Link href={`/dashboard/addresses/${encodeURIComponent(entry.code)}/edit`} className="sr-only">Ouvrir {entry.code}</Link>}</li>)}</ul> : <div className="px-4 py-10 text-center"><p className="font-semibold text-adressa-deep">Pas encore d’enregistrement aujourd’hui</p><p className="mt-1 text-sm text-adressa-ink/55">Les saisies terminées apparaîtront ici.</p><Link href="/dashboard/terrain/saisie" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-adressa-green hover:underline">Commencer une saisie <CloudUpload size={15} /></Link></div>}
  </section>;
}
