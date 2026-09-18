"use client";

import { useEffect, useState } from "react";
import nextDynamic from "next/dynamic";

const SingleAddressMap = nextDynamic(() => import("@/components/SingleAddressMap"), { ssr: false });

type Result = {
  adresssaId: string;
  latitude: number;
  longitude: number;
  landmark: string | null;
  commune: { name: string };
  neighborhood: { name: string };
};

export function RouteSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/address/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => setResults(data.items ?? []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="card">
      <h2 className="mb-3 text-sm font-bold text-adressa-deep">ADRESSA ROUTE — Recherche d&apos;itinéraire</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Identifiant ADRESSA, quartier…"
        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
      />

      {loading && <p className="mt-2 text-xs text-adressa-ink/40">Recherche…</p>}

      {!loading && results.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-black/5">
          {results.map((r) => (
            <button
              key={r.adresssaId}
              type="button"
              onClick={() => setSelected(r)}
              className="block w-full border-b border-black/5 px-3 py-2 text-left text-sm last:border-0 hover:bg-adressa-light"
            >
              <span className="font-semibold text-adressa-green">{r.adresssaId}</span> — {r.commune.name},{" "}
              {r.neighborhood.name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-adressa-deep">{selected.adresssaId}</span>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-adressa-green underline"
            >
              🧭 Itinéraire
            </a>
          </div>
          <div className="h-64 overflow-hidden rounded-xl border border-black/5">
            <SingleAddressMap
              latitude={selected.latitude}
              longitude={selected.longitude}
              label={selected.adresssaId}
              landmark={selected.landmark}
            />
          </div>
        </div>
      )}
    </div>
  );
}
